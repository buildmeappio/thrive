import prisma from "@/lib/db";
import { ENV } from "@/constants/variables";

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

      const cdnUrl = ENV.NEXT_PUBLIC_CDN_URL;
      if (!cdnUrl) {
        return null;
      }

      // The document name already includes the unique timestamp
      return `${cdnUrl}/documents/examiner/${document.name}`;
    } catch (error) {
      console.error("Error fetching profile photo URL:", error);
      return null;
    }
  }
}

const profilePhotoService = new ProfilePhotoService();
export default profilePhotoService;
