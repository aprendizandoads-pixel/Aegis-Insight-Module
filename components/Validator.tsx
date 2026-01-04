import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Zap, RefreshCw, Copy, Info, Terminal, Wrench, ChevronRight, Play, Loader2, CheckCircle, Lock } from 'lucide-react';
import { validateContent } from '../services/geminiService';
import { ValidatorResult, AnalysisStatus } from '../types';

export const Validator: React.FC = () => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<ValidatorResult | null>(null);
  
  // Remediation State
  const [isRemediating, setIsRemediating] = useState(false);
  const [remediationLogs, setRemediationLogs] = useState<{id: number, msg: string, status: 'pending'|'success'}[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const handleValidation = async () => {
    if (!input.trim()) return;
    setStatus(AnalysisStatus.ANALYZING);
    // Reset remediation state on new scan
    setRemediationLogs([]);
    setIsRemediating(false);
    
    try {
      const res = await validateContent(input);
      setResult(res);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (e) {
      console.error(e);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleRemediation = async () => {
    if (!result?.remediationPlan) return;
    setIsRemediating(true);
    setRemediationLogs([]);
    
    // Initial connection simulation
    const startId = Date.now();
    setRemediationLogs([{id: startId, msg: "Initializing Autonomous Defense Protocol...", status: 'pending'}]);
    await new Promise(r => setTimeout(r, 1000));
    setRemediationLogs(prev => [{...prev[0], status: 'success'}]);

    // Iterate through plan
    const plan = result.remediationPlan;
    for (let i = 0; i < plan.length; i++) {
        const step = plan[i];
        const stepId = startId + i + 1;
        
        setRemediationLogs(prev => [...prev, {id: stepId, msg: `Executing: ${step}`, status: 'pending'}]);
        
        // Simulate processing time
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
        
        setRemediationLogs(prev => {
            const logs = [...prev];
            const logIndex = logs.findIndex(l => l.id === stepId);
            if (logIndex !== -1) logs[logIndex].status = 'success';
            return logs;
        });
    }
    
    setRemediationLogs(prev => [...prev, {id: startId + 999, msg: "All detected threats neutralized. System hardened.", status: 'success'}]);
    setIsRemediating(false);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [remediationLogs]);

  const clear = () => {
    setInput('');
    setResult(null);
    setStatus(AnalysisStatus.IDLE);
    setRemediationLogs([]);
    setIsRemediating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Real-time Threat Validator
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Paste emails, SMS, URLs, or code snippets here to check for security threats and generate a remediation plan.
        </p>
        
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste suspicious content or URL here..."
          className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 p-4 rounded-md resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none mb-4 font-mono text-sm"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={clear}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            Clear
          </button>
          <button
            onClick={handleValidation}
            disabled={status === AnalysisStatus.ANALYZING || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-all shadow-lg shadow-cyan-900/20"
          >
            {status === AnalysisStatus.ANALYZING ? 'Analyzing...' : 'Validate Content'}
          </button>
        </div>
      </div>

      {/* Result Section */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-140px)]">
        {result ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex-1 animate-fade-in space-y-6">
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${
              result.isThreat 
                ? 'bg-red-950/30 border-red-900/50 text-red-400' 
                : 'bg-green-950/30 border-green-900/50 text-green-400'
            }`}>
              {result.isThreat ? (
                <ShieldAlert className="w-8 h-8 flex-shrink-0" />
              ) : (
                <ShieldCheck className="w-8 h-8 flex-shrink-0" />
              )}
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  {result.isThreat ? 'Potential Threat Detected' : 'Content Appears Safe'}
                </h3>
                <p className="text-sm opacity-80">
                  Confidence Level: {result.confidence}%
                </p>
              </div>
            </div>

            {/* Core Analysis */}
            <div className="space-y-4">
               <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Analysis</h4>
                  <div className="bg-slate-950 p-4 rounded border border-slate-800">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-white font-medium bg-slate-800 px-2 py-0.5 rounded text-sm">{result.type || 'General'}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {result.reasoning}
                    </p>
                  </div>
               </div>

               {/* Technical Details */}
               {result.technicalAnalysis && (
                 <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Terminal className="w-4 h-4" />
                      Technical Findings
                    </h4>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs text-cyan-300 leading-relaxed border-l-2 border-l-cyan-500">
                      {result.technicalAnalysis}
                    </div>
                 </div>
               )}

               {/* Remediation Plan */}
               {result.remediationPlan && result.remediationPlan.length > 0 && (
                 <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Remediation Plan
                    </h4>
                   <div className="space-y-2">
                      {result.remediationPlan.map((step, idx) => (
                        <div key={idx} className="flex gap-3 bg-slate-950/50 p-3 rounded border border-slate-800/50">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold border border-slate-700">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-slate-300 mt-0.5">{step}</p>
                        </div>
                      ))}
                   </div>

                   {/* AI Action Trigger */}
                   {!isRemediating && remediationLogs.length === 0 && (
                      <button
                        onClick={handleRemediation}
                        className="mt-6 w-full group relative flex items-center justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 focus:outline-none shadow-lg shadow-red-900/30 overflow-hidden transition-all hover:scale-[1.02]"
                      >
                          <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 transform -skew-x-12 origin-left" />
                          <Zap className="w-5 h-5 mr-2 animate-pulse text-yellow-300" />
                          Initiate Autonomous Correction
                      </button>
                   )}

                   {/* Execution Console */}
                   {(isRemediating || remediationLogs.length > 0) && (
                      <div className="mt-6 bg-black rounded-lg border border-slate-800 p-4 font-mono text-xs shadow-inner">
                          <div className="flex items-center justify-between mb-3 border-b border-slate-900 pb-2">
                              <div className="flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-green-400" />
                                <span className="text-slate-400 uppercase tracking-wider font-bold">AI Command Interface</span>
                              </div>
                              {isRemediating && <span className="text-green-500 animate-pulse text-[10px]">ACTIVE</span>}
                          </div>
                          <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                              {remediationLogs.map((log) => (
                                  <div key={log.id} className="flex items-start gap-3 animate-fade-in">
                                      {log.status === 'pending' ? (
                                          <Loader2 className="w-3 h-3 text-cyan-400 animate-spin mt-0.5 flex-shrink-0" />
                                      ) : (
                                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                      )}
                                      <span className={`leading-relaxed break-words ${log.status === 'success' ? 'text-green-400' : 'text-cyan-300'}`}>
                                          {log.msg} {log.status === 'success' && <span className="opacity-50 text-[10px] ml-2">[DONE]</span>}
                                      </span>
                                  </div>
                              ))}
                              <div ref={logsEndRef} />
                          </div>
                      </div>
                   )}
                 </div>
               )}

               {/* Safety Tips */}
               {!result.technicalAnalysis && !isRemediating && remediationLogs.length === 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Safety Recommendations</h4>
                    <ul className="space-y-2">
                      {result.safetyTips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <Info className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
               )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/50 border-dashed rounded-lg p-6 flex-1 flex flex-col items-center justify-center text-slate-500">
            <RefreshCw className={`w-12 h-12 mb-4 ${status === AnalysisStatus.ANALYZING ? 'animate-spin text-cyan-500' : ''}`} />
            <p className="text-center max-w-xs">
              {status === AnalysisStatus.ANALYZING 
               ? 'Scanning content vectors and cross-referencing threat databases...' 
               : 'Ready to analyze. Provide a URL, text, or code snippet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};