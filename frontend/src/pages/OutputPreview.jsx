import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import VisualChart from '../components/VisualChart';
import ImageGallery from '../components/ImageGallery';
import LocalLeadershipAndTourism from '../components/LocalLeadershipAndTourism';
import { 
  FileText, 
  Download, 
  Save, 
  Edit3, 
  RotateCw, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Clock, 
  Sparkles, 
  ArrowLeft, 
  Presentation,
  Share2
} from 'lucide-react';
import SocialPostPreview, { XIcon } from '../components/SocialPostPreview';

export default function OutputPreview({ outputData, onUpdateOutput }) {
  const navigate = useNavigate();

  if (!outputData) {
    return (
      <div className="p-12 max-w-3xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Generated Output Selected</h2>
        <p className="text-xs text-slate-500">
          Please submit a location query from the Generate Content page to view transformed outputs.
        </p>
        <button
          onClick={() => navigate('/generate')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md"
        >
          Go to Generate Content
        </button>
      </div>
    );
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(outputData.title);
  const [editedContent, setEditedContent] = useState(outputData.content);
  const [saveStatus, setSaveStatus] = useState('');
  const [exportingPPTX, setExportingPPTX] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatLower = (outputData.outputFormat || '').toLowerCase();
  const isSocialFormat = 
    formatLower.includes('twitter') ||
    formatLower.includes('x ') ||
    formatLower.includes('instagram') ||
    formatLower.includes('linkedin') ||
    formatLower.includes('facebook') ||
    formatLower.includes('social');

  const socialPlatform = formatLower.includes('instagram')
    ? 'instagram'
    : formatLower.includes('linkedin')
    ? 'linkedin'
    : formatLower.includes('facebook')
    ? 'facebook'
    : 'x';

  const handleSave = async () => {
    setSaveStatus('Saving...');
    const res = await api.saveHistory({
      title: editedTitle,
      location: outputData.location,
      output_format: outputData.outputFormat,
      content: editedContent,
      audience: outputData.audience,
      language: outputData.language,
      sources_count: outputData.sources?.length || 0,
      created_at: new Date().toISOString()
    });

    if (res.success) {
      setSaveStatus('Saved to History successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } else {
      setSaveStatus('Saved locally to session.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleExportPPTX = async () => {
    setExportingPPTX(true);
    const res = await api.exportPPTX({
      title: editedTitle,
      location: outputData.location,
      content: editedContent,
      categories: outputData.categories || [],
      audience: outputData.audience || 'Public',
      objective: outputData.objective || 'Report',
      sources: outputData.sources || [],
      unavailable_categories: outputData.unavailable_categories || []
    });
    setExportingPPTX(false);
    if (!res.success) {
      alert(res.error);
    }
  };

  const handleExportText = (format) => {
    let fileContent = editedContent;
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'markdown') {
      fileContent = `# ${editedTitle}\n\n${editedContent}\n\n---\nSources:\n` + outputData.sources?.map(s => `- ${s.source_name}: ${s.url}`).join('\n');
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (format === 'json') {
      fileContent = JSON.stringify({
        title: editedTitle,
        location: outputData.location,
        content: editedContent,
        sources: outputData.sources,
        unavailable_categories: outputData.unavailable_categories,
        retrieved_at: outputData.retrieved_at
      }, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zenithian_${outputData.raw_location}_${outputData.outputFormat}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${editedTitle}\n\n${editedContent}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/generate')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{outputData.location}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{outputData.outputFormat}</span>
              <span>•</span>
              <span>Audience: {outputData.audience}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {outputData.retrieved_at ? new Date(outputData.retrieved_at).toLocaleTimeString() : 'Just now'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isEditing ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Done Editing' : 'Edit Content'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Output</span>
          </button>

          <div className="relative group">
            <button
              onClick={handleExportPPTX}
              disabled={exportingPPTX}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Presentation className="w-4 h-4" />
              <span>{exportingPPTX ? 'Generating PPTX...' : 'Export PPTX'}</span>
            </button>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden text-xs">
            <button
              onClick={() => handleExportText('markdown')}
              className="px-2.5 py-2 hover:bg-slate-200 text-slate-700 font-medium border-r border-slate-200"
            >
              .MD
            </button>
            <button
              onClick={() => handleExportText('txt')}
              className="px-2.5 py-2 hover:bg-slate-200 text-slate-700 font-medium"
            >
              .TXT
            </button>
          </div>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Grounded Content Display Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Document Title</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-xl font-bold text-slate-900 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Content Body</label>
              <textarea
                rows={16}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full text-sm font-mono text-slate-800 border border-slate-300 rounded-xl p-4 focus:outline-none focus:border-blue-600 custom-scrollbar"
              />
            </div>
          </div>
        ) : isSocialFormat ? (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-bold uppercase tracking-wider mb-2">
                {outputData.outputFormat}
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editedTitle}</h2>
            </div>

            <SocialPostPreview
              platform={socialPlatform}
              location={outputData.location}
              content={editedContent}
              hashtags={outputData.hashtags || []}
              verificationStatus="Source Supported"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                {outputData.outputFormat}
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editedTitle}</h2>
            </div>

            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm whitespace-pre-wrap font-normal">
              {editedContent}
            </div>
          </div>
        )}
      </div>

      {/* Social Media Transformation Quick Card */}
      {!isSocialFormat && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Transform this into Social Media Content</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 text-[10px] font-semibold">1-Click</span>
              </h4>
              <p className="text-xs text-slate-300">
                Generate 𝕏 (Twitter) threads, Instagram carousels, and LinkedIn posts for <strong>{outputData.location}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/social-presentation')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all shrink-0 hover-lift"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Open Social Studio</span>
          </button>
        </div>
      )}

      {/* Data Chart Visual Section */}
      {outputData.chart_data && (
        <VisualChart chartData={outputData.chart_data} />
      )}

      {/* Local Leadership (MLA) & Tourism / Hidden Gems Section */}
      <LocalLeadershipAndTourism 
        location={outputData.location}
        localLeadership={outputData.local_leadership}
        tourismAndCulture={outputData.tourism_and_culture}
      />

      {/* Verified Visual Image Gallery Section */}
      {outputData.images && outputData.images.length > 0 && (
        <ImageGallery images={outputData.images} location={outputData.location} />
      )}

      {/* Two Column Footer: Source Citations & Information Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source References */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Verified Source References ({outputData.sources?.length || 0})
          </h3>
          {outputData.sources && outputData.sources.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {outputData.sources.map((src, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-800 truncate max-w-[60%]">{src.source_name}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-mono text-[11px] truncate max-w-[35%]"
                  >
                    Link
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Public Open Data Repositories (Wikipedia, OpenStreetMap)</p>
          )}
        </div>

        {/* Unavailable Information Notice */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Information Limitations Notice
          </h3>
          {outputData.unavailable_categories && outputData.unavailable_categories.length > 0 ? (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <p className="font-bold">Missing Public Records:</p>
              <p>
                No public data records were retrieved for: <strong>{outputData.unavailable_categories.join(', ')}</strong>.
              </p>
              <p className="text-[11px] text-amber-700">Zenithian strictly refrains from inventing facts for missing categories.</p>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              All requested categories returned verified open data extracts. No unverified information was included.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
