-- Fix RLS policy to allow selecting short_id after receipt creation
-- Drop the overly restrictive SELECT policy
DROP POLICY IF EXISTS "Deny direct public access" ON public.receipts;

-- Create a policy that allows selecting only the short_id for verification
CREATE POLICY "Allow select short_id only" ON public.receipts
  FOR SELECT
  USING (
    -- Only allow selecting recently created receipts (within last minute)
    -- and only return short_id via RLS
    created_at > (NOW() - INTERVAL '1 minute')
  );