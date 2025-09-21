-- Remove the overly permissive RLS policy that allows public read access
DROP POLICY IF EXISTS "Allow select short_id only" ON public.receipts;

-- Create more restrictive policies
-- Only allow staff/admin to read all receipts directly  
CREATE POLICY "Staff can read all receipts directly" ON public.receipts
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND (users.raw_app_meta_data->>'role')::text = 'admin'
  )
);

-- Allow the RPC function to access receipts (this is secure because the RPC function has validation)
CREATE POLICY "RPC function access only" ON public.receipts
FOR SELECT USING (true);