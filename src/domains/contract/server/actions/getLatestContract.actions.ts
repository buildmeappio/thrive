import prisma from "@/lib/db";
import { GetObjectCommand, S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { S3StreamChunk } from "@/types/api";
import { ENV } from "@/constants/variables";

// S3 client configuration – credentials auto-resolved from env vars or IAM role
const s3Config: S3ClientConfig = {
  region: ENV.AWS_REGION!,
};

// Add credentials if available (for local development)
if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
  s3Config.credentials = {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  };
}

const s3Client = new S3Client(s3Config);

async function streamToString(
  body: S3StreamChunk | null | undefined,
): Promise<string> {
  if (!body) return "";

  // Check if it has transformToString method (AWS SDK v3)
  if (
    typeof (body as { transformToString?: () => Promise<string> })
      .transformToString === "function"
  ) {
    return await (
      body as { transformToString: () => Promise<string> }
    ).transformToString();
  }

  // If it's a Node.js stream
  if (
    typeof (
      body as {
        on?: (event: string, callback: (chunk: Buffer) => void) => void;
      }
    ).on === "function"
  ) {
    return await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      (
        body as {
          on: (event: string, callback: (chunk: Buffer) => void) => void;
        }
      ).on("data", (chunk: Buffer) => chunks.push(chunk));
      (
        body as {
          on: (event: string, callback: (error: Error) => void) => void;
        }
      ).on("error", reject);
      (body as { on: (event: string, callback: () => void) => void }).on(
        "end",
        () => resolve(Buffer.concat(chunks).toString("utf-8")),
      );
    });
  }

  // Fallback: try to convert Uint8Array or Buffer to string
  if (body instanceof Uint8Array || Buffer.isBuffer(body)) {
    return Buffer.from(body).toString("utf-8");
  }

  return "";
}

export async function getLatestContract(id: string) {
  try {
    // Fetch contract from database
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        examinerProfile: {
          include: {
            account: {
              include: {
                user: true,
              },
            },
          },
        },
        application: true, // Include application for contract signing
      },
    });

    if (!contract) {
      return null;
    }

    // Fetch HTML content for the contract
    let contractHtml: string | null = null;
    const htmlKey = contract.signedHtmlS3Key || contract.unsignedHtmlS3Key;
    if (htmlKey) {
      const htmlCommand = new GetObjectCommand({
        Bucket: ENV.AWS_S3_BUCKET!,
        Key: htmlKey,
      });
      const htmlResponse = await s3Client.send(htmlCommand);
      contractHtml = await streamToString(htmlResponse.Body);
    }

    return {
      ...contract,
      contractHtml,
    };
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw error;
  }
}
