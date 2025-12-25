-- Function to get enum values for debugging
CREATE OR REPLACE FUNCTION get_enum_values(enum_name text)
RETURNS TABLE(enum_value text) AS $$
BEGIN
    RETURN QUERY
    SELECT enumlabel::text
    FROM pg_enum 
    WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = enum_name
    )
    ORDER BY enumsortorder;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;