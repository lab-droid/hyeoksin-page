export type ViewState = 'home' | 'estimate' | 'portfolio' | 'auth' | 'dashboard' | 'admin_dashboard';

export interface User {
  uid: string;
  email: string;
  name: string;
  role?: 'admin' | 'user';
}

export interface AuthSession {
  isLoggedIn: boolean;
  user: User | null;
}

export interface PortfolioItem {
  id: string | number;
  title: string;
  category: string;
  client: string;
  beforeRate: string;
  afterRate: string;
  increase: string;
  imageUrl: string;
  tags: string[];
  summary?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  benefit1?: string;
  benefit2?: string;
  benefit3?: string;
  createdAt?: string;
}

export interface DashboardChartData {
  name: string;
  일반상세: number;
  혁신상세: number;
}
