import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Shield } from 'lucide-react';
import { WalletConnect } from '../WalletConnect';
import { toast } from 'sonner';
import { projectId } from '../../utils/supabase/info';
import { supabase } from '../../utils/supabase/client';

// Import sub-components
import { StatsCards } from '../dashboards/NCCRVerifier/StatsCards';
import { ProjectList } from '../dashboards/NCCRVerifier/ProjectList';
import { MRVList } from '../dashboards/NCCRVerifier/MRVList';
import { VerificationDialog } from '../dashboards/NCCRVerifier/VerificationDialog';
import { ProjectDialog } from '../dashboards/NCCRVerifier/ProjectDialog';

// Import types
import { User, Project, MRVData } from '../../types/dashboard';

// Import utils
import { 
  getHealthScoreColor, 
  getHealthScoreLabel, 
  getStatusColor, 
  formatDate, 
  formatSimpleDate 
} from '../../utils/dashboardUtils';

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

  // Calculate stats for StatsCards
  const highQualityCount = pendingMrv.filter(mrv => mrv.mlResults?.biomass_health_score >= 0.8).length;
  const needsReviewCount = pendingMrv.filter(mrv => mrv.mlResults?.biomass_health_score < 0.6).length;
  const totalCredits = pendingMrv.reduce((sum, mrv) => sum + (mrv.mlResults?.carbon_estimate || 0), 0);

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
      <StatsCards
        projectsCount={projects.length}
        pendingMrvCount={pendingMrv.length}
        highQualityCount={highQualityCount}
        needsReviewCount={needsReviewCount}
        totalCredits={totalCredits}
      />

      {/* Registered Projects */}
      <Card>
        <CardHeader>
          <CardTitle>All Registered Projects</CardTitle>
          <CardDescription>
            Overview of all blue carbon projects in the registry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectList
            projects={projects}
            projectsLoading={projectsLoading}
            onProjectSelect={setSelectedProject}
            getStatusColor={getStatusColor}
            formatSimpleDate={formatSimpleDate}
          />
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
          <MRVList
            pendingMrv={pendingMrv}
            onReview={(mrv) => {
              setSelectedMrv(mrv);
              setVerificationNotes('');
              setShowVerificationDialog(true);
            }}
            onReject={(mrv) => {
              setSelectedMrv(mrv);
              setVerificationNotes('');
              handleVerification(mrv.id, false);
            }}
            onApprove={(mrv) => {
              setSelectedMrv(mrv);
              setVerificationNotes('Approved based on ML analysis and data quality assessment.');
              handleVerification(mrv.id, true);
            }}
            formatDate={formatDate}
            getHealthScoreColor={getHealthScoreColor}
            getHealthScoreLabel={getHealthScoreLabel}
          />
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        selectedMrv={selectedMrv}
        verificationNotes={verificationNotes}
        onVerificationNotesChange={setVerificationNotes}
        onReject={(mrvId) => handleVerification(mrvId, false)}
        onApprove={(mrvId) => handleVerification(mrvId, true)}
        formatDate={formatDate}
        getHealthScoreColor={getHealthScoreColor}
      />

      {/* Project Dialog */}
      <ProjectDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        selectedProject={selectedProject}
        formatSimpleDate={formatSimpleDate}
      />
    </div>
  );
}