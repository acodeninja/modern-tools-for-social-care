import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3"
import {APIGatewayRequestAuthorizerEventV2, APIGatewayRequestIAMAuthorizerHandlerV2} from "aws-lambda";
import {inspect} from "util";
import {Readable} from 'stream'
import {decode as JWTDecode, verify as JWTVerify} from 'jsonwebtoken';

class ManifestRetrievalError extends Error {}

class NoToken extends Error {}

interface Credentials {
  sub: string;
  iss: string;
  iat: number;
  email: string;
  name: string;
  groups: Array<string>;
}

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

  const token = event.cookies
    .find(cookie => cookie.indexOf('testToken') === 0)
    ?.split('=')
    .slice(1)
    .join('=');

  if (!token) throw new NoToken();

  JWTVerify(token, 'test-secret-key');

  const credentials = <Credentials>JWTDecode(token);

  const inRequiredGroups = actionManifest.authentication?.required_groups?.every(group => credentials.groups.includes(group));

  return {
    principalId: credentials.sub,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: "execute-api:Invoke",
        Effect: inRequiredGroups ? 'Allow' : 'Deny',
        Resource: event.routeArn,
      }],
    },
    context: {
      credentials: Buffer.from(JSON.stringify(credentials)).toString('base64url'),
    }
  };
};
