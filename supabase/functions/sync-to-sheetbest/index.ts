import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReceiptData {
  customer_name: string;
  items: Array<{
    name: string;
    flavors?: Array<{ flavor: string; quantity: number }>;
    quantity?: number;
  }>;
  total: number;
  short_id: string;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sheetBestUrl = Deno.env.get('SHEETBEST_URL');
    
    if (!sheetBestUrl) {
      console.error('SHEETBEST_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Sheet Best URL not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const receiptData: ReceiptData = await req.json();
    console.log('Syncing receipt to Sheet Best:', receiptData.short_id);

    // Format items with item name repeated for each flavor as requested
    const itemsText = receiptData.items.map(item => {
      if (item.flavors && item.flavors.length > 0) {
        return item.flavors
          .map(f => `${item.name} ${f.flavor} (${f.quantity})`)
          .join(', ');
      }
      return `${item.name}${item.quantity ? ` (${item.quantity})` : ''}`;
    }).join(', ');

    // Format date
    const formattedDate = new Date(receiptData.created_at).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Construct receipt link
    const receiptLink = `https://raisingkaynes.lovable.app/receipt/${receiptData.short_id}`;

    // Format data for Sheet Best (columns: A=Customer Name, B=Order, C=Total Price, D=Date, E=Receipt Link)
    const sheetData = {
      'Customer Name': receiptData.customer_name,
      'Order': itemsText,
      'Total Price': `$${receiptData.total.toFixed(2)}`,
      'Date': formattedDate,
      'Receipt Link': receiptLink,
    };

    console.log('Sending to Sheet Best:', sheetData);

    const response = await fetch(sheetBestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sheetData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sheet Best API error:', response.status, errorText);
      throw new Error(`Sheet Best API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully synced to Sheet Best:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing to Sheet Best:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
