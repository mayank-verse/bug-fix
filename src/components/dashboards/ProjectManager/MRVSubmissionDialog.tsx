import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { Badge } from '../../ui/badge';
import { Camera, Database, FileText, FileImage } from 'lucide-react';
import { WalletConnect } from '../../WalletConnect';

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

interface MRVSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: Project | null;
  mrvData: MRVFormData;
  onMrvDataChange: (field: keyof MRVFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  connectedWallet: any;
  onWalletConnected: (wallet: any) => void;
  onWalletDisconnected: () => void;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'heic':
      return <FileImage className="h-3 w-3 text-blue-500" />;
    case 'csv':
    case 'json':
    case 'xml':
    case 'txt':
    case 'log':
      return <Database className="h-3 w-3 text-green-500" />;
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'xlsx':
    case 'xls':
      return <FileText className="h-3 w-3 text-purple-500" />;
    default:
      return <FileText className="h-3 w-3 text-gray-500" />;
  }
};

export function MRVSubmissionDialog({
  open,
  onOpenChange,
  selectedProject,
  mrvData,
  onMrvDataChange,
  onSubmit,
  connectedWallet,
  onWalletConnected,
  onWalletDisconnected
}: MRVSubmissionDialogProps) {
  const handleChange = (field: keyof MRVFormData, value: any) => {
    onMrvDataChange(field, value);
  };

  const handleFileChange = (field: 'photos' | 'iotFiles' | 'documents', files: FileList | null) => {
    if (files) {
      onMrvDataChange(field, Array.from(files));
    }
  };

  const removeFile = (field: 'photos' | 'iotFiles' | 'documents', index: number) => {
    const currentFiles = [...mrvData[field]];
    currentFiles.splice(index, 1);
    onMrvDataChange(field, currentFiles);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Submit MRV Data</DialogTitle>
          <DialogDescription>
            Upload monitoring, reporting, and verification data for {selectedProject?.name}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-1">
          <form id="mrv-form" onSubmit={onSubmit} className="space-y-4 pr-4">
            <div className="space-y-2">
              <Label htmlFor="satellite">Satellite Data Analysis</Label>
              <Textarea
                id="satellite"
                placeholder="NDVI values, biomass estimates, canopy cover changes..."
                value={mrvData.satelliteData}
                onChange={(e) => handleChange('satelliteData', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="community">Community Reports</Label>
              <Textarea
                id="community"
                placeholder="Field observations, species counts, restoration activities..."
                value={mrvData.communityReports}
                onChange={(e) => handleChange('communityReports', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sensors">Sensor Readings</Label>
              <Textarea
                id="sensors"
                placeholder="Water quality, soil carbon, temperature, salinity data..."
                value={mrvData.sensorReadings}
                onChange={(e) => handleChange('sensorReadings', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="iot">IoT Device Data & Analysis</Label>
              <Textarea
                id="iot"
                placeholder="Smart sensor networks, automated monitoring data, device logs, connectivity reports..."
                value={mrvData.iotData}
                onChange={(e) => handleChange('iotData', e.target.value)}
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">File Uploads</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Upload supporting files organized by category for better verification
                </p>
              </div>
              
              {/* Photos Upload */}
              <div className="space-y-2">
                <Label htmlFor="photos" className="flex items-center space-x-2">
                  <Camera className="h-4 w-4 text-blue-600" />
                  <span>Project Photos</span>
                </Label>
                <Input
                  id="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileChange('photos', e.target.files)}
                />
                <p className="text-xs text-gray-500">
                  Site photos, before/after images, ecosystem monitoring photos (JPG, PNG, HEIC)
                </p>
                {mrvData.photos.length > 0 && (
                  <div className="border rounded-lg p-3 bg-blue-50/50">
                    <div className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-1">
                      <Camera className="h-4 w-4" />
                      <span>{mrvData.photos.length} photos selected</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {mrvData.photos.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-white rounded p-2">
                          <div className="flex items-center space-x-1 truncate">
                            {getFileIcon(file.name)}
                            <span className="truncate">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFile('photos', index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* IoT Files Upload */}
              <div className="space-y-2">
                <Label htmlFor="iotFiles" className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <span>IoT Device Data Files</span>
                </Label>
                <Input
                  id="iotFiles"
                  type="file"
                  multiple
                  accept=".csv,.json,.xml,.txt,.log"
                  onChange={(e) => handleFileChange('iotFiles', e.target.files)}
                />
                <p className="text-xs text-gray-500">
                  Sensor data exports, device logs, telemetry data (CSV, JSON, XML, TXT, LOG)
                </p>
                {mrvData.iotFiles.length > 0 && (
                  <div className="border rounded-lg p-3 bg-green-50/50">
                    <div className="text-sm font-medium text-green-800 mb-2 flex items-center space-x-1">
                      <Database className="h-4 w-4" />
                      <span>{mrvData.iotFiles.length} IoT data files selected</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {mrvData.iotFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-white rounded p-2">
                          <div className="flex items-center space-x-1 truncate">
                            {getFileIcon(file.name)}
                            <span className="truncate">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFile('iotFiles', index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Documents Upload */}
              <div className="space-y-2">
                <Label htmlFor="documents" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span>Reports & Documentation</span>
                </Label>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xlsx,.xls"
                  onChange={(e) => handleFileChange('documents', e.target.files)}
                />
                <p className="text-xs text-gray-500">
                  Research reports, analysis documents, spreadsheets (PDF, DOC, DOCX, XLSX)
                </p>
                {mrvData.documents.length > 0 && (
                  <div className="border rounded-lg p-3 bg-purple-50/50">
                    <div className="text-sm font-medium text-purple-800 mb-2 flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{mrvData.documents.length} documents selected</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {mrvData.documents.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-white rounded p-2">
                          <div className="flex items-center space-x-1 truncate">
                            {getFileIcon(file.name)}
                            <span className="truncate">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFile('documents', index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Summary */}
              {(mrvData.photos.length > 0 || mrvData.iotFiles.length > 0 || mrvData.documents.length > 0) && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-sm font-medium mb-2">Upload Summary</div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{mrvData.photos.length}</div>
                      <div className="text-gray-600">Photos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{mrvData.iotFiles.length}</div>
                      <div className="text-gray-600">IoT Files</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">{mrvData.documents.length}</div>
                      <div className="text-gray-600">Documents</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 text-center">
                    Total: {[...mrvData.photos, ...mrvData.iotFiles, ...mrvData.documents].length} files, {([...mrvData.photos, ...mrvData.iotFiles, ...mrvData.documents].reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional context or observations..."
                value={mrvData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Blockchain Transaction</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your wallet to sign blockchain transactions for this MRV submission
                </p>
              </div>
              
              <WalletConnect 
                variant="compact" 
                showBalance={true}
                onWalletConnected={onWalletConnected}
                onWalletDisconnected={onWalletDisconnected}
              />
            </div>
            
            </form>
        </ScrollArea>
        
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-sm">
              {connectedWallet ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Wallet connected - Blockchain ready</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-orange-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Connect wallet for blockchain verification</span>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="mrv-form" disabled={!connectedWallet}>
                Submit MRV Data
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}