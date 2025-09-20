import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReceiptItem {
  name: string;
  price: number;
  qty?: number;
}

interface ReceiptRequest {
  customerName: string;
  items: ReceiptItem[];
  meta?: {
    createdBy?: string;
    notes?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // GET /receipts/:short_id - Retrieve receipt by short_id
    if (req.method === 'GET' && pathSegments.length >= 2) {
      const shortId = pathSegments[pathSegments.length - 1];
      
      console.log('Fetching receipt with short_id:', shortId);
      
      const { data: receipt, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('short_id', shortId)
        .single();

      if (error || !receipt) {
        console.log('Receipt not found:', error);
        return new Response(
          JSON.stringify({ error: 'Receipt not found or expired' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if receipt is expired
      if (receipt.expires_at && new Date(receipt.expires_at) < new Date()) {
        console.log('Receipt expired:', receipt.expires_at);
        return new Response(
          JSON.stringify({ error: 'Receipt not found or expired' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify(receipt),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // POST /receipts - Create new receipt
    if (req.method === 'POST') {
      const body: ReceiptRequest = await req.json();
      
      if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
        return new Response(
          JSON.stringify({ error: 'items required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate unique short_id
      let shortId = '';
      let attempts = 0;
      while (attempts < 10) {
        const { data } = await supabase.rpc('generate_short_id');
        if (data) {
          const { data: existing } = await supabase
            .from('receipts')
            .select('short_id')
            .eq('short_id', data)
            .single();
          
          if (!existing) {
            shortId = data;
            break;
          }
        }
        attempts++;
      }

      if (!shortId) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate unique short_id' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Calculate total
      const total = body.items.reduce((sum, item) => 
        sum + (Number(item.price || 0) * (item.qty || 1)), 0
      );

      // Insert receipt
      const { data: receipt, error } = await supabase
        .from('receipts')
        .insert({
          short_id: shortId,
          customer_name: body.customerName || 'Guest',
          items: body.items,
          total: total
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating receipt:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create receipt' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      const baseUrl = req.headers.get('origin') || `https://${req.headers.get('host')}`;
      const receiptUrl = `${baseUrl}/r/${shortId}`;

      console.log('Receipt created successfully:', shortId);

      return new Response(
        JSON.stringify({
          id: receipt.short_id,
          short_id: receipt.short_id,
          url: receiptUrl,
          expiresAt: receipt.expires_at
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in receipts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});