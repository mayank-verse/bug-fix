import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { ShoppingCart, Award, TrendingUp, Leaf, ExternalLink, Calendar, MapPin, CreditCard, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { WalletConnect } from './WalletConnect';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: string;
  };
}

interface CarbonCredit {
  id: string;
  projectId: string;
  carbonCredits: number;
  healthScore: number;
  evidenceCid: string;
  verifiedAt: string;
}

interface Retirement {
  id: string;
  creditId: string;
  buyerId: string;
  amount: number;
  reason: string;
  retiredAt: string;
  onChainTxHash: string;
}

interface BuyerDashboardProps {
  user: User;
}

export function BuyerDashboard({ user }: BuyerDashboardProps) {
  const [availableCredits, setAvailableCredits] = useState<CarbonCredit[]>([]);
  const [selectedCredit, setSelectedCredit] = useState<CarbonCredit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showRetirementDialog, setShowRetirementDialog] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [retirementReason, setRetirementReason] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [retirements, setRetirements] = useState<Retirement[]>([]);

  useEffect(() => {
    fetchAvailableCredits();
    // In a real implementation, you would fetch user's token balance from blockchain
    setUserBalance(Math.floor(Math.random() * 500)); // Simulated balance
  }, []);

  const fetchAvailableCredits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb/credits/available`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available credits');
      }

      const data = await response.json();
      setAvailableCredits(data.availableCredits || []);
    } catch (error) {
      console.error('Error fetching available credits:', error);
      toast.error('Failed to load available credits');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedCredit || purchaseAmount <= 0) return;

    try {
      // In a real implementation, this would interact with the blockchain
      // For now, we'll simulate the purchase
      toast.success(`Successfully purchased ${purchaseAmount} tCO₂e credits!`);
      setUserBalance(prev => prev + purchaseAmount);
      setShowPurchaseDialog(false);
      setPurchaseAmount(0);
      setSelectedCredit(null);
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast.error('Failed to purchase credits');
    }
  };

  const handleRetirement = async () => {
    if (!selectedCredit || purchaseAmount <= 0 || !retirementReason.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb/credits/retire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          creditId: selectedCredit.id,
          amount: purchaseAmount,
          reason: retirementReason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retire credits');
      }

      const data = await response.json();
      toast.success(`Successfully retired ${purchaseAmount} tCO₂e credits!`);
      setUserBalance(prev => Math.max(0, prev - purchaseAmount));
      setRetirements(prev => [data.retirement, ...prev]);
      
      // Refresh available credits to show updated amounts
      fetchAvailableCredits();
      
      setShowRetirementDialog(false);
      setPurchaseAmount(0);
      setRetirementReason('');
      setSelectedCredit(null);
    } catch (error) {
      console.error('Error retiring credits:', error);
      toast.error(`Failed to retire credits: ${error}`);
    }
  };

  const openPurchaseDialog = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setPurchaseAmount(Math.min(credit.carbonCredits, 50)); // Default to 50 or max available
    setShowPurchaseDialog(true);
  };

  const openRetirementDialog = (credit: CarbonCredit) => {
    setSelectedCredit(credit);
    setPurchaseAmount(Math.min(userBalance, 25)); // Default to 25 or user balance
    setRetirementReason('');
    setShowRetirementDialog(true);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Premium Quality';
    if (score >= 0.6) return 'Standard Quality';
    return 'Basic Quality';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            <span>Carbon Credit Marketplace</span>
          </h2>
          <p className="text-gray-600">Purchase and retire verified blue carbon credits</p>
        </div>
        <WalletConnect variant="button-only" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {userBalance.toLocaleString()} tCO₂e
            </div>
            <p className="text-xs text-green-600 mt-1">
              Available for retirement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {availableCredits.reduce((sum, credit) => sum + credit.carbonCredits, 0).toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              tCO₂e in marketplace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {availableCredits.filter(credit => credit.healthScore >= 0.8).length}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              High-quality projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retired Credits</CardTitle>
            <Leaf className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">
              {retirements.reduce((sum, retirement) => sum + retirement.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-teal-600 mt-1">
              Your offset impact
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Credits Marketplace */}
      <Card>
        <CardHeader>
          <CardTitle>Available Carbon Credits</CardTitle>
          <CardDescription>
            Purchase verified blue carbon credits from coastal restoration projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableCredits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No credits available for purchase</p>
              <p className="text-sm mt-2">Check back later for new verified projects</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCredits.map((credit) => (
                <Card key={credit.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Project {credit.projectId.slice(-8)}</CardTitle>
                      <Badge className={`${credit.healthScore >= 0.8 ? 'bg-green-100 text-green-800' : 
                        credit.healthScore >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {getHealthScoreLabel(credit.healthScore)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-700">
                        {credit.carbonCredits.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">tCO₂e Available</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Quality Score</span>
                        <span className={getHealthScoreColor(credit.healthScore)}>
                          {(credit.healthScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={credit.healthScore * 100} className="h-2" />
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Verified:</span>
                        <span>{formatDate(credit.verifiedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Evidence:</span>
                        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          IPFS
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openPurchaseDialog(credit)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => openRetirementDialog(credit)}
                      >
                        <Leaf className="h-4 w-4 mr-2" />
                        Retire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retirement History */}
      {retirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Retirement History</CardTitle>
            <CardDescription>
              View your carbon credit retirement certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {retirements.map((retirement) => (
                <div key={retirement.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {retirement.amount.toLocaleString()} tCO₂e Retired
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{retirement.reason}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Retired on {formatDate(retirement.retiredAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-2">
                        RETIRED
                      </Badge>
                      <br />
                      <Button variant="link" size="sm" className="h-auto p-0">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Certificate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Carbon Credits</DialogTitle>
            <DialogDescription>
              Purchase verified blue carbon credits from Project {selectedCredit?.projectId.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCredit && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Available Credits</p>
                    <p className="font-semibold">{selectedCredit.carbonCredits.toLocaleString()} tCO₂e</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quality Score</p>
                    <p className={`font-semibold ${getHealthScoreColor(selectedCredit.healthScore)}`}>
                      {(selectedCredit.healthScore * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase-amount">Amount to Purchase (tCO₂e)</Label>
                <Input
                  id="purchase-amount"
                  type="number"
                  min="1"
                  max={selectedCredit.carbonCredits}
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-500">
                  Maximum: {selectedCredit.carbonCredits.toLocaleString()} tCO₂e
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-yellow-800">Purchase Summary</p>
                <p className="text-yellow-700 mt-1">
                  Purchasing {purchaseAmount.toLocaleString()} tCO₂e credits
                </p>
                <p className="text-yellow-700">
                  Estimated cost: ${(purchaseAmount * 15).toLocaleString()} USD
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePurchase} disabled={purchaseAmount <= 0}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Credits
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Retirement Dialog */}
      <Dialog open={showRetirementDialog} onOpenChange={setShowRetirementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire Carbon Credits</DialogTitle>
            <DialogDescription>
              Permanently retire carbon credits to offset your emissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedCredit && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Your Balance</p>
                    <p className="font-semibold">{userBalance.toLocaleString()} tCO₂e</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Project Quality</p>
                    <p className={`font-semibold ${getHealthScoreColor(selectedCredit.healthScore)}`}>
                      {getHealthScoreLabel(selectedCredit.healthScore)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retire-amount">Amount to Retire (tCO₂e)</Label>
                <Input
                  id="retire-amount"
                  type="number"
                  min="1"
                  max={userBalance}
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-gray-500">
                  Maximum: {userBalance.toLocaleString()} tCO₂e
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retirement-reason">Reason for Retirement</Label>
                <Textarea
                  id="retirement-reason"
                  placeholder="e.g., Offsetting corporate emissions for Q4 2024"
                  value={retirementReason}
                  onChange={(e) => setRetirementReason(e.target.value)}
                  required
                />
              </div>

              <div className="bg-red-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-red-800">⚠️ Permanent Action</p>
                <p className="text-red-700 mt-1">
                  Retiring {purchaseAmount.toLocaleString()} tCO₂e credits will permanently remove them from circulation.
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowRetirementDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRetirement} 
                  disabled={purchaseAmount <= 0 || !retirementReason.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Leaf className="h-4 w-4 mr-2" />
                  Retire Credits
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}