CREATE TABLE public.user_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  note TEXT,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_templates TO authenticated;
GRANT ALL ON public.user_templates TO service_role;

ALTER TABLE public.user_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own templates" ON public.user_templates FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user templates read own files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'user-templates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user templates upload own files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-templates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user templates delete own files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'user-templates' AND (storage.foldername(name))[1] = auth.uid()::text);