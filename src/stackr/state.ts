import { State } from "@stackr/sdk/machine";

import { ScoringSystemState } from "./types";
import { constructTree } from "./tree";

export class ScoringState extends State<ScoringSystemState> {
  constructor(state: ScoringSystemState) {
    super(state);
  }

  getRootHash(): string {
    const tree = constructTree(this.state);
    return tree.getHexRoot();
  }
}
