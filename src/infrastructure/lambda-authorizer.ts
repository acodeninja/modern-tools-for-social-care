import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3"
import {APIGatewayRequestIAMAuthorizerHandlerV2} from "aws-lambda";
import {inspect} from "util";

export const handler: APIGatewayRequestIAMAuthorizerHandlerV2 = async (event) => {
  console.log(inspect(event, false, 15));

  const manifest = await (new S3Client({})).send(new GetObjectCommand({
    Bucket: event.stageVariables?.['MANIFEST_BUCKET'],
    Key: event.stageVariables?.['MANIFEST_KEY'],
  }));

  console.log(inspect(JSON.parse(manifest.Body ? manifest.Body.toString() : '{}'), false, 15));

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
