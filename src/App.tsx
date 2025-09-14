import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { 
  LandingPage,
  AuthForm,
  PublicDashboard,
  ProjectManagerDashboard,
  NCCRVerifierDashboard,
  BuyerDashboard,
  BlockchainStatus
} from './components';
import { useAuth } from './hooks/useAuth';
import { Waves, Leaf, Shield, TrendingUp, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { User } from './types';

function App() {
  const { user, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('public');

  useEffect(() => {
    if (user?.user_metadata?.role) {
      setActiveTab(user.user_metadata.role);
    }
  }, [user]);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      setShowAuth(false); // Return to landing page
      toast.success('Signed out successfully');
    } else {
      toast.error('Error signing out');
    }
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'project_manager':
        return <Leaf className="h-4 w-4" />;
      case 'nccr_verifier':
        return <Shield className="h-4 w-4" />;
      case 'buyer':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Waves className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'project_manager':
        return 'Project Manager';
      case 'nccr_verifier':
        return 'NCCR Verifier';
      case 'buyer':
        return 'Buyer';
      default:
        return 'Public';
    }
  };

  const getGridCols = () => {
    if (!user) return 'grid-cols-1';
    
    // Always has public tab, plus user's role-specific tab
    return 'grid-cols-2';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show landing page first
  if (!showAuth && !user) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => !user && setShowAuth(false)}>
              <div className="bg-blue-600 rounded-lg p-2">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Samudra Ledger</h1>
                <p className="text-sm text-gray-600">Blue Carbon Registry</p>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="flex items-center space-x-1">
                  {getRoleIcon(user.user_metadata.role)}
                  <span>{getRoleLabel(user.user_metadata.role)}</span>
                </Badge>
                <span className="text-sm text-gray-600">{user.user_metadata.name}</span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setShowAuth(false)}>
                Back to Home
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={user ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
        {!user ? (
          <div className="max-w-md mx-auto py-8">
            <AuthForm />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${getGridCols()}`}>
              <TabsTrigger value="public" className="flex items-center space-x-2">
                <Waves className="h-4 w-4" />
                <span>Public</span>
              </TabsTrigger>
              {user.user_metadata.role === 'project_manager' && (
                <TabsTrigger value="project_manager" className="flex items-center space-x-2">
                  <Leaf className="h-4 w-4" />
                  <span>Projects</span>
                </TabsTrigger>
              )}
              {user.user_metadata.role === 'nccr_verifier' && (
                <TabsTrigger value="nccr_verifier" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Verification</span>
                </TabsTrigger>
              )}
              {user.user_metadata.role === 'buyer' && (
                <TabsTrigger value="buyer" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Marketplace</span>
                </TabsTrigger>
              )}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="public">
                <PublicDashboard />
              </TabsContent>
              
              <TabsContent value="project_manager">
                <ProjectManagerDashboard user={user} />
              </TabsContent>
              
              <TabsContent value="nccr_verifier">
                <NCCRVerifierDashboard user={user} />
              </TabsContent>
              
              <TabsContent value="buyer">
                <BuyerDashboard user={user} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 Samudra Ledger - Transparent Blue Carbon Registry for India</p>
            <div className="mt-3 flex justify-center">
              <BlockchainStatus variant="footer" showDetails />
            </div>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}

export default App;