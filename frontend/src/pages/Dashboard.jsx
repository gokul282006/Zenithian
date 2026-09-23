import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Sparkles, 
  FileText, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  History, 
  ArrowRight, 
  Database,
  Layers,
  Cpu
} from 'lucide-react';

export default function Dashboard({ user, backendStatus }) {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await api.getHistory();
      if (res.success) {
        setHistoryItems(res.history);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const totalOutputs = historyItems.length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Location Intelligence Engine
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome to Zenithian
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Enter any village, town, or city name. Zenithian retrieves verified data from authorized public sources (Wikipedia, Wikidata, OpenStreetMap) and uses grounded AI to generate summaries, reports, emails, announcements, social media posts, and PowerPoint slides.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/generate')}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm text-white shadow-lg shadow-blue-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start New Content Generation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grounded Engine Status Box */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
        <Cpu className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <span>Grounded Transformation Engine Active</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">Ready</span>
          </p>
          <p>
            Zenithian transforms real open data records into Reports, Social Posts, and PowerPoint presentations. (Optional: Add <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> in <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">backend/.env</code> to switch between local grounded synthesis and LLM generation).
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Total Outputs</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{totalOutputs}</h3>
            <p className="text-xs text-slate-400 mt-1">Generated documents</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Public Sources</p>
            <h3 className="text-3xl font-black text-emerald-600 mt-1">3 Active</h3>
            <p className="text-xs text-slate-400 mt-1">Wikipedia, Nominatim, Wikidata</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">RAG Pipeline</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">Ready</h3>
            <p className="text-xs text-slate-400 mt-1">Vector TF-IDF Chunker</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">PowerPoint Engine</p>
            <h3 className="text-3xl font-black text-blue-600 mt-1">5 Themes</h3>
            <p className="text-xs text-slate-400 mt-1">Canva-Inspired python-pptx</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick Actions & Recent Outputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* New Content Generation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">New Content Generation</h3>
              <span className="text-xs text-slate-500 font-medium">No document upload required</span>
            </div>
            <p className="text-xs text-slate-600 mb-5">
              Enter a location name (e.g. <strong>Musiri</strong>, <strong>Kanchipuram</strong>, <strong>Austin</strong>) to retrieve historical, geographic, educational, and economic facts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/generate')}
                className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-blue-700 font-bold text-sm mb-1">
                  <span>Generate Report / Summary</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-600">Create structured reports, emails, or public announcements grounded in data.</p>
              </button>

              <button
                onClick={() => navigate('/social-presentation')}
                className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-indigo-700 font-bold text-sm mb-1">
                  <span>Social Studio & PowerPoint</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <p className="text-xs text-slate-600">Generate LinkedIn, Facebook, Instagram posts & 5 PowerPoint visual themes.</p>
              </button>
            </div>
          </div>

          {/* Recent Outputs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Output History</h3>
              <button
                onClick={() => navigate('/history')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>View All History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
            ) : historyItems.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">No output history yet.</p>
                <p className="text-xs text-slate-400 mt-1">Start by generating your first location transformation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {item.output_format ? item.output_format.charAt(0) : 'R'}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {item.location}
                          </span>
                          <span>•</span>
                          <span>{item.output_format}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/history')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-white transition-colors"
                    >
                      View Output
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Data Sources Status & Grounding Guarantee */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Source Retrieval Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Wikipedia REST API</p>
                  <p className="text-slate-500">Historical & Educational records</p>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">OpenStreetMap Nominatim</p>
                  <p className="text-slate-500">Coordinates & Boundaries</p>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Wikidata API</p>
                  <p className="text-slate-500">Entity & Municipal metadata</p>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 border border-slate-800">
            <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              No Fake Data Policy
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zenithian operates exclusively on verified public context. If data for a specific category is absent, the system explicitly flags it as unavailable rather than inventing facts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
