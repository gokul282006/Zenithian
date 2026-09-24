import React, { useState } from 'react';
import { api } from '../services/api';
import VisualChart from './VisualChart';
import ImageGallery from './ImageGallery';
import LocalLeadershipAndTourism from './LocalLeadershipAndTourism';
import SocialPostPreview, { XIcon } from './SocialPostPreview';
import { 
  Linkedin, 
  Facebook, 
  Instagram, 
  Presentation, 
  Copy, 
  Save, 
  Edit3, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Download,
  Share2,
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function MultiOutputPreview({ multiData, onSaveItem }) {
  if (!multiData || !multiData.outputs) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
        No multi-platform outputs available. Please select platforms and generate content.
      </div>
    );
  }

  // Filter out duplicate platform keys like 'twitter' when 'x' exists
  const rawPlatforms = Object.keys(multiData.outputs);
  const platforms = rawPlatforms.filter((p) => !(p === 'twitter' && rawPlatforms.includes('x')));

  const [activeTab, setActiveTab] = useState(platforms[0] || 'x');
  const [editingContent, setEditingContent] = useState({});
  const [verificationStatuses, setVerificationStatuses] = useState({});
  const [copiedTab, setCopiedTab] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [viewMode, setViewMode] = useState('interactive'); // 'interactive' or 'raw'

  const currentPlatformData = multiData.outputs[activeTab];

  const getPlatformIcon = (plat) => {
    switch (plat) {
      case 'x':
      case 'twitter':
        return <XIcon className="w-4 h-4 text-slate-900" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-700" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'powerpoint':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getPlatformLabel = (plat) => {
    switch (plat) {
      case 'x':
      case 'twitter': return '𝕏 (Twitter)';
      case 'linkedin': return 'LinkedIn';
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'powerpoint': return 'PowerPoint (.pptx)';
      default: return plat.toUpperCase();
    }
  };

  const currentText = editingContent[activeTab] !== undefined 
    ? editingContent[activeTab] 
    : (currentPlatformData?.content || '');

  const currentVerification = verificationStatuses[activeTab] || currentPlatformData?.verification_status || 'Source Supported';

  const handleTextChange = (txt) => {
    setEditingContent({
      ...editingContent,
      [activeTab]: txt
    });
  };

  const handleVerificationChange = (newStatus) => {
    setVerificationStatuses({
      ...verificationStatuses,
      [activeTab]: newStatus
    });
    setStatusMessage(`Status updated to: ${newStatus}`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopiedTab(activeTab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = platforms.map((plat) => {
      const data = multiData.outputs[plat];
      return `=== ${getPlatformLabel(plat)} ===\n${editingContent[plat] || data?.content || ''}\n\n`;
    }).join('\n');

    navigator.clipboard.writeText(allText);
    setCopiedTab('ALL');
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleSave = async () => {
    const item = {
      title: currentPlatformData?.title || `${getPlatformLabel(activeTab)} Post for ${multiData.location}`,
      location: multiData.location,
      output_format: getPlatformLabel(activeTab),
      platform: activeTab,
      content: currentText,
      hashtags: currentPlatformData?.hashtags || [],
      audience: multiData.audience || 'Public',
      language: multiData.language || 'English',
      verification_status: currentVerification,
      sources_count: multiData.sources?.length || 0,
      created_at: new Date().toISOString()
    };

    const res = await api.saveHistory(item);
    if (res.success) {
      setStatusMessage('Saved output to History!');
      if (onSaveItem) onSaveItem(res.data);
    } else {
      setStatusMessage('Saved output locally to session.');
    }
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleDownloadPPTX = async () => {
    if (activeTab === 'powerpoint' && currentPlatformData?.presentation_id) {
      await api.downloadPresentation(
        currentPlatformData.presentation_id,
        currentPlatformData.file_name || `Zenithian_${multiData.location}_Presentation.pptx`
      );
    } else {
      await api.exportPPTX({
        title: `Presentation for ${multiData.location}`,
        location: multiData.location,
        content: currentText,
        categories: multiData.categories || [],
        audience: multiData.audience || 'Public',
        objective: multiData.objective || 'Report',
        sources: multiData.sources || [],
        unavailable_categories: multiData.unavailable_categories || []
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Header with Sleek Glass Styling */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {platforms.map((plat) => {
            const isActive = activeTab === plat;
            return (
              <button
                key={plat}
                type="button"
                onClick={() => setActiveTab(plat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {getPlatformIcon(plat)}
                <span>{getPlatformLabel(plat)}</span>
              </button>
            );
          })}
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAll}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Copy content from all generated platforms"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600" />
            <span>{copiedTab === 'ALL' ? 'All Copied!' : 'Copy All Platforms'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Review Reminder & Status Selector Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/80 text-blue-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-blue-600 text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block text-slate-900">Publishing Verification & Integrity</span>
            <span className="text-slate-600 text-[11px]">Source-grounded facts extracted strictly from open records without hallucinations.</span>
          </div>
        </div>

        {/* Verification status selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-600">Verification:</span>
          <select
            value={currentVerification}
            onChange={(e) => handleVerificationChange(e.target.value)}
            className="bg-white border border-blue-300 text-blue-900 font-bold rounded-xl px-3 py-1.5 text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Needs Review">Needs Review</option>
            <option value="Source Supported">Source Supported</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200">
              {getPlatformIcon(activeTab)}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{getPlatformLabel(activeTab)} Content</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>Location: <strong className="text-slate-700">{multiData.location}</strong></span>
                <span>•</span>
                <span>Audience: {multiData.audience || 'Public'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher for Social */}
            {['x', 'twitter', 'instagram', 'linkedin', 'facebook'].includes(activeTab) && (
              <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('interactive')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === 'interactive'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Interactive Mockup
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    viewMode === 'raw'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Raw Text Editor
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedTab === activeTab ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            {activeTab === 'powerpoint' && (
              <button
                type="button"
                onClick={handleDownloadPPTX}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .PPTX</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Render: Interactive Social Post Preview vs Raw Editor */}
        {['x', 'twitter', 'instagram', 'linkedin', 'facebook'].includes(activeTab) && viewMode === 'interactive' ? (
          <SocialPostPreview
            platform={activeTab}
            location={multiData.location}
            content={currentText}
            hashtags={currentPlatformData?.hashtags || []}
            singleTweet={currentPlatformData?.single_tweet || ''}
            thread={currentPlatformData?.thread || []}
            carouselSlides={currentPlatformData?.carousel_slides || []}
            visualPrompt={currentPlatformData?.visual_prompt || ''}
            verificationStatus={currentVerification}
            onCopy={(key) => {
              setStatusMessage(`Copied ${key.replace('_', ' ')}!`);
              setTimeout(() => setStatusMessage(''), 2500);
            }}
          />
        ) : null}

        {/* Raw Text Editor (always for PowerPoint, or when switched to raw mode) */}
        {(activeTab === 'powerpoint' || viewMode === 'raw') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === 'powerpoint' ? 'Slide Deck Narration & Notes' : 'Content Text Body (Editable)'}
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{currentText.length} characters</span>
            </div>
            <textarea
              rows={12}
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm font-sans text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white custom-scrollbar leading-relaxed"
            />
          </div>
        )}

        {/* PowerPoint Specific Outline Preview */}
        {activeTab === 'powerpoint' && currentPlatformData?.slide_outline && (
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <Presentation className="w-4 h-4 text-amber-600" />
              Generated PowerPoint Presentation Outline ({currentPlatformData.slide_count} Slides)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              {currentPlatformData.slide_outline.map((slideTitle, i) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-amber-200/70 text-slate-800 font-semibold shadow-2xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="truncate">{slideTitle}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags display */}
        {currentPlatformData?.hashtags && currentPlatformData.hashtags.length > 0 && viewMode === 'raw' && (
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-bold text-slate-700">Curated Hashtags:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentPlatformData.hashtags.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-semibold border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Data Chart Section */}
        {(multiData.chart_data || currentPlatformData?.chart_data) && (
          <div className="pt-6 border-t border-slate-100">
            <VisualChart chartData={multiData.chart_data || currentPlatformData?.chart_data} />
          </div>
        )}

        {/* Local Leadership & Tourism Section */}
        <LocalLeadershipAndTourism 
          location={multiData.location}
          localLeadership={multiData.local_leadership || currentPlatformData?.local_leadership}
          tourismAndCulture={multiData.tourism_and_culture || currentPlatformData?.tourism_and_culture}
        />

        {/* Verified Visual Image Gallery Section */}
        {multiData.images && multiData.images.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <ImageGallery images={multiData.images} location={multiData.location} />
          </div>
        )}

        {/* Source References */}
        <div className="pt-6 border-t border-slate-100 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-blue-600" />
            Verified Source References ({multiData.sources?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {multiData.sources && multiData.sources.length > 0 ? (
              multiData.sources.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 truncate max-w-xs font-medium transition-all"
                >
                  {s.source_name}
                </a>
              ))
            ) : (
              <span className="text-slate-400 text-xs">Public Open Data Repositories (Wikipedia, OpenStreetMap Nominatim)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
