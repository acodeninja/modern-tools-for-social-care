import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3"
import {APIGatewayRequestIAMAuthorizerHandlerV2} from "aws-lambda";
import {inspect} from "util";
import {Readable} from 'stream'

interface ServiceManifest {
  actions: {
    [name: string]: {
      authentication: null | {
        required_groups?: Array<string>;
      };
      route: string;
    };
  };
  events: {};
  subscribers: {};
  views: {};
}

const streamToString = (stream: Readable): Promise<string> => {
  const chunks: Array<Buffer> = [];

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: string) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err: Error) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}

const getAndParseServiceManifest = async ({
                                            bucket,
                                            key
                                          }: { bucket: string; key: string; }): Promise<ServiceManifest> => {
  const source = await (new S3Client({}))
    .send(new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }));

  if (source.Body instanceof Readable) {
    return JSON.parse(await streamToString(source.Body));
  }

  return {actions: {}, events: {}, subscribers: {}, views: {}};
};

export const handler: APIGatewayRequestIAMAuthorizerHandlerV2 = async (event) => {
  console.log(inspect(event, false, 15));

  const manifest = await getAndParseServiceManifest({
    bucket: event.stageVariables?.['MANIFEST_BUCKET'] || '',
    key: event.stageVariables?.['MANIFEST_KEY'] || '',
  });

  console.log(inspect(manifest, false, 15));

  const testToken = {
    sub: "100561961286081451085",
    email: "test@example.com",
    iss: "Example Authority",
    name: "Test Testington",
    groups: [
      "developers",
      "search-admin"
    ],
    iat: Math.floor(Date.now() / 1000),
  };

  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: "execute-api:Invoke",
        Effect: 'Allow',
        Resource: event.routeArn,
      }],
    },
    context: {
      token: Buffer.from(JSON.stringify(testToken)).toString('base64url'),
    }
  };
};
