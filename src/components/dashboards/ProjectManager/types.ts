export interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: string;
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
  onChainTxHash?: string;
}

export interface MRVData {
  id: string;
  projectId: string;
  status: string;
  submittedAt: string;
  mlResults?: {
    carbon_estimate: number;
    biomass_health_score: number;
    evidenceCid: string;
  };
}

export interface ProjectManagerDashboardProps {
  user: User;
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