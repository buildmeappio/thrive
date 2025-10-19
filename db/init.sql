--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ClaimantPreference; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ClaimantPreference" AS ENUM (
    'IN_PERSON',
    'VIRTUAL',
    'EITHER'
);


--
-- Name: ExaminationSecureLinkStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ExaminationSecureLinkStatus" AS ENUM (
    'PENDING',
    'SUBMITTED',
    'INVALID'
);


--
-- Name: ExaminerStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ExaminerStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'INFO_REQUESTED'
);


--
-- Name: OrganizationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrganizationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);


--
-- Name: TimeBand; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TimeBand" AS ENUM (
    'MORNING',
    'AFTERNOON',
    'EVENING',
    'EITHER'
);


--
-- Name: UrgencyLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UrgencyLevel" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: _prisma_seeds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_seeds (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    run_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounts (
    id uuid NOT NULL,
    role_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.addresses (
    id uuid NOT NULL,
    address text NOT NULL,
    street character varying(255),
    province character varying(255),
    city character varying(255),
    postal_code character varying(255),
    suite character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: case_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_documents (
    id uuid NOT NULL,
    case_id uuid NOT NULL,
    document_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: case_statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_statuses (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: case_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_types (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cases (
    id uuid NOT NULL,
    organization_id uuid,
    claimant_id uuid NOT NULL,
    insurance_id uuid,
    legal_representative_id uuid,
    case_type_id uuid,
    reason character varying(255),
    consent_for_submission boolean DEFAULT false NOT NULL,
    is_draft boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: claim_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claim_types (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: claimant_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claimant_availability (
    id uuid NOT NULL,
    examination_id uuid NOT NULL,
    claimant_id uuid NOT NULL,
    preference public."ClaimantPreference" NOT NULL,
    accessibility_notes text,
    consent_ack boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: claimant_availability_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claimant_availability_slots (
    id uuid NOT NULL,
    availability_id uuid NOT NULL,
    date date NOT NULL,
    start_time character varying(255) NOT NULL,
    end_time character varying(255) NOT NULL,
    start timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL,
    time_band public."TimeBand" NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: claimants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claimants (
    id uuid NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    date_of_birth date,
    gender character varying(50),
    phone_number character varying(255),
    email_address character varying(255),
    related_cases_details text,
    family_doctor_name character varying(255),
    family_doctor_email_address character varying(255),
    family_doctor_phone_number character varying(255),
    family_doctor_fax_number character varying(255),
    address_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    claim_type_id uuid NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    size integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    display_name character varying(255)
);


--
-- Name: examination_interpreter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examination_interpreter (
    id uuid NOT NULL,
    examination_service_id uuid NOT NULL,
    language_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examination_secure_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examination_secure_links (
    id uuid NOT NULL,
    examination_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    last_opened_at timestamp with time zone,
    submitted_at timestamp with time zone,
    status public."ExaminationSecureLinkStatus" DEFAULT 'PENDING'::public."ExaminationSecureLinkStatus" NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examination_selected_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examination_selected_benefits (
    id uuid NOT NULL,
    examination_id uuid NOT NULL,
    benefit_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examination_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examination_services (
    id uuid NOT NULL,
    examination_id uuid NOT NULL,
    type character varying(255) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examination_transport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examination_transport (
    id uuid NOT NULL,
    examination_service_id uuid NOT NULL,
    pickup_address_id uuid,
    raw_lookup text,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examination_type_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examination_type_benefits (
    id uuid NOT NULL,
    examination_type_id uuid NOT NULL,
    benefit character varying(500) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examination_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examination_types (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    short_form character varying(255),
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examinations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examinations (
    id uuid NOT NULL,
    case_number character varying(255) NOT NULL,
    case_id uuid NOT NULL,
    examination_type_id uuid NOT NULL,
    due_date timestamp with time zone,
    notes text,
    additional_notes text,
    urgency_level public."UrgencyLevel",
    examiner_id uuid,
    status_id uuid NOT NULL,
    preference public."ClaimantPreference" NOT NULL,
    support_person boolean DEFAULT false NOT NULL,
    assign_to_id uuid,
    assigned_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examiner_languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examiner_languages (
    id uuid NOT NULL,
    examiner_profile_id uuid NOT NULL,
    language_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


--
-- Name: examiner_override_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examiner_override_hours (
    id uuid NOT NULL,
    examiner_profile_id uuid NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examiner_override_time_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examiner_override_time_slots (
    id uuid NOT NULL,
    override_hour_id uuid NOT NULL,
    start_time character varying(20) NOT NULL,
    end_time character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examiner_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examiner_profiles (
    id uuid NOT NULL,
    account_id uuid NOT NULL,
    province_of_residence character varying(255) NOT NULL,
    mailing_address text NOT NULL,
    specialties text[],
    license_number character varying(255) NOT NULL,
    province_of_licensure character varying(255) NOT NULL,
    license_expiry_date date,
    medical_license_document_id uuid NOT NULL,
    resume_document_id uuid NOT NULL,
    nda_document_id uuid,
    insurance_document_id uuid,
    is_forensic_assessment_trained boolean NOT NULL,
    years_of_ime_experience character varying(255) NOT NULL,
    bio text NOT NULL,
    is_consent_to_background_verification boolean NOT NULL,
    agree_to_terms boolean NOT NULL,
    status public."ExaminerStatus" DEFAULT 'PENDING'::public."ExaminerStatus" NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejected_by uuid,
    rejected_at timestamp with time zone,
    rejected_reason text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    accept_virtual_assessments boolean,
    max_travel_distance character varying(255),
    preferred_regions character varying(255),
    activation_step character varying(255),
    assessment_types text[],
    advance_booking character varying(20),
    buffer_time character varying(20),
    account_number character varying(12),
    cheque_mailing_address text,
    institution_number character varying(3),
    interac_email character varying(255),
    payout_method character varying(20),
    transit_number character varying(5)
);


--
-- Name: examiner_weekly_hours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examiner_weekly_hours (
    id uuid NOT NULL,
    examiner_profile_id uuid NOT NULL,
    day_of_week character varying(20) NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: examiner_weekly_time_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.examiner_weekly_time_slots (
    id uuid NOT NULL,
    weekly_hour_id uuid NOT NULL,
    start_time character varying(20) NOT NULL,
    end_time character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: insurances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insurances (
    id uuid NOT NULL,
    email_address character varying(255) NOT NULL,
    company_name character varying(255) NOT NULL,
    contact_person character varying(255) NOT NULL,
    policy_number character varying(255) NOT NULL,
    claim_number character varying(255) NOT NULL,
    date_of_loss timestamp with time zone NOT NULL,
    policy_holder_is_claimant boolean DEFAULT false NOT NULL,
    policy_holder_first_name character varying(255) NOT NULL,
    policy_holder_last_name character varying(255) NOT NULL,
    phone_number character varying(255) NOT NULL,
    fax_number character varying(255) NOT NULL,
    address_id uuid
);


--
-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: legal_representatives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_representatives (
    id uuid NOT NULL,
    company_name character varying(255),
    contact_person character varying(255),
    phone_number character varying(255),
    fax_number character varying(255),
    address_id uuid
);


--
-- Name: organization_managers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_managers (
    id uuid NOT NULL,
    organization_id uuid NOT NULL,
    account_id uuid NOT NULL,
    job_title character varying(255),
    department_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: organization_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_types (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid NOT NULL,
    type_id uuid NOT NULL,
    address_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    website character varying(255),
    is_authorized boolean DEFAULT false NOT NULL,
    data_sharing_consent boolean DEFAULT false NOT NULL,
    agree_to_terms_and_privacy boolean DEFAULT false NOT NULL,
    status public."OrganizationStatus" DEFAULT 'PENDING'::public."OrganizationStatus" NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejected_by uuid,
    rejected_at timestamp with time zone,
    rejected_reason text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    phone character varying(255),
    gender character varying(255),
    date_of_birth timestamp with time zone,
    profile_photo_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: verification_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.verification_codes (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    account_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
42ce2c89-0918-48fc-9e7a-4601ac8076f4	fe63f7d02d1ea4e38cb83cbd45e52d7e76f801a8827c9251a147a17cbf60f005	2025-10-15 17:36:16.033027+00	20251015153148_added_fields_of_examiner_profile	\N	\N	2025-10-15 17:36:15.981584+00	1
3189a8fc-6b01-4c3a-a022-afb7fb930cd6	c78853bff1dc5c7de070f36f3204c193a3c1c798c7e65c6b8df7fa7ae0f715a3	2025-10-14 15:21:59.134037+00	20250925173448_initial_migration	\N	\N	2025-10-14 15:21:58.938419+00	1
9b8de4bb-28d3-445a-9902-6f11d71164ee	c623caf5eab079e2ebb428524d1fba6bd484a8fd262f4e18f804c7c797b23cc2	2025-10-14 15:21:59.150311+00	20250925175034_making_examination_type_name_unique	\N	\N	2025-10-14 15:21:59.137768+00	1
5277c684-7840-4558-96c6-4497168de6e2	dfb830ec6eb8406738b851c46143705a0bf86fc05a1f42e2a394191a5b185284	2025-10-14 15:21:59.177701+00	20250925202842_medical_examiner	\N	\N	2025-10-14 15:21:59.153633+00	1
db893672-acac-49eb-87eb-bd814de3bd58	209f6247befea39ca489436fbba2b1ed28d1c72a8112f13a0b00ac3385b4aeb4	2025-10-15 22:54:35.669476+00	20251015225107_added_availability_fields_for_examiner_onboarding	\N	\N	2025-10-15 22:54:35.627324+00	1
e36f9635-efdb-4032-bfb4-a667237aef4d	061cf6d9a575dd77842360520304223dee8a6cb5b0e286b2d641371f318a57a9	2025-10-14 15:21:59.196681+00	20250926143448_remove_case_number_unique	\N	\N	2025-10-14 15:21:59.181054+00	1
7994fadd-7987-41f8-b56e-accc844a44aa	f2650156b2bb92316149a612a4c27ce7a211c3775e643bf0c4ecad4a5d617819	2025-10-14 15:21:59.217938+00	20251001135245_adding_claim_type	\N	\N	2025-10-14 15:21:59.200263+00	1
36da5dd3-bd67-4a99-a71b-3d032039cc96	22210920c47f61babca3d5eed90970b4f846597bdeb19953d481e34eb782ef04	2025-10-14 15:21:59.253131+00	20251005233652_addin_examination_type_benefits	\N	\N	2025-10-14 15:21:59.221581+00	1
9f3f4fe7-08ae-4df0-9dd9-2fe920a33bd7	5ed130ba9c92c7051321f848b5cacefda6b00ecdd6df8b0bebbaa5c5ce6af177	2025-10-16 00:05:06.950974+00	20251016000228_added_payout_fields_for_examiner	\N	\N	2025-10-16 00:05:06.935368+00	1
598c496a-0128-4640-87bc-0f2331bcbab3	bed63dbe71436d7f6f76bde006536137b876ef8e294f3cabe0714e55f2826f74	2025-10-14 15:21:59.265368+00	20251006173258_making_password_optional	\N	\N	2025-10-14 15:21:59.256454+00	1
adcebe59-fd74-4e1c-8c3c-f66af8ed5df5	1fd703535ab4cbf08a6ca5f886d02fa8b34fa2f50537ab64793871ebbac02a8e	2025-10-14 15:21:59.283503+00	20251007224338_years_of_ime_experience_in_string	\N	\N	2025-10-14 15:21:59.268759+00	1
69616894-03c6-499b-93d3-8656ca72263a	0c6807868ce5feee2a5d6ff106a6de015bcd1ebcfe58cde1770086050131a403	2025-10-14 15:21:59.296034+00	20251007231627_licence_expiry_date_optional	\N	\N	2025-10-14 15:21:59.28698+00	1
5bc1d809-d01b-4158-a7f7-5880fd9e0532	17b7c4ad9040b6d383fe79088ccc740942c462f49bd9a83087cded3bfb889c47	2025-10-14 15:21:59.310798+00	20251008191637_field_optionals_in_examiner	\N	\N	2025-10-14 15:21:59.299565+00	1
2ebe40d9-85f1-40eb-b852-f3380030ace2	0d00cc07b7d58b7f498516292538e6c4a984a9a263b56bae386de055418f7735	2025-10-14 15:21:59.323125+00	20251010192806_added_examiner_status	\N	\N	2025-10-14 15:21:59.314137+00	1
766ee330-ada0-4903-8632-d3e73c07d434	954e4ec402c52fe6805980bd444024cfac35dd2b7498d111d06806079ee49fe0	2025-10-14 15:21:59.335451+00	20251010221851_add_availabilty_field_for_examiner	\N	\N	2025-10-14 15:21:59.326508+00	1
\.


--
-- Data for Name: _prisma_seeds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_seeds (id, name, run_at, created_at, updated_at, deleted_at) FROM stdin;
eb8b82fc-83d1-4e32-b3df-8c9ba2ce4909	RoleSeeder	2025-10-14 16:54:27.66+00	2025-10-14 16:54:27.661+00	2025-10-14 16:54:27.661+00	\N
ee25b340-533b-4c82-bb8e-6bb8900999eb	OrganizationTypeSeeder	2025-10-14 16:54:27.746+00	2025-10-14 16:54:27.746+00	2025-10-14 16:54:27.746+00	\N
f4804778-d204-45e4-a3c8-26f0cfe5abf6	DepartmentSeeder	2025-10-14 16:54:27.831+00	2025-10-14 16:54:27.832+00	2025-10-14 16:54:27.832+00	\N
c97f9727-ddf4-4b86-99e2-e545c0ae91d6	AdminSeeder	2025-10-14 16:54:28.992+00	2025-10-14 16:54:28.993+00	2025-10-14 16:54:28.993+00	\N
4f735211-3cfb-474a-b9cb-b0ddc0cabf38	CaseTypeSeeder	2025-10-14 16:54:29.1+00	2025-10-14 16:54:29.101+00	2025-10-14 16:54:29.101+00	\N
c1a18578-4b2c-44b5-9915-455391262d73	CaseStatusSeeder	2025-10-14 16:54:29.122+00	2025-10-14 16:54:29.123+00	2025-10-14 16:54:29.123+00	\N
28dc94d1-3047-4f67-b2a1-090c65a4b570	LanguageSeeder	2025-10-14 16:54:29.152+00	2025-10-14 16:54:29.153+00	2025-10-14 16:54:29.153+00	\N
74d65a8f-3060-45d2-8f13-c8a5135595f3	ExaminationTypeSeeder	2025-10-14 16:54:29.254+00	2025-10-14 16:54:29.257+00	2025-10-14 16:54:29.257+00	\N
e979dc79-4817-4108-a180-970bab5ec1af	ExaminationTypeShortFormSeeder	2025-10-14 16:54:29.329+00	2025-10-14 16:54:29.331+00	2025-10-14 16:54:29.331+00	\N
1957ce34-9a3b-4fe2-a49a-ea874e39d1b9	ClaimTypeSeeder	2025-10-14 16:54:29.446+00	2025-10-14 16:54:29.447+00	2025-10-14 16:54:29.447+00	\N
02bdec33-9d99-4246-a89b-bd3dc765d447	ExaminationTypeBenefitSeeder	2025-10-14 16:54:30.031+00	2025-10-14 16:54:30.032+00	2025-10-14 16:54:30.032+00	\N
ce9fb846-1276-4bd6-9904-50b851131bf2	ExaminerProfileSeeder	2025-10-14 16:54:31.347+00	2025-10-14 16:54:31.348+00	2025-10-14 16:54:31.348+00	\N
7aa6269e-f540-4320-9a6d-46fe7552b83c	CasesSeeder	2025-10-14 16:54:32.157+00	2025-10-14 16:54:32.158+00	2025-10-14 16:54:32.158+00	\N
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.accounts (id, role_id, user_id, is_verified, created_at, updated_at, deleted_at) FROM stdin;
602f59f5-67e8-4a13-a39b-f63709bdcddd	93ade192-d54e-487f-9131-5a49de81501f	c2e40e75-1e77-4072-8b9c-345e78dbf7a4	t	2025-10-14 16:54:28.109+00	2025-10-14 16:54:28.109+00	\N
ac6fbb84-4a54-415e-a6d4-dcee31b35b61	4ec5b811-f464-474b-bcc6-d96eb0236c0a	693b5a3e-f9da-499f-a021-f0aeae45f0ab	t	2025-10-14 16:54:28.401+00	2025-10-14 16:54:28.401+00	\N
06ef5fbf-9548-43f7-871c-6a82169e28cd	4ec5b811-f464-474b-bcc6-d96eb0236c0a	1c5ef6f1-24fe-48e7-acb1-d24a92e1d0e1	t	2025-10-14 16:54:28.7+00	2025-10-14 16:54:28.7+00	\N
40f9612e-cafd-4402-b3bd-4b9ebf72493e	4ec5b811-f464-474b-bcc6-d96eb0236c0a	d659e6e7-c386-4215-a673-f66fdf9ac3b7	t	2025-10-14 16:54:28.92+00	2025-10-14 16:54:28.92+00	\N
e4a69daf-474c-4847-8ddd-e351d6ae3197	1276f657-4f35-40a3-8f79-71e7105b7567	66138c14-e5fa-4f27-a638-a3986d968995	t	2025-10-14 16:54:30.302+00	2025-10-14 16:54:30.302+00	\N
b159817e-ef1f-4bd9-9584-f07989889639	1276f657-4f35-40a3-8f79-71e7105b7567	147d1895-3d75-429f-aa51-11c44b1f0855	t	2025-10-14 16:54:30.612+00	2025-10-14 16:54:30.612+00	\N
cf1caa36-6dc9-48c9-b601-41ce0afb321e	1276f657-4f35-40a3-8f79-71e7105b7567	492b61fa-0f57-484c-8207-ba1633e05567	f	2025-10-14 16:54:30.917+00	2025-10-14 16:54:30.917+00	\N
643b0534-b5e9-485a-9cef-701d21e91c75	1276f657-4f35-40a3-8f79-71e7105b7567	46fcdf70-e519-4c9e-bb6e-0126fe993667	f	2025-10-14 16:54:31.303+00	2025-10-14 16:54:31.303+00	\N
58e53ddd-5feb-4201-affb-72a01401b857	ec2f6571-21ec-4119-a846-30ba8575eb2c	64c5acf7-3f0d-46b7-9a15-d09c3643b3d5	f	2025-10-16 18:56:46.955+00	2025-10-16 18:56:46.955+00	\N
e498baeb-f56c-4f38-b1b2-5285b9582d72	ec2f6571-21ec-4119-a846-30ba8575eb2c	1fa84e94-f3a0-4bfe-afa2-5b5654dfe66b	f	2025-10-16 18:56:58.192+00	2025-10-16 18:56:58.192+00	\N
901412ad-c2fc-4c8b-9b44-a4f5f1f0455e	ec2f6571-21ec-4119-a846-30ba8575eb2c	a237dfd0-fd43-43fe-98e2-fe7e96c2f6a0	f	2025-10-16 18:58:36.499+00	2025-10-16 18:58:36.499+00	\N
3094b241-4690-4498-8639-bc15439a5ae9	ec2f6571-21ec-4119-a846-30ba8575eb2c	b4a9200a-f058-468e-8a0c-e03431b16c69	f	2025-10-16 18:59:36.915+00	2025-10-16 18:59:36.915+00	\N
f50a790b-d2d3-4cd0-9dcb-acdb89660b2e	ec2f6571-21ec-4119-a846-30ba8575eb2c	26f9f2ab-d08a-49e0-825e-6bb7c9f056eb	f	2025-10-16 19:52:26.077+00	2025-10-16 19:52:26.077+00	\N
fe7cc7bc-e6f2-41d7-a047-d23dd62fbb24	1276f657-4f35-40a3-8f79-71e7105b7567	00cab179-0cb0-4203-bcfb-f31e083c18ca	f	2025-10-16 23:07:29.648+00	2025-10-16 23:07:29.648+00	\N
860816bd-1068-4f8b-b58a-686c222b84fd	1276f657-4f35-40a3-8f79-71e7105b7567	0610fa1a-9c4c-4260-a0f6-8a646fd16976	f	2025-10-16 23:47:20.126+00	2025-10-16 23:47:20.126+00	\N
698ac4fc-b8ab-4e04-96eb-b3fd92fc84e2	1276f657-4f35-40a3-8f79-71e7105b7567	28e8cdfd-60c9-4132-8623-fa3e57b3cac7	t	2025-10-16 23:28:12.231+00	2025-10-17 00:53:16.872+00	\N
d98e2a41-d7f0-499a-9b96-8cedb2fcd4b5	ec2f6571-21ec-4119-a846-30ba8575eb2c	fed0e82b-88cd-495e-bdd9-49da9230800d	f	2025-10-17 10:53:40.377+00	2025-10-17 10:53:40.377+00	\N
44495be7-50bb-4d55-9a28-1708872a8f1e	ec2f6571-21ec-4119-a846-30ba8575eb2c	34afdce9-ab9b-4333-8af5-29556445ea2b	f	2025-10-17 13:58:57.852+00	2025-10-17 13:58:57.852+00	\N
db8738dc-45f1-45f6-be81-105d0a077c37	ec2f6571-21ec-4119-a846-30ba8575eb2c	a42124b2-f526-4893-b27f-cc39511b0de4	f	2025-10-17 14:31:03.269+00	2025-10-17 14:31:03.269+00	\N
957b29e7-18b3-4953-a471-b112d905c597	1276f657-4f35-40a3-8f79-71e7105b7567	87f5bfe9-baa9-471b-a076-9347e728de5a	f	2025-10-17 14:56:00.954+00	2025-10-17 14:56:00.954+00	\N
d1947da1-a329-4a5c-b1f0-0b492b6f1de9	ec2f6571-21ec-4119-a846-30ba8575eb2c	c3e1a50b-b117-4054-abfc-451a7dfe45b1	f	2025-10-17 14:58:39.17+00	2025-10-17 14:58:39.17+00	\N
5e89636d-d9a6-4001-88e3-e56b0069d185	1276f657-4f35-40a3-8f79-71e7105b7567	01e2c81a-14ed-46ff-a576-eae3b6e61e6b	t	2025-10-17 15:19:24.1+00	2025-10-17 15:24:49.796+00	\N
22f4a82c-5f4d-4fa4-984a-209ed8fb4fa7	ec2f6571-21ec-4119-a846-30ba8575eb2c	1124cbd8-4284-47fe-bcf8-cec6948e3262	f	2025-10-17 17:13:09.763+00	2025-10-17 17:13:09.763+00	\N
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.addresses (id, address, street, province, city, postal_code, suite, created_at, updated_at, deleted_at) FROM stdin;
d611719a-0321-4b64-a516-3fd624939a1e	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:31.442+00	2025-10-14 16:54:31.442+00	\N
df6feb21-0b42-4c65-a9dc-5e5e8f2722e1	100 King Street West	\N	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:31.491+00	2025-10-14 16:54:31.491+00	\N
18b62a1f-17d1-4efb-98e2-689eec9e7a76	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:31.535+00	2025-10-14 16:54:31.535+00	\N
1a1aee06-e34b-45a0-96d6-9376c1bfbade	789 Burrard Street	\N	British Columbia	Vancouver	M5H 2N2	\N	2025-10-14 16:54:31.548+00	2025-10-14 16:54:31.548+00	\N
7afd2bf6-5a6a-4f3a-995c-b0ef484ca499	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:31.616+00	2025-10-14 16:54:31.616+00	\N
deb71f03-5b22-4443-b1d7-6dbc1a724181	555 5th Avenue SW	\N	Alberta	Calgary	M5H 2N2	\N	2025-10-14 16:54:31.633+00	2025-10-14 16:54:31.633+00	\N
e8c16f1e-c4e7-468f-ad18-9866a8a2953a	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:31.696+00	2025-10-14 16:54:31.696+00	\N
5ab5ced8-4feb-43b4-bc57-2369b1616d55	200 Hurontario Street	\N	Ontario	Mississauga	M5H 2N2	\N	2025-10-14 16:54:31.705+00	2025-10-14 16:54:31.705+00	\N
4ed2c198-4dac-4422-b96c-0213d0efd276	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:31.812+00	2025-10-14 16:54:31.812+00	\N
4156f951-700d-4059-8057-4ffd13dfc62f	150 Elgin Street	\N	Ontario	Ottawa	M5H 2N2	\N	2025-10-14 16:54:31.823+00	2025-10-14 16:54:31.823+00	\N
be5bc48f-7662-4436-81d4-b4e241c16d4f	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:31.898+00	2025-10-14 16:54:31.898+00	\N
0c3120d9-b511-4d12-bb5a-2d0fdfddbbcc	50 Main Street North	\N	Ontario	Brampton	M5H 2N2	\N	2025-10-14 16:54:31.907+00	2025-10-14 16:54:31.907+00	\N
faca24cd-972f-4590-96a8-cab91e8f4483	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:31.939+00	2025-10-14 16:54:31.939+00	\N
ac24a9f4-28d1-4767-b2f2-52aad7b554e5	300 James Street South	\N	Ontario	Hamilton	M5H 2N2	\N	2025-10-14 16:54:31.949+00	2025-10-14 16:54:31.949+00	\N
0e0e4ee3-eba9-4467-9b63-8656241a346a	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:32.022+00	2025-10-14 16:54:32.022+00	\N
50e96408-e544-45ec-8f91-7d706869b459	7000 Warden Avenue	\N	Ontario	Markham	M5H 2N2	\N	2025-10-14 16:54:32.034+00	2025-10-14 16:54:32.034+00	\N
dc98010a-c378-4c8b-9e84-2dd7d78ef163	Corporate Office	Main Street	Ontario	Toronto	M5H 2N2	\N	2025-10-14 16:54:32.104+00	2025-10-14 16:54:32.104+00	\N
86de0bf8-f438-4ffb-9343-149a273a0cef	10 Centre Street	\N	Ontario	Richmond Hill	M5H 2N2	\N	2025-10-14 16:54:32.116+00	2025-10-14 16:54:32.116+00	\N
2bfc7960-434b-40a5-acdb-2568b0641d1e	123 Queen St W, Toronto, ON M5H 3M9, Canada	123 Queen Street West	Manitoba	Toronto	M5H 3M9	203	2025-10-16 18:56:46.932+00	2025-10-16 18:56:46.932+00	\N
ee34a3cf-4c00-4c40-9e74-1070cfe97d31	ssssss	ssss		ssss	A1A1A1	32	2025-10-16 18:56:58.18+00	2025-10-16 18:56:58.18+00	\N
d0e44b56-4787-4e2c-9648-b777955b4e56	Eaque commodi labore	Shje	Nova Scotia	Toronto	A1A1A1	402	2025-10-16 18:58:36.487+00	2025-10-16 18:58:36.487+00	\N
e9f0a8fe-6df5-480a-bfe3-eb51aec92254	Sunt qui doloremque 	A eos consequatur f	Prince Edward Island	Maiores vitae fuga 	A1A 1A1	Fugiat in aliquip Na	2025-10-16 18:59:36.903+00	2025-10-16 18:59:36.903+00	\N
07bdecd2-4a75-4914-9255-d259510b8204	235 Queens Quay W, Toronto, ON M5J 2G8, Canada	235 Queens Quay West	ON	Toronto	M5J 2G8	502	2025-10-16 19:52:26.056+00	2025-10-16 19:52:26.056+00	\N
2ac8365b-015e-4263-856b-c775be6c67e4	150 John St, Toronto, ON M5V 3C3, Canada	150 John Street	ON	Toronto	M5V 3C3		2025-10-17 10:53:40.347+00	2025-10-17 10:53:40.347+00	\N
445599f3-d075-4e74-818d-b7430a963a1d	150 John St, Toronto, ON M5V 3C3, Canada	150 John Street	ON	Toronto	M5V 3C3	\N	2025-10-17 11:16:36.388+00	2025-10-17 11:16:36.388+00	\N
fbab5f97-88bd-4f87-9908-98471e5bb1e9	150 John Neufeld Cres, Winnipeg, MB R3W 0M6, Canada	150 John Neufeld Crescent	\N	MULTAN	\N	\N	2025-10-17 11:16:36.388+00	2025-10-17 11:16:36.388+00	\N
34b9b3f6-2f24-45b8-912b-64d4c52cfba2	150 John St, Eganville, ON K0J 1T0, Canada	150 John Street	ON	Eganville	K0J 1T0	\N	2025-10-17 11:16:36.388+00	2025-10-17 11:16:36.388+00	\N
a31a01b3-5c8e-446e-bd95-83dfcaa019a7	150 King St W, Toronto, ON M5H 4B6, Canada	150 King Street West	ON	Toronto	M5H 4B6	\N	2025-10-17 11:16:36.474+00	2025-10-17 11:16:36.474+00	\N
d493baf5-1fb6-4797-8f0a-c613cdb7f8ef	150 Nexus Ave, Brampton, ON L6P 3R6, Canada	150 Nexus Avenue	ON	Brampton	L6P 3R6	\N	2025-10-17 11:16:36.495+00	2025-10-17 11:16:36.495+00	\N
35841477-086c-4011-8d60-5220631840dc	180 Bd Saint-Joseph, Lachine, QC H8S 0B5, Canada	180 Boulevard Saint-Joseph	QC	Montréal	H8S 0B5	\N	2025-10-17 11:16:36.513+00	2025-10-17 11:16:36.513+00	\N
6abb2887-4f69-4a4a-a489-e1494a8327f6	180 Ch. du Tremblay, Boucherville, QC J4B 6Z6, Canada	180 Chemin du Tremblay	QC	Boucherville	J4B 6Z6	\N	2025-10-17 11:16:36.538+00	2025-10-17 11:16:36.538+00	\N
07016958-6c00-4247-bd16-60ed01fff62e	160 John St, Toronto, ON M5V 2E5, Canada	160 John Street	ON	Toronto	M5V 2E5	\N	2025-10-17 11:16:36.558+00	2025-10-17 11:16:36.558+00	\N
df4cb3dc-d1ae-44f2-8841-d52e313f6a35	Street 1	402	\N	Toronto	A1A 1A1	\N	2025-10-17 13:54:17.057+00	2025-10-17 13:54:17.057+00	\N
346bd004-edae-40b0-b23b-ed074b0a0d73	saddsdsd	32	\N	ds	\N	232	2025-10-17 13:54:17.057+00	2025-10-17 13:54:17.057+00	\N
df0bd8da-94d0-4db0-bec2-527681cfd335	Street 1	402	\N	Toronto	A1A 1A1	\N	2025-10-17 13:58:54.994+00	2025-10-17 13:58:54.994+00	\N
10f037e8-cf5d-4f7c-81d8-6cf00ddd8781	saddsdsd	32	\N	ds	\N	232	2025-10-17 13:58:54.994+00	2025-10-17 13:58:54.994+00	\N
9bbebb9a-a5eb-469d-a71d-3bea35f69e55	Multan Punjab	20 Street	ON	Multan	A1A 1A1		2025-10-17 13:58:57.835+00	2025-10-17 13:58:57.835+00	\N
c2b5090a-b7ee-4b3e-b1af-d025a88e4dcd	saddsdsd	32	\N	ds	A1A 1A1	232	2025-10-17 13:59:55.648+00	2025-10-17 13:59:55.648+00	\N
e7de545a-f104-4c5e-85af-838952c2869a	saddsdsd	32	\N	ds	\N	232	2025-10-17 13:59:55.648+00	2025-10-17 13:59:55.648+00	\N
79dd0f64-f25b-443a-bc68-82580431169c	saddsdsd	32	\N	ds	A1A 1A1	232	2025-10-17 14:00:39.212+00	2025-10-17 14:00:39.212+00	\N
28ec52f3-2ff8-4821-bb4a-f5977f56323e	saddsdsd	32	\N	ds	\N	232	2025-10-17 14:00:39.212+00	2025-10-17 14:00:39.212+00	\N
f4d8c9a6-4443-4fe2-bbd5-34ac63d90676	186 Old Kennedy Rd, Markham, ON L3R 0L5, Canada	186 Old Kennedy Road	ON	Markham	L3R 0L5	402	2025-10-17 14:07:38.962+00	2025-10-17 14:07:38.962+00	\N
14e755a2-5301-4241-9a80-735f93873c33	saddsdsd	32	\N	ds	\N	232	2025-10-17 14:07:38.962+00	2025-10-17 14:07:38.962+00	\N
5c74a92e-ee3c-49ce-902c-728a0430f7dc	1680 Creditstone Rd, Vaughan, ON L4K 5V6, Canada	1680 Creditstone Road	ON	Vaughan	L4K 5V6	232	2025-10-17 14:07:38.962+00	2025-10-17 14:07:38.962+00	\N
ab90090b-b068-4268-92cd-f1dbf3c33158	186 Old Kennedy Rd, Markham, ON L3R 0L5, Canada	186 Old Kennedy Road	\N	Markham	L3R 0L5	402	2025-10-17 14:14:44.848+00	2025-10-17 14:14:44.848+00	\N
c24bc6c5-3e4d-4e91-9d46-43bf8e504758	saddsdsd	32	\N	ds	\N	232	2025-10-17 14:14:44.848+00	2025-10-17 14:14:44.848+00	\N
a6fef6b3-9f18-4e8b-88ec-a39e949769a3	186 Old Kennedy Rd, Markham, ON L3R 0L5, Canada	186 Old Kennedy Road	\N	Markham	L3R 0L5	402	2025-10-17 14:15:56.393+00	2025-10-17 14:15:56.393+00	\N
364cbb23-d50c-4236-b728-6e5f49315e1e	saddsdsd	32	\N	ds	\N	232	2025-10-17 14:15:56.393+00	2025-10-17 14:15:56.393+00	\N
3733c24c-e398-4688-8576-906c1114a02b	house 281/106, behing ghosia masjid	\N	\N	\N	\N	\N	2025-10-17 14:15:56.432+00	2025-10-17 14:15:56.432+00	\N
49fc7e15-dfc1-40d9-a087-a78425baa8da	saddsdsd	32	\N	ds	A1A 1A1	232	2025-10-17 14:29:48.537+00	2025-10-17 14:29:48.537+00	\N
a59605e3-0537-496e-ad81-44aa87ff079d	saddsdsd	32	\N	ds	\N	232	2025-10-17 14:29:48.537+00	2025-10-17 14:29:48.537+00	\N
841257ae-e50f-4bd7-87b7-82c0069a70cc	saddsdsd	32		ds	A1A 1A1	232	2025-10-17 14:31:03.217+00	2025-10-17 14:31:03.217+00	\N
1c849527-047e-4dfe-b8fb-d39d934217c7	A23 Beach Ave, GOLDEN_DAYS, AB T0C 2P0, Canada	A23 Beach Avenue	AB	Golde days	T0C 2P0	4521	2025-10-17 14:58:39.126+00	2025-10-17 14:58:39.126+00	\N
4277269e-8b30-438f-8a44-789060919d2e	186 Old Kennedy Rd, Markham, ON L3R 0L5, Canada	186 Old Kennedy Road	\N	Markham	L3R 0L5	402	2025-10-17 15:02:45.113+00	2025-10-17 15:02:45.113+00	\N
f1adb32a-67fa-4b35-8afa-9e394e34072c	saddsdsd	32	\N	ds	\N	232	2025-10-17 15:02:45.113+00	2025-10-17 15:02:45.113+00	\N
65b53418-1590-4c87-949c-330a6ecd66b7	Facere consequuntur 	Consectetur et sunt 	NS	Accusamus et obcaeca	A1A1A1	Voluptas quae autem 	2025-10-17 17:13:09.714+00	2025-10-17 17:13:09.714+00	\N
\.


--
-- Data for Name: case_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.case_documents (id, case_id, document_id, created_at, updated_at, deleted_at) FROM stdin;
6eaa8e81-8586-4352-9af2-68689cffc39f	022ebce0-7419-408d-8f85-8512d27223c6	22fbb7d2-83e0-4690-8a71-ced08d6357cd	2025-10-17 11:16:36.562+00	2025-10-17 11:16:36.562+00	\N
ad016a21-58e3-4998-9aa6-447a8dcc23b9	d905b881-0843-42d8-acd7-4b9ea0eb65ff	e45a2f22-aba7-4341-9026-26253770d704	2025-10-17 13:54:17.092+00	2025-10-17 13:54:17.092+00	\N
a0b7d93d-44e1-4787-b28b-cb3ae432e3a6	51724b34-5845-4381-8b76-4bb914bd6423	60827c9e-94cc-44db-95a8-e5b7bff8949c	2025-10-17 13:58:55.03+00	2025-10-17 13:58:55.03+00	\N
109b51ee-a840-4853-aaab-d9b85fd3e6eb	76e50c70-9507-48b9-b845-450c13227797	690b1356-b171-4cef-b3dd-cf1200a5531f	2025-10-17 13:59:55.683+00	2025-10-17 13:59:55.683+00	\N
7ed80330-f2b3-442c-ac21-a7cabc03c3f6	255fb3f0-c54d-4998-b339-fd15b975541c	6fc5f8e4-ee5e-4fb0-aeca-421e1644d9e4	2025-10-17 14:00:39.239+00	2025-10-17 14:00:39.239+00	\N
c8d623c0-ffa0-45a9-afd7-67904c7d9bf2	ab2cc326-bd22-4994-842d-fdbd5eeeef9f	941c0e04-a04c-484e-8966-65c410ce2275	2025-10-17 14:07:38.994+00	2025-10-17 14:07:38.994+00	\N
54c363aa-2de9-43bc-afbd-daabf6b737e3	cad58099-6c61-4769-9851-0f0b2a3b1659	a74a2cb4-bbcd-4720-8ef8-7a399b25a3e5	2025-10-17 14:14:44.881+00	2025-10-17 14:14:44.881+00	\N
e482fe97-c9ae-4447-8608-25fa262fade3	e4bce677-0b54-4451-8cbc-4da66274df32	0878bf0f-d3c4-4689-8cfd-bd32fa30bef5	2025-10-17 14:15:56.437+00	2025-10-17 14:15:56.437+00	\N
f4afe583-8f62-471b-8600-bc9b314cbb7f	59ccfd77-5409-4dce-98c5-14a917d869b7	16947f42-9a96-4535-8f9d-7e230fbd9fe1	2025-10-17 14:29:48.608+00	2025-10-17 14:29:48.608+00	\N
ad9ef1c2-6f6d-4468-9599-5fffa6e70a2c	79f24159-2807-48e6-adc1-29741cd37d1e	98d41c9d-b87c-4020-9d95-28cba76319d2	2025-10-17 15:02:45.189+00	2025-10-17 15:02:45.189+00	\N
\.


--
-- Data for Name: case_statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.case_statuses (id, name, description, created_at, updated_at, deleted_at) FROM stdin;
5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	Pending	The case is submitted by the client and is awaiting review	2025-10-14 16:54:29.112+00	2025-10-14 16:54:29.112+00	\N
0e54cccc-d16e-4efa-ba99-336fc1af6cbe	Ready to Appointment	The case is ready for the appointment	2025-10-14 16:54:29.119+00	2025-10-14 16:54:29.119+00	\N
bbfa26e3-74f7-42c4-aa06-8d4002fabe44	New Referral	Newly submitted case awaiting review	2025-10-14 16:54:31.398+00	2025-10-14 16:54:31.398+00	\N
b44cc369-d1f5-4c1f-92f0-c75ee79bafe9	Waiting to be Scheduled	Case is ready to be scheduled	2025-10-14 16:54:31.406+00	2025-10-14 16:54:31.406+00	\N
8d54df0b-ca1c-49fd-937b-8404b3631571	Scheduled	Appointment has been scheduled	2025-10-14 16:54:31.411+00	2025-10-14 16:54:31.411+00	\N
457caf3b-0202-402b-87e5-198b88c121d0	In Progress	Examination is in progress	2025-10-14 16:54:31.417+00	2025-10-14 16:54:31.417+00	\N
8eb7a94b-f04b-4330-8cd7-2781808f78c1	Completed	Case has been completed	2025-10-14 16:54:31.423+00	2025-10-14 16:54:31.423+00	\N
\.


--
-- Data for Name: case_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.case_types (id, name, description, created_at, updated_at, deleted_at) FROM stdin;
8432157b-ff82-44fb-834a-1df5469ae48f	Motor Vehicle Accident	Cases involving injuries from motor vehicle accidents	2025-10-14 16:54:29.004+00	2025-10-14 16:54:29.004+00	\N
84f5674c-bfb5-467a-a0e7-a3cfe27a4012	Workplace Injury	Injuries sustained in the workplace environment	2025-10-14 16:54:29.011+00	2025-10-14 16:54:29.011+00	\N
33a4465b-f7c8-48a7-a255-224484561f8b	Slip and Fall	Injuries from slip and fall incidents	2025-10-14 16:54:29.017+00	2025-10-14 16:54:29.017+00	\N
1d8b4eef-eada-48e4-955d-63b149f2cf45	Product Liability	Injuries caused by defective or dangerous products	2025-10-14 16:54:29.024+00	2025-10-14 16:54:29.024+00	\N
968e604e-7b37-44ff-84fa-5307a9329205	Medical Malpractice	Cases involving medical negligence or malpractice	2025-10-14 16:54:29.03+00	2025-10-14 16:54:29.03+00	\N
482c5d0b-5589-4f7e-b41b-ec39be4e6a21	Disability Claim	Claims for disability benefits and assessments	2025-10-14 16:54:29.035+00	2025-10-14 16:54:29.035+00	\N
8251bf51-fd67-4ede-9cc2-605bb12c65c1	Workers Compensation	Workers compensation claims and assessments	2025-10-14 16:54:29.041+00	2025-10-14 16:54:29.041+00	\N
faeeb604-5339-4ee8-b520-99180da3fa2c	Personal Injury	General personal injury cases	2025-10-14 16:54:29.047+00	2025-10-14 16:54:29.047+00	\N
17edddad-3d0b-45b0-ac95-76d262a20acc	Insurance Claim	Insurance-related medical examinations	2025-10-14 16:54:29.092+00	2025-10-14 16:54:29.092+00	\N
76e1e363-a9e7-4363-af69-266e979aa528	Rehabilitation Assessment	Assessments for rehabilitation needs and progress	2025-10-14 16:54:29.098+00	2025-10-14 16:54:29.098+00	\N
798386c6-11ab-4693-a384-906d83c12042	Disability Assessment	Disability Assessment cases	2025-10-14 16:54:31.593+00	2025-10-14 16:54:31.593+00	\N
\.


--
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cases (id, organization_id, claimant_id, insurance_id, legal_representative_id, case_type_id, reason, consent_for_submission, is_draft, created_at, updated_at, deleted_at) FROM stdin;
e0ce9b20-489f-4e0b-8ca5-f27d9e3960df	77e68542-987a-4a22-9717-41ff6f5c4a3b	ff4dea3c-daa9-40f1-a94d-79fd3c6cfe28	\N	\N	faeeb604-5339-4ee8-b520-99180da3fa2c	Motor vehicle accident, lower back pain, requires urgent assessment	t	f	2025-10-14 16:54:31.505+00	2025-10-14 16:54:31.505+00	\N
66ee5cf1-c857-46fa-ada8-a20665903186	de835568-10d7-4823-9d96-3ace09d25516	bf09d02f-4aaa-4129-94cb-605fae1e13e8	\N	\N	798386c6-11ab-4693-a384-906d83c12042	Anxiety and depression, workplace stress claim	t	f	2025-10-14 16:54:31.596+00	2025-10-14 16:54:31.596+00	\N
6569cd39-2261-46b9-b8d5-4b713ac67961	371ff8e7-2346-4430-a7dd-42df93d819f0	538526ec-f8d3-4ce1-b20d-e8d1fd5f2fd6	\N	\N	8251bf51-fd67-4ede-9cc2-605bb12c65c1	Shoulder injury from repetitive work tasks	t	f	2025-10-14 16:54:31.642+00	2025-10-14 16:54:31.642+00	\N
c810e3de-f884-4626-8b2d-a5eeb48040dd	8ca0ffcc-07fc-4d36-8860-1a5b0c87a2a6	70174f15-df7a-48b5-84bb-d3b91258bd97	\N	\N	faeeb604-5339-4ee8-b520-99180da3fa2c	Head injury from rear-end collision, awaiting examiner assignment	t	f	2025-10-14 16:54:31.719+00	2025-10-14 16:54:31.719+00	\N
2e6d2cc3-fa9a-4e6d-8e30-171de3917a45	d4c95bee-cdce-45b8-8018-e6e759ca6a9f	e2784ca4-4a3a-4f9c-909a-947115d7095d	\N	\N	faeeb604-5339-4ee8-b520-99180da3fa2c	Knee injury from workplace slip, pending claimant availability	t	f	2025-10-14 16:54:31.831+00	2025-10-14 16:54:31.831+00	\N
ba5eed2f-a26a-4bc9-9b2d-1f9c6b3a3dae	73f87b72-282a-4113-a822-abd99c6b8573	99094afb-be3a-4070-992d-7132bf560d93	\N	\N	faeeb604-5339-4ee8-b520-99180da3fa2c	PTSD symptoms post-accident, examiner assigned, awaiting scheduling	t	f	2025-10-14 16:54:31.915+00	2025-10-14 16:54:31.915+00	\N
d5ed3a0e-ab4c-49a5-9705-938a83f3c8dd	02d8253e-5fe0-47d8-b466-41e02f2c9133	0e9ab86b-973b-47cc-bc91-490f46a11d19	\N	\N	8251bf51-fd67-4ede-9cc2-605bb12c65c1	Back injury from lifting, ready to schedule appointment	t	f	2025-10-14 16:54:31.994+00	2025-10-14 16:54:31.994+00	\N
81be77d7-5220-4e30-ba6b-6d4971182e3c	3f34a8bf-4bfb-44b4-828c-045d9c2ef29c	41d27d95-ee0b-48e3-aec2-ce03ba194365	\N	\N	faeeb604-5339-4ee8-b520-99180da3fa2c	Neck and shoulder pain, appointment confirmed for next week	t	f	2025-10-14 16:54:32.046+00	2025-10-14 16:54:32.046+00	\N
1a9c267d-0b88-4464-9f93-7a861745878e	87a05bd9-dad9-4f23-b372-4a5824f014f1	4673063e-eba3-4c1b-a587-ed1efc59d3bb	\N	\N	798386c6-11ab-4693-a384-906d83c12042	Chronic fatigue syndrome evaluation scheduled	t	f	2025-10-14 16:54:32.134+00	2025-10-14 16:54:32.134+00	\N
022ebce0-7419-408d-8f85-8512d27223c6	90722ba7-241d-4b0d-bac1-61eab3f29f4c	18bbcec6-a95d-4820-b32b-2cf7af05f187	39e402a1-4623-4afe-ba6d-fdcaf4e76639	976da108-f862-4d3f-a4ad-2c4dff809ac8	968e604e-7b37-44ff-84fa-5307a9329205	Heelo Hello Hello Hello	t	f	2025-10-17 11:16:36.405+00	2025-10-17 11:16:36.405+00	\N
d905b881-0843-42d8-acd7-4b9ea0eb65ff	344d0793-2206-41d4-9b09-33c1344c7bc1	38eb71e5-e794-4f43-97a9-247f29b39a33	f54d7633-110a-4e8a-a8a7-15b1434301ec	\N	17edddad-3d0b-45b0-ac95-76d262a20acc	mmmmmm	t	f	2025-10-17 13:54:17.072+00	2025-10-17 13:54:17.072+00	\N
51724b34-5845-4381-8b76-4bb914bd6423	344d0793-2206-41d4-9b09-33c1344c7bc1	59edb01d-3fca-4891-80b3-af50f5b737dd	88b92503-a642-4a70-bec1-fb09ab48d43d	\N	17edddad-3d0b-45b0-ac95-76d262a20acc	abcdef	t	f	2025-10-17 13:58:55.012+00	2025-10-17 13:58:55.012+00	\N
76e50c70-9507-48b9-b845-450c13227797	344d0793-2206-41d4-9b09-33c1344c7bc1	b795d433-bce1-41ec-b8f4-98dd48a08532	f980d8d5-760a-4840-bc9a-58653b5c3a78	\N	798386c6-11ab-4693-a384-906d83c12042	ssssssss	t	f	2025-10-17 13:59:55.664+00	2025-10-17 13:59:55.664+00	\N
255fb3f0-c54d-4998-b339-fd15b975541c	344d0793-2206-41d4-9b09-33c1344c7bc1	31c1c0ad-df58-408e-9364-0fe5ba834cc0	8245e2a9-2f91-483c-91bd-63e8d67b870c	\N	17edddad-3d0b-45b0-ac95-76d262a20acc	mmmmmm	t	f	2025-10-17 14:00:39.225+00	2025-10-17 14:00:39.225+00	\N
ab2cc326-bd22-4994-842d-fdbd5eeeef9f	344d0793-2206-41d4-9b09-33c1344c7bc1	b6b38a26-46b0-48cb-aede-b22c43b535f1	08380361-6ac4-457a-9d36-fc00bffcc9fa	73ab2999-e574-4e4f-be6f-9ef0021d5a5c	482c5d0b-5589-4f7e-b41b-ec39be4e6a21	reason for referral	t	f	2025-10-17 14:07:38.977+00	2025-10-17 14:07:38.977+00	\N
cad58099-6c61-4769-9851-0f0b2a3b1659	344d0793-2206-41d4-9b09-33c1344c7bc1	c3fd7ee5-e870-4178-b6fd-9479dd4cad78	d79d04c8-dcb3-4d10-b1a1-7d33e9c0b4ee	\N	482c5d0b-5589-4f7e-b41b-ec39be4e6a21	bhvkhbvkjbvk	t	f	2025-10-17 14:14:44.861+00	2025-10-17 14:14:44.861+00	\N
e4bce677-0b54-4451-8cbc-4da66274df32	344d0793-2206-41d4-9b09-33c1344c7bc1	188db030-bde7-4de0-bdda-4ca33888731b	c3c7e4f9-6f45-4434-bfbd-885bf6023786	\N	968e604e-7b37-44ff-84fa-5307a9329205	nmmhmb	t	f	2025-10-17 14:15:56.409+00	2025-10-17 14:15:56.409+00	\N
59ccfd77-5409-4dce-98c5-14a917d869b7	344d0793-2206-41d4-9b09-33c1344c7bc1	c3581333-9227-4a0d-8493-5239bc76a67d	de010c78-3060-4a12-96fd-e2e534644f45	\N	482c5d0b-5589-4f7e-b41b-ec39be4e6a21	mnmnmnmnm	t	f	2025-10-17 14:29:48.569+00	2025-10-17 14:29:48.569+00	\N
79f24159-2807-48e6-adc1-29741cd37d1e	344d0793-2206-41d4-9b09-33c1344c7bc1	e3a65583-37e6-461c-ae41-1f0bf040e2f8	f0f3120f-43c6-4c29-869d-a0568dcab880	\N	17edddad-3d0b-45b0-ac95-76d262a20acc	jndskjbihjds	t	f	2025-10-17 15:02:45.146+00	2025-10-17 15:02:45.146+00	\N
\.


--
-- Data for Name: claim_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.claim_types (id, name, description, created_at, updated_at, deleted_at) FROM stdin;
229b135a-8e62-457b-a771-00fa144f7b21	First Party Claim	Claim filed by the insured against their own insurance policy	2025-10-14 16:54:29.342+00	2025-10-14 16:54:29.342+00	\N
36da8979-d5df-4610-bf3f-0fa6d727e884	Third Party Claim	Claim filed against another party's insurance for damages they caused	2025-10-14 16:54:29.349+00	2025-10-14 16:54:29.349+00	\N
3bb8a760-ecba-4acf-b457-ba0592cd0e18	Property Damage Claim	Claim for physical injuries sustained by the claimant	2025-10-14 16:54:29.424+00	2025-10-14 16:54:29.424+00	\N
37b8f6a1-803f-43e6-bc9b-b84ae02d8be6	Subrogation Claim	Claim for damage to property owned by the claimant	2025-10-14 16:54:29.432+00	2025-10-14 16:54:29.432+00	\N
e79ace4c-08b3-4234-8c60-5ea447ca7644	Bodily Injury Claim	Claim where the insurance company seeks reimbursement from a third party	2025-10-14 16:54:29.438+00	2025-10-14 16:54:29.438+00	\N
8ebab251-1a85-4f87-a564-fb82f3262305	Other	Other claim type	2025-10-14 16:54:29.444+00	2025-10-14 16:54:29.444+00	\N
199e9158-f3ee-416f-8ec8-1bf20fc1995f	Auto Accident	Auto Accident claims	2025-10-14 16:54:31.456+00	2025-10-14 16:54:31.456+00	\N
8b246c6c-6643-4053-b9d1-83ba8b296f55	Long Term Disability	Long Term Disability claims	2025-10-14 16:54:31.545+00	2025-10-14 16:54:31.545+00	\N
a9708b88-36b7-409b-93dc-b5b6dff02860	Workplace Injury	Workplace Injury claims	2025-10-14 16:54:31.63+00	2025-10-14 16:54:31.63+00	\N
e7d2e37b-5f25-42f8-8b39-29c8a68656a1	Slip and Fall	Slip and Fall claims	2025-10-14 16:54:31.82+00	2025-10-14 16:54:31.82+00	\N
\.


--
-- Data for Name: claimant_availability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.claimant_availability (id, examination_id, claimant_id, preference, accessibility_notes, consent_ack, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: claimant_availability_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.claimant_availability_slots (id, availability_id, date, start_time, end_time, start, "end", time_band, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: claimants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.claimants (id, first_name, last_name, date_of_birth, gender, phone_number, email_address, related_cases_details, family_doctor_name, family_doctor_email_address, family_doctor_phone_number, family_doctor_fax_number, address_id, created_at, updated_at, deleted_at, claim_type_id) FROM stdin;
ff4dea3c-daa9-40f1-a94d-79fd3c6cfe28	John	Anderson	1985-05-15	Other	+14165551001	john.anderson@email.com	\N	\N	\N	\N	\N	df6feb21-0b42-4c65-a9dc-5e5e8f2722e1	2025-10-14 16:54:31.496+00	2025-10-14 16:54:31.496+00	\N	199e9158-f3ee-416f-8ec8-1bf20fc1995f
bf09d02f-4aaa-4129-94cb-605fae1e13e8	Sarah	Mitchell	1985-05-15	Other	+16045551002	sarah.mitchell@email.com	\N	\N	\N	\N	\N	1a1aee06-e34b-45a0-96d6-9376c1bfbade	2025-10-14 16:54:31.551+00	2025-10-14 16:54:31.551+00	\N	8b246c6c-6643-4053-b9d1-83ba8b296f55
538526ec-f8d3-4ce1-b20d-e8d1fd5f2fd6	David	Thompson	1985-05-15	Other	+14035551003	david.thompson@email.com	\N	\N	\N	\N	\N	deb71f03-5b22-4443-b1d7-6dbc1a724181	2025-10-14 16:54:31.636+00	2025-10-14 16:54:31.636+00	\N	a9708b88-36b7-409b-93dc-b5b6dff02860
70174f15-df7a-48b5-84bb-d3b91258bd97	Emily	Rodriguez	1985-05-15	Other	+14165551004	emily.rodriguez@email.com	\N	\N	\N	\N	\N	5ab5ced8-4feb-43b4-bc57-2369b1616d55	2025-10-14 16:54:31.708+00	2025-10-14 16:54:31.708+00	\N	199e9158-f3ee-416f-8ec8-1bf20fc1995f
e2784ca4-4a3a-4f9c-909a-947115d7095d	Michael	Brown	1985-05-15	Other	+16135551005	michael.brown@email.com	\N	\N	\N	\N	\N	4156f951-700d-4059-8057-4ffd13dfc62f	2025-10-14 16:54:31.826+00	2025-10-14 16:54:31.826+00	\N	e7d2e37b-5f25-42f8-8b39-29c8a68656a1
99094afb-be3a-4070-992d-7132bf560d93	Jennifer	Lee	1985-05-15	Other	+14165551006	jennifer.lee@email.com	\N	\N	\N	\N	\N	0c3120d9-b511-4d12-bb5a-2d0fdfddbbcc	2025-10-14 16:54:31.91+00	2025-10-14 16:54:31.91+00	\N	199e9158-f3ee-416f-8ec8-1bf20fc1995f
0e9ab86b-973b-47cc-bc91-490f46a11d19	Robert	Wilson	1985-05-15	Other	+19055551007	robert.wilson@email.com	\N	\N	\N	\N	\N	ac24a9f4-28d1-4767-b2f2-52aad7b554e5	2025-10-14 16:54:31.951+00	2025-10-14 16:54:31.951+00	\N	a9708b88-36b7-409b-93dc-b5b6dff02860
41d27d95-ee0b-48e3-aec2-ce03ba194365	Lisa	Martin	1985-05-15	Other	+14165551008	lisa.martin@email.com	\N	\N	\N	\N	\N	50e96408-e544-45ec-8f91-7d706869b459	2025-10-14 16:54:32.038+00	2025-10-14 16:54:32.038+00	\N	199e9158-f3ee-416f-8ec8-1bf20fc1995f
4673063e-eba3-4c1b-a587-ed1efc59d3bb	James	Taylor	1985-05-15	Other	+14165551009	james.taylor@email.com	\N	\N	\N	\N	\N	86de0bf8-f438-4ffb-9343-149a273a0cef	2025-10-14 16:54:32.122+00	2025-10-14 16:54:32.122+00	\N	8b246c6c-6643-4053-b9d1-83ba8b296f55
18bbcec6-a95d-4820-b32b-2cf7af05f187	Mahroz	Abbas	2023-12-13	male	(888) 555-4444	mahrozabass+124@buildmeapp.io	Hello	\N	\N	\N	\N	445599f3-d075-4e74-818d-b7430a963a1d	2025-10-17 11:16:36.393+00	2025-10-17 11:16:36.393+00	\N	36da8979-d5df-4610-bf3f-0fa6d727e884
38eb71e5-e794-4f43-97a9-247f29b39a33	Sajeel Ahmad	Ahmad	\N	\N	\N	sajeel@buildmeapp.io	\N	\N	\N	\N	\N	df4cb3dc-d1ae-44f2-8841-d52e313f6a35	2025-10-17 13:54:17.062+00	2025-10-17 13:54:17.062+00	\N	36da8979-d5df-4610-bf3f-0fa6d727e884
59edb01d-3fca-4891-80b3-af50f5b737dd	Sajeel Ahmad	Ahmad	\N	\N	\N	sajeel@buildmeapp.io	\N	\N	\N	\N	\N	df0bd8da-94d0-4db0-bec2-527681cfd335	2025-10-17 13:58:54.998+00	2025-10-17 13:58:54.998+00	\N	36da8979-d5df-4610-bf3f-0fa6d727e884
b795d433-bce1-41ec-b8f4-98dd48a08532	Sajeel Ahmad	Ahmad	\N	\N	\N	sajeel+eSS@buildmeapp.io	\N	\N	\N	\N	\N	c2b5090a-b7ee-4b3e-b1af-d025a88e4dcd	2025-10-17 13:59:55.651+00	2025-10-17 13:59:55.651+00	\N	3bb8a760-ecba-4acf-b457-ba0592cd0e18
31c1c0ad-df58-408e-9364-0fe5ba834cc0	Sajeel Ahmad	Ahmad	\N	\N	\N	sajeel+eSS@buildmeapp.io	\N	\N	\N	\N	\N	79dd0f64-f25b-443a-bc68-82580431169c	2025-10-17 14:00:39.215+00	2025-10-17 14:00:39.215+00	\N	3bb8a760-ecba-4acf-b457-ba0592cd0e18
b6b38a26-46b0-48cb-aede-b22c43b535f1	Sajeel Ahmad	Ahmad	2025-09-30	female	1 (234) 566-7788	sajeel@buildmeapp.io	related cases details	Family doctor	sajeelashiq1@gmail.com	1 (343) 567-6556	1 (235) 764-6654	f4d8c9a6-4443-4fe2-bbd5-34ac63d90676	2025-10-17 14:07:38.967+00	2025-10-17 14:07:38.967+00	\N	36da8979-d5df-4610-bf3f-0fa6d727e884
c3fd7ee5-e870-4178-b6fd-9479dd4cad78	Sajeel Ahmad	Ahmad	\N	\N	1 (234) 566-7788	sajeel@buildmeapp.io	\N	Family doctor	sajeelashiq1@gmail.com	1 (343) 567-6556	1 (235) 764-6654	ab90090b-b068-4268-92cd-f1dbf3c33158	2025-10-17 14:14:44.851+00	2025-10-17 14:14:44.851+00	\N	36da8979-d5df-4610-bf3f-0fa6d727e884
188db030-bde7-4de0-bdda-4ca33888731b	Sajeel Ahmad	Ahmad	\N	\N	1 (234) 566-7788	sajeel@buildmeapp.io	\N	Family doctor	sajeelashiq1@gmail.com	1 (343) 567-6556	1 (235) 764-6654	a6fef6b3-9f18-4e8b-88ec-a39e949769a3	2025-10-17 14:15:56.397+00	2025-10-17 14:15:56.397+00	\N	36da8979-d5df-4610-bf3f-0fa6d727e884
c3581333-9227-4a0d-8493-5239bc76a67d	Sajeel Ahmad	Ahmad	\N	\N	\N	sajeel+eSS@buildmeapp.io	\N	\N	\N	\N	\N	49fc7e15-dfc1-40d9-a087-a78425baa8da	2025-10-17 14:29:48.544+00	2025-10-17 14:29:48.544+00	\N	3bb8a760-ecba-4acf-b457-ba0592cd0e18
e3a65583-37e6-461c-ae41-1f0bf040e2f8	Sajeel Ahmad	Ahmad	\N	\N	1 (234) 566-7788	sajeel@buildmeapp.io	\N	Family doctor	sajeelashiq1@gmail.com	1 (343) 567-6556	1 (235) 764-6654	4277269e-8b30-438f-8a44-789060919d2e	2025-10-17 15:02:45.122+00	2025-10-17 15:02:45.122+00	\N	36da8979-d5df-4610-bf3f-0fa6d727e884
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, name, created_at, updated_at, deleted_at) FROM stdin;
084e70f1-d215-4bc6-b398-3db4982b4be5	claims	2025-10-14 16:54:27.756+00	2025-10-14 16:54:27.756+00	\N
ef6ee388-7220-49cf-8c1e-92e523adcc11	legal	2025-10-14 16:54:27.796+00	2025-10-14 16:54:27.796+00	\N
5aa05c06-192b-4d4d-906f-c4f6a03c6429	human_resources	2025-10-14 16:54:27.802+00	2025-10-14 16:54:27.802+00	\N
b00723a0-69c1-4978-95bc-29eef401ccb0	medical_or_clinical	2025-10-14 16:54:27.807+00	2025-10-14 16:54:27.807+00	\N
0658f962-ed66-4d42-9a26-890515456fd1	case_management	2025-10-14 16:54:27.813+00	2025-10-14 16:54:27.813+00	\N
cc43d9b5-ec2a-4218-9eac-3a282714fa21	administration	2025-10-14 16:54:27.818+00	2025-10-14 16:54:27.818+00	\N
f2c8cb4b-8bc4-4f53-819b-91ec3abdda51	compliance_or_risk	2025-10-14 16:54:27.824+00	2025-10-14 16:54:27.824+00	\N
4234dc03-b10b-47c1-9fcf-0b15ccc8c57d	finance_or_billing	2025-10-14 16:54:27.829+00	2025-10-14 16:54:27.829+00	\N
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documents (id, name, type, size, created_at, updated_at, deleted_at, display_name) FROM stdin;
819c7048-cc9f-4eb5-ae10-53d609a44010	medical_license_CPSO-12345.pdf	application/pdf	1024000	2025-10-14 16:54:30.306+00	2025-10-14 16:54:30.306+00	\N	Medical License - John Smith
0e2f0292-2fcc-45f0-b626-2b0077ca8c87	resume_John_Smith.pdf	application/pdf	512000	2025-10-14 16:54:30.311+00	2025-10-14 16:54:30.311+00	\N	Resume - John Smith
6cd7cdfb-fb2d-4f9f-ae3f-c641af8f9b7a	nda_signed_John_Smith.pdf	application/pdf	256000	2025-10-14 16:54:30.314+00	2025-10-14 16:54:30.314+00	\N	Signed NDA - John Smith
8751d2e7-f289-42c3-8ffc-2cc0623da8fa	insurance_John_Smith.pdf	application/pdf	768000	2025-10-14 16:54:30.316+00	2025-10-14 16:54:30.316+00	\N	Insurance Proof - John Smith
993fc151-20c1-44b5-b6b2-6352659029b3	medical_license_CPSBC-67890.pdf	application/pdf	1024000	2025-10-14 16:54:30.615+00	2025-10-14 16:54:30.615+00	\N	Medical License - Sarah Johnson
9e4dd753-0b34-4759-bd94-34c5f633b8c9	resume_Sarah_Johnson.pdf	application/pdf	512000	2025-10-14 16:54:30.619+00	2025-10-14 16:54:30.619+00	\N	Resume - Sarah Johnson
5374d798-5ea8-4c9d-a967-c8ad9e303017	nda_signed_Sarah_Johnson.pdf	application/pdf	256000	2025-10-14 16:54:30.622+00	2025-10-14 16:54:30.622+00	\N	Signed NDA - Sarah Johnson
286742ec-da56-44f0-a31d-d9c595421d66	insurance_Sarah_Johnson.pdf	application/pdf	768000	2025-10-14 16:54:30.625+00	2025-10-14 16:54:30.625+00	\N	Insurance Proof - Sarah Johnson
1d8eeb21-cbed-4448-8228-42323fd1cd19	medical_license_CPSO-23456.pdf	application/pdf	1024000	2025-10-14 16:54:30.92+00	2025-10-14 16:54:30.92+00	\N	Medical License - Michael Chen
cc84af53-0287-4b8d-9640-871878ecb621	resume_Michael_Chen.pdf	application/pdf	512000	2025-10-14 16:54:30.991+00	2025-10-14 16:54:30.991+00	\N	Resume - Michael Chen
ba77abdb-6839-4f64-aa83-552807298b12	nda_signed_Michael_Chen.pdf	application/pdf	256000	2025-10-14 16:54:30.994+00	2025-10-14 16:54:30.994+00	\N	Signed NDA - Michael Chen
6e53f48c-f813-4fce-a480-54850d3564b0	insurance_Michael_Chen.pdf	application/pdf	768000	2025-10-14 16:54:30.998+00	2025-10-14 16:54:30.998+00	\N	Insurance Proof - Michael Chen
977f86e9-e50f-45f0-9e49-07ffc6274ced	medical_license_CPSM-34567.pdf	application/pdf	1024000	2025-10-14 16:54:31.307+00	2025-10-14 16:54:31.307+00	\N	Medical License - Emily Williams
7caeafb1-31a0-4a90-a756-50fd887ce52b	resume_Emily_Williams.pdf	application/pdf	512000	2025-10-14 16:54:31.31+00	2025-10-14 16:54:31.31+00	\N	Resume - Emily Williams
7d76da6a-9c69-4739-b3e6-26b2511cf9f2	nda_signed_Emily_Williams.pdf	application/pdf	256000	2025-10-14 16:54:31.313+00	2025-10-14 16:54:31.313+00	\N	Signed NDA - Emily Williams
e9ca3593-aa48-4bfb-9b16-5abd3fd4dd0f	insurance_Emily_Williams.pdf	application/pdf	768000	2025-10-14 16:54:31.316+00	2025-10-14 16:54:31.316+00	\N	Insurance Proof - Emily Williams
3d5246d4-0186-420a-9fd6-b50aec1a31e6	1760655214422-0ou0ho-profile-pic__3_.png	image/png	411685	2025-10-16 22:53:34.896+00	2025-10-16 22:53:34.896+00	\N	\N
e5225f58-aead-4c58-b3d1-7f72ce6065bf	Abdul bari Full Stack Software Engineer.pdf	application/pdf	1811610	2025-10-16 23:07:28.437+00	2025-10-16 23:07:28.437+00	\N	\N
80826381-b9ff-49c4-8c70-9a593096de1b	Abdul bari Full Stack Software Engineer.pdf	application/pdf	1811610	2025-10-16 23:07:29.373+00	2025-10-16 23:07:29.373+00	\N	\N
de280bcd-bbe7-4a84-9dcf-4017606b04ef	receipt-cfea721c.pdf	application/pdf	227935	2025-10-16 23:28:11.429+00	2025-10-16 23:28:11.429+00	\N	\N
cb7e8a89-31bb-4c77-8eff-df53f7fade89	receipt-cfea721c.pdf	application/pdf	227935	2025-10-16 23:28:11.961+00	2025-10-16 23:28:11.961+00	\N	\N
784169c4-34a4-4afb-8aab-1d38e6760eea	receipt-cfea721c.pdf	application/pdf	227935	2025-10-16 23:47:19.323+00	2025-10-16 23:47:19.323+00	\N	\N
586c7c43-aff2-4c0f-a51c-7d5049e5c15c	receipt-9395df02.pdf	application/pdf	227990	2025-10-16 23:47:19.852+00	2025-10-16 23:47:19.852+00	\N	\N
22fbb7d2-83e0-4690-8a71-ced08d6357cd	1760699796006-receipt-9395df02.pdf	application/pdf	227990	2025-10-17 11:16:36.378+00	2025-10-17 11:16:36.378+00	\N	receipt-9395df02.pdf
ec365b39-3d54-46d5-aa66-dedd4cd26d9a	1760708917033-password_form.txt	text/plain	7347	2025-10-17 13:48:37.145+00	2025-10-17 13:48:37.145+00	\N	password form.txt
e45a2f22-aba7-4341-9026-26253770d704	1760709256960-password_form.txt	text/plain	7347	2025-10-17 13:54:17.049+00	2025-10-17 13:54:17.049+00	\N	password form.txt
60827c9e-94cc-44db-95a8-e5b7bff8949c	1760709534907-password_form.txt	text/plain	7347	2025-10-17 13:58:54.985+00	2025-10-17 13:58:54.985+00	\N	password form.txt
690b1356-b171-4cef-b3dd-cf1200a5531f	1760709595552-password_form.txt	text/plain	7347	2025-10-17 13:59:55.64+00	2025-10-17 13:59:55.64+00	\N	password form.txt
6fc5f8e4-ee5e-4fb0-aeca-421e1644d9e4	1760709639114-token.txt	text/plain	346	2025-10-17 14:00:39.205+00	2025-10-17 14:00:39.205+00	\N	token.txt
941c0e04-a04c-484e-8966-65c410ce2275	1760710058853-password_form.txt	text/plain	7347	2025-10-17 14:07:38.952+00	2025-10-17 14:07:38.952+00	\N	password form.txt
a74a2cb4-bbcd-4720-8ef8-7a399b25a3e5	1760710484759-password_form.txt	text/plain	7347	2025-10-17 14:14:44.839+00	2025-10-17 14:14:44.839+00	\N	password form.txt
0878bf0f-d3c4-4689-8cfd-bd32fa30bef5	1760710556297-sajeel.jpg	image/jpeg	23280	2025-10-17 14:15:56.386+00	2025-10-17 14:15:56.386+00	\N	sajeel.jpg
16947f42-9a96-4535-8f9d-7e230fbd9fe1	1760711388440-password_form.txt	text/plain	7347	2025-10-17 14:29:48.522+00	2025-10-17 14:29:48.522+00	\N	password form.txt
446f3eb0-bf40-4dbb-bbcb-00d20a674eaa	1760712959778-SRD-check-my-truck-dev.pdf	application/pdf	230356	2025-10-17 14:55:59.928+00	2025-10-17 14:55:59.928+00	\N	\N
601cf6df-f32c-4894-840f-7c0402a6921d	1760712960596-SRD-check-my-truck-dev.pdf	application/pdf	230356	2025-10-17 14:56:00.677+00	2025-10-17 14:56:00.677+00	\N	\N
98d41c9d-b87c-4020-9d95-28cba76319d2	1760713364831-password_form.txt	text/plain	7347	2025-10-17 15:02:45.097+00	2025-10-17 15:02:45.097+00	\N	password form.txt
6f3a1086-6d7e-4e8c-b83b-5513435fe9aa	1760714362430-receipt-9395df02.pdf	application/pdf	227990	2025-10-17 15:19:22.805+00	2025-10-17 15:19:22.805+00	\N	\N
bf4d5eb0-ee25-4a82-81d0-7e47cf7ca15d	1760714363747-receipt-cfea721c.pdf	application/pdf	227935	2025-10-17 15:19:23.834+00	2025-10-17 15:19:23.834+00	\N	\N
\.


--
-- Data for Name: examination_interpreter; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examination_interpreter (id, examination_service_id, language_id, created_at, updated_at, deleted_at) FROM stdin;
07d77321-4bb2-4cdd-8cc9-64920bd466bd	e2ca12b7-9017-4016-a00c-7600556984ab	90ea8e17-b471-4d8f-9f42-5e9118ca5d72	2025-10-17 11:16:36.477+00	2025-10-17 11:16:36.477+00	\N
4f595480-a3d6-42a4-bee9-d77bbc082832	d1c0630a-9e3f-4ee0-9817-929ea1d34ce5	2034c90f-5f2f-45d2-9adb-57a9e04bcab1	2025-10-17 11:16:36.498+00	2025-10-17 11:16:36.498+00	\N
bfe7603e-64f5-4325-aed6-71185ca19f42	cb5a4d66-8443-430a-9982-8ea2a8dbe304	2034c90f-5f2f-45d2-9adb-57a9e04bcab1	2025-10-17 11:16:36.513+00	2025-10-17 11:16:36.513+00	\N
a59c85e0-4593-4a20-8ab8-b12eb7d76279	2db93794-8076-4f91-9de8-e7bacbd00489	2034c90f-5f2f-45d2-9adb-57a9e04bcab1	2025-10-17 11:16:36.538+00	2025-10-17 11:16:36.538+00	\N
eed2141e-ced4-4770-8b0c-e3a97124f903	14af708f-2baa-4f4a-8c5a-ae393e2903f0	90ea8e17-b471-4d8f-9f42-5e9118ca5d72	2025-10-17 11:16:36.558+00	2025-10-17 11:16:36.558+00	\N
\.


--
-- Data for Name: examination_secure_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examination_secure_links (id, examination_id, token, expires_at, last_opened_at, submitted_at, status, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: examination_selected_benefits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examination_selected_benefits (id, examination_id, benefit_id, created_at, updated_at, deleted_at) FROM stdin;
52324166-6db2-4631-a3ea-b1af48ab4ded	bee53e54-1412-4710-9db3-c4363434df92	97754e65-b072-41f7-9968-212d1e6a001c	2025-10-17 11:16:36.462+00	2025-10-17 11:16:36.462+00	\N
419e0b07-e151-4f94-bc6d-305d147b9cfd	bee53e54-1412-4710-9db3-c4363434df92	6ba84155-f4b9-445c-9e17-8438e8a3076a	2025-10-17 11:16:36.462+00	2025-10-17 11:16:36.462+00	\N
645d52d0-59a1-442d-b8c5-38a65b77bbe8	bee53e54-1412-4710-9db3-c4363434df92	e5557bab-c02e-4a05-be08-bc88133285d5	2025-10-17 11:16:36.462+00	2025-10-17 11:16:36.462+00	\N
875c474d-3b03-49ac-8927-883a0bc1ff67	31061530-8d8a-48de-b94b-9baab292244f	2addb68d-ac3e-4e6f-9e01-1b741d47347f	2025-10-17 11:16:36.531+00	2025-10-17 11:16:36.531+00	\N
d2217e31-d280-4808-a625-457dac12cc27	31061530-8d8a-48de-b94b-9baab292244f	cc412962-20ff-4b0e-87e9-cf0d5aa066e3	2025-10-17 11:16:36.531+00	2025-10-17 11:16:36.531+00	\N
c30b861c-3309-4702-9cd8-52cfdf4cec5d	31061530-8d8a-48de-b94b-9baab292244f	2f226f6a-2275-4f19-9791-9ecf78200cde	2025-10-17 11:16:36.531+00	2025-10-17 11:16:36.531+00	\N
00d8be86-19b1-4cc4-b226-0c3f2d9b09c7	9b10e6d3-61f1-4922-9b5c-c4b9c1958d22	ed217b0f-be28-41de-afa6-759dd84e8452	2025-10-17 11:16:36.551+00	2025-10-17 11:16:36.551+00	\N
073440df-3c6f-45c4-998b-e379d91686d8	9b10e6d3-61f1-4922-9b5c-c4b9c1958d22	f238abe5-eb45-4c2e-b20a-80af06875500	2025-10-17 11:16:36.551+00	2025-10-17 11:16:36.551+00	\N
42891e49-ea4f-4e47-86eb-bde06827a57c	9b10e6d3-61f1-4922-9b5c-c4b9c1958d22	58cb0d30-4740-4904-a445-aec92eab4c85	2025-10-17 11:16:36.551+00	2025-10-17 11:16:36.551+00	\N
f329e53c-8c78-4a6d-b396-54a2509ea896	f6a8178a-e849-426a-b1ad-d999d01c1e16	86140158-93c0-4f0d-a556-75117650d227	2025-10-17 13:54:17.089+00	2025-10-17 13:54:17.089+00	\N
b5d905bc-6f1c-45ba-b92f-ffe7ad05a250	6d60721a-ba16-4012-a0f8-bcb41bf3b4ac	1c19ebba-9e83-4fba-b35a-ab3be1e4b220	2025-10-17 14:14:44.878+00	2025-10-17 14:14:44.878+00	\N
e6f1c0ee-3a42-4049-bfc3-3930da16ac39	6d60721a-ba16-4012-a0f8-bcb41bf3b4ac	ba12de3e-84c0-4363-8ce2-c2a7c181b7ab	2025-10-17 14:14:44.878+00	2025-10-17 14:14:44.878+00	\N
3e192751-5b9f-41d3-a874-a3c1a3cee374	a2b996f3-26b6-4db0-b030-4e3a85a910cc	1c19ebba-9e83-4fba-b35a-ab3be1e4b220	2025-10-17 14:15:56.426+00	2025-10-17 14:15:56.426+00	\N
ffe0bd1b-5821-4691-aa65-7a42525448c3	a2b996f3-26b6-4db0-b030-4e3a85a910cc	b340f305-8a56-41d2-9735-8872d0291eca	2025-10-17 14:15:56.426+00	2025-10-17 14:15:56.426+00	\N
d71e15ff-c5a6-4c30-9c0a-6c3507080663	8161b825-f901-4f28-a411-e86ad4537822	519b8297-2b50-45ae-920e-dcb81572446f	2025-10-17 14:29:48.603+00	2025-10-17 14:29:48.603+00	\N
f557c962-e71a-4d4b-b6ed-8c72f5e38ea1	8161b825-f901-4f28-a411-e86ad4537822	ed217b0f-be28-41de-afa6-759dd84e8452	2025-10-17 14:29:48.603+00	2025-10-17 14:29:48.603+00	\N
87b54450-d3e1-4c22-aa32-70cbefae1057	b2c1d701-937e-4272-8976-f0f8ebe2337f	1d335a23-203f-4562-95fa-4c1d7a734e96	2025-10-17 15:02:45.183+00	2025-10-17 15:02:45.183+00	\N
800f636f-337d-4eff-b5d6-608e6cdce43b	b2c1d701-937e-4272-8976-f0f8ebe2337f	c6d89e86-f728-4741-9327-5fc9448c1f69	2025-10-17 15:02:45.183+00	2025-10-17 15:02:45.183+00	\N
\.


--
-- Data for Name: examination_services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examination_services (id, examination_id, type, enabled, created_at, updated_at, deleted_at) FROM stdin;
b2c8cd63-43ee-4c2e-be56-12e08292907d	bee53e54-1412-4710-9db3-c4363434df92	transportation	t	2025-10-17 11:16:36.47+00	2025-10-17 11:16:36.47+00	\N
e2ca12b7-9017-4016-a00c-7600556984ab	bee53e54-1412-4710-9db3-c4363434df92	interpreter	t	2025-10-17 11:16:36.47+00	2025-10-17 11:16:36.47+00	\N
475f3bb3-8463-4fd7-a20f-5d2e0a65fca6	bee53e54-1412-4710-9db3-c4363434df92	chaperone	t	2025-10-17 11:16:36.47+00	2025-10-17 11:16:36.47+00	\N
f3782bc6-9549-4db6-8888-4a4382211161	d6dfbd49-81e4-41c5-adb7-c73b47679d87	transportation	t	2025-10-17 11:16:36.491+00	2025-10-17 11:16:36.491+00	\N
d1c0630a-9e3f-4ee0-9817-929ea1d34ce5	d6dfbd49-81e4-41c5-adb7-c73b47679d87	interpreter	t	2025-10-17 11:16:36.491+00	2025-10-17 11:16:36.491+00	\N
81164dfb-2a45-429c-9e56-9cf9ad0fefa6	d6dfbd49-81e4-41c5-adb7-c73b47679d87	chaperone	t	2025-10-17 11:16:36.491+00	2025-10-17 11:16:36.491+00	\N
efdd3558-79fa-49c3-bf03-894c944c79f4	13bc4987-f74f-45b8-8944-c309eceb8875	transportation	t	2025-10-17 11:16:36.51+00	2025-10-17 11:16:36.51+00	\N
cb5a4d66-8443-430a-9982-8ea2a8dbe304	13bc4987-f74f-45b8-8944-c309eceb8875	interpreter	t	2025-10-17 11:16:36.51+00	2025-10-17 11:16:36.51+00	\N
346a5425-2722-4549-ba14-66ca2afae086	13bc4987-f74f-45b8-8944-c309eceb8875	chaperone	t	2025-10-17 11:16:36.51+00	2025-10-17 11:16:36.51+00	\N
775cbda1-86c7-453d-9e13-028fc1491a76	31061530-8d8a-48de-b94b-9baab292244f	transportation	t	2025-10-17 11:16:36.535+00	2025-10-17 11:16:36.535+00	\N
2db93794-8076-4f91-9de8-e7bacbd00489	31061530-8d8a-48de-b94b-9baab292244f	interpreter	t	2025-10-17 11:16:36.535+00	2025-10-17 11:16:36.535+00	\N
9bac4ba2-c65f-41bb-997c-9ffd19ca617c	31061530-8d8a-48de-b94b-9baab292244f	chaperone	t	2025-10-17 11:16:36.535+00	2025-10-17 11:16:36.535+00	\N
8132583e-6aff-4738-9310-45dc2620c1ea	9b10e6d3-61f1-4922-9b5c-c4b9c1958d22	transportation	t	2025-10-17 11:16:36.555+00	2025-10-17 11:16:36.555+00	\N
14af708f-2baa-4f4a-8c5a-ae393e2903f0	9b10e6d3-61f1-4922-9b5c-c4b9c1958d22	interpreter	t	2025-10-17 11:16:36.555+00	2025-10-17 11:16:36.555+00	\N
5212f58c-befc-46a1-a1e1-280b1b570cda	9b10e6d3-61f1-4922-9b5c-c4b9c1958d22	chaperone	t	2025-10-17 11:16:36.555+00	2025-10-17 11:16:36.555+00	\N
31b65307-c35a-475f-a103-ac509eb47244	a2b996f3-26b6-4db0-b030-4e3a85a910cc	transportation	t	2025-10-17 14:15:56.429+00	2025-10-17 14:15:56.429+00	\N
\.


--
-- Data for Name: examination_transport; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examination_transport (id, examination_service_id, pickup_address_id, raw_lookup, notes, created_at, updated_at, deleted_at) FROM stdin;
7c557460-599b-4788-bcd7-678c61634a29	b2c8cd63-43ee-4c2e-be56-12e08292907d	a31a01b3-5c8e-446e-bd95-83dfcaa019a7	150 King St W, Toronto, ON M5H 4B6, Canada	\N	2025-10-17 11:16:36.477+00	2025-10-17 11:16:36.477+00	\N
40b4127d-8f0b-48d8-aaaf-a181ca0e9fed	f3782bc6-9549-4db6-8888-4a4382211161	d493baf5-1fb6-4797-8f0a-c613cdb7f8ef	150 Nexus Ave, Brampton, ON L6P 3R6, Canada	\N	2025-10-17 11:16:36.498+00	2025-10-17 11:16:36.498+00	\N
fc890616-c77c-4a22-8100-c729e46beab4	efdd3558-79fa-49c3-bf03-894c944c79f4	35841477-086c-4011-8d60-5220631840dc	180 Bd Saint-Joseph, Lachine, QC H8S 0B5, Canada	\N	2025-10-17 11:16:36.516+00	2025-10-17 11:16:36.516+00	\N
1ad504e3-cf9c-4ebd-ac17-93a7ffa1184d	775cbda1-86c7-453d-9e13-028fc1491a76	6abb2887-4f69-4a4a-a489-e1494a8327f6	180 Ch. du Tremblay, Boucherville, QC J4B 6Z6, Canada	\N	2025-10-17 11:16:36.539+00	2025-10-17 11:16:36.539+00	\N
4b6e9b6f-c28b-417b-8c5d-f92794a9d058	8132583e-6aff-4738-9310-45dc2620c1ea	07016958-6c00-4247-bd16-60ed01fff62e	160 John St, Toronto, ON M5V 2E5, Canada	\N	2025-10-17 11:16:36.561+00	2025-10-17 11:16:36.561+00	\N
bfb0edab-6301-4f09-9e3c-51b4475e4b7a	31b65307-c35a-475f-a103-ac509eb47244	3733c24c-e398-4688-8576-906c1114a02b	house 281/106, behing ghosia masjid	\N	2025-10-17 14:15:56.434+00	2025-10-17 14:15:56.434+00	\N
\.


--
-- Data for Name: examination_type_benefits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examination_type_benefits (id, examination_type_id, benefit, created_at, updated_at, deleted_at) FROM stdin;
519b8297-2b50-45ae-920e-dcb81572446f	3d90a829-8917-44fa-9026-606501506cfc	Comprehensive assessment of musculoskeletal injuries and conditions	2025-10-14 16:54:29.501+00	2025-10-14 16:54:29.501+00	\N
ed217b0f-be28-41de-afa6-759dd84e8452	3d90a829-8917-44fa-9026-606501506cfc	Evaluation of range of motion, strength, and functional limitations	2025-10-14 16:54:29.509+00	2025-10-14 16:54:29.509+00	\N
f238abe5-eb45-4c2e-b20a-80af06875500	3d90a829-8917-44fa-9026-606501506cfc	Assessment of spinal disorders, joint injuries, and soft tissue damage	2025-10-14 16:54:29.514+00	2025-10-14 16:54:29.514+00	\N
fe743b68-690f-4797-9ce2-bc7e711cf01c	3d90a829-8917-44fa-9026-606501506cfc	Determination of impairment ratings and disability status	2025-10-14 16:54:29.52+00	2025-10-14 16:54:29.52+00	\N
58cb0d30-4740-4904-a445-aec92eab4c85	3d90a829-8917-44fa-9026-606501506cfc	Analysis of treatment needs and rehabilitation potential	2025-10-14 16:54:29.526+00	2025-10-14 16:54:29.526+00	\N
0007e9ab-8f32-4119-985b-e31395fdb33a	3d90a829-8917-44fa-9026-606501506cfc	Assessment of work capacity and return-to-work capabilities	2025-10-14 16:54:29.531+00	2025-10-14 16:54:29.531+00	\N
c6f7cdf9-1967-485c-a202-89c0016b2328	a2fdda71-c6db-4379-b3a3-2b7d5fd6c2bb	Comprehensive medical history review and physical examination	2025-10-14 16:54:29.539+00	2025-10-14 16:54:29.539+00	\N
86140158-93c0-4f0d-a556-75117650d227	a2fdda71-c6db-4379-b3a3-2b7d5fd6c2bb	Assessment of overall health status and medical conditions	2025-10-14 16:54:29.544+00	2025-10-14 16:54:29.544+00	\N
f40d9f9e-5459-4219-82d8-5fa52700164f	a2fdda71-c6db-4379-b3a3-2b7d5fd6c2bb	Evaluation of chronic diseases and their impact on function	2025-10-14 16:54:29.549+00	2025-10-14 16:54:29.549+00	\N
fe2686c5-1eb6-4107-870b-7a453ec63c8c	a2fdda71-c6db-4379-b3a3-2b7d5fd6c2bb	Review of medication management and treatment compliance	2025-10-14 16:54:29.594+00	2025-10-14 16:54:29.594+00	\N
54195c86-ceea-4ad0-9278-28559ce0e03c	a2fdda71-c6db-4379-b3a3-2b7d5fd6c2bb	Assessment of causation and relatedness to incident or injury	2025-10-14 16:54:29.599+00	2025-10-14 16:54:29.599+00	\N
4db1fb31-6df0-4aa1-9ec1-4c3442821cc0	a2fdda71-c6db-4379-b3a3-2b7d5fd6c2bb	Determination of medical stability and future care requirements	2025-10-14 16:54:29.604+00	2025-10-14 16:54:29.604+00	\N
1c19ebba-9e83-4fba-b35a-ab3be1e4b220	535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	Comprehensive psychological assessment and testing	2025-10-14 16:54:29.612+00	2025-10-14 16:54:29.612+00	\N
b340f305-8a56-41d2-9735-8872d0291eca	535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	Evaluation of cognitive functioning and mental status	2025-10-14 16:54:29.617+00	2025-10-14 16:54:29.617+00	\N
ba12de3e-84c0-4363-8ce2-c2a7c181b7ab	535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	Assessment of emotional and behavioral responses to injury or trauma	2025-10-14 16:54:29.622+00	2025-10-14 16:54:29.622+00	\N
fb51c5f6-4e80-47e2-aa59-e14a8aedff83	535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	Determination of psychological impairment and functional limitations	2025-10-14 16:54:29.628+00	2025-10-14 16:54:29.628+00	\N
5c993744-e68c-4f21-96ac-825cccafc55b	535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	Analysis of coping mechanisms and adjustment to disability	2025-10-14 16:54:29.633+00	2025-10-14 16:54:29.633+00	\N
a46bff05-4279-4af0-b4fe-dfe9cb2fac8f	535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	Assessment of treatment needs and rehabilitation recommendations	2025-10-14 16:54:29.638+00	2025-10-14 16:54:29.638+00	\N
995a6f1c-7fb2-4626-84dd-26be68ae193f	25a7b443-e2a4-4c30-9777-ebe0d358317d	Psychiatric diagnostic evaluation and mental status examination	2025-10-14 16:54:29.646+00	2025-10-14 16:54:29.646+00	\N
9a0927a4-1b21-45d9-8ed2-8faa9374d9b3	25a7b443-e2a4-4c30-9777-ebe0d358317d	Assessment of mood disorders, anxiety, and trauma-related conditions	2025-10-14 16:54:29.651+00	2025-10-14 16:54:29.651+00	\N
4e35c856-e2c1-4056-bc11-d8ecc280eebe	25a7b443-e2a4-4c30-9777-ebe0d358317d	Evaluation of medication effectiveness and treatment response	2025-10-14 16:54:29.695+00	2025-10-14 16:54:29.695+00	\N
05029883-5745-40eb-bfa0-c0e9d8b61438	25a7b443-e2a4-4c30-9777-ebe0d358317d	Determination of psychiatric causation and pre-existing conditions	2025-10-14 16:54:29.703+00	2025-10-14 16:54:29.703+00	\N
3cf4ab9a-f455-4f79-bcb3-f8ce10ed840b	25a7b443-e2a4-4c30-9777-ebe0d358317d	Assessment of functional impairment due to mental health conditions	2025-10-14 16:54:29.709+00	2025-10-14 16:54:29.709+00	\N
701355ff-d181-454b-8b5d-86d8cac91af4	25a7b443-e2a4-4c30-9777-ebe0d358317d	Analysis of capacity for work and daily living activities	2025-10-14 16:54:29.715+00	2025-10-14 16:54:29.715+00	\N
2f226f6a-2275-4f19-9791-9ecf78200cde	aefad578-eaf5-4e0d-b535-939ce8fbc26c	Comprehensive neurological examination and assessment	2025-10-14 16:54:29.724+00	2025-10-14 16:54:29.724+00	\N
cc412962-20ff-4b0e-87e9-cf0d5aa066e3	aefad578-eaf5-4e0d-b535-939ce8fbc26c	Evaluation of brain injury, cognitive deficits, and neurological disorders	2025-10-14 16:54:29.73+00	2025-10-14 16:54:29.73+00	\N
2addb68d-ac3e-4e6f-9e01-1b741d47347f	aefad578-eaf5-4e0d-b535-939ce8fbc26c	Assessment of sensory, motor, and reflex functions	2025-10-14 16:54:29.738+00	2025-10-14 16:54:29.738+00	\N
030bbd16-78e7-470d-b592-0fcc36bd770c	aefad578-eaf5-4e0d-b535-939ce8fbc26c	Determination of neurological impairment and prognosis	2025-10-14 16:54:29.744+00	2025-10-14 16:54:29.744+00	\N
cc5189f4-75eb-48b6-ad80-1026d20006d4	aefad578-eaf5-4e0d-b535-939ce8fbc26c	Analysis of causation for neurological symptoms and conditions	2025-10-14 16:54:29.749+00	2025-10-14 16:54:29.749+00	\N
98cd32cd-6192-4fe4-ad9f-12372edaabb0	aefad578-eaf5-4e0d-b535-939ce8fbc26c	Assessment of rehabilitation needs and treatment recommendations	2025-10-14 16:54:29.791+00	2025-10-14 16:54:29.791+00	\N
1d335a23-203f-4562-95fa-4c1d7a734e96	1bc151cc-8eda-4c24-83b1-0776032920a7	Age-appropriate medical assessment for children and adolescents	2025-10-14 16:54:29.8+00	2025-10-14 16:54:29.8+00	\N
c6d89e86-f728-4741-9327-5fc9448c1f69	1bc151cc-8eda-4c24-83b1-0776032920a7	Evaluation of developmental milestones and growth patterns	2025-10-14 16:54:29.805+00	2025-10-14 16:54:29.805+00	\N
5b7b317f-5830-4496-8fb8-b83e92b85904	1bc151cc-8eda-4c24-83b1-0776032920a7	Assessment of pediatric injuries and medical conditions	2025-10-14 16:54:29.81+00	2025-10-14 16:54:29.81+00	\N
bae56aa9-d0fb-41a3-9f22-94852b3a958a	1bc151cc-8eda-4c24-83b1-0776032920a7	Review of treatment history and ongoing medical needs	2025-10-14 16:54:29.816+00	2025-10-14 16:54:29.816+00	\N
36417b9d-7660-44d7-88fd-04e696abbd96	1bc151cc-8eda-4c24-83b1-0776032920a7	Evaluation of impact on education and developmental functioning	2025-10-14 16:54:29.821+00	2025-10-14 16:54:29.821+00	\N
c8ef382f-676b-40f9-b19d-3572d9ed3757	1bc151cc-8eda-4c24-83b1-0776032920a7	Assessment of long-term care requirements and prognosis	2025-10-14 16:54:29.826+00	2025-10-14 16:54:29.826+00	\N
28575b39-f95b-4efe-aea3-67ca00dca198	7bbeaa97-e062-484c-9463-1533eca2db69	Comprehensive geriatric assessment for elderly claimants	2025-10-14 16:54:29.836+00	2025-10-14 16:54:29.836+00	\N
fb0b6f73-46e2-43dd-8dc8-d994e6768a42	7bbeaa97-e062-484c-9463-1533eca2db69	Evaluation of age-related medical conditions and comorbidities	2025-10-14 16:54:29.842+00	2025-10-14 16:54:29.842+00	\N
47a1af63-e061-4f75-823d-5efc0fe1429e	7bbeaa97-e062-484c-9463-1533eca2db69	Assessment of functional decline and independence levels	2025-10-14 16:54:29.847+00	2025-10-14 16:54:29.847+00	\N
1cc6885b-fa9a-46df-8cd4-f64ee8e0c131	7bbeaa97-e062-484c-9463-1533eca2db69	Review of medication management and polypharmacy issues	2025-10-14 16:54:29.852+00	2025-10-14 16:54:29.852+00	\N
3c2e676d-78f8-4bed-b169-c88b11676d36	7bbeaa97-e062-484c-9463-1533eca2db69	Evaluation of cognitive function and capacity	2025-10-14 16:54:29.894+00	2025-10-14 16:54:29.894+00	\N
17469e23-0e2b-4051-b2a7-995025cdd3ba	7bbeaa97-e062-484c-9463-1533eca2db69	Assessment of long-term care needs and quality of life factors	2025-10-14 16:54:29.9+00	2025-10-14 16:54:29.9+00	\N
1b32c260-4acb-4e0a-9e3d-2daa7483d50d	8e8f9756-69e7-4a99-bdfb-3005d7bdc255	Comprehensive cardiovascular assessment and examination	2025-10-14 16:54:29.909+00	2025-10-14 16:54:29.909+00	\N
f0125276-edfd-452c-b970-efd04f8725ff	8e8f9756-69e7-4a99-bdfb-3005d7bdc255	Evaluation of heart disease, arrhythmias, and vascular conditions	2025-10-14 16:54:29.914+00	2025-10-14 16:54:29.914+00	\N
41a0a462-219f-4ed1-bea4-66c3fb28a132	8e8f9756-69e7-4a99-bdfb-3005d7bdc255	Assessment of cardiac functional capacity and limitations	2025-10-14 16:54:29.92+00	2025-10-14 16:54:29.92+00	\N
6ba84155-f4b9-445c-9e17-8438e8a3076a	8e8f9756-69e7-4a99-bdfb-3005d7bdc255	Review of diagnostic testing and treatment interventions	2025-10-14 16:54:29.926+00	2025-10-14 16:54:29.926+00	\N
97754e65-b072-41f7-9968-212d1e6a001c	8e8f9756-69e7-4a99-bdfb-3005d7bdc255	Determination of cardiac impairment and disability status	2025-10-14 16:54:29.932+00	2025-10-14 16:54:29.932+00	\N
e5557bab-c02e-4a05-be08-bc88133285d5	8e8f9756-69e7-4a99-bdfb-3005d7bdc255	Assessment of work capacity and activity restrictions	2025-10-14 16:54:29.938+00	2025-10-14 16:54:29.938+00	\N
f31d50f1-be3d-4f4c-9724-249fcc7c2506	762cb5f1-81e4-4f6b-90c4-ad14a1192d3d	Specialized medical assessment based on specific case requirements	2025-10-14 16:54:29.946+00	2025-10-14 16:54:29.946+00	\N
367e7b17-94e3-4825-8149-622d78ede03d	762cb5f1-81e4-4f6b-90c4-ad14a1192d3d	Evaluation by appropriate medical specialty as needed	2025-10-14 16:54:29.991+00	2025-10-14 16:54:29.991+00	\N
40c9acdf-fdd5-4a38-95fd-88100cae63ca	762cb5f1-81e4-4f6b-90c4-ad14a1192d3d	Comprehensive review of medical records and diagnostic findings	2025-10-14 16:54:29.996+00	2025-10-14 16:54:29.996+00	\N
bae6eebb-10af-4b19-a16d-6f1608ce13d9	762cb5f1-81e4-4f6b-90c4-ad14a1192d3d	Assessment of impairment and functional limitations	2025-10-14 16:54:30.007+00	2025-10-14 16:54:30.007+00	\N
f0ed62c1-3312-42ca-af96-20f2a6405045	762cb5f1-81e4-4f6b-90c4-ad14a1192d3d	Determination of causation and treatment needs	2025-10-14 16:54:30.02+00	2025-10-14 16:54:30.02+00	\N
37ed94fc-3c8f-446d-8d29-05fde6131ab7	762cb5f1-81e4-4f6b-90c4-ad14a1192d3d	Recommendations for ongoing care and rehabilitation	2025-10-14 16:54:30.026+00	2025-10-14 16:54:30.026+00	\N
\.


--
-- Data for Name: examination_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examination_types (id, name, short_form, description, created_at, updated_at, deleted_at) FROM stdin;
25a7b443-e2a4-4c30-9777-ebe0d358317d	Psychiatry	PSY	Medical specialty focused on mental health disorders	2025-10-14 16:54:29.197+00	2025-10-14 16:54:29.296+00	\N
535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	Psychological	PSO	Specialty dealing with psychological assessments and therapies	2025-10-14 16:54:29.206+00	2025-10-14 16:54:29.302+00	\N
aefad578-eaf5-4e0d-b535-939ce8fbc26c	Neurological	NEU	Medical specialty focused on disorders of the nervous system	2025-10-14 16:54:29.211+00	2025-10-14 16:54:29.306+00	\N
3d90a829-8917-44fa-9026-606501506cfc	Orthopedic	ORT	Medical specialty dealing with the musculoskeletal system	2025-10-14 16:54:29.219+00	2025-10-14 16:54:29.309+00	\N
a2fdda71-c6db-4379-b3a3-2b7d5fd6c2bb	General Medicine	GEN	Comprehensive medical care for adults	2025-10-14 16:54:29.226+00	2025-10-14 16:54:29.312+00	\N
1bc151cc-8eda-4c24-83b1-0776032920a7	Pediatric Medicine	PED	Medical specialty focused on the care of infants, children, and adolescents	2025-10-14 16:54:29.233+00	2025-10-14 16:54:29.316+00	\N
7bbeaa97-e062-484c-9463-1533eca2db69	Geriatric Medicine	GER	Medical specialty focused on health care of elderly people	2025-10-14 16:54:29.24+00	2025-10-14 16:54:29.319+00	\N
8e8f9756-69e7-4a99-bdfb-3005d7bdc255	Cardiology	CAR	Medical specialty dealing with disorders of the heart and blood vessels	2025-10-14 16:54:29.246+00	2025-10-14 16:54:29.323+00	\N
762cb5f1-81e4-4f6b-90c4-ad14a1192d3d	Other	OTH	Other medical specialties not specifically listed	2025-10-14 16:54:29.252+00	2025-10-14 16:54:29.326+00	\N
8f9bc5db-f5d7-48d1-942c-a473dda5cdb9	Orthopedic Assessment	Orthopedic	Orthopedic Assessment examination	2025-10-14 16:54:31.516+00	2025-10-14 16:54:31.516+00	\N
0707b6a9-44d4-4741-8510-0e84792803e6	Psychiatric Evaluation	Psychiatric	Psychiatric Evaluation examination	2025-10-14 16:54:31.602+00	2025-10-14 16:54:31.602+00	\N
a642c1f1-4360-4e1b-a772-cf9f01eb6138	Functional Capacity Evaluation	Functional	Functional Capacity Evaluation examination	2025-10-14 16:54:31.648+00	2025-10-14 16:54:31.648+00	\N
b1f2b08f-15ae-493e-9f5d-c0444df6bfac	Neurological Assessment	Neurological	Neurological Assessment examination	2025-10-14 16:54:31.797+00	2025-10-14 16:54:31.797+00	\N
eec1f9a8-4752-4fd3-a01e-bb1e89b361dd	Psychological Assessment	Psychological	Psychological Assessment examination	2025-10-14 16:54:31.922+00	2025-10-14 16:54:31.922+00	\N
8c520d29-a303-4d94-beb9-6b5c535e9d35	Internal Medicine Assessment	Internal	Internal Medicine Assessment examination	2025-10-14 16:54:32.142+00	2025-10-14 16:54:32.142+00	\N
\.


--
-- Data for Name: examinations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examinations (id, case_number, case_id, examination_type_id, due_date, notes, additional_notes, urgency_level, examiner_id, status_id, preference, support_person, assign_to_id, assigned_at, created_at, updated_at, deleted_at) FROM stdin;
f1242fc6-0874-43e9-b405-6f139dcf1471	ORT-2025-1048	e0ce9b20-489f-4e0b-8ca5-f27d9e3960df	8f9bc5db-f5d7-48d1-942c-a473dda5cdb9	2025-04-18 00:00:00+00	Motor vehicle accident, lower back pain, requires urgent assessment	\N	HIGH	\N	bbfa26e3-74f7-42c4-aa06-8d4002fabe44	IN_PERSON	f	\N	\N	2025-10-14 16:54:31.523+00	2025-10-14 16:54:31.523+00	\N
65e69198-a4ee-44ca-a73d-bf99c91e4642	ORT-2025-1049	66ee5cf1-c857-46fa-ada8-a20665903186	0707b6a9-44d4-4741-8510-0e84792803e6	2025-04-25 00:00:00+00	Anxiety and depression, workplace stress claim	\N	MEDIUM	\N	bbfa26e3-74f7-42c4-aa06-8d4002fabe44	VIRTUAL	f	\N	\N	2025-10-14 16:54:31.608+00	2025-10-14 16:54:31.608+00	\N
dced52c3-2c3d-4847-aa36-eeb4d89d7843	ORT-2025-1050	6569cd39-2261-46b9-b8d5-4b713ac67961	a642c1f1-4360-4e1b-a772-cf9f01eb6138	2025-05-01 00:00:00+00	Shoulder injury from repetitive work tasks	\N	MEDIUM	\N	bbfa26e3-74f7-42c4-aa06-8d4002fabe44	EITHER	f	\N	\N	2025-10-14 16:54:31.652+00	2025-10-14 16:54:31.652+00	\N
8614fa8e-3295-4153-96f0-d36a20ff7869	ORT-2025-0891	c810e3de-f884-4626-8b2d-a5eeb48040dd	b1f2b08f-15ae-493e-9f5d-c0444df6bfac	2025-04-20 00:00:00+00	Head injury from rear-end collision, awaiting examiner assignment	\N	HIGH	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	IN_PERSON	f	\N	\N	2025-10-14 16:54:31.803+00	2025-10-14 16:54:31.803+00	\N
8bd9557f-223c-450e-bf4a-97d18a489ce4	ORT-2025-0892	2e6d2cc3-fa9a-4e6d-8e30-171de3917a45	8f9bc5db-f5d7-48d1-942c-a473dda5cdb9	2025-04-28 00:00:00+00	Knee injury from workplace slip, pending claimant availability	\N	MEDIUM	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-14 16:54:31.84+00	2025-10-14 16:54:31.84+00	\N
1d252f32-0989-40b2-9e40-7de5bdee97eb	ORT-2025-0765	ba5eed2f-a26a-4bc9-9b2d-1f9c6b3a3dae	eec1f9a8-4752-4fd3-a01e-bb1e89b361dd	2025-05-10 00:00:00+00	PTSD symptoms post-accident, examiner assigned, awaiting scheduling	\N	LOW	\N	b44cc369-d1f5-4c1f-92f0-c75ee79bafe9	EITHER	f	\N	\N	2025-10-14 16:54:31.926+00	2025-10-14 16:54:31.926+00	\N
bc746996-a0e6-4cec-94f0-b8d65259fd6a	ORT-2025-0766	d5ed3a0e-ab4c-49a5-9705-938a83f3c8dd	8f9bc5db-f5d7-48d1-942c-a473dda5cdb9	2025-05-05 00:00:00+00	Back injury from lifting, ready to schedule appointment	\N	MEDIUM	\N	b44cc369-d1f5-4c1f-92f0-c75ee79bafe9	IN_PERSON	f	\N	\N	2025-10-14 16:54:32.004+00	2025-10-14 16:54:32.004+00	\N
3dc1e87c-0742-4c1e-b294-8a47cb7531a4	ORT-2025-0650	81be77d7-5220-4e30-ba6b-6d4971182e3c	8f9bc5db-f5d7-48d1-942c-a473dda5cdb9	2025-04-22 00:00:00+00	Neck and shoulder pain, appointment confirmed for next week	\N	MEDIUM	\N	8d54df0b-ca1c-49fd-937b-8404b3631571	IN_PERSON	f	\N	\N	2025-10-14 16:54:32.094+00	2025-10-14 16:54:32.094+00	\N
be085e81-f504-482a-a706-65af148c7a72	ORT-2025-0651	1a9c267d-0b88-4464-9f93-7a861745878e	8c520d29-a303-4d94-beb9-6b5c535e9d35	2025-04-30 00:00:00+00	Chronic fatigue syndrome evaluation scheduled	\N	LOW	\N	8d54df0b-ca1c-49fd-937b-8404b3631571	VIRTUAL	f	\N	\N	2025-10-14 16:54:32.151+00	2025-10-14 16:54:32.151+00	\N
bee53e54-1412-4710-9db3-c4363434df92	CAR-2025-1	022ebce0-7419-408d-8f85-8512d27223c6	8e8f9756-69e7-4a99-bdfb-3005d7bdc255	2025-10-20 00:00:00+00	Hello Hello Hello		HIGH	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-17 11:16:36.453+00	2025-10-17 11:16:36.453+00	\N
d6dfbd49-81e4-41c5-adb7-c73b47679d87	ORT-2025-1051	022ebce0-7419-408d-8f85-8512d27223c6	a642c1f1-4360-4e1b-a772-cf9f01eb6138	2025-10-19 00:00:00+00	Hello Hello Hello Hello		HIGH	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-17 11:16:36.485+00	2025-10-17 11:16:36.485+00	\N
13bc4987-f74f-45b8-8944-c309eceb8875	ORT-2025-652	022ebce0-7419-408d-8f85-8512d27223c6	8c520d29-a303-4d94-beb9-6b5c535e9d35	2025-10-19 00:00:00+00	fdeshdgatehzjthrsg		MEDIUM	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	EITHER	f	\N	\N	2025-10-17 11:16:36.504+00	2025-10-17 11:16:36.504+00	\N
31061530-8d8a-48de-b94b-9baab292244f	NEU-2025-1	022ebce0-7419-408d-8f85-8512d27223c6	aefad578-eaf5-4e0d-b535-939ce8fbc26c	2025-10-27 00:00:00+00	ytrtjdghfsdkujhgfbrveds		HIGH	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-17 11:16:36.526+00	2025-10-17 11:16:36.526+00	\N
9b10e6d3-61f1-4922-9b5c-c4b9c1958d22	ORT-2025-1	022ebce0-7419-408d-8f85-8512d27223c6	3d90a829-8917-44fa-9026-606501506cfc	2025-10-21 00:00:00+00	7ilukyjthrgfedwqsmuyjnhtbgrvfdecwsumynhtbgrfvecdwxsqkmuyjnhtbgrfvedc		LOW	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-17 11:16:36.546+00	2025-10-17 11:16:36.546+00	\N
f6a8178a-e849-426a-b1ad-d999d01c1e16	GEN-2025-1	d905b881-0843-42d8-acd7-4b9ea0eb65ff	a2fdda71-c6db-4379-b3a3-2b7d5fd6c2bb	2025-10-17 00:00:00+00	mjmjmmmm		MEDIUM	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-17 13:54:17.081+00	2025-10-17 13:54:17.081+00	\N
dccee4da-b9c4-4cc6-88a5-e4696b7c69c8	ORT-2025-1052	51724b34-5845-4381-8b76-4bb914bd6423	a642c1f1-4360-4e1b-a772-cf9f01eb6138	2025-10-17 00:00:00+00	asaassasas		LOW	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	EITHER	f	\N	\N	2025-10-17 13:58:55.021+00	2025-10-17 13:58:55.021+00	\N
730c93d5-cece-4973-831d-6d813a6cba9f	ORT-2025-1050	76e50c70-9507-48b9-b845-450c13227797	0707b6a9-44d4-4741-8510-0e84792803e6	2025-10-25 00:00:00+00	sssssss		MEDIUM	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	IN_PERSON	f	\N	\N	2025-10-17 13:59:55.67+00	2025-10-17 13:59:55.67+00	\N
c2a8003a-feef-444c-b861-2d4b0d1ebd81	ORT-2025-892	255fb3f0-c54d-4998-b339-fd15b975541c	b1f2b08f-15ae-493e-9f5d-c0444df6bfac	2025-10-18 00:00:00+00	ssasasas		MEDIUM	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-17 14:00:39.232+00	2025-10-17 14:00:39.232+00	\N
aed67577-c93e-4fd7-9d09-b4c37ca07c14	ORT-2025-893	ab2cc326-bd22-4994-842d-fdbd5eeeef9f	b1f2b08f-15ae-493e-9f5d-c0444df6bfac	2025-10-22 00:00:00+00	specific notes		HIGH	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-17 14:07:38.986+00	2025-10-17 14:07:38.986+00	\N
6d60721a-ba16-4012-a0f8-bcb41bf3b4ac	PSO-2025-1	cad58099-6c61-4769-9851-0f0b2a3b1659	535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	2025-10-29 00:00:00+00	hjhjvhjvhvh		HIGH	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	VIRTUAL	f	\N	\N	2025-10-17 14:14:44.871+00	2025-10-17 14:14:44.871+00	\N
a2b996f3-26b6-4db0-b030-4e3a85a910cc	PSO-2025-2	e4bce677-0b54-4451-8cbc-4da66274df32	535ffe1a-0f16-44f2-8c6d-5ad8c0db501d	2025-10-17 00:00:00+00	mnmnmnmnmn		HIGH	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	EITHER	f	\N	\N	2025-10-17 14:15:56.418+00	2025-10-17 14:15:56.418+00	\N
8161b825-f901-4f28-a411-e86ad4537822	ORT-2025-2	59ccfd77-5409-4dce-98c5-14a917d869b7	3d90a829-8917-44fa-9026-606501506cfc	2025-10-22 00:00:00+00	 mbjjgvhbjbj		MEDIUM	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	EITHER	f	\N	\N	2025-10-17 14:29:48.585+00	2025-10-17 14:29:48.585+00	\N
b2c1d701-937e-4272-8976-f0f8ebe2337f	PED-2025-1	79f24159-2807-48e6-adc1-29741cd37d1e	1bc151cc-8eda-4c24-83b1-0776032920a7	2025-10-17 00:00:00+00	jduhjbdkjs		MEDIUM	\N	5d98ff71-e2ad-4987-90fc-7f6ffe146b7c	EITHER	f	\N	\N	2025-10-17 15:02:45.161+00	2025-10-17 15:02:45.161+00	\N
\.


--
-- Data for Name: examiner_languages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examiner_languages (id, examiner_profile_id, language_id, created_at, updated_at) FROM stdin;
268de615-9747-446b-bc81-9c903dc5d150	b44f16f0-8241-4a7d-8b18-201e0e73e679	173bf165-a8d4-4015-b6c0-def190833e90	2025-10-14 16:54:30.346+00	2025-10-14 16:54:30.346+00
9bf21fcc-a9ba-488d-ac74-ba95353614d9	b44f16f0-8241-4a7d-8b18-201e0e73e679	9f7476aa-adbf-4e94-8e59-7292e8559ccc	2025-10-14 16:54:30.354+00	2025-10-14 16:54:30.354+00
d5f07737-aa28-405c-8918-27a91f174ecd	d2ca5d45-66d1-434f-85cb-df53dbf4de55	173bf165-a8d4-4015-b6c0-def190833e90	2025-10-14 16:54:30.709+00	2025-10-14 16:54:30.709+00
193bca72-6b26-4ea4-9e3f-69122a2854ae	88016e6a-b2eb-4a1e-a3d7-364afe08cfff	173bf165-a8d4-4015-b6c0-def190833e90	2025-10-14 16:54:31.023+00	2025-10-14 16:54:31.023+00
36435a44-36be-4bbb-97d0-05a0e9101674	88016e6a-b2eb-4a1e-a3d7-364afe08cfff	d96f075c-b90b-4aa8-a88a-3b8a6bac3fe4	2025-10-14 16:54:31.029+00	2025-10-14 16:54:31.029+00
e9b3aa02-d9b8-4389-a755-2e8241f101fe	54044bcd-f39d-4a8f-b741-47dee8557a0c	173bf165-a8d4-4015-b6c0-def190833e90	2025-10-14 16:54:31.339+00	2025-10-14 16:54:31.339+00
a412d797-4cf7-44d4-8e74-c04d1a8ee617	54044bcd-f39d-4a8f-b741-47dee8557a0c	9f7476aa-adbf-4e94-8e59-7292e8559ccc	2025-10-14 16:54:31.345+00	2025-10-14 16:54:31.345+00
9a5f712c-a97b-4cd5-bfbb-4b1dab220248	94ca49bb-857c-4253-9219-f7469f2f605e	173bf165-a8d4-4015-b6c0-def190833e90	2025-10-16 23:07:29.675+00	2025-10-16 23:07:29.675+00
476ad552-2ae6-4615-86e9-a9430ebd4fd1	97d471cd-cbda-47f2-810e-221a7cfd7a64	9f7476aa-adbf-4e94-8e59-7292e8559ccc	2025-10-16 23:47:20.156+00	2025-10-16 23:47:20.156+00
55998d6d-db1c-4cb6-a5bc-62011b725d43	97d471cd-cbda-47f2-810e-221a7cfd7a64	d96f075c-b90b-4aa8-a88a-3b8a6bac3fe4	2025-10-16 23:47:20.156+00	2025-10-16 23:47:20.156+00
825ec8d7-24dd-4b4a-8f90-210f77acbb0b	b47381c5-ee6b-4750-894a-90f58c4b2256	173bf165-a8d4-4015-b6c0-def190833e90	2025-10-17 00:43:11.557+00	2025-10-17 00:43:11.557+00
c36afd88-6616-4d75-b509-8e4547ddf268	b47381c5-ee6b-4750-894a-90f58c4b2256	d96f075c-b90b-4aa8-a88a-3b8a6bac3fe4	2025-10-17 00:43:11.557+00	2025-10-17 00:43:11.557+00
16e3f8e9-2dd9-4ea0-928c-e06ba0641067	b47381c5-ee6b-4750-894a-90f58c4b2256	9f7476aa-adbf-4e94-8e59-7292e8559ccc	2025-10-17 00:43:11.557+00	2025-10-17 00:43:11.557+00
8b199c77-cbd7-4916-8613-470fd6ebaafb	ddd98b34-b5c4-4ce7-928a-e4a1f0adbec5	173bf165-a8d4-4015-b6c0-def190833e90	2025-10-17 14:56:00.982+00	2025-10-17 14:56:00.982+00
f0637212-9613-4d05-9b6c-c1ea294b9c4f	ddd98b34-b5c4-4ce7-928a-e4a1f0adbec5	d96f075c-b90b-4aa8-a88a-3b8a6bac3fe4	2025-10-17 14:56:00.982+00	2025-10-17 14:56:00.982+00
d9de8ed2-5842-4854-a335-bfc0dc05195c	ddd98b34-b5c4-4ce7-928a-e4a1f0adbec5	9f7476aa-adbf-4e94-8e59-7292e8559ccc	2025-10-17 14:56:00.982+00	2025-10-17 14:56:00.982+00
e7f18e4e-b7f4-4103-b449-a0934d0fc494	d1963fe0-7548-47cb-88db-c02ec31526f7	173bf165-a8d4-4015-b6c0-def190833e90	2025-10-17 15:19:24.119+00	2025-10-17 15:19:24.119+00
379df347-6439-4a8c-93ba-de34bd1083c3	d1963fe0-7548-47cb-88db-c02ec31526f7	d96f075c-b90b-4aa8-a88a-3b8a6bac3fe4	2025-10-17 15:19:24.119+00	2025-10-17 15:19:24.119+00
\.


--
-- Data for Name: examiner_override_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examiner_override_hours (id, examiner_profile_id, date, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: examiner_override_time_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examiner_override_time_slots (id, override_hour_id, start_time, end_time, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: examiner_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examiner_profiles (id, account_id, province_of_residence, mailing_address, specialties, license_number, province_of_licensure, license_expiry_date, medical_license_document_id, resume_document_id, nda_document_id, insurance_document_id, is_forensic_assessment_trained, years_of_ime_experience, bio, is_consent_to_background_verification, agree_to_terms, status, approved_by, approved_at, rejected_by, rejected_at, rejected_reason, "createdAt", "updatedAt", "deletedAt", accept_virtual_assessments, max_travel_distance, preferred_regions, activation_step, assessment_types, advance_booking, buffer_time, account_number, cheque_mailing_address, institution_number, interac_email, payout_method, transit_number) FROM stdin;
b44f16f0-8241-4a7d-8b18-201e0e73e679	e4a69daf-474c-4847-8ddd-e351d6ae3197	Ontario	123 Medical Drive, Toronto, ON M5H 2N2	{orthopedic-surgery,sports-medicine}	CPSO-12345	Ontario	2026-12-31	819c7048-cc9f-4eb5-ae10-53d609a44010	0e2f0292-2fcc-45f0-b626-2b0077ca8c87	6cd7cdfb-fb2d-4f9f-ae3f-c641af8f9b7a	8751d2e7-f289-42c3-8ffc-2cc0623da8fa	t	more-than-3	Experienced orthopedic surgeon with over 15 years of clinical practice and 5 years of IME experience. Specializing in musculoskeletal injuries and workplace assessments.	t	t	ACCEPTED	\N	2025-10-14 16:54:30.319+00	\N	\N	\N	2025-10-14 16:54:30.32+00	2025-10-14 16:54:30.32+00	\N	t	100 km	Greater Toronto Area, Hamilton, Niagara Region	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d2ca5d45-66d1-434f-85cb-df53dbf4de55	b159817e-ef1f-4bd9-9584-f07989889639	British Columbia  	456 Healthcare Ave, Vancouver, BC V6B 2P1	{psychiatry,neurology}	CPSBC-67890	British Columbia  	2027-06-30	993fc151-20c1-44b5-b6b2-6352659029b3	9e4dd753-0b34-4759-bd94-34c5f633b8c9	5374d798-5ea8-4c9d-a967-c8ad9e303017	286742ec-da56-44f0-a31d-d9c595421d66	t	2-3	Board-certified psychiatrist with expertise in mental health assessments for legal and insurance purposes. Strong background in forensic psychiatry.	t	t	ACCEPTED	\N	2025-10-14 16:54:30.628+00	\N	\N	\N	2025-10-14 16:54:30.629+00	2025-10-14 16:54:30.629+00	\N	t	50 km	Vancouver, Surrey, Burnaby, Richmond	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
88016e6a-b2eb-4a1e-a3d7-364afe08cfff	cf1caa36-6dc9-48c9-b601-41ce0afb321e	Ontario	789 Wellness Street, Ottawa, ON K1A 0A9	{cardiology,internal-medicine}	CPSO-23456	Ontario	2026-03-31	1d8eeb21-cbed-4448-8228-42323fd1cd19	cc84af53-0287-4b8d-9640-871878ecb621	ba77abdb-6839-4f64-aa83-552807298b12	6e53f48c-f813-4fce-a480-54850d3564b0	f	1-2	Cardiologist with extensive experience in cardiovascular assessments and occupational health evaluations.	t	t	PENDING	\N	\N	\N	\N	\N	2025-10-14 16:54:31.001+00	2025-10-14 16:54:31.001+00	\N	f	75 km	Ottawa, Gatineau, Eastern Ontario	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
54044bcd-f39d-4a8f-b741-47dee8557a0c	643b0534-b5e9-485a-9cef-701d21e91c75	Manitoba	321 Health Plaza, Winnipeg, MB R3C 3G1	{family-medicine,emergency-medicine}	CPSM-34567	Manitoba	\N	977f86e9-e50f-45f0-9e49-07ffc6274ced	7caeafb1-31a0-4a90-a756-50fd887ce52b	7d76da6a-9c69-4739-b3e6-26b2511cf9f2	e9ca3593-aa48-4bfb-9b16-5abd3fd4dd0f	f	less-than-1	Family physician transitioning into independent medical examinations. Committed to providing thorough and objective assessments.	t	t	PENDING	\N	\N	\N	\N	\N	2025-10-14 16:54:31.319+00	2025-10-14 16:54:31.319+00	\N	t	150 km	Winnipeg, Brandon, Steinbach	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
94ca49bb-857c-4253-9219-f7469f2f605e	fe7cc7bc-e6f2-41d7-a047-d23dd62fbb24	Ontario	asdsadsd askdskdsd	{cardiology}	123124213	Ontario	\N	e5225f58-aead-4c58-b3d1-7f72ce6065bf	80826381-b9ff-49c4-8c70-9a593096de1b	\N	\N	t	1-2	asdksdksdk ka kksakdskd ksa dksk sa sa 	t	t	PENDING	\N	\N	\N	\N	\N	2025-10-16 23:07:29.653+00	2025-10-16 23:07:29.653+00	\N	t	up-to-25-km	hamilton	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
97d471cd-cbda-47f2-810e-221a7cfd7a64	860816bd-1068-4f8b-b58a-686c222b84fd	Ontario	150 John St, Toronto, ON M5V 3C3, Canada	{cardiology,anesthesiology,dermatology}	CPSO # 73822	Ontario	\N	784169c4-34a4-4afb-8aab-1d38e6760eea	586c7c43-aff2-4c0f-a51c-7d5049e5c15c	\N	\N	t	2-3	Hello Hello Hello	t	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-16 23:53:09.066+00	\N	\N	\N	2025-10-16 23:47:20.132+00	2025-10-16 23:53:09.067+00	\N	t	up-to-50-km	ottawa,hamilton,london	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b47381c5-ee6b-4750-894a-90f58c4b2256	698ac4fc-b8ab-4e04-96eb-b3fd92fc84e2	British Columbia  	150 John St, Eganville, ON K0J 1T0, Canada	{cardiology,anesthesiology}	CPSO # 56373	Manitoba	\N	de280bcd-bbe7-4a84-9dcf-4017606b04ef	cb7e8a89-31bb-4c77-8eff-df53f7fade89	\N	\N	t	more-than-3	Hello Hello Hello Hello	t	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 00:45:09.574+00	\N	\N	\N	2025-10-16 23:28:12.236+00	2025-10-17 00:45:09.576+00	\N	t	up-to-100-km	toronto,ottawa	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ddd98b34-b5c4-4ce7-928a-e4a1f0adbec5	957b29e7-18b3-4953-a471-b112d905c597	New Brunswick	2131 Williams Pkwy, Brampton, ON L6S 6B8, Canada	{cardiology,anesthesiology}	123423	Ontario	\N	446f3eb0-bf40-4dbb-bbcb-00d20a674eaa	601cf6df-f32c-4894-840f-7c0402a6921d	\N	\N	t	1-2	kaskdkasdks	t	t	PENDING	\N	\N	\N	\N	\N	2025-10-17 14:56:00.961+00	2025-10-17 14:56:00.961+00	\N	t	up-to-50-km	toronto,ottawa,hamilton	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d1963fe0-7548-47cb-88db-c02ec31526f7	5e89636d-d9a6-4001-88e3-e56b0069d185	Ontario	150 John St, Toronto, ON M5V 3C3, Canada	{anesthesiology,cardiology,dermatology}	CPSO # 55677	British Columbia  	\N	6f3a1086-6d7e-4e8c-b83b-5513435fe9aa	bf4d5eb0-ee25-4a82-81d0-7e47cf7ca15d	\N	\N	t	more-than-3	I want to share some details about my past experience.	t	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 15:23:41.592+00	\N	\N	\N	2025-10-17 15:19:24.105+00	2025-10-17 15:23:41.593+00	\N	t	up-to-100-km	ottawa,toronto	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: examiner_weekly_hours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examiner_weekly_hours (id, examiner_profile_id, day_of_week, enabled, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: examiner_weekly_time_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.examiner_weekly_time_slots (id, weekly_hour_id, start_time, end_time, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: insurances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.insurances (id, email_address, company_name, contact_person, policy_number, claim_number, date_of_loss, policy_holder_is_claimant, policy_holder_first_name, policy_holder_last_name, phone_number, fax_number, address_id) FROM stdin;
39e402a1-4623-4afe-ba6d-fdcaf4e76639	mahrozabass+125@gmail.com	Byte Wise	John Wiiliams	8845666	8452156	2025-10-06 00:00:00+00	t	Mahroz	Abbas	1 (254) 898-6666	1 (254) 888-9965	fbab5f97-88bd-4f87-9908-98471e5bb1e9
f54d7633-110a-4e8a-a8a7-15b1434301ec	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-09-30 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	346bd004-edae-40b0-b23b-ed074b0a0d73
88b92503-a642-4a70-bec1-fb09ab48d43d	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-09-30 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	10f037e8-cf5d-4f7c-81d8-6cf00ddd8781
f980d8d5-760a-4840-bc9a-58653b5c3a78	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-09-30 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	e7de545a-f104-4c5e-85af-838952c2869a
8245e2a9-2f91-483c-91bd-63e8d67b870c	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-09-30 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	28ec52f3-2ff8-4821-bb4a-f5977f56323e
08380361-6ac4-457a-9d36-fc00bffcc9fa	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-09-30 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	14e755a2-5301-4241-9a80-735f93873c33
d79d04c8-dcb3-4d10-b1a1-7d33e9c0b4ee	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-10-01 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	c24bc6c5-3e4d-4e91-9d46-43bf8e504758
c3c7e4f9-6f45-4434-bfbd-885bf6023786	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-09-30 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	364cbb23-d50c-4236-b728-6e5f49315e1e
de010c78-3060-4a12-96fd-e2e534644f45	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-10-08 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	a59605e3-0537-496e-ad81-44aa87ff079d
f0f3120f-43c6-4c29-869d-a0568dcab880	sajeel+eSS@buildmeapp.io	abcdef	Sajeel Ahmad	2332323	11111	2025-09-30 00:00:00+00	t	Sajeel Ahmad	Ahmad	(234) 233-3322	(234) 433-2333	f1adb32a-67fa-4b35-8afa-9e394e34072c
\.


--
-- Data for Name: languages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.languages (id, name, created_at, updated_at, deleted_at) FROM stdin;
173bf165-a8d4-4015-b6c0-def190833e90	English	2025-10-14 16:54:29.136+00	2025-10-14 16:54:29.136+00	\N
d96f075c-b90b-4aa8-a88a-3b8a6bac3fe4	Spanish	2025-10-14 16:54:29.144+00	2025-10-14 16:54:29.144+00	\N
9f7476aa-adbf-4e94-8e59-7292e8559ccc	French	2025-10-14 16:54:29.15+00	2025-10-14 16:54:29.15+00	\N
90ea8e17-b471-4d8f-9f42-5e9118ca5d72	d96f075c-b90b-4aa8-a88a-3b8a6bac3fe4	2025-10-17 11:16:36.474+00	2025-10-17 11:16:36.474+00	\N
2034c90f-5f2f-45d2-9adb-57a9e04bcab1	9f7476aa-adbf-4e94-8e59-7292e8559ccc	2025-10-17 11:16:36.495+00	2025-10-17 11:16:36.495+00	\N
\.


--
-- Data for Name: legal_representatives; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_representatives (id, company_name, contact_person, phone_number, fax_number, address_id) FROM stdin;
976da108-f862-4d3f-a4ad-2c4dff809ac8	Byte Wise	John Williams	1 (458) 555-6666	\N	34b9b3f6-2f24-45b8-912b-64d4c52cfba2
73ab2999-e574-4e4f-be6f-9ef0021d5a5c	Organization	thrive-bma	(321) 443-2221	(234) 433-2333	5c74a92e-ee3c-49ce-902c-728a0430f7dc
\.


--
-- Data for Name: organization_managers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_managers (id, organization_id, account_id, job_title, department_id, created_at, updated_at, deleted_at) FROM stdin;
4ab8fb30-c80d-4cee-b576-bb14b8a1800b	7dfe2285-3cfd-4d63-9d66-764bd5230129	58e53ddd-5feb-4201-affb-72a01401b857	Manager	ef6ee388-7220-49cf-8c1e-92e523adcc11	2025-10-16 18:56:46.958+00	2025-10-16 18:56:46.958+00	\N
ecc9c8f7-e0fa-4d03-aa76-4670399e1aef	344d0793-2206-41d4-9b09-33c1344c7bc1	e498baeb-f56c-4f38-b1b2-5285b9582d72	Manager	084e70f1-d215-4bc6-b398-3db4982b4be5	2025-10-16 18:56:58.193+00	2025-10-16 18:56:58.193+00	\N
60507e53-db62-44e4-8c10-e713a15bbed3	54232666-2309-4639-b878-0e009a7f114f	901412ad-c2fc-4c8b-9b44-a4f5f1f0455e	Manager	0658f962-ed66-4d42-9a26-890515456fd1	2025-10-16 18:58:36.5+00	2025-10-16 18:58:36.5+00	\N
183691c9-049d-4798-9154-e5f52d1ba506	477cda57-bf78-4e07-84e9-6de43abba2ad	3094b241-4690-4498-8639-bc15439a5ae9	Iusto optio nisi ve	cc43d9b5-ec2a-4218-9eac-3a282714fa21	2025-10-16 18:59:36.917+00	2025-10-16 18:59:36.917+00	\N
e943454e-4d77-40ee-91d9-d7fade7e7f59	1e0a1260-47e3-41d9-aaed-81508fdc5299	f50a790b-d2d3-4cd0-9dcb-acdb89660b2e	Manager	ef6ee388-7220-49cf-8c1e-92e523adcc11	2025-10-16 19:52:26.08+00	2025-10-16 19:52:26.08+00	\N
da42f61c-96f5-45a4-acfa-6ec1ef629a5c	90722ba7-241d-4b0d-bac1-61eab3f29f4c	d98e2a41-d7f0-499a-9b96-8cedb2fcd4b5	Full Stack Developer	b00723a0-69c1-4978-95bc-29eef401ccb0	2025-10-17 10:53:40.38+00	2025-10-17 10:53:40.38+00	\N
a0cbc66c-db24-41fb-80f8-703055504458	6f053f9f-7729-46b0-8207-1b8372615e3c	44495be7-50bb-4d55-9a28-1708872a8f1e	Manager	b00723a0-69c1-4978-95bc-29eef401ccb0	2025-10-17 13:58:57.855+00	2025-10-17 13:58:57.855+00	\N
ad7942f6-1827-4a8f-9458-5371cc8adcf4	5a182fcf-1d2a-4396-b1f8-5376da9f3038	db8738dc-45f1-45f6-be81-105d0a077c37	wr	b00723a0-69c1-4978-95bc-29eef401ccb0	2025-10-17 14:31:03.277+00	2025-10-17 14:31:03.277+00	\N
73c6f2af-e72a-469d-a672-d760db42720e	572b1122-a5e2-435c-9395-fa6c9e232d49	d1947da1-a329-4a5c-b1f0-0b492b6f1de9	Manager	5aa05c06-192b-4d4d-906f-c4f6a03c6429	2025-10-17 14:58:39.175+00	2025-10-17 14:58:39.175+00	\N
72372ab4-b2ef-49a9-a22e-6c1691839a5f	7b6022bd-5e6c-459e-b4c5-215a783ea2a4	22f4a82c-5f4d-4fa4-984a-209ed8fb4fa7	Debitis aliquid eum 	cc43d9b5-ec2a-4218-9eac-3a282714fa21	2025-10-17 17:13:09.768+00	2025-10-17 17:13:09.768+00	\N
\.


--
-- Data for Name: organization_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_types (id, name, description, created_at, updated_at, deleted_at) FROM stdin;
8b98ef30-71b0-4c7b-a318-642c7e07d8d1	insurance_company	Health, life, auto, or disability insurers requesting IMEs for claims verification.	2025-10-14 16:54:27.699+00	2025-10-14 16:54:27.699+00	\N
6b2d215f-f20e-4572-9998-c7ae94e01f48	law_firm	Attorneys or legal teams seeking impartial medical opinions for litigation or settlement.	2025-10-14 16:54:27.706+00	2025-10-14 16:54:27.706+00	\N
7556e97d-534c-48d8-9444-e85338b6334f	employer	Corporations or HR departments requiring exams for workplace injury, fitness-for-duty, or workers' compensation.	2025-10-14 16:54:27.711+00	2025-10-14 16:54:27.711+00	\N
ff3f732e-077b-4ea1-aa6e-81cf966ad3a9	government_agency	Public entities such as social security boards, military, or veterans' affairs requesting IMEs for benefits decisions.	2025-10-14 16:54:27.717+00	2025-10-14 16:54:27.717+00	\N
1efa3dd3-0d1c-481f-9299-61178771e0cf	third_party_administrator	Claims administrators managing benefits on behalf of insurers or employers and coordinating IMEs.	2025-10-14 16:54:27.722+00	2025-10-14 16:54:27.722+00	\N
8d878ad7-8ac6-4cf9-a911-62a210e619fc	rehabilitation_center	Organizations evaluating patient progress, disability status, or readiness to return to work.	2025-10-14 16:54:27.728+00	2025-10-14 16:54:27.728+00	\N
9d157326-dd67-4f43-ac08-5f527302161d	union_or_labour_organization	Labor groups arranging independent evaluations to support member disputes or claims.	2025-10-14 16:54:27.733+00	2025-10-14 16:54:27.733+00	\N
8664f57f-34c9-4132-8664-4d25297f5358	individual	Patients or families commissioning impartial medical evaluations directly.	2025-10-14 16:54:27.738+00	2025-10-14 16:54:27.738+00	\N
2ebfaf5b-686a-45b9-9abc-e5bf23b8e657	ime_vendor_or_service_provider	Specialized firms acting as intermediaries to coordinate and schedule IMEs across examiners.	2025-10-14 16:54:27.743+00	2025-10-14 16:54:27.743+00	\N
5552ee9a-398f-4903-92a0-bec19b088342	Insurance Company	Insurance and financial services companies	2025-10-14 16:54:31.429+00	2025-10-14 16:54:31.429+00	\N
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, type_id, address_id, name, website, is_authorized, data_sharing_consent, agree_to_terms_and_privacy, status, approved_by, approved_at, rejected_by, rejected_at, rejected_reason, created_at, updated_at, deleted_at) FROM stdin;
77e68542-987a-4a22-9717-41ff6f5c4a3b	5552ee9a-398f-4903-92a0-bec19b088342	d611719a-0321-4b64-a516-3fd624939a1e	Desjardins Insurance	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:31.447+00	2025-10-14 16:54:31.447+00	\N
de835568-10d7-4823-9d96-3ace09d25516	5552ee9a-398f-4903-92a0-bec19b088342	18b62a1f-17d1-4efb-98e2-689eec9e7a76	Canada Life	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:31.538+00	2025-10-14 16:54:31.538+00	\N
371ff8e7-2346-4430-a7dd-42df93d819f0	5552ee9a-398f-4903-92a0-bec19b088342	7afd2bf6-5a6a-4f3a-995c-b0ef484ca499	Manulife	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:31.619+00	2025-10-14 16:54:31.619+00	\N
8ca0ffcc-07fc-4d36-8860-1a5b0c87a2a6	5552ee9a-398f-4903-92a0-bec19b088342	e8c16f1e-c4e7-468f-ad18-9866a8a2953a	Sun Life Financial	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:31.699+00	2025-10-14 16:54:31.699+00	\N
d4c95bee-cdce-45b8-8018-e6e759ca6a9f	5552ee9a-398f-4903-92a0-bec19b088342	4ed2c198-4dac-4422-b96c-0213d0efd276	Intact Insurance	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:31.814+00	2025-10-14 16:54:31.814+00	\N
73f87b72-282a-4113-a822-abd99c6b8573	5552ee9a-398f-4903-92a0-bec19b088342	be5bc48f-7662-4436-81d4-b4e241c16d4f	Aviva Canada	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:31.901+00	2025-10-14 16:54:31.901+00	\N
02d8253e-5fe0-47d8-b466-41e02f2c9133	5552ee9a-398f-4903-92a0-bec19b088342	faca24cd-972f-4590-96a8-cab91e8f4483	RSA Canada	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:31.942+00	2025-10-14 16:54:31.942+00	\N
3f34a8bf-4bfb-44b4-828c-045d9c2ef29c	5552ee9a-398f-4903-92a0-bec19b088342	0e0e4ee3-eba9-4467-9b63-8656241a346a	TD Insurance	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:32.028+00	2025-10-14 16:54:32.028+00	\N
87a05bd9-dad9-4f23-b372-4a5824f014f1	5552ee9a-398f-4903-92a0-bec19b088342	dc98010a-c378-4c8b-9e84-2dd7d78ef163	Co-operators Insurance	\N	t	t	t	ACCEPTED	\N	\N	\N	\N	\N	2025-10-14 16:54:32.108+00	2025-10-14 16:54:32.108+00	\N
7dfe2285-3cfd-4d63-9d66-764bd5230129	ff3f732e-077b-4ea1-aa6e-81cf966ad3a9	2bfc7960-434b-40a5-acdb-2568b0641d1e	Some org	https://www.facebook.com	t	t	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 00:21:42.471+00	\N	\N	\N	2025-10-16 18:56:46.937+00	2025-10-17 00:21:42.472+00	\N
344d0793-2206-41d4-9b09-33c1344c7bc1	ff3f732e-077b-4ea1-aa6e-81cf966ad3a9	ee34a3cf-4c00-4c40-9e74-1070cfe97d31	abcdef		t	f	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 00:21:54.313+00	\N	\N	\N	2025-10-16 18:56:58.182+00	2025-10-17 00:21:54.314+00	\N
477cda57-bf78-4e07-84e9-6de43abba2ad	2ebfaf5b-686a-45b9-9abc-e5bf23b8e657	e9f0a8fe-6df5-480a-bfe3-eb51aec92254	Gallegos and Moran Co	https://www.nakylafarudyf.co	f	t	t	REJECTED	\N	\N	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 00:22:23.882+00	We are not accepting any more organizations	2025-10-16 18:59:36.905+00	2025-10-17 00:22:23.883+00	\N
54232666-2309-4639-b878-0e009a7f114f	2ebfaf5b-686a-45b9-9abc-e5bf23b8e657	d0e44b56-4787-4e2c-9648-b777955b4e56	Shhssj	https://www.fmlogs.com.	t	t	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 00:22:32.914+00	\N	\N	\N	2025-10-16 18:58:36.489+00	2025-10-17 00:22:32.915+00	\N
1e0a1260-47e3-41d9-aaed-81508fdc5299	2ebfaf5b-686a-45b9-9abc-e5bf23b8e657	07bdecd2-4a75-4914-9255-d259510b8204	Abdul	https://abcd2.com	t	t	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 00:22:47.349+00	\N	\N	\N	2025-10-16 19:52:26.06+00	2025-10-17 00:22:47.35+00	\N
90722ba7-241d-4b0d-bac1-61eab3f29f4c	2ebfaf5b-686a-45b9-9abc-e5bf23b8e657	2ac8365b-015e-4263-856b-c775be6c67e4	Food Papa		t	t	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 11:00:34.202+00	\N	\N	\N	2025-10-17 10:53:40.352+00	2025-10-17 11:00:34.203+00	\N
6f053f9f-7729-46b0-8207-1b8372615e3c	ff3f732e-077b-4ea1-aa6e-81cf966ad3a9	9bbebb9a-a5eb-469d-a71d-3bea35f69e55	CodeCrafted		t	t	t	ACCEPTED	602f59f5-67e8-4a13-a39b-f63709bdcddd	2025-10-17 14:00:50.277+00	\N	\N	\N	2025-10-17 13:58:57.837+00	2025-10-17 14:00:50.278+00	\N
5a182fcf-1d2a-4396-b1f8-5376da9f3038	ff3f732e-077b-4ea1-aa6e-81cf966ad3a9	841257ae-e50f-4bd7-87b7-82c0069a70cc	abcdef		f	f	t	PENDING	\N	\N	\N	\N	\N	2025-10-17 14:31:03.225+00	2025-10-17 14:31:03.225+00	\N
572b1122-a5e2-435c-9395-fa6c9e232d49	ff3f732e-077b-4ea1-aa6e-81cf966ad3a9	1c849527-047e-4dfe-b8fb-d39d934217c7	new organizagion	https://www.buildmeapp.io	t	t	t	PENDING	\N	\N	\N	\N	\N	2025-10-17 14:58:39.132+00	2025-10-17 14:58:39.132+00	\N
7b6022bd-5e6c-459e-b4c5-215a783ea2a4	8664f57f-34c9-4132-8664-4d25297f5358	65b53418-1590-4c87-949c-330a6ecd66b7	Cherry Freeman Co	https://www.gapufegi.me	t	t	t	PENDING	\N	\N	\N	\N	\N	2025-10-17 17:13:09.721+00	2025-10-17 17:13:09.721+00	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, name, created_at, updated_at, deleted_at) FROM stdin;
1276f657-4f35-40a3-8f79-71e7105b7567	medical_examiner	2025-10-14 16:54:27.625+00	2025-10-14 16:54:27.625+00	\N
93ade192-d54e-487f-9131-5a49de81501f	super_admin	2025-10-14 16:54:27.634+00	2025-10-14 16:54:27.634+00	\N
4ec5b811-f464-474b-bcc6-d96eb0236c0a	admin	2025-10-14 16:54:27.639+00	2025-10-14 16:54:27.639+00	\N
688300b9-49e9-4257-9f07-aa6e31cdaf6f	staff	2025-10-14 16:54:27.645+00	2025-10-14 16:54:27.645+00	\N
8e5c7126-9c0e-4f07-8350-30fdd6429e52	claimant	2025-10-14 16:54:27.652+00	2025-10-14 16:54:27.652+00	\N
ec2f6571-21ec-4119-a846-30ba8575eb2c	organization-manager	2025-10-14 16:54:27.658+00	2025-10-14 16:54:27.658+00	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, first_name, last_name, email, password, phone, gender, date_of_birth, profile_photo_id, created_at, updated_at, deleted_at) FROM stdin;
c2e40e75-1e77-4072-8b9c-345e78dbf7a4	Super	Admin	superadmin@thriveassesstmentcare.com	$2b$10$xoK5XMHBqQoEdaoyVTsuGe5h4HUT9VZe9Xp3Wrbp8mHy9KSYqm7vi	\N	\N	\N	\N	2025-10-14 16:54:28.103+00	2025-10-14 16:54:28.103+00	\N
693b5a3e-f9da-499f-a021-f0aeae45f0ab	Admin	One	admin1@thriveassesstmentcare.com	$2b$10$V3NJgS7SwbigbAVGpxleFOCmKkNgxkM1F2Rh.faPWxEvQetpJ4wN6	\N	\N	\N	\N	2025-10-14 16:54:28.397+00	2025-10-14 16:54:28.397+00	\N
1c5ef6f1-24fe-48e7-acb1-d24a92e1d0e1	Admin	Two	admin2@thriveassesstmentcare.com	$2b$10$B/x4UPLtR5rdE7U2wNpGbu2sKiaear6IHBKSGxR28XI5IEBW7Hecm	\N	\N	\N	\N	2025-10-14 16:54:28.694+00	2025-10-14 16:54:28.694+00	\N
d659e6e7-c386-4215-a673-f66fdf9ac3b7	Admin	Three	admin3@thriveassesstmentcare.com	$2b$10$Nv.4HQZrfUpQtnjX8L0v/OAVsi8kDBSeL84Rv9IDqSzMuXt4.TNEK	\N	\N	\N	\N	2025-10-14 16:54:28.915+00	2025-10-14 16:54:28.915+00	\N
66138c14-e5fa-4f27-a638-a3986d968995	John	Smith	john.smith@examiner.com	$2b$10$5pFi.iDe5yvJ8QT7xrh1DOpnUmF/pj4EpgrHLHn0xJ24e2EicnOra	+14165551234	\N	\N	\N	2025-10-14 16:54:30.297+00	2025-10-14 16:54:30.297+00	\N
147d1895-3d75-429f-aa51-11c44b1f0855	Sarah	Johnson	sarah.johnson@examiner.com	$2b$10$tZEFujPEemWbe3tvrxGOLumjubtrVyBLPx4P8ViV3d17kle9jHyRG	+16045552345	\N	\N	\N	2025-10-14 16:54:30.608+00	2025-10-14 16:54:30.608+00	\N
492b61fa-0f57-484c-8207-ba1633e05567	Michael	Chen	michael.chen@examiner.com	$2b$10$OgpIEa0laPt4tZLo2L..COF2C0zZLoGYbQDn0iUZ5SPLILHSLFnHi	+14165553456	\N	\N	\N	2025-10-14 16:54:30.914+00	2025-10-14 16:54:30.914+00	\N
46fcdf70-e519-4c9e-bb6e-0126fe993667	Emily	Williams	emily.williams@examiner.com	$2b$10$mwcc9uTWBacRZrGaMOF1q.XKcskfTeGkMX2sTxw20KhdFwxzDBonq	+14035554567	\N	\N	\N	2025-10-14 16:54:31.299+00	2025-10-14 16:54:31.299+00	\N
1fa84e94-f3a0-4bfe-afa2-5b5654dfe66b	Sajeel Ahmad	Ahmad	sajeel+1@buildmeapp.io	$2b$10$yRsNrrxw8AvOgl6ksKYBUe0Onrjin4WbHddLIQlIBgie6VoW4CdmW	(321) 443-2221	\N	\N	\N	2025-10-16 18:56:58.186+00	2025-10-16 18:57:09.29+00	\N
64c5acf7-3f0d-46b7-9a15-d09c3643b3d5	Abdul	bari	abdul.bari@buildmeapp.io	$2b$10$AJ8TJNRfHdxDGQc7CRLpWuQ8.w1lOWQsCZEUs6X6CJ899BOSdQC5W	(341) 232-3812	\N	\N	\N	2025-10-16 18:56:46.946+00	2025-10-16 18:57:24.913+00	\N
a237dfd0-fd43-43fe-98e2-fe7e96c2f6a0	Aiza	Gull	aizag485@gmail.com	$2b$10$425GYkqlcE86G2CNZQ3a4eg/5gTO5ZPC69RgVnvnWSTVvdhmHdfTa	(213) 311-3616	\N	\N	\N	2025-10-16 18:58:36.493+00	2025-10-16 18:59:28.188+00	\N
b4a9200a-f058-468e-8a0c-e03431b16c69	Farman	Ali	farmanali00742@gmail.com	$2b$10$KEigZd11JcPMMGw9xM2uM.xP.6awMh4mVmpoiCGpMIP7z1VHSANM2	(434) 532-4567	\N	\N	\N	2025-10-16 18:59:36.909+00	2025-10-16 19:00:12.977+00	\N
26f9f2ab-d08a-49e0-825e-6bb7c9f056eb	Abdul	bari	abdul.bari+1234@buildmeapp.io	$2b$10$kcWTywG2hAiXuhPQlSlzC.Xod7Cn5e54VzxqMBfkdAPl2Rz9oMNSm	(213) 231-2323	\N	\N	\N	2025-10-16 19:52:26.069+00	2025-10-16 19:52:38.042+00	\N
00cab179-0cb0-4203-bcfb-f31e083c18ca	Abdul	bari	abdul.bari+1230@buildmeapp.io	invalid	+1 232 130 2302	\N	\N	\N	2025-10-16 23:07:29.64+00	2025-10-16 23:07:29.64+00	\N
0610fa1a-9c4c-4260-a0f6-8a646fd16976	Muhammad Mahroz	Abbas	mahroz+6473@buildmeapp.io	invalid	+1 845 975 5222	\N	\N	\N	2025-10-16 23:47:20.119+00	2025-10-16 23:47:20.119+00	\N
28e8cdfd-60c9-4132-8623-fa3e57b3cac7	Muhammad Mahroz	Abbas	mahroz+57483@buildmeapp.io	$2b$10$NRwDav.wX0Zl1rwwp.sTMOWk/8IqLNoM.q685nKy7Gsn0IZIMDYcu	+1 554 885 5555	\N	\N	\N	2025-10-16 23:28:12.224+00	2025-10-17 00:53:16.867+00	\N
fed0e82b-88cd-495e-bdd9-49da9230800d	Muhammad Mahroz	Abbas	mahrozabass+123@gmail.com	$2b$10$Gl5kb0hgSUxugfawNKTZGu.MqV/COmMbyi.1x.P8iMHAAxySJbDkq	(845) 696-3211	\N	\N	\N	2025-10-17 10:53:40.363+00	2025-10-17 10:56:43.761+00	\N
34afdce9-ab9b-4333-8af5-29556445ea2b	Ali	Haider	mememan7011@gmail.com	$2b$10$oAdYf3/FFyfDC5MNrPE1Oe69MdpaGE7ngSMf9fDuOHB1nnaTer4WW	1 (800) 623-2888	\N	\N	\N	2025-10-17 13:58:57.844+00	2025-10-17 13:59:35.686+00	\N
a42124b2-f526-4893-b27f-cc39511b0de4	Sajeel Ahmad	Ahmad	sajeel@buildmeapp.io	$2b$10$GykYv1zDt6rOf1Ir.lMVb.BlQtl3yhU7O/drAZzxuB009j9o0EKr2	(234) 233-3322	\N	\N	\N	2025-10-17 14:31:03.244+00	2025-10-17 14:31:12.884+00	\N
87f5bfe9-baa9-471b-a076-9347e728de5a	Abdul 	bari	abdul.bari+123022@buildmeapp.io	invalid	+1 444 444 4444	\N	\N	\N	2025-10-17 14:56:00.948+00	2025-10-17 14:56:00.948+00	\N
c3e1a50b-b117-4054-abfc-451a7dfe45b1	Abdul	bari	abdulbari131103+1223@gmail.com	$2b$10$BPs00sJh2gt1G6MtcMqUpufNq2Rb8ew8AkBQBAJRcT.YCYhPYwgUG	(423) 223-2245	\N	\N	\N	2025-10-17 14:58:39.149+00	2025-10-17 14:58:49.007+00	\N
01e2c81a-14ed-46ff-a576-eae3b6e61e6b	Mahroz	Abbas	mahroz+222@buildmeapp.io	$2b$10$iOfe/r/ArKNu91.UHjOY2.Z5J8t6snx4vMzAC0FPDvOO1IZnQo5De	+1 748 885 5555	\N	\N	\N	2025-10-17 15:19:24.095+00	2025-10-17 15:24:49.792+00	\N
1124cbd8-4284-47fe-bcf8-cec6948e3262	Aiza	Gull	aizag3110@gmail.com	$2b$10$ZDS6qrGk2Gr.c4L/hnt5k.kTR1Ohav3nnhIM2Rrb9I.a5WNuldOdu	(434) 532-4567	\N	\N	\N	2025-10-17 17:13:09.739+00	2025-10-17 17:13:42.025+00	\N
\.


--
-- Data for Name: verification_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.verification_codes (id, code, expires_at, account_id, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: _prisma_seeds _prisma_seeds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_seeds
    ADD CONSTRAINT _prisma_seeds_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: case_documents case_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_documents
    ADD CONSTRAINT case_documents_pkey PRIMARY KEY (id);


--
-- Name: case_statuses case_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_statuses
    ADD CONSTRAINT case_statuses_pkey PRIMARY KEY (id);


--
-- Name: case_types case_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_types
    ADD CONSTRAINT case_types_pkey PRIMARY KEY (id);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: claim_types claim_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claim_types
    ADD CONSTRAINT claim_types_pkey PRIMARY KEY (id);


--
-- Name: claimant_availability claimant_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimant_availability
    ADD CONSTRAINT claimant_availability_pkey PRIMARY KEY (id);


--
-- Name: claimant_availability_slots claimant_availability_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimant_availability_slots
    ADD CONSTRAINT claimant_availability_slots_pkey PRIMARY KEY (id);


--
-- Name: claimants claimants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimants
    ADD CONSTRAINT claimants_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: examination_interpreter examination_interpreter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_interpreter
    ADD CONSTRAINT examination_interpreter_pkey PRIMARY KEY (id);


--
-- Name: examination_secure_links examination_secure_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_secure_links
    ADD CONSTRAINT examination_secure_links_pkey PRIMARY KEY (id);


--
-- Name: examination_selected_benefits examination_selected_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_selected_benefits
    ADD CONSTRAINT examination_selected_benefits_pkey PRIMARY KEY (id);


--
-- Name: examination_services examination_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_services
    ADD CONSTRAINT examination_services_pkey PRIMARY KEY (id);


--
-- Name: examination_transport examination_transport_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_transport
    ADD CONSTRAINT examination_transport_pkey PRIMARY KEY (id);


--
-- Name: examination_type_benefits examination_type_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_type_benefits
    ADD CONSTRAINT examination_type_benefits_pkey PRIMARY KEY (id);


--
-- Name: examination_types examination_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_types
    ADD CONSTRAINT examination_types_pkey PRIMARY KEY (id);


--
-- Name: examinations examinations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT examinations_pkey PRIMARY KEY (id);


--
-- Name: examiner_languages examiner_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_languages
    ADD CONSTRAINT examiner_languages_pkey PRIMARY KEY (id);


--
-- Name: examiner_override_hours examiner_override_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_override_hours
    ADD CONSTRAINT examiner_override_hours_pkey PRIMARY KEY (id);


--
-- Name: examiner_override_time_slots examiner_override_time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_override_time_slots
    ADD CONSTRAINT examiner_override_time_slots_pkey PRIMARY KEY (id);


--
-- Name: examiner_profiles examiner_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_profiles
    ADD CONSTRAINT examiner_profiles_pkey PRIMARY KEY (id);


--
-- Name: examiner_weekly_hours examiner_weekly_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_weekly_hours
    ADD CONSTRAINT examiner_weekly_hours_pkey PRIMARY KEY (id);


--
-- Name: examiner_weekly_time_slots examiner_weekly_time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_weekly_time_slots
    ADD CONSTRAINT examiner_weekly_time_slots_pkey PRIMARY KEY (id);


--
-- Name: insurances insurances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurances
    ADD CONSTRAINT insurances_pkey PRIMARY KEY (id);


--
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- Name: legal_representatives legal_representatives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_representatives
    ADD CONSTRAINT legal_representatives_pkey PRIMARY KEY (id);


--
-- Name: organization_managers organization_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_managers
    ADD CONSTRAINT organization_managers_pkey PRIMARY KEY (id);


--
-- Name: organization_types organization_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_types
    ADD CONSTRAINT organization_types_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: verification_codes verification_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_pkey PRIMARY KEY (id);


--
-- Name: _prisma_seeds_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX _prisma_seeds_id_key ON public._prisma_seeds USING btree (id);


--
-- Name: accounts_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX accounts_id_key ON public.accounts USING btree (id);


--
-- Name: addresses_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX addresses_id_key ON public.addresses USING btree (id);


--
-- Name: case_documents_case_id_document_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX case_documents_case_id_document_id_key ON public.case_documents USING btree (case_id, document_id);


--
-- Name: case_documents_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX case_documents_id_key ON public.case_documents USING btree (id);


--
-- Name: case_statuses_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX case_statuses_id_key ON public.case_statuses USING btree (id);


--
-- Name: case_types_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX case_types_id_key ON public.case_types USING btree (id);


--
-- Name: cases_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX cases_id_key ON public.cases USING btree (id);


--
-- Name: claim_types_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX claim_types_id_key ON public.claim_types USING btree (id);


--
-- Name: claimant_availability_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX claimant_availability_id_key ON public.claimant_availability USING btree (id);


--
-- Name: claimant_availability_slots_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX claimant_availability_slots_id_key ON public.claimant_availability_slots USING btree (id);


--
-- Name: claimants_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX claimants_id_key ON public.claimants USING btree (id);


--
-- Name: departments_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX departments_id_key ON public.departments USING btree (id);


--
-- Name: documents_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX documents_id_key ON public.documents USING btree (id);


--
-- Name: examination_interpreter_examination_service_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_interpreter_examination_service_id_key ON public.examination_interpreter USING btree (examination_service_id);


--
-- Name: examination_interpreter_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_interpreter_id_key ON public.examination_interpreter USING btree (id);


--
-- Name: examination_secure_links_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_secure_links_id_key ON public.examination_secure_links USING btree (id);


--
-- Name: examination_selected_benefits_benefit_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examination_selected_benefits_benefit_id_idx ON public.examination_selected_benefits USING btree (benefit_id);


--
-- Name: examination_selected_benefits_examination_id_benefit_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_selected_benefits_examination_id_benefit_id_key ON public.examination_selected_benefits USING btree (examination_id, benefit_id);


--
-- Name: examination_selected_benefits_examination_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examination_selected_benefits_examination_id_idx ON public.examination_selected_benefits USING btree (examination_id);


--
-- Name: examination_selected_benefits_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_selected_benefits_id_key ON public.examination_selected_benefits USING btree (id);


--
-- Name: examination_services_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_services_id_key ON public.examination_services USING btree (id);


--
-- Name: examination_transport_examination_service_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_transport_examination_service_id_key ON public.examination_transport USING btree (examination_service_id);


--
-- Name: examination_transport_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_transport_id_key ON public.examination_transport USING btree (id);


--
-- Name: examination_type_benefits_examination_type_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examination_type_benefits_examination_type_id_idx ON public.examination_type_benefits USING btree (examination_type_id);


--
-- Name: examination_type_benefits_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_type_benefits_id_key ON public.examination_type_benefits USING btree (id);


--
-- Name: examination_types_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_types_id_key ON public.examination_types USING btree (id);


--
-- Name: examination_types_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examination_types_name_key ON public.examination_types USING btree (name);


--
-- Name: examinations_case_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examinations_case_id_idx ON public.examinations USING btree (case_id);


--
-- Name: examinations_case_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examinations_case_number_idx ON public.examinations USING btree (case_number);


--
-- Name: examinations_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examinations_id_key ON public.examinations USING btree (id);


--
-- Name: examiner_languages_examiner_profile_id_language_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examiner_languages_examiner_profile_id_language_id_key ON public.examiner_languages USING btree (examiner_profile_id, language_id);


--
-- Name: examiner_languages_language_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examiner_languages_language_id_idx ON public.examiner_languages USING btree (language_id);


--
-- Name: examiner_override_hours_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examiner_override_hours_date_idx ON public.examiner_override_hours USING btree (date);


--
-- Name: examiner_override_hours_examiner_profile_id_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examiner_override_hours_examiner_profile_id_date_key ON public.examiner_override_hours USING btree (examiner_profile_id, date);


--
-- Name: examiner_override_hours_examiner_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examiner_override_hours_examiner_profile_id_idx ON public.examiner_override_hours USING btree (examiner_profile_id);


--
-- Name: examiner_override_time_slots_override_hour_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examiner_override_time_slots_override_hour_id_idx ON public.examiner_override_time_slots USING btree (override_hour_id);


--
-- Name: examiner_weekly_hours_examiner_profile_id_day_of_week_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX examiner_weekly_hours_examiner_profile_id_day_of_week_key ON public.examiner_weekly_hours USING btree (examiner_profile_id, day_of_week);


--
-- Name: examiner_weekly_hours_examiner_profile_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examiner_weekly_hours_examiner_profile_id_idx ON public.examiner_weekly_hours USING btree (examiner_profile_id);


--
-- Name: examiner_weekly_time_slots_weekly_hour_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX examiner_weekly_time_slots_weekly_hour_id_idx ON public.examiner_weekly_time_slots USING btree (weekly_hour_id);


--
-- Name: insurances_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX insurances_id_key ON public.insurances USING btree (id);


--
-- Name: languages_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX languages_id_key ON public.languages USING btree (id);


--
-- Name: legal_representatives_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX legal_representatives_id_key ON public.legal_representatives USING btree (id);


--
-- Name: organization_managers_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX organization_managers_id_key ON public.organization_managers USING btree (id);


--
-- Name: organization_types_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX organization_types_id_key ON public.organization_types USING btree (id);


--
-- Name: organizations_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX organizations_id_key ON public.organizations USING btree (id);


--
-- Name: roles_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX roles_id_key ON public.roles USING btree (id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_id_key ON public.users USING btree (id);


--
-- Name: verification_codes_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX verification_codes_id_key ON public.verification_codes USING btree (id);


--
-- Name: accounts accounts_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: accounts accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: case_documents case_documents_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_documents
    ADD CONSTRAINT case_documents_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: case_documents case_documents_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_documents
    ADD CONSTRAINT case_documents_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cases cases_case_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_case_type_id_fkey FOREIGN KEY (case_type_id) REFERENCES public.case_types(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cases cases_claimant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_claimant_id_fkey FOREIGN KEY (claimant_id) REFERENCES public.claimants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cases cases_insurance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_insurance_id_fkey FOREIGN KEY (insurance_id) REFERENCES public.insurances(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cases cases_legal_representative_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_legal_representative_id_fkey FOREIGN KEY (legal_representative_id) REFERENCES public.legal_representatives(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cases cases_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: claimant_availability claimant_availability_claimant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimant_availability
    ADD CONSTRAINT claimant_availability_claimant_id_fkey FOREIGN KEY (claimant_id) REFERENCES public.claimants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: claimant_availability claimant_availability_examination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimant_availability
    ADD CONSTRAINT claimant_availability_examination_id_fkey FOREIGN KEY (examination_id) REFERENCES public.examinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: claimant_availability_slots claimant_availability_slots_availability_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimant_availability_slots
    ADD CONSTRAINT claimant_availability_slots_availability_id_fkey FOREIGN KEY (availability_id) REFERENCES public.claimant_availability(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: claimants claimants_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimants
    ADD CONSTRAINT claimants_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: claimants claimants_claim_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claimants
    ADD CONSTRAINT claimants_claim_type_id_fkey FOREIGN KEY (claim_type_id) REFERENCES public.claim_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examination_interpreter examination_interpreter_examination_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_interpreter
    ADD CONSTRAINT examination_interpreter_examination_service_id_fkey FOREIGN KEY (examination_service_id) REFERENCES public.examination_services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examination_interpreter examination_interpreter_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_interpreter
    ADD CONSTRAINT examination_interpreter_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examination_secure_links examination_secure_links_examination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_secure_links
    ADD CONSTRAINT examination_secure_links_examination_id_fkey FOREIGN KEY (examination_id) REFERENCES public.examinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examination_selected_benefits examination_selected_benefits_benefit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_selected_benefits
    ADD CONSTRAINT examination_selected_benefits_benefit_id_fkey FOREIGN KEY (benefit_id) REFERENCES public.examination_type_benefits(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examination_selected_benefits examination_selected_benefits_examination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_selected_benefits
    ADD CONSTRAINT examination_selected_benefits_examination_id_fkey FOREIGN KEY (examination_id) REFERENCES public.examinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examination_services examination_services_examination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_services
    ADD CONSTRAINT examination_services_examination_id_fkey FOREIGN KEY (examination_id) REFERENCES public.examinations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examination_transport examination_transport_examination_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_transport
    ADD CONSTRAINT examination_transport_examination_service_id_fkey FOREIGN KEY (examination_service_id) REFERENCES public.examination_services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examination_transport examination_transport_pickup_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_transport
    ADD CONSTRAINT examination_transport_pickup_address_id_fkey FOREIGN KEY (pickup_address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: examination_type_benefits examination_type_benefits_examination_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examination_type_benefits
    ADD CONSTRAINT examination_type_benefits_examination_type_id_fkey FOREIGN KEY (examination_type_id) REFERENCES public.examination_types(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examinations examinations_assign_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT examinations_assign_to_id_fkey FOREIGN KEY (assign_to_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: examinations examinations_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT examinations_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examinations examinations_examination_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT examinations_examination_type_id_fkey FOREIGN KEY (examination_type_id) REFERENCES public.examination_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examinations examinations_examiner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT examinations_examiner_id_fkey FOREIGN KEY (examiner_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: examinations examinations_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examinations
    ADD CONSTRAINT examinations_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.case_statuses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examiner_languages examiner_languages_examiner_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_languages
    ADD CONSTRAINT examiner_languages_examiner_profile_id_fkey FOREIGN KEY (examiner_profile_id) REFERENCES public.examiner_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examiner_languages examiner_languages_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_languages
    ADD CONSTRAINT examiner_languages_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examiner_override_hours examiner_override_hours_examiner_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_override_hours
    ADD CONSTRAINT examiner_override_hours_examiner_profile_id_fkey FOREIGN KEY (examiner_profile_id) REFERENCES public.examiner_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examiner_override_time_slots examiner_override_time_slots_override_hour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_override_time_slots
    ADD CONSTRAINT examiner_override_time_slots_override_hour_id_fkey FOREIGN KEY (override_hour_id) REFERENCES public.examiner_override_hours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examiner_profiles examiner_profiles_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_profiles
    ADD CONSTRAINT examiner_profiles_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examiner_profiles examiner_profiles_insurance_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_profiles
    ADD CONSTRAINT examiner_profiles_insurance_document_id_fkey FOREIGN KEY (insurance_document_id) REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: examiner_profiles examiner_profiles_medical_license_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_profiles
    ADD CONSTRAINT examiner_profiles_medical_license_document_id_fkey FOREIGN KEY (medical_license_document_id) REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examiner_profiles examiner_profiles_nda_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_profiles
    ADD CONSTRAINT examiner_profiles_nda_document_id_fkey FOREIGN KEY (nda_document_id) REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: examiner_profiles examiner_profiles_resume_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_profiles
    ADD CONSTRAINT examiner_profiles_resume_document_id_fkey FOREIGN KEY (resume_document_id) REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: examiner_weekly_hours examiner_weekly_hours_examiner_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_weekly_hours
    ADD CONSTRAINT examiner_weekly_hours_examiner_profile_id_fkey FOREIGN KEY (examiner_profile_id) REFERENCES public.examiner_profiles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: examiner_weekly_time_slots examiner_weekly_time_slots_weekly_hour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.examiner_weekly_time_slots
    ADD CONSTRAINT examiner_weekly_time_slots_weekly_hour_id_fkey FOREIGN KEY (weekly_hour_id) REFERENCES public.examiner_weekly_hours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: insurances insurances_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurances
    ADD CONSTRAINT insurances_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: legal_representatives legal_representatives_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_representatives
    ADD CONSTRAINT legal_representatives_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organization_managers organization_managers_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_managers
    ADD CONSTRAINT organization_managers_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: organization_managers organization_managers_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_managers
    ADD CONSTRAINT organization_managers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: organization_managers organization_managers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_managers
    ADD CONSTRAINT organization_managers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: organizations organizations_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: organizations organizations_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.organization_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_profile_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_profile_photo_id_fkey FOREIGN KEY (profile_photo_id) REFERENCES public.documents(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: verification_codes verification_codes_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

