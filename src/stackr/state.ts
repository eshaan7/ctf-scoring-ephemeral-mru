import { State } from "@stackr/sdk/machine";
import { BytesLike, ZeroHash, solidityPackedKeccak256 } from "ethers";
import { MerkleTree } from "merkletreejs";
import { Attestation, Schema } from "./types";

export class AttestationsMerkleTree {
  public merkleTree: MerkleTree;
  public leaves: Attestation[];

  constructor(leaves: Attestation[]) {
    this.merkleTree = this.createTree(leaves);
    this.leaves = leaves;
  }

  createTree(leaves: Attestation[]) {
    const hashedLeaves = leaves.map((leaf) => {
      return solidityPackedKeccak256(
        ["string", "uint256"],
        [
          leaf.uid,
          leaf.revocationTime, // can be changed
        ]
      );
    });
    return new MerkleTree(hashedLeaves);
  }
}

export class SchemaMerkleTree {
  public merkleTree: MerkleTree;
  public leaves: Schema[];

  constructor(leaves: Schema[]) {
    this.merkleTree = this.createTree(leaves);
    this.leaves = leaves;
  }

  createTree(leaves: Schema[]) {
    const hashedLeaves = leaves.map((leaf) => {
      return solidityPackedKeccak256(
        ["string", "bytes"],
        [
          leaf.uid,
          new AttestationsMerkleTree(leaf.attestations).merkleTree.getHexRoot(),
        ]
      );
    });
    return new MerkleTree(hashedLeaves);
  }
}

export class AttestationState extends State<Schema[], SchemaMerkleTree> {
  constructor(state: Schema[]) {
    super(state);
  }

  transformer() {
    return {
      wrap: () => {
        return new SchemaMerkleTree(this.state);
      },
      unwrap: (wrappedState: SchemaMerkleTree) => {
        return wrappedState.leaves;
      },
    };
  }

  getRootHash(): BytesLike {
    if (this.state.length === 0) {
      return ZeroHash;
    }
    return this.transformer().wrap().merkleTree.getHexRoot();
  }
}
