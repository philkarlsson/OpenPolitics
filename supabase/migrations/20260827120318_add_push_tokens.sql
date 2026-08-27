CREATE TABLE public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text NOT NULL,
  device_id text,
  app_version text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT push_tokens_platform_check CHECK (platform IN ('android', 'ios', 'web')),
  CONSTRAINT push_tokens_token_not_empty CHECK (length(trim(token)) > 0),
  CONSTRAINT push_tokens_unique_token UNIQUE (token)
);

CREATE INDEX push_tokens_user_id_idx ON public.push_tokens(user_id);
CREATE INDEX push_tokens_last_seen_at_idx ON public.push_tokens(last_seen_at);

CREATE TRIGGER set_push_tokens_updated_at
BEFORE UPDATE ON public.push_tokens
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push tokens"
ON public.push_tokens
FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_tokens TO authenticated;
