/* eslint-disable no-console */
import { PrismaClient } from '@thrive/database';

interface CustomVariableData {
  key: string;
  defaultValue: string;
  description: string;
  isActive: boolean;
}

class CustomVariableSeeder {
  private static instance: CustomVariableSeeder | null = null;
  private db: PrismaClient;

  private constructor(db: PrismaClient) {
    this.db = db;
  }

  public static getInstance(db: PrismaClient): CustomVariableSeeder {
    if (!CustomVariableSeeder.instance) {
      CustomVariableSeeder.instance = new CustomVariableSeeder(db);
    }
    return CustomVariableSeeder.instance;
  }

  public async run() {
    console.log('🚀 Starting custom variables seed process...');

    const data: CustomVariableData[] = [
      // Thrive variables
      {
        key: 'thrive.company_name',
        defaultValue: 'Thrive IME Platform',
        description: 'Company name',
        isActive: true,
      },
      {
        key: 'thrive.company_address',
        defaultValue: '',
        description: 'Company address',
        isActive: true,
      },
      {
        key: 'thrive.logo',
        defaultValue: process.env.NEXT_PUBLIC_CDN_URL
          ? `${process.env.NEXT_PUBLIC_CDN_URL}/images/thriveLogo.png`
          : 'https://assets.thriveassessmentcare.com/images/thriveLogo.png',
        description: 'Company logo URL',
        isActive: true,
      },
      {
        key: 'thrive.terms_url',
        defaultValue: 'https://thriveassessmentcare.com/terms-conditons/',
        description: 'Terms and conditions URL',
        isActive: true,
      },
      {
        key: 'thrive.privacy_url',
        defaultValue: 'https://thriveassessmentcare.com/privacy-policy/',
        description: 'Privacy policy URL',
        isActive: true,
      },
      {
        key: 'thrive.copyright',
        defaultValue: `© Copyright ${new Date().getFullYear()} | Thrive Assessment & Care | All Rights Reserved`,
        description: 'Copyright message',
        isActive: true,
      },
      // Contract variables
      {
        key: 'contract.effective_date',
        defaultValue: '',
        description: 'Contract effective date',
        isActive: true,
      },
    ];

    await this.createCustomVariables(data);

    console.log('✅ Custom variables seed process completed.');
  }

  private async createCustomVariables(data: CustomVariableData[]): Promise<void> {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Custom variable data must be a non-empty array');
    }

    console.log(`📝 Processing ${data.length} custom variables...`);

    for (const variableData of data) {
      const { key, defaultValue, description, isActive } = variableData;

      console.log(`\n📦 Processing custom variable: "${key}"`);

      if (!key) {
        throw new Error('Custom variable key is required');
      }

      let customVariable = await this.db.customVariable.findFirst({
        where: { key },
      });

      if (customVariable) {
        console.log(
          `ℹ️ Custom variable already exists: "${customVariable.key}" (ID: ${customVariable.id})`
        );
        // Update existing variable to ensure it has the latest values
        customVariable = await this.db.customVariable.update({
          where: { id: customVariable.id },
          data: {
            defaultValue,
            description,
            isActive,
          },
        });
        console.log(`🔄 Updated custom variable: "${customVariable.key}"`);
        continue;
      }

      customVariable = await this.db.customVariable.create({
        data: {
          key,
          defaultValue,
          description,
          isActive,
        },
      });

      console.log(
        `✅ Created new custom variable: "${customVariable.key}" (ID: ${customVariable.id})`
      );
    }
  }
}

export default CustomVariableSeeder;
