// API Routes Configuration
// Defines all backend routes and handlers

import { Hono } from "npm:hono";
import { AuthService } from "./auth-service.tsx";
import { ProjectService } from "./project-service.tsx";
import { MRVService } from "./mrv-service.tsx";
import { MLService } from "./ml-service.tsx";
import { DatabaseRepository } from "./repository.tsx";

export function setupRoutes(app: Hono) {
  const authService = new AuthService();
  const projectService = new ProjectService();
  const mrvService = new MRVService();
  const mlService = new MLService();

  // Health check endpoint
  app.get("/make-server-a82c4acb/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/make-server-a82c4acb/signup", async (c) => {
    try {
      const { email, password, name, role = 'buyer' } = await c.req.json();
      
      const result = await authService.createUser(email, password, name, role);
      return c.json(result);
    } catch (error) {
      console.log(`Signup error: ${error}`);
      return c.json({ error: error.message }, 400);
    }
  });

  app.post("/make-server-a82c4acb/check-nccr-eligibility", async (c) => {
    try {
      const { email } = await c.req.json();
      const result = AuthService.checkNCCREligibility(email);
      return c.json(result);
    } catch (error) {
      console.log(`NCCR eligibility check error: ${error}`);
      return c.json({ error: 'Failed to check eligibility' }, 500);
    }
  });

  // Public routes
  app.get("/make-server-a82c4acb/public/stats", async (c) => {
    try {
      const stats = await DatabaseRepository.getPublicStats();
      return c.json(stats);
    } catch (error) {
      console.log(`Public stats error: ${error}`);
      return c.json({ error: 'Failed to fetch public stats' }, 500);
    }
  });

  // Project management routes
  app.post("/make-server-a82c4acb/projects", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'project_manager');

      const projectData = await c.req.json();
      projectService.validateProjectData(projectData);
      
      const result = await projectService.createProject(projectData, auth.user.id, auth.user);
      return c.json(result);
    } catch (error) {
      console.log(`Project registration error: ${error}`);
      return c.json({ error: error.message }, error.message.includes('Access denied') ? 403 : 500);
    }
  });

  app.get("/make-server-a82c4acb/projects/manager", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'project_manager');

      const projects = await projectService.getManagerProjects(auth.user.id);
      return c.json({ projects });
    } catch (error) {
      console.log(`Manager projects error: ${error}`);
      return c.json({ error: error.message }, error.message.includes('Access denied') ? 403 : 500);
    }
  });

  app.get("/make-server-a82c4acb/projects/all", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'nccr_verifier');

      const projects = await projectService.getAllProjects();
      return c.json({ projects });
    } catch (error) {
      console.log(`All projects error: ${error}`);
      return c.json({ error: error.message }, error.message.includes('Access denied') ? 403 : 500);
    }
  });

  app.delete("/make-server-a82c4acb/projects/:projectId", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'project_manager');

      const projectId = c.req.param('projectId');
      await projectService.deleteProject(projectId, auth.user.id);
      
      return c.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      console.log(`Project deletion error: ${error}`);
      return c.json({ error: error.message }, error.message.includes('Access denied') ? 403 : 500);
    }
  });

  // MRV data routes
  app.post("/make-server-a82c4acb/mrv/upload", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'project_manager');

      const formData = await c.req.formData();
      const files = formData.getAll('files') as File[];
      const projectId = formData.get('projectId') as string;
      
      if (!projectId) {
        return c.json({ error: 'Project ID is required' }, 400);
      }

      const uploadedFiles = await mrvService.uploadFiles(projectId, files);
      
      return c.json({ 
        success: true, 
        files: uploadedFiles,
        message: `Successfully uploaded ${uploadedFiles.length} files`
      });
    } catch (error) {
      console.log(`File upload error: ${error}`);
      return c.json({ error: error.message }, 500);
    }
  });

  app.post("/make-server-a82c4acb/mrv", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'project_manager');

      const mrvData = await c.req.json();
      mrvService.validateMRVData(mrvData);
      
      const result = await mrvService.submitMRVData(mrvData, auth.user.id);
      return c.json(result);
    } catch (error) {
      console.log(`MRV submission error: ${error}`);
      return c.json({ error: error.message }, 500);
    }
  });

  app.get("/make-server-a82c4acb/mrv/pending", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'nccr_verifier');

      const pendingMrv = await mrvService.getPendingMRV();
      return c.json({ pendingMrv });
    } catch (error) {
      console.log(`Pending MRV error: ${error}`);
      return c.json({ error: error.message }, error.message.includes('Access denied') ? 403 : 500);
    }
  });

  app.post("/make-server-a82c4acb/mrv/:mrvId/approve", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'nccr_verifier');

      const mrvId = c.req.param('mrvId');
      const { approved, notes } = await c.req.json();
      
      const updatedMrv = await mrvService.approveMRV(mrvId, auth.user.id, approved, notes);
      return c.json({ success: true, mrvData: updatedMrv });
    } catch (error) {
      console.log(`MRV approval error: ${error}`);
      return c.json({ error: error.message }, 500);
    }
  });

  // ML verification routes
  app.post("/make-server-a82c4acb/ml/verify-project", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'nccr_verifier');

      const { projectId, projectData } = await c.req.json();
      
      const verification = await mlService.verifyProject(projectId, projectData, auth.user.id);
      return c.json({ success: true, verification });
    } catch (error) {
      console.log(`ML verification error: ${error}`);
      return c.json({ error: error.message }, error.message.includes('Access denied') ? 403 : 500);
    }
  });

  app.get("/make-server-a82c4acb/ml/verification/:projectId", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'nccr_verifier');

      const projectId = c.req.param('projectId');
      const verification = await mlService.getVerificationResult(projectId);

      if (!verification) {
        return c.json({ error: 'No ML verification found for this project' }, 404);
      }

      return c.json({ verification });
    } catch (error) {
      console.log(`Get ML verification error: ${error}`);
      return c.json({ error: error.message }, error.message.includes('Access denied') ? 403 : 500);
    }
  });

  // Carbon credits routes
  app.get("/make-server-a82c4acb/credits/available", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'buyer');

      const approvedMrv = await DatabaseRepository.getApprovedMRV();
      const availableCredits = approvedMrv.map(mrv => ({
        id: mrv.id,
        projectId: mrv.projectId,
        carbonCredits: mrv.mlResults?.carbon_estimate || 0,
        healthScore: mrv.mlResults?.biomass_health_score || 0,
        evidenceCid: mrv.mlResults?.evidenceCid || '',
        verifiedAt: mrv.verifiedAt || ''
      }));

      return c.json({ availableCredits });
    } catch (error) {
      console.log(`Available credits error: ${error}`);
      return c.json({ error: error.message }, error.message.includes('Access denied') ? 403 : 500);
    }
  });

  app.post("/make-server-a82c4acb/credits/retire", async (c) => {
    try {
      const auth = await authService.authenticateUser(c.req.raw);
      authService.requireRole(auth, 'buyer');

      const { creditId, amount, reason } = await c.req.json();
      
      const retirementId = DatabaseRepository.generateId('retirement');
      const retirement = {
        id: retirementId,
        creditId,
        buyerId: auth.user.id,
        amount,
        reason,
        retiredAt: new Date().toISOString(),
        onChainTxHash: DatabaseRepository.generateTxHash()
      };

      await DatabaseRepository.createRetirement(retirement);
      await DatabaseRepository.incrementCreditsRetired(amount);

      return c.json({ retirementId, retirement });
    } catch (error) {
      console.log(`Credit retirement error: ${error}`);
      return c.json({ error: error.message }, 500);
    }
  });
}