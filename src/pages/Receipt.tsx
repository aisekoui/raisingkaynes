import { useEffect, useState } from "react";
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
    } catch (error) {
      toast.error("Invalid receipt data");
      navigate("/admin");
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!orderData) {
    return (
      <div className="ticket-system">
        <div className="top">
          <h1 className="title">Loading receipt...</h1>
          <div className="printer"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="ticket-system">
      <div className="top">
        <h1 className="title">Wait a second, your receipt is being printed</h1>
        <div className="printer"></div>
      </div>
      <div className="receipts-wrapper">
        <div className="receipts">
          <div className="receipt">
            <h1 className="brand-logo">🍔 MyBrand Restaurant</h1>
            <div className="order-header">
              <h2>Receipt</h2>
              <p id="customer-name">Customer: {orderData.customerName}</p>
              <p id="order-date">Date: {orderData.orderDate}</p>
            </div>
            <div className="details" id="order-details">
              {orderData.items.map((item, index) => (
                <div key={index} className="item">
                  <span>{item.name}</span>
                  <h3>${item.price.toFixed(2)}</h3>
                </div>
              ))}
              <div className="item total">
                <span>Total</span>
                <h3>${orderData.total.toFixed(2)}</h3>
              </div>
            </div>
          </div>
          <div className="receipt qr-code">
            <svg className="qr" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.938 29.938">
              <path d="M7.129 15.683h1.427v1.427h1.426v1.426H2.853V17.11h1.426v-2.853h2.853v1.426h-.003zm18.535 12.83h1.424v-1.426h-1.424v1.426z"/>
            </svg>
            <div className="description">
              <h2>Show at Counter</h2>
              <p>Scan QR for feedback</p>
            </div>
          </div>
        </div>
      </div>
      <button id="printReceipt" onClick={handlePrint}>Print Receipt</button>
    </main>
  );
};

export default Receipt;