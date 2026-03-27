--
-- PostgreSQL database dump
--

\restrict M9VC8QSuaa1upytDdwestdAjv2hzw9BrNoS03gGWi5Dmp7vnGknpYNegTmypnwD

-- Dumped from database version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)

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
-- Name: business_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.business_type AS ENUM (
    'restaurant',
    'hotel',
    'real_estate',
    'clinic',
    'ecommerce',
    'artisan',
    'call_center',
    'generic'
);


ALTER TYPE public.business_type OWNER TO servicall;

--
-- Name: call_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.call_type AS ENUM (
    'inbound',
    'outbound'
);


ALTER TYPE public.call_type OWNER TO servicall;

--
-- Name: candidate_source; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.candidate_source AS ENUM (
    'platform',
    'manual',
    'referral',
    'job_board',
    'other'
);


ALTER TYPE public.candidate_source OWNER TO servicall;

--
-- Name: customer_sentiment; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.customer_sentiment AS ENUM (
    'positive',
    'neutral',
    'negative'
);


ALTER TYPE public.customer_sentiment OWNER TO servicall;

--
-- Name: document_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.document_type AS ENUM (
    'photo',
    'scan',
    'contract',
    'id_card',
    'other'
);


ALTER TYPE public.document_type OWNER TO servicall;

--
-- Name: emotion; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.emotion AS ENUM (
    'confident',
    'nervous',
    'calm',
    'stressed',
    'enthusiastic',
    'neutral',
    'defensive',
    'uncertain'
);


ALTER TYPE public.emotion OWNER TO servicall;

--
-- Name: entity_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.entity_type AS ENUM (
    'product',
    'service',
    'property',
    'room',
    'appointment',
    'menu_item',
    'other'
);


ALTER TYPE public.entity_type OWNER TO servicall;

--
-- Name: interview_status; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.interview_status AS ENUM (
    'pending',
    'scheduled',
    'in_progress',
    'completed',
    'reviewed',
    'shortlisted',
    'rejected',
    'cancelled'
);


ALTER TYPE public.interview_status OWNER TO servicall;

--
-- Name: outcome; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.outcome AS ENUM (
    'success',
    'no_answer',
    'voicemail',
    'busy',
    'failed'
);


ALTER TYPE public.outcome OWNER TO servicall;

--
-- Name: plan; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.plan AS ENUM (
    'free',
    'starter',
    'professional',
    'enterprise'
);


ALTER TYPE public.plan OWNER TO servicall;

--
-- Name: pos_provider; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.pos_provider AS ENUM (
    'lightspeed',
    'sumup',
    'zettle',
    'square',
    'tiller',
    'none'
);


ALTER TYPE public.pos_provider OWNER TO servicall;

--
-- Name: priority; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.priority AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);


ALTER TYPE public.priority OWNER TO servicall;

--
-- Name: reminder_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.reminder_type AS ENUM (
    'email',
    'sms',
    'push'
);


ALTER TYPE public.reminder_type OWNER TO servicall;

--
-- Name: resource_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.resource_type AS ENUM (
    'twilio_voice',
    'twilio_sms',
    'openai_token'
);


ALTER TYPE public.resource_type OWNER TO servicall;

--
-- Name: role; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.role AS ENUM (
    'admin',
    'manager',
    'agent',
    'user'
);


ALTER TYPE public.role OWNER TO servicall;

--
-- Name: severity; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.severity OWNER TO servicall;

--
-- Name: status; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.status AS ENUM (
    'new',
    'contacted',
    'qualified',
    'converted',
    'lost'
);


ALTER TYPE public.status OWNER TO servicall;

--
-- Name: trigger_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.trigger_type AS ENUM (
    'manual',
    'scheduled',
    'event'
);


ALTER TYPE public.trigger_type OWNER TO servicall;

--
-- Name: type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.type AS ENUM (
    'ai_qualification',
    'human_appointment',
    'hybrid_reception'
);


ALTER TYPE public.type OWNER TO servicall;

--
-- Name: update_business_entities_updated_at(); Type: FUNCTION; Schema: public; Owner: servicall
--

CREATE FUNCTION public.update_business_entities_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_business_entities_updated_at() OWNER TO servicall;

--
-- Name: update_recruitment_enhanced_updated_at(); Type: FUNCTION; Schema: public; Owner: servicall
--

CREATE FUNCTION public.update_recruitment_enhanced_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_recruitment_enhanced_updated_at() OWNER TO servicall;

--
-- Name: update_recruitment_updated_at(); Type: FUNCTION; Schema: public; Owner: servicall
--

