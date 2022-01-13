import {ActionPayload, ActionResponse} from "../../../framework/service/types";
import {dropIndex} from "../lib/opensearch";
import {LambdifyHandler} from "../lib/lambda";
import {inspect} from "util";

export const Name = 'DropIndex';

export class Payload implements ActionPayload {
  index: string;
}

export class Response implements ActionResponse {
  result: 'failure' | 'success';
  error?: string;
}

export const Handler = async (payload: Payload) => {
  console.log(`Running drop-index with payload ${inspect(payload)}`);
  const response = new Response();
  try {
    await dropIndex(payload.index);
    response.result = 'success';
  } catch (e) {
    response.result = 'failure';
    response.error = e.message;
  }

  return response;
}

export const LambdaHandler = LambdifyHandler(Handler);
