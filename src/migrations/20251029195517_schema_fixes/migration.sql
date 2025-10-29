-- DropForeignKey
ALTER TABLE "public"."availability_providers" DROP CONSTRAINT "availability_providers_chaperone_ref_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."availability_providers" DROP CONSTRAINT "availability_providers_examiner_ref_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."availability_providers" DROP CONSTRAINT "availability_providers_interpreter_ref_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."availability_providers" DROP CONSTRAINT "availability_providers_transporter_ref_id_fkey";
