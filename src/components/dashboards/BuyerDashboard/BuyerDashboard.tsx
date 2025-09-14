import React, { useState, useEffect } from 'react';
import { Leaf, Wallet, Award, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { StatsCard } from './StatsCard';
import { CreditCard } from './CreditCard';
import { PurchaseDialog } from './PurchaseDialog';
import { RetirementDialog } from './RetirementDialog';
import { RetirementHistory } from './RetirementHistory';
import { CarbonCredit, Retirement } from '../../../types';

export function BuyerDashboard() {
  const [availableCredits, setAvailableCredits] = useState<CarbonCredit[]>([]);
  const [ownedCredits, setOwnedCredits] = useState<CarbonCredit[]>([]);
  const [retirementHistory, setRetirementHistory] = useState<Retirement[]>([]);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isRetirementDialogOpen, setIsRetirementDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
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
          projectId: 'proj-1',
          amount: 1000,
          ownerId: undefined,
          isRetired: false,
          healthScore: 0.95,
          evidenceCid: 'QmSolarFarmEvidence123',
          verifiedAt: '2023-12-01T10:00:00Z',
          mrvId: 'mrv-solar-1'
        },
        {
          id: '2',
          projectId: 'proj-2',
          amount: 500,
          ownerId: undefined,
          isRetired: false,
          healthScore: 0.88,
          evidenceCid: 'QmWindEnergyEvidence456',
          verifiedAt: '2023-11-15T14:30:00Z',
          mrvId: 'mrv-wind-1'
        }
      ]);

      setOwnedCredits([
        {
          id: '3',
          projectId: 'proj-3',
          amount: 250,
          ownerId: 'user-123',
          isRetired: false,
          healthScore: 0.92,
          evidenceCid: 'QmForestConservationEvidence789',
          verifiedAt: '2022-10-20T09:15:00Z',
          mrvId: 'mrv-forest-1'
        }
      ]);

      setRetirementHistory([
        {
          id: '1',
          creditId: 'credit-retired-1',
          buyerId: 'user-123',
          amount: 100,
          reason: 'Corporate sustainability goals',
          retiredAt: '2023-12-01T16:45:00Z'
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setIsPurchaseDialogOpen(true);
  };

  const handleRetire = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setIsRetirementDialogOpen(true);
  };

  const handlePurchaseComplete = (purchasedCredit: CarbonCredit, quantity: number) => {
    // Update owned credits
    const newCredit = { ...purchasedCredit, amount: quantity, ownerId: 'user-123' };
    setOwnedCredits(prev => [...prev, newCredit]);
    
    // Update available credits
    setAvailableCredits(prev => 
      prev.map(credit => 
        credit.id === purchasedCredit.id 
          ? { ...credit, amount: credit.amount - quantity }
          : credit
      ).filter(credit => credit.amount > 0)
    );
    
    setIsPurchaseDialogOpen(false);
    setSelectedCredit(null);
  };

  const handleRetirementComplete = (retiredCredit: CarbonCredit, quantity: number, reason: string) => {
    // Add to retirement history
    const newRetirement: Retirement = {
      id: Date.now().toString(),
      creditId: retiredCredit.id,
      buyerId: 'user-123',
      amount: quantity,
      reason,
      retiredAt: new Date().toISOString()
    };
    setRetirementHistory(prev => [newRetirement, ...prev]);
    
    // Update owned credits
    setOwnedCredits(prev => 
      prev.map(credit => 
        credit.id === retiredCredit.id 
          ? { ...credit, amount: credit.amount - quantity }
          : credit
      ).filter(credit => credit.amount > 0)
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

  const totalOwnedCredits = ownedCredits.reduce((sum, credit) => sum + credit.amount, 0);
  const totalRetiredCredits = retirementHistory.reduce((sum, record) => sum + record.amount, 0);
  const portfolioValue = ownedCredits.reduce((sum, credit) => sum + (credit.amount * 25), 0); // Using fixed price for demo

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
          icon={Leaf}
          title="Owned Credits"
          value={totalOwnedCredits}
          unit="credits"
        />
        <StatsCard
          icon={Wallet}
          title="Portfolio Value"
          value={portfolioValue}
          unit="USD"
        />
        <StatsCard
          icon={Award}
          title="Retired Credits"
          value={totalRetiredCredits}
          unit="credits"
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
                    actionIcon={ShoppingCart}
                    actionClass="bg-blue-600 hover:bg-blue-700 text-white"
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
                     actionIcon={Leaf}
                     actionClass="border-green-600 text-green-600 hover:bg-green-50"
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
          <RetirementHistory retirements={retirementHistory} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <PurchaseDialog
        open={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
        credit={selectedCredit}
        onPurchase={handlePurchaseComplete}
      />

      <RetirementDialog
        open={isRetirementDialogOpen}
        onOpenChange={setIsRetirementDialogOpen}
        credit={selectedCredit}
        onRetire={handleRetirementComplete}
      />
    </div>
  );
}