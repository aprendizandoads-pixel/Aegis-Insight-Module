
import React, { useState, useEffect, useRef } from 'react';
import { Globe, Code, Copy, Activity, Eye, MousePointer, ShieldAlert, ShieldCheck, Zap, Fingerprint, RefreshCw, Smartphone, Monitor, MapPin, Search, User, Link as LinkIcon, FileText, Wallet, X, ChevronRight, ExternalLink } from 'lucide-react';
import { validateContent } from '../services/geminiService';

interface TrackingSession {
  id: string;
  ip: string;
  location: string;
  device: 'desktop' | 'mobile';
  identity: string; // User identity (e.g., email or guest ID)
  url: string; // Full URL
  action: string;
  riskScore: number;
  timestamp: string;
  validated: boolean;
  wallet?: string; // Detected crypto wallet
  referrer: string; // Source domain
  fingerprint: string;
}

export const WebTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'live' | 'config'>('deploy');
  const [isCopied, setIsCopied] = useState(false);
  const [trackingId, setTrackingId] = useState('AG-88X2-PROT');
  const [sessions, setSessions] = useState<TrackingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrackingSession | null>(null);
  
  // Live Feed Simulation State
  const [isMonitoring, setIsMonitoring] = useState(false);
  
  // Generate tracking code
  const trackingCode = `
<script>
  (function(w,d,s,id){
    w.AegisObject=s;w[s]=w[s]||function(){(w[s].q=w[s].q||[]).push(arguments)};
    var js,fjs=d.getElementsByTagName('script')[0];
    if(d.getElementById(id))return;
    js=d.createElement('script');js.id=id;
    js.src="https://cdn.aegis-module.io/agent/v1.5.js";
    fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'aegis','aegis-sdk');

  aegis('init', '${trackingId}');
  aegis('protection', 'strict');
  aegis('realtime_validation', true);
  aegis('enable_crypto_detection', true);
</script>`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const generateSession = () => {
    const ips = ['203.12.44.xx', '192.168.1.xx', '45.33.22.xx', '89.10.11.xx', '10.0.0.xx'];
    const locs = ['New York, US', 'London, UK', 'Tokyo, JP', 'Berlin, DE', 'Sao Paulo, BR'];
    const identities = ['guest_882', 'john.doe@company.com', 'admin_root', 'visitor_x99', 'unknown_actor'];
    const paths = [
      '/checkout/payment', 
      '/admin/settings/users', 
      '/product/id-9922', 
      '/login?redirect=%2Fdashboard', 
      '/api/v1/user/data'
    ];
    const domains = ['target-site.com', 'secure-portal.io', 'shop-backend.net'];
    const referrers = ['google.com', 'unknown-proxy.net', 'tor-exit-node.org', 'direct', 'twitter.com'];
    const wallets = ['0x71C...992A', 'bc1q...x882', 'TVr...99x'];
    
    const isRisk = Math.random() > 0.8;
    const hasWallet = Math.random() > 0.7;
    const currentDomain = domains[Math.floor(Math.random() * domains.length)];
    const currentPath = paths[Math.floor(Math.random() * paths.length)];

    return {
      id: Math.random().toString(36).substr(2, 9),
      ip: ips[Math.floor(Math.random() * ips.length)],
      location: locs[Math.floor(Math.random() * locs.length)],
      device: Math.random() > 0.4 ? 'desktop' : 'mobile',
      identity: identities[Math.floor(Math.random() * identities.length)],
      url: `https://${currentDomain}${currentPath}`,
      action: 'Pageview',
      riskScore: isRisk ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 20),
      timestamp: new Date().toLocaleTimeString(),
      validated: true,
      wallet: hasWallet ? wallets[Math.floor(Math.random() * wallets.length)] : undefined,
      referrer: referrers[Math.floor(Math.random() * referrers.length)],
      fingerprint: Math.random().toString(36).substr(2, 12).toUpperCase()
    } as TrackingSession;
  };

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setSessions(prev => {
        const newSession = generateSession();
        // If we are inspecting, don't shift actively to avoid UI jumping too much, 
        // or just add to top.
        const updated = [newSession, ...prev];
        return updated.slice(0, 50); // Keep last 50
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end bg-slate-900 border border-slate-800 p-6 rounded-lg flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            Aegis Tracker
          </h2>
          <p className="text-slate-400 text-sm mt-1">Real-time visitor identity resolution and crypto-asset detection.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveTab('deploy')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'deploy' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                Deploy Agent
            </button>
            <button 
                onClick={() => setActiveTab('live')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'live' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
                Live Monitor
            </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
          {activeTab === 'deploy' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-y-auto custom-scrollbar">
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Code className="w-5 h-5 text-purple-400" />
                              Installation Snippet
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                              Agent v1.5 Stable
                          </div>
                      </div>
                      
                      <p className="text-sm text-slate-400 mb-4">
                          Paste this code into the <code className="text-cyan-400 bg-slate-950 px-1 rounded">&lt;head&gt;</code> of your website. 
                          It initializes the protection agent and connects to the Aegis Validator API.
                      </p>

                      <div className="relative group">
                          <div className="absolute top-3 right-3">
                              <button 
                                onClick={handleCopy}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors flex items-center gap-2 text-xs font-bold border border-slate-700"
                              >
                                  {isCopied ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
                                  {isCopied ? 'Copied!' : 'Copy Code'}
                              </button>
                          </div>
                          <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                              {trackingCode}
                          </pre>
                      </div>

                      <div className="mt-6 flex gap-4">
                          <div className="flex-1 bg-slate-950 p-4 rounded border border-slate-800/50 flex items-start gap-3">
                              <Zap className="w-5 h-5 text-yellow-400 mt-1" />
                              <div>
                                  <h4 className="text-sm font-bold text-white">Real-time Validation</h4>
                                  <p className="text-xs text-slate-500 mt-1">
                                      Every input interaction is validated against the Gemini API for threat patterns (SQLi, XSS, Phishing).
                                  </p>
                              </div>
                          </div>
                          <div className="flex-1 bg-slate-950 p-4 rounded border border-slate-800/50 flex items-start gap-3">
                              <Fingerprint className="w-5 h-5 text-cyan-400 mt-1" />
                              <div>
                                  <h4 className="text-sm font-bold text-white">Device Fingerprinting</h4>
                                  <p className="text-xs text-slate-500 mt-1">
                                      Generates a unique ID based on browser canvas, audio context, and hardware concurrency.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col">
                      <h3 className="text-lg font-semibold text-white mb-4">Setup Status</h3>
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                              <Activity className="w-8 h-8 text-slate-600" />
                          </div>
                          <div>
                              <p className="text-white font-medium">Waiting for signals...</p>
                              <p className="text-xs text-slate-500 mt-1">Install the snippet to begin tracking.</p>
                          </div>
                          <button className="text-xs text-cyan-500 hover:text-cyan-400 border border-cyan-900/50 bg-cyan-950/20 px-3 py-1.5 rounded transition-colors">
                              Send Test Signal
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'live' && (
             <div className="flex h-full gap-4">
                 {/* Main Table */}
                 <div className={`bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full overflow-hidden transition-all duration-300 ${selectedSession ? 'w-2/3' : 'w-full'}`}>
                      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                          <div className="flex items-center gap-3">
                              <Activity className="w-5 h-5 text-green-400" />
                              <h3 className="font-bold text-white">Live Traffic Intelligence</h3>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                 <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span>
                                 {isMonitoring ? 'RECEIVING DATA' : 'PAUSED'}
                              </div>
                              <button 
                                onClick={() => setIsMonitoring(!isMonitoring)}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${isMonitoring ? 'bg-slate-800 text-red-400 hover:bg-slate-700' : 'bg-green-600 text-white hover:bg-green-500'}`}
                              >
                                  {isMonitoring ? 'Stop Monitor' : 'Start Monitor'}
                              </button>
                          </div>
                      </div>

                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 p-3 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <div className="col-span-2">Time / ID</div>
                          <div className="col-span-3">User Identity</div>
                          <div className="col-span-4">Active Page (URL)</div>
                          <div className="col-span-2">Origin</div>
                          <div className="col-span-1 text-right">Risk</div>
                      </div>

                      {/* Feed */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-black/20">
                          {sessions.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                                  <Search className="w-12 h-12 mb-3" />
                                  <p>No active sessions detected.</p>
                              </div>
                          ) : (
                              <div className="divide-y divide-slate-800/50">
                                  {sessions.map((session) => (
                                      <div 
                                        key={session.id} 
                                        onClick={() => setSelectedSession(session)}
                                        className={`grid grid-cols-12 gap-4 p-3 hover:bg-slate-800/50 transition-colors cursor-pointer group border-l-2 ${selectedSession?.id === session.id ? 'bg-slate-800/50 border-cyan-500' : 'border-transparent'}`}
                                      >
                                          <div className="col-span-2 flex flex-col justify-center">
                                              <span className="text-xs text-slate-300 font-mono">{session.timestamp}</span>
                                              <span className="text-[10px] text-slate-500 font-mono">{session.ip}</span>
                                          </div>
                                          <div className="col-span-3 flex items-center gap-2">
                                               <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                                  <User className="w-3 h-3" />
                                               </div>
                                               <div className="overflow-hidden">
                                                   <span className="block text-xs text-white font-medium truncate">{session.identity}</span>
                                                   <span className="block text-[10px] text-slate-500 truncate">{session.location}</span>
                                               </div>
                                          </div>
                                          <div className="col-span-4 flex items-center">
                                              <span className="text-xs text-cyan-300/90 font-mono truncate" title={session.url}>
                                                  {session.url}
                                              </span>
                                          </div>
                                          <div className="col-span-2 flex items-center">
                                              <span className="text-[10px] text-slate-400 truncate bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                                                  {session.referrer}
                                              </span>
                                          </div>
                                          <div className="col-span-1 text-right flex items-center justify-end">
                                              <div className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                  session.riskScore > 75 ? 'bg-red-950/50 text-red-400 border border-red-900/50' :
                                                  session.riskScore > 40 ? 'bg-yellow-950/50 text-yellow-400 border border-yellow-900/50' :
                                                  'bg-green-950/50 text-green-400 border border-green-900/50'
                                              }`}>
                                                  {session.riskScore}
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                 </div>

                 {/* Session Annex (Detail View) */}
                 {selectedSession && (
                     <div className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-full animate-fade-in-right overflow-hidden shadow-2xl">
                         <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                 <FileText className="w-4 h-4 text-purple-400" />
                                 Session Annex
                             </h3>
                             <button onClick={() => setSelectedSession(null)} className="text-slate-500 hover:text-white">
                                 <X className="w-4 h-4" />
                             </button>
                         </div>

                         <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                             {/* Identity Card */}
                             <div className="bg-slate-950/50 p-4 rounded border border-slate-800">
                                 <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                                     <Fingerprint className="w-3 h-3" /> Digital Fingerprint
                                 </p>
                                 <div className="space-y-2">
                                     <div className="flex justify-between text-xs">
                                         <span className="text-slate-400">Canvas Hash</span>
                                         <span className="font-mono text-cyan-400">{selectedSession.fingerprint}</span>
                                     </div>
                                     <div className="flex justify-between text-xs">
                                         <span className="text-slate-400">Device Type</span>
                                         <span className="text-white capitalize">{selectedSession.device}</span>
                                     </div>
                                     <div className="flex justify-between text-xs">
                                         <span className="text-slate-400">ISP / Org</span>
                                         <span className="text-white">Cloudflare Warp</span>
                                     </div>
                                 </div>
                             </div>

                             {/* Crypto Section */}
                             <div>
                                 <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                                     <Wallet className="w-3 h-3 text-yellow-400" /> Detected Crypto Assets
                                 </p>
                                 {selectedSession.wallet ? (
                                     <div className="bg-yellow-950/10 border border-yellow-900/30 p-3 rounded">
                                         <div className="flex items-center gap-2 mb-1">
                                             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></div>
                                             <span className="text-xs text-yellow-200 font-bold">Wallet Connected</span>
                                         </div>
                                         <div className="bg-black/40 p-2 rounded text-[10px] font-mono text-slate-300 break-all border border-yellow-900/20">
                                             {selectedSession.wallet}
                                         </div>
                                         <p className="text-[10px] text-yellow-500/60 mt-2">
                                             Source: Metamask Injection detected via Web3 Provider
                                         </p>
                                     </div>
                                 ) : (
                                     <div className="p-3 border border-slate-800 rounded bg-slate-950/30 text-center">
                                         <span className="text-xs text-slate-500">No active wallet signatures found.</span>
                                     </div>
                                 )}
                             </div>

                             {/* Navigation Graph */}
                             <div>
                                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                                     <LinkIcon className="w-3 h-3 text-blue-400" /> Navigation Origin
                                 </p>
                                 <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                                     <div className="flex items-center gap-2 text-xs mb-2">
                                         <Globe className="w-3 h-3 text-slate-600" />
                                         <span className="text-slate-400">Referrer:</span>
                                         <span className="text-white font-medium">{selectedSession.referrer}</span>
                                     </div>
                                     {selectedSession.referrer.includes('unknown') || selectedSession.referrer.includes('tor') ? (
                                         <div className="flex items-center gap-2 text-[10px] text-red-400 bg-red-950/20 px-2 py-1 rounded">
                                             <ShieldAlert className="w-3 h-3" />
                                             Suspicious Origin Detected
                                         </div>
                                     ) : null}
                                 </div>
                             </div>

                             <div className="pt-4 border-t border-slate-800">
                                 <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-2">
                                     <ExternalLink className="w-3 h-3" />
                                     Export Full Profile (JSON)
                                 </button>
                             </div>
                         </div>
                     </div>
                 )}
             </div>
          )}

          {activeTab === 'config' && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-2xl mx-auto overflow-y-auto">
                  <h3 className="text-lg font-semibold text-white mb-6">Tracking Configuration</h3>
                  
                  <div className="space-y-6">
                      <div className="flex items-center justify-between">
                          <div>
                              <h4 className="text-sm font-bold text-slate-200">Capture Form Inputs</h4>
                              <p className="text-xs text-slate-500">Log content typed into inputs for validation (excluding password fields).</p>
                          </div>
                          <div className="w-10 h-6 bg-cyan-600 rounded-full relative cursor-pointer">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                          <div>
                              <h4 className="text-sm font-bold text-slate-200">Crypto Wallet Sniffing</h4>
                              <p className="text-xs text-slate-500">Detect active Web3 injections (Metamask, Phantom) to identify user wallets.</p>
                          </div>
                          <div className="w-10 h-6 bg-cyan-600 rounded-full relative cursor-pointer">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between">
                          <div>
                              <h4 className="text-sm font-bold text-slate-200">Mouse Movement Heatmap</h4>
                              <p className="text-xs text-slate-500">Track cursor velocity and hover states to detect bot behavior.</p>
                          </div>
                          <div className="w-10 h-6 bg-cyan-600 rounded-full relative cursor-pointer">
                              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                          </div>
                      </div>

                      <div className="pt-6 border-t border-slate-800">
                           <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                               <ShieldAlert className="w-4 h-4 text-red-400" />
                               Automatic Blocking Rules
                           </h4>
                           <div className="bg-slate-950 p-4 rounded border border-slate-800">
                               <label className="flex items-center gap-3 text-sm text-slate-300 mb-2">
                                   <input type="checkbox" checked className="rounded border-slate-700 bg-slate-800 text-cyan-600" readOnly />
                                   Block IP after 3 failed validation attempts
                               </label>
                               <label className="flex items-center gap-3 text-sm text-slate-300">
                                   <input type="checkbox" checked className="rounded border-slate-700 bg-slate-800 text-cyan-600" readOnly />
                                   Block known VPN/Tor exit nodes
                               </label>
                           </div>
                      </div>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
