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

  // Initialize falling chicken animation
  const initFallingChickens = () => {
    const canvas = document.getElementById("chickenCanvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const TOTAL_CHICKENS = 50;
    const chickens: Chicken[] = [];
    const chickenImg = new Image();
    chickenImg.src = "/chicken-logo.png";

    class Chicken {
      x: number;
      y: number;
      size: number;
      speed: number;
      rotation: number;

      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height; // start above screen
        this.size = 40 + Math.random() * 20; // random size variation
        this.speed = 1 + Math.random() * 2; // fall speed variation
        this.rotation = Math.random() * 360; // random rotation
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = 0.3; // 30% transparency
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.drawImage(chickenImg, -this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height + this.size) {
          this.reset();
        }
        this.draw();
      }
    }

    const render = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      chickens.forEach(chicken => chicken.update());
      requestAnimationFrame(render);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reset chickens positions for new canvas size
      chickens.forEach(chicken => chicken.reset());
    };

    chickenImg.onload = () => {
      for (let i = 0; i < TOTAL_CHICKENS; i++) {
        chickens.push(new Chicken());
      }
      render();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  };

  // Trigger print animation and falling chickens after receipt data is loaded
  useEffect(() => {
    if (receipt && !loading && !error) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const cleanup = initFallingChickens();
        playPrintAnimation();
        
        // Return cleanup function
        return cleanup;
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
      <canvas id="chickenCanvas" className="fixed top-0 left-0 w-full h-full -z-10"></canvas>
      <div className="top">
        <h1 className="title font-fredoka font-bold text-3xl">Thank you for ordering!</h1>
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
              <span className="font-fredoka font-bold">Raising Kaynes</span>
            </div>
            
            <div className="order-header font-fredoka font-medium">
              <h2>Order Receipt</h2>
              <p id="customer-name">Customer: {receipt.customer_name || 'Guest'}</p>
              <p id="order-date">Date: {new Date(receipt.created_at).toLocaleString()}</p>
              {receipt.expires_at && (
                <p className="text-sm text-muted-foreground">
                  Valid until: {new Date(receipt.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="details font-fredoka font-medium" id="order-details">
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
            <div className="description font-fredoka font-medium">
              <h2>Craving more?</h2>
              <p>Scan the QR to come back for seconds!</p>
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