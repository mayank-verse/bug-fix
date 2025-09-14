export interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: string;
  };
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
}

export interface Retirement {
  id: string;
  amount: number;
  reason: string;
  retiredAt: string;
  onChainTxHash?: string;
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
  managerName: string;
  managerEmail: string;
  coordinates?: string;
  communityPartners?: string;
  expectedCarbonCapture?: number;
}

export interface MRVData {
  id: string;
  projectId: string;
  managerId: string;
  rawData: {
    satelliteData: string;
    communityReports: string;
    sensorReadings: string;
    notes: string;
  };
  files: Array<{ name: string; size: number; type: string }>;
  status: string;
  submittedAt: string;
  mlResults: {
    carbon_estimate: number;
    biomass_health_score: number;
    evidenceCid: string;
  };
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface NCCRVerifierDashboardProps {
  user: User;
}

// Helper function types
export type GetHealthScoreColor = (score: number) => string;
export type GetHealthScoreLabel = (score: number) => string;
export type GetStatusColor = (status: string) => string;
export type FormatDate = (dateString: string) => string;
export type FormatSimpleDate = (dateString: string) => string;