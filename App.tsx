import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Scanner } from './components/Scanner';
import { Validator } from './components/Validator';
import { Settings } from './components/Settings';
import { WordPressModule } from './components/WordPressModule';
import { Roadmap } from './components/Roadmap';
import { MPCModule } from './components/MPCModule';
import { WebTracker } from './components/WebTracker';
import { NetworkGraph } from './components/NetworkGraph';
import { AutonomyModule } from './components/AutonomyModule';
import { ViewState, AppModule } from './types';
import { Activity, Bell, Shield, UserCheck, Lock, LayoutDashboard, Radar, ShieldCheck, Layout, Map, Settings as SettingsIcon, Box, Upload, X, Check, Loader2, Cpu, Server, Globe, Share2, Bot } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_ACTIVITY_DATA = [
  { time: '00:00', threatLevel: 20 },
  { time: '04:00', threatLevel: 15 },
  { time: '08:00', threatLevel: 45 },
  { time: '12:00', threatLevel: 30 },
  { time: '16:00', threatLevel: 60 },
  { time: '20:00', threatLevel: 25 },
  { time: '24:00', threatLevel: 35 },
];

// Initial Core Modules
const INITIAL_MODULES: AppModule[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, isCore: true, viewState: ViewState.DASHBOARD, locked: true },
  { id: 'scanner', label: 'Entity Scanner', icon: Radar, isCore: true, viewState: ViewState.SCANNER },
  { id: 'graph', label: 'Network Graph', icon: Share2, isCore: true, viewState: ViewState.NETWORK_GRAPH },
  { id: 'validator', label: 'Threat Validator', icon: ShieldCheck, isCore: true, viewState: ViewState.VALIDATOR },
  { id: 'wordpress', label: 'WordPress Module', icon: Layout, isCore: true, viewState: ViewState.WORDPRESS },
  { id: 'autonomy', label: 'Aegis Autonomy', icon: Bot, isCore: true, viewState: ViewState.AUTONOMY },
  { id: 'tracker', label: 'Aegis Tracker', icon: Globe, isCore: true, viewState: ViewState.WEB_TRACKER },
  { id: 'mpc', label: 'MPC Server', icon: Server, isCore: true, viewState: ViewState.MPC_SERVER },
  { id: 'roadmap', label: 'Development Map', icon: Map, isCore: true, viewState: ViewState.ROADMAP },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, isCore: true, viewState: ViewState.SETTINGS, locked: true },
];

