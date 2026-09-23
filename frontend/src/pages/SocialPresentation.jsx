import React, { useState } from 'react';
import { api } from '../services/api';
import MultiOutputPreview from '../components/MultiOutputPreview';
import { 
  Linkedin, 
  Facebook, 
  Instagram, 
  Presentation, 
  MapPin, 
  Sliders, 
  Sparkles, 
  Loader2, 
  Check, 
  AlertCircle,
  Palette,
  Eye,
  Layers
} from 'lucide-react';

export default function SocialPresentation() {
  const [location, setLocation] = useState('Musiri');
  const [state, setState] = useState('Tamil Nadu');
  const [country, setCountry] = useState('India');
  const [categories, setCategories] = useState(['Trending', 'History', 'Geography', 'Education', 'Healthcare']);
  const [audience, setAudience] = useState('Public');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Informative');
  const [detailLevel, setDetailLevel] = useState('Medium');
  const [objective, setObjective] = useState('Information Sharing');

  // Selected platforms checkboxes
  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin', 'facebook', 'instagram', 'powerpoint']);

  // PowerPoint Theme & Settings State (5 Themes)
  const [selectedTheme, setSelectedTheme] = useState('zenithian_creative_flow');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [includeSources, setIncludeSources] = useState(true);
  const [includeLimitations, setIncludeLimitations] = useState(true);

  // Real-Time Recent Events State
  const [includeRecentEvents, setIncludeRecentEvents] = useState(true);
  const [recentEventsTimeframe, setRecentEventsTimeframe] = useState('7d');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [multiOutputData, setMultiOutputData] = useState(null);
  const [storyboardData, setStoryboardData] = useState(null);

  const themesList = [
    {
      id: 'zenithian_creative_flow',
      name: 'Zenithian Creative Flow',
      style: 'Modern Creative Tech',
      desc: 'Dark navy background cover (#0F172A), electric blue & cyan card containers (#2563EB / #38BDF8), white text.',
      badge: 'Canva-Inspired Recommended'
    },
    {
      id: 'zenithian_minimal_studio',
      name: 'Zenithian Minimal Studio',
      style: 'Clean Light Editorial',
      desc: 'Off-white canvas (#FAFAFA), dark charcoal text (#18181B), royal blue accents, generous whitespace.',
      badge: 'Academic & Editorial'
    },
    {
      id: 'zenithian_future_grid',
      name: 'Zenithian Future Grid',
      style: 'Futuristic Grid & Nodes',
      desc: 'Dark grid background (#030712), neon cyan header text (#06B6D4), teal node callouts.',
      badge: 'Tech Pitch & Systems'
    },
    {
      id: 'zenithian_impact_story',
      name: 'Zenithian Impact Story',
      style: 'Storytelling Contrast',
      desc: 'Slate background (#1E293B), warm amber highlights (#F59E0B), emerald accent blocks.',
      badge: 'Public Awareness & Campaigns'
    },
    {
      id: 'zenithian_executive',
      name: 'Zenithian Executive',
      style: 'Corporate Formal',
      desc: 'Light gray canvas (#F8FAFC), deep navy titles (#1E3A8A), structured gray card containers.',
      badge: 'Corporate & Government'
    }
  ];

  const handlePlatformToggle = (plat) => {
    if (selectedPlatforms.includes(plat)) {
      if (selectedPlatforms.length === 1) return;
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  const handlePreviewStoryboard = async () => {
    if (!location.trim()) return;
    const res = await api.fetchStoryboard({
      location: location.trim(),
      categories,
      audience,
      objective,
      theme: selectedTheme,
      include_recent_events: includeRecentEvents,
      recent_events_timeframe: recentEventsTimeframe
    });
    if (res.success) {
      setStoryboardData(res.storyboard);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!location.trim()) {
      setError('Please enter a location name.');
      return;
    }

    setLoading(true);
    setLoadingStep('Step 1/3: Retrieving verified open data records & Google News RSS...');

    try {
      const retrievalRes = await api.retrieveLocation({
        location: location.trim(),
        state: state.trim(),
        country: country.trim(),
        categories: categories.map((c) => c.toLowerCase()),
        include_recent_events: includeRecentEvents,
        recent_events_timeframe: recentEventsTimeframe
      });

      if (!retrievalRes.success) {
        throw new Error(retrievalRes.error || 'Data retrieval failed.');
      }

      setLoadingStep('Step 2/3: Applying RAG vector chunking & Canva-inspired PPTX layout building...');

      const genRes = await api.multiGenerateContent({
        location: location.trim(),
        state: state.trim(),
        country: country.trim(),
        categories,
        audience,
        language,
        tone,
        detail_level: detailLevel,
        objective,
        platforms: selectedPlatforms,
        theme: selectedTheme,
        aspect_ratio: aspectRatio,
        include_sources: includeSources,
        include_limitations: includeLimitations,
        include_recent_events: includeRecentEvents,
        recent_events_timeframe: recentEventsTimeframe,
        retrieved_context: '',
        sources: retrievalRes.data.sources || [],
        unavailable_categories: retrievalRes.data.unavailable_categories || []
      });

      if (!genRes.success) {
        throw new Error(genRes.error || 'Multi-platform content generation failed.');
      }

      setMultiOutputData(genRes.data);
    } catch (err) {
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Canva-Inspired Presentation & Social Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Transform location open data into LinkedIn, Facebook, Instagram posts, and custom-designed PowerPoint presentations.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Platform Selection Cards */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
            1. Select Target Output Platforms
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => handlePlatformToggle('linkedin')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedPlatforms.includes('linkedin')
                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <span>LinkedIn</span>
                </div>
                {selectedPlatforms.includes('linkedin') && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xs text-slate-600">Professional communication, bullet points & hashtags.</p>
            </div>

            <div
              onClick={() => handlePlatformToggle('facebook')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedPlatforms.includes('facebook')
                  ? 'bg-blue-50 border-blue-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <Facebook className="w-5 h-5 text-blue-700" />
                  <span>Facebook</span>
                </div>
                {selectedPlatforms.includes('facebook') && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <p className="text-xs text-slate-600">Public-friendly, informative community briefings.</p>
            </div>

            <div
              onClick={() => handlePlatformToggle('instagram')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedPlatforms.includes('instagram')
                  ? 'bg-pink-50 border-pink-400 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-pink-900">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <span>Instagram</span>
                </div>
                {selectedPlatforms.includes('instagram') && <Check className="w-4 h-4 text-pink-600" />}
              </div>
              <p className="text-xs text-slate-600">Concise caption, hashtags & 3-slide carousel text outline.</p>
            </div>

            <div
              onClick={() => handlePlatformToggle('powerpoint')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedPlatforms.includes('powerpoint')
                  ? 'bg-amber-50 border-amber-400 shadow-sm'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <Presentation className="w-5 h-5 text-amber-600" />
                  <span>PowerPoint</span>
                </div>
                {selectedPlatforms.includes('powerpoint') && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <p className="text-xs text-slate-600">Visual slide deck built with python-pptx editable shapes.</p>
            </div>
          </div>
        </div>

        {/* Section 2: PowerPoint Presentation Theme Selection (5 Themes) */}
        {selectedPlatforms.includes('powerpoint') && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                2. Select Visual Presentation Theme (5 Canva-Inspired Themes)
              </h2>

              <button
                type="button"
                onClick={handlePreviewStoryboard}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Preview Storyboard Outline</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {themesList.map((th) => {
                const isSelected = selectedTheme === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-blue-500 shadow-md ring-2 ring-blue-500'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-xs truncate">{th.name}</h3>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] opacity-80 leading-snug line-clamp-3 mb-2">{th.desc}</p>
                    <span className="inline-block px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-semibold truncate max-w-full">
                      {th.badge}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* PowerPoint Settings Sub-row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
                >
                  <option value="16:9">16:9 Widescreen (Default)</option>
                  <option value="4:3">4:3 Standard</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="includeSources"
                  checked={includeSources}
                  onChange={(e) => setIncludeSources(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeSources" className="font-semibold text-slate-700">Include Source Citations Slide</label>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="includeLimitations"
                  checked={includeLimitations}
                  onChange={(e) => setIncludeLimitations(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeLimitations" className="font-semibold text-slate-700">Include Data Limitations Slide</label>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="includeRecentEvents"
                  checked={includeRecentEvents}
                  onChange={(e) => setIncludeRecentEvents(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeRecentEvents" className="font-semibold text-slate-700">Include Recent Developments & Local News Slide</label>
              </div>

              {includeRecentEvents && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">News Timeframe Filter</label>
                  <select
                    value={recentEventsTimeframe}
                    onChange={(e) => setRecentEventsTimeframe(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium"
                  >
                    <option value="7d">Last 7 Days (Hot Recent News)</option>
                    <option value="30d">Last 30 Days (Past Month Events)</option>
                    <option value="6m">Last 6 Months (Recent Developments)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Storyboard Preview Section */}
            {storyboardData && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Presentation Storyboard Outline ({storyboardData.length} Slides)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  {storyboardData.map((sb) => (
                    <div key={sb.slide_number} className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-blue-400">
                        <span>Slide {sb.slide_number}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">{sb.layout_name}</span>
                      </div>
                      <p className="font-semibold text-white">{sb.title}</p>
                      <p className="text-[11px] text-slate-400">{sb.key_message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 3: Location Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            3. Location Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location Name *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Musiri"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Tamil Nadu"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. India"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Parameters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            4. Communication Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-900"
              >
                <option value="Public">Public</option>
                <option value="Student">Student</option>
                <option value="Government Officer">Government Officer</option>
                <option value="Organization">Organization</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-900"
              >
                <option value="Informative">Informative</option>
                <option value="Formal">Formal</option>
                <option value="Simple">Simple</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-900"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Objective</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-900"
              >
                <option value="Information Sharing">Information Sharing</option>
                <option value="Awareness">Awareness</option>
                <option value="Report">Report</option>
                <option value="Announcement">Announcement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">{loadingStep || 'Generating Content & Presentation...'}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Selected Outputs ({selectedPlatforms.length} Platforms)</span>
            </>
          )}
        </button>
      </form>

      {/* Multi-Output Preview Component */}
      {multiOutputData && (
        <div className="pt-6">
          <MultiOutputPreview multiData={multiOutputData} />
        </div>
      )}
    </div>
  );
}
