// ML Service
// Handles AI/ML model operations on the backend

import { DatabaseRepository } from '../../utils/database/repository.tsx';
import { MLVerificationService } from '../../utils/ai/verification-service.tsx';
import { MLVerification, Project } from '../../utils/database/models.tsx';

export class MLService {
  async verifyProject(projectId: string, projectData: Project, verifierId: string): Promise<MLVerification> {
    console.log(`Starting ML verification for project ${projectId}`);
    
    try {
      // Run ML verification using the verification service
      const verificationResult = await MLVerificationService.verifyProject(projectData);
      
      const verification: MLVerification = {
        id: DatabaseRepository.generateId('ml_verification'),
        projectId,
        verifierId,
        riskScore: verificationResult.riskScore.score,
        confidence: verificationResult.riskScore.confidence,
        riskFactors: verificationResult.riskScore.riskFactors,
        recommendation: verificationResult.riskScore.recommendation,
        detailedAnalysis: {
          locationAnalysis: verificationResult.locationAnalysis,
          ecosystemAnalysis: verificationResult.ecosystemAnalysis,
          scalabilityAnalysis: verificationResult.scalabilityAnalysis,
          dataQualityAssessment: verificationResult.dataQualityAssessment
        },
        verifiedAt: new Date().toISOString(),
        modelVersion: verificationResult.modelVersion
      };
      
      // Store verification result
      await DatabaseRepository.createMLVerification(verification);
      
      console.log(`ML verification completed for project ${projectId}. Risk score: ${verification.riskScore}`);
      
      return verification;
    } catch (error) {
      console.error(`ML verification failed for project ${projectId}:`, error);
      throw new Error(`ML verification failed: ${error.message}`);
    }
  }

  async getVerificationResult(projectId: string): Promise<MLVerification | null> {
    return DatabaseRepository.getMLVerification(projectId);
  }

  // Get verification statistics for analytics
  async getVerificationStats(): Promise<{
    totalVerifications: number;
    avgRiskScore: number;
    verificationsByRisk: Record<string, number>;
    recentVerifications: MLVerification[];
  }> {
    // In a real implementation, this would query for all ML verifications
    // For now, we'll return mock data structure
    return {
      totalVerifications: 0,
      avgRiskScore: 0,
      verificationsByRisk: {},
      recentVerifications: []
    };
  }
}