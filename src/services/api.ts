// API Service Layer
import { supabase } from '../config/supabase';
import { projectId } from '../config/supabase';

export class ApiService {
  private static baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a82c4acb`;

  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`
    };
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error (${response.status}): ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    try {
      return await response.json();
    } catch {
      throw new Error('Invalid response format from server');
    }
  }

  // Public APIs
  static async getPublicStats() {
    const response = await fetch(`${this.baseUrl}/public/stats`);
    return this.handleResponse(response);
  }

  // Project APIs
  static async createProject(projectData: any) {
    const response = await fetch(`${this.baseUrl}/projects`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    return this.handleResponse(response);
  }

  static async getManagerProjects() {
    const response = await fetch(`${this.baseUrl}/projects/manager`, {
      headers: await this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  static async getAllProjects() {
    const response = await fetch(`${this.baseUrl}/projects/all`, {
      headers: await this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  static async deleteProject(projectId: string) {
    const response = await fetch(`${this.baseUrl}/projects/${projectId}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // MRV APIs
  static async uploadMRVFiles(projectId: string, files: File[]) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const formData = new FormData();
    formData.append('projectId', projectId);
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${this.baseUrl}/mrv/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token || ''}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  static async submitMRVData(mrvData: any) {
    const response = await fetch(`${this.baseUrl}/mrv`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(mrvData)
    });
    return this.handleResponse(response);
  }

  static async getPendingMRV() {
    const response = await fetch(`${this.baseUrl}/mrv/pending`, {
      headers: await this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // ML Verification APIs
  static async runMLVerification(request: any) {
    const response = await fetch(`${this.baseUrl}/ml/verify-project`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(request)
    });
    return this.handleResponse(response);
  }

  static async getMLVerification(projectId: string) {
    const response = await fetch(`${this.baseUrl}/ml/verification/${projectId}`, {
      headers: await this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
}

// Error handling utilities
export const showApiError = (error: unknown, defaultMessage = 'An error occurred') => {
  const message = error instanceof Error ? error.message : defaultMessage;
  console.error('API Error:', error);
  return message;
};

export const showApiSuccess = (message: string) => {
  console.log('API Success:', message);
  return message;
};