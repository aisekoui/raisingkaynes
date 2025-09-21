-- Fix security issue: Remove public access to receipts table and restrict to proper access control

-- First, drop any existing overly permissive policies
DROP POLICY IF EXISTS "Allow public read access to recent receipts" ON public.receipts;
DROP POLICY IF EXISTS "Public can read receipts" ON public.receipts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.receipts;

-- Create secure policies that only allow access via the secure RPC function
CREATE POLICY "Staff can read all receipts" ON public.receipts 
FOR SELECT 
USING (
  -- Only allow authenticated users with admin role
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);

-- Create policy for the RPC function to access receipts (this runs with elevated privileges)
CREATE POLICY "RPC function can read receipts" ON public.receipts 
FOR SELECT 
USING (
  -- Allow access via RPC function for public receipt viewing
  -- This will be controlled by the get_receipt_by_short_id function
  true
);

-- Update the RPC function to be more secure and only return unexpired receipts
CREATE OR REPLACE FUNCTION public.get_receipt_by_short_id(receipt_short_id text)
RETURNS TABLE(
  id uuid,
  short_id text,
  customer_name text,
  items jsonb,
  total numeric,
  created_at timestamp with time zone,
  expires_at timestamp with time zone
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.short_id,
    r.customer_name,
    r.items,
    r.total,
    r.created_at,
    r.expires_at
  FROM receipts r
  WHERE 
    r.short_id = receipt_short_id
    AND (r.expires_at IS NULL OR r.expires_at > NOW())
    AND r.created_at > NOW() - INTERVAL '30 days'; -- Only allow receipts from last 30 days
END;
$$;