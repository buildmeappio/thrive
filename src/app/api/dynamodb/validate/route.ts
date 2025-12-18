import { NextResponse } from 'next/server';
import {
  PutCommand,
  GetCommand,
  DeleteCommand,
  QueryCommand,
  type PutCommandInput,
  type GetCommandInput,
  type DeleteCommandInput,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import dynamodb, { SLOT_RESERVATIONS_TABLE, EXAMINER_PROFILE_ID_INDEX } from '@/lib/dynamodb';
import env from '@/config/env';
import log from '@/utils/log';

/**
 * DynamoDB validation endpoint
 * Tests connectivity and basic operations (Put, Get, Delete, Query)
 * GET /api/dynamodb/validate
 */
export async function GET() {
  const testResults: {
    connection: { status: string; message?: string; error?: string };
    putItem: { status: string; message?: string; error?: string };
    getItem: { status: string; message?: string; error?: string; data?: any };
    deleteItem: { status: string; message?: string; error?: string };
    query: { status: string; message?: string; error?: string };
  } = {
    connection: { status: 'pending' },
    putItem: { status: 'pending' },
    getItem: { status: 'pending' },
    deleteItem: { status: 'pending' },
    query: { status: 'pending' },
  };

  const testKey = `__TEST__${Date.now()}`;
  const testExaminerId = '__TEST_EXAMINER__';
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 300; // 5 minutes from now

  try {
    // Test 1: Connection check - Try to describe table (or simple operation)
    try {
      if (!SLOT_RESERVATIONS_TABLE) {
        throw new Error('AWS_DYNAMODB_TABLE_NAME environment variable is not set');
      }

      // Test connection by attempting a simple GetItem with a non-existent key
      const connectionTestParams: GetCommandInput = {
        TableName: SLOT_RESERVATIONS_TABLE,
        Key: { slotKey: '__CONNECTION_TEST__' },
      };

      await dynamodb.send(new GetCommand(connectionTestParams));
      testResults.connection = {
        status: 'success',
        message: 'Successfully connected to DynamoDB',
      };
    } catch (error) {
      testResults.connection = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown connection error',
      };
      // If connection fails, return early
      return NextResponse.json(
        {
          status: 'failed',
          timestamp: new Date().toISOString(),
          message: 'DynamoDB connection test failed',
          results: testResults,
          config: {
            region: env.AWS_REGION || 'ca-central-1',
            tableName: SLOT_RESERVATIONS_TABLE || 'not set',
            indexName: EXAMINER_PROFILE_ID_INDEX || 'not set',
            hasCredentials: !!(
              env.AWS_DYNAMODB_ACCESS_KEY_ID && env.AWS_DYNAMODB_SECRET_ACCESS_KEY
            ),
          },
        },
        { status: 503 }
      );
    }

    // Test 2: PutItem operation
    try {
      const putParams: PutCommandInput = {
        TableName: SLOT_RESERVATIONS_TABLE,
        Item: {
          slotKey: testKey,
          examinationId: '__TEST_EXAMINATION__',
          claimantId: '__TEST_CLAIMANT__',
          examinerProfileId: testExaminerId,
          bookingTime: new Date().toISOString(),
          reservedAt: now,
          expiresAt: expiresAt,
        },
      };

      await dynamodb.send(new PutCommand(putParams));
      testResults.putItem = {
        status: 'success',
        message: 'Successfully wrote test item to DynamoDB',
      };
    } catch (error) {
      testResults.putItem = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown PutItem error',
      };
    }

    // Test 3: GetItem operation
    try {
      const getParams: GetCommandInput = {
        TableName: SLOT_RESERVATIONS_TABLE,
        Key: { slotKey: testKey },
      };

      const result = await dynamodb.send(new GetCommand(getParams));
      if (result.Item) {
        testResults.getItem = {
          status: 'success',
          message: 'Successfully retrieved test item from DynamoDB',
          data: {
            slotKey: result.Item.slotKey,
            examinerProfileId: result.Item.examinerProfileId,
            hasAllFields: !!(result.Item.examinationId && result.Item.claimantId),
          },
        };
      } else {
        testResults.getItem = {
          status: 'failed',
          error: 'Item not found after PutItem operation',
        };
      }
    } catch (error) {
      testResults.getItem = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown GetItem error',
      };
    }

    // Test 4: Query operation (using GSI)
    try {
      if (EXAMINER_PROFILE_ID_INDEX) {
        const queryParams: QueryCommandInput = {
          TableName: SLOT_RESERVATIONS_TABLE,
          IndexName: EXAMINER_PROFILE_ID_INDEX,
          KeyConditionExpression: 'examinerProfileId = :examinerId',
          ExpressionAttributeValues: {
            ':examinerId': testExaminerId,
          },
          Limit: 1,
        };

        const queryResult = await dynamodb.send(new QueryCommand(queryParams));
        testResults.query = {
          status: 'success',
          message: `Successfully queried GSI. Found ${queryResult.Items?.length || 0} item(s)`,
        };
      } else {
        testResults.query = {
          status: 'skipped',
          message: 'GSI index name not configured, skipping Query test',
        };
      }
    } catch (error) {
      testResults.query = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown Query error',
      };
    }

    // Test 5: DeleteItem operation (cleanup)
    try {
      const deleteParams: DeleteCommandInput = {
        TableName: SLOT_RESERVATIONS_TABLE,
        Key: { slotKey: testKey },
      };

      await dynamodb.send(new DeleteCommand(deleteParams));
      testResults.deleteItem = {
        status: 'success',
        message: 'Successfully deleted test item from DynamoDB',
      };
    } catch (error) {
      testResults.deleteItem = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown DeleteItem error',
      };
    }

    // Determine overall status
    const allTestsPassed =
      testResults.connection.status === 'success' &&
      testResults.putItem.status === 'success' &&
      testResults.getItem.status === 'success' &&
      testResults.deleteItem.status === 'success';

    const overallStatus = allTestsPassed ? 'success' : 'partial';

    log.info('[DynamoDB Validation] Test completed', {
      overallStatus,
      results: testResults,
    });

    return NextResponse.json(
      {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        message: allTestsPassed
          ? 'All DynamoDB operations validated successfully'
          : 'Some DynamoDB operations failed. Check individual test results.',
        results: testResults,
        config: {
          region: env.AWS_REGION || 'ca-central-1',
          tableName: SLOT_RESERVATIONS_TABLE || 'not set',
          indexName: EXAMINER_PROFILE_ID_INDEX || 'not set',
          hasCredentials: !!(env.AWS_DYNAMODB_ACCESS_KEY_ID && env.AWS_DYNAMODB_SECRET_ACCESS_KEY),
        },
      },
      {
        status: allTestsPassed ? 200 : 207, // 207 Multi-Status for partial success
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    log.error('[DynamoDB Validation] Unexpected error', error);

    return NextResponse.json(
      {
        status: 'failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        results: testResults,
        config: {
          region: env.AWS_REGION || 'ca-central-1',
          tableName: SLOT_RESERVATIONS_TABLE || 'not set',
          indexName: EXAMINER_PROFILE_ID_INDEX || 'not set',
          hasCredentials: !!(env.AWS_DYNAMODB_ACCESS_KEY_ID && env.AWS_DYNAMODB_SECRET_ACCESS_KEY),
        },
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

// Support HEAD requests for lightweight checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
