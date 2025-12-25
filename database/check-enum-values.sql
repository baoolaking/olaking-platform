-- Check if the awaiting_confirmation enum value exists
SELECT 
    enumlabel as enum_value
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'order_status'
)
ORDER BY enumsortorder;

-- Also check current orders and their statuses
SELECT 
    id,
    status,
    link,
    total_price,
    created_at,
    updated_at
FROM orders 
WHERE link = 'wallet_funding'
ORDER BY created_at DESC
LIMIT 10;