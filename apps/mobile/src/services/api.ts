import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import type {
  AdminIssueFilters,
  AdminOverview,
  ApiResponse,
  AuthUser,
  CreateIssueInput,
  Issue,
  IssueFilters,
  IssueStatus,
  Upvote,
} from '../../../../libs/shared/types/src';

const DEFAULT_API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_API_HOST}:3000/api/v1`;
const SESSION_STORAGE_KEY = '@visiblefix_auth_session';

type AuthTokenMeta = {
  accessToken: string;
  refreshToken: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
};

type AuthResponse<T> = {
  success: boolean;
  data: T;
  meta?: Partial<AuthTokenMeta>;
};

type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
        const status = error.response?.status;

        if (!config || status !== 401 || config._retry || !this.refreshToken || config.url?.includes('/auth/refresh')) {
          throw error;
        }

        config._retry = true;
        const refreshedToken = await this.refreshAccessToken();

        if (!refreshedToken) {
          throw error;
        }

        config.headers.Authorization = `Bearer ${refreshedToken}`;
        return this.client(config);
      }
    );
  }

  async hydrateSessionFromStorage() {
    const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed.accessToken && parsed.refreshToken) {
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
      }
    } catch {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  private async saveSession() {
    if (!this.accessToken || !this.refreshToken) {
      await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
      } satisfies AuthSession)
    );
  }

  private async setSessionTokens(meta?: Partial<AuthTokenMeta>) {
    if (!meta?.accessToken || !meta.refreshToken) {
      return false;
    }

    this.accessToken = meta.accessToken;
    this.refreshToken = meta.refreshToken;
    await this.saveSession();
    return true;
  }

  async clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    await this.saveSession();
  }

  private async refreshAccessToken() {
    if (!this.refreshToken) return null;

    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        try {
          const response = await axios.post<AuthResponse<AuthUser>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken: this.refreshToken },
            {
              timeout: 30000,
              headers: {
                'Content-Type': 'application/json',
                'x-client-platform': 'mobile',
              },
            }
          );

          const ok = await this.setSessionTokens(response.data.meta);
          return ok ? this.accessToken : null;
        } catch {
          await this.clearSession();
          return null;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }

    return this.refreshPromise;
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const response = await this.client.post<AuthResponse<AuthUser>>(
      '/auth/sign-in',
      { email, password },
      {
        headers: {
          'x-client-platform': 'mobile',
        },
      }
    );

    const ok = await this.setSessionTokens(response.data.meta);
    if (!ok) {
      throw new Error('Authentication token payload missing.');
    }

    return response.data.data;
  }

  async signUp(input: { name: string; email: string; password: string }): Promise<AuthUser> {
    const response = await this.client.post<AuthResponse<AuthUser>>(
      '/auth/sign-up',
      input,
      {
        headers: {
          'x-client-platform': 'mobile',
        },
      }
    );

    const ok = await this.setSessionTokens(response.data.meta);
    if (!ok) {
      throw new Error('Authentication token payload missing.');
    }

    return response.data.data;
  }

  async signOut() {
    try {
      await this.client.post(
        '/auth/sign-out',
        { refreshToken: this.refreshToken },
        { headers: { 'x-client-platform': 'mobile' } }
      );
    } finally {
      await this.clearSession();
    }
  }

  async getMe(): Promise<AuthUser> {
    const response = await this.client.get<AuthResponse<AuthUser>>('/auth/me');
    return response.data.data;
  }

  async getAdminOverview(): Promise<AdminOverview> {
    const response = await this.client.get<AuthResponse<AdminOverview>>('/admin/overview');
    return response.data.data;
  }

  async getAdminIssues(filters: AdminIssueFilters): Promise<ApiResponse<Issue[]>> {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.q?.trim()) params.append('q', filters.q.trim());
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const response = await this.client.get<ApiResponse<Issue[]>>(`/admin/issues?${params.toString()}`);
    return response.data;
  }

  async updateAdminIssueStatus(id: string, status: IssueStatus, note?: string): Promise<Issue> {
    const response = await this.client.patch<AuthResponse<Issue>>(`/admin/issues/${id}/status`, { status, note });
    return response.data.data;
  }

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

  async searchIssues(query: string, lat?: number, lng?: number, radius?: number): Promise<Issue[]> {
    const params = new URLSearchParams({ q: query });
    if (lat) params.append('lat', String(lat));
    if (lng) params.append('lng', String(lng));
    if (radius) params.append('radius', String(radius));

    const response = await this.client.get<ApiResponse<Issue[]>>(`/issues/search?${params.toString()}`);
    return response.data.data;
  }

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
}

export const api = new ApiClient();
export default api;
