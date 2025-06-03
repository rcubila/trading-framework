-- Enable RLS for playbook_rules table
ALTER TABLE public.playbook_rules ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can CRUD own playbook rules" ON public.playbook_rules;

-- Create comprehensive policies for all operations
CREATE POLICY "Users can select own playbook rules"
ON public.playbook_rules
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.strategies s
        WHERE s.id = playbook_rules.strategy_id
        AND s.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own playbook rules"
ON public.playbook_rules
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.strategies s
        WHERE s.id = strategy_id
        AND s.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own playbook rules"
ON public.playbook_rules
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.strategies s
        WHERE s.id = playbook_rules.strategy_id
        AND s.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.strategies s
        WHERE s.id = strategy_id
        AND s.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own playbook rules"
ON public.playbook_rules
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.strategies s
        WHERE s.id = playbook_rules.strategy_id
        AND s.user_id = auth.uid()
    )
);

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.playbook_rules TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 