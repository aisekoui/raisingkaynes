import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  id: string;
  name: string;
  price: number;
}

interface OrderData {
  customerName: string;
  orderDate: string;
  items: OrderItem[];
  total: number;
}

const Receipt = () => {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem("receiptData");
    if (!data) {
      toast.error("No receipt data found");
      navigate("/admin");
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setOrderData(parsedData);
      
      // Trigger animation after component mounts
      setTimeout(() => setIsAnimating(true), 100);
    } catch (error) {
      toast.error("Invalid receipt data");
      navigate("/admin");
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const createNewOrder = () => {
    navigate("/admin");
  };

  if (!orderData) {
    return (
      <div className="ticket-system">
        <div className="text-center">
          <p className="text-lg">Loading receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-system">
      <div className="receipts-wrapper">
        <div className={`receipts ${isAnimating ? 'animate-receipt-print' : 'opacity-0'}`}>
          <div className="receipt">
            {/* Restaurant Logo */}
            <h1 className="brand-logo">🍔 MyBrand Restaurant</h1>

            {/* Order Header */}
            <div className="order-header">
              <h2>Receipt</h2>
              <p id="customer-name">{orderData.customerName}</p>
              <p id="order-date">{orderData.orderDate}</p>
            </div>

            {/* Order Items */}
            <div className="details">
              {orderData.items.map((item, index) => (
                <div key={index} className="item">
                  <span>{item.name}</span>
                  <h3>${item.price.toFixed(2)}</h3>
                </div>
              ))}
              
              {/* Total */}
              <div className="item total">
                <span>Total</span>
                <h3>${orderData.total.toFixed(2)}</h3>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="receipt qr-code">
              <svg className="qr" width="60" height="60" viewBox="0 0 24 24">
                <rect width="24" height="24" fill="#D32F2F"/>
                <rect x="2" y="2" width="4" height="4" fill="white"/>
                <rect x="8" y="2" width="4" height="4" fill="white"/>
                <rect x="14" y="2" width="4" height="4" fill="white"/>
                <rect x="2" y="8" width="4" height="4" fill="white"/>
                <rect x="14" y="8" width="4" height="4" fill="white"/>
                <rect x="2" y="14" width="4" height="4" fill="white"/>
                <rect x="8" y="14" width="4" height="4" fill="white"/>
                <rect x="14" y="14" width="4" height="4" fill="white"/>
              </svg>
              <div className="description">
                <h2>Show at Counter</h2>
                <p>Scan for feedback</p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <button id="printReceipt" onClick={handlePrint} className="print-button">
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default Receipt;