import { SchemaMerkleTree as StateWrapper } from "./state";
import { Attestation } from "./types";

export const findIndexOfSchemaRecord = (
  state: StateWrapper,
  schemaUID: string
) => {
  return state.leaves.findIndex(
    (schemaRecord) => schemaRecord.uid === schemaUID
  );
};

export const findIndexOfAttestation = (
  state: StateWrapper,
  schemaUID: string,
  attestationUID: string
) => {
  const schemaRecordIdx = findIndexOfSchemaRecord(state, schemaUID);
  if (schemaRecordIdx < 0) {
    return -1;
  }
  return state.leaves[schemaRecordIdx].attestations.findIndex(
    (attestation) => attestation.uid === attestationUID
  );
};

export const getAttestation = (
  state: StateWrapper,
  attestationUID: string
): Attestation | undefined => {
  state.leaves.forEach((schemaRecord) =>
    schemaRecord.attestations.forEach((attestation) => {
      if (attestation.uid == attestationUID) {
        return attestation;
      }
    })
  );
  return undefined;
};
