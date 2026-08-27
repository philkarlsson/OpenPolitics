CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.geographic_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.geographic_scopes(id) ON DELETE RESTRICT,
  country_code text NOT NULL,
  scope_type text NOT NULL,
  slug text NOT NULL,
  name text NOT NULL,
  local_name text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT geographic_scopes_country_code_check CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT geographic_scopes_scope_type_check CHECK (scope_type IN ('country', 'region', 'municipality')),
  CONSTRAINT geographic_scopes_slug_check CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT geographic_scopes_unique_slug UNIQUE (country_code, scope_type, slug)
);

CREATE INDEX geographic_scopes_parent_id_idx ON public.geographic_scopes(parent_id);
CREATE INDEX geographic_scopes_country_type_idx ON public.geographic_scopes(country_code, scope_type);

CREATE TRIGGER set_geographic_scopes_updated_at
BEFORE UPDATE ON public.geographic_scopes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  locale text NOT NULL DEFAULT 'de-DE',
  timezone text NOT NULL DEFAULT 'Europe/Berlin',
  country_scope_id uuid REFERENCES public.geographic_scopes(id) ON DELETE SET NULL,
  region_scope_id uuid REFERENCES public.geographic_scopes(id) ON DELETE SET NULL,
  municipality_scope_id uuid REFERENCES public.geographic_scopes(id) ON DELETE SET NULL,
  onboarding_completed_at timestamptz,
  privacy jsonb NOT NULL DEFAULT '{"profileVisibility":"public"}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deactivated_at timestamptz,
  deleted_at timestamptz,
  CONSTRAINT profiles_slug_check CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT profiles_locale_check CHECK (locale IN ('de-DE', 'en-US'))
);

CREATE INDEX profiles_country_scope_id_idx ON public.profiles(country_scope_id);
CREATE INDEX profiles_region_scope_id_idx ON public.profiles(region_scope_id);
CREATE INDEX profiles_municipality_scope_id_idx ON public.profiles(municipality_scope_id);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_geographic_scopes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  geographic_scope_id uuid NOT NULL REFERENCES public.geographic_scopes(id) ON DELETE CASCADE,
  assignment_type text NOT NULL DEFAULT 'residence',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, geographic_scope_id, assignment_type),
  CONSTRAINT user_geographic_scopes_assignment_type_check CHECK (assignment_type IN ('residence', 'interest', 'official'))
);

CREATE INDEX user_geographic_scopes_scope_id_idx ON public.user_geographic_scopes(geographic_scope_id);

ALTER TABLE public.geographic_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_geographic_scopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Geographic scopes are readable by everyone"
ON public.geographic_scopes
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public profiles are readable by everyone"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL AND deactivated_at IS NULL);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can read their own geographic assignments"
ON public.user_geographic_scopes
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own geographic assignments"
ON public.user_geographic_scopes
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own geographic assignments"
ON public.user_geographic_scopes
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.geographic_scopes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, DELETE ON public.user_geographic_scopes TO authenticated;
