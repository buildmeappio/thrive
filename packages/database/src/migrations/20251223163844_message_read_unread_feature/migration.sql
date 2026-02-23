-- CreateTable
CREATE TABLE "message_read_status" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "message_id" VARCHAR(255) NOT NULL,
    "read_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_read_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_read_status_user_id_idx" ON "message_read_status"("user_id");

-- CreateIndex
CREATE INDEX "message_read_status_message_id_idx" ON "message_read_status"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_read_status_user_id_message_id_key" ON "message_read_status"("user_id", "message_id");

-- AddForeignKey
ALTER TABLE "message_read_status" ADD CONSTRAINT "message_read_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
