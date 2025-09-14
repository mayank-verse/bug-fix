import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { AuthService } from "./services/auth-service.ts";
import { ProjectService } from "./services/project-service.ts";
import { MRVService } from "./services/mrv-service.ts";
import { MLService } from "./services/ml-service.ts";
import { DatabaseRepository } from "./repository.ts";

const app = new Hono();

console.log("🚀 Samudra Ledger backend server starting...");

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize services
const authService = new AuthService();
const projectService = new ProjectService();
const mrvService = new MRVService();
const mlService = new MLService();

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication routes
app.post("/signup", async (c) => {
  try {
    const { email, password, name, role = 'buyer' } = await c.req.json();
    
    const result = await authService.createUser(email, password, name, role);
    return c.json(result);
  } catch (error) {
    const err=error as Error;
    console.log(`Signup error: ${err.message}`);
    return c.json({ error: err.message }, 400);
  }
});

app.post("/check-nccr-eligibility", async (c) => {
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
app.get("/public/stats", async (c) => {
  try {
    const stats = await DatabaseRepository.getPublicStats();
    return c.json(stats);
  } catch (error) {
    console.log(`Public stats error: ${error}`);
    return c.json({ error: 'Failed to fetch public stats' }, 500);
  }
});

// Project management routes
app.post("/projects", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'project_manager');

    const projectData = await c.req.json();
    projectService.validateProjectData(projectData);
    
    const result = await projectService.createProject(projectData, auth.user.id, auth.user);
    return c.json(result);
  } catch (error) {
    const err=error as Error;
    console.log(`Project registration error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

app.get("/projects/manager", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'project_manager');

    const projects = await projectService.getManagerProjects(auth.user.id);
    return c.json({ projects });
  } catch (error) {
    const err=error as Error;
    console.log(`Manager projects error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

app.get("/projects/all", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'nccr_verifier');

    const projects = await projectService.getAllProjects();
    return c.json({ projects });
  } catch (error) {
    const err=error as Error;
    console.log(`All projects error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

app.delete("/projects/:projectId", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'project_manager');

    const projectId = c.req.param('projectId');
    await projectService.deleteProject(projectId, auth.user.id);
    
    return c.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    const err=error as Error;
    console.log(`Project deletion error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

// MRV data routes
app.post("/mrv/upload", async (c) => {
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
    const err=error as Error;
    console.log(`File upload error: ${error}`);
    return c.json({ error: err.message }, 500);
  }
});

app.post("/mrv", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'project_manager');

    const mrvData = await c.req.json();
    mrvService.validateMRVData(mrvData);
    
    const result = await mrvService.submitMRVData(mrvData, auth.user.id);
    return c.json(result);
  } catch (error) {
    const err=error as Error;
    console.log(`MRV submission error: ${error}`);
    return c.json({ error: err.message }, 500);
  }
});

app.get("/mrv/pending", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'nccr_verifier');

    const pendingMrv = await mrvService.getPendingMRV();
    return c.json({ pendingMrv });
  } catch (error) {
    const err=error as Error;
    console.log(`Pending MRV error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

app.post("/mrv/:mrvId/approve", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'nccr_verifier');

    const mrvId = c.req.param('mrvId');
    const { approved, notes } = await c.req.json();
    
    const updatedMrv = await mrvService.approveMRV(mrvId, auth.user.id, approved, notes);
    return c.json({ success: true, mrvData: updatedMrv });
  } catch (error) {
    const err=error as Error;
    console.log(`MRV approval error: ${error}`);
    return c.json({ error: err.message }, 500);
  }
});

// ML verification routes
app.post("/ml/verify-project", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'nccr_verifier');

    const { projectId, projectData } = await c.req.json();
    
    const verification = await mlService.verifyProject(projectId, projectData, auth.user.id);
    return c.json({ success: true, verification });
  } catch (error) {
    const err=error as Error;
    console.log(`ML verification error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

app.get("/ml/verification/:projectId", async (c) => {
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
    const err=error as Error;
    console.log(`Get ML verification error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

// Carbon credits routes
app.get("/credits/available", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'buyer');

    const availableCredits = await DatabaseRepository.getAvailableCredits();
    return c.json({ availableCredits });
  } catch (error) {
    const err=error as Error;
    console.log(`Available credits error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

app.get("/credits/owned", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'buyer');

    const ownedCredits = await DatabaseRepository.getBuyerCredits(auth.user.id);
    return c.json({ ownedCredits });
  } catch (error) {
    const err=error as Error;
    console.log(`Owned credits error: ${error}`);
    return c.json({ error: err.message }, err.message.includes('Access denied') ? 403 : 500);
  }
});

app.post("/credits/purchase", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'buyer');

    const { creditId } = await c.req.json();
    
    if (!creditId) {
      return c.json({ error: 'Credit ID is required' }, 400);
    }

    await DatabaseRepository.purchaseCredit(creditId, auth.user.id);
    
    return c.json({ 
      success: true, 
      message: 'Credit purchased successfully',
      creditId 
    });
  } catch (error) {
    const err=error as Error;
    console.log(`Credit purchase error: ${error}`);
    return c.json({ error: err.message }, 500);
  }
});

app.post("/credits/retire", async (c) => {
  try {
    const auth = await authService.authenticateUser(c.req.raw);
    authService.requireRole(auth, 'buyer');

    const { creditId, reason } = await c.req.json();
    
    if (!creditId || !reason) {
      return c.json({ error: 'Credit ID and reason are required' }, 400);
    }
    
    await DatabaseRepository.retireCredit(creditId, auth.user.id, reason);
    
    // Get the retired credit to return details
    const retiredCredit = await DatabaseRepository.getCarbonCredit(creditId);
    
    if (retiredCredit) {
      await DatabaseRepository.incrementCreditsRetired(retiredCredit.amount);
    }

    return c.json({ 
      success: true, 
      message: 'Credit retired successfully',
      retirement: {
        creditId,
        amount: retiredCredit?.amount || 0,
        reason,
        retiredAt: retiredCredit?.retiredAt
      }
    });
  } catch (error) {
    const err=error as Error;
    console.log(`Credit retirement error: ${error}`);
    return c.json({ error: err.message }, 500);
  }
});

export default app;