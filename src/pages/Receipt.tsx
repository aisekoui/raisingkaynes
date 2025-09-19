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
      <div className="receipt-wrapper">
        <div className={`receipt-container ${isAnimating ? 'animate-receipt-print' : 'opacity-0'}`}>
          {/* Restaurant Logo */}
          <div className="brand-logo">
            🍔 MyBrand Restaurant
          </div>

          {/* Order Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-gray-300">
            <h2 className="text-2xl font-bold text-primary mb-2">Receipt</h2>
            <p className="text-lg font-semibold">{orderData.customerName}</p>
            <p className="text-sm text-muted-foreground">{orderData.orderDate}</p>
          </div>

          {/* Order Items */}
          <div className="space-y-3 mb-6">
            {orderData.items.map((item, index) => (
              <div key={index} className="receipt-item">
                <span className="font-medium">{item.name}</span>
                <span className="font-semibold">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="receipt-total">
            <span>Total</span>
            <span>${orderData.total.toFixed(2)}</span>
          </div>

          {/* QR Code Section */}
          <div className="qr-section">
            <div className="w-20 h-20 bg-primary mx-auto rounded-lg flex items-center justify-center mb-3">
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 ${i % 2 === 0 ? 'bg-white' : 'bg-primary'} rounded-sm`}
                  />
                ))}
              </div>
            </div>
            <h3 className="font-bold text-primary">Show at Counter</h3>
            <p className="text-sm text-muted-foreground">Scan for feedback</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 print:hidden">
          <Button
            onClick={handlePrint}
            className="restaurant-button flex-1"
            size="lg"
          >
            Print Receipt
          </Button>
          <Button
            onClick={createNewOrder}
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            size="lg"
          >
            New Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;