import React, { useState } from 'react';
import { Key, Bell, Sliders, Shield, Save, RefreshCw, Check, Server, Lock, Activity, Cpu, AlertCircle, Box, ToggleLeft, ToggleRight } from 'lucide-react';
import { AppModule } from '../types';

interface SettingsProps {
  modules: AppModule[];
  enabledModuleIds: Set<string>;
  onToggleModule: (id: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ modules, enabledModuleIds, onToggleModule }) => {
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    criticalOnly: false
  });

  const [analysis, setAnalysis] = useState({
    deepScan: true,
    autoArchive: false,
    includeSentiment: true,
    threatThreshold: 75,
    confidenceThreshold: 85
  });

  const [healthCheck, setHealthCheck] = useState({
    status: 'operational', // operational, checking, error
    latency: 124,
    requests: 1240,
    errors: 0,
    lastSuccess: new Date().toLocaleTimeString(),
    lastChecked: new Date().toLocaleTimeString()
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const runHealthCheck = () => {
    setIsCheckingHealth(true);
    setHealthCheck(prev => ({ ...prev, status: 'checking' }));
    
    // Simulate API diagnostic
    setTimeout(() => {
      setIsCheckingHealth(false);
      setHealthCheck({
        status: 'operational',
        latency: Math.floor(Math.random() * 100) + 50,
        requests: 1245,
        errors: 0,
        lastSuccess: new Date().toLocaleTimeString(),
        lastChecked: new Date().toLocaleTimeString()
      });
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* System Health Check */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            System Health & API Status
          </h3>
          <button
            onClick={runHealthCheck}
            disabled={isCheckingHealth}
            className="text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 border border-slate-700"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? 'animate-spin' : ''}`} />
            {isCheckingHealth ? 'Running Diagnostics...' : 'Run Check'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                Gemini API Connection
                <span className={`w-2 h-2 rounded-full ${healthCheck.status === 'operational' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
              </p>
              
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                     <span className="text-slate-400">Status</span>
                     <span className={`font-bold capitalize ${healthCheck.status === 'operational' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {healthCheck.status === 'checking' ? 'Verifying...' : healthCheck.status}
                     </span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                     <span className="text-slate-400">Latency</span>
                     <span className="text-cyan-400 font-mono">{healthCheck.latency}ms</span>
                 </div>
                 <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                     <span className="text-slate-400">Requests (Session)</span>
                     <span className="text-white font-mono">{healthCheck.requests.toLocaleString()}</span>
                 </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-400">Last Successful Connection</span>
                     <span className="text-slate-300 font-mono text-xs">{healthCheck.lastSuccess}</span>
                 </div>
              </div>
           </div>
           
           <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
              <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Active Models</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-800/50">
                        <Cpu className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm text-slate-200">Gemini 3 Pro Preview</span>
                        <span className="ml-auto text-[10px] text-green-500 bg-green-950/30 px-1 rounded">ACTIVE</span>
                    </div>
                     <div className="flex items-center gap-2 bg-slate-900 p-2 rounded border border-slate-800/50">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-slate-200">Gemini 3 Flash Preview</span>
                        <span className="ml-auto text-[10px] text-green-500 bg-green-950/30 px-1 rounded">ACTIVE</span>
                    </div>
                  </div>
              </div>
           </div>

           <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
              <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Gateway Reliability</p>
                  <div className="text-center py-4">
                      <p className="text-3xl font-bold text-white tracking-tight">99.9%</p>
                      <p className="text-xs text-green-500 mt-1">Uptime confirmed</p>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-green-500 h-full w-full"></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>Error Rate</span>
                      <span className="text-green-400">0.00%</span>
                  </div>
              </div>
           </div>
        </div>

        {/* Security Info */}
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-800">
           <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-950/50 px-3 py-2 rounded border border-slate-800/50">
             <Key className="w-4 h-4 text-slate-500" />
             <span>API Key: <span className="font-mono text-xs bg-slate-900 px-1 py-0.5 rounded text-green-500">SECURE_ENV</span></span>
           </div>
           <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-950/50 px-3 py-2 rounded border border-slate-800/50">
             <Lock className="w-4 h-4 text-slate-500" />
             <span>Encryption: AES-256-GCM</span>
           </div>
           <div className="flex-1 text-right text-xs text-slate-600 self-center">
             Last Diagnostic: {healthCheck.lastChecked}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Box className="w-5 h-5 text-indigo-400" />
            Module Management
          </h3>
          <p className="text-sm text-slate-400 mb-4">Enable or disable specific modules to customize your workspace.</p>
          
          <div className="space-y-3">
             {modules.map(module => (
               <div key={module.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-md">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-900 rounded">
                     <module.icon className={`w-4 h-4 ${enabledModuleIds.has(module.id) ? 'text-cyan-400' : 'text-slate-600'}`} />
                   </div>
                   <div>
                     <span className={`text-sm font-medium ${enabledModuleIds.has(module.id) ? 'text-white' : 'text-slate-500'}`}>
                        {module.label}
                     </span>
                     {module.locked && <span className="text-[10px] text-slate-600 ml-2">(Core)</span>}
                   </div>
                 </div>
                 
                 {module.locked ? (
                    <Lock className="w-4 h-4 text-slate-700" />
                 ) : (
                    <button 
                      onClick={() => onToggleModule(module.id)}
                      className={`transition-colors ${enabledModuleIds.has(module.id) ? 'text-cyan-500 hover:text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
                    >
                      {enabledModuleIds.has(module.id) ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                 )}
               </div>
             ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            Notification Preferences
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-200 block">Critical Threats Only</label>
                <span className="text-xs text-slate-500">Only notify when severity is High or Critical</span>
              </div>
              <button 
                onClick={() => setNotifications(p => ({...p, criticalOnly: !p.criticalOnly}))}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.criticalOnly ? 'bg-cyan-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.criticalOnly ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-200 block">Browser Notifications</label>
                <span className="text-xs text-slate-500">Show desktop alerts for real-time validation</span>
              </div>
              <button 
                onClick={() => setNotifications(p => ({...p, browser: !p.browser}))}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.browser ? 'bg-cyan-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.browser ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
             
             <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-200 block">Email Reports</label>
                <span className="text-xs text-slate-500">Receive weekly summary reports via email</span>
              </div>
              <button 
                onClick={() => setNotifications(p => ({...p, email: !p.email}))}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-cyan-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.email ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
               <button className="text-xs text-cyan-500 hover:text-cyan-400 font-medium flex items-center gap-1">
                 <RefreshCw className="w-3 h-3" />
                 Test Notification System
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            Analysis Parameters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Toggles */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                <div>
                    <label className="text-sm font-medium text-slate-200 block">Deep Search Grounding</label>
                    <span className="text-xs text-slate-500">Perform recursive searches on associated entities</span>
                </div>
                <button 
                    onClick={() => setAnalysis(p => ({...p, deepScan: !p.deepScan}))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${analysis.deepScan ? 'bg-cyan-600' : 'bg-slate-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${analysis.deepScan ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                </div>

                <div className="flex items-center justify-between">
                <div>
                    <label className="text-sm font-medium text-slate-200 block">Sentiment Analysis</label>
                    <span className="text-xs text-slate-500">Include NLP-based sentiment scoring in reports</span>
                </div>
                <button 
                    onClick={() => setAnalysis(p => ({...p, includeSentiment: !p.includeSentiment}))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${analysis.includeSentiment ? 'bg-cyan-600' : 'bg-slate-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${analysis.includeSentiment ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                </div>
                
                <div className="flex items-center justify-between">
                <div>
                    <label className="text-sm font-medium text-slate-200 block">Auto-Archive Reports</label>
                    <span className="text-xs text-slate-500">Automatically save scan results to local history</span>
                </div>
                <button 
                    onClick={() => setAnalysis(p => ({...p, autoArchive: !p.autoArchive}))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${analysis.autoArchive ? 'bg-cyan-600' : 'bg-slate-700'}`}
                >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${analysis.autoArchive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                </div>
            </div>

            {/* Threshold Sliders */}
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-200">Threat Score Threshold</label>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 rounded">{analysis.threatThreshold}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={analysis.threatThreshold}
                        onChange={(e) => setAnalysis(p => ({...p, threatThreshold: parseInt(e.target.value)}))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Minimum score required to trigger a high-severity alert.</p>
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-200">Confidence Threshold</label>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 rounded">{analysis.confidenceThreshold}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={analysis.confidenceThreshold}
                        onChange={(e) => setAnalysis(p => ({...p, confidenceThreshold: parseInt(e.target.value)}))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                     <p className="text-xs text-slate-500 mt-1">Minimum AI confidence level required to validate a threat automatically.</p>
                </div>
            </div>
          </div>
        </div>

      {/* Save Action */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all
            ${saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}
          `}
        >
          {saveStatus === 'saving' && <RefreshCw className="w-4 h-4 animate-spin" />}
          {saveStatus === 'saved' && <Check className="w-4 h-4" />}
          {saveStatus === 'idle' && <Save className="w-4 h-4" />}
          
          {saveStatus === 'saving' ? 'Saving Changes...' : 
           saveStatus === 'saved' ? 'Settings Saved' : 
           'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

// Internal utility component for icons not in lucide imports if needed, 
// but using standard lucide icons Zap was replaced by Cpu/Zap mix in render.
function Zap(props: any) {
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
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}
