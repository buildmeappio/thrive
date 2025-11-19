-- CreateTable
CREATE TABLE "public"."reports" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "consent_form_signed" BOOLEAN NOT NULL DEFAULT false,
    "lat_rule_acknowledgment" BOOLEAN NOT NULL DEFAULT false,
    "referral_questions_response" TEXT NOT NULL,
    "examiner_name" VARCHAR(255) NOT NULL,
    "professional_title" VARCHAR(255) NOT NULL,
    "date_of_report" DATE NOT NULL,
    "signature_type" VARCHAR(50),
    "signature_data" TEXT,
    "confirmation_checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_dynamic_sections" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "report_dynamic_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_documents" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "report_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reports_id_key" ON "public"."reports"("id");

-- CreateIndex
CREATE UNIQUE INDEX "reports_booking_id_key" ON "public"."reports"("booking_id");

-- CreateIndex
CREATE INDEX "reports_booking_id_idx" ON "public"."reports"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_dynamic_sections_id_key" ON "public"."report_dynamic_sections"("id");

-- CreateIndex
CREATE INDEX "report_dynamic_sections_report_id_idx" ON "public"."report_dynamic_sections"("report_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_documents_id_key" ON "public"."report_documents"("id");

-- CreateIndex
CREATE INDEX "report_documents_report_id_idx" ON "public"."report_documents"("report_id");

-- CreateIndex
CREATE INDEX "report_documents_document_id_idx" ON "public"."report_documents"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_documents_report_id_document_id_key" ON "public"."report_documents"("report_id", "document_id");

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."claimant_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_dynamic_sections" ADD CONSTRAINT "report_dynamic_sections_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_documents" ADD CONSTRAINT "report_documents_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_documents" ADD CONSTRAINT "report_documents_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