CREATE FUNCTION public.update_recruitment_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_recruitment_updated_at() OWNER TO servicall;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_performance; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.agent_performance (
    id integer NOT NULL,
    agent_id integer NOT NULL,
    calls_count integer DEFAULT 0,
    conversion_rate numeric(5,2),
    avg_duration integer,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.agent_performance OWNER TO servicall;

--
-- Name: agent_performance_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.agent_performance ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.agent_performance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: agent_switch_history; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.agent_switch_history (
    id integer NOT NULL,
    agent_id integer NOT NULL,
    status character varying(50),
    changed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.agent_switch_history OWNER TO servicall;

--
-- Name: agent_switch_history_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.agent_switch_history ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.agent_switch_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ai_suggestions; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.ai_suggestions (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    type character varying(50) NOT NULL,
    content text NOT NULL,
    confidence numeric(3,2),
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_suggestions OWNER TO servicall;

--
-- Name: ai_suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.ai_suggestions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ai_suggestions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: appointment_reminders; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.appointment_reminders (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    appointment_id integer,
    reminder_type public.reminder_type DEFAULT 'email'::public.reminder_type,
    scheduled_for timestamp without time zone NOT NULL,
    sent_at timestamp without time zone,
    status text DEFAULT 'pending'::text,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointment_reminders OWNER TO servicall;

--
-- Name: appointment_reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.appointment_reminders ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.appointment_reminders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    agent_id integer,
    title character varying(255) NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    status text DEFAULT 'scheduled'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.appointments OWNER TO servicall;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.appointments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_ai_usage; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.audit_ai_usage (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    workflow_id integer,
    model character varying(100),
    tokens_used integer,
    cost numeric(10,6),
    status character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_ai_usage OWNER TO servicall;

--
-- Name: audit_ai_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.audit_ai_usage ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_ai_usage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    tenant_id integer,
    user_id integer,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id integer,
    changes json,
    ip_address character varying(45),
    user_agent text,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    resource character varying(255),
    resource_id integer,
    resource_type character varying(100),
    details json,
    actor_type character varying(50),
    source character varying(100)
);


ALTER TABLE public.audit_logs OWNER TO servicall;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.audit_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: blacklisted_numbers; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.blacklisted_numbers (
    id integer NOT NULL,
    phone_number character varying(50) NOT NULL,
    reason text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blacklisted_numbers OWNER TO servicall;

--
-- Name: blacklisted_numbers_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.blacklisted_numbers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.blacklisted_numbers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: business_entities; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.business_entities (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    type public.entity_type NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    price numeric(10,2),
    availability_json jsonb,
    metadata_json jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    vat_rate numeric(5,2) DEFAULT 20.00
);


ALTER TABLE public.business_entities OWNER TO servicall;

--
-- Name: business_entities_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.business_entities ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.business_entities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: byok_workflows; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.byok_workflows (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    definition json NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.byok_workflows OWNER TO servicall;

--
-- Name: byok_workflows_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.byok_workflows ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.byok_workflows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: call_execution_metrics; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.call_execution_metrics (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    call_id integer,
    agent_id integer,
    talk_time integer,
    hold_time integer,
    wrap_up_time integer,
    script_adherence numeric(5,2),
    customer_sentiment public.customer_sentiment,
    metadata json,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.call_execution_metrics OWNER TO servicall;

--
-- Name: call_execution_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.call_execution_metrics ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.call_execution_metrics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: call_scoring; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.call_scoring (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    call_id integer,
    scored_by integer,
    overall_score numeric(5,2) NOT NULL,
    communication_score numeric(5,2),
    knowledge_score numeric(5,2),
    professionalism_score numeric(5,2),
    feedback text,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.call_scoring OWNER TO servicall;

--
-- Name: call_scoring_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.call_scoring ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.call_scoring_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: calls; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.calls (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    agent_id integer,
    call_type public.call_type DEFAULT 'outbound'::public.call_type,
    status text DEFAULT 'scheduled'::text,
    scheduled_at timestamp without time zone,
    started_at timestamp without time zone,
    ended_at timestamp without time zone,
    duration integer,
    outcome public.outcome,
    notes text,
    call_sid character varying(255),
    recording_url text,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.calls OWNER TO servicall;

--
-- Name: calls_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.calls ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.calls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: campaign_prospects; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.campaign_prospects (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    campaign_id integer,
    prospect_id integer NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    contacted_at timestamp without time zone,
    converted_at timestamp without time zone,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.campaign_prospects OWNER TO servicall;

--
-- Name: campaign_prospects_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.campaign_prospects ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.campaign_prospects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(255) NOT NULL,
    type public.type DEFAULT 'hybrid_reception'::public.type,
    status text DEFAULT 'active'::text,
    settings json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.campaigns OWNER TO servicall;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.campaigns ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: candidate_interviews; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.candidate_interviews (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    candidate_name text,
    candidate_email text,
    candidate_phone text,
    business_type character varying(100) NOT NULL,
    job_position character varying(255) NOT NULL,
    scheduled_at timestamp without time zone,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    duration integer,
    status public.interview_status DEFAULT 'pending'::public.interview_status,
    source public.candidate_source DEFAULT 'platform'::public.candidate_source,
    call_sid character varying(255),
    recording_url text,
    transcript text,
    notes_json json,
    ai_summary text,
    ai_recommendation character varying(50),
    ai_confidence numeric(5,2),
    metadata json,
    employer_notes text,
    employer_decision character varying(50),
    employer_decision_at timestamp without time zone,
    consent_given boolean DEFAULT false,
    data_retention_until timestamp without time zone,
    anonymized boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    job_offer_id integer,
    cv_url text,
    cv_file_name character varying(255),
    cv_parsed_data json,
    matching_score numeric(5,2),
    matching_details json,
    sent_to_client boolean DEFAULT false,
    sent_to_client_at timestamp without time zone,
    client_feedback text,
    client_decision character varying(50)
);


ALTER TABLE public.candidate_interviews OWNER TO servicall;

--
-- Name: TABLE candidate_interviews; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON TABLE public.candidate_interviews IS 'Stocke tous les entretiens IA des candidats avec analyse comportementale';


--
-- Name: COLUMN candidate_interviews.transcript; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON COLUMN public.candidate_interviews.transcript IS 'Transcript complet de l''entretien IA';


--
-- Name: COLUMN candidate_interviews.notes_json; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON COLUMN public.candidate_interviews.notes_json IS 'Scores, analyse comportementale, émotions, signaux d''alerte';


--
-- Name: COLUMN candidate_interviews.ai_confidence; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON COLUMN public.candidate_interviews.ai_confidence IS 'Niveau de confiance de la recommandation IA (0-100)';


--
-- Name: COLUMN candidate_interviews.cv_url; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON COLUMN public.candidate_interviews.cv_url IS 'URL du CV uploadé par le candidat';


--
-- Name: COLUMN candidate_interviews.matching_score; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON COLUMN public.candidate_interviews.matching_score IS 'Score de matching IA candidat/offre (0-100)';


--
-- Name: COLUMN candidate_interviews.sent_to_client; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON COLUMN public.candidate_interviews.sent_to_client IS 'Indique si le profil a été envoyé au client';


--
-- Name: candidate_interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.candidate_interviews ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.candidate_interviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: coaching_feedback; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.coaching_feedback (
    id integer NOT NULL,
    agent_id integer NOT NULL,
    call_id integer NOT NULL,
    feedback text NOT NULL,
    score integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.coaching_feedback OWNER TO servicall;

--
-- Name: coaching_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.coaching_feedback ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.coaching_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: command_validations; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.command_validations (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    validated_by integer,
    command text NOT NULL,
    validated_at timestamp without time zone DEFAULT now(),
    metadata json
);


ALTER TABLE public.command_validations OWNER TO servicall;

--
-- Name: command_validations_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.command_validations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.command_validations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: compliance_alerts; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.compliance_alerts (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    severity public.severity,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.compliance_alerts OWNER TO servicall;

--
-- Name: compliance_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.compliance_alerts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.compliance_alerts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: compliance_logs; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.compliance_logs (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    action character varying(255) NOT NULL,
    status character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.compliance_logs OWNER TO servicall;

--
-- Name: compliance_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.compliance_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.compliance_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: customer_invoices; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.customer_invoices (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    invoice_number character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'EUR'::character varying,
    status text DEFAULT 'draft'::text,
    issue_date timestamp without time zone DEFAULT now(),
    due_date timestamp without time zone DEFAULT (now() + '30 days'::interval),
    paid_at timestamp without time zone,
    pdf_url text,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    call_id integer,
    tax numeric(10,2) DEFAULT 0.00,
    total_amount numeric(10,2),
    description text,
    template character varying(100) DEFAULT 'default'::character varying,
    secure_token text,
    secure_link text,
    link_expires_at timestamp without time zone,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    prospect_name character varying(255),
    prospect_email character varying(255),
    sent_at timestamp without time zone,
    accepted_at timestamp without time zone
);


ALTER TABLE public.customer_invoices OWNER TO servicall;

--
-- Name: customer_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.customer_invoices ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.customer_invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_type public.document_type DEFAULT 'other'::public.document_type,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.documents OWNER TO servicall;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.documents ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.failed_jobs (
    id integer NOT NULL,
    job_id character varying(255) NOT NULL,
    queue_name character varying(255) DEFAULT 'servicall-main'::character varying NOT NULL,
    payload json NOT NULL,
    error text,
    retry_count integer DEFAULT 0,
    last_attempt timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.failed_jobs OWNER TO servicall;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.failed_jobs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: interview_questions; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.interview_questions (
    id integer NOT NULL,
    tenant_id integer,
    business_type character varying(100) NOT NULL,
    category character varying(100) NOT NULL,
    question text NOT NULL,
    expected_answer_type character varying(50),
    expected_keywords json,
    weight numeric(5,2) DEFAULT 1.00,
    is_active boolean DEFAULT true,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.interview_questions OWNER TO servicall;

--
-- Name: TABLE interview_questions; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON TABLE public.interview_questions IS 'Questions métier configurables par type d''activité';


--
-- Name: interview_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.interview_questions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.interview_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.invoices (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    subscription_id integer,
    invoice_number character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'EUR'::character varying,
    status text DEFAULT 'pending'::text,
    stripe_invoice_id character varying(255),
    pdf_url text,
    due_date timestamp without time zone,
    paid_at timestamp without time zone,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.invoices OWNER TO servicall;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.invoices ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    workflow_id integer,
    type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    payload json,
    result json,
    retry_count integer DEFAULT 0,
    next_run_at timestamp without time zone,
    last_error text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.jobs OWNER TO servicall;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.jobs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lead_extractions; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.lead_extractions (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    query character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    provider character varying(50) DEFAULT 'osm'::character varying NOT NULL,
    radius integer DEFAULT 5000,
    results_count integer DEFAULT 0,
    imported_count integer DEFAULT 0,
    status character varying(20) DEFAULT 'done'::character varying NOT NULL,
    error_message text,
    results_snapshot json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lead_extractions OWNER TO servicall;

--
-- Name: lead_extractions_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.lead_extractions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.lead_extractions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: message_templates; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.message_templates (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    subject character varying(255),
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.message_templates OWNER TO servicall;

--
-- Name: message_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.message_templates ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.message_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    campaign_id integer,
    type character varying(50) NOT NULL,
    direction character varying(20) NOT NULL,
    content text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    external_sid character varying(255),
    error text,
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO servicall;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.messages ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id character varying(255),
    name character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    metadata json
);


ALTER TABLE public.order_items OWNER TO servicall;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.order_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    order_number character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    total_amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'EUR'::character varying,
    payment_status character varying(50) DEFAULT 'unpaid'::character varying,
    shipping_address json,
    billing_address json,
    notes text,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO servicall;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.orders ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pos_orders; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.pos_orders (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    crm_order_id character varying(255),
    pos_order_id character varying(255),
    provider public.pos_provider NOT NULL,
    status character varying(50) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    vat_amount numeric(10,2) NOT NULL,
    sync_log jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pos_orders OWNER TO servicall;

--
-- Name: pos_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.pos_orders ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pos_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: predictive_scores; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.predictive_scores (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    score numeric(5,2),
    factors json,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.predictive_scores OWNER TO servicall;

--
-- Name: predictive_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.predictive_scores ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.predictive_scores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: processed_events; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.processed_events (
    id integer NOT NULL,
    source character varying(100) NOT NULL,
    event_id character varying(255) NOT NULL,
    processed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.processed_events OWNER TO servicall;

--
-- Name: processed_events_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.processed_events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.processed_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: prospects; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.prospects (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    email text,
    phone text,
    company character varying(255),
    source character varying(100),
    status public.status DEFAULT 'new'::public.status,
    assigned_to integer,
    notes text,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prospects OWNER TO servicall;

--
-- Name: prospects_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.prospects ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.prospects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recordings; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.recordings (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    call_id integer,
    recording_url text,
    duration integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.recordings OWNER TO servicall;

--
-- Name: recordings_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.recordings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.recordings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recruitment_job_requirements; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.recruitment_job_requirements (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    job_offer_id integer,
    title character varying(255) NOT NULL,
    client_requirements_raw text,
    ai_generated_profile json,
    conversation_history json,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.recruitment_job_requirements OWNER TO servicall;

--
-- Name: TABLE recruitment_job_requirements; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON TABLE public.recruitment_job_requirements IS 'Exigences client définies via IA pour le recrutement';


--
-- Name: recruitment_job_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.recruitment_job_requirements ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.recruitment_job_requirements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recruitment_rdv_slots; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.recruitment_rdv_slots (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    slot_date timestamp without time zone NOT NULL,
    slot_duration integer DEFAULT 30,
    is_available boolean DEFAULT true,
    interview_id integer,
    assigned_to character varying(255),
    interview_type character varying(50) DEFAULT 'phone'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.recruitment_rdv_slots OWNER TO servicall;

--
-- Name: TABLE recruitment_rdv_slots; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON TABLE public.recruitment_rdv_slots IS 'Créneaux de RDV disponibles pour les entretiens';


--
-- Name: recruitment_rdv_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.recruitment_rdv_slots ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.recruitment_rdv_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: recruitment_settings; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.recruitment_settings (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    business_type character varying(100) NOT NULL,
    min_global_score numeric(5,2) DEFAULT 6.00,
    min_coherence_score numeric(5,2) DEFAULT 7.00,
    min_honesty_score numeric(5,2) DEFAULT 7.00,
    ai_model character varying(100) DEFAULT 'gpt-4o-mini'::character varying,
    ai_temperature numeric(3,2) DEFAULT 0.70,
    custom_intro_script text,
    custom_outro_script text,
    notify_on_completion boolean DEFAULT true,
    notification_email text,
    data_retention_days integer DEFAULT 90,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.recruitment_settings OWNER TO servicall;

--
-- Name: TABLE recruitment_settings; Type: COMMENT; Schema: public; Owner: servicall
--

COMMENT ON TABLE public.recruitment_settings IS 'Configuration du module de recrutement par tenant et métier';


--
-- Name: recruitment_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.recruitment_settings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.recruitment_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rgpd_consents; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.rgpd_consents (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    consent_type character varying(100) NOT NULL,
    granted boolean NOT NULL,
    granted_at timestamp without time zone,
    revoked_at timestamp without time zone,
    ip_address character varying(45),
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.rgpd_consents OWNER TO servicall;

--
-- Name: rgpd_consents_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.rgpd_consents ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.rgpd_consents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: security_audit_logs; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.security_audit_logs (
    id integer NOT NULL,
    tenant_id integer,
    user_id integer,
    event character varying(100) NOT NULL,
    resource_type character varying(50),
    resource_id character varying(255),
    action character varying(50),
    status character varying(20),
    ip_address character varying(45),
    user_agent text,
    metadata json,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.security_audit_logs OWNER TO servicall;

--
-- Name: security_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.security_audit_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.security_audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: simulated_calls; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.simulated_calls (
    id character varying(255) NOT NULL,
    tenant_id integer NOT NULL,
    agent_id integer,
    scenario_id character varying(255),
    scenario_name character varying(255),
    status text DEFAULT 'in_progress'::text,
    duration integer DEFAULT 0,
    score integer DEFAULT 0,
    transcript json,
    feedback json,
    objectives_achieved json,
    metadata json,
    started_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.simulated_calls OWNER TO servicall;

--
-- Name: simulated_calls_backup; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.simulated_calls_backup (
    id character varying(255),
    tenant_id integer,
    agent_id integer,
    scenario_id character varying(255),
    status text,
    transcript json,
    duration integer,
    score integer,
    feedback json,
    objectives_achieved json,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.simulated_calls_backup OWNER TO servicall;

--
-- Name: stripe_events; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.stripe_events (
    id integer NOT NULL,
    stripe_event_id character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    payload json NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    error text,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.stripe_events OWNER TO servicall;

--
-- Name: stripe_events_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.stripe_events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.stripe_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    plan public.plan DEFAULT 'free'::public.plan,
    status text DEFAULT 'active'::text,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    stripe_subscription_id character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.subscriptions OWNER TO servicall;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.subscriptions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    assigned_to integer,
    title character varying(255) NOT NULL,
    description text,
    priority public.priority DEFAULT 'medium'::public.priority,
    status text DEFAULT 'todo'::text,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tasks OWNER TO servicall;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.tasks ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tasks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tenant_ai_keys; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.tenant_ai_keys (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    provider character varying(50) DEFAULT 'openai'::character varying NOT NULL,
    encrypted_key text NOT NULL,
    key_hash character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    last_validated_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenant_ai_keys OWNER TO servicall;

--
-- Name: tenant_ai_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.tenant_ai_keys ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tenant_ai_keys_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tenant_industry_config; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.tenant_industry_config (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    industry_id character varying(255) NOT NULL,
    enabled_capabilities json,
    enabled_workflows json,
    ai_system_prompt text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenant_industry_config OWNER TO servicall;

--
-- Name: tenant_industry_config_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.tenant_industry_config ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tenant_industry_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tenant_users; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.tenant_users (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    user_id integer NOT NULL,
    role text DEFAULT 'agent'::text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.tenant_users OWNER TO servicall;

--
-- Name: tenant_users_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.tenant_users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tenant_users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.tenants (
    id integer NOT NULL,
    slug character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    domain character varying(255),
    logo text,
    settings json,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    business_type character varying(50),
    ai_custom_script text,
    pos_provider public.pos_provider DEFAULT 'none'::public.pos_provider,
    pos_config jsonb,
    pos_sync_enabled boolean DEFAULT false
);


ALTER TABLE public.tenants OWNER TO servicall;

--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.tenants ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tenants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.users (
    id integer NOT NULL,
    open_id character varying(255) NOT NULL,
    name character varying(255),
    email character varying(255),
    password_hash character varying(255),
    login_method character varying(50),
    role public.role DEFAULT 'user'::public.role,
    last_signed_in timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    assigned_agent_type character varying(10) DEFAULT 'AI'::character varying
);


ALTER TABLE public.users OWNER TO servicall;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: workflow_templates; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.workflow_templates (
    id integer NOT NULL,
    industry_id character varying(255) NOT NULL,
    template_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    trigger_type character varying(50),
    steps json NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.workflow_templates OWNER TO servicall;

--
-- Name: workflow_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.workflow_templates ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.workflow_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: workflows; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.workflows (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    trigger_type public.trigger_type DEFAULT 'manual'::public.trigger_type,
    trigger_config json,
    actions json NOT NULL,
    is_active boolean DEFAULT true,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.workflows OWNER TO servicall;

--
-- Name: workflows_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.workflows ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.workflows_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: agent_performance agent_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.agent_performance
    ADD CONSTRAINT agent_performance_pkey PRIMARY KEY (id);


--
-- Name: agent_switch_history agent_switch_history_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.agent_switch_history
    ADD CONSTRAINT agent_switch_history_pkey PRIMARY KEY (id);


--
-- Name: ai_suggestions ai_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_pkey PRIMARY KEY (id);


--
-- Name: appointment_reminders appointment_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.appointment_reminders
    ADD CONSTRAINT appointment_reminders_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_ai_usage audit_ai_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.audit_ai_usage
    ADD CONSTRAINT audit_ai_usage_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: blacklisted_numbers blacklisted_numbers_phone_number_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.blacklisted_numbers
    ADD CONSTRAINT blacklisted_numbers_phone_number_unique UNIQUE (phone_number);


--
-- Name: blacklisted_numbers blacklisted_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.blacklisted_numbers
    ADD CONSTRAINT blacklisted_numbers_pkey PRIMARY KEY (id);


--
-- Name: business_entities business_entities_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.business_entities
    ADD CONSTRAINT business_entities_pkey PRIMARY KEY (id);


--
-- Name: byok_workflows byok_workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.byok_workflows
    ADD CONSTRAINT byok_workflows_pkey PRIMARY KEY (id);


--
-- Name: call_execution_metrics call_execution_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_execution_metrics
    ADD CONSTRAINT call_execution_metrics_pkey PRIMARY KEY (id);


--
-- Name: call_scoring call_scoring_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_scoring
    ADD CONSTRAINT call_scoring_pkey PRIMARY KEY (id);


--
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- Name: campaign_prospects campaign_prospects_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.campaign_prospects
    ADD CONSTRAINT campaign_prospects_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: candidate_interviews candidate_interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.candidate_interviews
    ADD CONSTRAINT candidate_interviews_pkey PRIMARY KEY (id);


--
-- Name: coaching_feedback coaching_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.coaching_feedback
    ADD CONSTRAINT coaching_feedback_pkey PRIMARY KEY (id);


--
-- Name: command_validations command_validations_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.command_validations
    ADD CONSTRAINT command_validations_pkey PRIMARY KEY (id);


--
-- Name: compliance_alerts compliance_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.compliance_alerts
    ADD CONSTRAINT compliance_alerts_pkey PRIMARY KEY (id);


--
-- Name: compliance_logs compliance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.compliance_logs
    ADD CONSTRAINT compliance_logs_pkey PRIMARY KEY (id);


--
-- Name: customer_invoices customer_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.customer_invoices
    ADD CONSTRAINT customer_invoices_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: interview_questions interview_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.interview_questions
    ADD CONSTRAINT interview_questions_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: lead_extractions lead_extractions_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.lead_extractions
    ADD CONSTRAINT lead_extractions_pkey PRIMARY KEY (id);


--
-- Name: message_templates message_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pos_orders pos_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_pkey PRIMARY KEY (id);


--
-- Name: predictive_scores predictive_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.predictive_scores
    ADD CONSTRAINT predictive_scores_pkey PRIMARY KEY (id);


--
-- Name: processed_events processed_events_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.processed_events
    ADD CONSTRAINT processed_events_pkey PRIMARY KEY (id);


--
-- Name: prospects prospects_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.prospects
    ADD CONSTRAINT prospects_pkey PRIMARY KEY (id);


--
-- Name: recordings recordings_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recordings
    ADD CONSTRAINT recordings_pkey PRIMARY KEY (id);


--
-- Name: recruitment_job_requirements recruitment_job_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_job_requirements
    ADD CONSTRAINT recruitment_job_requirements_pkey PRIMARY KEY (id);


--
-- Name: recruitment_rdv_slots recruitment_rdv_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_rdv_slots
    ADD CONSTRAINT recruitment_rdv_slots_pkey PRIMARY KEY (id);


--
-- Name: recruitment_settings recruitment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_settings
    ADD CONSTRAINT recruitment_settings_pkey PRIMARY KEY (id);


--
-- Name: rgpd_consents rgpd_consents_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.rgpd_consents
    ADD CONSTRAINT rgpd_consents_pkey PRIMARY KEY (id);


--
-- Name: security_audit_logs security_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.security_audit_logs
    ADD CONSTRAINT security_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: simulated_calls simulated_calls_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.simulated_calls
    ADD CONSTRAINT simulated_calls_pkey PRIMARY KEY (id);


--
-- Name: stripe_events stripe_events_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.stripe_events
    ADD CONSTRAINT stripe_events_pkey PRIMARY KEY (id);


--
-- Name: stripe_events stripe_events_stripe_event_id_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.stripe_events
    ADD CONSTRAINT stripe_events_stripe_event_id_unique UNIQUE (stripe_event_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: tenant_ai_keys tenant_ai_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_ai_keys
    ADD CONSTRAINT tenant_ai_keys_pkey PRIMARY KEY (id);


--
-- Name: tenant_ai_keys tenant_ai_keys_tenant_id_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_ai_keys
    ADD CONSTRAINT tenant_ai_keys_tenant_id_unique UNIQUE (tenant_id);


--
-- Name: tenant_industry_config tenant_industry_config_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_industry_config
    ADD CONSTRAINT tenant_industry_config_pkey PRIMARY KEY (id);


--
-- Name: tenant_industry_config tenant_industry_config_tenant_id_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_industry_config
    ADD CONSTRAINT tenant_industry_config_tenant_id_unique UNIQUE (tenant_id);


--
-- Name: tenant_users tenant_users_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);


--
-- Name: users users_open_id_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_open_id_unique UNIQUE (open_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflow_templates workflow_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.workflow_templates
    ADD CONSTRAINT workflow_templates_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: appointment_reminders_appointment_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX appointment_reminders_appointment_id_idx ON public.appointment_reminders USING btree (appointment_id);


--
-- Name: appointment_reminders_scheduled_for_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX appointment_reminders_scheduled_for_idx ON public.appointment_reminders USING btree (scheduled_for);


--
-- Name: appointment_reminders_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX appointment_reminders_status_idx ON public.appointment_reminders USING btree (status);


--
-- Name: appointment_reminders_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX appointment_reminders_tenant_id_idx ON public.appointment_reminders USING btree (tenant_id);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX audit_logs_tenant_id_idx ON public.audit_logs USING btree (tenant_id);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: byok_workflows_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX byok_workflows_tenant_id_idx ON public.byok_workflows USING btree (tenant_id);


--
-- Name: call_execution_metrics_agent_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX call_execution_metrics_agent_id_idx ON public.call_execution_metrics USING btree (agent_id);


--
-- Name: call_execution_metrics_call_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX call_execution_metrics_call_id_idx ON public.call_execution_metrics USING btree (call_id);


--
-- Name: call_execution_metrics_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX call_execution_metrics_tenant_id_idx ON public.call_execution_metrics USING btree (tenant_id);


--
-- Name: call_scoring_call_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX call_scoring_call_id_idx ON public.call_scoring USING btree (call_id);


--
-- Name: call_scoring_scored_by_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX call_scoring_scored_by_idx ON public.call_scoring USING btree (scored_by);


--
-- Name: call_scoring_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX call_scoring_tenant_id_idx ON public.call_scoring USING btree (tenant_id);


--
-- Name: call_sid_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX call_sid_idx ON public.calls USING btree (call_sid);


--
-- Name: calls_agent_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX calls_agent_id_idx ON public.calls USING btree (agent_id);


--
-- Name: calls_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX calls_prospect_id_idx ON public.calls USING btree (prospect_id);


--
-- Name: calls_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX calls_status_idx ON public.calls USING btree (status);


--
-- Name: calls_tenant_created_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX calls_tenant_created_idx ON public.calls USING btree (tenant_id, created_at DESC NULLS LAST);


--
-- Name: calls_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX calls_tenant_id_idx ON public.calls USING btree (tenant_id);


--
-- Name: calls_tenant_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX calls_tenant_status_idx ON public.calls USING btree (tenant_id, status);


--
-- Name: calls_tenant_user_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX calls_tenant_user_idx ON public.calls USING btree (tenant_id, agent_id);


--
-- Name: campaign_prospects_campaign_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX campaign_prospects_campaign_id_idx ON public.campaign_prospects USING btree (campaign_id);


--
-- Name: campaign_prospects_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX campaign_prospects_prospect_id_idx ON public.campaign_prospects USING btree (prospect_id);


--
-- Name: campaign_prospects_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX campaign_prospects_tenant_id_idx ON public.campaign_prospects USING btree (tenant_id);


--
-- Name: campaigns_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX campaigns_status_idx ON public.campaigns USING btree (status);


--
-- Name: campaigns_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX campaigns_tenant_id_idx ON public.campaigns USING btree (tenant_id);


--
-- Name: candidate_interviews_business_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX candidate_interviews_business_type_idx ON public.candidate_interviews USING btree (business_type);


--
-- Name: candidate_interviews_call_sid_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX candidate_interviews_call_sid_idx ON public.candidate_interviews USING btree (call_sid);


--
-- Name: candidate_interviews_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX candidate_interviews_created_at_idx ON public.candidate_interviews USING btree (created_at DESC);


--
-- Name: candidate_interviews_scheduled_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX candidate_interviews_scheduled_at_idx ON public.candidate_interviews USING btree (scheduled_at);


--
-- Name: candidate_interviews_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX candidate_interviews_status_idx ON public.candidate_interviews USING btree (status);


--
-- Name: candidate_interviews_tenant_business_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX candidate_interviews_tenant_business_idx ON public.candidate_interviews USING btree (tenant_id, business_type);


--
-- Name: candidate_interviews_tenant_business_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX candidate_interviews_tenant_business_status_idx ON public.candidate_interviews USING btree (tenant_id, business_type, status);


--
-- Name: candidate_interviews_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX candidate_interviews_tenant_id_idx ON public.candidate_interviews USING btree (tenant_id);


--
-- Name: candidate_interviews_tenant_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX candidate_interviews_tenant_status_idx ON public.candidate_interviews USING btree (tenant_id, status);


--
-- Name: command_validations_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX command_validations_prospect_id_idx ON public.command_validations USING btree (prospect_id);


--
-- Name: command_validations_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX command_validations_tenant_id_idx ON public.command_validations USING btree (tenant_id);


--
-- Name: customer_invoices_invoice_number_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX customer_invoices_invoice_number_idx ON public.customer_invoices USING btree (invoice_number);


--
-- Name: customer_invoices_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX customer_invoices_prospect_id_idx ON public.customer_invoices USING btree (prospect_id);


--
-- Name: customer_invoices_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX customer_invoices_status_idx ON public.customer_invoices USING btree (status);


--
-- Name: customer_invoices_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX customer_invoices_tenant_id_idx ON public.customer_invoices USING btree (tenant_id);


--
-- Name: documents_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX documents_prospect_id_idx ON public.documents USING btree (prospect_id);


--
-- Name: documents_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX documents_tenant_id_idx ON public.documents USING btree (tenant_id);


--
-- Name: email_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX email_idx ON public.users USING btree (email);


--
-- Name: entity_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX entity_idx ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: failed_jobs_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX failed_jobs_created_at_idx ON public.failed_jobs USING btree (created_at);


--
-- Name: failed_jobs_job_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX failed_jobs_job_id_idx ON public.failed_jobs USING btree (job_id);


--
-- Name: idx_ai_suggestions_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_ai_suggestions_tenant_id_idx ON public.ai_suggestions USING btree (tenant_id);


--
-- Name: idx_audit_ai_usage_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_audit_ai_usage_created_at_idx ON public.audit_ai_usage USING btree (created_at);


--
-- Name: idx_audit_ai_usage_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_audit_ai_usage_tenant_id_idx ON public.audit_ai_usage USING btree (tenant_id);


--
-- Name: idx_business_entities_is_active; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_business_entities_is_active ON public.business_entities USING btree (is_active);


--
-- Name: idx_business_entities_tenant_active; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_business_entities_tenant_active ON public.business_entities USING btree (tenant_id, is_active);


--
-- Name: idx_business_entities_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_business_entities_tenant_id ON public.business_entities USING btree (tenant_id);


--
-- Name: idx_business_entities_tenant_type; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_business_entities_tenant_type ON public.business_entities USING btree (tenant_id, type);


--
-- Name: idx_business_entities_type; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_business_entities_type ON public.business_entities USING btree (type);


--
-- Name: idx_campaign_prospect_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_campaign_prospect_unique ON public.campaign_prospects USING btree (campaign_id, prospect_id);


--
-- Name: idx_message_templates_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_message_templates_tenant_id_idx ON public.message_templates USING btree (tenant_id);


--
-- Name: idx_order_items_order_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_order_number_idx_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_orders_order_number_idx_unique ON public.orders USING btree (order_number);


--
-- Name: idx_orders_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_prospect_id_idx ON public.orders USING btree (prospect_id);


--
-- Name: idx_orders_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_status_idx ON public.orders USING btree (status);


--
-- Name: idx_orders_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_tenant_id_idx ON public.orders USING btree (tenant_id);


--
-- Name: idx_pos_orders_crm_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_pos_orders_crm_id ON public.pos_orders USING btree (crm_order_id);


--
-- Name: idx_pos_orders_pos_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_pos_orders_pos_id ON public.pos_orders USING btree (pos_order_id);


--
-- Name: idx_pos_orders_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_pos_orders_tenant_id ON public.pos_orders USING btree (tenant_id);


--
-- Name: idx_pos_orders_tenant_provider; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_pos_orders_tenant_provider ON public.pos_orders USING btree (tenant_id, provider);


--
-- Name: idx_prospects_lookup; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_prospects_lookup ON public.prospects USING btree (tenant_id, phone);


--
-- Name: idx_source_event_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_source_event_unique ON public.processed_events USING btree (source, event_id);


--
-- Name: idx_tenant_ai_keys_provider_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_tenant_ai_keys_provider_idx ON public.tenant_ai_keys USING btree (provider);


--
-- Name: idx_tenant_ai_keys_tenant_id_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_tenant_ai_keys_tenant_id_unique ON public.tenant_ai_keys USING btree (tenant_id);


--
-- Name: idx_tenant_industry_config_tenant_id_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_tenant_industry_config_tenant_id_unique ON public.tenant_industry_config USING btree (tenant_id);


--
-- Name: idx_tenant_user_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_tenant_user_unique ON public.tenant_users USING btree (tenant_id, user_id);


--
-- Name: idx_workflow_templates_industry_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_workflow_templates_industry_id_idx ON public.workflow_templates USING btree (industry_id);


--
-- Name: interview_questions_business_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX interview_questions_business_type_idx ON public.interview_questions USING btree (business_type);


--
-- Name: interview_questions_is_active_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX interview_questions_is_active_idx ON public.interview_questions USING btree (is_active);


--
-- Name: interview_questions_tenant_business_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX interview_questions_tenant_business_idx ON public.interview_questions USING btree (tenant_id, business_type);


--
-- Name: invoices_invoice_number_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX invoices_invoice_number_idx ON public.invoices USING btree (invoice_number);


--
-- Name: invoices_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX invoices_status_idx ON public.invoices USING btree (status);


--
-- Name: invoices_tenant_created_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX invoices_tenant_created_idx ON public.invoices USING btree (tenant_id, created_at DESC NULLS LAST);


--
-- Name: invoices_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX invoices_tenant_id_idx ON public.invoices USING btree (tenant_id);


--
-- Name: invoices_tenant_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX invoices_tenant_status_idx ON public.invoices USING btree (tenant_id, status);


--
-- Name: jobs_retry_count_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX jobs_retry_count_idx ON public.jobs USING btree (retry_count);


--
-- Name: jobs_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX jobs_status_idx ON public.jobs USING btree (status);


--
-- Name: jobs_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX jobs_tenant_id_idx ON public.jobs USING btree (tenant_id);


--
-- Name: jobs_workflow_created_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX jobs_workflow_created_idx ON public.jobs USING btree (workflow_id, created_at DESC NULLS LAST);


--
-- Name: lead_extractions_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX lead_extractions_created_at_idx ON public.lead_extractions USING btree (created_at);


--
-- Name: lead_extractions_provider_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX lead_extractions_provider_idx ON public.lead_extractions USING btree (provider);


--
-- Name: lead_extractions_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX lead_extractions_tenant_id_idx ON public.lead_extractions USING btree (tenant_id);


--
-- Name: messages_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX messages_prospect_id_idx ON public.messages USING btree (prospect_id);


--
-- Name: messages_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX messages_status_idx ON public.messages USING btree (status);


--
-- Name: messages_tenant_created_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX messages_tenant_created_idx ON public.messages USING btree (tenant_id, created_at DESC NULLS LAST);


--
-- Name: messages_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX messages_tenant_id_idx ON public.messages USING btree (tenant_id);


--
-- Name: messages_tenant_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX messages_tenant_status_idx ON public.messages USING btree (tenant_id, status);


--
-- Name: open_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX open_id_idx ON public.users USING btree (open_id);


--
-- Name: phone_number_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX phone_number_idx ON public.blacklisted_numbers USING btree (phone_number);


--
-- Name: predictive_scores_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX predictive_scores_prospect_id_idx ON public.predictive_scores USING btree (prospect_id);


--
-- Name: predictive_scores_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX predictive_scores_tenant_id_idx ON public.predictive_scores USING btree (tenant_id);


--
-- Name: prospects_assigned_to_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX prospects_assigned_to_idx ON public.prospects USING btree (assigned_to);


--
-- Name: prospects_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX prospects_status_idx ON public.prospects USING btree (status);


--
-- Name: prospects_tenant_created_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX prospects_tenant_created_idx ON public.prospects USING btree (tenant_id, created_at DESC NULLS LAST);


--
-- Name: prospects_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX prospects_tenant_id_idx ON public.prospects USING btree (tenant_id);


--
-- Name: prospects_tenant_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX prospects_tenant_status_idx ON public.prospects USING btree (tenant_id, status);


--
-- Name: prospects_tenant_user_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX prospects_tenant_user_idx ON public.prospects USING btree (tenant_id, assigned_to);


--
-- Name: recordings_call_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX recordings_call_id_idx ON public.recordings USING btree (call_id);


--
-- Name: recordings_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX recordings_tenant_id_idx ON public.recordings USING btree (tenant_id);


--
-- Name: recruitment_job_req_is_active_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX recruitment_job_req_is_active_idx ON public.recruitment_job_requirements USING btree (is_active);


--
-- Name: recruitment_job_req_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX recruitment_job_req_tenant_id_idx ON public.recruitment_job_requirements USING btree (tenant_id);


--
-- Name: recruitment_rdv_slots_is_available_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX recruitment_rdv_slots_is_available_idx ON public.recruitment_rdv_slots USING btree (is_available);


--
-- Name: recruitment_rdv_slots_slot_date_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX recruitment_rdv_slots_slot_date_idx ON public.recruitment_rdv_slots USING btree (slot_date);


--
-- Name: recruitment_rdv_slots_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX recruitment_rdv_slots_tenant_id_idx ON public.recruitment_rdv_slots USING btree (tenant_id);


--
-- Name: recruitment_settings_tenant_business_unique_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX recruitment_settings_tenant_business_unique_idx ON public.recruitment_settings USING btree (tenant_id, business_type);


--
-- Name: recruitment_settings_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX recruitment_settings_tenant_id_idx ON public.recruitment_settings USING btree (tenant_id);


--
-- Name: rgpd_consents_consent_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX rgpd_consents_consent_type_idx ON public.rgpd_consents USING btree (consent_type);


--
-- Name: rgpd_consents_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX rgpd_consents_prospect_id_idx ON public.rgpd_consents USING btree (prospect_id);


--
-- Name: rgpd_consents_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX rgpd_consents_tenant_id_idx ON public.rgpd_consents USING btree (tenant_id);


--
-- Name: security_audit_tenant_created_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX security_audit_tenant_created_idx ON public.security_audit_logs USING btree (tenant_id, created_at DESC NULLS LAST);


--
-- Name: security_audit_tenant_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX security_audit_tenant_idx ON public.security_audit_logs USING btree (tenant_id);


--
-- Name: security_audit_tenant_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX security_audit_tenant_status_idx ON public.security_audit_logs USING btree (tenant_id, status);


--
-- Name: security_audit_tenant_user_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX security_audit_tenant_user_idx ON public.security_audit_logs USING btree (tenant_id, user_id);


--
-- Name: security_audit_user_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX security_audit_user_idx ON public.security_audit_logs USING btree (user_id);


--
-- Name: simulated_calls_agent_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX simulated_calls_agent_id_idx ON public.simulated_calls USING btree (agent_id);


--
-- Name: simulated_calls_scenario_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX simulated_calls_scenario_id_idx ON public.simulated_calls USING btree (scenario_id);


--
-- Name: simulated_calls_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX simulated_calls_tenant_id_idx ON public.simulated_calls USING btree (tenant_id);


--
-- Name: slug_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX slug_idx ON public.tenants USING btree (slug);


--
-- Name: stripe_event_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX stripe_event_id_idx ON public.stripe_events USING btree (stripe_event_id);


--
-- Name: stripe_events_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX stripe_events_status_idx ON public.stripe_events USING btree (status);


--
-- Name: tasks_assigned_to_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tasks_assigned_to_idx ON public.tasks USING btree (assigned_to);


--
-- Name: tasks_due_date_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tasks_due_date_idx ON public.tasks USING btree (due_date);


--
-- Name: tasks_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tasks_prospect_id_idx ON public.tasks USING btree (prospect_id);


--
-- Name: tasks_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tasks_status_idx ON public.tasks USING btree (status);


--
-- Name: tasks_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tasks_tenant_id_idx ON public.tasks USING btree (tenant_id);


--
-- Name: tenant_users_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tenant_users_tenant_id_idx ON public.tenant_users USING btree (tenant_id);


--
-- Name: tenant_users_user_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tenant_users_user_id_idx ON public.tenant_users USING btree (user_id);


--
-- Name: unique_template_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX unique_template_idx ON public.workflow_templates USING btree (industry_id, template_id);


--
-- Name: workflows_is_active_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflows_is_active_idx ON public.workflows USING btree (is_active);


--
-- Name: workflows_tenant_created_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflows_tenant_created_idx ON public.workflows USING btree (tenant_id, created_at DESC NULLS LAST);


--
-- Name: workflows_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflows_tenant_id_idx ON public.workflows USING btree (tenant_id);


--
-- Name: workflows_tenant_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflows_tenant_status_idx ON public.workflows USING btree (tenant_id, is_active);


--
-- Name: workflows_tenant_user_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflows_tenant_user_idx ON public.workflows USING btree (tenant_id, created_by);


--
-- Name: candidate_interviews candidate_interviews_updated_at; Type: TRIGGER; Schema: public; Owner: servicall
--

CREATE TRIGGER candidate_interviews_updated_at BEFORE UPDATE ON public.candidate_interviews FOR EACH ROW EXECUTE FUNCTION public.update_recruitment_updated_at();


--
-- Name: interview_questions interview_questions_updated_at; Type: TRIGGER; Schema: public; Owner: servicall
--

CREATE TRIGGER interview_questions_updated_at BEFORE UPDATE ON public.interview_questions FOR EACH ROW EXECUTE FUNCTION public.update_recruitment_updated_at();


--
-- Name: recruitment_job_requirements recruitment_job_requirements_updated_at; Type: TRIGGER; Schema: public; Owner: servicall
--

CREATE TRIGGER recruitment_job_requirements_updated_at BEFORE UPDATE ON public.recruitment_job_requirements FOR EACH ROW EXECUTE FUNCTION public.update_recruitment_enhanced_updated_at();


--
-- Name: recruitment_rdv_slots recruitment_rdv_slots_updated_at; Type: TRIGGER; Schema: public; Owner: servicall
--

CREATE TRIGGER recruitment_rdv_slots_updated_at BEFORE UPDATE ON public.recruitment_rdv_slots FOR EACH ROW EXECUTE FUNCTION public.update_recruitment_enhanced_updated_at();


--
-- Name: recruitment_settings recruitment_settings_updated_at; Type: TRIGGER; Schema: public; Owner: servicall
--

CREATE TRIGGER recruitment_settings_updated_at BEFORE UPDATE ON public.recruitment_settings FOR EACH ROW EXECUTE FUNCTION public.update_recruitment_updated_at();


--
-- Name: business_entities trigger_business_entities_updated_at; Type: TRIGGER; Schema: public; Owner: servicall
--

CREATE TRIGGER trigger_business_entities_updated_at BEFORE UPDATE ON public.business_entities FOR EACH ROW EXECUTE FUNCTION public.update_business_entities_updated_at();


--
-- Name: pos_orders trigger_pos_orders_updated_at; Type: TRIGGER; Schema: public; Owner: servicall
--

CREATE TRIGGER trigger_pos_orders_updated_at BEFORE UPDATE ON public.pos_orders FOR EACH ROW EXECUTE FUNCTION public.update_business_entities_updated_at();


--
-- Name: agent_performance agent_performance_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.agent_performance
    ADD CONSTRAINT agent_performance_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: agent_switch_history agent_switch_history_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.agent_switch_history
    ADD CONSTRAINT agent_switch_history_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ai_suggestions ai_suggestions_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: ai_suggestions ai_suggestions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: appointment_reminders appointment_reminders_appointment_id_appointments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.appointment_reminders
    ADD CONSTRAINT appointment_reminders_appointment_id_appointments_id_fk FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_reminders appointment_reminders_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.appointment_reminders
    ADD CONSTRAINT appointment_reminders_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_ai_usage audit_ai_usage_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.audit_ai_usage
    ADD CONSTRAINT audit_ai_usage_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: business_entities business_entities_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.business_entities
    ADD CONSTRAINT business_entities_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: call_execution_metrics call_execution_metrics_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_execution_metrics
    ADD CONSTRAINT call_execution_metrics_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: call_execution_metrics call_execution_metrics_call_id_calls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_execution_metrics
    ADD CONSTRAINT call_execution_metrics_call_id_calls_id_fk FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE;


--
-- Name: call_execution_metrics call_execution_metrics_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_execution_metrics
    ADD CONSTRAINT call_execution_metrics_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: call_scoring call_scoring_call_id_calls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_scoring
    ADD CONSTRAINT call_scoring_call_id_calls_id_fk FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE;


--
-- Name: call_scoring call_scoring_scored_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_scoring
    ADD CONSTRAINT call_scoring_scored_by_users_id_fk FOREIGN KEY (scored_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: call_scoring call_scoring_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_scoring
    ADD CONSTRAINT call_scoring_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: calls calls_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: calls calls_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: calls calls_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: campaign_prospects campaign_prospects_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.campaign_prospects
    ADD CONSTRAINT campaign_prospects_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_prospects campaign_prospects_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.campaign_prospects
    ADD CONSTRAINT campaign_prospects_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: campaign_prospects campaign_prospects_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.campaign_prospects
    ADD CONSTRAINT campaign_prospects_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: candidate_interviews candidate_interviews_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.candidate_interviews
    ADD CONSTRAINT candidate_interviews_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: coaching_feedback coaching_feedback_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.coaching_feedback
    ADD CONSTRAINT coaching_feedback_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: coaching_feedback coaching_feedback_call_id_calls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.coaching_feedback
    ADD CONSTRAINT coaching_feedback_call_id_calls_id_fk FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE;


--
-- Name: command_validations command_validations_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.command_validations
    ADD CONSTRAINT command_validations_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: command_validations command_validations_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.command_validations
    ADD CONSTRAINT command_validations_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: command_validations command_validations_validated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.command_validations
    ADD CONSTRAINT command_validations_validated_by_users_id_fk FOREIGN KEY (validated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: compliance_alerts compliance_alerts_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.compliance_alerts
    ADD CONSTRAINT compliance_alerts_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: compliance_logs compliance_logs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.compliance_logs
    ADD CONSTRAINT compliance_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: customer_invoices customer_invoices_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.customer_invoices
    ADD CONSTRAINT customer_invoices_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: customer_invoices customer_invoices_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.customer_invoices
    ADD CONSTRAINT customer_invoices_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: documents documents_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: documents documents_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: interview_questions interview_questions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.interview_questions
    ADD CONSTRAINT interview_questions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_subscription_id_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_subscription_id_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_workflow_id_workflows_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_workflow_id_workflows_id_fk FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


--
-- Name: lead_extractions lead_extractions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.lead_extractions
    ADD CONSTRAINT lead_extractions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: message_templates message_templates_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.message_templates
    ADD CONSTRAINT message_templates_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: messages messages_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: messages messages_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: messages messages_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: orders orders_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: pos_orders pos_orders_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: predictive_scores predictive_scores_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.predictive_scores
    ADD CONSTRAINT predictive_scores_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: predictive_scores predictive_scores_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.predictive_scores
    ADD CONSTRAINT predictive_scores_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: prospects prospects_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.prospects
    ADD CONSTRAINT prospects_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: prospects prospects_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.prospects
    ADD CONSTRAINT prospects_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recordings recordings_call_id_calls_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recordings
    ADD CONSTRAINT recordings_call_id_calls_id_fk FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE;


--
-- Name: recordings recordings_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recordings
    ADD CONSTRAINT recordings_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recruitment_job_requirements recruitment_job_requirements_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_job_requirements
    ADD CONSTRAINT recruitment_job_requirements_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recruitment_rdv_slots recruitment_rdv_slots_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_rdv_slots
    ADD CONSTRAINT recruitment_rdv_slots_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recruitment_settings recruitment_settings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_settings
    ADD CONSTRAINT recruitment_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: rgpd_consents rgpd_consents_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.rgpd_consents
    ADD CONSTRAINT rgpd_consents_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: rgpd_consents rgpd_consents_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.rgpd_consents
    ADD CONSTRAINT rgpd_consents_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: security_audit_logs security_audit_logs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.security_audit_logs
    ADD CONSTRAINT security_audit_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: security_audit_logs security_audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.security_audit_logs
    ADD CONSTRAINT security_audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: simulated_calls simulated_calls_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.simulated_calls
    ADD CONSTRAINT simulated_calls_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: simulated_calls simulated_calls_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.simulated_calls
    ADD CONSTRAINT simulated_calls_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_ai_keys tenant_ai_keys_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_ai_keys
    ADD CONSTRAINT tenant_ai_keys_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_industry_config tenant_industry_config_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_industry_config
    ADD CONSTRAINT tenant_industry_config_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_users tenant_users_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_users tenant_users_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tenant_users
    ADD CONSTRAINT tenant_users_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workflows workflows_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: workflows workflows_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: business_entities; Type: ROW SECURITY; Schema: public; Owner: servicall
--

ALTER TABLE public.business_entities ENABLE ROW LEVEL SECURITY;

--
-- Name: candidate_interviews; Type: ROW SECURITY; Schema: public; Owner: servicall
--

ALTER TABLE public.candidate_interviews ENABLE ROW LEVEL SECURITY;

--
-- Name: candidate_interviews candidate_interviews_tenant_isolation; Type: POLICY; Schema: public; Owner: servicall
--

CREATE POLICY candidate_interviews_tenant_isolation ON public.candidate_interviews USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::integer));


--
-- Name: interview_questions; Type: ROW SECURITY; Schema: public; Owner: servicall
--

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: interview_questions interview_questions_tenant_isolation; Type: POLICY; Schema: public; Owner: servicall
--

CREATE POLICY interview_questions_tenant_isolation ON public.interview_questions USING (((tenant_id = (current_setting('app.current_tenant_id'::text, true))::integer) OR (tenant_id IS NULL)));


--
-- Name: pos_orders; Type: ROW SECURITY; Schema: public; Owner: servicall
--

ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: recruitment_job_requirements recruitment_job_req_tenant_isolation; Type: POLICY; Schema: public; Owner: servicall
--

CREATE POLICY recruitment_job_req_tenant_isolation ON public.recruitment_job_requirements USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::integer));


--
-- Name: recruitment_job_requirements; Type: ROW SECURITY; Schema: public; Owner: servicall
--

ALTER TABLE public.recruitment_job_requirements ENABLE ROW LEVEL SECURITY;

--
-- Name: recruitment_rdv_slots; Type: ROW SECURITY; Schema: public; Owner: servicall
--

ALTER TABLE public.recruitment_rdv_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: recruitment_rdv_slots recruitment_rdv_slots_tenant_isolation; Type: POLICY; Schema: public; Owner: servicall
--

CREATE POLICY recruitment_rdv_slots_tenant_isolation ON public.recruitment_rdv_slots USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::integer));


--
-- Name: recruitment_settings; Type: ROW SECURITY; Schema: public; Owner: servicall
--

ALTER TABLE public.recruitment_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: recruitment_settings recruitment_settings_tenant_isolation; Type: POLICY; Schema: public; Owner: servicall
--

CREATE POLICY recruitment_settings_tenant_isolation ON public.recruitment_settings USING ((tenant_id = (current_setting('app.current_tenant_id'::text, true))::integer));


--
-- Name: business_entities tenant_isolation_business_entities; Type: POLICY; Schema: public; Owner: servicall
--

CREATE POLICY tenant_isolation_business_entities ON public.business_entities USING ((tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::integer));


--
-- Name: pos_orders tenant_isolation_pos_orders; Type: POLICY; Schema: public; Owner: servicall
--

CREATE POLICY tenant_isolation_pos_orders ON public.pos_orders USING ((tenant_id = (NULLIF(current_setting('app.tenant_id'::text, true), ''::text))::integer));


--
-- PostgreSQL database dump complete
--

\unrestrict M9VC8QSuaa1upytDdwestdAjv2hzw9BrNoS03gGWi5Dmp7vnGknpYNegTmypnwD

