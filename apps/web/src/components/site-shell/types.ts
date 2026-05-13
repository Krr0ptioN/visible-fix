export type ActivePage = 'home' | 'issues' | 'report' | 'admin';

export type Translate = (key: string, params?: Record<string, string | number>) => string;
