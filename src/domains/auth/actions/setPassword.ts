'use server';

import prisma from "@/lib/db";
import { verifyPasswordToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

type SetPasswordInput = {
	password: string;
	confirmPassword: string;
	token: string;
}

type Payload = {
	email: string;
	id: string;
	accountId: string;
	role: string;
}

const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, 10);
};

const setPassword = async (payload: SetPasswordInput) => {
	try {

		const data = await verifyPasswordToken(payload.token) as Payload;

		if (!data) {
			return {
				success: false,
				message: 'Invalid token',
			};
		}

		if (payload.password !== payload.confirmPassword) {
			return {
				success: false,
				message: 'Passwords do not match',
			};
		}

		const hashedPassword = await hashPassword(payload.password);

		const user = await prisma.user.update({
			where: {
				id: data.id,
			},
			data: {
				password: hashedPassword,
			},
		});

		await prisma.account.update({
			where: {
				id: data.accountId,
			},
			data: {
				isVerified: true,
				updatedAt: new Date(),
			},
		});

		return {
			success: true,
			message: 'Password set successfully',
			data: user,
		};
	} catch (error) {
		let message = 'Failed to set password';
		if (error instanceof Error) {
			message = error.message;
		}
		return {
			success: false,
			message: message,
		};
	}
};

export default setPassword;
