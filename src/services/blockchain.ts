// Avalanche Blockchain Service
export interface BlockchainTransaction {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  blockNumber?: number;
  timestamp: string;
}

export class AvalancheService {
  private static readonly TESTNET_CHAIN_ID = 43113;
  private static readonly TESTNET_RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
  private static isTestnet = true;

  static async initialize() {
    try {
      const response = await fetch(this.TESTNET_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        })
      });
      
      const result = await response.json();
      const networkChainId = parseInt(result.result, 16);
      
      return {
        success: true,
        networkInfo: {
          chainId: networkChainId,
          network: 'Fuji Testnet',
          rpcUrl: this.TESTNET_RPC_URL
        }
      };
    } catch (error) {
      console.error('Failed to initialize Avalanche blockchain:', error);
      return { success: false, networkInfo: null };
    }
  }

  static async getTransactionStatus(txHash: string): Promise<BlockchainTransaction | null> {
    try {
      const response = await fetch(this.TESTNET_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionReceipt',
          params: [txHash],
          id: 1
        })
      });
      
      const result = await response.json();
      
      if (result.result) {
        return {
          txHash,
          status: result.result.status === '0x1' ? 'confirmed' : 'failed',
          gasUsed: parseInt(result.result.gasUsed, 16),
          blockNumber: parseInt(result.result.blockNumber, 16),
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        txHash,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return null;
    }
  }

  static getExplorerUrl(txHash: string): string {
    return `https://testnet.snowtrace.io/tx/${txHash}`;
  }

  static getNetworkInfo() {
    return {
      name: 'Avalanche Fuji Testnet',
      chainId: this.TESTNET_CHAIN_ID,
      rpcUrl: this.TESTNET_RPC_URL,
      explorer: 'https://testnet.snowtrace.io',
      isTestnet: this.isTestnet
    };
  }
}