import prisma from '@/lib/db';
import { getPresignedUrlFromS3 } from '@/lib/s3';

class ProfilePhotoService {
  async getProfilePhotoUrl(profilePhotoId: string): Promise<string | null> {
    try {
      const document = await prisma.documents.findUnique({
        where: { id: profilePhotoId },
        select: { name: true },
      });

      if (!document) {
        return null;
      }

      // Get presigned URL from S3 (expires in 1 hour)
      const result = await getPresignedUrlFromS3(document.name, 3600);

      if (!result.success) {
        console.error('Error generating presigned URL:', result.error);
        return null;
      }

      return result.url;
    } catch (error) {
      console.error('Error fetching profile photo URL:', error);
      return null;
    }
  }
}

const profilePhotoService = new ProfilePhotoService();
export default profilePhotoService;
