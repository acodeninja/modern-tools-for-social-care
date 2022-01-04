import {ActionPayload, ActionResponse} from "../../../shared/service/types";
import {search} from "../lib/opensearch";
import {SearchResult} from "../domains";
import {LambdifyHandler} from "../lib/lambda";

export const Name = 'search';

export class Payload implements ActionPayload {
  terms: string;
}

export class Response implements ActionResponse {
  results: Array<SearchResult> = [];
}

export const Handler = async (payload: Payload) => {
  const searchResponse = await search(payload.terms);

  console.log(searchResponse);

  const response = new Response();
  response.results = [];
  return response;
}

export const LambdaHandler = LambdifyHandler(Handler);
