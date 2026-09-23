import React, { useState } from 'react';
import { api } from '../services/api';
import VisualChart from './VisualChart';
import ImageGallery from './ImageGallery';
import LocalLeadershipAndTourism from './LocalLeadershipAndTourism';
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
  FileText
} from 'lucide-react';

export default function MultiOutputPreview({ multiData, onSaveItem }) {
  if (!multiData || !multiData.outputs) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
        No multi-platform outputs available. Please select platforms and generate content.
      </div>
    );
  }

  const platforms = Object.keys(multiData.outputs);
  const [activeTab, setActiveTab] = useState(platforms[0] || 'linkedin');
  const [editingContent, setEditingContent] = useState({});
  const [verificationStatuses, setVerificationStatuses] = useState({});
  const [copiedTab, setCopiedTab] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const currentPlatformData = multiData.outputs[activeTab];

  const getPlatformIcon = (plat) => {
    switch (plat) {
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
      {/* Tabs Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 flex flex-wrap gap-2 shadow-xs">
        {platforms.map((plat) => {
          const isActive = activeTab === plat;
          return (
            <button
              key={plat}
              onClick={() => setActiveTab(plat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {getPlatformIcon(plat)}
              <span>{getPlatformLabel(plat)}</span>
            </button>
          );
        })}
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Review Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span><strong>Publishing Review Notice:</strong> Review generated content and source citations before publishing to target channels.</span>
        </div>

        {/* Verification status pill selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500">Status:</span>
          <select
            value={currentVerification}
            onChange={(e) => handleVerificationChange(e.target.value)}
            className="bg-white border border-blue-300 text-blue-900 font-bold rounded-lg px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="Needs Review">Needs Review</option>
            <option value="Source Supported">Source Supported</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100">
              {getPlatformIcon(activeTab)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{getPlatformLabel(activeTab)} Content</h3>
              <p className="text-xs text-slate-500">Location: {multiData.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedTab === activeTab ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            {activeTab === 'powerpoint' && (
              <button
                onClick={handleDownloadPPTX}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .PPTX</span>
              </button>
            )}
          </div>
        </div>

        {/* PowerPoint Specific Outline Preview */}
        {activeTab === 'powerpoint' && currentPlatformData?.slide_outline && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Presentation className="w-4 h-4 text-amber-600" />
              Generated PowerPoint Presentation Outline ({currentPlatformData.slide_count} Slides)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentPlatformData.slide_outline.map((slideTitle, i) => (
                <div key={i} className="p-2 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                  {slideTitle}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text Body */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Content Body (Editable)</label>
          <textarea
            rows={12}
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm font-sans text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white custom-scrollbar leading-relaxed"
          />
        </div>

        {/* Hashtags section */}
        {currentPlatformData?.hashtags && currentPlatformData.hashtags.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700">Hashtags:</span>
            <div className="flex flex-wrap gap-1.5">
              {currentPlatformData.hashtags.map((tag, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Data Chart Section */}
        {(multiData.chart_data || currentPlatformData?.chart_data) && (
          <div className="pt-4 border-t border-slate-100">
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
          <div className="pt-4 border-t border-slate-100">
            <ImageGallery images={multiData.images} location={multiData.location} />
          </div>
        )}

        {/* Sources citations */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" />
            Source References ({multiData.sources?.length || 0})
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {multiData.sources?.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 truncate max-w-xs font-medium"
              >
                {s.source_name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
