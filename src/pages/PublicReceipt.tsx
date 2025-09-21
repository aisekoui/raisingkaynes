import { useState, useEffect, useRef } from "react";
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
  const receiptsRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Play print animation after receipt is populated
  const playPrintAnimation = () => {
    const receiptsEl = receiptsRef.current;
    const wrapper = wrapperRef.current;

    if (!receiptsEl || !wrapper) return;

    console.log('Starting print animation');

    // Make sure wrapper is in the pre-animation state
    wrapper.classList.remove('printed');

    // Force re-trigger of animation:
    receiptsEl.style.animation = 'none';     // clear any existing inline animation
    // force reflow
    void receiptsEl.offsetWidth;
    // set animation again (match your CSS name/duration)
    receiptsEl.style.animation = 'print 2.5s 500ms forwards';

    // When the animation ends, enable scrolling (class .printed switches overflow to auto)
    function handleAnimationEnd() {
      console.log('Animation ended, enabling scrolling');
      wrapper.classList.add('printed');
      receiptsEl.removeEventListener('animationend', handleAnimationEnd);
    }

    receiptsEl.addEventListener('animationend', handleAnimationEnd);

    // Fallback: in case animationend doesn't fire (older browsers/interrupt), enable scrolling after 3.5s
    setTimeout(() => {
      if (!wrapper.classList.contains('printed')) {
        console.log('Fallback timeout: enabling scrolling');
        wrapper.classList.add('printed');
      }
    }, 3500);
  };

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!shortId) {
        setError("Receipt not found");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_receipt_by_short_id', {
          receipt_short_id: shortId
        });

        if (error) {
          console.error("Error fetching receipt:", error);
          setError("Failed to load receipt");
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setError("Receipt not found or expired");
          setLoading(false);
          return;
        }

        const receiptData = data[0];
        setReceipt({
          ...receiptData,
          items: receiptData.items as unknown as MenuItem[]
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

  // Trigger print animation after receipt data is loaded
  useEffect(() => {
    if (receipt && !loading && !error) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        playPrintAnimation();
      }, 100);
    }
  }, [receipt, loading, error]);

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
    <div className="ticket-system receipt-page min-h-screen flex flex-col">
      <div className="top">
        <h1 className="title">Raising Kaynes</h1>
        <div className="printer"></div>
      </div>
      
      <div className="receipts-wrapper" ref={wrapperRef}>
        <div className="receipts" ref={receiptsRef}>
          <div className="receipt">
            <div className="brand-logo flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="Raising Kaynes logo" 
                className="w-8 h-8 object-contain"
              />
              <span>Raising Kaynes</span>
            </div>
            
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
              <img 
                src="/qr-code.png" 
                alt="Order Again QR Code" 
                className="w-full h-full object-contain"
              />
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