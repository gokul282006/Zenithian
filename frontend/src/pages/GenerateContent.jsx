import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Sparkles, 
  MapPin, 
  Globe, 
  Layers, 
  Users, 
  Languages, 
  Sliders, 
  Target, 
  FileCheck, 
  AlertCircle,
  Loader2,
  Check
} from 'lucide-react';

export default function GenerateContent({ onGenerateSuccess }) {
  const navigate = useNavigate();

  // Form State
  const [location, setLocation] = useState('Musiri');
  const [state, setState] = useState('Tamil Nadu');
  const [country, setCountry] = useState('India');
  const [categories, setCategories] = useState([
    'Trending', 'History', 'Geography', 'Education', 'Healthcare', 'Infrastructure', 'Tourism', 'Economy', 'Environment'
  ]);
  const [audience, setAudience] = useState('Public');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Informative');
  const [detailLevel, setDetailLevel] = useState('Medium');
  const [objective, setObjective] = useState('Information Sharing');
  const [outputFormat, setOutputFormat] = useState('Report');

  // Real-Time Recent Events State
  const [includeRecentEvents, setIncludeRecentEvents] = useState(true);
  const [recentEventsTimeframe, setRecentEventsTimeframe] = useState('7d');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');

  const allCategories = [
    'Trending', 'History', 'Geography', 'Education', 'Healthcare', 'Infrastructure', 'Tourism', 'Economy', 'Environment'
  ];

  const handleCategoryToggle = (cat) => {
    if (categories.includes(cat)) {
      if (categories.length === 1) return; // Keep at least 1 category selected
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!location || !location.trim()) {
      setError('Please enter a location name (e.g. Musiri).');
      return;
    }

    setLoading(true);
    setLoadingStep('Step 1/3: Connecting to OpenStreetMap, Wikipedia & Google News RSS for live records...');

    try {
      // Step 1: Retrieve live data from open APIs
      const retrievalRes = await api.retrieveLocation({
        location: location.trim(),
        state: state.trim(),
        country: country.trim(),
        categories: categories.map((c) => c.toLowerCase()),
        include_recent_events: includeRecentEvents,
        recent_events_timeframe: recentEventsTimeframe
      });

      if (!retrievalRes.success) {
        throw new Error(retrievalRes.error || 'Failed to retrieve location data from authorized sources.');
      }

      setLoadingStep('Step 2/3: Cleaning text, chunking & applying RAG vector context scoring...');

      // Step 2: Generate content grounded in retrieved data
      setLoadingStep('Step 3/3: Transforming data into grounded content output...');
      
      const categoryText = Object.values(retrievalRes.data.categories || {}).join('\n\n');

      const genRes = await api.generateContent({
        location: location.trim(),
        state: state.trim(),
        country: country.trim(),
        categories,
        audience,
        language,
        tone,
        detail_level: detailLevel,
        objective,
        output_format: outputFormat,
        include_recent_events: includeRecentEvents,
        recent_events_timeframe: recentEventsTimeframe,
        retrieved_context: categoryText,
        sources: retrievalRes.data.sources || [],
        unavailable_categories: retrievalRes.data.unavailable_categories || []
      });

      if (!genRes.success) {
        throw new Error(genRes.error || 'Content generation failed.');
      }

      // Format output payload for OutputPreview page
      const outputData = {
        title: genRes.data.generated_title || `${outputFormat} for ${location}`,
        content: genRes.data.generated_content || '',
        location: `${location.trim()}, ${state.trim()}, ${country.trim()}`.replace(/,\s*,/g, ',').replace(/^,\s*|\s*,\s*$/g, ''),
        raw_location: location.trim(),
        raw_state: state.trim(),
        raw_country: country.trim(),
        categories,
        audience,
        language,
        tone,
        detailLevel,
        objective,
        outputFormat,
        retrieved_at: retrievalRes.data.retrieved_at,
        sources: retrievalRes.data.sources || [],
        unavailable_categories: retrievalRes.data.unavailable_categories || [],
        categories_content: retrievalRes.data.categories || {},
        images: retrievalRes.data.images || genRes.data.images || [],
        chart_data: genRes.data.chart_data || null
      };

      if (onGenerateSuccess) {
        onGenerateSuccess(outputData);
      }
      navigate('/output');

    } catch (err) {
      setError(err.message || 'An unexpected error occurred during processing.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Generate Location Content
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Retrieve location records from verified public sources and transform them using grounded AI. <strong>No document upload required.</strong>
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            <Globe className="w-3.5 h-3.5" />
            Authorized Open Data APIs
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Execution Notice / Configuration Alert</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Location Input */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            1. Target Location Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Musiri"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">State / Province</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Tamil Nadu"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Information Categories */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-4 h-4 text-blue-600" />
            2. Information Categories to Retrieve
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allCategories.map((cat) => {
              const isSelected = categories.includes(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => handleCategoryToggle(cat)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{cat}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2.5: Real-Time Recent Events & Local News */}
        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-2xl p-6 border border-blue-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Real-Time Recent Events & Local News Engine
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">Live Search</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <label className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-blue-200 cursor-pointer hover:border-blue-400 transition-all shadow-2xs">
              <input
                type="checkbox"
                checked={includeRecentEvents}
                onChange={(e) => setIncludeRecentEvents(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Include Recent Events & Local News</span>
                <span className="text-[11px] text-slate-500">Pull live news articles & publisher citations</span>
              </div>
            </label>

            {includeRecentEvents && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-bold">News Timeframe Filter</label>
                <select
                  value={recentEventsTimeframe}
                  onChange={(e) => setRecentEventsTimeframe(e.target.value)}
                  className="w-full bg-white border border-blue-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                >
                  <option value="7d">Last 7 Days (Hot Recent News)</option>
                  <option value="30d">Last 30 Days (Past Month Events)</option>
                  <option value="6m">Last 6 Months (Recent Developments)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Audience & Parameters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            3. Audience, Language & Style Tuning
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" /> Target Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="Public">Public</option>
                <option value="Student">Student</option>
                <option value="Government Officer">Government Officer</option>
                <option value="Organization">Organization</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-slate-500" /> Output Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Communication Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="Formal">Formal</option>
                <option value="Simple">Simple</option>
                <option value="Informative">Informative</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Detail Level</label>
              <select
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Detailed">Detailed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-slate-500" /> Objective
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="Awareness">Awareness</option>
                <option value="Report">Report</option>
                <option value="Announcement">Announcement</option>
                <option value="Information Sharing">Information Sharing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-blue-600" /> Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full bg-blue-50 border border-blue-300 text-blue-900 rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="Summary">Summary</option>
                <option value="Report">Report</option>
                <option value="Email">Email</option>
                <option value="Public Announcement">Public Announcement</option>
                <option value="PowerPoint">PowerPoint (.pptx)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">{loadingStep || 'Retrieving and Generating...'}</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Retrieve Information and Generate Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
