-- Create a function to update the spent amount in categories
CREATE OR REPLACE FUNCTION api.update_category_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the spent column for the affected category
    -- This calculates the sum of expenses for the current month only
    UPDATE api.categories
    SET spent = (
        SELECT COALESCE(SUM(amount), 0)
        FROM api.expenses
        WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
        AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
    )
    WHERE id = COALESCE(NEW.category_id, OLD.category_id);
    
    RETURN NULL; -- For AFTER triggers, the return value is ignored
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT operations
CREATE TRIGGER update_category_spent_after_insert
AFTER INSERT ON api.expenses
FOR EACH ROW
EXECUTE FUNCTION api.update_category_spent();

-- Create trigger for UPDATE operations
CREATE TRIGGER update_category_spent_after_update
AFTER UPDATE ON api.expenses
FOR EACH ROW
WHEN (OLD.category_id IS DISTINCT FROM NEW.category_id OR OLD.amount IS DISTINCT FROM NEW.amount OR OLD.date IS DISTINCT FROM NEW.date)
EXECUTE FUNCTION api.update_category_spent();

-- Create trigger for DELETE operations
CREATE TRIGGER update_category_spent_after_delete
AFTER DELETE ON api.expenses
FOR EACH ROW
EXECUTE FUNCTION api.update_category_spent();

-- Add a comment to explain the purpose of this migration
COMMENT ON FUNCTION api.update_category_spent() IS 'Updates the spent column in categories table based on the sum of expenses for the current month';
