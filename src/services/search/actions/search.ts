import {SearchResult} from "../domains";
import {ActionPayload, ActionResponse} from "../../../shared/service/types";

export const Name = 'search';

export class Payload implements ActionPayload {
  terms: string;
}

export class Response implements ActionResponse {
  results: Array<SearchResult> = [];
}

export const Handler = async (payload: Payload) => {
  return new Response();
}
