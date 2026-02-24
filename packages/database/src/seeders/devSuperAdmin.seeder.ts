/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';
import * as bcrypt from 'bcryptjs';
import { Roles } from '../constants/role';

interface DevSuperAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleName: string;
}

class DevSuperAdminSeeder {
  private static instance: DevSuperAdminSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): DevSuperAdminSeeder {
    if (!DevSuperAdminSeeder.instance) {
      DevSuperAdminSeeder.instance = new DevSuperAdminSeeder(db);
    }
    return DevSuperAdminSeeder.instance;
  }

  public async run() {
    // Check if we're in development environment
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();
    const environment = process.env.ENVIRONMENT?.toLowerCase();

    // Allow if NODE_ENV is 'development' or 'dev', or ENVIRONMENT is 'dev' or 'development'
    const isDevelopment =
      nodeEnv === 'development' ||
      nodeEnv === 'dev' ||
      environment === 'dev' ||
      environment === 'development';

    if (!isDevelopment) {
      console.log(
        `⏭️  Skipping DevSuperAdminSeeder - not in development environment (NODE_ENV: ${nodeEnv || 'not set'}, ENVIRONMENT: ${environment || 'not set'})`
      );
      return;
    }

    console.log('🚀 Starting dev super admin seed process...');

    const data: DevSuperAdminData = {
      firstName: 'Imran',
      lastName: 'Admin',
      email: 'imran@thriveassessmentcare.com',
      password: 'super123', // Change this to a secure password
      roleName: Roles.SUPER_ADMIN,
    };

    await this.createDevSuperAdmin(data);

    console.log('✅ Dev super admin seed process completed.');
  }

  private async createDevSuperAdmin(data: DevSuperAdminData): Promise<void> {
    const { firstName, lastName, email, password, roleName } = data;

    console.log(`\n📦 Processing dev super admin: "${email}"`);

    // Check if user already exists
    let existingUser = await this.db.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      console.log(`ℹ️ User already exists: "${email}" (ID: ${existingUser.id})`);
      return;
    }

    // Ensure role exists
    let role = await this.db.role.findFirst({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role "${roleName}" does not exist. Please run RoleSeeder first.`);
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
      `✅ Created dev super admin: "${email}" (User ID: ${newUser.id}, Account ID: ${account.id})`
    );
  }
}

export default DevSuperAdminSeeder;
