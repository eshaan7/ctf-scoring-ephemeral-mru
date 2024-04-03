/**
 * A struct representing the global state of the micro-rollup.
 */
export type ScoringSystemState = {
  admins: string[]; // list of admin addresses (that can add flags)
  flagHashPoints: Record<string, number>; // mapping b/w flag hash and points
  userScores: Record<string, number>; // mapping b/w user address and score
  userSubmittedFlagHashes: Record<string, string[]>; // mapping b/w user address and submitted flag hashes
};

/**
 * A struct representing the input type of `addFlag` STF.
 */
export type AddFlagInput = {
  flag: string;
  points: number;
};

/**
 * A struct representing the input type of `submitFlag` STF.
 */
export type SubmitFlagInput = {
  flag: string;
};
