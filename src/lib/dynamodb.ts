import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import env from '@/config/env';

/**
 * DynamoDB client configuration for slot reservations
 * Singleton pattern to reuse client connections
 *
 * For ECS deployment: IAM role credentials are used automatically
 * For local development: Use AWS credentials from environment or AWS CLI config
 */

// Create the base DynamoDB client
const clientConfig: any = {
  region: env.AWS_REGION || 'ca-central-1',
};

if (env.AWS_DYNAMODB_ACCESS_KEY_ID && env.AWS_DYNAMODB_SECRET_ACCESS_KEY) {
  clientConfig.region = env.AWS_REGION;
  clientConfig.credentials = {
    accessKeyId: env.AWS_DYNAMODB_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_DYNAMODB_SECRET_ACCESS_KEY,
  };
}

const client = new DynamoDBClient(clientConfig);

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export default dynamodb;

export const SLOT_RESERVATIONS_TABLE = env.AWS_DYNAMODB_TABLE_NAME;

export const EXAMINER_PROFILE_ID_INDEX = env.AWS_DYNAMODB_INDEX_NAME;

// if (!env.AWS_DYNAMODB_TABLE_NAME) {
//   throw new Error('AWS_DYNAMODB_TABLE_NAME environment variable is required');
// }

// if (!env.AWS_DYNAMODB_INDEX_NAME) {
//   throw new Error('AWS_DYNAMODB_INDEX_NAME environment variable is required');
// }
