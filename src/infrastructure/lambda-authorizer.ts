import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3"
import {APIGatewayRequestAuthorizerEventV2, APIGatewayRequestIAMAuthorizerHandlerV2} from "aws-lambda";
import {inspect} from "util";
import {Readable} from 'stream'

class ManifestRetrievalError extends Error {}

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

const getActionManifest = async (event: APIGatewayRequestAuthorizerEventV2): Promise<ServiceManifest['actions']['name'] | undefined> => {
  const source = await (new S3Client({}))
    .send(new GetObjectCommand({
      Bucket: event.stageVariables?.['MANIFEST_BUCKET'] || '',
      Key: event.stageVariables?.['MANIFEST_KEY'] || '',
    }));

  if (source.Body instanceof Readable) {
    const data: ServiceManifest = JSON.parse(await streamToString(source.Body));

    return Object.values(data.actions).find(action => action.route === event.routeKey);
  }

  throw new ManifestRetrievalError();
};

export const handler: APIGatewayRequestIAMAuthorizerHandlerV2 = async (event) => {
  console.log(inspect(event, false, 15));

  const actionManifest = await getActionManifest(event);

  if (!actionManifest) throw new ManifestRetrievalError();

  console.log(inspect(actionManifest, false, 15));

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
