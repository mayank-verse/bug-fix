import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { ScrollArea } from '../../ui/scroll-area';
import { XCircle, CheckCircle } from 'lucide-react';

interface MRVData {
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

interface VerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMrv: MRVData | null;
  verificationNotes: string;
  onVerificationNotesChange: (notes: string) => void;
  onReject: (mrvId: string) => void;
  onApprove: (mrvId: string) => void;
  formatDate: (dateString: string) => string;
  getHealthScoreColor: (score: number) => string;
}

export function VerificationDialog({
  open,
  onOpenChange,
  selectedMrv,
  verificationNotes,
  onVerificationNotesChange,
  onReject,
  onApprove,
  formatDate,
  getHealthScoreColor
}: VerificationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Review MRV Report</DialogTitle>
          <DialogDescription>
            Detailed review of monitoring, reporting, and verification data
          </DialogDescription>
        </DialogHeader>
        
        {selectedMrv && (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              {/* Project Information */}
              <div>
                <h3 className="font-semibold mb-2">Project Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>Project ID:</strong> {selectedMrv.projectId}</p>
                  <p><strong>Submitted:</strong> {formatDate(selectedMrv.submittedAt)}</p>
                  <p><strong>Status:</strong> {selectedMrv.status}</p>
                </div>
              </div>

              {/* ML Analysis */}
              <div>
                <h3 className="font-semibold mb-2">ML Model Analysis</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Carbon Sequestration Estimate</p>
                      <p className="text-xl font-bold text-blue-700">
                        {selectedMrv.mlResults?.carbon_estimate || 0} tCO₂e
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data Quality Score</p>
                      <p className={`text-xl font-bold ${getHealthScoreColor(selectedMrv.mlResults?.biomass_health_score || 0)}`}>
                        {((selectedMrv.mlResults?.biomass_health_score || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">IPFS Evidence Hash</p>
                    <p className="font-mono text-sm bg-white px-2 py-1 rounded">
                      {selectedMrv.mlResults?.evidenceCid || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Raw Data */}
              <div>
                <h3 className="font-semibold mb-2">Submitted Data</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">Satellite Data Analysis</Label>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      {selectedMrv.rawData.satelliteData || 'No satellite data provided'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Community Field Reports</Label>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      {selectedMrv.rawData.communityReports || 'No community reports provided'}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-medium">Sensor Readings</Label>
                    <div className="bg-gray-50 rounded p-3 text-sm">
                      {selectedMrv.rawData.sensorReadings || 'No sensor readings provided'}
                    </div>
                  </div>
                  
                  {selectedMrv.rawData.notes && (
                    <div>
                      <Label className="font-medium">Additional Notes</Label>
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        {selectedMrv.rawData.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Supporting Files */}
              <div>
                <h3 className="font-semibold mb-2">Supporting Files</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedMrv.files.length > 0 ? (
                    <div className="space-y-2">
                      {selectedMrv.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{file.name}</span>
                          <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No supporting files uploaded</p>
                  )}
                </div>
              </div>

              {/* Verification Notes */}
              <div>
                <Label htmlFor="verification-notes" className="font-medium">Verification Notes</Label>
                <Textarea
                  id="verification-notes"
                  placeholder="Add your verification notes and comments..."
                  value={verificationNotes}
                  onChange={(e) => onVerificationNotesChange(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
            </div>
          </ScrollArea>
        )}
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => selectedMrv && onReject(selectedMrv.id)}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => selectedMrv && onApprove(selectedMrv.id)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve & Mint Credits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}