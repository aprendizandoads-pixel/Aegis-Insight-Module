
import React, { useState, useEffect, useRef } from 'react';
import { Share2, User, Globe, Server, Wallet, ZoomIn, ZoomOut, Maximize, Filter, Download, Plus, Info, ShieldAlert, X, HelpCircle } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'person' | 'domain' | 'ip' | 'wallet' | 'unknown';
  x: number;
  y: number;
  vx: number;
  vy: number;
  risk: number; // 0-100
  details: string;
}

interface Link {
  source: string;
  target: string;
  type: 'owns' | 'hosts' | 'transacted' | 'connected' | 'originates';
}

export const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isRunning, setIsRunning] = useState(true);

  // Initialize Data
  useEffect(() => {
    const initialNodes: Node[] = [
      { id: '1', label: 'John Doe', type: 'person', x: 400, y: 300, vx: 0, vy: 0, risk: 85, details: 'Suspected operator of botnet C2.' },
      { id: '2', label: '192.168.44.22', type: 'ip', x: 300, y: 200, vx: 0, vy: 0, risk: 92, details: 'Known command & control server.' },
      { id: '3', label: 'crypto-mix.io', type: 'domain', x: 500, y: 200, vx: 0, vy: 0, risk: 65, details: 'Money laundering frontend.' },
      { id: '4', label: '0x7a...9f22', type: 'wallet', x: 500, y: 400, vx: 0, vy: 0, risk: 45, details: 'High volume output wallet linked to mixing service.' },
      { id: '5', label: 'Jane Smith', type: 'person', x: 200, y: 400, vx: 0, vy: 0, risk: 15, details: 'Registered owner of domain (possible mule).' },
      { id: '6', label: '89.12.33.11', type: 'ip', x: 350, y: 100, vx: 0, vy: 0, risk: 70, details: 'Proxy node.' },
      { id: '7', label: 'nexus-labs.net', type: 'domain', x: 600, y: 300, vx: 0, vy: 0, risk: 30, details: 'Associated infrastructure.' },
      { id: '8', label: 'Unknown Source', type: 'unknown', x: 100, y: 100, vx: 0, vy: 0, risk: 80, details: 'Unidentified inbound traffic origin.' },
      { id: '9', label: 'bc1q...x882', type: 'wallet', x: 600, y: 500, vx: 0, vy: 0, risk: 95, details: 'Blacklisted BTC address.' },
    ];

    const initialLinks: Link[] = [
      { source: '1', target: '2', type: 'owns' },
      { source: '1', target: '3', type: 'owns' },
      { source: '3', target: '4', type: 'transacted' },
      { source: '2', target: '6', type: 'connected' },
      { source: '5', target: '3', type: 'owns' },
      { source: '1', target: '7', type: 'hosts' },
      { source: '8', target: '2', type: 'originates' }, // Link unknown domain to IP
      { source: '1', target: '9', type: 'owns' }, // Link person to crypto
    ];

    setNodes(initialNodes);
    setLinks(initialLinks);
  }, []);

  // Simple Physics Engine
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(n => ({ ...n }));
        const center = { x: 400, y: 300 };
        const repulsion = 1000;
        const springLength = 100;
        const springStrength = 0.05;
        const damping = 0.9;
        const centerPull = 0.005;

        // Apply Forces
        for (let i = 0; i < newNodes.length; i++) {
          let nodeA = newNodes[i];
          
          // Repulsion (Coulomb's Law-ish)
          for (let j = 0; j < newNodes.length; j++) {
            if (i === j) continue;
            let nodeB = newNodes[j];
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (dist * dist);
            nodeA.vx += (dx / dist) * force;
            nodeA.vy += (dy / dist) * force;
          }

          // Center Attraction (Gravity)
          const dxC = center.x - nodeA.x;
          const dyC = center.y - nodeA.y;
          nodeA.vx += dxC * centerPull;
          nodeA.vy += dyC * centerPull;
        }

        // Spring Forces (Links)
        links.forEach(link => {
          const source = newNodes.find(n => n.id === link.source);
          const target = newNodes.find(n => n.id === link.target);
          if (source && target) {
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const displacement = dist - springLength;
            const force = displacement * springStrength;
            
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            source.vx += fx;
            source.vy += fy;
            target.vx -= fx;
            target.vy -= fy;
          }
        });

        // Update Positions
        return newNodes.map(node => ({
          ...node,
          x: node.x + node.vx,
          y: node.y + node.vy,
          vx: node.vx * damping,
          vy: node.vy * damping
        }));
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isRunning, links]);

  const addRandomNode = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const types: Node['type'][] = ['ip', 'domain', 'wallet', 'unknown'];
    const type = types[Math.floor(Math.random() * types.length)];
    const newNode: Node = {
        id,
        label: `${type === 'ip' ? '10.0.0.' : type === 'wallet' ? '0x' : type === 'unknown' ? 'Unknown' : 'node-'}${Math.floor(Math.random()*999)}`,
        type,
        x: 400 + (Math.random() - 0.5) * 50,
        y: 300 + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        risk: Math.floor(Math.random() * 100),
        details: 'Newly discovered node via expansion.'
    };
    
    // Link to a random existing node
    const target = nodes[Math.floor(Math.random() * nodes.length)];
    setNodes(prev => [...prev, newNode]);
    setLinks(prev => [...prev, { source: target.id, target: id, type: 'connected' }]);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'person': return '#f59e0b'; // amber
      case 'ip': return '#3b82f6'; // blue
      case 'domain': return '#10b981'; // green
      case 'wallet': return '#8b5cf6'; // violet
      case 'unknown': return '#ef4444'; // red
      default: return '#64748b';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'person': return User;
      case 'ip': return Server;
      case 'domain': return Globe;
      case 'wallet': return Wallet;
      case 'unknown': return HelpCircle;
      default: return ShieldAlert;
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in gap-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-lg">
        <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                Entity Graph
            </h2>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex gap-2">
                <button 
                    onClick={() => setZoom(z => Math.min(z + 0.1, 2))} 
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                    title="Zoom In"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} 
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setIsRunning(!isRunning)} 
                    className={`p-2 rounded transition-colors ${isRunning ? 'bg-green-900/30 text-green-400 border border-green-900/50' : 'bg-slate-800 text-slate-400'}`}
                    title={isRunning ? 'Pause Physics' : 'Resume Physics'}
                >
                    <Maximize className="w-4 h-4" />
                </button>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-medium text-slate-300 hover:text-white transition-colors">
                <Filter className="w-3 h-3" />
                Filter
            </button>
             <button 
                onClick={addRandomNode}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-medium text-white transition-colors"
            >
                <Plus className="w-3 h-3" />
                Expand
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-medium text-slate-300 hover:text-white transition-colors">
                <Download className="w-3 h-3" />
                Export
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
          {/* Main Graph Area */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg relative overflow-hidden">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                  <div className="bg-slate-950/80 backdrop-blur p-2 rounded border border-slate-800 text-xs">
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Person</div>
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> IP Address</div>
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Domain</div>
                      <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-violet-500" /> Wallet</div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /> Unknown</div>
                  </div>
              </div>

              <svg 
                ref={svgRef} 
                width="100%" 
                height="100%" 
                className="w-full h-full cursor-grab active:cursor-grabbing bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]"
                onMouseDown={() => setSelectedNode(null)}
              >
                  <g transform={`scale(${zoom}) translate(0,0)`}>
                      {/* Links */}
                      {links.map((link, i) => {
                          const source = nodes.find(n => n.id === link.source);
                          const target = nodes.find(n => n.id === link.target);
                          if (!source || !target) return null;
                          return (
                              <line
                                key={i}
                                x1={source.x}
                                y1={source.y}
                                x2={target.x}
                                y2={target.y}
                                stroke="#334155"
                                strokeWidth="1"
                                opacity="0.6"
                              />
                          );
                      })}

                      {/* Nodes */}
                      {nodes.map((node) => {
                          const Icon = getNodeIcon(node.type);
                          const isSelected = selectedNode?.id === node.id;
                          return (
                              <g 
                                key={node.id} 
                                transform={`translate(${node.x},${node.y})`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNode(node);
                                }}
                                className="cursor-pointer transition-all duration-300"
                              >
                                  {/* Risk Halo */}
                                  {node.risk > 70 && (
                                      <circle r="25" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5" className="animate-pulse" />
                                  )}
                                  
                                  {/* Selection Halo */}
                                  {isSelected && (
                                      <circle r="22" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 2" className="animate-spin-slow" />
                                  )}

                                  <circle r="18" fill="#0f172a" stroke={getNodeColor(node.type)} strokeWidth="2" />
                                  <foreignObject x="-8" y="-8" width="16" height="16" className="pointer-events-none">
                                      <Icon className="w-4 h-4 text-slate-300" />
                                  </foreignObject>
                                  
                                  {/* Label */}
                                  <text y="32" textAnchor="middle" fill="#94a3b8" fontSize="10" className="pointer-events-none select-none font-mono">
                                      {node.label}
                                  </text>
                              </g>
                          );
                      })}
                  </g>
              </svg>
          </div>

          {/* Details Sidebar */}
          {selectedNode && (
              <div className="w-80 bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col animate-fade-in-right">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-opacity-20`} style={{ backgroundColor: `${getNodeColor(selectedNode.type)}33` }}>
                             {(() => {
                                 const Icon = getNodeIcon(selectedNode.type);
                                 return <Icon className="w-6 h-6" style={{ color: getNodeColor(selectedNode.type) }} />;
                             })()}
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-white leading-none">{selectedNode.label}</h3>
                              <span className="text-xs text-slate-500 uppercase font-bold">{selectedNode.type} Node</span>
                          </div>
                      </div>
                      <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="space-y-6 flex-1">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Risk Assessment</label>
                          <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${selectedNode.risk > 70 ? 'bg-red-500' : selectedNode.risk > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                    style={{ width: `${selectedNode.risk}%` }} 
                                  />
                              </div>
                              <span className={`text-sm font-mono font-bold ${selectedNode.risk > 70 ? 'text-red-400' : selectedNode.risk > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                                  {selectedNode.risk}/100
                              </span>
                          </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded border border-slate-800">
                          <div className="flex items-start gap-2">
                              <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-slate-300 leading-relaxed">
                                  {selectedNode.details}
                              </p>
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Connections</label>
                          <div className="space-y-2">
                              {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).map((link, idx) => {
                                  const isSource = link.source === selectedNode.id;
                                  const otherId = isSource ? link.target : link.source;
                                  const otherNode = nodes.find(n => n.id === otherId);
                                  return (
                                      <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-950/50 rounded border border-slate-800/50">
                                          <span className="text-slate-400">{isSource ? '→' : '←'} {link.type}</span>
                                          <span className="text-slate-200 font-mono">{otherNode?.label}</span>
                                      </div>
                                  )
                              })}
                          </div>
                      </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex flex-col gap-2">
                      <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-bold transition-colors">
                          Deep Scan Entity
                      </button>
                      <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-medium transition-colors">
                          Add to Monitor Watchlist
                      </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
