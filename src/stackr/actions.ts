import { ActionSchema, SolidityType } from "@stackr/sdk";

/**
  RegisterSchemaSchema is an action schema for registering a schema.
**/
export const RegisterSchemaSchema = new ActionSchema("registerSchema", {
  schema: SolidityType.STRING,
  revocable: SolidityType.BOOL,
});

/**
  AttestSchema is an action schema for creating a new attestation.
**/
export const AttestSchema = new ActionSchema("attest", {
  schemaUID: SolidityType.STRING,
  time: SolidityType.UINT,
  expirationTime: SolidityType.UINT,
  refUID: SolidityType.STRING,
  recipient: SolidityType.ADDRESS,
  revocable: SolidityType.BOOL,
  data: SolidityType.BYTES,
});

/**
  RevokeSchema is an action schema for revoking an existing attestation.
**/
export const RevokeSchema = new ActionSchema("revoke", {
  attestationUID: SolidityType.STRING,
  schemaUID: SolidityType.STRING,
  revocationTime: SolidityType.UINT,
});

export const actionSchemas = {
  RegisterSchemaSchema,
  AttestSchema,
  RevokeSchema,
};
