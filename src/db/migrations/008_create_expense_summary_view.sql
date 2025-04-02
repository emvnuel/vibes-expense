-- Create a view for expense summary data for the reports page

-- Create expense summary view
CREATE OR REPLACE VIEW api.expense_summary AS
SELECT
    -- Total spending
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM api.expenses
    ) as total_spending,
    
    -- Average daily spending
    CASE
        WHEN (
            SELECT COUNT(DISTINCT date_trunc('day', date))
            FROM api.expenses
        ) = 0 THEN 0
        ELSE (
            (
                SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
            ) / (
                SELECT COUNT(DISTINCT date_trunc('day', date))
                FROM api.expenses
            )
        )
    END as average_daily,
    
    -- Top category
    (
        SELECT c.name
        FROM api.expenses e
        JOIN api.categories c ON e.category_id = c.id
        GROUP BY c.name
        ORDER BY SUM(e.amount) DESC
        LIMIT 1
    ) as top_category,
    
    -- Top category percentage
    CASE 
        WHEN (
            SELECT COALESCE(SUM(amount), 0)
            FROM api.expenses
        ) = 0 THEN 0
        ELSE (
            (
                SELECT COALESCE(SUM(e.amount), 0)
                FROM api.expenses e
                JOIN api.categories c ON e.category_id = c.id
                AND c.name = (
                    SELECT c2.name
                    FROM api.expenses e2
                    JOIN api.categories c2 ON e2.category_id = c2.id
                    GROUP BY c2.name
                    ORDER BY SUM(e2.amount) DESC
                    LIMIT 1
                )
            ) / (
                SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
            ) * 100
        )
    END as top_category_percentage;

-- Create a view for category comparison (for t he pie chart) using all expense entries
CREATE OR REPLACE VIEW api.category_comparison AS
SELECT 
    c.name as category_name,
    c.color as category_color,
    COALESCE(SUM(e.amount), 0) as total_amount
FROM api.categories c
LEFT JOIN api.expenses e ON c.id = e.category_id
GROUP BY c.id, c.name, c.color
ORDER BY total_amount DESC;

-- Grant permissions
GRANT SELECT ON api.expense_summary TO web_anon;
GRANT SELECT ON api.category_comparison TO web_anon;

COMMENT ON VIEW api.expense_summary IS 'Provides summary data for the reports page for all periods';
COMMENT ON VIEW api.category_comparison IS 'Provides category distribution data for the current month';
