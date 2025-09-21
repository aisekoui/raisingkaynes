import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

const prices = {
  tenders: 99,
  waffles: 49,
  lemonade: 29,
  addons: { sauce: 59, syrup: 29, rice: 20 },
  mix: 139
};

const RaisingKaynesAdmin = () => {
  const [customerName, setCustomerName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // State for each category
  const [chickenTendersFlavors, setChickenTendersFlavors] = useState<{[key: string]: number}>({
    "Buffalo": 0,
    "Soy Garlic": 0,
    "Salted Egg": 0
  });

  const [waffleFlavors, setWaffleFlavors] = useState<{[key: string]: number}>({
    "Chocolate Chip w/ syrup": 0,
    "Cookies n Cream w/ syrup": 0,
    "Plain w/ syrup": 0
  });

  const [lemonadeQty, setLemonadeQty] = useState(1);
  
  const [addons, setAddons] = useState<{[key: string]: number}>({
    "large extra sauce": 0,
    "extra syrup": 0,
    "extra rice": 0
  });

  const [mixQty, setMixQty] = useState(1);
  const [mixTenderFlavors, setMixTenderFlavors] = useState<{[key: string]: number}>({
    "Buffalo": 0,
    "Soy Garlic": 0,
    "Salted Egg": 0
  });
  const [mixWaffleFlavors, setMixWaffleFlavors] = useState<{[key: string]: number}>({
    "Chocolate Chip w/ syrup": 0,
    "Cookies n Cream w/ syrup": 0,
    "Plain w/ syrup": 0
  });

  const updateOrderPreview = () => {
    const items: MenuItem[] = [];
    let newTotal = 0;

    // Chicken Tenders
    if (selectedCategories.has("tenders")) {
      const tenderTotal = Object.values(chickenTendersFlavors).reduce((sum, qty) => sum + qty, 0);
      if (tenderTotal > 0) {
        const subtotal = tenderTotal * prices.tenders;
        items.push({
          category: "Chicken Tenders",
          unit_price: prices.tenders,
          quantity: tenderTotal,
          flavors: Object.entries(chickenTendersFlavors)
            .filter(([_, qty]) => qty > 0)
            .map(([name, quantity]) => ({ name, quantity })),
          subtotal
        });
        newTotal += subtotal;
      }
    }

    // Waffles
    if (selectedCategories.has("waffles")) {
      const waffleTotal = Object.values(waffleFlavors).reduce((sum, qty) => sum + qty, 0);
      if (waffleTotal > 0) {
        const subtotal = waffleTotal * prices.waffles;
        items.push({
          category: "Waffles",
          unit_price: prices.waffles,
          quantity: waffleTotal,
          flavors: Object.entries(waffleFlavors)
            .filter(([_, qty]) => qty > 0)
            .map(([name, quantity]) => ({ name, quantity })),
          subtotal
        });
        newTotal += subtotal;
      }
    }

    // Lemonade
    if (selectedCategories.has("lemonade") && lemonadeQty > 0) {
      const subtotal = lemonadeQty * prices.lemonade;
      items.push({
        category: "Lemonade",
        unit_price: prices.lemonade,
        quantity: lemonadeQty,
        subtotal
      });
      newTotal += subtotal;
    }

    // Add-ons
    Object.entries(addons).forEach(([name, qty]) => {
      if (selectedCategories.has(`addon-${name}`) && qty > 0) {
        const priceKey = name.includes('sauce') ? 'sauce' : name.includes('syrup') ? 'syrup' : 'rice';
        const unitPrice = prices.addons[priceKey as keyof typeof prices.addons];
        const subtotal = qty * unitPrice;
        items.push({
          category: `Add-on: ${name}`,
          unit_price: unitPrice,
          quantity: qty,
          subtotal
        });
        newTotal += subtotal;
      }
    });

    // Mix & Match
    if (selectedCategories.has("mix")) {
      const tenderMixTotal = Object.values(mixTenderFlavors).reduce((sum, qty) => sum + qty, 0);
      const waffleMixTotal = Object.values(mixWaffleFlavors).reduce((sum, qty) => sum + qty, 0);
      
      if (tenderMixTotal === mixQty && waffleMixTotal === mixQty) {
        const subtotal = mixQty * prices.mix;
        items.push({
          category: "Mix & Match",
          unit_price: prices.mix,
          quantity: mixQty,
          mix_details: {
            tender_flavors: Object.entries(mixTenderFlavors)
              .filter(([_, qty]) => qty > 0)
              .map(([name, quantity]) => ({ name, quantity })),
            waffle_flavors: Object.entries(mixWaffleFlavors)
              .filter(([_, qty]) => qty > 0)
              .map(([name, quantity]) => ({ name, quantity }))
          },
          subtotal
        });
        newTotal += subtotal;
      }
    }

    setOrderItems(items);
    setTotal(newTotal);
  };

  const validateForm = () => {
    if (!customerName.trim()) return false;
    if (selectedCategories.size === 0) return false;

    // Validate each selected category
    for (const category of selectedCategories) {
      if (category === "tenders") {
        const tenderTotal = Object.values(chickenTendersFlavors).reduce((sum, qty) => sum + qty, 0);
        if (tenderTotal === 0) return false;
      }
      if (category === "waffles") {
        const waffleTotal = Object.values(waffleFlavors).reduce((sum, qty) => sum + qty, 0);
        if (waffleTotal === 0) return false;
      }
      if (category === "mix") {
        const tenderMixTotal = Object.values(mixTenderFlavors).reduce((sum, qty) => sum + qty, 0);
        const waffleMixTotal = Object.values(mixWaffleFlavors).reduce((sum, qty) => sum + qty, 0);
        if (tenderMixTotal !== mixQty || waffleMixTotal !== mixQty) return false;
      }
    }

    return orderItems.length > 0;
  };

  useEffect(() => {
    updateOrderPreview();
  }, [selectedCategories, chickenTendersFlavors, waffleFlavors, lemonadeQty, addons, mixQty, mixTenderFlavors, mixWaffleFlavors]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [orderItems, customerName]);

  const handleCategoryToggle = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
      // Reset related state when unchecking
      if (category === "tenders") {
        setChickenTendersFlavors({ "Buffalo": 0, "Soy Garlic": 0, "Salted Egg": 0 });
      } else if (category === "waffles") {
        setWaffleFlavors({ "Chocolate Chip w/ syrup": 0, "Cookies n Cream w/ syrup": 0, "Plain w/ syrup": 0 });
      } else if (category === "mix") {
        setMixTenderFlavors({ "Buffalo": 0, "Soy Garlic": 0, "Salted Egg": 0 });
        setMixWaffleFlavors({ "Chocolate Chip w/ syrup": 0, "Cookies n Cream w/ syrup": 0, "Plain w/ syrup": 0 });
      }
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const generateReceipt = async () => {
    if (!isFormValid) {
      toast.error("Please complete the form correctly");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('receipts')
        .insert({
          customer_name: customerName.trim(),
          items: orderItems as any,
          total: total,
          created_by: null, // We'll implement auth later
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
        })
        .select('short_id')
        .single();

      if (error) {
        throw error;
      }

      toast.success("Receipt generated successfully!");
      navigate(`/receipt?sid=${data.short_id}`);
      
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error(`Failed to generate receipt: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header 
        role="banner" 
        className="w-full text-center py-6 px-8"
        style={{
          background: 'linear-gradient(90deg, #D32F2F 0%, #D32F2F 70%, #FFC107 70%, #FFC107 100%)',
          height: '84px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          margin: '16px',
          marginBottom: '20px'
        }}
      >
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Raising Kaynes logo" 
            className="w-12 h-12 object-contain mr-4"
          />
          <div className="text-left">
            <h1 className="text-white font-ubuntu font-bold text-2xl leading-tight">
              Raising Kaynes
            </h1>
            <p className="text-white/90 font-ubuntu font-medium text-sm mt-1">
              Admin Panel
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Name */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg" style={{ borderRadius: '12px' }}>
              <CardContent className="p-6">
                <Label htmlFor="customerName" className="text-lg font-medium mb-2 block">
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
              </CardContent>
            </Card>
          </div>

          {/* Menu Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg" style={{ borderRadius: '12px' }}>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Menu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Chicken Tenders */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="chickenTenders"
                      checked={selectedCategories.has("tenders")}
                      onCheckedChange={() => handleCategoryToggle("tenders")}
                    />
                    <Label htmlFor="chickenTenders" className="text-lg font-medium">
                      Chicken Tenders — ₱99 each
                    </Label>
                  </div>
                  
                  {selectedCategories.has("tenders") && (
                    <div className="ml-6 space-y-2 p-4 bg-muted/50 rounded-lg">
                      {Object.entries(chickenTendersFlavors).map(([flavor, qty]) => (
                        <div key={flavor} className="flex items-center justify-between">
                          <span>{flavor}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setChickenTendersFlavors(prev => ({ 
                                ...prev, 
                                [flavor]: Math.max(0, prev[flavor] - 1) 
                              }))}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{qty}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setChickenTendersFlavors(prev => ({ 
                                ...prev, 
                                [flavor]: prev[flavor] + 1 
                              }))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Waffles */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="waffles"
                      checked={selectedCategories.has("waffles")}
                      onCheckedChange={() => handleCategoryToggle("waffles")}
                    />
                    <Label htmlFor="waffles" className="text-lg font-medium">
                      Waffles — ₱49 each
                    </Label>
                  </div>
                  
                  {selectedCategories.has("waffles") && (
                    <div className="ml-6 space-y-2 p-4 bg-muted/50 rounded-lg">
                      {Object.entries(waffleFlavors).map(([flavor, qty]) => (
                        <div key={flavor} className="flex items-center justify-between">
                          <span>{flavor}</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setWaffleFlavors(prev => ({ 
                                ...prev, 
                                [flavor]: Math.max(0, prev[flavor] - 1) 
                              }))}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{qty}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setWaffleFlavors(prev => ({ 
                                ...prev, 
                                [flavor]: prev[flavor] + 1 
                              }))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Lemonade */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="lemonade"
                      checked={selectedCategories.has("lemonade")}
                      onCheckedChange={() => handleCategoryToggle("lemonade")}
                    />
                    <Label htmlFor="lemonade" className="text-lg font-medium">
                      Lemonade — ₱29
                    </Label>
                  </div>
                  
                  {selectedCategories.has("lemonade") && (
                    <div className="ml-6 flex items-center space-x-2">
                      <span>Quantity:</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLemonadeQty(Math.max(1, lemonadeQty - 1))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{lemonadeQty}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLemonadeQty(lemonadeQty + 1)}
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>

                {/* Add-ons */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Add-ons</h3>
                  
                  {Object.entries(prices.addons).map(([key, price]) => {
                    const displayName = key === 'sauce' ? 'large extra sauce' : 
                                      key === 'syrup' ? 'extra syrup' : 'extra rice';
                    const categoryKey = `addon-${displayName}`;
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={categoryKey}
                            checked={selectedCategories.has(categoryKey)}
                            onCheckedChange={() => handleCategoryToggle(categoryKey)}
                          />
                          <Label htmlFor={categoryKey} className="text-lg font-medium">
                            {displayName} — ₱{price}
                          </Label>
                        </div>
                        
                        {selectedCategories.has(categoryKey) && (
                          <div className="ml-6 flex items-center space-x-2">
                            <span>Quantity:</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAddons(prev => ({ 
                                ...prev, 
                                [displayName]: Math.max(0, prev[displayName] - 1) 
                              }))}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{addons[displayName]}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAddons(prev => ({ 
                                ...prev, 
                                [displayName]: prev[displayName] + 1 
                              }))}
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mix & Match */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="mix"
                      checked={selectedCategories.has("mix")}
                      onCheckedChange={() => handleCategoryToggle("mix")}
                    />
                    <Label htmlFor="mix" className="text-lg font-medium">
                      Special Mix and Match (pick one flavor of tenders and waffles) — ₱139
                    </Label>
                  </div>
                  
                  {selectedCategories.has("mix") && (
                    <div className="ml-6 space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span>Mix Quantity:</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setMixQty(Math.max(1, mixQty - 1))}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{mixQty}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setMixQty(mixQty + 1)}
                        >
                          +
                        </Button>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Pick exactly {mixQty} tender flavors and {mixQty} waffle flavors total.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Tenders (pick flavors & qty)</h4>
                          {Object.entries(mixTenderFlavors).map(([flavor, qty]) => (
                            <div key={flavor} className="flex items-center justify-between mb-2">
                              <span className="text-sm">{flavor}</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMixTenderFlavors(prev => ({ 
                                    ...prev, 
                                    [flavor]: Math.max(0, prev[flavor] - 1) 
                                  }))}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center text-sm">{qty}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMixTenderFlavors(prev => ({ 
                                    ...prev, 
                                    [flavor]: prev[flavor] + 1 
                                  }))}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            Total: {Object.values(mixTenderFlavors).reduce((sum, qty) => sum + qty, 0)}/{mixQty}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Waffles (pick flavors & qty)</h4>
                          {Object.entries(mixWaffleFlavors).map(([flavor, qty]) => (
                            <div key={flavor} className="flex items-center justify-between mb-2">
                              <span className="text-sm">{flavor}</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMixWaffleFlavors(prev => ({ 
                                    ...prev, 
                                    [flavor]: Math.max(0, prev[flavor] - 1) 
                                  }))}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center text-sm">{qty}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setMixWaffleFlavors(prev => ({ 
                                    ...prev, 
                                    [flavor]: prev[flavor] + 1 
                                  }))}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          ))}
                          <p className="text-xs text-muted-foreground">
                            Total: {Object.values(mixWaffleFlavors).reduce((sum, qty) => sum + qty, 0)}/{mixQty}
                          </p>
                        </div>
                      </div>
                      
                      {selectedCategories.has("mix") && (
                        Object.values(mixTenderFlavors).reduce((sum, qty) => sum + qty, 0) !== mixQty ||
                        Object.values(mixWaffleFlavors).reduce((sum, qty) => sum + qty, 0) !== mixQty
                      ) && (
                        <p className="text-sm text-destructive">
                          For Mix & Match choose exactly {mixQty} tender flavors and {mixQty} waffle flavors (totals).
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-4" style={{ borderRadius: '12px' }}>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No items selected
                  </p>
                ) : (
                  <>
                    {orderItems.map((item, index) => (
                      <div key={index} className="border-b pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.category}</h4>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} × ₱{item.unit_price}
                            </p>
                            {item.flavors && item.flavors.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Flavors: {item.flavors.map(f => `${f.name} (${f.quantity})`).join(', ')}
                              </p>
                            )}
                            {item.mix_details && (
                              <div className="text-xs text-muted-foreground">
                                <p>Tenders: {item.mix_details.tender_flavors.map(f => `${f.name} (${f.quantity})`).join(', ')}</p>
                                <p>Waffles: {item.mix_details.waffle_flavors.map(f => `${f.name} (${f.quantity})`).join(', ')}</p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₱{item.subtotal.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary">₱{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
                
                <Button
                  onClick={generateReceipt}
                  disabled={!isFormValid}
                  className="w-full text-xl py-4 font-bold"
                  style={{
                    backgroundColor: isFormValid ? '#FFC107' : '#ccc',
                    color: isFormValid ? '#D32F2F' : '#666',
                    borderRadius: '10px'
                  }}
                >
                  Generate Receipt
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RaisingKaynesAdmin;