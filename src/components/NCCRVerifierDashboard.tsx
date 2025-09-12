import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { projectId } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { Shield, CheckCircle, XCircle, Clock, FileText, Camera, Satellite, TrendingUp, AlertTriangle, TreePine, MapPin, Calendar, User, Mail, Brain } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { MLVerificationPanel } from './MLVerificationPanel';
import { WalletConnect } from './WalletConnect';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: string;
  };
}

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

interface NCCRVerifierDashboardProps {
  user: User;
}

export function NCCRVerifierDashboard({ user }: NCCRVerifierDashboardProps) {
  const [pendingMrv, setPendingMrv] = useState<MRVData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedMrv, setSelectedMrv] = useState<MRVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchPendingMRV();
    fetchAllProjects();
  }, []);

  const fetchPendingMRV = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb/mrv/pending`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending MRV reports');
      }

      const data = await response.json();
      setPendingMrv(data.pendingMrv || []);
    } catch (error) {
      console.error('Error fetching pending MRV:', error);
      toast.error('Failed to load pending MRV reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb/projects/all`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleVerification = async (mrvId: string, approved: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb/mrv/${mrvId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          approved,
          notes: verificationNotes
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process verification');
      }

      const result = await response.json();
      
      if (approved) {
        toast.success(`MRV report approved! ${result.mrvData.mlResults.carbon_estimate} tCO₂e credits will be minted.`);
      } else {
        toast.success('MRV report rejected with feedback.');
      }

      setShowVerificationDialog(false);
      setVerificationNotes('');
      setSelectedMrv(null);
      fetchPendingMRV();
    } catch (error) {
      console.error('Error processing verification:', error);
      toast.error(`Failed to process verification: ${error}`);
    }
  };

  const openVerificationDialog = (mrv: MRVData) => {
    setSelectedMrv(mrv);
    setVerificationNotes('');
    setShowVerificationDialog(true);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Needs Review';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const formatSimpleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && projectsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>NCCR Verification</span>
          </h2>
          <p className="text-gray-600">Review and verify MRV reports for carbon credit issuance</p>
        </div>
        <WalletConnect variant="button-only" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <TreePine className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {projects.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingMrv.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Quality Reports</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pendingMrv.filter(mrv => mrv.mlResults?.biomass_health_score >= 0.8).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingMrv.filter(mrv => mrv.mlResults?.biomass_health_score < 0.6).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pendingMrv.reduce((sum, mrv) => sum + (mrv.mlResults?.carbon_estimate || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">tCO₂e pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Registered Projects */}
      <Card>
        <CardHeader>
          <CardTitle>All Registered Projects</CardTitle>
          <CardDescription>
            Overview of all blue carbon projects in the registry
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects registered yet</p>
              <p className="text-sm mt-2">Projects will appear here once registered by project managers</p>
            </div>
          ) : (
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
                            onClick={() => {
                              setSelectedProject(project);
                              setShowProjectDialog(true);
                            }}
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
          )}
        </CardContent>
      </Card>

      {/* Pending MRV Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Pending MRV Reports</CardTitle>
          <CardDescription>
            Review ML-processed monitoring data and approve carbon credit issuance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingMrv.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending MRV reports</p>
              <p className="text-sm mt-2">All reports have been processed</p>
            </div>
          ) : (
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
                      onClick={() => openVerificationDialog(mrv)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Review Details
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        setSelectedMrv(mrv);
                        setVerificationNotes('');
                        handleVerification(mrv.id, false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setSelectedMrv(mrv);
                        setVerificationNotes('Approved based on ML analysis and data quality assessment.');
                        handleVerification(mrv.id, true);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
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
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => selectedMrv && handleVerification(selectedMrv.id, false)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedMrv && handleVerification(selectedMrv.id, true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Mint Credits
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog with ML Verification */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
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
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedProject.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TreePine className="h-4 w-4 text-gray-400" />
                        <span className="text-sm capitalize">{selectedProject.ecosystemType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
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
                    // Optionally refresh data or show success message
                    console.log('ML verification completed for project:', selectedProject.id);
                  }}
                />
              </div>
            </ScrollArea>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowProjectDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}