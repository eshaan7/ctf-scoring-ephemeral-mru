import { MicroRollup } from "@stackr/sdk";

import { stackrConfig } from "../../stackr.config";
import { scoringStateMachine } from "./machine";

type ScoringMachine = typeof scoringStateMachine;

const mru = await MicroRollup({
  config: stackrConfig,
  stateMachines: [scoringStateMachine],
});

await mru.init();

export { ScoringMachine, mru };
