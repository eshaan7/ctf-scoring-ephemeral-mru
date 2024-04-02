import { BytesLike } from "ethers";

export type SchemaRecordInput = {
  schema: string;
  revocable: boolean;
};

export type SchemaRecordStruct = SchemaRecordInput & {
  registerer: string;
};

export type SchemaRecord = {
  uid: string;
} & SchemaRecordStruct;

export type AttestationInput = {
  schemaUID: string;
  time: number;
  expirationTime: number;
  refUID: string;
  recipient: string;
  revocable: boolean;
  data: BytesLike;
};

export type AttestationStruct = AttestationInput & {
  attester: string;
  revocationTime: number;
};

export type Attestation = {
  uid: string;
} & AttestationStruct;

export type Schema = SchemaRecord & {
  attestations: Attestation[];
};

export type RevocationInput = {
  attestationUID: string;
  schemaUID: string;
  revocationTime: number;
};
