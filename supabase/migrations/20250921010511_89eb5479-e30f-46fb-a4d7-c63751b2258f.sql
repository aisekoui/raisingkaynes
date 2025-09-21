-- Fix missing insert policy for receipt creation
-- Ensure staff can create receipts on /admin
CREATE POLICY "Allow receipt creation" ON public.receipts
  FOR INSERT
  WITH CHECK (true);