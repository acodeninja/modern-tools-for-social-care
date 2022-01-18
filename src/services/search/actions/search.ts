import {ActionPayload, ActionResponse} from "../../../framework/service/types";
import {search} from "../lib/opensearch";
import {SearchResult} from "../domains";
import {LambdifyHandler, RequestError} from "../lib/lambda";
import {inspect} from "util";

export const Name = 'Search';

export class Payload implements ActionPayload {
  terms?: string;
  index?: string;
  highlight?: string;
  [key: string]: string;
}

export class Response implements ActionResponse {
  count: number;
  results: Array<SearchResult> = [];
}

export const Handler = async (payload: Payload) => {
  console.log(`Running search with payload ${inspect(payload)}`);

  Validate(payload);

  const searchResponse = await search(
    payload.terms || without(payload, ['terms', 'index', 'highlight']),
    payload.index,
    payload.highlight,
  );

  return Object.assign(new Response(), searchResponse);
}

const without = (source, keys) => {
  const destination = Object.assign({}, source);
  keys.forEach(key => delete destination[key]);
  return destination;
}

const Validate = (payload) => {
  const otherTerms = without(payload, ['terms', 'index', 'highlight']);
  const highlights = !!payload.highlight ? payload.highlight.split(',') : null;

  if (!payload.terms && Object.entries(otherTerms).length === 0) {
    throw new RequestError("Must provide one of terms or field paths.");
  }

  if (payload.terms && Object.entries(otherTerms).length > 0) {
    throw new RequestError("Must provide only one of terms or field paths.");
  }

  if (
    !!highlights &&
    !highlights.every(highlight => Object.keys(otherTerms).includes(highlight))
  ) {
    throw new RequestError('If passing a highlight you must also specify the term for that field.');
  }
};

export const LambdaHandler = LambdifyHandler(Handler);
