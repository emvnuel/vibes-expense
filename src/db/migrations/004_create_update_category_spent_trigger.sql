-- Create a function to update the spent amount in categories
CREATE OR REPLACE FUNCTION api.update_category_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- When updating an expense's category, we need to update both old and new categories
    IF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
        -- Update the old category's spent amount
        UPDATE api.categories
        SET spent = (
            SELECT COALESCE(SUM(amount), 0)
            FROM api.expenses
            WHERE category_id = OLD.category_id
            AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
        )
        WHERE id = OLD.category_id;

        -- Update the new category's spent amount
        UPDATE api.categories
        SET spent = (
            SELECT COALESCE(SUM(amount), 0)
            FROM api.expenses
            WHERE category_id = NEW.category_id
            AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
        )
        WHERE id = NEW.category_id;
    ELSE
        -- For INSERT, DELETE, or UPDATE of amount/date, just update the affected category
        UPDATE api.categories
        SET spent = (
            SELECT COALESCE(SUM(amount), 0)
            FROM api.expenses
            WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
            AND date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
        )
        WHERE id = COALESCE(NEW.category_id, OLD.category_id);
    END IF;
    
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
