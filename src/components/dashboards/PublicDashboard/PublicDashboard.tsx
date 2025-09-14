import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { ApiService, showApiError } from '../../../utils/frontend/api-service';
import { Waves, TreePine, Award, ExternalLink, MapPin, Calendar, Leaf, RefreshCw, AlertCircle, Server } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../../../utils/supabase/info';

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  ecosystemType: string;
  area: number;
  status: string;
  createdAt: string;
  onChainTxHash?: string;
}

interface PublicStats {
  totalCreditsIssued: number;
  totalCreditsRetired: number;
  totalProjects: number;
  projects: Project[];
}

export function PublicDashboard() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Mock data for demonstration when server is not available
  const mockStats: PublicStats = {
    totalCreditsIssued: 12500,
    totalCreditsRetired: 8500,
    totalProjects: 8,
    projects: [
      {
        id: '1',
        name: 'Sundarbans Mangrove Conservation',
        description: 'Protection and restoration of mangrove forests in the Sundarbans delta',
        location: 'West Bengal',
        ecosystemType: 'Mangrove',
        area: 2500,
        status: 'approved',
        createdAt: '2023-05-15T00:00:00Z',
        onChainTxHash: '0x1234567890abcdef'
      },
      {
        id: '2',
        name: 'Goa Seagrass Preservation',
        description: 'Conservation of seagrass meadows along the Goa coastline',
        location: 'Goa',
        ecosystemType: 'Seagrass',
        area: 1200,
        status: 'mrv_submitted',
        createdAt: '2023-08-22T00:00:00Z'
      }
    ]
  };

  useEffect(() => {
    fetchPublicStats();
  }, [retryCount]);

  const fetchPublicStats = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      
      // First try the primary endpoint
      let apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb/public/stats`;
      console.log('Trying to fetch from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Public stats data:', data);
      setStats(data);
      
    } catch (error) {
      console.error('Error fetching from primary endpoint:', error);
      
      // Try fallback endpoint (common Supabase Edge Functions pattern)
      try {
        const fallbackUrl = `https://${projectId}.supabase.co/functions/v1/public/stats`;
        console.log('Trying fallback endpoint:', fallbackUrl);
        
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          console.log('Success with fallback endpoint:', data);
          setStats(data);
          toast.success('Connected to server using fallback endpoint');
          return;
        }
      } catch (fallbackError) {
        console.error('Fallback endpoint also failed:', fallbackError);
      }
      
      // If both endpoints fail, show connection error and use mock data for demo
      setConnectionError(true);
      setStats(mockStats); // Use mock data for demonstration
      toast.error('Server connection failed. Showing demo data.', {
        description: 'The application will use real data when the server is available.',
        duration: 5000
      });
      
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    toast.info('Retrying server connection...');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Connection Status Banner */}
      {connectionError && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            <div>
              <p className="font-medium">Server Connection Issue</p>
              <p>Cannot connect to the backend server. Showing demo data.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg text-white">
        <h2 className="text-3xl font-bold mb-4">India's Blue Carbon Future</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Protecting coastal ecosystems while generating verified carbon credits 
          through transparent, blockchain-powered monitoring and verification.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits Issued</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {stats?.totalCreditsIssued.toLocaleString()} tCO₂e
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Verified carbon sequestration
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Retired</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {stats?.totalCreditsRetired.toLocaleString()} tCO₂e
            </div>
            <p className="text-xs text-green-600 mt-1">
              Permanently offset emissions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TreePine className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">
              {stats?.totalProjects || 0}
            </div>
            <p className="text-xs text-teal-600 mt-1">
              Coastal ecosystem projects
            </p>
            {connectionError && (
              <p className="text-xs text-amber-600 mt-1 flex items-center">
                <Server className="h-3 w-3 mr-1" />
                Demo data
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rest of your component remains the same */}
      {/* Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Waves className="h-5 w-5 text-blue-600" />
            <span>Environmental Impact</span>
          </CardTitle>
          <CardDescription>
            Our blue carbon projects are making a measurable difference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {Math.round((stats?.totalCreditsIssued || 0) * 2.5).toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">Hectares Protected</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {Math.round((stats?.totalCreditsIssued || 0) * 0.4).toLocaleString()}
              </div>
              <div className="text-sm text-green-600">Trees Equivalent</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-700">
                {Math.round((stats?.totalCreditsIssued || 0) * 1.2).toLocaleString()}
              </div>
              <div className="text-sm text-teal-600">Tonnes Biomass</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {Math.round((stats?.totalCreditsRetired || 0) * 0.22).toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">Cars Off Road (yearly)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TreePine className="h-5 w-5 text-green-600" />
            <span>Registered Projects</span>
          </CardTitle>
          <CardDescription>
            Explore blue carbon projects across India's coastal regions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!stats?.projects || stats.projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TreePine className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects registered yet</p>
              <p className="text-sm mt-2">Be the first to register a blue carbon project!</p>
            </div>
          ) : (
            <>
              {connectionError && (
                <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-amber-700">Showing demo project data</span>
                  </div>
                </div>
              )}
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {stats.projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                          </div>
                        </div>
                        
                        {project.onChainTxHash && (
                          <Button variant="outline" size="sm" className="ml-4">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Chain
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Join the Blue Carbon Movement</h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Whether you're a coastal community, project developer, or corporate buyer, 
              help us build a transparent and sustainable blue carbon economy for India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Register a Project
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                Become a Buyer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}