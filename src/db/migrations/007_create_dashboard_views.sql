-- Create a single view for all dashboard data

-- Create a view for dashboard data
CREATE OR REPLACE VIEW api.dashboard_data AS
SELECT
    -- Monthly Total data
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM api.expenses
        WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
    ) as current_month_total,
    
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM api.expenses
        WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
    ) as previous_month_total,
    
    CASE 
        WHEN (
            SELECT COALESCE(SUM(amount), 0)
            FROM api.expenses
            WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
        ) = 0 THEN 0
        ELSE (
            (
                (SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
                WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE))
                -
                (SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
                WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month'))
            ) / (
                SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
                WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
            ) * 100
        )
    END as monthly_percentage_change,
    
    -- Yearly Total data
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM api.expenses
        WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    ) as current_year_total,
    
    (
        SELECT COALESCE(SUM(amount), 0)
        FROM api.expenses
        WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
    ) as previous_year_total,
    
    CASE 
        WHEN (
            SELECT COALESCE(SUM(amount), 0)
            FROM api.expenses
            WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
        ) = 0 THEN 0
        ELSE (
            (
                (SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
                WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE))
                -
                (SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
                WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1)
            ) / (
                SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
                WHERE EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
            ) * 100
        )
    END as yearly_percentage_change,
    
    -- Main Category data
    (
        SELECT c.name
        FROM api.expenses e
        JOIN api.categories c ON e.category_id = c.id
        WHERE date_trunc('month', e.date) = date_trunc('month', CURRENT_DATE)
        GROUP BY c.name
        ORDER BY SUM(e.amount) DESC
        LIMIT 1
    ) as main_category_name,
    
    (
        SELECT SUM(e.amount)
        FROM api.expenses e
        JOIN api.categories c ON e.category_id = c.id
        WHERE date_trunc('month', e.date) = date_trunc('month', CURRENT_DATE)
        AND c.name = (
            SELECT c2.name
            FROM api.expenses e2
            JOIN api.categories c2 ON e2.category_id = c2.id
            WHERE date_trunc('month', e2.date) = date_trunc('month', CURRENT_DATE)
            GROUP BY c2.name
            ORDER BY SUM(e2.amount) DESC
            LIMIT 1
        )
        GROUP BY c.name
    ) as main_category_total,
    
    CASE 
        WHEN (
            SELECT COALESCE(SUM(amount), 0)
            FROM api.expenses
            WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
        ) = 0 THEN 0
        ELSE (
            (
                SELECT SUM(e.amount)
                FROM api.expenses e
                JOIN api.categories c ON e.category_id = c.id
                WHERE date_trunc('month', e.date) = date_trunc('month', CURRENT_DATE)
                AND c.name = (
                    SELECT c2.name
                    FROM api.expenses e2
                    JOIN api.categories c2 ON e2.category_id = c2.id
                    WHERE date_trunc('month', e2.date) = date_trunc('month', CURRENT_DATE)
                    GROUP BY c2.name
                    ORDER BY SUM(e2.amount) DESC
                    LIMIT 1
                )
                GROUP BY c.name
            ) / (
                SELECT COALESCE(SUM(amount), 0)
                FROM api.expenses
                WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
            ) * 100
        )
    END as main_category_percentage,
    
    -- Remaining Budget data
    (SELECT COALESCE(SUM(budget), 0) FROM api.categories) as total_budget,
    (SELECT COALESCE(SUM(spent), 0) FROM api.categories) as total_spent,
    (SELECT COALESCE(SUM(budget), 0) FROM api.categories) - (SELECT COALESCE(SUM(spent), 0) FROM api.categories) as remaining_budget,
    
    CASE 
        WHEN (SELECT COALESCE(SUM(budget), 0) FROM api.categories) = 0 THEN 0
        ELSE (
            ((SELECT COALESCE(SUM(budget), 0) FROM api.categories) - (SELECT COALESCE(SUM(spent), 0) FROM api.categories)) / 
            (SELECT COALESCE(SUM(budget), 0) FROM api.categories) * 100
        )
    END as budget_percentage_remaining;

-- Create a view for monthly expenses trend (for the line chart)
CREATE OR REPLACE VIEW api.monthly_expenses_trend AS
SELECT 
    TO_CHAR(date_trunc('month', date), 'Mon') as month_name,
    EXTRACT(MONTH FROM date) as month_number,
    COALESCE(SUM(amount), 0) as total_amount
FROM api.expenses
WHERE date >= date_trunc('year', CURRENT_DATE)
GROUP BY date_trunc('month', date), EXTRACT(MONTH FROM date)
ORDER BY EXTRACT(MONTH FROM date);

-- Create a view for category distribution (for the pie chart)
CREATE OR REPLACE VIEW api.category_distribution AS
SELECT 
    c.name as category_name,
    c.color as category_color,
    COALESCE(SUM(e.amount), 0) as total_amount
FROM api.categories c
LEFT JOIN api.expenses e ON c.id = e.category_id AND date_trunc('month', e.date) = date_trunc('month', CURRENT_DATE)
GROUP BY c.id, c.name, c.color
ORDER BY total_amount DESC;

-- Grant permissions
GRANT SELECT ON api.dashboard_data TO web_anon;
GRANT SELECT ON api.monthly_expenses_trend TO web_anon;
GRANT SELECT ON api.category_distribution TO web_anon;

COMMENT ON VIEW api.dashboard_data IS 'Provides all data for the dashboard cards';
COMMENT ON VIEW api.monthly_expenses_trend IS 'Provides monthly expense data for the line chart';
COMMENT ON VIEW api.category_distribution IS 'Provides category distribution data for the pie chart';
