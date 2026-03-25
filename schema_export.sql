--
-- PostgreSQL database dump
--

\restrict bBtti1c9uHM6HmcrTmx0gPGBt2wcJyuDaxLpMDh7flbWpt49ieQmZhvbgmmjcYX

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
-- Name: appointment_status; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.appointment_status AS ENUM (
    'scheduled',
    'confirmed',
    'completed',
    'cancelled',
    'no_show'
);


ALTER TYPE public.appointment_status OWNER TO servicall;

--
-- Name: booking_status; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.booking_status AS ENUM (
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'no_show'
);


ALTER TYPE public.booking_status OWNER TO servicall;

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
-- Name: campaign_status; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.campaign_status AS ENUM (
    'draft',
    'active',
    'paused',
    'completed',
    'archived'
);


ALTER TYPE public.campaign_status OWNER TO servicall;

--
-- Name: campaign_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.campaign_type AS ENUM (
    'outbound_predictive_dialer',
    'outbound_power_dialer',
    'inbound_ivr',
    'sms_blast',
    'email_sequence'
);


ALTER TYPE public.campaign_type OWNER TO servicall;

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
-- Name: order_status; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'delivered',
    'cancelled'
);


ALTER TYPE public.order_status OWNER TO servicall;

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
-- Name: post_status; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.post_status AS ENUM (
    'draft',
    'scheduled',
    'published',
    'failed'
);


ALTER TYPE public.post_status OWNER TO servicall;

--
-- Name: post_type; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.post_type AS ENUM (
    'promotion',
    'educational',
    'testimonial',
    'news',
    'event'
);


ALTER TYPE public.post_type OWNER TO servicall;

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
-- Name: prospect_status; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.prospect_status AS ENUM (
    'pending',
    'dialing',
    'completed',
    'failed',
    'scheduled'
);


ALTER TYPE public.prospect_status OWNER TO servicall;

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
    'owner',
    'superadmin',
    'admin',
    'manager',
    'agent',
    'agentIA',
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
-- Name: social_platform; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.social_platform AS ENUM (
    'facebook',
    'instagram',
    'linkedin',
    'twitter',
    'tiktok'
);


ALTER TYPE public.social_platform OWNER TO servicall;

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
-- Name: urgency_level; Type: TYPE; Schema: public; Owner: servicall
--

