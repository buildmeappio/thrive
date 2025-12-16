/*
  Warnings:

  - A unique constraint covering the columns `[user_id,role_id]` on the table `accounts` will be added. If there are existing duplicate values, this will fail.

*/

-- Delete duplicate records, keeping only the first occurrence (lowest id) for each (user_id, role_id) combination
DELETE FROM "accounts"
WHERE "id" IN (
  SELECT "id"
  FROM (
    SELECT 
      "id",
      ROW_NUMBER() OVER (
        PARTITION BY "user_id", "role_id" 
        ORDER BY "id" ASC
      ) AS row_num
    FROM "accounts"
  ) t
  WHERE t.row_num > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_user_id_role_id_key" ON "accounts"("user_id", "role_id");
