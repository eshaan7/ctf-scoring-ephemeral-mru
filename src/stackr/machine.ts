import { StateMachine } from "@stackr/sdk/machine";
import genesisState from "./../../genesis-state.json";
import { transitions } from "./transitions";
import { AttestationState } from "./state";

const STATE_MACHINES = {
  MICRO_ATTESTATIONS: "micro-attestations",
};

const attestationStateMachine = new StateMachine({
  id: STATE_MACHINES.MICRO_ATTESTATIONS,
  stateClass: AttestationState,
  initialState: genesisState.state,
  on: transitions,
});

export { STATE_MACHINES, attestationStateMachine };
