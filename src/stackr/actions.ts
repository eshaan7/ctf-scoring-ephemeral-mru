import { ActionSchema, SolidityType } from "@stackr/sdk";

/**
 * AddFlagSchema is an action schema for adding a new flag.
 */
export const AddFlagSchema = new ActionSchema("addFlag", {
  flag: SolidityType.STRING,
  points: SolidityType.UINT,
});

/**
 * SubmitFlagSchema is an action schema for submitting a flag.
 */
export const SubmitFlagSchema = new ActionSchema("submitFlag", {
  flag: SolidityType.STRING,
});

export const actionSchemas = {
  AddFlagSchema,
  SubmitFlagSchema,
};
