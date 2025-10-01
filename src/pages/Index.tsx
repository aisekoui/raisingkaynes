import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const navigate = useNavigate();

  const handleAccessStaffPanel = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col">
      <Helmet>
        <title>Raising Kaynes - Tender. Sarap. Repeat!</title>
        <meta name="description" content="Experience the best chicken tenders, waffles, and lemonade. Order online and get your receipt instantly!" />
        
        <meta property="og:title" content="Raising Kaynes - Tender. Sarap. Repeat!" />
        <meta property="og:description" content="Experience the best chicken tenders, waffles, and lemonade. Order online and get your receipt instantly!" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content={window.location.href} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Raising Kaynes - Tender. Sarap. Repeat!" />
        <meta name="twitter:description" content="Experience the best chicken tenders, waffles, and lemonade. Order online and get your receipt instantly!" />
        <meta name="twitter:image" content="/og-image.png" />
      </Helmet>
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
          marginBottom: '0'
        }}
      >
        <div className="flex items-center space-x-3 text-left">
          <img 
            src="/logo.png" 
            alt="Raising Kaynes logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-white font-ubuntu font-bold text-2xl leading-tight">
              Raising Kaynes
            </h1>
            <p className="text-white/90 font-ubuntu font-medium text-sm mt-1">
              Admin Page
            </p>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Buttons */}
      <main className="flex-1 flex items-center justify-center">
        <div className="space-y-4 flex flex-col items-center">
          <button
            onClick={handleAccessStaffPanel}
            aria-label="Access Staff Panel"
            className="font-ubuntu text-xl font-bold px-9 py-4 rounded-xl transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: '#FFC107',
              color: '#D32F2F',
              boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e6a900';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFC107';
            }}
          >
            Access Staff Panel
          </button>
          
          <button
            onClick={() => window.open('YOUR_GOOGLE_SHEET_URL_HERE', '_blank')}
            aria-label="View Receipts Log"
            className="font-ubuntu text-lg font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:shadow-lg border-2"
            style={{
              backgroundColor: 'transparent',
              color: '#D32F2F',
              borderColor: '#D32F2F',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D32F2F';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#D32F2F';
            }}
          >
            View Receipts Log
          </button>
        </div>
      </main>

      {/* Optional Footer */}
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>© 2024 Raising Kaynes. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;