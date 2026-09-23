import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BarChart2, PieChart as PieIcon, TrendingUp, AlertCircle } from 'lucide-react';

const COLORS = ['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function VisualChart({ chartData }) {
  if (!chartData || chartData.chart_available === false || !chartData.labels || !chartData.values || chartData.labels.length === 0) {
    return (
      <div className="bg-slate-900/90 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Statistical Data Status</span>
        </div>
        <div className="py-3 px-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1">
          <h4 className="text-sm font-semibold text-slate-200">Data Currently Unavailable</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {chartData?.reason || "Explicit numerical statistics for crime and safety were not found in the retrieved public sources."}
          </p>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          Zero-Hallucination Safeguard: Zenithian AI refrains from generating unverified or estimated numerical statistics when primary open data records are absent.
        </p>
      </div>
    );
  }

  const [chartType, setChartType] = useState(chartData.chart_type || 'bar');

  const formattedData = chartData.labels.map((label, index) => ({
    name: String(label),
    value: Number(chartData.values[index]) || 0
  }));

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Data Visualization</span>
          <h3 className="text-base font-bold text-white">{chartData.title || 'Key Metrics Overview'}</h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              chartType === 'bar' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Bar
          </button>
          <button
            type="button"
            onClick={() => setChartType('line')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              chartType === 'line' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Line
          </button>
          <button
            type="button"
            onClick={() => setChartType('pie')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              chartType === 'pie' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" /> Pie
          </button>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={formattedData}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }} />
              <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={3} dot={{ r: 5, fill: '#06B6D4' }} />
            </LineChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie data={formattedData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#CBD5E1' }} />
            </PieChart>
          ) : (
            <BarChart data={formattedData}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }} />
              <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
