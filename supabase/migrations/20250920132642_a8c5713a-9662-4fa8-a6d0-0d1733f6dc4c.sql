-- Enable pgcrypto extension for secure random short IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing receipts table if it exists to start fresh
DROP TABLE IF EXISTS public.receipts CASCADE;

-- Create new receipts table with the exact schema for Raising Kaynes
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id text UNIQUE NOT NULL DEFAULT substring(encode(gen_random_bytes(5), 'hex'), 1, 8),
  customer_name text,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Enable Row Level Security
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.receipts;
DROP POLICY IF EXISTS "Allow select for authenticated owner" ON public.receipts;
DROP POLICY IF EXISTS "Allow public select if not expired" ON public.receipts;
DROP POLICY IF EXISTS "Anyone can view receipts by short_id" ON public.receipts;
DROP POLICY IF EXISTS "Service role can insert receipts" ON public.receipts;

-- Create new RLS policies
CREATE POLICY "Allow insert for authenticated" ON public.receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow select for authenticated owner" ON public.receipts
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Allow public select if not expired" ON public.receipts
  FOR SELECT
  TO public
  USING (expires_at IS NULL OR expires_at > now());