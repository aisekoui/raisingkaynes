import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

const menuItems: MenuItem[] = [
  { id: "burger", name: "Burger", price: 5.00 },
  { id: "fries", name: "Fries", price: 2.50 },
  { id: "soda", name: "Soda", price: 1.50 },
  { id: "ice-cream", name: "Ice Cream", price: 3.00 },
  { id: "pizza", name: "Pizza Slice", price: 4.00 },
];

const Admin = () => {
  const [customerName, setCustomerName] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const generateReceipt = () => {
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (selectedItems.size === 0) {
      toast.error("Please select at least one item");
      return;
    }

    const selectedMenuItems = menuItems.filter(item => selectedItems.has(item.id));
    const total = selectedMenuItems.reduce((sum, item) => sum + item.price, 0);

    const orderData = {
      customerName: customerName.trim(),
      orderDate: new Date().toLocaleString(),
      items: selectedMenuItems,
      total,
    };

    localStorage.setItem("receiptData", JSON.stringify(orderData));
    toast.success("Receipt generated successfully!");
    navigate("/receipt");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <header className="admin-header">
        <h1 className="text-3xl font-bold">🍔 Staff Order Panel</h1>
        <p className="mt-2 text-primary-foreground/80">MyBrand Restaurant</p>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-primary text-center">
              Create New Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-lg font-medium">
                Customer Name
              </Label>
              <Input
                id="customerName"
                type="text"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-lg py-3"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">Menu Items</Label>
              <div className="space-y-3">
                {menuItems.map((item) => (
                  <div key={item.id} className="menu-item">
                    <Checkbox
                      id={item.id}
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => handleItemToggle(item.id)}
                      className="menu-checkbox"
                    />
                    <Label 
                      htmlFor={item.id} 
                      className="flex-1 cursor-pointer text-lg"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-primary font-bold ml-auto">
                        ${item.price.toFixed(2)}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generateReceipt}
              className="restaurant-button w-full text-xl py-4"
              size="lg"
            >
              Generate Receipt
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;