"use server";

import prisma from "@/lib/db";

export const getDocumentByIdAction = async (
  documentId: string,
): Promise<{ success: boolean; data?: { name: string }; error?: string }> => {
  try {
    if (!documentId) {
      return {
        success: false,
        error: "Document ID is required",
      };
    }

    const document = await prisma.documents.findUnique({
      where: { id: documentId },
      select: { name: true },
    });

    if (!document) {
      return {
        success: false,
        error: "Document not found",
      };
    }

    return {
      success: true,
      data: { name: document.name },
    };
  } catch (error: unknown) {
    console.error("Error fetching document:", error);
    return {
      success: false,
      error:
        (error instanceof Error ? error.message : undefined) ||
        "Failed to fetch document",
    };
  }
};
