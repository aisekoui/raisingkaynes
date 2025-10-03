import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReceiptData {
  customer_name: string;
  items: Array<{
    category: string;
    flavors?: Array<{ name: string; quantity: number }>;
    mix_details?: {
      tender_flavors: Array<{ name: string; quantity: number }>;
      waffle_flavors: Array<{ name: string; quantity: number }>;
    };
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

    // Format items with category and flavor details
    const itemsText = receiptData.items.map(item => {
      // Handle Mix & Match with tender and waffle flavors
      if (item.mix_details) {
        const tenderText = item.mix_details.tender_flavors
          .map(f => `${f.name} Tender (${f.quantity})`)
          .join(', ');
        const waffleText = item.mix_details.waffle_flavors
          .map(f => `${f.name} Waffle (${f.quantity})`)
          .join(', ');
        return `${item.category}: ${tenderText}, ${waffleText}`;
      }
      // Handle items with flavors (Tenders, Waffles)
      if (item.flavors && item.flavors.length > 0) {
        const flavorsText = item.flavors
          .map(f => `${f.name} (${f.quantity})`)
          .join(', ');
        return `${item.category}: ${flavorsText}`;
      }
      // Handle simple items (Lemonade, Add-ons)
      return `${item.category}${item.quantity ? ` (${item.quantity})` : ''}`;
    }).join(' | ');

    // Format date to Philippine Time (UTC+8)
    const formattedDate = new Date(receiptData.created_at).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila',
    });

    // Construct receipt link (use vercel domain)
    const receiptLink = `https://raisingkaynes.vercel.app/receipt?sid=${receiptData.short_id}`;

    // Format data for Sheet Best (columns match user's sheet: Name, Order(s), Price, Date, Receipt Link)
    const sheetData = {
      'Name': receiptData.customer_name,
      'Order(s)': itemsText,
      'Price': `₱${receiptData.total.toFixed(2)}`,
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
