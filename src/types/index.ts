export interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: 'project_manager' | 'nccr_verifier' | 'buyer';
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  ecosystemType: string;
  area: number;
  status: string;
  createdAt: string;
  managerId: string;
  managerName?: string;
  managerEmail?: string;
  coordinates?: string;
  communityPartners?: string;
  expectedCarbonCapture?: number;
  onChainTxHash?: string;
}

export interface CarbonCredit {
  id: string;
  projectId: string;
  amount: number;
  ownerId?: string;
  isRetired: boolean;
  healthScore: number;
  evidenceCid: string;
  verifiedAt: string;
  mrvId: string;
  onChainTxHash?: string;
}

export interface Retirement {
  id: string;
  creditId: string;
  buyerId: string;
  amount: number;
  reason: string;
  retiredAt: string;
  onChainTxHash?: string;
}

export interface MRVData {
  id: string;
  projectId: string;
  managerId: string;
  rawData: {
    satelliteData: string;
    communityReports: string;
    sensorReadings: string;
    iotData?: string;
    notes: string;
  };
  files: Array<{ name: string; size: number; type: string; category?: string }>;
  status: string;
  submittedAt: string;
  mlResults?: {
    carbon_estimate: number;
    biomass_health_score: number;
    evidenceCid: string;
  };
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  onChainTxHash?: string;
}

export interface MLVerification {
  projectId: string;
  mlScore: number;
  confidence: number;
  riskFactors: string[];
  recommendation: string;
  timestamp: string;
  verifierId: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  chainId: number;
}

export interface BlockchainTransaction {
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  blockNumber?: number;
  timestamp: string;
}

export type EcosystemType = "mangrove" | "saltmarsh" | "seagrass" | "coastal_wetland";

export interface NewProjectData {
  name: string;
  description: string;
  location: string;
  ecosystemType: EcosystemType;
  area: number;
  coordinates: string;
  communityPartners: string;
  expectedCarbonCapture: number;
}

export interface MRVFormData {
  projectId: string;
  satelliteData: string;
  communityReports: string;
  sensorReadings: string;
  iotData: string;
  photos: File[];
  iotFiles: File[];
  documents: File[];
  notes: string;
}