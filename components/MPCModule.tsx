import React, { useState, useEffect, useRef } from 'react';
import { Server, Shield, Lock, Activity, Share2, Database, Cpu, Play, Terminal, CheckCircle2, AlertCircle, RefreshCw, Network, Zap, GitMerge, Loader2, Power, Key } from 'lucide-react';

interface MPCNode {
  id: string;
  name: string;
  status: 'active' | 'offline' | 'computing' | 'syncing';
  role: 'coordinator' | 'worker';
  latency: number;
  load: number;
}

interface MPCJob {
  id: string;
  type: 'inference' | 'training' | 'keygen';
  model: string;
  privacyBudget: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

export const MPCModule: React.FC = () => {
  // Server Power State
  const [isServerActive, setIsServerActive] = useState(false);
  const [bootSequence, setBootSequence] = useState(0);

  // State for nodes
  const [nodes, setNodes] = useState<MPCNode[]>([
    { id: 'n1', name: 'Aegis-Core (Local)', status: 'offline', role: 'coordinator', latency: 0, load: 0 },
    { id: 'n2', name: 'Node-US-East', status: 'offline', role: 'worker', latency: 0, load: 0 },
    { id: 'n3', name: 'Node-EU-West', status: 'offline', role: 'worker', latency: 0, load: 0 },
    { id: 'n4', name: 'Node-APAC-01', status: 'offline', role: 'worker', latency: 0, load: 0 },
  ]);

  // State for DKG (Distributed Key Generation)
  const [dkgStatus, setDkgStatus] = useState<'idle' | 'initializing' | 'broadcasting' | 'verifying' | 'secure'>('idle');
  const [dkgProgress, setDkgProgress] = useState(0);

  // State for Jobs
  const [jobs, setJobs] = useState<MPCJob[]>([]);

  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handle Power Toggle
  const togglePower = () => {
    if (isServerActive) {
        // Shutdown
        setIsServerActive(false);
        setBootSequence(0);
        setNodes(prev => prev.map(n => ({...n, status: 'offline', load: 0})));
        setDkgStatus('idle');
        setDkgProgress(0);
        addLog('Server Shutdown Sequence Initiated...');
    } else {
        // Boot up
        setBootSequence(1);
        addLog('Initializing Aegis MPC Boot Sequence...');
        setTimeout(() => {
            setBootSequence(2);
            addLog('Verifying Master Key...');
        }, 1000);
        setTimeout(() => {
            setBootSequence(3);
            addLog('Connecting to Secure Enclave...');
        }, 2000);
        setTimeout(() => {
            setIsServerActive(true);
            setBootSequence(0);
            setNodes(prev => prev.map(n => ({...n, status: 'active', load: Math.floor(Math.random() * 20)})));
            setJobs([
                { id: 'job-x92', type: 'keygen', model: 'AES-256-GCM', privacyBudget: 0, status: 'completed', progress: 100 },
                { id: 'job-a11', type: 'inference', model: 'Gemini-3-Flash (Enclave)', privacyBudget: 0.05, status: 'processing', progress: 45 },
            ]);
            addLog('Server Online. Ready for Computation.');
        }, 3000);
    }
  };

  // Simulation Effects (Only run when server is active)
  useEffect(() => {
    if (!isServerActive) return;

    const interval = setInterval(() => {
      // Simulate Job Progress
      setJobs(prev => prev.map(job => {
        if (job.status === 'processing') {
          const newProgress = Math.min(100, job.progress + Math.random() * 8);
          if (newProgress >= 100) {
            addLog(`Job ${job.id} completed successfully.`);
            return { ...job, status: 'completed', progress: 100 };
          }
          return { ...job, progress: newProgress };
        }
        return job;
      }));

      // Simulate Load fluctuation
      setNodes(prev => prev.map(node => ({
        ...node,
        load: Math.max(5, Math.min(95, node.load + (Math.random() * 10 - 5)))
      })));

      // Process pending jobs if bandwidth allows
      setJobs(prev => {
        const processing = prev.filter(j => j.status === 'processing');
        if (processing.length < 2) {
          const next = prev.find(j => j.status === 'pending');
          if (next) {
            addLog(`Allocating secure enclave for job ${next.id} (${next.type})...`);
            return prev.map(j => j.id === next.id ? { ...j, status: 'processing' } : j);
          }
        }
        return prev;
      });

    }, 1000);
    return () => clearInterval(interval);
  }, [isServerActive]);

  const startDKG = () => {
    if (dkgStatus !== 'idle' && dkgStatus !== 'secure') return;
    setDkgStatus('initializing');
    setDkgProgress(0);
    addLog('Initiating Distributed Key Generation protocol...');

    let p = 0;
    const interval = setInterval(() => {
      p += 4;
      setDkgProgress(p);
      
      if (p === 20) {
          setDkgStatus('broadcasting');
          addLog('Broadcasting commitments to peers...');
      }
      if (p === 60) {
          setDkgStatus('verifying');
          addLog('Verifying zero-knowledge proofs...');
      }
      if (p >= 100) {
          clearInterval(interval);
          setDkgStatus('secure');
          addLog('DKG Complete. Shared secret established.');
      }
    }, 150);
  };

  const addInferenceJob = () => {
      const id = `job-${Math.floor(Math.random()*1000)}`;
      setJobs(prev => [...prev, {
          id,
          type: 'inference',
          model: 'Gemini-3-Pro (MPC)',
          privacyBudget: 0.1,
          status: 'pending',
          progress: 0
      }]);
      addLog(`Job ${id} submitted to queue.`);
  };

  if (!isServerActive && bootSequence === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center space-y-8 animate-fade-in relative overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 z-0 opacity-10">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <Server className="w-10 h-10 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-widest uppercase">MPC Server Offline</h2>
                <p className="text-slate-500 mt-2 font-mono text-sm">Secure Computation Enclave is currently powered down.</p>
                
                <button 
                    onClick={togglePower}
                    className="mt-8 group relative flex items-center gap-3 px-8 py-4 bg-slate-900 border border-indigo-500/30 hover:border-indigo-400 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                >
                    <div className="p-2 bg-indigo-600 rounded-full group-hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/50">
                        <Power className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left mr-2">
                        <span className="block text-xs text-indigo-400 uppercase font-bold tracking-wider">Master Key</span>
                        <span className="block text-white font-semibold">Initialize Server</span>
                    </div>
                </button>
            </div>
        </div>
      );
  }

