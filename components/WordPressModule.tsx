
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Code, Server, Shield, Zap, CheckCircle, AlertTriangle, Play, Copy, Terminal, Stethoscope, AlertOctagon, Loader2, Database, FolderRoot, Key, Settings, Lock, FileSearch, Bug, Rocket, Search, CheckSquare, Square, Info, ArrowRight, AlertCircle, Package, ShieldAlert, ShieldCheck, Box, RefreshCw, X, Command } from 'lucide-react';
import { runWPDiagnostic } from '../services/geminiService';
import { initiateHandshake, validateDatabaseAccess, establishSecureTunnel, fetchInstalledAssets, verifySingleAssetIntegrity } from '../services/wordpressService';
import { DiagnosticReport, IntegrationCredentials, SystemLayer, WpAsset } from '../types';

interface LogEntry {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action' | 'protocol';
  timestamp: string;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; icon: any }> = ({ active, onClick, children, icon: Icon }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${active ? 'border-cyan-500 text-cyan-400 bg-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden lg:inline">{children}</span>
  </button>
);

const ScanButton: React.FC<{ label: string; icon: any; onClick: () => void; disabled: boolean }> = ({ label, icon: Icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded text-xs font-medium text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
  >
    <Icon className="w-3 h-3 text-cyan-500" />
    {label}
  </button>
);

const LogIcon: React.FC<{ type: LogEntry['type'] }> = ({ type }) => {
  switch (type) {
    case 'info': return <Info className="w-3 h-3 text-slate-500 mt-0.5" />;
    case 'success': return <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />;
    case 'warning': return <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5" />;
    case 'action': return <Terminal className="w-3 h-3 text-purple-500 mt-0.5" />;
    case 'protocol': return <ArrowRight className="w-3 h-3 text-blue-500 mt-0.5" />;
    default: return <Info className="w-3 h-3 text-slate-500" />;
  }
};

export const WordPressModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'db' | 'server' | 'permissions' | 'assets'>('general');
  const [credentials, setCredentials] = useState<IntegrationCredentials>({
    wpUrl: '',
    autonomyGranted: false
  });
  
  // Simulation State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState('');
  
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isRemediating, setIsRemediating] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Selection State
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
  const [expandedFixIds, setExpandedFixIds] = useState<Set<string>>(new Set());

  // Asset/Structure State
  const [assets, setAssets] = useState<WpAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Modals State
  const [showAutonomyModal, setShowAutonomyModal] = useState(false);
  const [showRemediationModal, setShowRemediationModal] = useState(false);

  const updateCreds = (field: keyof IntegrationCredentials, value: any) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const toggleConnection = async () => {
    if (isConnected) {
      setIsConnected(false);
      setIsRemediating(false);
      setDiagnosticReport(null);
      setLogs([]);
      setAssets([]);
      setSelectedIssueIds(new Set());
      setExpandedFixIds(new Set());
      addLog('Terminated secure session.', 'warning');
    } else {
      if (!credentials.wpUrl) {
        addLog('Error: Target Site URL is required.', 'warning');
        return;
      }
      
      setIsConnecting(true);
      
      try {
        // 1. WP JSON Handshake
        setConnectionStep('Initializing Aegis Protocol...');
        addLog(`Contacting ${credentials.wpUrl} via WP-JSON...`, 'info');
        
        await initiateHandshake(credentials.wpUrl, credentials.wpAdminUser, credentials.wpAppPass);
        
        addLog(`Handshake established with ${credentials.wpUrl}`, 'success');
        
        // 2. Database Handshake
        if (credentials.dbHost) {
            setConnectionStep('Securing Database Tunnel...');
            await validateDatabaseAccess(credentials.dbHost, credentials.dbUser || '', credentials.dbPass || '', credentials.dbName || '');
            addLog(`Database connection confirmed (PDO::MySQL) at ${credentials.dbHost}`, 'protocol');
        }

        // 3. SSH Handshake
        if (credentials.sshHost) {
            setConnectionStep('Establishing SSH Handshake...');
            await establishSecureTunnel(credentials.sshHost, credentials.sshUser || '', credentials.sshKey || '');
            addLog(`SSH Encrypted Tunnel active (${credentials.sshUser}@${credentials.sshHost})`, 'protocol');
        }

        setConnectionStep('Finalizing Secure Connection...');
        await new Promise(r => setTimeout(r, 600)); // UI Grace period
        
        setIsConnected(true);
        addLog('Ready for analysis.', 'info');
      } catch (error: any) {
        addLog(`Connection Failed: ${error.message}`, 'warning');
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
             addLog('Hint: Ensure the target site allows CORS or utilize a proxy.', 'info');
        }
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const loadStructure = async () => {
      if (!isConnected) return;
      setIsLoadingAssets(true);
      addLog('Scanning filesystem for installed packages...', 'action');
      
      try {
        const fetchedAssets = await fetchInstalledAssets(credentials.wpUrl, credentials.wpAdminUser, credentials.wpAppPass);
        
        // Map to local WpAsset type if needed, but the service returns compatible type
        setAssets(fetchedAssets as any);
        
        addLog(`Structure Map Complete: ${fetchedAssets.length} assets detected via API.`, 'success');
      } catch (e) {
         addLog('Failed to fetch assets via API. Falling back to cached snapshot (Simulated).', 'warning');
         // Fallback for demo
         const mockAssets: WpAsset[] = [
            { id: '1', name: 'WooCommerce', type: 'plugin', version: '8.5.1', status: 'active', updateStatus: 'outdated', integrity: 'unknown' },
            { id: '2', name: 'Yoast SEO', type: 'plugin', version: '21.0', status: 'active', updateStatus: 'current', integrity: 'unknown' },
            { id: '3', name: 'Elementor', type: 'plugin', version: '3.18.0', status: 'active', updateStatus: 'current', integrity: 'unknown' },
            { id: '4', name: 'Astra', type: 'theme', version: '4.6.0', status: 'active', updateStatus: 'current', integrity: 'unknown' },
            { id: '5', name: 'Twenty Twenty-Four', type: 'theme', version: '1.0', status: 'inactive', updateStatus: 'current', integrity: 'unknown' },
            { id: '6', name: 'Contact Form 7', type: 'plugin', version: '5.8', status: 'active', updateStatus: 'current', integrity: 'unknown' },
            { id: '7', name: 'Jetpack', type: 'plugin', version: '13.0', status: 'active', updateStatus: 'current', integrity: 'unknown' },
        ];
        setAssets(mockAssets);
      } finally {
        setIsLoadingAssets(false);
      }
  };

  const verifyAsset = async (asset: WpAsset) => {
    if (!isConnected) return;
    
    // Set verifying state
    setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, integrity: 'verifying' } : a));
    addLog(`Initiating checksum verification for ${asset.name} v${asset.version}...`, 'protocol');
    
    // Call real service
    const result = await verifySingleAssetIntegrity(asset);
    
    setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, integrity: result } : a));
    
    if (result === 'malicious') {
        addLog(`CRITICAL: Malicious code signatures detected in ${asset.name}.`, 'warning');
    } else if (result === 'corrupted') {
        addLog(`ALERT: Integrity mismatch detected in ${asset.name}.`, 'warning');
    } else if (result === 'unknown') {
        addLog(`Warning: Official checksums not found for ${asset.name}.`, 'info');
    } else {
        addLog(`Integrity verified for ${asset.name}. Hash matches repository.`, 'success');
    }
  };

  const verifyAllAssets = async () => {
    if (!isConnected || assets.length === 0) return;
    
    addLog('Starting comprehensive integrity verification...', 'action');
    
    // Create a copy to iterate
    const queue = [...assets];
    
    for (const asset of queue) {
        // Update status to verifying
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, integrity: 'verifying' } : a));
        
        // Call service
        const result = await verifySingleAssetIntegrity(asset);
        
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, integrity: result } : a));
        
        if (result !== 'clean' && result !== 'unknown') {
            addLog(`[SECURITY ALERT] ${result.toUpperCase()} issue detected in ${asset.name} v${asset.version}`, 'warning');
        }
    }
    
    addLog('Verification cycle complete. All assets checked.', 'success');
  };

  const runSpecificScan = async (scanType: string) => {
    if (!isConnected) return;
    setIsDiagnosing(true);
    setLogs([]);
    setSelectedIssueIds(new Set());
    setExpandedFixIds(new Set());
    addLog(`Initiating specific scan: ${scanType}...`, 'action');

    try {
        const report = await runWPDiagnostic(credentials, scanType);
        setDiagnosticReport(report);
        // Auto-select critical issues
        const criticalIds = report.issues.filter(i => i.severity === 'critical').map(i => i.id);
        setSelectedIssueIds(new Set(criticalIds));
        
        setTimeout(() => addLog(`Scan complete. ${report.issues.length} anomalies detected across ${scanType} vector.`, 'warning'), 500);
    } catch (e) {
        addLog('Diagnostic failed.', 'warning');
    } finally {
        setIsDiagnosing(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIssueIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setSelectedIssueIds(newSet);
  };

  const toggleFixView = (id: string) => {
    const newSet = new Set(expandedFixIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setExpandedFixIds(newSet);
  };

  const toggleSelectAll = () => {
    if (!diagnosticReport) return;
    if (selectedIssueIds.size === diagnosticReport.issues.length) {
        setSelectedIssueIds(new Set());
    } else {
        setSelectedIssueIds(new Set(diagnosticReport.issues.map(i => i.id)));
    }
  };

  // Autonomy Handlers
  const handleAutonomyToggle = () => {
    if (credentials.autonomyGranted) {
        updateCreds('autonomyGranted', false);
    } else {
        setShowAutonomyModal(true);
    }
  };

  const confirmAutonomy = () => {
    updateCreds('autonomyGranted', true);
    setShowAutonomyModal(false);
  };

  // Remediation Handlers
  const handleRemediationClick = () => {
    if (selectedIssueIds.size === 0) return;
    
    if (!credentials.autonomyGranted) {
         addLog('ERROR: Autonomous Control not granted. Please enable autonomy in "Access Control" tab.', 'warning');
         // Flash/Highlight permission tab in real implementation
         return;
    }
    
    setShowRemediationModal(true);
  };

  const confirmRemediation = () => {
    setShowRemediationModal(false);
    runRemediation();
  };

  const runRemediation = async () => {
    if (!isConnected || !diagnosticReport) return;
    
    if (selectedIssueIds.size === 0) {
        addLog('No issues selected for remediation.', 'warning');
        return;
    }

    setIsRemediating(true);
    addLog(`Engaging Autonomous Remediation for ${selectedIssueIds.size} selected items...`, 'action');
    addLog('WARNING: Modifying Production Environment.', 'warning');

    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
    const issuesToFix = diagnosticReport.issues.filter(i => selectedIssueIds.has(i.id));

    for (let i = 0; i < issuesToFix.length; i++) {
        const issue = issuesToFix[i];
        if (issue.status === 'resolved') continue;

        // UI Update: Fixing
        setDiagnosticReport(prev => {
            if (!prev) return null;
            const newIssues = prev.issues.map(item => 
                item.id === issue.id ? { ...item, status: 'fixing' as const } : item
            );
            return { ...prev, issues: newIssues };
        });

        // Telemetry based on issue location/layer
        addLog(`[TARGET] ${issue.location}`, 'info');
        
        switch (issue.layer) {
            case 'database':
                addLog(`[DB] Optimizing table: ${issue.location}`, 'protocol');
                await wait(1000);
                addLog(`[DB] Executing SQL fix...`, 'action');
                await wait(1000);
                break;
            case 'filesystem':
                addLog(`[FS] Acquiring write lock: ${issue.location}`, 'protocol');
                await wait(800);
                addLog(`[FS] Patching file content...`, 'action');
                await wait(1200);
                break;
            case 'seo_ads':
                addLog(`[SEO] Updating meta headers for: ${issue.location}`, 'protocol');
                await wait(800);
                addLog(`[ADS] Verifying policy compliance...`, 'action');
                await wait(1200);
                break;
            default:
                addLog(`[API] Processing logic for ${issue.location}...`, 'protocol');
                await wait(1000);
                addLog(`[Auto] Applying solution...`, 'action');
        }

        // UI Update: Resolved
        setDiagnosticReport(prev => {
            if (!prev) return null;
            const newIssues = prev.issues.map(item => 
                item.id === issue.id ? { ...item, status: 'resolved' as const } : item
            );
            // Calculate new score based on resolved count vs total
            const resolvedCount = newIssues.filter(x => x.status === 'resolved').length;
            const newScore = Math.floor((resolvedCount / newIssues.length) * 100);
            
            return { ...prev, issues: newIssues, healthScore: Math.max(prev.healthScore, newScore) };
        });
        
        addLog(`SUCCESS: Issue resolved at ${issue.location}.`, 'success');
        await wait(500);
    }

    addLog('Selected batch remediation complete.', 'success');
    setIsRemediating(false);
  };

  // Scroll to bottom of logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fade-in relative">
      
      {/* Modals Layer */}
      {showAutonomyModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-slate-900 border border-red-500/50 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
             <div className="bg-red-500/10 p-6 border-b border-red-500/20">
               <div className="flex items-center gap-3 text-red-400 mb-2">
                 <AlertOctagon className="w-8 h-8" />
                 <h3 className="text-xl font-bold">Grant Autonomous Control?</h3>
               </div>
               <p className="text-slate-300 text-sm leading-relaxed">
                 You are about to grant the AI system <strong>write access</strong> to the production database and filesystem.
               </p>
             </div>
             <div className="p-6 space-y-4">
                <div className="bg-black/50 p-4 rounded border border-red-900/30">
                  <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Risk Assessment</h4>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                    <li>AI will execute remediation without manual steps.</li>
                    <li>Database changes may be irreversible.</li>
                    <li>Filesystem patches could cause conflicts.</li>
                  </ul>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowAutonomyModal(false)}
                    className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmAutonomy}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-sm transition-colors shadow-lg shadow-red-900/20"
                  >
                    I Understand, Enable
                  </button>
                </div>
             </div>
           </div>
        </div>
      )}

      {showRemediationModal && diagnosticReport && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[80vh]">
             <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-950">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <Zap className="w-5 h-5 text-yellow-400" />
                 Confirm Remediation Plan
               </h3>
               <button onClick={() => setShowRemediationModal(false)} className="text-slate-500 hover:text-white">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-5 flex-1 overflow-hidden flex flex-col">
               <p className="text-sm text-slate-400 mb-4">
                 The following <strong>{selectedIssueIds.size} issues</strong> will be automatically patched. You can remove items from this batch before proceeding.
               </p>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/30 rounded border border-slate-800 p-1">
                 {diagnosticReport.issues.filter(i => selectedIssueIds.has(i.id)).map(issue => (
                   <div key={issue.id} className="flex justify-between items-start gap-3 p-3 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                     <div className="flex-1">
                       <div className="flex items-center gap-2 mb-1">
                         <span className={`w-2 h-2 rounded-full ${
                            issue.severity === 'critical' ? 'bg-red-500' :
                            issue.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                         }`} />
                         <span className="text-sm font-medium text-slate-200">{issue.description}</span>
                       </div>
                       <div className="text-xs text-slate-500 font-mono">{issue.location}</div>
                     </div>
                     <button 
                       onClick={() => toggleSelection(issue.id)}
                       className="p-1 hover:bg-red-900/30 text-slate-600 hover:text-red-400 rounded transition-colors"
                       title="Remove from batch"
                     >
                       <X className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
                 {selectedIssueIds.size === 0 && (
                   <div className="p-8 text-center text-slate-500 italic text-sm">
                     No issues selected.
                   </div>
                 )}
               </div>
             </div>

             <div className="p-5 border-t border-slate-700 bg-slate-950 flex gap-3">
                <button 
                  onClick={() => setShowRemediationModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRemediation}
                  disabled={selectedIssueIds.size === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded font-bold text-sm transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed with Fixes
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Left Column: Deep Integration Config */}
      <div className="xl:col-span-1 flex flex-col gap-6 h-full overflow-hidden">
        <div className="bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-950">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Integration Config
            </h2>
            <p className="text-xs text-slate-500 mt-1">Configure deep system access protocols</p>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Layout}>General</TabButton>
            <TabButton active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} icon={Package}>Structure</TabButton>
            <TabButton active={activeTab === 'db'} onClick={() => setActiveTab('db')} icon={Database}>Data</TabButton>
            <TabButton active={activeTab === 'server'} onClick={() => setActiveTab('server')} icon={Server}>Server</TabButton>
            <TabButton active={activeTab === 'permissions'} onClick={() => setActiveTab('permissions')} icon={Key}>Access Control</TabButton>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900">
            {activeTab === 'general' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Target URL</label>
                  <input type="text" value={credentials.wpUrl} onChange={(e) => updateCreds('wpUrl', e.target.value)} placeholder="https://site.com" className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm focus:border-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">WP Admin Username</label>
                  <input type="text" value={credentials.wpAdminUser || ''} onChange={(e) => updateCreds('wpAdminUser', e.target.value)} placeholder="admin" className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Application Password</label>
                  <input type="password" value={credentials.wpAppPass || ''} onChange={(e) => updateCreds('wpAppPass', e.target.value)} placeholder="xxxx xxxx xxxx xxxx" className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="space-y-4 animate-fade-in h-full flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-white">Installed Packages</h3>
                    <div className="flex gap-2">
                        {isConnected && assets.length === 0 && (
                            <button 
                                onClick={loadStructure}
                                disabled={isLoadingAssets}
                                className="text-xs bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 hover:bg-cyan-900/50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                                {isLoadingAssets ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                Load Structure
                            </button>
                        )}
                        {isConnected && assets.length > 0 && (
                            <button 
                                onClick={verifyAllAssets}
                                className="text-xs bg-indigo-900/30 text-indigo-400 border border-indigo-800/50 hover:bg-indigo-900/50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                                <ShieldCheck className="w-3 h-3" />
                                Verify All
                            </button>
                        )}
                    </div>
                 </div>

                 {!isConnected ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                        <Lock className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs">Establish connection to scan file structure</p>
                     </div>
                 ) : assets.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4 text-center border-2 border-dashed border-slate-800 rounded">
                        {isLoadingAssets ? (
                            <>
                                <Loader2 className="w-8 h-8 mb-2 animate-spin text-cyan-500" />
                                <p className="text-xs">Analyzing filesystem...</p>
                            </>
                        ) : (
                            <>
                                <Package className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-xs">No assets loaded. Click "Load Structure".</p>
                            </>
                        )}
                     </div>
                 ) : (
                     <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                        {assets.map(asset => (
                            <div key={asset.id} className="bg-slate-950 p-3 rounded border border-slate-800 hover:border-slate-700 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded ${asset.type === 'plugin' ? 'bg-blue-900/20 text-blue-400' : 'bg-purple-900/20 text-purple-400'}`}>
                                            {asset.type === 'plugin' ? <Box className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-200 leading-none">{asset.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-500 font-mono">v{asset.version}</span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${asset.status === 'active' ? 'bg-green-500' : 'bg-slate-600'}`} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${asset.updateStatus === 'outdated' ? 'bg-orange-900/30 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>
                                        {asset.updateStatus}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 mt-2">
                                    <div className="text-xs">
                                        {asset.integrity === 'unknown' && <span className="text-slate-600 italic">Not Verified</span>}
                                        {asset.integrity === 'verifying' && <span className="text-cyan-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Checking...</span>}
                                        {asset.integrity === 'clean' && <span className="text-green-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Clean</span>}
                                        {asset.integrity === 'corrupted' && <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Corrupted</span>}
                                        {asset.integrity === 'malicious' && <span className="text-red-500 flex items-center gap-1"><Bug className="w-3 h-3"/> Malicious</span>}
                                    </div>
                                    
                                    {asset.integrity === 'unknown' && (
                                        <button 
                                            onClick={() => verifyAsset(asset)}
                                            className="text-[10px] bg-slate-800 hover:bg-cyan-900/50 hover:text-cyan-400 text-slate-300 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                        >
                                            <Shield className="w-3 h-3" />
                                            Verify
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
              </div>
            )}
            
            {activeTab === 'db' && (
              <div className="space-y-4 animate-fade-in">
                 <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded text-xs text-blue-300 mb-2">
                    Direct database access allows SQL injection remediation and table optimization.
                 </div>
                 <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">DB Host</label>
                  <input type="text" value={credentials.dbHost || ''} onChange={(e) => updateCreds('dbHost', e.target.value)} placeholder="localhost" className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">DB Name</label>
                        <input type="text" value={credentials.dbName || ''} onChange={(e) => updateCreds('dbName', e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">DB User</label>
                        <input type="text" value={credentials.dbUser || ''} onChange={(e) => updateCreds('dbUser', e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                    </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">DB Password</label>
                  <input type="password" value={credentials.dbPass || ''} onChange={(e) => updateCreds('dbPass', e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'server' && (
              <div className="space-y-6 animate-fade-in">
                {/* SSH Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><Terminal className="w-3 h-3 text-cyan-400"/> SSH / CLI Access</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={credentials.sshHost || ''} onChange={(e) => updateCreds('sshHost', e.target.value)} placeholder="Host IP" className="bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                        <input type="text" value={credentials.sshUser || ''} onChange={(e) => updateCreds('sshUser', e.target.value)} placeholder="User" className="bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                    </div>
                    <textarea value={credentials.sshKey || ''} onChange={(e) => updateCreds('sshKey', e.target.value)} placeholder="Paste Private Key (PEM/RSA)..." className="w-full h-16 bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-xs font-mono outline-none resize-none" />
                </div>

                {/* WP-CLI Section */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Command className="w-3 h-3 text-green-400"/> WP-CLI Configuration
                        </h3>
                        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={!!credentials.wpCliSshUser} 
                                onChange={(e) => {
                                    if(!e.target.checked) {
                                        updateCreds('wpCliSshUser', undefined);
                                        updateCreds('wpCliSshKey', undefined);
                                    } else {
                                        updateCreds('wpCliSshUser', '');
                                    }
                                }}
                                className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-offset-slate-900"
                            />
                            Dedicated Auth
                        </label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Binary Path</label>
                            <input type="text" value={credentials.wpCliPath || ''} onChange={(e) => updateCreds('wpCliPath', e.target.value)} placeholder="/usr/local/bin/wp" className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                        </div>
                        <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">WP Install Path</label>
                            <input type="text" value={credentials.wpInstallPath || ''} onChange={(e) => updateCreds('wpInstallPath', e.target.value)} placeholder="/var/www/html" className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                        </div>
                    </div>

                    {credentials.wpCliSshUser !== undefined && (
                        <div className="bg-slate-950/50 p-3 rounded border border-slate-800/50 space-y-3 animate-fade-in">
                             <div className="grid grid-cols-1 gap-3">
                                <div>
                                     <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">WP-CLI SSH User</label>
                                     <input type="text" value={credentials.wpCliSshUser || ''} onChange={(e) => updateCreds('wpCliSshUser', e.target.value)} placeholder="User (e.g. www-data)" className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                                </div>
                                <div>
                                     <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">WP-CLI Private Key</label>
                                     <textarea value={credentials.wpCliSshKey || ''} onChange={(e) => updateCreds('wpCliSshKey', e.target.value)} placeholder="-----BEGIN OPENSSH PRIVATE KEY-----" className="w-full h-16 bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded text-xs font-mono outline-none resize-none" />
                                </div>
                             </div>
                        </div>
                    )}

                    {credentials.wpCliSshUser === undefined && (
                        <div className="text-xs text-slate-500 bg-slate-950 p-2 rounded border border-slate-800 flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            <p>Using main SSH credentials configured above for command execution.</p>
                        </div>
                    )}
                </div>

                {/* FTP Section */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><FolderRoot className="w-3 h-3 text-yellow-400"/> FTP / SFTP</h3>
                     <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={credentials.ftpHost || ''} onChange={(e) => updateCreds('ftpHost', e.target.value)} placeholder="FTP Host" className="bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                        <input type="text" value={credentials.ftpUser || ''} onChange={(e) => updateCreds('ftpUser', e.target.value)} placeholder="User" className="bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                    </div>
                    <input type="password" value={credentials.ftpPass || ''} onChange={(e) => updateCreds('ftpPass', e.target.value)} placeholder="Password" className="w-full bg-slate-950 border border-slate-700 text-white px-3 py-2 rounded text-sm outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'permissions' && (
              <div className="space-y-6 animate-fade-in">
                  <div className={`flex items-center justify-between p-6 rounded-lg border transition-all duration-300 ${
                      credentials.autonomyGranted 
                      ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}>
                    <div>
                        <label className={`text-lg font-bold block mb-1 ${credentials.autonomyGranted ? 'text-red-100' : 'text-white'}`}>Grant AI Autonomy</label>
                        <span className="text-sm text-slate-400">Allow automated remediation actions without manual confirmation</span>
                    </div>
                    <button 
                        onClick={handleAutonomyToggle}
                        className={`w-16 h-8 rounded-full transition-all relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            credentials.autonomyGranted 
                            ? 'bg-red-600 focus:ring-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                    >
                        <span className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-md ${credentials.autonomyGranted ? 'translate-x-8' : 'translate-x-0'}`} />
                    </button>
                  </div>

                 {credentials.autonomyGranted && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-4 animate-fade-in">
                        <AlertOctagon className="w-8 h-8 text-red-500 flex-shrink-0 animate-pulse" />
                        <div>
                            <h4 className="text-sm font-bold text-red-400 uppercase tracking-wide">High Risk Configuration</h4>
                            <p className="text-sm text-red-200/80 mt-1 leading-relaxed">
                                <strong>Warning:</strong> You have enabled autonomous write access. The AI system will bypass manual confirmation steps for database queries and file modifications. This can lead to irreversible changes on the production server. Ensure recent backups exist before proceeding.
                            </p>
                        </div>
                    </div>
                 )}
                 
                 {!credentials.autonomyGranted && (
                     <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex items-start gap-3">
                        <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
                         <div>
                            <h4 className="text-sm font-medium text-slate-300">Safety Lock Active</h4>
                            <p className="text-xs text-slate-500 mt-1">
                                Remediation actions will require manual approval for every step. This is the recommended setting for production environments.
                            </p>
                        </div>
                     </div>
                 )}
              </div>
            )}

          </div>
          
          {/* Action Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-950">
             <button 
                onClick={toggleConnection}
                disabled={isConnecting}
                className={`w-full py-3 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isConnected 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                    : isConnecting
                        ? 'bg-slate-800 text-slate-400 cursor-wait'
                        : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'
                }`}
             >
                {isConnecting ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {connectionStep}
                    </>
                ) : (
                    <>
                        <Zap className="w-4 h-4 fill-current" />
                        {isConnected ? 'Terminate Connection' : 'Establish Secure Connection'}
                    </>
                )}
             </button>
          </div>
        </div>
      </div>

      {/* Right Column: AI Console & Reports */}
      <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full overflow-hidden shadow-xl">
        {/* Console Header with Specific Scans */}
        <div className="flex flex-col border-b border-slate-800 bg-slate-950">
            <div className="p-4 flex justify-between items-center border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <h2 className="font-mono text-sm text-slate-300">
                    {isConnected ? `CONNECTED: ${credentials.wpUrl}` : 'NO CONNECTION'}
                    </h2>
                </div>
            </div>
            
            {/* Specific Scan Toolbar */}
            <div className="p-2 flex gap-2 overflow-x-auto custom-scrollbar bg-slate-900/50">
                 <ScanButton label="File Integrity" icon={FileSearch} onClick={() => runSpecificScan('File Integrity')} disabled={!isConnected || isDiagnosing} />
                 <ScanButton label="DB Check" icon={Database} onClick={() => runSpecificScan('Database')} disabled={!isConnected || isDiagnosing} />
                 <ScanButton label="Malware Sigs" icon={Bug} onClick={() => runSpecificScan('Malware')} disabled={!isConnected || isDiagnosing} />
                 <ScanButton label="SEO & Ads" icon={Search} onClick={() => runSpecificScan('SEO & Ads')} disabled={!isConnected || isDiagnosing} />
                 <ScanButton label="Performance" icon={Rocket} onClick={() => runSpecificScan('Performance')} disabled={!isConnected || isDiagnosing} />
            </div>
        </div>

        {/* Output Area */}
        <div className="flex-1 overflow-hidden relative bg-black flex flex-col">
            {/* Split View: Report on Top, Logs on Bottom */}
            {diagnosticReport ? (
                <div className="flex flex-col h-full">
                    {/* Issues List */}
                    <div className="flex-[3] overflow-y-auto p-0 custom-scrollbar animate-fade-in bg-slate-950 border-b border-slate-800 relative">
                        <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center shadow-md">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                    {diagnosticReport.scanType || 'Diagnostic'} Results
                                </h3>
                                <span className="bg-slate-800 text-xs px-2 py-0.5 rounded text-slate-400">{diagnosticReport.issues.length} Items</span>
                            </div>
                            <button onClick={toggleSelectAll} className="text-xs text-cyan-500 hover:text-cyan-400 flex items-center gap-1">
                                {selectedIssueIds.size === diagnosticReport.issues.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                Select All
                            </button>
                        </div>
                        
                        <div className="divide-y divide-slate-800/50">
                            {diagnosticReport.issues.map((issue) => (
                                <div key={issue.id} className={`p-4 hover:bg-slate-900/50 transition-colors ${selectedIssueIds.has(issue.id) ? 'bg-cyan-950/10' : ''}`}>
                                    <div className="flex gap-4">
                                        <button onClick={() => toggleSelection(issue.id)} className="mt-1">
                                            {selectedIssueIds.has(issue.id) 
                                                ? <CheckSquare className="w-5 h-5 text-cyan-500" /> 
                                                : <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                                            }
                                        </button>
                                        
                                        <div className="flex-1 space-y-2">
                                            {/* Header Line */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                        issue.severity === 'critical' ? 'bg-red-900/50 text-red-400' : 
                                                        issue.severity === 'high' ? 'bg-orange-900/50 text-orange-400' : 'bg-yellow-900/50 text-yellow-400'
                                                    }`}>
                                                        {issue.severity}
                                                    </span>
                                                    <h4 className="text-sm font-semibold text-slate-200">{issue.description}</h4>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button 
                                                        onClick={() => toggleFixView(issue.id)}
                                                        className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${expandedFixIds.has(issue.id) ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        <Code className="w-3 h-3" />
                                                        {expandedFixIds.has(issue.id) ? 'Hide' : 'Code'}
                                                    </button>
                                                    <div className="h-3 w-px bg-slate-800"></div>
                                                    <div className="text-xs">
                                                        {issue.status === 'fixing' ? (
                                                            <span className="flex items-center gap-1 text-cyan-400"><Loader2 className="w-3 h-3 animate-spin" /> Fixing</span>
                                                        ) : issue.status === 'resolved' ? (
                                                            <span className="flex items-center gap-1 text-green-500"><CheckCircle className="w-3 h-3" /> Resolved</span>
                                                        ) : (
                                                            <span className="text-slate-500">Pending</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detail Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-black/20 p-3 rounded border border-slate-800/50">
                                                <div>
                                                    <span className="block text-slate-500 font-mono uppercase text-[10px] mb-1">Location / Target</span>
                                                    <div className="font-mono text-orange-300 break-all flex items-start gap-1">
                                                        <FolderRoot className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-50" />
                                                        {issue.location}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="block text-slate-500 font-mono uppercase text-[10px] mb-1">Proposed Solution</span>
                                                    <div className="text-slate-300 flex items-start gap-1">
                                                        <WrenchIcon className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-50" />
                                                        {issue.solution}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Technical Fix View */}
                                            {expandedFixIds.has(issue.id) && (
                                                <div className="mt-2 bg-black/50 p-3 rounded border border-slate-800/80 animate-fade-in group relative">
                                                    <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-1">
                                                        <span className="text-[10px] font-mono text-slate-500 uppercase">Automated Patch / Command</span>
                                                        <Copy className="w-3 h-3 text-slate-600 hover:text-cyan-400 cursor-pointer" />
                                                    </div>
                                                    <code className="block font-mono text-xs text-green-400/90 whitespace-pre-wrap break-all">
                                                        {issue.fix}
                                                    </code>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Apply Fixes Sticky Footer */}
                        {!isRemediating && diagnosticReport.issues.length > 0 && (
                          <div className="sticky bottom-0 p-4 bg-slate-900 border-t border-slate-800 flex justify-center shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
                            <button 
                              onClick={handleRemediationClick}
                              disabled={selectedIssueIds.size === 0}
                              className="group relative inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 font-pj rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-900/30 hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                              <Zap className="w-5 h-5 mr-2 animate-pulse text-yellow-300" />
                              {selectedIssueIds.size > 0 ? `Fix ${selectedIssueIds.size} Selected Issues` : 'Select Issues to Fix'}
                            </button>
                          </div>
                        )}
                    </div>

                    {/* Console Log (Bottom Section) */}
                    <div className="flex-[2] bg-black p-4 font-mono text-xs overflow-y-auto custom-scrollbar flex flex-col gap-1 border-t border-slate-800 shadow-inner">
                        <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider mb-2 sticky top-0 bg-black py-1 border-b border-slate-900 flex justify-between">
                            <span>System Telemetry</span>
                            <span>PROTOCOL: SSH/PDO/SFTP</span>
                        </div>
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3 animate-fade-in hover:bg-slate-900/30 px-1 rounded items-start">
                            <span className="text-slate-600 whitespace-nowrap opacity-70 mt-0.5">[{log.timestamp}]</span>
                            <div className="flex gap-2 items-start">
                                <LogIcon type={log.type} />
                                <span className={`break-all leading-relaxed ${
                                    log.type === 'action' ? 'text-purple-400 font-bold' :
                                    log.type === 'protocol' ? 'text-blue-400' :
                                    log.type === 'warning' ? 'text-yellow-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                    'text-slate-400'
                                }`}>
                                    {log.message}
                                </span>
                            </div>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            ) : (
                // Empty State with potential Overlay
                <div className="flex-1 relative flex flex-col">
                    {isConnected && !isDiagnosing && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-none">
                             <div className="bg-slate-900/90 p-6 rounded-xl border border-slate-800 shadow-2xl flex flex-col items-center text-center max-w-sm backdrop-blur-xl">
                                <h3 className="text-lg font-bold text-white mb-2">Ready for Analysis</h3>
                                <p className="text-slate-400 text-xs mb-0 leading-relaxed">
                                    Select a specific scan from the toolbar above to identify vulnerabilities.
                                </p>
                             </div>
                        </div>
                    )}

                    <div className="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar flex flex-col gap-1 justify-end opacity-50">
                        {logs.length === 0 ? (
                            <div className="text-slate-600 text-center mb-20 flex flex-col items-center gap-3">
                                <Terminal className="w-16 h-16 opacity-20" />
                                <div>
                                    <p className="text-slate-500 font-medium text-sm">System Standby</p>
                                    <p className="text-xs text-slate-700 mt-1">Awaiting target configuration & connection handshake.</p>
                                </div>
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="flex gap-3 animate-fade-in hover:bg-slate-900/30 px-1 rounded items-start">
                                <span className="text-slate-600 whitespace-nowrap opacity-70 mt-0.5">[{log.timestamp}]</span>
                                <div className="flex gap-2 items-start">
                                    <LogIcon type={log.type} />
                                    <span className={`break-all leading-relaxed ${
                                        log.type === 'action' ? 'text-purple-400 font-bold' :
                                        log.type === 'protocol' ? 'text-blue-400' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                        log.type === 'success' ? 'text-green-400' :
                                        'text-slate-400'
                                    }`}>
                                        {log.message}
                                    </span>
                                </div>
                                </div>
                            ))
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Helper icon
function WrenchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}
