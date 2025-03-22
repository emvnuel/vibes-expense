-- Create api schema
CREATE SCHEMA IF NOT EXISTS api;

-- Create categories table
CREATE TABLE IF NOT EXISTS api.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    spent DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the name column for faster lookups
CREATE INDEX idx_categories_name ON api.categories(name);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON api.categories
    FOR EACH ROW
    EXECUTE FUNCTION api.update_updated_at_column(); 

create role web_anon nologin;
grant usage on schema api to web_anon;
grant select on api.categories to web_anon;

create role authenticator noinherit login password 'mysecretpassword';
grant web_anon to authenticator;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA api TO web_anon;
GRANT ALL PRIVILEGES ON ALL sequences IN SCHEMA api TO web_anon;
