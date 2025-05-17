-- Enhance trading_habits table
ALTER TABLE trading_habits
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('Pre-Market', 'Trading', 'Risk Management', 'Psychology', 'Post-Market')),
ADD COLUMN IF NOT EXISTS linked_rules TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS verification_method JSONB DEFAULT '{
  "type": "manual",
  "criteria": "Manual verification",
  "autoCheck": false
}',
ADD COLUMN IF NOT EXISTS impact JSONB DEFAULT '{
  "metrics": [],
  "rules": []
}',
ADD COLUMN IF NOT EXISTS streaks JSONB DEFAULT '{
  "current": 0,
  "longest": 0,
  "lastCompleted": null
}',
ADD COLUMN IF NOT EXISTS monthly_history JSONB DEFAULT '{}';

-- Create habit_verifications table
CREATE TABLE IF NOT EXISTS habit_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID REFERENCES trading_habits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    verification_data JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(habit_id, date)
);

-- Create habit_statistics view
CREATE OR REPLACE VIEW habit_statistics AS
WITH monthly_stats AS (
    SELECT
        h.id AS habit_id,
        h.user_id,
        date_trunc('month', v.date) AS month,
        COUNT(*) FILTER (WHERE v.completed) AS completed_count,
        COUNT(*) AS total_count,
        ROUND(COUNT(*) FILTER (WHERE v.completed)::numeric / COUNT(*)::numeric * 100, 2) AS success_rate
    FROM trading_habits h
    LEFT JOIN habit_verifications v ON h.id = v.habit_id
    GROUP BY h.id, h.user_id, date_trunc('month', v.date)
)
SELECT
    h.id,
    h.user_id,
    h.name,
    h.category,
    ROUND(AVG(CASE WHEN v.completed THEN 1 ELSE 0 END)::numeric * 100, 2) AS completion_rate,
    MAX(h.streaks->>'current')::int AS current_streak,
    MAX(h.streaks->>'longest')::int AS longest_streak,
    json_agg(DISTINCT jsonb_build_object(
        'month', to_char(ms.month, 'YYYY-MM'),
        'completed', ms.completed_count,
        'total', ms.total_count,
        'success_rate', ms.success_rate
    )) FILTER (WHERE ms.month IS NOT NULL) AS monthly_trend
FROM trading_habits h
LEFT JOIN habit_verifications v ON h.id = v.habit_id
LEFT JOIN monthly_stats ms ON h.id = ms.habit_id
GROUP BY h.id, h.user_id, h.name, h.category;

-- Create function to update habit streaks and remaining count
CREATE OR REPLACE FUNCTION update_habit_streaks()
RETURNS TRIGGER AS $$
DECLARE
    current_streak INT;
    longest_streak INT;
    last_completed DATE;
    completed_count INT;
BEGIN
    -- Get current streak values
    SELECT 
        (streaks->>'current')::int,
        (streaks->>'longest')::int,
        (streaks->>'lastCompleted')::date
    INTO current_streak, longest_streak, last_completed
    FROM trading_habits
    WHERE id = NEW.habit_id;

    -- Update streak based on completion status
    IF NEW.completed THEN
        IF last_completed IS NULL OR last_completed = NEW.date - INTERVAL '1 day' THEN
            current_streak := COALESCE(current_streak, 0) + 1;
        ELSE
            current_streak := 1;
        END IF;
        
        -- Update longest streak if necessary
        IF current_streak > longest_streak THEN
            longest_streak := current_streak;
        END IF;

        -- Update completed count and remaining
        SELECT COUNT(*) INTO completed_count
        FROM habit_verifications
        WHERE habit_id = NEW.habit_id AND completed = true;
        
        -- Update habit streaks and counts
        UPDATE trading_habits
        SET 
            streaks = jsonb_build_object(
                'current', current_streak,
                'longest', longest_streak,
                'lastCompleted', NEW.date
            ),
            done = completed_count,
            remaining = goal - completed_count,
            progress = ROUND((completed_count::numeric / goal::numeric) * 100)
        WHERE id = NEW.habit_id;
    ELSE
        -- Reset current streak if habit was not completed
        UPDATE trading_habits
        SET streaks = jsonb_build_object(
            'current', 0,
            'longest', longest_streak,
            'lastCompleted', NEW.date
        )
        WHERE id = NEW.habit_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating streaks
DROP TRIGGER IF EXISTS update_habit_streaks_trigger ON habit_verifications;
CREATE TRIGGER update_habit_streaks_trigger
    AFTER INSERT OR UPDATE
    ON habit_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_habit_streaks();

-- Add RLS policies
ALTER TABLE habit_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habit verifications"
    ON habit_verifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit verifications"
    ON habit_verifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit verifications"
    ON habit_verifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_habit_verifications_habit_id ON habit_verifications(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_verifications_user_id ON habit_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_verifications_date ON habit_verifications(date);
CREATE INDEX IF NOT EXISTS idx_habit_verifications_completed ON habit_verifications(completed); 