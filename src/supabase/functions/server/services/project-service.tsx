// Project Management Service
// Handles all project-related business logic

import { DatabaseRepository } from "../../../utils/database/repository.tsx";
import { Project, CreateProjectRequest } from "../../../utils/database/models.tsx";
import { AuthService } from "./auth-service.tsx";
import { AvalancheService } from "../../../utils/blockchain/avalanche-service.tsx";

export class ProjectService {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async createProject(projectData: CreateProjectRequest, managerId: string, managerInfo: any): Promise<{ projectId: string; project: Project }> {
    const projectId = DatabaseRepository.generateId('project');
    
    try {
      // Register project on Avalanche blockchain
      const blockchainRegistration = await AvalancheService.registerProject({
        id: projectId,
        name: projectData.name,
        location: projectData.location,
        ecosystemType: projectData.ecosystemType,
        area: projectData.area,
        managerId: managerId
      });

      const project: Project = {
        id: projectId,
        ...projectData,
        managerId: managerId,
        managerName: managerInfo.user_metadata?.name || 'Unknown Manager',
        managerEmail: managerInfo.email || 'N/A',
        status: 'registered',
        createdAt: new Date().toISOString(),
        onChainTxHash: blockchainRegistration.registrationTx.txHash
      };

      await DatabaseRepository.createProject(project);
      
      console.log(`✅ Project ${projectId} created and registered on blockchain: ${blockchainRegistration.registrationTx.txHash}`);
      
      return { projectId, project };
    } catch (error) {
      console.error('❌ Failed to register project on blockchain:', error);
      
      // Fallback: create project without blockchain registration
      const project: Project = {
        id: projectId,
        ...projectData,
        managerId: managerId,
        managerName: managerInfo.user_metadata?.name || 'Unknown Manager',
        managerEmail: managerInfo.email || 'N/A',
        status: 'registered',
        createdAt: new Date().toISOString(),
        onChainTxHash: undefined
      };

      await DatabaseRepository.createProject(project);
      
      console.log(`⚠️ Project ${projectId} created without blockchain registration due to error`);
      
      return { projectId, project };
    }
  }

  async getManagerProjects(managerId: string): Promise<Project[]> {
    console.log('Fetching projects for manager:', managerId);
    
    const projects = await DatabaseRepository.getProjectsByManager(managerId);
    console.log('Manager projects found:', projects.length);
    
    return projects;
  }

  async getAllProjects(): Promise<Project[]> {
    const projects = await DatabaseRepository.getAllProjects();

    // Enhance projects with manager information
    const projectsWithManagers = await Promise.all(
      projects.map(async (project) => {
        try {
          const manager = await this.authService.getUserById(project.managerId);
          const managerName = manager?.user_metadata?.name || 'Unknown Manager';
          const managerEmail = manager?.email || 'N/A';
          
          return {
            ...project,
            managerName,
            managerEmail
          };
        } catch (error) {
          console.log(`Error fetching manager info for ${project.managerId}: ${error}`);
          return {
            ...project,
            managerName: 'Unknown Manager',
            managerEmail: 'N/A'
          };
        }
      })
    );

    return projectsWithManagers;
  }

  async updateProjectStatus(projectId: string, status: Project['status']): Promise<void> {
    await DatabaseRepository.updateProject(projectId, { status });
  }

  validateProjectData(projectData: CreateProjectRequest): void {
    const requiredFields = ['name', 'description', 'location', 'ecosystemType', 'area'];
    
    for (const field of requiredFields) {
      if (!projectData[field as keyof CreateProjectRequest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (projectData.area <= 0) {
      throw new Error('Project area must be greater than 0');
    }

    const validEcosystems = ['mangrove', 'saltmarsh', 'seagrass', 'coastal_wetland'];
    if (!validEcosystems.includes(projectData.ecosystemType)) {
      throw new Error('Invalid ecosystem type');
    }
  }

  async deleteProject(projectId: string, managerId: string): Promise<void> {
    // Get the project to verify ownership and status
    const project = await DatabaseRepository.getProject(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Only the project manager who created it can delete it
    if (project.managerId !== managerId) {
      throw new Error('Access denied: You can only delete your own projects');
    }
    
    // Only allow deletion of unverified projects
    if (project.status !== 'registered') {
      throw new Error('Cannot delete project: Only unverified projects can be deleted');
    }
    
    // Delete the project from database
    await DatabaseRepository.deleteProject(projectId);
    
    console.log(`Project ${projectId} deleted by manager ${managerId}`);
  }

  // Calculate project statistics
  getProjectStats(projects: Project[]) {
    return {
      total: projects.length,
      byStatus: projects.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byEcosystem: projects.reduce((acc, project) => {
        acc[project.ecosystemType] = (acc[project.ecosystemType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalArea: projects.reduce((sum, project) => sum + project.area, 0),
      totalExpectedCapture: projects.reduce((sum, project) => sum + (project.expectedCarbonCapture || 0), 0)
    };
  }
}