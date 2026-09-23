import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { isSupabaseConfigured } from '../services/supabase';
import { 
  Settings as SettingsIcon, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key, 
  Database, 
  Globe, 
  Cpu, 
  ShieldCheck 
} from 'lucide-react';

export default function Settings({ backendStatus, onRefreshStatus }) {
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const res = await api.fetchStatus();
    if (res.success) {
      setDiagnostics(res.data);
    }
    if (onRefreshStatus) onRefreshStatus();
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            System Configuration & Diagnostics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor API endpoints, AI key statuses, vector chunkers, and database connections.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-run Diagnostics</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Fast API Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Python FastAPI Server</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              Port 8000
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Handles location retrieval, grounded prompt assembly, text chunking, and PowerPoint export.
          </p>
        </div>

        {/* AI Key Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">AI Model Integration</h3>
            </div>
            {backendStatus?.ai_configured ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Configured
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Key Missing
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            Target Model: <strong>Google Gemini 2.5 Flash</strong> (or OpenAI GPT-4o-mini). Set <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">backend/.env</code>.
          </p>
        </div>

        {/* Data Sources Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Open Data Source APIs</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Connects live to Wikipedia REST API, Wikidata API, and OpenStreetMap Nominatim for verified geographical and municipal facts.
          </p>
        </div>

        {/* Supabase Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Supabase Database & Auth</h3>
            </div>
            {isSupabaseConfigured() ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                Local Fallback Mode
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            PostgreSQL persistence and authentication layer. Configure <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">SUPABASE_URL</code> in frontend & backend env files.
          </p>
        </div>
      </div>

      {/* Setup Instructions Card */}
      <div className="bg-slate-900 text-slate-200 p-8 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          Environment Setup Guide
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          To configure Zenithian for live AI generation with your own API credentials, add a <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">.env</code> file in the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 font-mono">backend/</code> directory with the following variables:
        </p>
        <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-blue-400 overflow-x-auto border border-slate-800 select-all">
{`GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key`}
        </pre>
      </div>
    </div>
  );
}
