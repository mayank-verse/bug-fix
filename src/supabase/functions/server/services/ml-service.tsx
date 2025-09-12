// Machine Learning Verification Service
// Handles AI/ML model operations on the backend

import { DatabaseRepository } from "../../../utils/database/repository.tsx";
import { MLVerificationService } from "../../../utils/ai/verification-service.tsx";
import { MLVerification, Project } from "../../../utils/database/models.tsx";

export class MLService {
  async verifyProject(projectId: string, projectData: Project, verifierId: string): Promise<MLVerification> {
    console.log(`Starting ML verification for project ${projectId}`);
    
    // Calculate ML verification score using the AI service
    const mlScore = MLVerificationService.calculateVerificationScore(projectData);
    
    // Create verification result
    const verificationResult: MLVerification = {
      projectId,
      mlScore: mlScore.score,
      confidence: mlScore.confidence,
      riskFactors: mlScore.riskFactors,
      recommendation: mlScore.recommendation,
      timestamp: new Date().toISOString(),
      verifierId: verifierId
    };

    // Store ML verification result in database
    await DatabaseRepository.createMLVerification(verificationResult);

    console.log(`ML verification completed for project ${projectId}: score ${mlScore.score}`);
    
    return verificationResult;
  }

  async getVerificationResult(projectId: string): Promise<MLVerification | null> {
    return DatabaseRepository.getMLVerification(projectId);
  }

  async runAdvancedAnalysis(project: Project, mrvData?: any[]): Promise<{
    basicScore: number;
    mrvAnalysis?: any;
    complianceAssessment?: any;
    overallRecommendation: string;
  }> {
    // Basic project analysis
    const basicScore = MLVerificationService.calculateVerificationScore(project);

    let result: any = {
      basicScore: basicScore.score,
      overallRecommendation: basicScore.recommendation
    };

    // Enhanced MRV analysis if data is available
    if (mrvData && mrvData.length > 0) {
      result.mrvAnalysis = MLVerificationService.analyzeMRVData(mrvData);
      
      // Adjust overall score based on MRV quality
      const combinedScore = (basicScore.score * 0.7) + (result.mrvAnalysis.score * 0.3);
      result.basicScore = Math.round(combinedScore * 100) / 100;
    }

    // Regulatory compliance assessment
    result.complianceAssessment = MLVerificationService.assessRegulatoryCompliance(project);

    // Generate updated recommendation based on all factors
    if (result.mrvAnalysis && result.complianceAssessment) {
      result.overallRecommendation = this.generateComprehensiveRecommendation(
        result.basicScore,
        result.mrvAnalysis,
        result.complianceAssessment
      );
    }

    return result;
  }

  private generateComprehensiveRecommendation(
    score: number,
    mrvAnalysis: any,
    complianceAssessment: any
  ): string {
    const issues: string[] = [];
    
    if (score < 0.6) {
      issues.push('Low project viability score');
    }
    
    if (mrvAnalysis.insights.length === 0) {
      issues.push('Insufficient MRV data quality');
    }
    
    if (complianceAssessment.issues.length > 0) {
      issues.push('Regulatory compliance concerns');
    }

    if (issues.length === 0 && score >= 0.8) {
      return 'APPROVE - Comprehensive analysis shows strong project viability with good MRV data and regulatory compliance.';
    } else if (issues.length <= 1 && score >= 0.6) {
      return 'CONDITIONAL_APPROVAL - Good overall project with minor concerns that can be addressed.';
    } else if (score >= 0.4) {
      return `REVIEW_REQUIRED - Multiple issues identified: ${issues.join(', ')}. Detailed review needed.`;
    } else {
      return `REJECT - Significant concerns prevent approval: ${issues.join(', ')}.`;
    }
  }

  // Generate detailed verification report
  async generateVerificationReport(projectId: string): Promise<string> {
    const project = await DatabaseRepository.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const verification = await this.getVerificationResult(projectId);
    if (!verification) {
      throw new Error('No ML verification found for this project');
    }

    const mlScore = {
      score: verification.mlScore,
      confidence: verification.confidence,
      riskFactors: verification.riskFactors,
      recommendation: verification.recommendation
    };

    return MLVerificationService.generateVerificationReport(project, mlScore);
  }

  // Batch processing for multiple projects
  async batchVerifyProjects(projects: Project[], verifierId: string): Promise<MLVerification[]> {
    const results: MLVerification[] = [];

    for (const project of projects) {
      try {
        const verification = await this.verifyProject(project.id, project, verifierId);
        results.push(verification);
      } catch (error) {
        console.error(`Failed to verify project ${project.id}:`, error);
        // Continue with other projects even if one fails
      }
    }

    return results;
  }

  // Get verification statistics
  async getVerificationStats(): Promise<{
    totalVerifications: number;
    averageScore: number;
    scoreDistribution: Record<string, number>;
    topRiskFactors: Array<{ factor: string; count: number }>;
  }> {
    // This would require querying all ML verifications
    // For now, return empty stats structure
    return {
      totalVerifications: 0,
      averageScore: 0,
      scoreDistribution: {},
      topRiskFactors: []
    };
  }
}