const DashboardOverview: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    {/* Stats Row */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Active Monitors', value: '12', icon: Activity, color: 'text-cyan-400' },
        { label: 'Threats Blocked', value: '84', icon: Shield, color: 'text-green-400' },
        { label: 'Identity Score', value: '98/100', icon: UserCheck, color: 'text-blue-400' },
        { label: 'System Alerts', value: '3', icon: Bell, color: 'text-orange-400' },
      ].map((stat, idx) => (
        <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
            <span className="text-xs text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">+2.4%</span>
          </div>
          <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
          <p className="text-xs text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
        </div>
      ))}
    </div>

    {/* Chart Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-6">Global Threat Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_ACTIVITY_DATA}>
              <defs>
                <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 12}} />
              <YAxis stroke="#475569" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="threatLevel" stroke="#06b6d4" fillOpacity={1} fill="url(#colorThreat)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
        <div className="space-y-4">
          {[
            { msg: 'Phishing attempt detected in email stream.', time: '2m ago', type: 'high' },
            { msg: 'New public record found for Monitored Entity A.', time: '45m ago', type: 'info' },
            { msg: 'System update completed successfully.', time: '2h ago', type: 'success' },
          ].map((alert, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded bg-slate-950 border border-slate-800">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                alert.type === 'high' ? 'bg-red-500' : alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
              }`} />
              <div>
                <p className="text-sm text-slate-300 leading-tight mb-1">{alert.msg}</p>
                <p className="text-xs text-slate-600">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 text-center text-xs text-cyan-500 hover:text-cyan-400 font-medium">
          View All Logs
        </button>
      </div>
    </div>
  </div>
);

// Generic Wrapper for Imported Modules to ensure Visual Compatibility
const CompatibleModuleWrapper: React.FC<{ module: AppModule }> = ({ module }) => (
  <div className="animate-fade-in h-full flex flex-col">
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-purple-900/20 rounded-lg">
          <module.icon className="w-6 h-6 text-purple-400" />
        </div>
        <div>
           <h2 className="text-xl font-semibold text-white">{module.label}</h2>
           <p className="text-xs text-slate-500">External Module • v{module.version || '1.0.0'} • Compatible Mode</p>
        </div>
      </div>
    </div>
    
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center text-center border-dashed">
      <Cpu className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
      <h3 className="text-lg font-medium text-slate-300">Module Active & Compatible</h3>
      <p className="text-slate-500 max-w-md mt-2">
        This module has been successfully imported and adapted to the Aegis Platform interface standards.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-lg">
         <div className="bg-slate-950 p-4 rounded border border-slate-800">
            <span className="block text-xs text-slate-500 uppercase">Latency</span>
            <span className="text-green-400 font-mono">12ms</span>
         </div>
         <div className="bg-slate-950 p-4 rounded border border-slate-800">
            <span className="block text-xs text-slate-500 uppercase">Status</span>
            <span className="text-cyan-400 font-mono">Running</span>
         </div>
         <div className="bg-slate-950 p-4 rounded border border-slate-800">
            <span className="block text-xs text-slate-500 uppercase">Secure</span>
            <span className="text-green-400 font-mono">Yes</span>
         </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState | string>(ViewState.DASHBOARD);
  const [modules, setModules] = useState<AppModule[]>(INITIAL_MODULES);
  const [enabledModuleIds, setEnabledModuleIds] = useState<Set<string>>(new Set(INITIAL_MODULES.map(m => m.id)));
  
  // Importer State
  const [showImporter, setShowImporter] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'installing' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toggleModule = (id: string) => {
      const newSet = new Set(enabledModuleIds);
      if (newSet.has(id)) {
          newSet.delete(id);
          // If we disable the current view, switch to dashboard
          const mod = modules.find(m => m.id === id);
          if (mod && mod.viewState === currentView) {
              setView(ViewState.DASHBOARD);
          }
      } else {
          newSet.add(id);
      }
      setEnabledModuleIds(newSet);
  };

  const handleImport = () => {
    // Simulate adding a new module
    setImportStep('installing');
    
    setTimeout(() => {
        const newModuleId = `custom-${Date.now()}`;
        const newModule: AppModule = {
            id: newModuleId,
            label: 'Social Graph Tracker', // Simulated imported name
            icon: Box,
            isCore: false,
            viewState: newModuleId,
            version: '2.1.0-beta'
        };
        
        setModules(prev => [...prev.slice(0, prev.length - 1), newModule, prev[prev.length - 1]]); // Insert before Settings
        setEnabledModuleIds(prev => new Set(prev).add(newModuleId));
        setImportStep('complete');
    }, 2000);
  };

  const closeImporter = () => {
      setShowImporter(false);
      setImportStep('upload');
      setSelectedFile(null);
  };

  const getCurrentModule = () => modules.find(m => m.viewState === currentView);
  
  // Filter modules for Sidebar
  const activeModules = modules.filter(m => enabledModuleIds.has(m.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-900 selection:text-white relative">
      
      {/* Module Importer Modal */}
      {showImporter && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-950">
                      <h3 className="font-bold text-white flex items-center gap-2">
                          <Box className="w-5 h-5 text-cyan-400" />
                          Import Module
                      </h3>
                      <button onClick={closeImporter}><X className="w-5 h-5 text-slate-500 hover:text-white" /></button>
                  </div>
                  
                  <div className="p-8 text-center">
                      {importStep === 'upload' && (
                          <div 
                            className="border-2 border-dashed border-slate-700 rounded-lg p-8 hover:border-cyan-500/50 hover:bg-slate-800/30 transition-all cursor-pointer group"
                            onClick={() => setSelectedFile('aegis-social-graph-v2.1.zip')}
                          >
                              {selectedFile ? (
                                  <div className="flex flex-col items-center">
                                      <Box className="w-12 h-12 text-cyan-500 mb-3" />
                                      <p className="text-white font-medium">{selectedFile}</p>
                                      <p className="text-xs text-slate-500 mt-1">Ready to install</p>
                                  </div>
                              ) : (
                                  <div className="flex flex-col items-center">
                                      <Upload className="w-12 h-12 text-slate-600 group-hover:text-cyan-400 mb-3 transition-colors" />
                                      <p className="text-slate-300 font-medium">Click to upload package</p>
                                      <p className="text-xs text-slate-500 mt-1">Supports .zip, .tar.gz (Aegis Compatible)</p>
                                  </div>
                              )}
                          </div>
                      )}

                      {importStep === 'installing' && (
                          <div className="flex flex-col items-center py-4">
                              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                              <h4 className="text-lg font-bold text-white">Installing Module...</h4>
                              <p className="text-sm text-slate-400 mt-2">Verifying integrity and adapting styles</p>
                          </div>
                      )}

                      {importStep === 'complete' && (
                          <div className="flex flex-col items-center py-4">
                              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                  <Check className="w-6 h-6 text-green-500" />
                              </div>
                              <h4 className="text-lg font-bold text-white">Import Successful</h4>
                              <p className="text-sm text-slate-400 mt-2">"Social Graph Tracker" is now active.</p>
                          </div>
                      )}
                  </div>

                  <div className="p-4 border-t border-slate-700 bg-slate-950 flex justify-end">
                      {importStep === 'upload' && (
                          <button 
                            disabled={!selectedFile}
                            onClick={handleImport}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold text-sm"
                          >
                              Install
                          </button>
                      )}
                      {importStep === 'complete' && (
                          <button 
                            onClick={closeImporter}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold text-sm"
                          >
                              Close
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        modules={activeModules} 
        onImportClick={() => setShowImporter(true)}
      />
      
      <main className="ml-64 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
           {/* Header Area */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {getCurrentModule()?.label || 'Unknown Module'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                 {currentView === ViewState.ROADMAP ? 'Technical implementation guide' : 'Secure connection established. Monitoring protocols active.'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex-1 text-right">
                  {currentView !== ViewState.WORDPRESS && (
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
                        <Lock className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-mono text-slate-400">ENCRYPTED_LINK_V4</span>
                    </div>
                  )}
               </div>
               <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
               </button>
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-slate-900 ring-2 ring-slate-800"></div>
            </div>
          </div>
          
          <div style={{ display: currentView === ViewState.WORDPRESS ? 'block' : 'none' }}>
            <WordPressModule />
          </div>

          {currentView === ViewState.DASHBOARD && <DashboardOverview />}
          {currentView === ViewState.SCANNER && <Scanner />}
          {currentView === ViewState.NETWORK_GRAPH && <NetworkGraph />}
          {currentView === ViewState.VALIDATOR && <Validator />}
          {currentView === ViewState.MPC_SERVER && <MPCModule />}
          {currentView === ViewState.AUTONOMY && <AutonomyModule />}
          {currentView === ViewState.WEB_TRACKER && <WebTracker />}
          {currentView === ViewState.ROADMAP && <Roadmap />}
          {currentView === ViewState.SETTINGS && (
            <Settings 
                modules={modules} 
                enabledModuleIds={enabledModuleIds} 
                onToggleModule={toggleModule} 
            />
          )}
          
          {/* Render Imported Custom Modules */}
          {!Object.values(ViewState).includes(currentView as any) && (
             <CompatibleModuleWrapper module={getCurrentModule()!} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
