
export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ThreatMetric {
  category: string;
  score: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

export interface EntityProfile {
  name: string;
  summary: string;
  lastActive?: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  sources: GroundingSource[];
  metrics: ThreatMetric[];
  generatedAt: string;
}

export interface ValidatorResult {
  isThreat: boolean;
  confidence: number;
  type?: string; // Phishing, Scam, Harassment, etc.
  reasoning: string;
  safetyTips: string[];
  technicalAnalysis?: string;
  remediationPlan?: string[];
}

export type SystemLayer = 'database' | 'filesystem' | 'wordpress_core' | 'network' | 'server_config' | 'seo_ads';

export interface DiagnosticIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  layer: SystemLayer;
  location: string; // File path or DB Table
  description: string;
  solution: string; // How to fix it
  fix: string; // The code/action to apply
  status: 'pending' | 'fixing' | 'resolved';
}

export interface DiagnosticReport {
  targetUrl: string;
  scanTime: string;
  scanType: string;
  issues: DiagnosticIssue[];
  healthScore: number;
}

export interface IntegrationCredentials {
  wpUrl: string;
  wpAdminUser?: string;
  wpAppPass?: string;
  dbHost?: string;
  dbName?: string;
  dbUser?: string;
  dbPass?: string;
  sshHost?: string;
  sshUser?: string;
  sshKey?: string;
  ftpHost?: string;
  ftpUser?: string;
  ftpPass?: string;
  wpCliPath?: string;
  wpInstallPath?: string;
  wpCliSshUser?: string;
  wpCliSshKey?: string;
  autonomyGranted: boolean;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  VALIDATOR = 'VALIDATOR',
  SETTINGS = 'SETTINGS',
  WORDPRESS = 'WORDPRESS',
  ROADMAP = 'ROADMAP',
  MPC_SERVER = 'MPC_SERVER',
  WEB_TRACKER = 'WEB_TRACKER',
  NETWORK_GRAPH = 'NETWORK_GRAPH',
  AUTONOMY = 'AUTONOMY',
  CUSTOM = 'CUSTOM'
}

export interface AppModule {
  id: string;
  label: string;
  icon: any; // Lucide icon component
  isCore: boolean;
  description?: string;
  version?: string;
  viewState: ViewState | string;
  locked?: boolean; // If true, cannot be disabled via Settings
}

export interface WpAsset {
  id: string;
  name: string;
  type: 'plugin' | 'theme';
  version: string;
  status: 'active' | 'inactive';
  updateStatus: 'current' | 'outdated';
  integrity: 'unknown' | 'verifying' | 'clean' | 'malicious' | 'corrupted';
}
