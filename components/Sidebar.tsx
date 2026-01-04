import React from 'react';
import { ViewState, AppModule } from '../types';
import { LogOut, PlusCircle } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState | string;
  setView: (view: ViewState | string) => void;
  modules: AppModule[];
  onImportClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, modules, onImportClick }) => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
          AEGIS<span className="text-slate-500 font-light">MODULE</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 pl-5">Protective Intelligence v1.5</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="p-4 space-y-1">
          {modules.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.viewState;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.viewState)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-900/50' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {!item.isCore && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-purple-500" title="External Module" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* Import Module Action */}
        <button 
          onClick={onImportClick}
          className="w-full flex items-center justify-center gap-2 py-2 rounded border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all text-xs font-medium"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Import Module
        </button>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">System Status</p>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Operational
          </div>
        </div>
        
        <button className="flex items-center gap-2 text-slate-500 hover:text-red-400 text-sm font-medium transition-colors w-full px-2 py-2">
          <LogOut className="w-4 h-4" />
          Disconnect Module
        </button>
      </div>
    </div>
  );
};