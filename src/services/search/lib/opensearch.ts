import {signedRequest} from "./http";

export interface AddItemInput {
  index: string;
  items?: Array<{ [key: string]: unknown }>;
}

export const put = async (input: AddItemInput) => {
  const body = input.items.map(item => {
    return JSON.stringify({index: { _index: '' }}) + "\n" + JSON.stringify(item) + "\n";
  });

  return await signedRequest({
    url: new URL(`${process.env.AWS_OPENSEARCH_DOMAIN_URL}/_bulk`),
    body,
    method: "PUT",
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
    url: new URL(`${process.env.AWS_OPENSEARCH_DOMAIN_URL}`),
    body: JSON.stringify(query),
    method: "GET",
    service: "es",
    region: process.env.AWS_REGION,
  });
}