CREATE TYPE public.urgency_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.urgency_level OWNER TO servicall;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agent_performance; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.agent_performance (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    agent_id integer NOT NULL,
    period character varying(50) NOT NULL,
    period_start timestamp without time zone NOT NULL,
    period_end timestamp without time zone NOT NULL,
    total_calls integer DEFAULT 0,
    successful_calls integer DEFAULT 0,
    average_duration integer,
    average_score numeric(3,2),
    metrics json,
    created_at timestamp without time zone DEFAULT now()
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
    tenant_id integer NOT NULL,
    user_id integer NOT NULL,
    from_role character varying(50),
    to_role character varying(50),
    reason text,
    metadata json,
    previous_agent_type character varying(10),
    new_agent_type character varying(10),
    call_id integer,
    triggered_by character varying(50),
    triggered_by_user_id integer,
    created_at timestamp without time zone DEFAULT now()
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
-- Name: ai_metrics; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.ai_metrics (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    metric_type character varying(100) NOT NULL,
    value integer NOT NULL,
    metadata json,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_metrics OWNER TO servicall;

--
-- Name: ai_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.ai_metrics ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ai_metrics_id_seq
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
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
-- Name: api_keys; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.api_keys (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    key character varying(128) NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_used_at timestamp without time zone,
    expires_at timestamp without time zone
);


ALTER TABLE public.api_keys OWNER TO servicall;

--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.api_keys ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.api_keys_id_seq
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
    appointment_id integer NOT NULL,
    reminder_type character varying(50) DEFAULT 'email'::character varying,
    scheduled_at timestamp without time zone NOT NULL,
    sent_at timestamp without time zone,
    status character varying(50) DEFAULT 'pending'::character varying,
    metadata json,
    created_at timestamp without time zone DEFAULT now()
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
    description text,
    scheduled_at timestamp without time zone NOT NULL,
    duration integer DEFAULT 30,
    status character varying(50) DEFAULT 'scheduled'::character varying,
    location character varying(255),
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    tenant_id integer NOT NULL,
    user_id integer,
    action character varying(255) NOT NULL,
    details json,
    resource character varying(255),
    resource_id integer,
    resource_type character varying(100),
    changes json,
    ip_address character varying(45),
    user_agent text,
    metadata json,
    created_at timestamp without time zone DEFAULT now()
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
    tenant_id integer,
    phone_number character varying(50) NOT NULL,
    reason text,
    added_by integer,
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
-- Name: blueprints; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.blueprints (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    definition json NOT NULL,
    rating integer DEFAULT 0,
    downloads integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blueprints OWNER TO servicall;

--
-- Name: blueprints_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.blueprints ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.blueprints_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    room_id integer NOT NULL,
    prospect_id integer,
    check_in timestamp without time zone NOT NULL,
    check_out timestamp without time zone NOT NULL,
    total_price numeric(10,2) NOT NULL,
    status public.booking_status DEFAULT 'confirmed'::public.booking_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.bookings OWNER TO servicall;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.bookings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.bookings_id_seq
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
    vat_rate numeric(5,2) DEFAULT 20.00,
    availability_json json,
    metadata_json json,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
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
-- Name: byok_audit_logs; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.byok_audit_logs (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    action character varying(50) NOT NULL,
    provider character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    message text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.byok_audit_logs OWNER TO servicall;

--
-- Name: byok_audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.byok_audit_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.byok_audit_logs_id_seq
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
    call_received_at timestamp without time zone,
    timestamps json,
    execution_time integer,
    api_calls integer,
    tokens_used integer,
    cost numeric(10,6),
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
    overall_score numeric(3,2),
    sentiment_score numeric(3,2),
    clarity_score numeric(3,2),
    professionalism_score numeric(3,2),
    feedback text,
    metadata json,
    created_at timestamp without time zone DEFAULT now()
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
    direction character varying(20) DEFAULT 'outbound'::character varying,
    campaign_id integer,
    status text DEFAULT 'scheduled'::text,
    scheduled_at timestamp without time zone,
    started_at timestamp without time zone,
    ended_at timestamp without time zone,
    duration integer,
    outcome public.outcome,
    notes text,
    call_sid character varying(255),
    recording_url text,
    recording_key text,
    from_number character varying(50),
    to_number character varying(50),
    transcription text,
    summary text,
    quality_score character varying(10),
    sentiment character varying(50),
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
    campaign_id integer NOT NULL,
    prospect_id integer,
    phone_number character varying(50) NOT NULL,
    name character varying(255),
    status public.prospect_status DEFAULT 'pending'::public.prospect_status,
    call_attempts integer DEFAULT 0,
    last_attempt_at timestamp without time zone,
    scheduled_at timestamp without time zone,
    completed_at timestamp without time zone,
    notes text,
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
    activity_type character varying(100),
    status text DEFAULT 'active'::text,
    details json,
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
    job_offer_id integer,
    cv_url text,
    cv_file_name character varying(255),
    cv_parsed_data json,
    matching_score numeric(5,2),
    matching_details json,
    sent_to_client boolean DEFAULT false,
    sent_to_client_at timestamp without time zone,
    client_feedback text,
    client_decision character varying(50),
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
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.candidate_interviews OWNER TO servicall;

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
    tenant_id integer NOT NULL,
    agent_id integer NOT NULL,
    call_id integer,
    coach_id integer,
    feedback text NOT NULL,
    rating integer,
    strengths json,
    improvements json,
    metadata json,
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
    call_id integer,
    invoice_id integer,
    command text NOT NULL,
    validated_by character varying(100) DEFAULT 'ai'::character varying,
    validated_by_user_id integer,
    confidence numeric(3,2),
    validation_score integer,
    risk_level character varying(50),
    requires_human_review boolean DEFAULT false,
    reason text,
    status character varying(50) DEFAULT 'pending'::character varying,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    alert_type character varying(100) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'open'::character varying,
    severity character varying(50) DEFAULT 'medium'::character varying,
    resolved boolean DEFAULT false,
    resolved_at timestamp without time zone,
    resolution text,
    resource character varying(100),
    resource_id character varying(255),
    metadata json,
    detected_at timestamp without time zone DEFAULT now(),
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
    event_type character varying(100) NOT NULL,
    resource_type character varying(100),
    resource_id integer,
    description text,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    checked_at timestamp without time zone DEFAULT now()
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
-- Name: contact_memories; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.contact_memories (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    contact_id integer NOT NULL,
    interaction_type character varying(50) NOT NULL,
    summary text NOT NULL,
    sentiment character varying(20),
    key_points json,
    next_actions json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contact_memories OWNER TO servicall;

--
-- Name: contact_memories_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.contact_memories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.contact_memories_id_seq
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
    call_id integer,
    invoice_number character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    tax numeric(10,2) DEFAULT 0.00,
    total_amount numeric(10,2),
    currency character varying(3) DEFAULT 'EUR'::character varying,
    description text,
    template character varying(100) DEFAULT 'default'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    due_date timestamp without time zone,
    paid_at timestamp without time zone,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    secure_token text,
    secure_link text,
    link_expires_at timestamp without time zone,
    payment_status character varying(50) DEFAULT 'unpaid'::character varying,
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
-- Name: customers_extended; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.customers_extended (
    id integer NOT NULL,
    prospect_id integer NOT NULL,
    preferences json,
    address text,
    metadata json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.customers_extended OWNER TO servicall;

--
-- Name: customers_extended_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.customers_extended ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.customers_extended_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: deals; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.deals (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    assigned_to integer,
    title character varying(255) NOT NULL,
    description text,
    value numeric(12,2),
    currency character varying(3) DEFAULT 'EUR'::character varying,
    status character varying(50) DEFAULT 'open'::character varying,
    probability integer DEFAULT 0,
    expected_close_date timestamp without time zone,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.deals OWNER TO servicall;

--
-- Name: deals_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.deals ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.deals_id_seq
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
    name character varying(255) NOT NULL,
    type character varying(100),
    file_url text NOT NULL,
    file_size integer,
    mime_type character varying(100),
    uploaded_by integer,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
-- Name: email_configs; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.email_configs (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    provider character varying(50) NOT NULL,
    encrypted_credentials text NOT NULL,
    from_email character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_configs OWNER TO servicall;

--
-- Name: email_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.email_configs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.email_configs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    course_name character varying(255) NOT NULL,
    education_level character varying(100),
    status character varying(50) DEFAULT 'interested'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.enrollments OWNER TO servicall;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.enrollments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.enrollments_id_seq
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
    tenant_id integer,
    job_type character varying(100) NOT NULL,
    payload json,
    error text,
    stack_trace text,
    failed_at timestamp without time zone DEFAULT now(),
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
-- Name: hotel_rooms; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.hotel_rooms (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    room_number character varying(50) NOT NULL,
    room_type character varying(100),
    price_per_night numeric(10,2) NOT NULL,
    available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.hotel_rooms OWNER TO servicall;

--
-- Name: hotel_rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.hotel_rooms ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hotel_rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: interventions; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.interventions (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    type character varying(100) NOT NULL,
    description text,
    urgency character varying(50) DEFAULT 'low'::character varying,
    scheduled_at timestamp without time zone,
    status character varying(50) DEFAULT 'scheduled'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.interventions OWNER TO servicall;

--
-- Name: interventions_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.interventions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.interventions_id_seq
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
-- Name: job_offers; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.job_offers (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    department character varying(100),
    location character varying(255),
    salary_range character varying(100),
    contract_type character varying(50),
    requirements_id integer,
    skills_required json,
    experience_years integer DEFAULT 0,
    education_level character varying(100),
    remote_work character varying(50) DEFAULT 'onsite'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    application_deadline timestamp without time zone,
    positions_count integer DEFAULT 1,
    filled_positions integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.job_offers OWNER TO servicall;

--
-- Name: job_offers_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.job_offers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.job_offers_id_seq
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
-- Name: leads; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.leads (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(20),
    company character varying(255),
    industry character varying(100),
    source character varying(50),
    source_data json,
    enrichment_status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.leads OWNER TO servicall;

--
-- Name: leads_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.leads ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.leads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: legal_cases; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.legal_cases (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    case_type character varying(100),
    description text,
    status character varying(50) DEFAULT 'open'::character varying,
    drive_folder_url text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.legal_cases OWNER TO servicall;

--
-- Name: legal_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.legal_cases ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.legal_cases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: medical_appointments; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.medical_appointments (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    doctor_id integer,
    appointment_date timestamp without time zone NOT NULL,
    symptoms text,
    urgency_level public.urgency_level DEFAULT 'low'::public.urgency_level NOT NULL,
    status public.appointment_status DEFAULT 'scheduled'::public.appointment_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.medical_appointments OWNER TO servicall;

--
-- Name: medical_appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.medical_appointments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.medical_appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: menu_items; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.menu_items (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100),
    price numeric(10,2) NOT NULL,
    available boolean DEFAULT true,
    allergens json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.menu_items OWNER TO servicall;

--
-- Name: menu_items_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.menu_items ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.menu_items_id_seq
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
    tax numeric(10,2) DEFAULT 0.00,
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
    provider character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    vat_amount numeric(10,2) NOT NULL,
    sync_log json,
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
    prospect_id integer NOT NULL,
    invoice_id integer,
    score_type character varying(100) DEFAULT 'payment_prediction'::character varying NOT NULL,
    score numeric(5,4),
    confidence numeric(3,2),
    probability_acceptance numeric(5,4),
    estimated_payment_delay integer,
    estimated_processing_time integer,
    recommended_channel character varying(100),
    recommended_time character varying(100),
    success_probability numeric(5,4),
    risk_factors json,
    factors json,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    source character varying(255) NOT NULL,
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
    job_title character varying(255),
    source character varying(100),
    status public.status DEFAULT 'new'::public.status,
    assigned_to integer,
    notes text,
    priority character varying(50) DEFAULT 'medium'::character varying,
    due_date timestamp without time zone,
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
-- Name: real_estate_properties; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.real_estate_properties (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    property_type character varying(50),
    price numeric(12,2) NOT NULL,
    location character varying(255) NOT NULL,
    rooms integer,
    surface numeric(10,2),
    available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.real_estate_properties OWNER TO servicall;

--
-- Name: real_estate_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.real_estate_properties ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.real_estate_properties_id_seq
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
    recording_sid character varying(255),
    recording_url text,
    duration integer,
    status character varying(50) DEFAULT 'available'::character varying,
    metadata json,
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
-- Name: reports; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    report_type character varying(50) NOT NULL,
    html_content text NOT NULL,
    sent_to character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reports OWNER TO servicall;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.reports ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: restaurant_orders; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.restaurant_orders (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    order_number character varying(50) NOT NULL,
    items_json json NOT NULL,
    total_price numeric(10,2) NOT NULL,
    delivery_address text,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.restaurant_orders OWNER TO servicall;

--
-- Name: restaurant_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.restaurant_orders ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.restaurant_orders_id_seq
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
    granted boolean DEFAULT false,
    granted_at timestamp without time zone,
    resolved_at timestamp without time zone,
    metadata json,
    detected_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
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
    event_type character varying(100) NOT NULL,
    severity character varying(50) DEFAULT 'low'::character varying,
    description text,
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
-- Name: shipments; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.shipments (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    prospect_id integer,
    tracking_number character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    estimated_delivery timestamp without time zone,
    actual_delivery timestamp without time zone,
    shipping_address text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.shipments OWNER TO servicall;

--
-- Name: shipments_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.shipments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.shipments_id_seq
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
-- Name: social_accounts; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.social_accounts (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    platform public.social_platform NOT NULL,
    platform_account_id character varying(255) NOT NULL,
    account_name character varying(255),
    access_token text,
    refresh_token text,
    token_expires_at timestamp without time zone,
    is_active boolean DEFAULT true,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.social_accounts OWNER TO servicall;

--
-- Name: social_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.social_accounts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.social_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: social_comments; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.social_comments (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    post_id integer NOT NULL,
    platform_comment_id character varying(255) NOT NULL,
    author_name character varying(255),
    author_id character varying(255),
    content text NOT NULL,
    sentiment character varying(20),
    intent_detected character varying(50),
    is_replied boolean DEFAULT false,
    reply_content text,
    replied_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.social_comments OWNER TO servicall;

--
-- Name: social_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.social_comments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.social_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: social_posts; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.social_posts (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    user_id integer,
    platform public.social_platform NOT NULL,
    status public.post_status DEFAULT 'draft'::public.post_status,
    type public.post_type DEFAULT 'news'::public.post_type,
    content text NOT NULL,
    original_prompt text,
    image_url text,
    media_metadata json,
    hashtags json,
    scheduled_at timestamp without time zone,
    published_at timestamp without time zone,
    platform_post_id character varying(255),
    platform_url text,
    error text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    reach_count integer DEFAULT 0,
    metadata json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.social_posts OWNER TO servicall;

--
-- Name: social_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.social_posts ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.social_posts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stripe_connections; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.stripe_connections (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    stripe_account_id character varying(255) NOT NULL,
    is_connected boolean DEFAULT false NOT NULL,
    commission_rate integer DEFAULT 5,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stripe_connections OWNER TO servicall;

--
-- Name: stripe_connections_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.stripe_connections ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.stripe_connections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stripe_events; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.stripe_events (
    id integer NOT NULL,
    event_id character varying(255) NOT NULL,
    event_type character varying(100) NOT NULL,
    tenant_id integer,
    payload json NOT NULL,
    processed boolean DEFAULT false,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
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
    assigned_to integer,
    prospect_id integer,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
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
    business_type character varying(50),
    ai_custom_script text,
    pos_provider character varying(50),
    pos_config json,
    pos_sync_enabled boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
-- Name: training_modules; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.training_modules (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    user_id integer NOT NULL,
    module_type character varying(50) NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    score integer,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.training_modules OWNER TO servicall;

--
-- Name: training_modules_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.training_modules ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.training_modules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usage_metrics; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.usage_metrics (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    resource_type character varying(100) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    cost numeric(10,6) DEFAULT '0'::numeric NOT NULL,
    metadata json,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.usage_metrics OWNER TO servicall;

--
-- Name: usage_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.usage_metrics ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usage_metrics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_2fa; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.user_2fa (
    id integer NOT NULL,
    user_id integer NOT NULL,
    secret text NOT NULL,
    is_enabled boolean DEFAULT false,
    backup_codes json,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_2fa OWNER TO servicall;

--
-- Name: user_2fa_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.user_2fa ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_2fa_id_seq
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
-- Name: webhook_deliveries; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.webhook_deliveries (
    id integer NOT NULL,
    subscription_id integer NOT NULL,
    event character varying(100) NOT NULL,
    payload json,
    status_code integer,
    response text,
    retry_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.webhook_deliveries OWNER TO servicall;

--
-- Name: webhook_deliveries_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.webhook_deliveries ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.webhook_deliveries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: webhook_subscriptions; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.webhook_subscriptions (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    url character varying(500) NOT NULL,
    events json NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.webhook_subscriptions OWNER TO servicall;

--
-- Name: webhook_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.webhook_subscriptions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.webhook_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: workflow_executions; Type: TABLE; Schema: public; Owner: servicall
--

CREATE TABLE public.workflow_executions (
    id integer NOT NULL,
    workflow_id integer NOT NULL,
    tenant_id integer NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    trigger character varying(100) NOT NULL,
    input json,
    output json,
    error text,
    started_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.workflow_executions OWNER TO servicall;

--
-- Name: workflow_executions_id_seq; Type: SEQUENCE; Schema: public; Owner: servicall
--

ALTER TABLE public.workflow_executions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.workflow_executions_id_seq
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
-- Name: ai_metrics ai_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.ai_metrics
    ADD CONSTRAINT ai_metrics_pkey PRIMARY KEY (id);


--
-- Name: ai_suggestions ai_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_key_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_key_unique UNIQUE (key);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


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
-- Name: blacklisted_numbers blacklisted_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.blacklisted_numbers
    ADD CONSTRAINT blacklisted_numbers_pkey PRIMARY KEY (id);


--
-- Name: blueprints blueprints_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.blueprints
    ADD CONSTRAINT blueprints_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: business_entities business_entities_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.business_entities
    ADD CONSTRAINT business_entities_pkey PRIMARY KEY (id);


--
-- Name: byok_audit_logs byok_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.byok_audit_logs
    ADD CONSTRAINT byok_audit_logs_pkey PRIMARY KEY (id);


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
-- Name: contact_memories contact_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.contact_memories
    ADD CONSTRAINT contact_memories_pkey PRIMARY KEY (id);


--
-- Name: customer_invoices customer_invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.customer_invoices
    ADD CONSTRAINT customer_invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: customer_invoices customer_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.customer_invoices
    ADD CONSTRAINT customer_invoices_pkey PRIMARY KEY (id);


--
-- Name: customers_extended customers_extended_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.customers_extended
    ADD CONSTRAINT customers_extended_pkey PRIMARY KEY (id);


--
-- Name: customers_extended customers_extended_prospect_id_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.customers_extended
    ADD CONSTRAINT customers_extended_prospect_id_unique UNIQUE (prospect_id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: email_configs email_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.email_configs
    ADD CONSTRAINT email_configs_pkey PRIMARY KEY (id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: hotel_rooms hotel_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.hotel_rooms
    ADD CONSTRAINT hotel_rooms_pkey PRIMARY KEY (id);


--
-- Name: interventions interventions_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_pkey PRIMARY KEY (id);


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
-- Name: job_offers job_offers_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.job_offers
    ADD CONSTRAINT job_offers_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: legal_cases legal_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_pkey PRIMARY KEY (id);


--
-- Name: medical_appointments medical_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


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
-- Name: real_estate_properties real_estate_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.real_estate_properties
    ADD CONSTRAINT real_estate_properties_pkey PRIMARY KEY (id);


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
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: restaurant_orders restaurant_orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_order_number_unique UNIQUE (order_number);


--
-- Name: restaurant_orders restaurant_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_pkey PRIMARY KEY (id);


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
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- Name: shipments shipments_tracking_number_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_tracking_number_unique UNIQUE (tracking_number);


--
-- Name: simulated_calls simulated_calls_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.simulated_calls
    ADD CONSTRAINT simulated_calls_pkey PRIMARY KEY (id);


--
-- Name: social_accounts social_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_pkey PRIMARY KEY (id);


--
-- Name: social_comments social_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.social_comments
    ADD CONSTRAINT social_comments_pkey PRIMARY KEY (id);


--
-- Name: social_posts social_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_pkey PRIMARY KEY (id);


--
-- Name: stripe_connections stripe_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.stripe_connections
    ADD CONSTRAINT stripe_connections_pkey PRIMARY KEY (id);


--
-- Name: stripe_connections stripe_connections_stripe_account_id_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.stripe_connections
    ADD CONSTRAINT stripe_connections_stripe_account_id_unique UNIQUE (stripe_account_id);


--
-- Name: stripe_events stripe_events_event_id_unique; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.stripe_events
    ADD CONSTRAINT stripe_events_event_id_unique UNIQUE (event_id);


--
-- Name: stripe_events stripe_events_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.stripe_events
    ADD CONSTRAINT stripe_events_pkey PRIMARY KEY (id);


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
-- Name: training_modules training_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.training_modules
    ADD CONSTRAINT training_modules_pkey PRIMARY KEY (id);


--
-- Name: usage_metrics usage_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.usage_metrics
    ADD CONSTRAINT usage_metrics_pkey PRIMARY KEY (id);


--
-- Name: user_2fa user_2fa_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.user_2fa
    ADD CONSTRAINT user_2fa_pkey PRIMARY KEY (id);


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
-- Name: webhook_deliveries webhook_deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_pkey PRIMARY KEY (id);


--
-- Name: webhook_subscriptions webhook_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.webhook_subscriptions
    ADD CONSTRAINT webhook_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: workflow_executions workflow_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT workflow_executions_pkey PRIMARY KEY (id);


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
-- Name: ai_metrics_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX ai_metrics_created_at_idx ON public.ai_metrics USING btree (created_at);


--
-- Name: ai_metrics_metric_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX ai_metrics_metric_type_idx ON public.ai_metrics USING btree (metric_type);


--
-- Name: ai_metrics_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX ai_metrics_tenant_id_idx ON public.ai_metrics USING btree (tenant_id);


--
-- Name: api_keys_key_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX api_keys_key_idx ON public.api_keys USING btree (key);


--
-- Name: api_keys_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX api_keys_tenant_id_idx ON public.api_keys USING btree (tenant_id);


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
-- Name: blueprints_category_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX blueprints_category_idx ON public.blueprints USING btree (category);


--
-- Name: byok_audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX byok_audit_logs_created_at_idx ON public.byok_audit_logs USING btree (created_at);


--
-- Name: byok_audit_logs_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX byok_audit_logs_tenant_id_idx ON public.byok_audit_logs USING btree (tenant_id);


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
-- Name: campaign_prospect_unique_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX campaign_prospect_unique_idx ON public.campaign_prospects USING btree (campaign_id, prospect_id);


--
-- Name: campaign_prospects_scheduled_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX campaign_prospects_scheduled_at_idx ON public.campaign_prospects USING btree (scheduled_at);


--
-- Name: campaign_prospects_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX campaign_prospects_status_idx ON public.campaign_prospects USING btree (status);


--
-- Name: campaigns_activity_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX campaigns_activity_idx ON public.campaigns USING btree (activity_type);


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

CREATE INDEX candidate_interviews_created_at_idx ON public.candidate_interviews USING btree (created_at DESC NULLS LAST);


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
-- Name: contact_memories_contact_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX contact_memories_contact_id_idx ON public.contact_memories USING btree (contact_id);


--
-- Name: contact_memories_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX contact_memories_created_at_idx ON public.contact_memories USING btree (created_at);


--
-- Name: contact_memories_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX contact_memories_tenant_id_idx ON public.contact_memories USING btree (tenant_id);


--
-- Name: email_configs_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX email_configs_tenant_id_idx ON public.email_configs USING btree (tenant_id);


--
-- Name: email_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX email_idx ON public.users USING btree (email);


--
-- Name: idx_agent_performance_agent_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_agent_performance_agent_id_idx ON public.agent_performance USING btree (agent_id);


--
-- Name: idx_agent_performance_period_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_agent_performance_period_idx ON public.agent_performance USING btree (period);


--
-- Name: idx_agent_performance_period_start_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_agent_performance_period_start_idx ON public.agent_performance USING btree (period_start);


--
-- Name: idx_agent_performance_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_agent_performance_tenant_id_idx ON public.agent_performance USING btree (tenant_id);


--
-- Name: idx_agent_switch_history_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_agent_switch_history_created_at_idx ON public.agent_switch_history USING btree (created_at);


--
-- Name: idx_agent_switch_history_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_agent_switch_history_tenant_id_idx ON public.agent_switch_history USING btree (tenant_id);


--
-- Name: idx_agent_switch_history_user_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_agent_switch_history_user_id_idx ON public.agent_switch_history USING btree (user_id);


--
-- Name: idx_ai_suggestions_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_ai_suggestions_tenant_id_idx ON public.ai_suggestions USING btree (tenant_id);


--
-- Name: idx_appointment_reminders_appointment_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointment_reminders_appointment_id_idx ON public.appointment_reminders USING btree (appointment_id);


--
-- Name: idx_appointment_reminders_scheduled_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointment_reminders_scheduled_at_idx ON public.appointment_reminders USING btree (scheduled_at);


--
-- Name: idx_appointment_reminders_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointment_reminders_status_idx ON public.appointment_reminders USING btree (status);


--
-- Name: idx_appointment_reminders_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointment_reminders_tenant_id_idx ON public.appointment_reminders USING btree (tenant_id);


--
-- Name: idx_appointments_agent_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointments_agent_id_idx ON public.appointments USING btree (agent_id);


--
-- Name: idx_appointments_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointments_prospect_id_idx ON public.appointments USING btree (prospect_id);


--
-- Name: idx_appointments_scheduled_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointments_scheduled_at_idx ON public.appointments USING btree (scheduled_at);


--
-- Name: idx_appointments_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointments_status_idx ON public.appointments USING btree (status);


--
-- Name: idx_appointments_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_appointments_tenant_id_idx ON public.appointments USING btree (tenant_id);


--
-- Name: idx_audit_ai_usage_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_audit_ai_usage_created_at_idx ON public.audit_ai_usage USING btree (created_at);


--
-- Name: idx_audit_ai_usage_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_audit_ai_usage_tenant_id_idx ON public.audit_ai_usage USING btree (tenant_id);


--
-- Name: idx_blacklisted_numbers_phone_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_blacklisted_numbers_phone_unique ON public.blacklisted_numbers USING btree (phone_number);


--
-- Name: idx_blacklisted_numbers_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_blacklisted_numbers_tenant_id_idx ON public.blacklisted_numbers USING btree (tenant_id);


--
-- Name: idx_bookings_check_in; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_bookings_check_in ON public.bookings USING btree (check_in);


--
-- Name: idx_bookings_check_out; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_bookings_check_out ON public.bookings USING btree (check_out);


--
-- Name: idx_bookings_prospect_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_bookings_prospect_id ON public.bookings USING btree (prospect_id);


--
-- Name: idx_bookings_room_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_bookings_room_id ON public.bookings USING btree (room_id);


--
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- Name: idx_bookings_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_bookings_tenant_id ON public.bookings USING btree (tenant_id);


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
-- Name: idx_call_execution_metrics_call_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_call_execution_metrics_call_id_idx ON public.call_execution_metrics USING btree (call_id);


--
-- Name: idx_call_execution_metrics_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_call_execution_metrics_tenant_id_idx ON public.call_execution_metrics USING btree (tenant_id);


--
-- Name: idx_call_scoring_call_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_call_scoring_call_id_idx ON public.call_scoring USING btree (call_id);


--
-- Name: idx_call_scoring_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_call_scoring_tenant_id_idx ON public.call_scoring USING btree (tenant_id);


--
-- Name: idx_coaching_feedback_agent_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_coaching_feedback_agent_id_idx ON public.coaching_feedback USING btree (agent_id);


--
-- Name: idx_coaching_feedback_call_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_coaching_feedback_call_id_idx ON public.coaching_feedback USING btree (call_id);


--
-- Name: idx_coaching_feedback_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_coaching_feedback_tenant_id_idx ON public.coaching_feedback USING btree (tenant_id);


--
-- Name: idx_command_validations_call_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_command_validations_call_id_idx ON public.command_validations USING btree (call_id);


--
-- Name: idx_command_validations_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_command_validations_prospect_id_idx ON public.command_validations USING btree (prospect_id);


--
-- Name: idx_command_validations_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_command_validations_status_idx ON public.command_validations USING btree (status);


--
-- Name: idx_command_validations_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_command_validations_tenant_id_idx ON public.command_validations USING btree (tenant_id);


--
-- Name: idx_compliance_alerts_alert_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_compliance_alerts_alert_type_idx ON public.compliance_alerts USING btree (alert_type);


--
-- Name: idx_compliance_alerts_severity_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_compliance_alerts_severity_idx ON public.compliance_alerts USING btree (severity);


--
-- Name: idx_compliance_alerts_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_compliance_alerts_status_idx ON public.compliance_alerts USING btree (status);


--
-- Name: idx_compliance_alerts_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_compliance_alerts_tenant_id_idx ON public.compliance_alerts USING btree (tenant_id);


--
-- Name: idx_compliance_logs_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_compliance_logs_created_at_idx ON public.compliance_logs USING btree (created_at);


--
-- Name: idx_compliance_logs_event_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_compliance_logs_event_type_idx ON public.compliance_logs USING btree (event_type);


--
-- Name: idx_compliance_logs_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_compliance_logs_tenant_id_idx ON public.compliance_logs USING btree (tenant_id);


--
-- Name: idx_cust_ext_prospect_id_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_cust_ext_prospect_id_unique ON public.customers_extended USING btree (prospect_id);


--
-- Name: idx_customer_invoices_invoice_number_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_customer_invoices_invoice_number_unique ON public.customer_invoices USING btree (invoice_number);


--
-- Name: idx_customer_invoices_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_customer_invoices_prospect_id_idx ON public.customer_invoices USING btree (prospect_id);


--
-- Name: idx_customer_invoices_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_customer_invoices_status_idx ON public.customer_invoices USING btree (status);


--
-- Name: idx_customer_invoices_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_customer_invoices_tenant_id_idx ON public.customer_invoices USING btree (tenant_id);


--
-- Name: idx_deals_assigned_to_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_deals_assigned_to_idx ON public.deals USING btree (assigned_to);


--
-- Name: idx_deals_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_deals_prospect_id_idx ON public.deals USING btree (prospect_id);


--
-- Name: idx_deals_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_deals_status_idx ON public.deals USING btree (status);


--
-- Name: idx_deals_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_deals_tenant_id_idx ON public.deals USING btree (tenant_id);


--
-- Name: idx_documents_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_documents_prospect_id_idx ON public.documents USING btree (prospect_id);


--
-- Name: idx_documents_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_documents_tenant_id_idx ON public.documents USING btree (tenant_id);


--
-- Name: idx_documents_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_documents_type_idx ON public.documents USING btree (type);


--
-- Name: idx_enroll_course; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_enroll_course ON public.enrollments USING btree (course_name);


--
-- Name: idx_enroll_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_enroll_tenant_id ON public.enrollments USING btree (tenant_id);


--
-- Name: idx_failed_jobs_failed_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_failed_jobs_failed_at_idx ON public.failed_jobs USING btree (failed_at);


--
-- Name: idx_failed_jobs_job_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_failed_jobs_job_type_idx ON public.failed_jobs USING btree (job_type);


--
-- Name: idx_failed_jobs_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_failed_jobs_tenant_id_idx ON public.failed_jobs USING btree (tenant_id);


--
-- Name: idx_hotel_rooms_available; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_hotel_rooms_available ON public.hotel_rooms USING btree (available);


--
-- Name: idx_hotel_rooms_number; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_hotel_rooms_number ON public.hotel_rooms USING btree (room_number);


--
-- Name: idx_hotel_rooms_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_hotel_rooms_tenant_id ON public.hotel_rooms USING btree (tenant_id);


--
-- Name: idx_hotel_rooms_tenant_number; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_hotel_rooms_tenant_number ON public.hotel_rooms USING btree (tenant_id, room_number);


--
-- Name: idx_interv_status; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_interv_status ON public.interventions USING btree (status);


--
-- Name: idx_interv_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_interv_tenant_id ON public.interventions USING btree (tenant_id);


--
-- Name: idx_jobs_active; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_jobs_active ON public.job_offers USING btree (is_active);


--
-- Name: idx_jobs_priority; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_jobs_priority ON public.job_offers USING btree (priority);


--
-- Name: idx_jobs_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_jobs_tenant_id ON public.job_offers USING btree (tenant_id);


--
-- Name: idx_legal_cases_prospect_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_legal_cases_prospect_id ON public.legal_cases USING btree (prospect_id);


--
-- Name: idx_legal_cases_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_legal_cases_tenant_id ON public.legal_cases USING btree (tenant_id);


--
-- Name: idx_medical_app_date; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_medical_app_date ON public.medical_appointments USING btree (appointment_date);


--
-- Name: idx_medical_app_doctor_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_medical_app_doctor_id ON public.medical_appointments USING btree (doctor_id);


--
-- Name: idx_medical_app_prospect_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_medical_app_prospect_id ON public.medical_appointments USING btree (prospect_id);


--
-- Name: idx_medical_app_status; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_medical_app_status ON public.medical_appointments USING btree (status);


--
-- Name: idx_medical_app_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_medical_app_tenant_id ON public.medical_appointments USING btree (tenant_id);


--
-- Name: idx_medical_app_urgency; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_medical_app_urgency ON public.medical_appointments USING btree (urgency_level);


--
-- Name: idx_menu_items_available; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_menu_items_available ON public.menu_items USING btree (available);


--
-- Name: idx_menu_items_category; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_menu_items_category ON public.menu_items USING btree (category);


--
-- Name: idx_menu_items_tenant_category; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_menu_items_tenant_category ON public.menu_items USING btree (tenant_id, category);


--
-- Name: idx_menu_items_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_menu_items_tenant_id ON public.menu_items USING btree (tenant_id);


--
-- Name: idx_message_templates_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_message_templates_tenant_id_idx ON public.message_templates USING btree (tenant_id);


--
-- Name: idx_order_items_order_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_number_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_orders_number_unique ON public.restaurant_orders USING btree (order_number);


--
-- Name: idx_orders_order_number_idx_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_orders_order_number_idx_unique ON public.orders USING btree (order_number);


--
-- Name: idx_orders_prospect_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_prospect_id ON public.restaurant_orders USING btree (prospect_id);


--
-- Name: idx_orders_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_prospect_id_idx ON public.orders USING btree (prospect_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_status ON public.restaurant_orders USING btree (status);


--
-- Name: idx_orders_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_status_idx ON public.orders USING btree (status);


--
-- Name: idx_orders_tenant_created; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_tenant_created ON public.restaurant_orders USING btree (tenant_id, created_at);


--
-- Name: idx_orders_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_orders_tenant_id ON public.restaurant_orders USING btree (tenant_id);


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
-- Name: idx_predictive_scores_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_predictive_scores_prospect_id_idx ON public.predictive_scores USING btree (prospect_id);


--
-- Name: idx_predictive_scores_score_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_predictive_scores_score_type_idx ON public.predictive_scores USING btree (score_type);


--
-- Name: idx_predictive_scores_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_predictive_scores_tenant_id_idx ON public.predictive_scores USING btree (tenant_id);


--
-- Name: idx_processed_events_processed_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_processed_events_processed_at_idx ON public.processed_events USING btree (processed_at);


--
-- Name: idx_processed_events_source_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_processed_events_source_idx ON public.processed_events USING btree (source);


--
-- Name: idx_prospects_lookup; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_prospects_lookup ON public.prospects USING btree (tenant_id, phone);


--
-- Name: idx_re_prop_location; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_re_prop_location ON public.real_estate_properties USING btree (location);


--
-- Name: idx_re_prop_price; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_re_prop_price ON public.real_estate_properties USING btree (price);


--
-- Name: idx_re_prop_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_re_prop_tenant_id ON public.real_estate_properties USING btree (tenant_id);


--
-- Name: idx_re_prop_type; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_re_prop_type ON public.real_estate_properties USING btree (type);


--
-- Name: idx_recordings_call_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_recordings_call_id_idx ON public.recordings USING btree (call_id);


--
-- Name: idx_recordings_recording_sid_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_recordings_recording_sid_unique ON public.recordings USING btree (recording_sid);


--
-- Name: idx_recordings_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_recordings_tenant_id_idx ON public.recordings USING btree (tenant_id);


--
-- Name: idx_rgpd_consents_consent_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_rgpd_consents_consent_type_idx ON public.rgpd_consents USING btree (consent_type);


--
-- Name: idx_rgpd_consents_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_rgpd_consents_prospect_id_idx ON public.rgpd_consents USING btree (prospect_id);


--
-- Name: idx_rgpd_consents_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_rgpd_consents_tenant_id_idx ON public.rgpd_consents USING btree (tenant_id);


--
-- Name: idx_security_audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_security_audit_logs_created_at_idx ON public.security_audit_logs USING btree (created_at);


--
-- Name: idx_security_audit_logs_event_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_security_audit_logs_event_type_idx ON public.security_audit_logs USING btree (event_type);


--
-- Name: idx_security_audit_logs_severity_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_security_audit_logs_severity_idx ON public.security_audit_logs USING btree (severity);


--
-- Name: idx_security_audit_logs_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_security_audit_logs_tenant_id_idx ON public.security_audit_logs USING btree (tenant_id);


--
-- Name: idx_shipments_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_shipments_tenant_id ON public.shipments USING btree (tenant_id);


--
-- Name: idx_shipments_tracking_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_shipments_tracking_unique ON public.shipments USING btree (tracking_number);


--
-- Name: idx_simulated_calls_agent_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_simulated_calls_agent_id_idx ON public.simulated_calls USING btree (agent_id);


--
-- Name: idx_simulated_calls_scenario_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_simulated_calls_scenario_id_idx ON public.simulated_calls USING btree (scenario_id);


--
-- Name: idx_simulated_calls_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_simulated_calls_tenant_id_idx ON public.simulated_calls USING btree (tenant_id);


--
-- Name: idx_social_accounts_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_social_accounts_tenant_id ON public.social_accounts USING btree (tenant_id);


--
-- Name: idx_social_accounts_tenant_platform; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_social_accounts_tenant_platform ON public.social_accounts USING btree (tenant_id, platform);


--
-- Name: idx_social_comments_platform_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_social_comments_platform_id ON public.social_comments USING btree (platform_comment_id);


--
-- Name: idx_social_comments_post_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_social_comments_post_id ON public.social_comments USING btree (post_id);


--
-- Name: idx_social_comments_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_social_comments_tenant_id ON public.social_comments USING btree (tenant_id);


--
-- Name: idx_social_posts_scheduled_at; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_social_posts_scheduled_at ON public.social_posts USING btree (scheduled_at);


--
-- Name: idx_social_posts_status; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_social_posts_status ON public.social_posts USING btree (status);


--
-- Name: idx_social_posts_tenant_id; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_social_posts_tenant_id ON public.social_posts USING btree (tenant_id);


--
-- Name: idx_social_posts_tenant_status; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_social_posts_tenant_status ON public.social_posts USING btree (tenant_id, status);


--
-- Name: idx_stripe_events_event_id_unique; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_stripe_events_event_id_unique ON public.stripe_events USING btree (event_id);


--
-- Name: idx_stripe_events_event_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_stripe_events_event_type_idx ON public.stripe_events USING btree (event_type);


--
-- Name: idx_stripe_events_processed_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_stripe_events_processed_idx ON public.stripe_events USING btree (processed);


--
-- Name: idx_tasks_assigned_to_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_tasks_assigned_to_idx ON public.tasks USING btree (assigned_to);


--
-- Name: idx_tasks_priority_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_tasks_priority_idx ON public.tasks USING btree (priority);


--
-- Name: idx_tasks_prospect_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_tasks_prospect_id_idx ON public.tasks USING btree (prospect_id);


--
-- Name: idx_tasks_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_tasks_status_idx ON public.tasks USING btree (status);


--
-- Name: idx_tasks_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_tasks_tenant_id_idx ON public.tasks USING btree (tenant_id);


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
-- Name: idx_usage_metrics_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_usage_metrics_created_at_idx ON public.usage_metrics USING btree (created_at);


--
-- Name: idx_usage_metrics_resource_type_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_usage_metrics_resource_type_idx ON public.usage_metrics USING btree (resource_type);


--
-- Name: idx_usage_metrics_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX idx_usage_metrics_tenant_id_idx ON public.usage_metrics USING btree (tenant_id);


--
-- Name: idx_user_2fa_user_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX idx_user_2fa_user_id_idx ON public.user_2fa USING btree (user_id);


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
-- Name: leads_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX leads_created_at_idx ON public.leads USING btree (created_at);


--
-- Name: leads_email_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX leads_email_idx ON public.leads USING btree (email);


--
-- Name: leads_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX leads_tenant_id_idx ON public.leads USING btree (tenant_id);


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
-- Name: reports_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX reports_created_at_idx ON public.reports USING btree (created_at);


--
-- Name: reports_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX reports_tenant_id_idx ON public.reports USING btree (tenant_id);


--
-- Name: slug_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX slug_idx ON public.tenants USING btree (slug);


--
-- Name: stripe_connections_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX stripe_connections_tenant_id_idx ON public.stripe_connections USING btree (tenant_id);


--
-- Name: tenant_users_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tenant_users_tenant_id_idx ON public.tenant_users USING btree (tenant_id);


--
-- Name: tenant_users_user_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX tenant_users_user_id_idx ON public.tenant_users USING btree (user_id);


--
-- Name: training_modules_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX training_modules_tenant_id_idx ON public.training_modules USING btree (tenant_id);


--
-- Name: training_modules_user_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX training_modules_user_id_idx ON public.training_modules USING btree (user_id);


--
-- Name: unique_processed_event_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX unique_processed_event_idx ON public.processed_events USING btree (source, event_id);


--
-- Name: unique_template_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE UNIQUE INDEX unique_template_idx ON public.workflow_templates USING btree (industry_id, template_id);


--
-- Name: webhook_deliveries_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX webhook_deliveries_created_at_idx ON public.webhook_deliveries USING btree (created_at);


--
-- Name: webhook_deliveries_subscription_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX webhook_deliveries_subscription_id_idx ON public.webhook_deliveries USING btree (subscription_id);


--
-- Name: webhook_subscriptions_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX webhook_subscriptions_tenant_id_idx ON public.webhook_subscriptions USING btree (tenant_id);


--
-- Name: workflow_executions_created_at_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflow_executions_created_at_idx ON public.workflow_executions USING btree (created_at);


--
-- Name: workflow_executions_status_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflow_executions_status_idx ON public.workflow_executions USING btree (status);


--
-- Name: workflow_executions_tenant_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflow_executions_tenant_id_idx ON public.workflow_executions USING btree (tenant_id);


--
-- Name: workflow_executions_workflow_id_idx; Type: INDEX; Schema: public; Owner: servicall
--

CREATE INDEX workflow_executions_workflow_id_idx ON public.workflow_executions USING btree (workflow_id);


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
-- Name: agent_performance agent_performance_agent_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.agent_performance
    ADD CONSTRAINT agent_performance_agent_id_tenants_id_fk FOREIGN KEY (agent_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: agent_performance agent_performance_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.agent_performance
    ADD CONSTRAINT agent_performance_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: agent_switch_history agent_switch_history_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.agent_switch_history
    ADD CONSTRAINT agent_switch_history_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: agent_switch_history agent_switch_history_user_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.agent_switch_history
    ADD CONSTRAINT agent_switch_history_user_id_tenants_id_fk FOREIGN KEY (user_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


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
-- Name: api_keys api_keys_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


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
-- Name: appointments appointments_agent_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_agent_id_tenants_id_fk FOREIGN KEY (agent_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


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
-- Name: blacklisted_numbers blacklisted_numbers_added_by_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.blacklisted_numbers
    ADD CONSTRAINT blacklisted_numbers_added_by_tenants_id_fk FOREIGN KEY (added_by) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: blacklisted_numbers blacklisted_numbers_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.blacklisted_numbers
    ADD CONSTRAINT blacklisted_numbers_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: bookings bookings_room_id_hotel_rooms_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_room_id_hotel_rooms_id_fk FOREIGN KEY (room_id) REFERENCES public.hotel_rooms(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: business_entities business_entities_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.business_entities
    ADD CONSTRAINT business_entities_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: call_execution_metrics call_execution_metrics_call_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_execution_metrics
    ADD CONSTRAINT call_execution_metrics_call_id_campaigns_id_fk FOREIGN KEY (call_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: call_execution_metrics call_execution_metrics_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_execution_metrics
    ADD CONSTRAINT call_execution_metrics_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: call_scoring call_scoring_call_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.call_scoring
    ADD CONSTRAINT call_scoring_call_id_campaigns_id_fk FOREIGN KEY (call_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


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
-- Name: calls calls_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


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
-- Name: campaigns campaigns_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: candidate_interviews candidate_interviews_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.candidate_interviews
    ADD CONSTRAINT candidate_interviews_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: coaching_feedback coaching_feedback_agent_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.coaching_feedback
    ADD CONSTRAINT coaching_feedback_agent_id_tenants_id_fk FOREIGN KEY (agent_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: coaching_feedback coaching_feedback_call_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.coaching_feedback
    ADD CONSTRAINT coaching_feedback_call_id_campaigns_id_fk FOREIGN KEY (call_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: coaching_feedback coaching_feedback_coach_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.coaching_feedback
    ADD CONSTRAINT coaching_feedback_coach_id_tenants_id_fk FOREIGN KEY (coach_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: coaching_feedback coaching_feedback_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.coaching_feedback
    ADD CONSTRAINT coaching_feedback_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: command_validations command_validations_call_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.command_validations
    ADD CONSTRAINT command_validations_call_id_campaigns_id_fk FOREIGN KEY (call_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


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
-- Name: command_validations command_validations_validated_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.command_validations
    ADD CONSTRAINT command_validations_validated_by_user_id_users_id_fk FOREIGN KEY (validated_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


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
-- Name: customers_extended customers_extended_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.customers_extended
    ADD CONSTRAINT customers_extended_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: deals deals_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: deals deals_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: deals deals_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: documents documents_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: documents documents_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_tenants_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: enrollments enrollments_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: enrollments enrollments_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: failed_jobs failed_jobs_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: hotel_rooms hotel_rooms_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.hotel_rooms
    ADD CONSTRAINT hotel_rooms_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: interventions interventions_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: interventions interventions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: interview_questions interview_questions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.interview_questions
    ADD CONSTRAINT interview_questions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


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
-- Name: job_offers job_offers_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.job_offers
    ADD CONSTRAINT job_offers_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


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
-- Name: legal_cases legal_cases_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: legal_cases legal_cases_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: medical_appointments medical_appointments_doctor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_doctor_id_users_id_fk FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: medical_appointments medical_appointments_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: medical_appointments medical_appointments_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.medical_appointments
    ADD CONSTRAINT medical_appointments_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


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
-- Name: pos_orders pos_orders_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


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
-- Name: real_estate_properties real_estate_properties_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.real_estate_properties
    ADD CONSTRAINT real_estate_properties_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recordings recordings_call_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recordings
    ADD CONSTRAINT recordings_call_id_campaigns_id_fk FOREIGN KEY (call_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: recordings recordings_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recordings
    ADD CONSTRAINT recordings_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recruitment_job_requirements recruitment_job_requirements_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_job_requirements
    ADD CONSTRAINT recruitment_job_requirements_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recruitment_rdv_slots recruitment_rdv_slots_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_rdv_slots
    ADD CONSTRAINT recruitment_rdv_slots_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: recruitment_settings recruitment_settings_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.recruitment_settings
    ADD CONSTRAINT recruitment_settings_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: restaurant_orders restaurant_orders_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE SET NULL;


--
-- Name: restaurant_orders restaurant_orders_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.restaurant_orders
    ADD CONSTRAINT restaurant_orders_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


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
    ADD CONSTRAINT security_audit_logs_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: security_audit_logs security_audit_logs_user_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.security_audit_logs
    ADD CONSTRAINT security_audit_logs_user_id_tenants_id_fk FOREIGN KEY (user_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: shipments shipments_prospect_id_prospects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_prospect_id_prospects_id_fk FOREIGN KEY (prospect_id) REFERENCES public.prospects(id) ON DELETE CASCADE;


--
-- Name: shipments shipments_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: simulated_calls simulated_calls_agent_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.simulated_calls
    ADD CONSTRAINT simulated_calls_agent_id_users_id_fk FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: simulated_calls simulated_calls_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.simulated_calls
    ADD CONSTRAINT simulated_calls_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: social_accounts social_accounts_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.social_accounts
    ADD CONSTRAINT social_accounts_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: social_comments social_comments_post_id_social_posts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.social_comments
    ADD CONSTRAINT social_comments_post_id_social_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.social_posts(id) ON DELETE CASCADE;


--
-- Name: social_comments social_comments_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.social_comments
    ADD CONSTRAINT social_comments_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: social_posts social_posts_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: social_posts social_posts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.social_posts
    ADD CONSTRAINT social_posts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stripe_events stripe_events_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.stripe_events
    ADD CONSTRAINT stripe_events_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_tenants_id_fk FOREIGN KEY (assigned_to) REFERENCES public.tenants(id) ON DELETE SET NULL;


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
-- Name: usage_metrics usage_metrics_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.usage_metrics
    ADD CONSTRAINT usage_metrics_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_2fa user_2fa_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.user_2fa
    ADD CONSTRAINT user_2fa_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: workflow_executions workflow_executions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT workflow_executions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: workflow_executions workflow_executions_workflow_id_workflows_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: servicall
--

ALTER TABLE ONLY public.workflow_executions
    ADD CONSTRAINT workflow_executions_workflow_id_workflows_id_fk FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;


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
-- PostgreSQL database dump complete
--

\unrestrict bBtti1c9uHM6HmcrTmx0gPGBt2wcJyuDaxLpMDh7flbWpt49ieQmZhvbgmmjcYX

