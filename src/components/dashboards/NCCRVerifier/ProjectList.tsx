import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { TreePine, MapPin, Calendar, User, Mail, Brain } from 'lucide-react';

interface Project {
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

interface ProjectListProps {
  projects: Project[];
  projectsLoading: boolean;
  onProjectSelect: (project: Project) => void;
  getStatusColor: (status: string) => string;
  formatSimpleDate: (dateString: string) => string;
}

export function ProjectList({ 
  projects, 
  projectsLoading, 
  onProjectSelect, 
  getStatusColor, 
  formatSimpleDate 
}: ProjectListProps) {
  if (projectsLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No projects registered yet</p>
        <p className="text-sm mt-2">Projects will appear here once registered by project managers</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-lg">{project.name}</h3>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-3">{project.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TreePine className="h-4 w-4 text-gray-400" />
                  <span>{project.ecosystemType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatSimpleDate(project.createdAt)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Area:</strong> {project.area.toLocaleString()} ha
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span><strong>Manager:</strong> {project.managerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{project.managerEmail}</span>
                  </div>
                </div>
                
                {project.expectedCarbonCapture && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Expected Carbon Capture:</strong> {project.expectedCarbonCapture.toLocaleString()} tCO₂e/year
                  </div>
                )}
                
                {project.communityPartners && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Community Partners:</strong> {project.communityPartners}
                  </div>
                )}
                
                {project.coordinates && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Coordinates:</strong> <span className="font-mono">{project.coordinates}</span>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onProjectSelect(project)}
                    className="flex items-center space-x-2"
                  >
                    <Brain className="h-4 w-4" />
                    <span>ML Verification</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}