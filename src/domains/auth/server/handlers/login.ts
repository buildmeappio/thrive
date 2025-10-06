import prisma from "@/lib/db";
import { compare } from "bcryptjs";
import { RoleType } from "../../constants/roles";

const login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            accounts: {
                include: {
                    role: true,
                },
            },
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
        throw new Error("Invalid password");
    }

    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleName: user.accounts[0].role.name as RoleType,
        accountId: user.accounts[0].id,
    };
};

export default login;