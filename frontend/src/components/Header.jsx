import React from 'react';
import { RefreshCw, CheckCircle2, Cpu, Sparkles } from 'lucide-react';

export default function Header({ title, onRefresh, isRefreshing, backendStatus }) {
  const isLLMActive = backendStatus?.ai_configured;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Status Indicator Pill */}
        {isLLMActive ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gemini AI Active</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Grounded Engine Active (LLM Key Optional in backend/.env)</span>
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Refresh Diagnostics"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        <div className="h-4 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            v1.0 Production
          </span>
        </div>
      </div>
    </header>
  );
}
