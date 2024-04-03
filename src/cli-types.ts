export type CLIAction =
  | "Add Flag"
  | "Submit Flag"
  | "View Leaderboard"
  | "Get Proof"
  | "Switch account"
  | "Exit";

export interface CLIAddFlagResponse {
  flag: string;
  points: number;
}

export interface CLISubmitFlagResponse {
  flag: string;
}
export interface CLIGetProofResponse {
  address: string;
  score: number;
}
