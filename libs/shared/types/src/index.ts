// Mobile Types - shared between mobile and web
export type IssueStatus = 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';

export type IssueCategory = 'pothole' | 'streetlight' | 'waste' | 'sidewalk' | 'water_leak' | 'accessibility' | 'other';

export type UserRole = 'citizen' | 'municipal_staff' | 'admin';

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  category: IssueCategory;
  status: IssueStatus;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  reportedAt: string;
  acknowledgedAt: string | null;
  inProgressAt: string | null;
  resolvedAt: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  upvoteCount: number;
  cityId: string | null;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  category: IssueCategory;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address?: string;
  deviceId: string;
}

export interface Upvote {
  id: string;
  issueId: string;
  deviceId: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  municipalityId: string | null;
}

export interface AdminDashboardStats {
  totalIssues: number;
  reportedIssues: number;
  acknowledgedIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  rejectedIssues: number;
  openIssues: number;
}

export interface AdminOverview {
  user: AuthUser;
  stats: AdminDashboardStats;
}

export interface AdminIssueFilters extends IssueFilters {
  q?: string;
}

export interface IssueFilters {
  status?: IssueStatus;
  category?: IssueCategory;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  reported: 'Bildirildi',
  acknowledged: 'İnceleniyor',
  in_progress: 'Çalışılıyor',
  resolved: 'Çözüldü',
  rejected: 'Reddedildi',
};

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  pothole: 'Çukur',
  streetlight: 'Sokak Lambası',
  waste: 'Atık',
  sidewalk: 'Kaldırım',
  water_leak: 'Su Kaçağı',
  accessibility: 'Erişilebilirlik',
  other: 'Diğer',
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  reported: '#F59E0B',
  acknowledged: '#3B82F6',
  in_progress: '#F59E0B',
  resolved: '#10B981',
  rejected: '#6B7280',
};
