import {APIGatewayRequestAuthorizerHandler} from "aws-lambda";
import {inspect} from "util";

export const handler: APIGatewayRequestAuthorizerHandler = async (event) => {
  console.log(inspect(event, false, 15));

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
        Resource: event.methodArn,
      }],
    },
    context: {
      token: Buffer.from(JSON.stringify(testToken)).toString('base64url'),
    }
  };
};
