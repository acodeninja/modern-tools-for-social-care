import {ActionPayload, ActionResponse} from "internals/types";
import {LambdifyHandler} from "internals/lambda";
import {inspect} from "util";

export const Name = 'AuthCheck';

export interface Payload extends ActionPayload {

}

export interface Response extends ActionResponse {

}

export const Handler = async (payload: Payload) => {
  console.log(`auth payload: ${inspect(payload)}`);
  return {};
}

export const LambdaHandler = LambdifyHandler(Handler);
