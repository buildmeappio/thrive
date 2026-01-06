-- CreateTable
CREATE TABLE "custom_variables" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "defaultValue" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_variables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_variables_key_key" ON "custom_variables"("key");
