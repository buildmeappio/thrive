import prisma from "@/lib/db";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

// S3 client – AWS SDK will auto-resolve credentials from env vars or IAM role
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

async function streamToString(body: any): Promise<string> {
  if (!body) return "";
  if (typeof body.transformToString === "function") {
    return body.transformToString();
  }
  return await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    body.on("data", (chunk: Buffer) => chunks.push(chunk));
    body.on("error", reject);
    body.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
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
        Bucket: process.env.AWS_S3_BUCKET_NAME,
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
