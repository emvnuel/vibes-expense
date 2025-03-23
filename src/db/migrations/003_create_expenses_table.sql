-- Create expenses table
CREATE TABLE IF NOT EXISTS api.expenses (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES api.categories(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on date for faster queries
CREATE INDEX idx_expenses_date ON api.expenses(date);

-- Create index on category_id for faster joins
CREATE INDEX idx_expenses_category_id ON api.expenses(category_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION api.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON api.expenses
    FOR EACH ROW
    EXECUTE FUNCTION api.update_updated_at_column();

grant select on api.expenses to web_anon;