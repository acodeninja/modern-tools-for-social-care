import {ActionPayload, ActionResponse} from "../../../framework/service/types";
import {search} from "../lib/opensearch";
import {SearchResult} from "../domains";
import {LambdifyHandler} from "../lib/lambda";

export const Name = 'Search';

export class Payload implements ActionPayload {
  terms: string;
}

export class Response implements ActionResponse {
  count: number;
  results: Array<SearchResult> = [];
}

export const Handler = async (payload: Payload) => {
  console.log(`Running search with payload ${JSON.stringify(payload)}`);
  const searchResponse = await search(payload.terms);

  return Object.assign(new Response(), searchResponse);
}

export const LambdaHandler = LambdifyHandler(Handler);
