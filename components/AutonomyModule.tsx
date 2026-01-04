
import React, { useState, useEffect, useRef } from 'react';
import { Bot, Terminal, Play, Pause, Zap, CheckCircle, AlertOctagon, FileCode, Database, Settings, ShieldAlert, ArrowRight, RotateCcw, FileDiff, Activity } from 'lucide-react';
import { DiagnosticIssue } from '../types';
import { generateAutoFix } from '../services/geminiService';

interface AutoTask {
  id: string;
  type: 'security_patch' | 'db_optimization' | 'config_hardening' | 'malware_removal';
  target: string;
  status: 'pending' | 'analyzing' | 'patching' | 'verifying' | 'completed';
  progress: number;
  logs: string[];
}

const MOCK_TASKS: AutoTask[] = [
  { id: 't1', type: 'db_optimization', target: 'wp_options', status: 'pending', progress: 0, logs: [] },
  { id: 't2', type: 'config_hardening', target: 'wp-config.php', status: 'pending', progress: 0, logs: [] },
  { id: 't3', type: 'malware_removal', target: 'wp-content/uploads/backdoor.php', status: 'pending', progress: 0, logs: [] },
];

export const AutonomyModule: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [tasks, setTasks] = useState<AutoTask[]>(MOCK_TASKS);
  const [currentTask, setCurrentTask] = useState<AutoTask | null>(null);
  
  // Patch Visualization
  const [patchData, setPatchData] = useState<{ original: string, patched: string, explanation: string } | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const processTask = async (task: AutoTask) => {
    setCurrentTask({ ...task, status: 'analyzing', progress: 10 });
    
    // 1. Analysis Phase
    await new Promise(r => setTimeout(r, 1500));
    setCurrentTask(prev => prev ? ({ ...prev, status: 'analyzing', progress: 40, logs: [...prev.logs, 'Analyzing vector...', 'Identifying remediation strategy...'] }) : null);

    // 2. Generate Patch (Call Gemini)
    const mockIssue: DiagnosticIssue = {
        id: task.id,
        severity: 'high',
        layer: task.type === 'db_optimization' ? 'database' : 'filesystem',
        location: task.target,
        description: `Autonomous fix for ${task.type}`,
        solution: 'Apply patch',
        fix: 'Patch code',
        status: 'pending'
    };
    
    const patch = await generateAutoFix(mockIssue);
    setPatchData({
        original: patch.originalCode,
        patched: patch.patchedCode,
        explanation: patch.explanation
    });
    
    // 3. Application Phase
    setCurrentTask(prev => prev ? ({ ...prev, status: 'patching', progress: 60, logs: [...prev.logs, 'Patch generated.', 'Requesting write access...', 'Applying delta...'] }) : null);
    setShowDiff(true);
    
    await new Promise(r => setTimeout(r, 3000)); // Let user see the diff animation
    
    // 4. Verification
    setCurrentTask(prev => prev ? ({ ...prev, status: 'verifying', progress: 90, logs: [...prev.logs, 'Patch applied.', 'Verifying integrity...', 'Running smoke tests...'] }) : null);
    await new Promise(r => setTimeout(r, 1500));
    
    // 5. Completion
    setTasks(prev => prev.map(t => t.id === task.id ? { ...task, status: 'completed', progress: 100 } : t));
    setCurrentTask(null);
    setShowDiff(false);
    setPatchData(null);
  };

  useEffect(() => {
    if (!isActive) return;

    const runQueue = async () => {
        const pending = tasks.find(t => t.status === 'pending');
        if (pending) {
            await processTask(pending);
        } else {
            setIsActive(false); // All done
        }
    };

    if (!currentTask) {
        runQueue();
    }
  }, [isActive, currentTask, tasks]);

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      {/* Header / Control Center */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400" />
            Aegis Autonomy Engine
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Autonomous Level 4: Self-Correction & Remediation System
          </p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-right hidden md:block">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Agents Online</p>
              <p className="text-xl font-mono text-green-400">3 ACTIVE</p>
           </div>
           
           <button
             onClick={() => setIsActive(!isActive)}
             disabled={tasks.every(t => t.status === 'completed')}
             className={`px-8 py-4 rounded-full font-bold text-sm flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] ${
                 isActive 
                 ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20' 
                 : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/30'
             }`}
           >
             {isActive ? (
                 <>
                    <Pause className="w-5 h-5 fill-current" />
                    PAUSE AUTONOMY
                 </>
             ) : (
                 <>
                    <Play className="w-5 h-5 fill-current" />
                    ENGAGE AUTONOMY
                 </>
             )}
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* Left Col: Task Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Remediation Queue
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {tasks.map(task => (
                    <div 
                        key={task.id} 
                        className={`p-4 rounded border transition-all ${
                            task.id === currentTask?.id 
                            ? 'bg-indigo-900/20 border-indigo-500/50 shadow-lg shadow-indigo-900/10 scale-105' 
                            : task.status === 'completed'
                                ? 'bg-slate-950/50 border-slate-800 opacity-50'
                                : 'bg-slate-950 border-slate-800'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                task.type === 'malware_removal' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
                            }`}>
                                {task.type.replace('_', ' ')}
                            </span>
                            {task.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : task.id === currentTask?.id ? (
                                <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-700" />
                            )}
                        </div>
                        <p className="text-sm font-mono text-slate-300 truncate mb-2">{task.target}</p>
                        
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 transition-all duration-500"
                                style={{ width: `${task.status === 'completed' ? 100 : task.id === currentTask?.id ? currentTask.progress : 0}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Center Col: The "Work" Bench (Diff Viewer) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-lg flex flex-col overflow-hidden relative">
            
            {/* Overlay if idle */}
            {!currentTask && tasks.some(t => t.status === 'pending') && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
                    <Bot className="w-16 h-16 text-slate-700 mb-4" />
                    <p className="text-slate-500">System Standby. Engage Autonomy to process queue.</p>
                </div>
            )}
            
            {/* Header */}
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-green-400" />
                    <span className="font-mono text-sm text-slate-300">
                        {currentTask ? `root@aegis-core:~/ops/${currentTask.id}` : 'root@aegis-core:~'}
                    </span>
                </div>
                {currentTask && (
                    <span className="text-xs text-indigo-400 animate-pulse font-mono">
                        PROCESSING [{currentTask.target}]
                    </span>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 font-mono text-xs overflow-y-auto custom-scrollbar">
                
                {/* Status Logs */}
                <div className="mb-6 space-y-1">
                    {currentTask?.logs.map((log, i) => (
                        <div key={i} className="text-slate-400 flex items-center gap-2">
                            <span className="text-slate-600">{new Date().toLocaleTimeString()}</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            {log}
                        </div>
                    ))}
                    {currentTask?.status === 'analyzing' && (
                        <div className="flex items-center gap-2 text-indigo-400">
                            <span className="animate-spin">|</span> Generating logic...
                        </div>
                    )}
                </div>

                {/* Diff Viewer */}
                {showDiff && patchData && (
                    <div className="border border-slate-800 rounded-lg overflow-hidden animate-fade-in-up">
                        <div className="bg-slate-900 px-4 py-2 flex justify-between items-center border-b border-slate-800">
                             <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                <FileDiff className="w-3 h-3" />
                                Proposed Patch
                             </span>
                             <span className="text-[10px] text-slate-500">Gemini-3-Flash Generated</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-slate-800">
                            <div className="bg-red-950/10 p-4 overflow-x-auto">
                                <p className="text-[10px] text-red-500/50 mb-2 uppercase font-bold text-center">Current State</p>
                                <pre className="text-red-300/80">{patchData.original}</pre>
                            </div>
                            <div className="bg-green-950/10 p-4 overflow-x-auto relative">
                                <div className="absolute inset-0 bg-green-500/5 animate-pulse pointer-events-none" />
                                <p className="text-[10px] text-green-500/50 mb-2 uppercase font-bold text-center">Post-Remediation</p>
                                <pre className="text-green-300">{patchData.patched}</pre>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-3 text-slate-400 border-t border-slate-800 italic">
                            Running simulation: {patchData.explanation}
                        </div>
                    </div>
                )}
            </div>

            {/* Terminal Footer */}
            <div className="bg-slate-900 p-2 border-t border-slate-800 text-center">
                 <p className="text-[10px] text-slate-600">
                     Aegis Autonomy Engine v2.0 • Access Level: ROOT • <span className="text-green-500">Secure Enclave Active</span>
                 </p>
            </div>
        </div>

      </div>
    </div>
  );
};
