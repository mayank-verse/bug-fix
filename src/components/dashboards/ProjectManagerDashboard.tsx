import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { WalletConnect } from '../WalletConnect';
import { ApiService, showApiError, showApiSuccess } from '../../utils/frontend/api-service';
import { StatsCards } from './ProjectManager/StatsCards';
import { ProjectList } from './ProjectManager/ProjectList';
import { NewProjectDialog } from './ProjectManager/NewProjectDialog';
import { MRVSubmissionDialog } from './ProjectManager/MRVSubmissionDialog';
import { 
  Project, 
  NewProjectData, 
  MRVFormData,
  EcosystemType 
} from './ProjectManager/types'; // You'll need to create this types file

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: string;
  };
}

interface ProjectManagerDashboardProps {
  user: User;
}

export function ProjectManagerDashboard({ user }: ProjectManagerDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showMRVDialog, setShowMRVDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  
  const [newProject, setNewProject] = useState<NewProjectData>({
    name: '',
    description: '',
    location: '',
    ecosystemType: 'mangrove',
    area: 0,
    coordinates: '',
    communityPartners: '',
    expectedCarbonCapture: 0
  });

  const [mrvData, setMrvData] = useState<MRVFormData>({
    projectId: '',
    satelliteData: '',
    communityReports: '',
    sensorReadings: '',
    iotData: '',
    photos: [],
    iotFiles: [],
    documents: [],
    notes: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await ApiService.getManagerProjects();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error(showApiError(error, 'Failed to load projects'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await ApiService.deleteProject(projectId);
      toast.success(showApiSuccess(`Project "${projectName}" deleted successfully`));
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(showApiError(error, 'Failed to delete project'));
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await ApiService.createProject(newProject);
      toast.success(showApiSuccess('Project registered successfully!'));
      setShowNewProjectDialog(false);
      setNewProject({
        name: '',
        description: '',
        location: '',
        ecosystemType: 'mangrove',
        area: 0,
        coordinates: '',
        communityPartners: '',
        expectedCarbonCapture: 0
      });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(showApiError(error, 'Failed to create project'));
    }
  };

  const handleSubmitMRV = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!connectedWallet) {
        toast.error('Please connect your wallet to submit MRV data with blockchain verification');
        return;
      }

      let uploadedFiles: any[] = [];

      const allFiles = [...mrvData.photos, ...mrvData.iotFiles, ...mrvData.documents];
      if (allFiles.length > 0) {
        toast.info(`Uploading ${allFiles.length} files...`);
        
        const uploadResult = await ApiService.uploadMRVFiles(mrvData.projectId, allFiles);
        uploadedFiles = uploadResult.files;
        
        const photoCount = uploadedFiles.filter((f: any) => f.category === 'photo').length;
        const iotCount = uploadedFiles.filter((f: any) => f.category === 'iot_data').length;
        const docCount = uploadedFiles.filter((f: any) => f.category === 'document').length;
        
        let message = `Successfully uploaded ${uploadedFiles.length} files`;
        if (photoCount > 0) message += ` (${photoCount} photos`;
        if (iotCount > 0) message += `${photoCount > 0 ? ', ' : ' ('}${iotCount} IoT files`;
        if (docCount > 0) message += `${(photoCount > 0 || iotCount > 0) ? ', ' : ' ('}${docCount} documents`;
        if (photoCount > 0 || iotCount > 0 || docCount > 0) message += ')';
        
        toast.success(message);
      }

      toast.info('Preparing blockchain transaction for MRV data...');

      const mrvPayload = {
        projectId: mrvData.projectId,
        rawData: {
          satelliteData: mrvData.satelliteData,
          communityReports: mrvData.communityReports,
          sensorReadings: mrvData.sensorReadings,
          iotData: mrvData.iotData,
          notes: mrvData.notes
        },
        files: uploadedFiles,
        walletAddress: connectedWallet.address,
        blockchain: {
          network: connectedWallet.network,
          chainId: connectedWallet.chainId
        }
      };

      await ApiService.submitMRVData(mrvPayload);
      toast.success(showApiSuccess('MRV data submitted successfully! Processing with ML model and blockchain verification...'));
      
      setShowMRVDialog(false);
      setMrvData({
        projectId: '',
        satelliteData: '',
        communityReports: '',
        sensorReadings: '',
        iotData: '',
        photos: [],
        iotFiles: [],
        documents: [],
        notes: ''
      });
      setConnectedWallet(null);
      fetchProjects();
    } catch (error) {
      console.error('Error submitting MRV data:', error);
      toast.error(showApiError(error, 'Failed to submit MRV data'));
    }
  };

  const handleNewProjectChange = (field: keyof NewProjectData, value: any) => {
    setNewProject(prev => ({ ...prev, [field]: value }));
  };

  const handleMrvDataChange = (field: keyof MRVFormData, value: any) => {
    setMrvData(prev => ({ ...prev, [field]: value }));
  };

  const handleWalletConnected = (wallet: any) => {
    setConnectedWallet(wallet);
    toast.success('Wallet connected! Ready for blockchain verification.');
  };

  const handleWalletDisconnected = () => {
    setConnectedWallet(null);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setMrvData(prev => ({ ...prev, projectId: project.id }));
    setShowMRVDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-gray-600">Register and manage your blue carbon projects</p>
        </div>
        <div className="flex flex-col space-y-3 items-end">
          <WalletConnect variant="button-only" className="mb-2" />
          <Button onClick={() => setShowNewProjectDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards projects={projects} />

      {/* Projects List */}
      <ProjectList 
        projects={projects} 
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
        loading={loading}
      />

      {/* New Project Dialog */}
      <NewProjectDialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
        newProject={newProject}
        onNewProjectChange={handleNewProjectChange}
        onSubmit={handleCreateProject}
      />

      {/* MRV Submission Dialog */}
      <MRVSubmissionDialog
        open={showMRVDialog}
        onOpenChange={setShowMRVDialog}
        selectedProject={selectedProject}
        mrvData={mrvData}
        onMrvDataChange={handleMrvDataChange}
        onSubmit={handleSubmitMRV}
        connectedWallet={connectedWallet}
        onWalletConnected={handleWalletConnected}
        onWalletDisconnected={handleWalletDisconnected}
      />
    </div>
  );
}