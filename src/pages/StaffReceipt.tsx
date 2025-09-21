import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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

const StaffReceipt = () => {
  const [searchParams] = useSearchParams();
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
  
  const sid = searchParams.get('sid');

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!sid) {
        setError("Receipt ID not found");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .eq('short_id', sid)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError("Receipt not found");
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
  }, [sid]);

  // Generate scattered chicken background with collision detection
  const generateChickenBackground = () => {
    const chickenBg = document.getElementById("chickenBg");
    if (!chickenBg) return;

    // Clear existing chickens
    chickenBg.innerHTML = '';
    
    const numChickens = 50;
    const chickenSrc = "/chicken-logo.png";
    const chickenSize = 55; // Size in pixels
    const minDistance = 70; // Minimum distance between chicken centers
    const positions: { top: number; left: number }[] = [];

    // Helper function to check if position is valid (doesn't overlap)
    const isValidPosition = (newTop: number, newLeft: number) => {
      return positions.every(pos => {
        const distance = Math.sqrt(
          Math.pow(newTop - pos.top, 2) + Math.pow(newLeft - pos.left, 2)
        );
        return distance >= minDistance;
      });
    };

    for (let i = 0; i < numChickens; i++) {
      let attempts = 0;
      let top, left;
      
      // Try to find a valid position (max 100 attempts per chicken)
      do {
        top = Math.random() * 85 + 7.5; // 7.5% to 92.5% to avoid edges
        left = Math.random() * 85 + 7.5;
        attempts++;
      } while (!isValidPosition(top, left) && attempts < 100);

      // Only add chicken if we found a valid position
      if (attempts < 100) {
        positions.push({ top, left });
        
        const chicken = document.createElement("img");
        chicken.src = chickenSrc;
        chicken.style.top = top + "%";
        chicken.style.left = left + "%";

        // Random rotation
        const rotation = Math.floor(Math.random() * 360);
        chicken.style.transform = `rotate(${rotation}deg)`;

        chickenBg.appendChild(chicken);
      }
    }
  };

  // Trigger background generation after receipt data is loaded
  useEffect(() => {
    if (receipt && !loading && !error) {
      setTimeout(() => {
        generateChickenBackground();
        playPrintAnimation();
      }, 100);
    }
  }, [receipt, loading, error]);

  const handlePrint = () => {
    window.print();
  };

  const handleBackToAdmin = () => {
    navigate("/admin");
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
          <p className="text-lg mb-6">{error || "The receipt you're looking for doesn't exist."}</p>
          <Button 
            onClick={handleBackToAdmin}
            className="restaurant-button"
          >
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/r/${receipt.short_id}`;

  return (
    <div className="ticket-system min-h-screen flex flex-col">
      <div className="chicken-bg" id="chickenBg"></div>
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
                className="restaurant-button mb-4"
                style={{
                  backgroundColor: '#FFC107',
                  color: '#D32F2F',
                  fontWeight: 'bold',
                  padding: '14px 24px',
                  borderRadius: '10px'
                }}
              >
                Print Receipt
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

      <div className="text-center mt-8 print:hidden space-y-4 pb-8">
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-primary mb-2">Share with Customer</h3>
          <p className="text-sm text-gray-600 mb-2">Public receipt link:</p>
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              value={publicUrl} 
              readOnly 
              className="flex-1 p-2 border rounded text-sm bg-gray-50"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast.success("Link copied to clipboard!");
              }}
              size="sm"
            >
              Copy
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={handleBackToAdmin}
          className="restaurant-button"
          variant="outline"
          style={{
            backgroundColor: 'white',
            color: '#D32F2F',
            border: '2px solid #D32F2F'
          }}
        >
          Create Another Receipt
        </Button>
      </div>
    </div>
  );
};

export default StaffReceipt;