-- Fix critical security vulnerability: restrict public access to receipts
-- Drop the overly permissive policy that allows access to all receipt data
DROP POLICY IF EXISTS "Allow public select by short_id" ON public.receipts;

-- Create a secure function that only allows access to a specific receipt by short_id
CREATE OR REPLACE FUNCTION public.get_receipt_by_short_id(receipt_short_id TEXT)
RETURNS TABLE (
  id UUID,
  short_id TEXT,
  customer_name TEXT,
  items JSONB,
  total NUMERIC,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Only return the specific receipt requested
  RETURN QUERY
  SELECT 
    r.id,
    r.short_id,
    r.customer_name,
    r.items,
    r.total,
    r.created_at,
    r.expires_at
  FROM public.receipts r
  WHERE r.short_id = receipt_short_id
    AND (r.expires_at IS NULL OR r.expires_at > NOW());
END;
$$;

-- Create a restrictive RLS policy that denies all direct table access
CREATE POLICY "Deny direct public access" ON public.receipts
  FOR SELECT
  USING (FALSE);

-- Grant execute permission on the function to anonymous users
GRANT EXECUTE ON FUNCTION public.get_receipt_by_short_id(TEXT) TO anon;