ALTER TABLE public.push_tokens
DROP CONSTRAINT push_tokens_user_id_fkey;

ALTER TABLE public.push_tokens
ADD CONSTRAINT push_tokens_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
