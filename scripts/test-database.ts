import "dotenv/config";  // ✅ CRITICAL: Load environment variables
import prisma from "../src/lib/db";

async function testDatabase() {
  console.log("🔍 Testing Prisma Postgres connection...\n");

  try {
    // Test 1: Check connection
    console.log("✅ Testing database connection...");
    await prisma.$connect();
    console.log("✅ Connected to database!");

    // Test 2: Query existing data
    console.log("\n📋 Fetching users from database...");
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

    console.log(`✅ Found ${users.length} user(s):`);
    if (users.length > 0) {
      users.forEach((user) => {
        console.log(`   - ${user.firstName} ${user.lastName} (${user.email})`);
      });
    } else {
      console.log("   (No users found in database)");
    }

    // Test 3: Test database query performance
    console.log("\n⏱️  Testing query performance...");
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const duration = Date.now() - start;
    console.log(`✅ Query executed in ${duration}ms`);

    console.log("\n🎉 All tests passed! Your database is working perfectly.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
