import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  History as HistoryIcon, 
  MapPin, 
  Trash2, 
  Eye, 
  FileText, 
  Search, 
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function History({ onViewOutput }) {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    const res = await api.getHistory();
    if (res.success) {
      setHistoryItems(res.history);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await api.deleteHistory(id);
      loadHistory();
    }
  };

  const handleView = (item) => {
    if (onViewOutput) {
      onViewOutput({
        title: item.title,
        content: item.content,
        location: item.location,
        outputFormat: item.output_format,
        audience: item.audience,
        language: item.language,
        retrieved_at: item.created_at,
        sources: [],
        unavailable_categories: []
      });
    }
    navigate('/output');
  };

  const filteredItems = historyItems.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query) ||
      item.output_format?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-blue-600" />
            Output History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review, inspect, edit, or delete previously generated location transformations.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by location or title..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading history records...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No output records found</h3>
          <p className="text-xs text-slate-400">
            {search ? 'No outputs matched your search filter.' : 'Generate your first location report to populate history.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                    {item.output_format}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {item.location}
                  </span>
                  <span>•</span>
                  <span>Audience: {item.audience}</span>
                  <span>•</span>
                  <span>Lang: {item.language}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleView(item)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
