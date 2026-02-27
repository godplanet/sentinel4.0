// Mission Control Dashboard - Type Definitions

// 1. Kullanıcı ve Karşılama Alanı
export interface WelcomeSummary {
  userName: string;
  role: string;
  welcomeMessage: string;
  systemHealth: number;
  lastLogin: string;
}

// 2. Sentinel Brain (Yapay Zeka Gündemi)
export interface AIBrief {
  headline: string;
  summary: string;
  context: string;
  sentiment: 'critical' | 'warning' | 'positive';
}

// 3. KPI Kartları (Üst Bant)
export interface DashboardKPI {
  id: string;
  label: string;
  value: string;
  trendDirection: 'up' | 'down' | 'flat';
  trendColor: 'red' | 'green' | 'gray';
}

export interface KPICard {
  id: string;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
  status: 'success' | 'warning' | 'danger';
}

// 4. Görev Listesi (Sol Kolon)
export interface MyTask {
  id: string;
  title: string;
  deadline: string;
  type: 'approval' | 'review' | 'meeting';
  status: 'pending' | 'in-progress';
  priority: 'high' | 'medium' | 'low';
}

// 5. Canlı Akış (Sağ Kolon)
export interface SystemActivity {
  id: string;
  userAvatar?: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'finding' | 'report' | 'plan';
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  avatarUrl?: string;
}
