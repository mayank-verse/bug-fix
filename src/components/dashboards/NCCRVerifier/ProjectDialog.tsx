import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { Brain } from 'lucide-react';
import { MLVerificationPanel } from '../../MLVerificationPanel';

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

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: Project | null;
  formatSimpleDate: (dateString: string) => string;
}

export function ProjectDialog({
  open,
  onOpenChange,
  selectedProject,
  formatSimpleDate
}: ProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Project Analysis & ML Verification</span>
          </DialogTitle>
          <DialogDescription>
            Comprehensive project analysis using AI/ML models for blue carbon verification
          </DialogDescription>
        </DialogHeader>
        
        {selectedProject && (
          <ScrollArea className="max-h-[75vh]">
            <div className="space-y-6 pr-4">
              {/* Project Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedProject.name}</span>
                    <Badge variant={selectedProject.status === 'approved' ? 'default' : 
                                  selectedProject.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {selectedProject.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{selectedProject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{selectedProject.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm capitalize">{selectedProject.ecosystemType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{formatSimpleDate(selectedProject.createdAt)}</span>
                    </div>
                    <div className="text-sm">
                      <strong>Area:</strong> {selectedProject.area.toLocaleString()} ha
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Project Manager</p>
                      <p className="text-sm">{selectedProject.managerName}</p>
                      <p className="text-xs text-gray-500">{selectedProject.managerEmail}</p>
                    </div>
                    {selectedProject.expectedCarbonCapture && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Expected Carbon Capture</p>
                        <p className="text-sm">{selectedProject.expectedCarbonCapture.toLocaleString()} tCO₂e/year</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ML Verification Panel */}
              <MLVerificationPanel 
                project={selectedProject}
                onVerificationComplete={() => {
                  console.log('ML verification completed for project:', selectedProject.id);
                }}
              />
            </div>
          </ScrollArea>
        )}
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}