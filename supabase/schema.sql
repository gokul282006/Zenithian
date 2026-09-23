-- ZENITHIAN AI CONTENT TRANSFORMATION PLATFORM
-- Supabase PostgreSQL Database Schema & Security Policies (Updated with Multi-Platform Tables)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    organization TEXT,
    role TEXT DEFAULT 'officer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    location_name TEXT NOT NULL,
    state TEXT,
    country TEXT DEFAULT 'India',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RETRIEVED DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.retrieved_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT,
    category TEXT NOT NULL,
    content_extract TEXT NOT NULL,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. GENERATED OUTPUTS TABLE (Extended for Multi-Platform)
CREATE TABLE IF NOT EXISTS public.generated_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    location_name TEXT NOT NULL,
    title TEXT NOT NULL,
    platform TEXT DEFAULT 'report', -- linkedin, facebook, instagram, powerpoint, summary, report, email, announcement
    output_format TEXT NOT NULL,
    audience TEXT NOT NULL,
    language TEXT DEFAULT 'English',
    tone TEXT DEFAULT 'Informative',
    detail_level TEXT DEFAULT 'Medium',
    objective TEXT DEFAULT 'Information Sharing',
    generated_content TEXT NOT NULL,
    hashtags TEXT[],
    verification_status TEXT DEFAULT 'Needs Review', -- Needs Review, Source Supported, Approved
    verification_notes TEXT,
    sources_count INT DEFAULT 0,
    unavailable_categories TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SOCIAL MEDIA OUTPUTS TABLE
CREATE TABLE IF NOT EXISTS public.social_media_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    platform TEXT NOT NULL, -- linkedin, facebook, instagram
    location_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    hashtags TEXT[],
    carousel_text TEXT,
    verification_status TEXT DEFAULT 'Needs Review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PRESENTATION OUTPUTS TABLE
CREATE TABLE IF NOT EXISTS public.presentation_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    location_name TEXT NOT NULL,
    slide_count INT DEFAULT 10,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    download_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrieved_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_media_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users access own locations" ON public.locations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own retrieved docs" ON public.retrieved_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own outputs" ON public.generated_outputs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own social outputs" ON public.social_media_outputs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own presentation outputs" ON public.presentation_outputs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own audit logs" ON public.audit_logs FOR ALL USING (auth.uid() = user_id);
