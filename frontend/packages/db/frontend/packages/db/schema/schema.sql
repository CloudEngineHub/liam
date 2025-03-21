--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 16.4 (Homebrew)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Migration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Migration" (
    id integer NOT NULL,
    title text NOT NULL,
    "pullRequestId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Migration_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Migration_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Migration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Migration_id_seq" OWNED BY public."Migration".id;


--
-- Name: OverallReview; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OverallReview" (
    id integer NOT NULL,
    "projectId" integer,
    "pullRequestId" integer NOT NULL,
    "reviewComment" text,
    "reviewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: OverallReview_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."OverallReview_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OverallReview_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."OverallReview_id_seq" OWNED BY public."OverallReview".id;


--
-- Name: Project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Project" (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProjectRepositoryMapping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProjectRepositoryMapping" (
    id integer NOT NULL,
    "projectId" integer NOT NULL,
    "repositoryId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProjectRepositoryMapping_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ProjectRepositoryMapping_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ProjectRepositoryMapping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ProjectRepositoryMapping_id_seq" OWNED BY public."ProjectRepositoryMapping".id;


--
-- Name: Project_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Project_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Project_id_seq" OWNED BY public."Project".id;


--
-- Name: PullRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PullRequest" (
    id integer NOT NULL,
    "pullNumber" bigint NOT NULL,
    "commentId" bigint,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "repositoryId" integer NOT NULL
);


--
-- Name: PullRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."PullRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: PullRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."PullRequest_id_seq" OWNED BY public."PullRequest".id;


--
-- Name: Repository; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Repository" (
    id integer NOT NULL,
    name text NOT NULL,
    owner text NOT NULL,
    "installationId" bigint NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Repository_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Repository_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Repository_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Repository_id_seq" OWNED BY public."Repository".id;


--
-- Name: TestTable; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TestTable" (
    id integer NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TestTable_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TestTable_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TestTable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TestTable_id_seq" OWNED BY public."TestTable".id;


--
-- Name: WatchSchemaFilePattern; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WatchSchemaFilePattern" (
    id integer NOT NULL,
    pattern text NOT NULL,
    "projectId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WatchSchemaFilePattern_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."WatchSchemaFilePattern_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WatchSchemaFilePattern_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."WatchSchemaFilePattern_id_seq" OWNED BY public."WatchSchemaFilePattern".id;


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
-- Name: Migration id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Migration" ALTER COLUMN id SET DEFAULT nextval('public."Migration_id_seq"'::regclass);


--
-- Name: OverallReview id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OverallReview" ALTER COLUMN id SET DEFAULT nextval('public."OverallReview_id_seq"'::regclass);


--
-- Name: Project id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project" ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);


--
-- Name: ProjectRepositoryMapping id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectRepositoryMapping" ALTER COLUMN id SET DEFAULT nextval('public."ProjectRepositoryMapping_id_seq"'::regclass);


--
-- Name: PullRequest id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PullRequest" ALTER COLUMN id SET DEFAULT nextval('public."PullRequest_id_seq"'::regclass);


--
-- Name: Repository id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Repository" ALTER COLUMN id SET DEFAULT nextval('public."Repository_id_seq"'::regclass);


--
-- Name: TestTable id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TestTable" ALTER COLUMN id SET DEFAULT nextval('public."TestTable_id_seq"'::regclass);


--
-- Name: WatchSchemaFilePattern id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WatchSchemaFilePattern" ALTER COLUMN id SET DEFAULT nextval('public."WatchSchemaFilePattern_id_seq"'::regclass);


--
-- Name: Migration Migration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Migration"
    ADD CONSTRAINT "Migration_pkey" PRIMARY KEY (id);


--
-- Name: OverallReview OverallReview_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OverallReview"
    ADD CONSTRAINT "OverallReview_pkey" PRIMARY KEY (id);


--
-- Name: ProjectRepositoryMapping ProjectRepositoryMapping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectRepositoryMapping"
    ADD CONSTRAINT "ProjectRepositoryMapping_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: PullRequest PullRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PullRequest"
    ADD CONSTRAINT "PullRequest_pkey" PRIMARY KEY (id);


--
-- Name: Repository Repository_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Repository"
    ADD CONSTRAINT "Repository_pkey" PRIMARY KEY (id);


--
-- Name: TestTable TestTable_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TestTable"
    ADD CONSTRAINT "TestTable_pkey" PRIMARY KEY (id);


--
-- Name: WatchSchemaFilePattern WatchSchemaFilePattern_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WatchSchemaFilePattern"
    ADD CONSTRAINT "WatchSchemaFilePattern_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Migration_pullRequestId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Migration_pullRequestId_key" ON public."Migration" USING btree ("pullRequestId");


--
-- Name: ProjectRepositoryMapping_projectId_repositoryId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ProjectRepositoryMapping_projectId_repositoryId_key" ON public."ProjectRepositoryMapping" USING btree ("projectId", "repositoryId");


--
-- Name: PullRequest_repositoryId_pullNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PullRequest_repositoryId_pullNumber_key" ON public."PullRequest" USING btree ("repositoryId", "pullNumber");


--
-- Name: Repository_owner_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Repository_owner_name_key" ON public."Repository" USING btree (owner, name);


--
-- Name: Migration Migration_pullRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Migration"
    ADD CONSTRAINT "Migration_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES public."PullRequest"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OverallReview OverallReview_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OverallReview"
    ADD CONSTRAINT "OverallReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OverallReview OverallReview_pullRequestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OverallReview"
    ADD CONSTRAINT "OverallReview_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES public."PullRequest"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectRepositoryMapping ProjectRepositoryMapping_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectRepositoryMapping"
    ADD CONSTRAINT "ProjectRepositoryMapping_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectRepositoryMapping ProjectRepositoryMapping_repositoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProjectRepositoryMapping"
    ADD CONSTRAINT "ProjectRepositoryMapping_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES public."Repository"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PullRequest PullRequest_repositoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PullRequest"
    ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES public."Repository"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WatchSchemaFilePattern WatchSchemaFilePattern_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WatchSchemaFilePattern"
    ADD CONSTRAINT "WatchSchemaFilePattern_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

