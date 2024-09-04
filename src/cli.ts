import { ActionConfirmationStatus } from "@stackr/sdk";
import { Wallet } from "ethers";
import inquirer from "inquirer";

import {
  CLIAction,
  CLIAddFlagResponse,
  CLIGetProofResponse,
  CLISubmitFlagResponse,
} from "./cli-types";
import { STATE_MACHINES } from "./stackr/machine";
import { ScoringMachine, mru } from "./stackr/mru";
import { getProof, verifyInclusion } from "./stackr/tree";

const sm = mru.stateMachines.get<ScoringMachine>(
  STATE_MACHINES.EPHEMERAL_SCORING
) as ScoringMachine;

const accounts = {
  Admin: new Wallet(process.env.PRIVATE_KEY!),
  "User 1": new Wallet(process.env.PRIVATE_KEY_USER_1!),
  "User 2": new Wallet(process.env.PRIVATE_KEY_USER_2!),
};
let selectedWallet: Wallet;

const actions = {
  addFlag: async (flag: string, points: number): Promise<void> => {
    const name = "addFlag";
    const inputs = {
      flag,
      points,
    };
    const domain = mru.config.domain;
    const types = mru.getStfSchemaMap()[name]!;
    const signature = await selectedWallet.signTypedData(domain, types, {
      name,
      inputs,
    });
    const ack = await mru.submitAction({
      name,
      inputs,
      signature,
      msgSender: selectedWallet.address,
    });
    ack.waitFor(ActionConfirmationStatus.C1);
    console.log("\n----------[output]----------");
    console.log("Action has been submitted.");
    console.log(ack);
    console.log("----------[/output]----------\n");
  },
  submitFlag: async (flag: string): Promise<void> => {
    const name = "submitFlag";
    const inputs = {
      flag,
    };
    const domain = mru.config.domain;
    const types = mru.getStfSchemaMap()[name]!;
    const signature = await selectedWallet.signTypedData(domain, types, {
      name,
      inputs,
    });
    const ack = await mru.submitAction({
      name,
      inputs,
      signature,
      msgSender: selectedWallet.address,
    });
    ack.waitFor(ActionConfirmationStatus.C1);
    console.log("\n----------[output]----------");
    console.log("Action has been submitted.");
    console.log(ack);
    console.log("----------[/output]----------\n");
  },
  viewLeaderboard: async (): Promise<void> => {
    // returns a simple leaderboard that sorts by score (descending)
    const leaderboard = Object.entries(sm.state.userScores || {})
      .sort(([_prevAddress, prevScore], [_address, score]) => score - prevScore)
      .map(([address, score]) => ({ address, score }));
    console.log("\n----------[output]----------");
    console.log("Leaderboard:");
    console.log(leaderboard);
    console.log("----------[/output]----------\n");
  },
  getProof: async (address: string, score: number): Promise<void> => {
    const proof = getProof(sm.state, { address, score });
    const verified = verifyInclusion(sm.state, {
      address,
      score,
    });
    console.log("\n----------[output]----------");
    console.log("Proof: ", proof);
    console.log("Verified: ", verified);
    console.log("----------[/output]----------\n");
  },
};

const askAccount = async (): Promise<"Admin" | "User 1" | "User 2"> => {
  const response = await inquirer.prompt([
    {
      type: "list",
      name: "account",
      message: "Choose an account:",
      choices: ["Admin", "User 1", "User 2"],
    },
  ]);
  return response.account;
};

const askAction = async (): Promise<CLIAction> => {
  const response = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Choose an action:",
      choices: [
        "Add Flag",
        "Submit Flag",
        "View Leaderboard",
        "Get Proof",
        "Switch account",
        "Exit",
      ],
    },
  ]);
  return response.action as CLIAction;
};

const askAddFlagInput = async (): Promise<CLIAddFlagResponse> => {
  return inquirer.prompt<CLIAddFlagResponse>([
    {
      type: "input",
      name: "flag",
      message: "Enter the flag to add:",
    },
    {
      type: "input",
      name: "points",
      message: "Enter the points amount:",
      validate: (value: string): boolean | string => {
        const valid = !isNaN(parseInt(value)) && parseInt(value) > 0;
        return valid || "Please enter a positive number";
      },
      filter: (value: string): number => parseInt(value),
    },
  ]);
};

const askSubmitFlagInput = async (): Promise<CLISubmitFlagResponse> => {
  return inquirer.prompt<CLISubmitFlagResponse>([
    {
      type: "input",
      name: "flag",
      message: "Enter the flag to submit:",
    },
  ]);
};

const askGetProofInput = async (): Promise<CLIGetProofResponse> => {
  return inquirer.prompt<CLIGetProofResponse>([
    {
      type: "input",
      name: "address",
      message: "Enter the user's address:",
    },
    {
      type: "input",
      name: "score",
      message: "Enter the user's score:",
      validate: (value: string): boolean | string => {
        const valid = !isNaN(parseInt(value)) && parseInt(value) > 0;
        return valid || "Please enter a positive number";
      },
      filter: (value: string): number => parseInt(value),
    },
  ]);
};

const main = async (): Promise<void> => {
  let exit = false;
  let selectedAccount: string = ""; // To store the selected account

  while (!exit) {
    if (!selectedAccount) {
      selectedAccount = await askAccount();
      if (
        selectedAccount === "Admin" ||
        selectedAccount === "User 1" ||
        selectedAccount === "User 2"
      ) {
        selectedWallet = accounts[selectedAccount];
        console.log("\n----------[output]----------");
        console.log(
          `You have selected: ${selectedWallet.address.slice(0, 12)}...`
        );
        console.log("----------[/output]----------\n");
      }
    }

    const action = await askAction();

    switch (action) {
      case "Switch account": {
        selectedAccount = ""; // Reset selected account so the user can choose again
        break;
      }
      case "Add Flag": {
        const { flag, points } = await askAddFlagInput();
        await actions.addFlag(flag, points);
        break;
      }
      case "Submit Flag": {
        const { flag } = await askSubmitFlagInput();
        await actions.submitFlag(flag);
        break;
      }
      case "View Leaderboard": {
        await actions.viewLeaderboard();
        break;
      }
      case "Get Proof": {
        const { address, score } = await askGetProofInput();
        await actions.getProof(address, score);
        break;
      }
      case "Exit": {
        exit = true;
        break;
      }
      default: {
        console.log("Invalid action selected.");
        break;
      }
    }
  }

  console.log("Exiting app...");
};

await main();