  if (bootSequence > 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center animate-fade-in">
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Booting Secure Enclave...</h3>
              <div className="flex flex-col gap-2 items-center text-sm font-mono text-slate-400">
                  <span className={bootSequence >= 1 ? 'text-green-400' : 'opacity-50'}>{'>'} System Check</span>
                  <span className={bootSequence >= 2 ? 'text-green-400' : 'opacity-50'}>{'>'} Verifying Master Key Integrity</span>
                  <span className={bootSequence >= 3 ? 'text-green-400' : 'opacity-50'}>{'>'} Establishing P2P Mesh</span>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-indigo-900/30 rounded-full text-indigo-400">
                  <Network className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-white">4</h3>
                  <p className="text-xs text-slate-500 uppercase">Active Nodes</p>
              </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-purple-900/30 rounded-full text-purple-400">
                  <Lock className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-white">AES-256</h3>
                  <p className="text-xs text-slate-500 uppercase">Enclave Security</p>
              </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-cyan-900/30 rounded-full text-cyan-400">
                  <Cpu className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-white">12.4 TFLOPS</h3>
                  <p className="text-xs text-slate-500 uppercase">Privacy Compute</p>
              </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex items-center gap-4">
              <div className="p-3 bg-green-900/30 rounded-full text-green-400">
                  <Activity className="w-6 h-6" />
              </div>
              <div>
                  <h3 className="text-2xl font-bold text-white">99.98%</h3>
                  <p className="text-xs text-slate-500 uppercase">Network Uptime</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Column: Network Topology & Controls */}
          <div className="xl:col-span-2 flex flex-col gap-6">
              {/* Nodes Visualization */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Server className="w-5 h-5 text-indigo-400" />
                          Network Topology
                      </h3>
                      <div className="flex gap-3">
                         <button 
                            onClick={togglePower}
                            className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                         >
                            <Power className="w-3 h-3" /> Shutdown
                         </button>
                         <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-slate-700 px-2 py-1.5 rounded">
                            <RefreshCw className="w-3 h-3" /> Refresh
                         </button>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nodes.map(node => (
                          <div key={node.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
                              <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full ${
                                      node.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                                      node.status === 'syncing' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
                                  }`} />
                                  <div>
                                      <h4 className="text-sm font-bold text-slate-200">{node.name}</h4>
                                      <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                          {node.role.toUpperCase()} 
                                          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                          {node.latency}ms
                                      </p>
                                  </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs text-slate-400">Load</span>
                                  <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${node.load > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                                        style={{width: `${node.load}%`}} 
                                      />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* DKG Visualizer */}
                  <div className="mt-6 p-6 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden">
                      <div className="flex justify-between items-end mb-4 relative z-10">
                          <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-purple-400" />
                                  Secure Multiparty State
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">
                                  {dkgStatus === 'idle' ? 'Ready to initialize' : 
                                   dkgStatus === 'secure' ? 'Secure session established' : 
                                   `Protocol executing: ${dkgStatus}...`}
                              </p>
                          </div>
                          <button 
                            onClick={startDKG}
                            disabled={dkgStatus !== 'idle' && dkgStatus !== 'secure'}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-2"
                          >
                             {dkgStatus === 'idle' || dkgStatus === 'secure' ? <Play className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                             {dkgStatus === 'secure' ? 'Re-Key Network' : 'Start DKG Protocol'}
                          </button>
                      </div>

                      {/* Progress Visualization */}
                      <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden z-10">
                          <div 
                             className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-200"
                             style={{width: `${dkgProgress}%`}}
                          />
                      </div>
                      
                      {/* Background Decoration */}
                      <div className="absolute top-0 right-0 p-8 opacity-5 z-0">
                          <GitMerge className="w-32 h-32" />
                      </div>
                  </div>
              </div>

              {/* Console / Logs */}
              <div className="bg-black border border-slate-800 rounded-lg p-4 flex-1 flex flex-col min-h-[200px] font-mono text-xs">
                   <div className="flex items-center gap-2 text-slate-500 border-b border-slate-900 pb-2 mb-2">
                       <Terminal className="w-3 h-3" />
                       <span className="uppercase tracking-wider">Protocol Events</span>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                       {logs.map((log, idx) => (
                           <div key={idx} className="text-slate-400 hover:text-slate-200 animate-fade-in">
                               <span className="text-indigo-500 mr-2">{'>'}</span>{log}
                           </div>
                       ))}
                       <div ref={logsEndRef} />
                   </div>
              </div>
          </div>

          {/* Right Column: Jobs & Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col h-full">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Inference Queue
                  </h3>
                  <button onClick={addInferenceJob} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                      <Play className="w-4 h-4" />
                  </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {jobs.map(job => (
                      <div key={job.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 relative overflow-hidden group">
                          {/* Progress bar background for processing jobs */}
                          {job.status === 'processing' && (
                              <div 
                                className="absolute bottom-0 left-0 h-0.5 bg-cyan-500 transition-all duration-1000" 
                                style={{width: `${job.progress}%`}}
                              />
                          )}
                          
                          <div className="flex justify-between items-start mb-2 relative z-10">
                              <div>
                                  <h5 className="text-sm font-bold text-slate-200">{job.model}</h5>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">
                                      ID: {job.id} • {job.type}
                                  </p>
                              </div>
                              {job.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : job.status === 'processing' ? (
                                  <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                              ) : (
                                  <div className="w-2 h-2 rounded-full bg-slate-600" />
                              )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-slate-500 relative z-10">
                              <Share2 className="w-3 h-3" />
                              <span>Privacy Budget: {job.privacyBudget} ε</span>
                          </div>
                      </div>
                  ))}
                  
                  {jobs.length === 0 && (
                      <div className="text-center py-10 text-slate-600">
                          <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>No active jobs</p>
                      </div>
                  )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Total Privacy Budget Consumed</span>
                      <span className="text-white">1.24 ε</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-[12%] h-full rounded-full" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};