import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { Waves, Leaf, Shield, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'buyer' as 'project_manager' | 'nccr_verifier' | 'buyer'
  });
  const [nccrEligible, setNccrEligible] = useState<boolean | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      });

      if (error) {
        toast.error(`Sign in failed: ${error.message}`);
      } else {
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const checkNCCREligibility = async (email: string) => {
    if (!email || signUpData.role !== 'nccr_verifier') {
      setNccrEligible(null);
      return;
    }

    setCheckingEligibility(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb/check-nccr-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      setNccrEligible(result.isAllowed);
      
      if (!result.isAllowed) {
        toast.warning(result.message);
      }
    } catch (error) {
      console.error('NCCR eligibility check error:', error);
      setNccrEligible(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check NCCR eligibility before proceeding
    if (signUpData.role === 'nccr_verifier' && nccrEligible !== true) {
      toast.error('Please verify your email eligibility for NCCR Verifier role first.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData)
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(`Sign up failed: ${result.error}`);
      } else {
        toast.success('Account created successfully! Please sign in.');
        // Clear form
        setSignUpData({
          email: '',
          password: '',
          name: '',
          role: 'buyer'
        });
        setNccrEligible(null);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An unexpected error occurred during sign up');
    } finally {
      setLoading(false);
    }
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 rounded-lg p-3">
            <Waves className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome to Samudra Ledger</CardTitle>
        <CardDescription>
          India's Transparent Blue Carbon Registry
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="mt-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signInData.email}
                  onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInData.password}
                  onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  placeholder="Enter your full name"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signUpData.email}
                  onChange={(e) => {
                    const email = e.target.value;
                    setSignUpData(prev => ({ ...prev, email }));
                    // Reset NCCR eligibility when email changes
                    if (signUpData.role === 'nccr_verifier') {
                      setNccrEligible(null);
                    }
                  }}
                  required
                />
                {signUpData.role === 'nccr_verifier' && signUpData.email && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => checkNCCREligibility(signUpData.email)}
                      disabled={checkingEligibility}
                      className="w-full"
                    >
                      {checkingEligibility ? 'Checking...' : 'Verify NCCR Eligibility'}
                    </Button>
                    {nccrEligible === true && (
                      <div className="flex items-center mt-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Email verified for NCCR Verifier role
                      </div>
                    )}
                    {nccrEligible === false && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Email not authorized for NCCR Verifier role
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-role">Role</Label>
                <Select value={signUpData.role} onValueChange={(value: any) => {
                  setSignUpData(prev => ({ ...prev, role: value }));
                  setNccrEligible(null); // Reset eligibility when role changes
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Buyer - Purchase & retire carbon credits</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="project_manager">
                      <div className="flex items-center space-x-2">
                        <Leaf className="h-4 w-4" />
                        <span>Project Manager - Register & manage blue carbon projects</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="nccr_verifier">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>NCCR Verifier - Verify MRV reports</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Demo Credentials:</strong> Use any email/password combination to create an account and explore the different role-based dashboards.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}