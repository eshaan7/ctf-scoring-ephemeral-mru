import { ActionSchema, AllowedInputTypes } from "@stackr/sdk";
import { BaseWallet, Wallet, AbiCoder, ZeroAddress, ZeroHash } from "ethers";
import {
  RegisterSchemaSchema,
  AttestSchema,
  RevokeSchema,
} from "./src/stackr/actions.ts";
import { mru } from "./src/stackr/mru.ts";

const wallet = new Wallet(process.env.PRIVATE_KEY_USER as string);

const signMessage = async (
  wallet: BaseWallet,
  schema: ActionSchema,
  payload: AllowedInputTypes
) => {
  const signature = await wallet.signTypedData(
    schema.domain,
    schema.EIP712TypedData.types,
    payload
  );
  return signature;
};

const main = async () => {
  const inputs = {
    schema: "string name, bool gm",
    revocable: true,
  };
  const signature = await signMessage(wallet, RegisterSchemaSchema, inputs);
  const registerSchemaAction = RegisterSchemaSchema.actionFrom({
    inputs,
    signature,
    msgSender: wallet.address,
  });
  const ack = await mru.submitAction("registerSchema", registerSchemaAction);
  console.log(ack);
};

const main2 = async () => {
  const time = 1712061374865;
  const inputs = {
    schemaUID:
      "0xc3b1a427cfb9c5d49057aa122a207b1201b0158432f1cd6ba23100b35a9631aa",
    time: time,
    expirationTime: time + 24 * 60 * 60 * 1000, // + 1 day
    refUID: ZeroHash,
    recipient: ZeroAddress,
    revocable: true,
    data: AbiCoder.defaultAbiCoder().encode(
      ["string", "bool"],
      ["zkcat", true]
    ),
  };
  const signature = await signMessage(wallet, AttestSchema, inputs);
  const attestAction = AttestSchema.actionFrom({
    inputs,
    signature,
    msgSender: wallet.address,
  });
  const ack = await mru.submitAction("attest", attestAction);
  console.log(ack);
};

const main3 = async () => {
  const inputs = {
    attestationUID:
      "0x0b6aa1ee5054c973c8187a36b7b4b4a8f56f611f26965c32d2d98a54036d0343",
    schemaUID:
      "0xc3b1a427cfb9c5d49057aa122a207b1201b0158432f1cd6ba23100b35a9631aa",
    revocationTime: Date.now(),
  };
  const signature = await signMessage(wallet, RevokeSchema, inputs);
  const revokeAction = RevokeSchema.actionFrom({
    inputs,
    signature,
    msgSender: wallet.address,
  });
  const ack = await mru.submitAction("revoke", revokeAction);
  console.log(ack);
};

await main();
await main2();
await main3();
