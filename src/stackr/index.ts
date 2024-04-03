import { Request, Response } from "express";

import { Playground } from "@stackr/sdk/plugins";

import { ScoringMachine, mru } from "./mru";
import { STATE_MACHINES } from "./machine";
import { getProof, verifyInclusion } from "./tree";
import { sleep } from "../utils";

const scoringMachine = mru.stateMachines.get<ScoringMachine>(
  STATE_MACHINES.EPHEMERAL_SCORING
) as ScoringMachine;

if (process.env.NODE_ENV !== "PRODUCTION") {
  const playground = Playground.init(mru);

  playground.addGetMethod(
    "/custom/leaderboard",
    async (_req: Request, res: Response) => {
      // returns a simple leaderboard that sorts by score (descending)
      const leaderboard = Object.entries(scoringMachine?.state.userScores || {})
        .sort(
          ([_prevAddress, prevScore], [_address, score]) => score - prevScore
        )
        .map(([address, score]) => ({ address, score }));
      return res.send({ leaderboard });
    }
  );

  playground.addGetMethod(
    "/custom/proof",
    async (_req: Request, res: Response) => {
      // returns a simple leaderboard that sorts by score (descending)
      if (!_req.query.address || !_req.query.score) {
        return res
          .status(400)
          .send({ error: "address and score are required" });
      }
      const address = _req.query.address as string;
      const score = parseInt(_req.query.score as string, 10);
      const proof = getProof(scoringMachine.state, { address, score });
      const verified = verifyInclusion(scoringMachine.state, {
        address,
        score,
      });
      return res.send({ proof, verified });
    }
  );

  await sleep(1000);
}
