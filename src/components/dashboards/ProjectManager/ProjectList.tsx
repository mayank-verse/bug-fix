import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { MapPin, TreePine, Calendar, Upload, FileText, Trash2 } from 'lucide-react';

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

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string, projectName: string) => void;
  loading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'registered':
      return 'bg-blue-100 text-blue-800';
    case 'mrv_submitted':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function ProjectList({ projects, onSelectProject, onDeleteProject, loading = false }: ProjectListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>
            Manage your registered blue carbon projects and submit MRV data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects registered yet</p>
            <p className="text-sm mt-2">Create your first blue carbon project to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Projects</CardTitle>
        <CardDescription>
          Manage your registered blue carbon projects and submit MRV data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{project.name}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{project.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                      <span>{formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Area:</strong> {project.area.toLocaleString()} hectares
                    {project.onChainTxHash && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                          On Avalanche Blockchain
                        </span>
                        <code className="text-xs text-gray-500 font-mono">
                          {project.onChainTxHash.slice(0, 10)}...
                        </code>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {project.status === 'registered' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectProject(project)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit MRV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDeleteProject(project.id, project.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}