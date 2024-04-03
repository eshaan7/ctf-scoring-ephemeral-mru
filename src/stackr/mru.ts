import { MicroRollup } from "@stackr/sdk";

import { stackrConfig } from "../../stackr.config";
import { scoringStateMachine } from "./machine";
import { actionSchemas } from "./actions";

type ScoringMachine = typeof scoringStateMachine;

const mru = await MicroRollup({
  config: stackrConfig,
  actionSchemas: [...Object.values(actionSchemas)],
  isSandbox: process.env.IS_SANDBOX === "true",
  stateMachines: [scoringStateMachine],
  stfSchemaMap: {
    addFlag: actionSchemas.AddFlagSchema.identifier,
    submitFlag: actionSchemas.SubmitFlagSchema.identifier,
  },
});

await mru.init();

export { ScoringMachine, mru };
