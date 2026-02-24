/* eslint-disable no-console */
import { Departments } from '../constants/department';
import { PrismaClient } from '@thrive/database';

interface DepartmentData {
    name: string;
}

class DepartmentSeeder {
    private static instance: DepartmentSeeder | null = null;
    private db: PrismaClient;

    private constructor(db: PrismaClient) {
        this.db = db;
    }

    public static getInstance(db: PrismaClient): DepartmentSeeder {
        if (!DepartmentSeeder.instance) {
            DepartmentSeeder.instance = new DepartmentSeeder(db);
        }
        return DepartmentSeeder.instance;
    }

    public async run() {
        console.log('🚀 Starting organization departments seed process...');

        const data: DepartmentData[] = [
            {
                name: Departments.CLAIMS,
            },
            {
                name: Departments.LEGAL,
            },
            {
                name: Departments.HUMAN_RESOURCES,
            },
            {
                name: Departments.MEDICAL_OR_CLINICAL,
            },
            {
                name: Departments.CASE_MANAGEMENT,
            },
            {
                name: Departments.ADMINISTRATION,
            },
            {
                name: Departments.COMPLIANCE_OR_RISK,
            },
            {
                name: Departments.FINANCE_OR_BILLING,
            }
        ];

        await this.createDepartments(data);

        console.log('✅ Organization departments seed process completed.');
    }

    private async createDepartments(data: DepartmentData[]): Promise<void> {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('Organization department data must be a non-empty array');
        }

        console.log(`📝 Processing ${data.length} organization departments...`);

        for (const deptData of data) {
            const { name } = deptData;

            console.log(`\n📦 Processing organization department: "${name}"`);

            if (!name) {
                throw new Error('Organization department name is required');
            }

            let organizationDepartment = await this.db.department.findFirst({
                where: { name },
            });

            if (organizationDepartment) {
                console.log(
                    `ℹ️ Organization department already exists: "${organizationDepartment.name}" (ID: ${organizationDepartment.id})`,
                );
                continue;
            }

            organizationDepartment = await this.db.department.create({
                data: { name },
            });

            console.log(`✅ Created new organization department: "${organizationDepartment.name}" (ID: ${organizationDepartment.id})`);
        }
    }

    /**
     * Clean up old organization departments that are no longer in use
     * Use with caution - only run if you're sure old departments are not referenced anywhere
     */
    public async cleanupOldOrganizationDepartments() {
        console.log('🧹 Starting cleanup of old organization departments...');
        
        const currentDeptNames = Object.values(Departments);

        const oldDepartments = await this.db.department.findMany({
            where: {
                name: {
                    notIn: currentDeptNames,
                },
            },
        });

        if (oldDepartments.length === 0) {
            console.log('ℹ️ No old organization departments found to cleanup.');
            return;
        }

        console.log(`⚠️ Found ${oldDepartments.length} old organization departments that might need cleanup:`);
        oldDepartments.forEach(dept => {
            console.log(`   - "${dept.name}" (ID: ${dept.id})`);
        });

        console.log('⚠️ Manual cleanup required - please review and delete if safe.');
    }
}

export default DepartmentSeeder;