import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * DynamoDB client configuration for slot reservations
 * Singleton pattern to reuse client connections
 *
 * For ECS deployment: IAM role credentials are used automatically
 * For local development: Use AWS credentials from environment or AWS CLI config
 */

// Create the base DynamoDB client
const clientConfig: any = {
  region: process.env.AWS_REGION || 'ca-central-1',
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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

export const SLOT_RESERVATIONS_TABLE = process.env.DYNAMODB_SLOT_RESERVATIONS_TABLE;

export const EXAMINER_PROFILE_ID_INDEX = process.env.EXAMINER_PROFILE_ID_INDEX;

if (!SLOT_RESERVATIONS_TABLE) {
  throw new Error('DYNAMODB_SLOT_RESERVATIONS_TABLE environment variable is required');
}

if (!EXAMINER_PROFILE_ID_INDEX) {
  throw new Error('EXAMINER_PROFILE_ID_INDEX environment variable is required');
}
