import { solidityPackedKeccak256 } from "ethers";
import { MerkleTree } from "merkletreejs";

import { ScoringSystemState } from "./types";

export const constructTree = (state: ScoringSystemState): MerkleTree => {
  const adminHashes = state.admins.map((address) =>
    solidityPackedKeccak256(["address"], [address])
  );
  const flagHashes = Object.entries(state.flagHashPoints).map(
    ([flagHash, points]) =>
      solidityPackedKeccak256(["string", "uint256"], [flagHash, points])
  );
  const userScoreHashes = Object.entries(state.userScores).map(
    ([userAddress, score]) =>
      solidityPackedKeccak256(["address", "uint256"], [userAddress, score])
  );
  const userSubmittedFlagHashes = Object.entries(
    state.userSubmittedFlagHashes
  ).map(([userAddress, flagHashes]) =>
    solidityPackedKeccak256(
      ["address", "string"],
      [userAddress, new MerkleTree(flagHashes).getHexRoot()]
    )
  );
  const adminsRoot = new MerkleTree(adminHashes).getHexRoot();
  const flagsRoot = new MerkleTree(flagHashes).getHexRoot();
  const userScoresRoot = new MerkleTree(userScoreHashes).getHexRoot();
  const userSubmittedFlagsRoot = new MerkleTree(
    userSubmittedFlagHashes
  ).getHexRoot();
  return new MerkleTree([
    adminsRoot,
    flagsRoot,
    userScoresRoot,
    userSubmittedFlagsRoot,
  ]);
};

export const getProof = (
  state: ScoringSystemState,
  data: { address: string; score: number }
): string[] => {
  // Construct the Merkle Tree from the state
  const tree = constructTree(state);

  // Create the hash (leaf in merkle tree) for the specific address and score combination
  const leaf = solidityPackedKeccak256(
    ["address", "uint256"],
    [data.address, data.score]
  );

  // Get the proof for the leaf
  const proof = tree.getHexProof(leaf);
  return proof;
};

export const verifyInclusion = (
  state: ScoringSystemState,
  data: { address: string; score: number }
): boolean => {
  // Construct the Merkle Tree from the state
  const tree = constructTree(state);

  // Create the hash (leaf in merkle tree) for the specific address and score combination
  const leaf = solidityPackedKeccak256(
    ["address", "uint256"],
    [data.address, data.score]
  );

  // Get the proof for the leaf
  const proof = tree.getProof(leaf);

  // Verify the proof
  return tree.verify(proof, leaf, tree.getRoot());
};
