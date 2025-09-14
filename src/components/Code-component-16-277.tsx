import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Wallet, ExternalLink, AlertCircle, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { AvalancheService } from '../utils/blockchain/avalanche-service';

interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  chainId: number;
}

interface WalletConnectProps {
  onWalletConnected?: (wallet: WalletInfo) => void;
  onWalletDisconnected?: () => void;
  showBalance?: boolean;
  variant?: 'full' | 'compact' | 'button-only';
  className?: string;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      selectedAddress: string | null;
      chainId: string;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export function WalletConnect({ 
  onWalletConnected, 
  onWalletDisconnected, 
  showBalance = true,
  variant = 'full',
  className = ''
}: WalletConnectProps) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<any>(null);

  // Avalanche network configuration
  const AVALANCHE_CONFIG = {
    chainId: '0xA869', // 43113 in hex for Fuji testnet
    chainName: 'Avalanche Fuji Testnet',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://testnet.snowtrace.io/'],
  };

  useEffect(() => {
    // Initialize blockchain service
    initializeBlockchain();
    
    // Check if wallet is already connected
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          updateWalletInfo(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        window.location.reload(); // Reload to reset state on network change
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const initializeBlockchain = async () => {
    try {
      const info = await AvalancheService.initialize();
      setNetworkInfo(info.networkInfo);
    } catch (error) {
      console.error('Failed to initialize blockchain:', error);
    }
  };

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await updateWalletInfo(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const updateWalletInfo = async (address: string) => {
    try {
      const balance = await window.ethereum?.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      const chainId = await window.ethereum?.request({
        method: 'eth_chainId',
      });

      const balanceInEth = (parseInt(balance, 16) / 1e18).toFixed(4);
      const networkName = parseInt(chainId, 16) === 43113 ? 'Fuji Testnet' : 
                          parseInt(chainId, 16) === 43114 ? 'Avalanche Mainnet' : 'Unknown';

      const walletInfo: WalletInfo = {
        address,
        balance: balanceInEth,
        network: networkName,
        chainId: parseInt(chainId, 16),
      };

      setWallet(walletInfo);
      onWalletConnected?.(walletInfo);
    } catch (error) {
      console.error('Error updating wallet info:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to use wallet features.');
      return;
    }

    setConnecting(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== AVALANCHE_CONFIG.chainId) {
        try {
          // Try to switch to Avalanche network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: AVALANCHE_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [AVALANCHE_CONFIG],
            });
          } else {
            throw switchError;
          }
        }
      }

      await updateWalletInfo(accounts[0]);
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast.error(`Failed to connect wallet: ${error.message}`);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    onWalletDisconnected?.();
    toast.info('Wallet disconnected');
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.success('Address copied to clipboard');
    }
  };

  const openExplorer = () => {
    if (wallet?.address) {
      const explorerUrl = `https://testnet.snowtrace.io/address/${wallet.address}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Button-only variant
  if (variant === 'button-only') {
    return (
      <div className={className}>
        {!wallet ? (
          <Button onClick={connectWallet} disabled={connecting} variant="outline" size="sm">
            <Wallet className="h-4 w-4 mr-2" />
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <Badge variant="secondary" className="flex items-center space-x-1 px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{formatAddress(wallet.address)}</span>
          </Badge>
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          {!wallet ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">No wallet connected</span>
              </div>
              <Button onClick={connectWallet} disabled={connecting} size="sm">
                {connecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{formatAddress(wallet.address)}</span>
                {showBalance && (
                  <Badge variant="outline" className="text-xs">
                    {wallet.balance} AVAX
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={copyAddress}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={openExplorer}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant (default)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Wallet Connection</span>
        </CardTitle>
        <CardDescription>
          Connect your wallet to interact with the Avalanche blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!window.ethereum && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <div className="text-sm text-yellow-800">
              MetaMask not detected. Please install MetaMask to use wallet features.
            </div>
          </div>
        )}

        {!wallet ? (
          <div className="space-y-4">
            <Button 
              onClick={connectWallet} 
              disabled={connecting || !window.ethereum}
              className="w-full"
            >
              <Wallet className="h-4 w-4 mr-2" />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
            
            {networkInfo && (
              <div className="text-xs text-gray-500 space-y-1">
                <div>Network: {networkInfo.network}</div>
                <div>Chain ID: {networkInfo.chainId}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Wallet Connected</span>
              </div>
              <Badge variant="secondary">{wallet.network}</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Address</label>
                <div className="flex items-center justify-between mt-1">
                  <code className="text-sm font-mono">{formatAddress(wallet.address)}</code>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={copyAddress}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={openExplorer}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {showBalance && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">Balance</label>
                  <div className="text-lg font-semibold mt-1">{wallet.balance} AVAX</div>
                </div>
              )}
            </div>

            <Separator />

            <Button variant="outline" onClick={disconnectWallet} className="w-full">
              Disconnect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}