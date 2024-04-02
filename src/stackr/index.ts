import express, { Request, Response } from "express";

import { AttestationMachine, mru } from "./mru";
import { STATE_MACHINES } from "./machine";

console.log("Starting server...");

const attestationMachine = mru.stateMachines.get<AttestationMachine>(
  STATE_MACHINES.MICRO_ATTESTATIONS
);

const app = express();
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  return res.send({ state: attestationMachine?.state });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
