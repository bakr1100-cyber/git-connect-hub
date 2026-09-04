CREATE TABLE public.applicant_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  date_of_birth DATE,
  nationality TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  street TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  summary TEXT NOT NULL DEFAULT '',
  target_position TEXT NOT NULL DEFAULT '',
  salary_expectation TEXT NOT NULL DEFAULT '',
  earliest_start_date DATE,
  drivers_license TEXT NOT NULL DEFAULT '',
  willing_to_relocate BOOLEAN NOT NULL DEFAULT false,
  work_permit TEXT NOT NULL DEFAULT '',
  preferred_language TEXT NOT NULL DEFAULT 'de',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applicant_profiles TO authenticated;
GRANT ALL ON public.applicant_profiles TO service_role;

ALTER TABLE public.applicant_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applicant profile"
  ON public.applicant_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applicant profile"
  ON public.applicant_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applicant profile"
  ON public.applicant_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applicant profile"
  ON public.applicant_profiles FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applicant_profiles_updated_at
  BEFORE UPDATE ON public.applicant_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();