import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleAccessStaffPanel = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex flex-col">
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
            src="/src/assets/logo.png" 
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

      {/* Main Content - Centered Button */}
      <main className="flex-1 flex items-center justify-center">
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
      </main>

      {/* Optional Footer */}
      <footer className="text-center py-4 text-sm text-muted-foreground">
        <p>© 2024 Raising Kaynes. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;