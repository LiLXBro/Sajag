-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'ndma_official', 'sdma_official', 'ati_coordinator', 'ngo_coordinator', 'field_officer');
CREATE TYPE training_status AS ENUM ('planned', 'ongoing', 'completed', 'cancelled');
CREATE TYPE training_type AS ENUM ('workshop', 'drill', 'seminar', 'field_exercise', 'simulation', 'awareness_campaign');
CREATE TYPE disaster_type AS ENUM ('earthquake', 'flood', 'cyclone', 'fire', 'landslide', 'drought', 'tsunami', 'industrial', 'other');

-- Users/Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'field_officer',
  organization TEXT,
  state TEXT,
  district TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training programs table
CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  training_type training_type NOT NULL,
  disaster_types disaster_type[] NOT NULL,
  status training_status NOT NULL DEFAULT 'planned',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  organizing_body TEXT NOT NULL,
  coordinator_id UUID REFERENCES public.profiles(id),
  target_participants INTEGER,
  actual_participants INTEGER DEFAULT 0,
  budget DECIMAL(12, 2),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  organization TEXT,
  designation TEXT,
  attendance_status BOOLEAN DEFAULT FALSE,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time updates table
CREATE TABLE IF NOT EXISTS public.training_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL,
  message TEXT NOT NULL,
  images TEXT[],
  posted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics/metrics table
CREATE TABLE IF NOT EXISTS public.training_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12, 2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for training_programs
CREATE POLICY "Anyone can view training programs" ON public.training_programs FOR SELECT USING (true);
CREATE POLICY "Coordinators and admins can create training programs" ON public.training_programs 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'ndma_official', 'sdma_official', 'ati_coordinator', 'ngo_coordinator')
    )
  );
CREATE POLICY "Coordinators and admins can update training programs" ON public.training_programs 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'ndma_official', 'sdma_official', 'ati_coordinator', 'ngo_coordinator')
    )
  );

-- RLS Policies for participants
CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add participants" ON public.participants 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update participants" ON public.participants 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for training_updates
CREATE POLICY "Anyone can view training updates" ON public.training_updates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create updates" ON public.training_updates 
  FOR INSERT WITH CHECK (auth.uid() = posted_by);

-- RLS Policies for training_metrics
CREATE POLICY "Anyone can view training metrics" ON public.training_metrics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert metrics" ON public.training_metrics 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_training_programs_state ON public.training_programs(state);
CREATE INDEX idx_training_programs_status ON public.training_programs(status);
CREATE INDEX idx_training_programs_dates ON public.training_programs(start_date, end_date);
CREATE INDEX idx_participants_training ON public.participants(training_id);
CREATE INDEX idx_training_updates_training ON public.training_updates(training_id);
CREATE INDEX idx_training_metrics_training ON public.training_metrics(training_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON public.training_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
