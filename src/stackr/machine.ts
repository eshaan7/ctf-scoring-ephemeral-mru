import { StateMachine } from "@stackr/sdk/machine";

import genesisState from "./../../genesis-state.json";
import { transitions } from "./transitions";
import { ScoringState } from "./state";

const STATE_MACHINES = {
  EPHEMERAL_SCORING: "ephemeral-scoring",
};

const scoringStateMachine = new StateMachine({
  id: STATE_MACHINES.EPHEMERAL_SCORING,
  stateClass: ScoringState,
  initialState: genesisState.state,
  on: transitions,
});

export { STATE_MACHINES, scoringStateMachine };
