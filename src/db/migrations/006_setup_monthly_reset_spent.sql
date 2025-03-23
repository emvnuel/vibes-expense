-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on the cron schema to the postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create a function to reset the spent column for all categories
CREATE OR REPLACE FUNCTION api.reset_categories_spent()
RETURNS void AS $$
BEGIN
    UPDATE api.categories SET spent = 0;
    RAISE NOTICE 'Reset all category spent values to 0';
END;
$$ LANGUAGE plpgsql;

-- Schedule the function to run at midnight on the first day of each month
SELECT cron.schedule('reset-categories-spent', '0 0 1 * *', 'SELECT api.reset_categories_spent()');

-- Add a comment explaining the purpose of this migration
COMMENT ON FUNCTION api.reset_categories_spent() IS 'Resets the spent column to 0 for all categories, scheduled to run on the first day of each month';
