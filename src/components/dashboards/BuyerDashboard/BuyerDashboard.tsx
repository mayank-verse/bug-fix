import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { StatsCard } from './StatsCard';
import { CreditCard } from './CreditCard';
import { PurchaseDialog } from './PurchaseDialog';
import { RetirementDialog } from './RetirementDialog';
import { RetirementHistory } from './RetirementHistory';
import { CreditData, RetirementRecord } from './types';

export function BuyerDashboard() {
  const [availableCredits, setAvailableCredits] = useState<CreditData[]>([]);
  const [ownedCredits, setOwnedCredits] = useState<CreditData[]>([]);
  const [retirementHistory, setRetirementHistory] = useState<RetirementRecord[]>([]);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isRetirementDialogOpen, setIsRetirementDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CreditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setAvailableCredits([
        {
          id: '1',
          projectName: 'Solar Farm Project',
          creditType: 'VCS',
          quantity: 1000,
          pricePerCredit: 25.50,
          vintage: 2023,
          location: 'California, USA',
          verificationStatus: 'verified'
        },
        {
          id: '2',
          projectName: 'Wind Energy Initiative',
          creditType: 'Gold Standard',
          quantity: 500,
          pricePerCredit: 30.00,
          vintage: 2023,
          location: 'Texas, USA',
          verificationStatus: 'verified'
        }
      ]);

      setOwnedCredits([
        {
          id: '3',
          projectName: 'Forest Conservation',
          creditType: 'VCS',
          quantity: 250,
          pricePerCredit: 28.00,
          vintage: 2022,
          location: 'Brazil',
          verificationStatus: 'verified'
        }
      ]);

      setRetirementHistory([
        {
          id: '1',
          projectName: 'Reforestation Project',
          quantity: 100,
          retirementDate: '2023-12-01',
          certificateId: 'CERT-001',
          reason: 'Corporate sustainability goals'
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (credit: CreditData) => {
    setSelectedCredit(credit);
    setIsPurchaseDialogOpen(true);
  };

  const handleRetire = (credit: CreditData) => {
    setSelectedCredit(credit);
    setIsRetirementDialogOpen(true);
  };

  const handlePurchaseComplete = (purchasedCredit: CreditData, quantity: number) => {
    // Update owned credits
    const newCredit = { ...purchasedCredit, quantity };
    setOwnedCredits(prev => [...prev, newCredit]);
    
    // Update available credits
    setAvailableCredits(prev => 
      prev.map(credit => 
        credit.id === purchasedCredit.id 
          ? { ...credit, quantity: credit.quantity - quantity }
          : credit
      ).filter(credit => credit.quantity > 0)
    );
    
    setIsPurchaseDialogOpen(false);
    setSelectedCredit(null);
  };

  const handleRetirementComplete = (retiredCredit: CreditData, quantity: number, reason: string) => {
    // Add to retirement history
    const newRetirement: RetirementRecord = {
      id: Date.now().toString(),
      projectName: retiredCredit.projectName,
      quantity,
      retirementDate: new Date().toISOString().split('T')[0],
      certificateId: `CERT-${Date.now()}`,
      reason
    };
    setRetirementHistory(prev => [newRetirement, ...prev]);
    
    // Update owned credits
    setOwnedCredits(prev => 
      prev.map(credit => 
        credit.id === retiredCredit.id 
          ? { ...credit, quantity: credit.quantity - quantity }
          : credit
      ).filter(credit => credit.quantity > 0)
    );
    
    setIsRetirementDialogOpen(false);
    setSelectedCredit(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalOwnedCredits = ownedCredits.reduce((sum, credit) => sum + credit.quantity, 0);
  const totalRetiredCredits = retirementHistory.reduce((sum, record) => sum + record.quantity, 0);
  const portfolioValue = ownedCredits.reduce((sum, credit) => sum + (credit.quantity * credit.pricePerCredit), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carbon Credit Portfolio</h1>
          <p className="text-gray-600">Manage your carbon credit investments</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Buyer Dashboard
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Owned Credits"
          value={totalOwnedCredits.toLocaleString()}
          subtitle="Total credits in portfolio"
          trend="+12%"
        />
        <StatsCard
          title="Portfolio Value"
          value={`$${portfolioValue.toLocaleString()}`}
          subtitle="Current market value"
          trend="+8%"
        />
        <StatsCard
          title="Retired Credits"
          value={totalRetiredCredits.toLocaleString()}
          subtitle="Environmental impact"
          trend="+25%"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="history">Retirement History</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Carbon Credits</CardTitle>
              <CardDescription>
                Browse and purchase verified carbon credits from various projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {availableCredits.map((credit) => (
                  <CreditCard
                    key={credit.id}
                    credit={credit}
                    onAction={() => handlePurchase(credit)}
                    actionLabel="Purchase"
                    actionVariant="default"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Carbon Credits</CardTitle>
              <CardDescription>
                Manage your owned carbon credits and retire them for environmental impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ownedCredits.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {ownedCredits.map((credit) => (
                    <CreditCard
                      key={credit.id}
                      credit={credit}
                      onAction={() => handleRetire(credit)}
                      actionLabel="Retire"
                      actionVariant="outline"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No carbon credits in your portfolio yet.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => {
                      const tabs = document.querySelector('[value="marketplace"]') as HTMLElement;
                      tabs?.click();
                    }}
                  >
                    Browse Marketplace
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <RetirementHistory records={retirementHistory} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PurchaseDialog
        isOpen={isPurchaseDialogOpen}
        onClose={() => setIsPurchaseDialogOpen(false)}
        credit={selectedCredit}
        onPurchase={handlePurchaseComplete}
      />

      <RetirementDialog
        isOpen={isRetirementDialogOpen}
        onClose={() => setIsRetirementDialogOpen(false)}
        credit={selectedCredit}
        onRetire={handleRetirementComplete}
      />
    </div>
  );
}