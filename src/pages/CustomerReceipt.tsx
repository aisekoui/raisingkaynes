import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReceiptItem {
  name: string;
  price: number;
  qty?: number;
}

interface Receipt {
  id: string;
  short_id: string;
  customer_name: string;
  items: ReceiptItem[];
  total: number;
  created_at: string;
  expires_at?: string;
}

const CustomerReceipt = () => {
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
        const response = await fetch(`https://eudcijcaihzctrfborim.supabase.co/functions/v1/receipts/${shortId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Receipt not found or expired");
          } else {
            setError("Failed to load receipt");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setReceipt(data);
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
          <p className="text-lg mb-6">{error || "The receipt you're looking for doesn't exist or has expired."}</p>
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

  return (
    <div className="ticket-system">
      <div className="top">
        <h1 className="title">MyBrand Restaurant</h1>
        <div className="printer"></div>
      </div>
      
      <div className="receipts-wrapper">
        <div className="receipts">
          <div className="receipt">
            <div className="brand-logo">🍔 MyBrand Restaurant</div>
            
            <div className="order-header">
              <h2>Order Receipt</h2>
              <p id="customer-name">Customer: {receipt.customer_name}</p>
              <p id="order-date">Date: {new Date(receipt.created_at).toLocaleString()}</p>
              {receipt.expires_at && (
                <p className="text-sm text-muted-foreground">
                  Valid until: {new Date(receipt.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="details" id="order-details">
              {receipt.items.map((item, index) => (
                <div key={index} className="item">
                  <span>{item.name}</span>
                  <h3>${(item.price * (item.qty || 1)).toFixed(2)}</h3>
                </div>
              ))}
              <div className="item total">
                <span>Total</span>
                <h3>${receipt.total.toFixed(2)}</h3>
              </div>
            </div>

            <div className="text-center print:hidden">
              <Button onClick={handlePrint} className="restaurant-button">
                Print Receipt
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
              <h2>Show at Counter</h2>
              <p>Present this receipt for pickup</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 print:hidden">
        <Button 
          onClick={handleBackToAdmin}
          className="restaurant-button"
          variant="outline"
        >
          Create Another Receipt
        </Button>
      </div>
    </div>
  );
};

export default CustomerReceipt;