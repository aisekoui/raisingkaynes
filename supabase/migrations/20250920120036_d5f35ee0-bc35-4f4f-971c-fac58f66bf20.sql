-- Create receipts table
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  short_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- Enable Row Level Security
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Create policy for public to view receipts by short_id (for customers)
CREATE POLICY "Anyone can view receipts by short_id" 
ON public.receipts 
FOR SELECT 
USING (expires_at IS NULL OR expires_at > now());

-- Create policy for service role to insert receipts (for API)
CREATE POLICY "Service role can insert receipts"
ON public.receipts
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups by short_id
CREATE INDEX idx_receipts_short_id ON public.receipts(short_id);

-- Create index for expiration cleanup
CREATE INDEX idx_receipts_expires_at ON public.receipts(expires_at);

-- Create function to generate short_id
CREATE OR REPLACE FUNCTION public.generate_short_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;