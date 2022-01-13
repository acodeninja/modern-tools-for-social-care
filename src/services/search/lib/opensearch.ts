import {signedRequest} from "./http";

export interface AddItemInput {
  index: string;
  items?: Array<{
    _meta: {
      location: {
        api: string;
        frontend: string;
      };
      domain: string;
      compound?: string;
    },
    [key: string]: unknown;
  }>;
}

export const put = async (input: AddItemInput) => {
  const updates = await Promise.all(input.items.map(item => (async () => {
    const existingDocument = await findDocument(item._meta, input.index);

    const meta = Object.assign(item._meta);
    delete item._meta;
    meta.compound = Object.values(item).join(' ');
    item._meta = meta;

    const indexInfo: { index: { _index: string, _id?: string } }
      = {index: {_index: input.index}};

    if (existingDocument.id) indexInfo.index._id = existingDocument.id;

    return JSON.stringify(indexInfo) + '\n' + JSON.stringify(item);
  })()));

  const body = updates.join('\n') + '\n';

  return await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/_bulk`),
    body,
    method: "POST",
    service: "es",
    region: process.env.AWS_REGION,
  });
};

export const getIndexes = async () => {
  const response = await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/_cat/indices?v&h=i`),
    method: "GET",
    service: "es",
    region: process.env.AWS_REGION,
  });

  return response.body.split('\n').filter(index => !!index && index !== 'i' && index.indexOf('kibana') === -1);
}

export const search = async (terms: string | {[key:string]: string}, index: string = null, results: number = 20) => {
  let url = `https://${process.env.AWS_OPENSEARCH_ENDPOINT}`
  if (index) url += `/${index}`;
  url += '/_search';

  await signedRequest({
    url: new URL(url),
    method: "GET",
    service: "es",
    region: process.env.AWS_REGION,
  });

  const response = await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/_search`),
    method: "POST",
    service: "es",
    region: process.env.AWS_REGION,
    body: JSON.stringify({
      query: {
        fuzzy: {
          '_meta.compound': {
            value: terms
          },
        },
      },
    }),
  });

  return {
    count: response.body?.hits?.total?.value,
    results: response.body?.hits?.hits?.map(result => {
      return {
        score: result._score,
        data: result._source,
      }
    }),
  }
};

export const dropIndex = async (index: string): Promise<{
  result: 'failure' | 'success';
  error?: string;
}> => {
  const response = await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/${index}`),
    method: "DELETE",
    service: "es",
    region: process.env.AWS_REGION,
  });

  if (response.statusCode !== 200) {
    return {
      result: 'failure',
      error: response.body?.error?.reason,
    };
  }

  return {result: 'success'};
};

const findDocument = async (documentMeta: {
  location: {
    api: string;
    frontend: string;
  };
  domain: string;
}, index: string) => {
  let url = `https://${process.env.AWS_OPENSEARCH_ENDPOINT}`;
  if (index) url += `/${index}`;
  url += '/_search';

  const response = await signedRequest({
    url: new URL(url),
    method: "POST",
    service: "es",
    region: process.env.AWS_REGION,
    body: JSON.stringify({
      query: {
        bool: {
          must: [
            {
              match: {
                '_meta.location.api': documentMeta.location.api
              }
            },
            {
              match: {
                '_meta.location.frontend': documentMeta.location.frontend
              }
            },
            {
              match: {
                '_meta.domain': documentMeta.domain
              }
            },
          ],
        },
      },
    }),
  });

  const firstHit = response.body?.hits?.hits[0];

  if (firstHit) {
    return {
      id: firstHit._id,
      index: firstHit._index,
    };
  }

  return {};
}
