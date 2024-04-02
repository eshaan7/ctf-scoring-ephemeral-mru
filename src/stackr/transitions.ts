import { Transitions, STF, REQUIRE } from "@stackr/sdk/machine";
import { AttestationState } from "./state";
import { AttestationInput, SchemaRecordInput, RevocationInput } from "./types";
import { solidityPackedKeccak256, AbiCoder, ZeroHash } from "ethers";
import {
  findIndexOfAttestation,
  findIndexOfSchemaRecord,
  getAttestation,
} from "./utils";

// --------- Constants ---------
const NO_EXPIRATION_TIME = 0;
const NO_REVOCATION_TIME = 0;
const EMPTY_UID = ZeroHash;

// --------- STFs ---------
const registerSchema: STF<AttestationState, SchemaRecordInput> = {
  handler: ({ state, inputs, msgSender }) => {
    // needs to be generated deterministically
    const uid = solidityPackedKeccak256(
      ["string", "address", "bool"],
      [inputs.schema, msgSender, inputs.revocable]
    );
    // Ensure similar schema doesn't already exist
    const existingSchemaIdx = findIndexOfSchemaRecord(state, uid);
    REQUIRE(existingSchemaIdx < 0, "Similar schema already exists.");
    // Ensure schema's schema is a valid ABI
    try {
      AbiCoder.defaultAbiCoder().getDefaultValue(inputs.schema.split(","));
    } catch (e) {
      throw e;
    }
    state.leaves.push({
      uid: uid,
      schema: inputs.schema,
      registerer: msgSender.toString(),
      revocable: inputs.revocable,
      attestations: [],
    });
    return state;
  },
};

const attest: STF<AttestationState, AttestationInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const schemaRecordIdx = findIndexOfSchemaRecord(state, inputs.schemaUID);
    // Ensure that we aren't attempting to attest to a non-existing schema.
    REQUIRE(schemaRecordIdx >= 0, "Schema doesn't exist.");
    // Ensure that either no expiration time was set or that it was set in the future.
    REQUIRE(
      inputs.expirationTime === NO_EXPIRATION_TIME ||
        inputs.expirationTime > inputs.time,
      "Invalid expiration time."
    );
    // Ensure that we aren't trying to make a revocable attestation for a non-revocable schema.
    REQUIRE(
      (!inputs.revocable && !state.leaves[schemaRecordIdx].revocable) ||
        (!inputs.revocable && state.leaves[schemaRecordIdx].revocable) ||
        (inputs.revocable && state.leaves[schemaRecordIdx].revocable),
      "Can't create revocable attestation for a non-revocable schema."
    );
    if (inputs.refUID != EMPTY_UID) {
      // Ensure that we aren't trying to attest to a non-existing referenced UID.
      const referencedAttestation = getAttestation(state, inputs.refUID);
      REQUIRE(
        referencedAttestation !== undefined,
        "Referenced attestation doesn't exist."
      );
    }
    // Ensure attestation data conforms to the schema
    try {
      AbiCoder.defaultAbiCoder().decode(
        state.leaves[schemaRecordIdx].schema.split(","),
        inputs.data
      );
    } catch (e) {
      throw e;
    }
    // UID needs to be generated deterministically
    const uid = solidityPackedKeccak256(
      [
        "string",
        "uint256",
        "uint256",
        "string",
        "string",
        "string",
        "bool",
        "bytes",
      ],
      [
        inputs.schemaUID,
        inputs.time,
        inputs.expirationTime,
        inputs.refUID,
        inputs.recipient,
        msgSender.toString(),
        inputs.revocable,
        inputs.data,
      ]
    );
    const existingAttestationIdx = findIndexOfAttestation(
      state,
      inputs.schemaUID,
      uid
    );
    // Ensure that similar attestation shouldn't already exist
    REQUIRE(existingAttestationIdx < 0, "Similar attestation already exists.");
    state.leaves[schemaRecordIdx].attestations.push({
      uid: uid,
      schemaUID: inputs.schemaUID,
      time: inputs.time,
      expirationTime: inputs.expirationTime,
      revocationTime: 0,
      refUID: inputs.refUID,
      recipient: inputs.recipient,
      attester: msgSender.toString(),
      revocable: inputs.revocable,
      data: inputs.data,
    });
    return state;
  },
};

const revoke: STF<AttestationState, RevocationInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const schemaRecordIdx = findIndexOfSchemaRecord(state, inputs.schemaUID);
    // Ensure that we aren't attempting to revoke an attestation to a non-existing schema.
    REQUIRE(schemaRecordIdx >= 0, "Schema doesn't exist.");
    const attestationIdx = findIndexOfAttestation(
      state,
      inputs.schemaUID,
      inputs.attestationUID
    );
    // Ensure that we aren't attempting to revoke a non-existing attestation.
    REQUIRE(attestationIdx >= 0, "Attestation doesn't exist.");
    const attestation =
      state.leaves[schemaRecordIdx].attestations[attestationIdx];
    // Ensure that we aren't attempting to revoke a non-existing attestation.
    REQUIRE(attestation !== undefined, "Attestation doesn't exist.");
    // Allow only original attesters to revoke their attestations.
    REQUIRE(
      attestation.attester === msgSender,
      "Cannot revoke an attestation you didn't create."
    );
    // Please note that also checking of the schema itself is revocable is unnecessary, since it's not possible to
    // make revocable attestations to an irrevocable schema.
    REQUIRE(attestation.revocable, "Attestation is not revocable.");
    // Ensure that we aren't trying to revoke the same attestation twice.
    REQUIRE(
      attestation.revocationTime === NO_REVOCATION_TIME,
      "Attestation is already revoked."
    );
    // Ensure that valid revocation time was set or that it was set in the future.
    REQUIRE(
      inputs.revocationTime !== NO_REVOCATION_TIME &&
        attestation.time <= inputs.revocationTime,
      "Invalid revocation time."
    );
    // update state
    attestation.revocationTime = inputs.revocationTime;
    state.leaves[schemaRecordIdx].attestations[attestationIdx] = attestation;
    return state;
  },
};

export const transitions: Transitions<AttestationState> = {
  registerSchema,
  attest,
  revoke,
};
