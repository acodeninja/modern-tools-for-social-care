import {APIGatewayRequestAuthorizerHandler} from "aws-lambda";
import {inspect} from "util";

export const handler: APIGatewayRequestAuthorizerHandler = async (event) => {
  console.log(inspect(event, false, 15));

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
  };
};
