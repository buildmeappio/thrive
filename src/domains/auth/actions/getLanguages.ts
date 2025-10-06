'use server';
import prisma from "@/lib/db";

const getLanguages = async () => {
	try {
		const languages = await prisma.language.findMany({
			where: {
				deletedAt: null,
			},
		});
		return languages;
	} catch (error) {
		console.error(error);
		throw new Error("Failed to get languages");
	}
};

export default getLanguages;  
  