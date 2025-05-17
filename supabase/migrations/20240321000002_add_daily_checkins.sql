-- Create daily_checkins table
CREATE TABLE IF NOT EXISTS public.daily_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    followed_plan BOOLEAN NOT NULL,
    trade_count INTEGER NOT NULL CHECK (trade_count >= 0),
    plan_adherence_percent INTEGER NOT NULL CHECK (plan_adherence_percent >= 0 AND plan_adherence_percent <= 100),
    profit_loss DECIMAL(15,2) NOT NULL,
    emotional_state TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Add RLS policies
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins"
    ON public.daily_checkins
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins"
    ON public.daily_checkins
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
    ON public.daily_checkins
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins"
    ON public.daily_checkins
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_daily_checkins_user_id ON public.daily_checkins(user_id);
CREATE INDEX idx_daily_checkins_date ON public.daily_checkins(date);

-- Add trigger for updating updated_at
CREATE TRIGGER update_daily_checkins_updated_at
    BEFORE UPDATE ON public.daily_checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 