import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Separator } from '../../ui/separator';
import { FileText, XCircle, CheckCircle, Satellite, Camera, TrendingUp } from 'lucide-react';

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

interface MRVListProps {
  pendingMrv: MRVData[];
  onReview: (mrv: MRVData) => void;
  onReject: (mrv: MRVData) => void;
  onApprove: (mrv: MRVData) => void;
  formatDate: (dateString: string) => string;
  getHealthScoreColor: (score: number) => string;
  getHealthScoreLabel: (score: number) => string;
}

export function MRVList({ 
  pendingMrv, 
  onReview, 
  onReject, 
  onApprove, 
  formatDate, 
  getHealthScoreColor, 
  getHealthScoreLabel 
}: MRVListProps) {
  if (pendingMrv.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="h-12 w-12 mx-auto mb-4 opacity-50">🛡️</div>
        <p>No pending MRV reports</p>
        <p className="text-sm mt-2">All reports have been processed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingMrv.map((mrv) => (
        <div key={mrv.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">Project ID: {mrv.projectId}</h3>
              <p className="text-sm text-gray-600">Submitted: {formatDate(mrv.submittedAt)}</p>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Pending Review
            </Badge>
          </div>

          {/* ML Analysis Results */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              ML Model Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Carbon Estimate</p>
                <p className="text-2xl font-bold text-blue-700">
                  {mrv.mlResults?.carbon_estimate || 0} tCO₂e
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Biomass Health Score</p>
                <p className={`text-2xl font-bold ${getHealthScoreColor(mrv.mlResults?.biomass_health_score || 0)}`}>
                  {((mrv.mlResults?.biomass_health_score || 0) * 100).toFixed(1)}%
                </p>
                <p className={`text-xs ${getHealthScoreColor(mrv.mlResults?.biomass_health_score || 0)}`}>
                  {getHealthScoreLabel(mrv.mlResults?.biomass_health_score || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Evidence CID</p>
                <p className="text-sm font-mono bg-white px-2 py-1 rounded break-all">
                  {mrv.mlResults?.evidenceCid || 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Health Score Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Data Quality Assessment</span>
                <span>{((mrv.mlResults?.biomass_health_score || 0) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(mrv.mlResults?.biomass_health_score || 0) * 100} 
                className="h-2"
              />
            </div>
          </div>

          {/* Raw Data Summary */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <Satellite className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Satellite Data:</span>
              <span className="text-gray-600">
                {mrv.rawData.satelliteData ? `${mrv.rawData.satelliteData.substring(0, 100)}...` : 'No data'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Community Reports:</span>
              <span className="text-gray-600">
                {mrv.rawData.communityReports ? `${mrv.rawData.communityReports.substring(0, 100)}...` : 'No data'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Camera className="h-4 w-4 text-gray-400" />
              <span className="font-medium">Supporting Files:</span>
              <span className="text-gray-600">
                {mrv.files.length} files uploaded
              </span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onReview(mrv)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Review Details
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => onReject(mrv)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(mrv)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}