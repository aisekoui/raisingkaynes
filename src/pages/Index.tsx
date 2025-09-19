import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Header */}
      <header className="admin-header">
        <h1 className="text-4xl font-bold">🍔 MyBrand Restaurant</h1>
        <p className="mt-3 text-xl text-primary-foreground/90">
          Professional Order Management System
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-primary mb-4">
            Welcome to Our Order System
          </h2>
          <p className="text-xl text-muted-foreground">
            Streamlined ordering process with beautiful receipt generation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Staff Portal Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">👨‍💼 Staff Portal</CardTitle>
              <CardDescription className="text-lg">
                Create and manage customer orders
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <ul className="text-left space-y-2 text-muted-foreground">
                <li>• Input customer information</li>
                <li>• Select menu items with prices</li>
                <li>• Generate professional receipts</li>
                <li>• Print or save orders</li>
              </ul>
              <Link to="/admin">
                <Button className="restaurant-button w-full text-lg py-3" size="lg">
                  Access Staff Panel
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">✨ Features</CardTitle>
              <CardDescription className="text-lg">
                Everything you need for order management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground font-bold">📋</span>
                  </div>
                  <span>Easy order entry system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">🎨</span>
                  </div>
                  <span>Beautiful animated receipts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-secondary-foreground font-bold">🖨️</span>
                  </div>
                  <span>Professional printing support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">📱</span>
                  </div>
                  <span>Mobile-responsive design</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-muted-foreground mb-6">
            Experience our intuitive order management system
          </p>
          <Link to="/admin">
            <Button 
              className="restaurant-button text-xl px-8 py-4" 
              size="lg"
            >
              Start Taking Orders
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
