import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FlavorQuantity {
  name: string;
  quantity: number;
}

interface MenuItem {
  category: string;
  unit_price: number;
  quantity: number;
  flavors?: FlavorQuantity[];
  mix_details?: {
    tender_flavors: FlavorQuantity[];
    waffle_flavors: FlavorQuantity[];
  };
  subtotal: number;
}

interface Receipt {
  id: string;
  short_id: string;
  customer_name: string;
  items: MenuItem[];
  total: number;
  created_at: string;
  expires_at?: string;
}

const PublicReceipt = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!shortId) {
        setError("Receipt not found");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('short_id', shortId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError("Receipt not found or expired");
          } else {
            setError("Failed to load receipt");
          }
          setLoading(false);
          return;
        }

        setReceipt({
          ...data,
          items: data.items as unknown as MenuItem[]
        });
      } catch (err) {
        console.error("Error fetching receipt:", err);
        setError("Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [shortId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold mb-2">Receipt Not Found</h2>
          <p className="text-lg mb-6">{error || "Receipt not found or expired. Contact the store."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-system">
      <div className="top">
        <h1 className="title">Raising Kaynes</h1>
        <div className="printer"></div>
      </div>
      
      <div className="receipts-wrapper">
        <div className="receipts">
          <div className="receipt">
            <div className="brand-logo">🍔 Raising Kaynes</div>
            
            <div className="order-header">
              <h2>Order Receipt</h2>
              <p id="customer-name">Customer: {receipt.customer_name || 'Guest'}</p>
              <p id="order-date">Date: {new Date(receipt.created_at).toLocaleString()}</p>
              {receipt.expires_at && (
                <p className="text-sm text-muted-foreground">
                  Valid until: {new Date(receipt.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="details" id="order-details">
              {receipt.items.map((item, index) => (
                <div key={index} className="space-y-2 w-full mb-4">
                  <div className="item">
                    <span className="font-semibold">{item.category}</span>
                    <h3>₱{item.subtotal.toFixed(2)}</h3>
                  </div>
                  <div className="text-xs text-gray-600 ml-2">
                    <p>Qty: {item.quantity} × ₱{item.unit_price}</p>
                    {item.flavors && item.flavors.length > 0 && (
                      <p>Flavors: {item.flavors.map(f => `${f.name} (×${f.quantity})`).join(', ')}</p>
                    )}
                    {item.mix_details && (
                      <>
                        <p>Tenders: {item.mix_details.tender_flavors.map(f => `${f.name} (×${f.quantity})`).join(', ')}</p>
                        <p>Waffles: {item.mix_details.waffle_flavors.map(f => `${f.name} (×${f.quantity})`).join(', ')}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div className="item total">
                <span>Total</span>
                <h3>₱{receipt.total.toFixed(2)}</h3>
              </div>
            </div>

            <div className="text-center print:hidden mt-6">
              <Button 
                onClick={handlePrint} 
                className="restaurant-button"
                style={{
                  backgroundColor: '#FFC107',
                  color: '#D32F2F',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: '8px'
                }}
              >
                Print
              </Button>
            </div>
          </div>

          <div className="receipt qr-code">
            <div className="qr">
              <div className="w-full h-full bg-primary/10 rounded flex items-center justify-center text-2xl">
                📱
              </div>
            </div>
            <div className="description">
              <h2>Thank you for ordering!</h2>
              <p>You can order again from this QR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicReceipt;