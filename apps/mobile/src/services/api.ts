import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { 
  Issue, 
  CreateIssueInput, 
  IssueFilters, 
  ApiResponse, 
  Upvote 
} from '../../../libs/shared/types/src';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Issues
  async getIssues(filters?: IssueFilters): Promise<Issue[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    
    const response = await this.client.get<ApiResponse<Issue[]>>(`/issues?${params.toString()}`);
    return response.data.data;
  }

  async getIssueById(id: string): Promise<Issue> {
    const response = await this.client.get<ApiResponse<Issue>>(`/issues/${id}`);
    return response.data.data;
  }

  async createIssue(input: CreateIssueInput): Promise<Issue> {
    const response = await this.client.post<ApiResponse<Issue>>('/issues', input);
    return response.data.data;
  }

  async updateIssueStatus(id: string, status: string, note?: string): Promise<Issue> {
    const response = await this.client.patch<ApiResponse<Issue>>(`/issues/${id}/status`, {
      status,
      note,
    });
    return response.data.data;
  }

  async searchIssues(query: string, lat?: number, lng?: number, radius?: number): Promise<Issue[]> {
    const params = new URLSearchParams({ q: query });
    if (lat) params.append('lat', String(lat));
    if (lng) params.append('lng', String(lng));
    if (radius) params.append('radius', String(radius));
    
    const response = await this.client.get<ApiResponse<Issue[]>>(`/issues/search?${params.toString()}`);
    return response.data.data;
  }

  // Upvotes
  async createUpvote(issueId: string, deviceId: string): Promise<Upvote> {
    const response = await this.client.post<ApiResponse<Upvote>>('/upvotes', {
      issueId,
      deviceId,
    });
    return response.data.data;
  }

  async removeUpvote(id: string): Promise<void> {
    await this.client.delete(`/upvotes/${id}`);
  }

  async getUpvotesByIssue(issueId: string): Promise<Upvote[]> {
    const response = await this.client.get<ApiResponse<Upvote[]>>(`/issues/${issueId}/upvotes`);
    return response.data.data;
  }

  // Admin
  async getAdminStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }
}

export const api = new ApiClient();
export default api;
