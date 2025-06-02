-- Add icon column to strategies table
ALTER TABLE strategies ADD COLUMN icon TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN strategies.icon IS 'Icon identifier or URL for the strategy/playbook';
