-- Drop the schema_migrations table
DROP TABLE IF EXISTS supabase_migrations.schema_migrations;

-- Recreate the schema_migrations table
CREATE TABLE supabase_migrations.schema_migrations (
    version TEXT PRIMARY KEY,
    statements TEXT[],
    name TEXT
); 