--
-- PostgreSQL database dump
--

\restrict z02iD5LNLlmbwdFPRDJQchtgwcr38NFUDuZGXwruKkqiXwCMCoqWGUalfUVHLRG

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
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: servicall
--

COPY public.tenants (id, slug, name, domain, logo, settings, is_active, created_at, updated_at, business_type, ai_custom_script, pos_provider, pos_config, pos_sync_enabled) FROM stdin;
1	servicall-default	Servicall Default	\N	\N	{}	t	2026-03-20 21:22:41.478145	2026-03-20 21:22:41.478145	\N	\N	none	\N	f
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: servicall
--

COPY public.users (id, open_id, name, email, password_hash, login_method, role, last_signed_in, created_at, updated_at, is_active, assigned_agent_type) FROM stdin;
1	admin-seed-001	System Admin	admin@servicall.com	$2b$12$EgyVSk0QZCBKJFlpU9psVe15bBK2PCEo4mcaNexOWR90MbmJdm.vC	password	admin	\N	2026-03-20 21:22:41.478145	2026-03-20 21:22:41.478145	t	AI
\.


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: servicall
--

SELECT pg_catalog.setval('public.tenants_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: servicall
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict z02iD5LNLlmbwdFPRDJQchtgwcr38NFUDuZGXwruKkqiXwCMCoqWGUalfUVHLRG

