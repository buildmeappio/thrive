import prisma from "@/lib/db";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getLatestContract(id: string) {
  try {
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
      },
    });

    if (!contract) {
      return null;
    }

    // Generate pre-signed URL for the PDF
    let presignedUrl = null;
    if (contract.unsignedPdfS3Key) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: contract.unsignedPdfS3Key,
      });

      // URL expires in 1 hour (3600 seconds)
      presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
    }

    return {
      ...contract,
      presignedPdfUrl: presignedUrl,
    };
  } catch (error) {
    console.error("Error fetching contract:", error);
    throw error;
  }
}
