import { Transitions, STF, REQUIRE } from "@stackr/sdk/machine";
import { solidityPackedKeccak256 } from "ethers";

import { ScoringState } from "./state";
import { AddFlagInput, SubmitFlagInput } from "./types";

/**
 * STF to add a new flag.
 */
const addFlag: STF<ScoringState, AddFlagInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const actor = msgSender.toString();
    // Ensure only admins can add flags
    REQUIRE(state.admins.includes(actor), "ACCESS_DENIED");
    const { flag, points } = inputs;
    // needs to be generated deterministically
    const flagHash = solidityPackedKeccak256(["string"], [flag]);
    // Ensure flag must not already exist
    REQUIRE(!state.flagHashPoints[flagHash], "FLAG_ALREADY_EXISTS");
    // Ensure points are positive
    REQUIRE(points > 0, "INVALID_POINTS");
    // add flag to state
    state.flagHashPoints[flagHash] = points;
    return state;
  },
};

/**
 * STF to submit a flag.
 */
const submitFlag: STF<ScoringState, SubmitFlagInput> = {
  handler: ({ state, inputs, msgSender }) => {
    const actor = msgSender.toString();
    const { flag } = inputs;
    // needs to be generated deterministically
    const flagHash = solidityPackedKeccak256(["string"], [flag]);
    // Ensure flag must exist
    const flagPoints = state.flagHashPoints[flagHash];
    REQUIRE(flagPoints !== undefined, "FLAG_DOESNT_EXIST");
    // Ensure user has not already submitted this flag
    REQUIRE(
      !state.userSubmittedFlagHashes[actor]?.includes(flagHash),
      "FLAG_ALREADY_SUBMITTED"
    );
    // add flag to user's submitted flags
    if (state.userSubmittedFlagHashes[actor] === undefined) {
      state.userSubmittedFlagHashes[actor] = [flagHash];
    } else {
      state.userSubmittedFlagHashes[actor].push(flagHash);
    }
    // allocate points to user
    if (state.userScores[actor] === undefined) {
      state.userScores[actor] = flagPoints;
    } else {
      state.userScores[actor] += flagPoints;
    }
    return state;
  },
};

export const transitions: Transitions<ScoringState> = {
  addFlag,
  submitFlag,
};
