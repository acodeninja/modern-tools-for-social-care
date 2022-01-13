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
  const existingData = await Promise.all(input.items.map(item => findDocument(item._meta)));

  console.log(existingData);

  const body = input.items
    .map(item => {
      const meta = Object.assign(item._meta);
      delete item._meta;
      meta.compound = Object.values(item).join(' ');
      item._meta = meta;
      return item;
    })
    .map(item => {
      return JSON.stringify({index: {_index: input.index}}) + '\n' + JSON.stringify(item);
    })
    .join('\n') + '\n';

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

export const search = async (terms: string, results: number = 20) => {
  const indexes = await getIndexes();

  console.log(`indexes: ${JSON.stringify(indexes)}`);

  await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/residents/_mapping`),
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
}) => {
  const response = await signedRequest({
    url: new URL(`https://${process.env.AWS_OPENSEARCH_ENDPOINT}/_search`),
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
