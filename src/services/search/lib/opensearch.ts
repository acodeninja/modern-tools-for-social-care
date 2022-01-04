import {signedRequest} from "./http";

export interface AddItemInput {
  index: string;
  items?: Array<{ [key: string]: unknown }>;
}

export const put = async (input: AddItemInput) => {
  const body = input.items.map(item => {
    return JSON.stringify({index: { _index: input.index }}) + '\n' + JSON.stringify(item);
  }).join('\n');

  return await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/_bulk`),
    body,
    method: "POST",
    service: "es",
    region: process.env.AWS_REGION,
  });
};

export const search = async (terms: string, results: number = 20) => {
  const query = {
    size: results,
    query: {
      multi_match: {
        query: terms,
        fields: [],
      }
    }
  };

  return await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}`),
    body: JSON.stringify(query),
    method: "GET",
    service: "es",
    region: process.env.AWS_REGION,
  });
}
