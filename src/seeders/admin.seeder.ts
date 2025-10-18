/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";  
import * as bcrypt from "bcrypt";
import { Roles } from "../constants/role";

interface AdminData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleName: string;
}

class AdminSeeder {
    private static instance: AdminSeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): AdminSeeder {
        if (!AdminSeeder.instance) {
            AdminSeeder.instance = new AdminSeeder(db);
        }
        return AdminSeeder.instance;
    }

    public async run() {
        console.log("🚀 Starting super admin and admin seed process...");

        const data: AdminData[] = [
            {
                firstName: "Super",
                lastName: "Admin",
                email: "superadmin@thriveassessmentcare.com",
                password: "super123", 
                roleName: Roles.SUPER_ADMIN,
            },
            {
                firstName: "Admin",
                lastName: "One",
                email: "admin1@thriveassessmentcare.com",
                password: "admin123",
                roleName: Roles.ADMIN,
            },
            {
                firstName: "Admin",
                lastName: "Two",
                email: "admin2@thriveassessmentcare.com",
                password: "admin123",
                roleName: Roles.ADMIN,
            },
            {
                firstName: "Admin",
                lastName: "Three",
                email: "admin3@thriveassessmentcare.com",
                password: "admin123",
                roleName: Roles.ADMIN,
            },
        ];

        await this.createAdmins(data);

        console.log("✅ Super admin and admins seed process completed.");
    }

    private async createAdmins(data: AdminData[]): Promise<void> {
        console.log(`📝 Processing ${data.length} admins...`);

        for (const adminData of data) {
            const { firstName, lastName, email, password, roleName } = adminData;

            console.log(`\n📦 Processing admin: "${email}"`);

            // Check if user already exists
            let existingUser = await this.db.user.findFirst({
                where: { email },
            });

            if (existingUser) {
                console.log(
                    `ℹ️ User already exists: "${email}" (ID: ${existingUser.id})`
                );
                continue;
            }

            // Ensure role exists
            let role = await this.db.role.findFirst({
                where: { name: roleName },
            });

            if (!role) {
                role = await this.db.role.create({
                    data: { name: roleName },
                });
                console.log(`✅ Created new role: "${roleName}"`);
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const newUser = await this.db.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                },
            });

            // Create account linked to role
            const account = await this.db.account.create({
                data: {
                    roleId: role.id,
                    userId: newUser.id,
                    isVerified: true,
                },
            });

            console.log(
                `✅ Created ${roleName}: "${email}" (User ID: ${newUser.id}, Account ID: ${account.id})`
            );
        }
    }
}

export default AdminSeeder;
