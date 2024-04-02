import { MicroRollup } from "@stackr/sdk";
import { stackrConfig } from "../../stackr.config";

import { attestationStateMachine } from "./machine";
import { actionSchemas } from "./actions";

type AttestationMachine = typeof attestationStateMachine;

const mru = await MicroRollup({
  config: stackrConfig,
  actions: [...Object.values(actionSchemas)],
  isSandbox: true,
});

mru.stateMachines.add(attestationStateMachine);

await mru.init();

export { AttestationMachine, mru };
