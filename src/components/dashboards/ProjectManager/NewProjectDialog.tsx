import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

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

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newProject: NewProjectData;
  onNewProjectChange: (field: keyof NewProjectData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NewProjectDialog({
  open,
  onOpenChange,
  newProject,
  onNewProjectChange,
  onSubmit
}: NewProjectDialogProps) {
  const handleChange = (field: keyof NewProjectData, value: any) => {
    onNewProjectChange(field, value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Register New Blue Carbon Project</DialogTitle>
          <DialogDescription>
            Provide details about your coastal ecosystem restoration project
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={newProject.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Sundarbans, West Bengal"
                value={newProject.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your project objectives and methods"
              value={newProject.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ecosystem">Ecosystem Type</Label>
              <Select 
                value={newProject.ecosystemType} 
                onValueChange={(value) => handleChange('ecosystemType', value as EcosystemType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mangrove">Mangrove Forest</SelectItem>
                  <SelectItem value="saltmarsh">Salt Marsh</SelectItem>
                  <SelectItem value="seagrass">Seagrass Bed</SelectItem>
                  <SelectItem value="coastal_wetland">Coastal Wetland</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area">Area (hectares)</Label>
              <Input
                id="area"
                type="number"
                value={newProject.area}
                onChange={(e) => handleChange('area', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coordinates">GPS Coordinates</Label>
              <Input
                id="coordinates"
                placeholder="e.g., 22.3511, 88.2650"
                value={newProject.coordinates}
                onChange={(e) => handleChange('coordinates', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedCarbon">Expected Carbon Capture (tCO₂e/year)</Label>
              <Input
                id="expectedCarbon"
                type="number"
                value={newProject.expectedCarbonCapture}
                onChange={(e) => handleChange('expectedCarbonCapture', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partners">Community Partners</Label>
            <Input
              id="partners"
              placeholder="Local communities and organizations involved"
              value={newProject.communityPartners}
              onChange={(e) => handleChange('communityPartners', e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Register Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}