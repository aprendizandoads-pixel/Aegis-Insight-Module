import React, { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Globe, ExternalLink, Loader2, Radio, Activity } from 'lucide-react';
import { scanEntity } from '../services/geminiService';
import { EntityProfile, AnalysisStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Scanner: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [data, setData] = useState<EntityProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setStatus(AnalysisStatus.ANALYZING);
    setError(null);
    setData(null);

    try {
      const result = await scanEntity(query);
      setData(result);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during scanning.');
      setStatus(AnalysisStatus.ERROR);
    }
  };

  // Live Data Feed Simulation
  useEffect(() => {
    if (status !== AnalysisStatus.COMPLETE) return;

    const interval = setInterval(() => {
      setData((currentData) => {
        if (!currentData) return null;

        // Clone data to avoid mutation
        const nextData = {
          ...currentData,
          metrics: currentData.metrics.map(m => ({ ...m })),
          sources: [...currentData.sources]
        };

        // 30% chance to update a metric score
        if (Math.random() < 0.3) {
          const idx = Math.floor(Math.random() * nextData.metrics.length);
          const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
          let newScore = nextData.metrics[idx].score + change;
          newScore = Math.max(0, Math.min(100, newScore));
          
          nextData.metrics[idx].score = newScore;
          
          // Adjust severity based on score
          if (newScore >= 80) nextData.metrics[idx].severity = 'critical';
          else if (newScore >= 60) nextData.metrics[idx].severity = 'high';
          else if (newScore >= 30) nextData.metrics[idx].severity = 'medium';
          else nextData.metrics[idx].severity = 'low';
        }

        // 15% chance to add a new simulated source
        if (Math.random() < 0.15) {
          const newSource = {
            title: `Real-time Signal: Detected activity on Node ${Math.floor(Math.random() * 999)}`,
            uri: `#${Date.now()}`
          };
          nextData.sources.unshift(newSource);
          // Keep list manageable
          if (nextData.sources.length > 20) nextData.sources.pop();
        }

        return nextData;
      });
    }, 2500); // Update every 2.5s

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Digital Footprint Scanner
        </h2>
        <p className="text-slate-400 mb-6 text-sm">
          Enter a name, username, or entity to generate a protective intelligence profile using open-source intelligence (OSINT) and AI analysis.
        </p>
        
        <form onSubmit={handleScan} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Acme Corp, John Doe, CryptoWallet_XYZ..."
              className="w-full bg-slate-950 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
            />
          </div>
          <button
            type="submit"
            disabled={status === AnalysisStatus.ANALYZING}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 px-6 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === AnalysisStatus.ANALYZING ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              'Initialize Scan'
            )}
          </button>
        </form>
      </div>

      {status === AnalysisStatus.ERROR && (
        <div className="bg-red-950/30 border border-red-900/50 text-red-200 p-4 rounded-lg flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div>
            <h4 className="font-semibold text-red-400">Scan Failed</h4>
            <p className="text-sm opacity-90 mt-1">{error}</p>
          </div>
        </div>
      )}

      {status === AnalysisStatus.COMPLETE && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{data.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Analyzed: {new Date(data.generatedAt).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span className={`uppercase font-bold tracking-wider text-xs ${data.sentiment === 'negative' ? 'text-red-400' : 'text-green-400'}`}>
                      {data.sentiment} Sentiment
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                     <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                     </span>
                     <span className="text-xs font-mono text-cyan-400">LIVE FEED ACTIVE</span>
                  </div>
                </div>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-6 border-l-2 border-cyan-500 pl-4 bg-slate-950/50 py-2 rounded-r">
                {data.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.metrics.map((metric, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm font-medium">{metric.category}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                        metric.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                        metric.severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                        metric.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-green-900/50 text-green-400'
                      }`}>
                        {metric.severity}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          metric.severity === 'critical' ? 'bg-red-500' :
                          metric.severity === 'high' ? 'bg-orange-500' :
                          metric.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${metric.score}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500">{metric.details}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Risk Composition</h4>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.metrics as any[]}
                                    dataKey="score"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                >
                                    {data.metrics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Risk Levels</h4>
                    <div className="h-48">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.metrics as any[]} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="category" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                                <Bar dataKey="score" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </div>

          {/* Sidebar - Sources & Actions */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col h-[500px]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-400 animate-pulse" />
                Live Intelligence Stream
              </h3>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {data.sources.length > 0 ? (
                  data.sources.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-slate-950/50 hover:bg-slate-800 border border-slate-800 rounded-md transition-all group animate-fade-in"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-slate-300 font-medium line-clamp-2 group-hover:text-cyan-400 transition-colors">
                          {source.title}
                        </span>
                        {source.uri !== '#' && <ExternalLink className="w-3 h-3 text-slate-600 flex-shrink-0 mt-1" />}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-600 truncate">
                           {source.uri === '#' ? 'Encrypted Source' : new URL(source.uri).hostname}
                        </span>
                        <span className="text-[10px] text-slate-700 font-mono">
                          {idx === 0 ? 'JUST NOW' : 'ARCHIVED'}
                        </span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-600">
                     <Activity className="w-8 h-8 mb-2 opacity-50" />
                     <p className="text-sm">Waiting for signals...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Export Report</h3>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded border border-slate-700 transition-colors text-sm font-medium mb-3">
                Download PDF Summary
              </button>
              <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded border border-slate-700 transition-colors text-sm font-medium">
                Share Secure Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};