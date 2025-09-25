/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `examination_types` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "examination_types_name_key" ON "public"."examination_types"("name");
