import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Bookmark, 
  Share2, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  ThumbsUp,
  Image as ImageIcon
} from 'lucide-react';

export const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function SocialPostPreview({ 
  platform = 'x', 
  location = 'Location', 
  content = '', 
  hashtags = [], 
  singleTweet = '',
  thread = [],
  carouselSlides = [],
  visualPrompt = '',
  verificationStatus = 'Source Supported',
  onCopy
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [twitterMode, setTwitterMode] = useState('thread'); // 'single' or 'thread'
  const [activeSlide, setActiveSlide] = useState(0);

  const handleCopyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onCopy) onCopy(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleOpenXIntent = (tweetText) => {
    const textToShare = tweetText || (twitterMode === 'single' ? singleTweetText : content);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Safe fallback for single tweet text
  const singleTweetText = singleTweet || (content ? content.split('\n\n')[0] : `Update on ${location}`);
  const threadList = (thread && thread.length > 0) 
    ? thread 
    : content.split(/(?:^|\n+)(?:\d+\/\d+|\(\d+\/\d+\))\s*/).filter(Boolean);

  // Fallback carousel slides
  const defaultCarouselSlides = (carouselSlides && carouselSlides.length > 0)
    ? carouselSlides
    : [
        {
          slide_number: 1,
          title: `📍 Discover ${location}`,
          tagline: "Regional Intelligence & Charm",
          body: `Key verified highlights and baseline insights for ${location}.`
        },
        {
          slide_number: 2,
          title: "💡 Verified Insights & Culture",
          tagline: "Grounded Facts",
          body: content.slice(0, 240) + '...'
        },
        {
          slide_number: 3,
          title: "🔍 Data Integrity & References",
          tagline: "Public Repositories",
          body: "Grounded strictly in open data records (Wikipedia, OpenStreetMap Nominatim, Wikidata)."
        }
      ];

  // ==========================================
  // 1. 𝕏 (TWITTER) PREVIEW CARD
  // ==========================================
  if (platform === 'x' || platform === 'twitter') {
    const charCount = singleTweetText.length;
    const isOverLimit = charCount > 280;

    return (
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black border border-slate-700 flex items-center justify-center text-white">
              <XIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">X (Twitter) Feed Preview</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-sky-400 border border-slate-700">
                  {twitterMode === 'single' ? 'Single Post' : `Thread (${threadList.length} tweets)`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Character-optimized format for X platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Thread / Single Switch */}
            <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setTwitterMode('thread')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  twitterMode === 'thread'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Thread View
              </button>
              <button
                type="button"
                onClick={() => setTwitterMode('single')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  twitterMode === 'single'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Single Post
              </button>
            </div>

            {/* Direct Tweet Intent Button */}
            <button
              type="button"
              onClick={() => handleOpenXIntent()}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm"
              title="Open and tweet directly on X"
            >
              <XIcon className="w-3.5 h-3.5" />
              <span>Post on 𝕏</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>

        {/* X Mockup Card */}
        <div className="bg-black text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 font-sans max-w-xl mx-auto">
          {twitterMode === 'single' ? (
            /* Single Tweet Mode */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-sm text-white">
                    Z
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{location} Intelligence</span>
                      <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="text-xs text-slate-400 font-normal">@zenithian_intel · Just now</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Verified Open Data Source</span>
                  </div>
                </div>
                <XIcon className="w-4 h-4 text-slate-500" />
              </div>

              {/* Tweet Content */}
              <div className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap pl-13 font-normal">
                {singleTweetText}
              </div>

              {/* Character Limit Counter Bar */}
              <div className="pl-13 pt-2 flex items-center justify-between border-t border-slate-900 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${isOverLimit ? 'text-rose-400' : 'text-slate-400'}`}>
                    {charCount} / 280 characters
                  </span>
                  {isOverLimit && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                      Exceeds standard 280-char limit
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyText(singleTweetText, 'single_tweet')}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-800"
                >
                  {copiedKey === 'single_tweet' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Tweet</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Mockup Bar */}
              <div className="pl-13 pt-3 flex items-center justify-between text-slate-500 text-xs border-t border-slate-900">
                <span className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer transition-colors">
                  <MessageCircle className="w-4 h-4" /> 18
                </span>
                <span className="flex items-center gap-1.5 hover:text-emerald-400 cursor-pointer transition-colors">
                  <Repeat2 className="w-4 h-4" /> 42
                </span>
                <span className="flex items-center gap-1.5 hover:text-rose-400 cursor-pointer transition-colors">
                  <Heart className="w-4 h-4" /> 189
                </span>
                <span className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer transition-colors">
                  <Bookmark className="w-4 h-4" />
                </span>
                <span className="flex items-center gap-1.5 hover:text-sky-400 cursor-pointer transition-colors">
                  <Share2 className="w-4 h-4" />
                </span>
              </div>
            </div>
          ) : (
            /* Thread Mode */
            <div className="space-y-6">
              {threadList.map((tweetText, idx) => (
                <div key={idx} className="relative pl-13 space-y-3">
                  {/* Thread connector line */}
                  {idx < threadList.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-slate-800"></div>
                  )}

                  {/* Tweet Header */}
                  <div className="flex items-center justify-between">
                    <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                      Z
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{location} Intelligence</span>
                      <svg className="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="text-xs text-slate-400">@zenithian_intel</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 font-mono text-[10px] font-bold">
                        {idx + 1}/{threadList.length}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyText(tweetText, `tweet_${idx}`)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-[11px] flex items-center gap-1"
                      title="Copy this single tweet"
                    >
                      {copiedKey === `tweet_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Tweet Body */}
                  <div className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap font-normal">
                    {tweetText}
                  </div>

                  {/* Sub Action Bar */}
                  <div className="flex items-center gap-6 text-slate-500 text-xs pt-1">
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> 8</span>
                    <span className="flex items-center gap-1"><Repeat2 className="w-3.5 h-3.5" /> 24</span>
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> 95</span>
                    <span className="text-[11px] font-mono text-slate-500 ml-auto">{tweetText.length} chars</span>
                  </div>
                </div>
              ))}

              {/* Thread Footer Actions */}
              <div className="pt-4 border-t border-slate-900 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopyText(content, 'full_thread')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 border border-slate-800 transition-all"
                >
                  {copiedKey === 'full_thread' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Thread Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-sky-400" />
                      <span>Copy Full Thread ({threadList.length} Tweets)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenXIntent(threadList[0])}
                  className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <XIcon className="w-3.5 h-3.5" />
                  <span>Start Thread on 𝕏</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. 📷 INSTAGRAM PREVIEW CARD & CAROUSEL
  // ==========================================
  if (platform === 'instagram') {
    const activeSlideData = defaultCarouselSlides[activeSlide] || defaultCarouselSlides[0];

    return (
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-purple-900 via-pink-900 to-rose-900 text-white p-3.5 rounded-2xl border border-pink-800/50 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">Instagram Mobile Post & Carousel</span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-semibold border border-pink-400/30">
                  {defaultCarouselSlides.length} Slide Carousel
                </span>
              </div>
              <p className="text-[11px] text-pink-200/80">Caption, visual slide cards & high-engagement hashtags</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyText(content, 'insta_caption')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-50 text-pink-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              {copiedKey === 'insta_caption' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'insta_caption' ? 'Caption Copied!' : 'Copy Caption'}</span>
            </button>

            {hashtags && hashtags.length > 0 && (
              <button
                type="button"
                onClick={() => handleCopyText(hashtags.join(' '), 'insta_hashtags')}
                className="px-3 py-1.5 rounded-xl bg-pink-800/80 hover:bg-pink-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-pink-600/50"
              >
                {copiedKey === 'insta_hashtags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Tags</span>
              </button>
            )}
          </div>
        </div>

        {/* Instagram Mobile Frame Mockup */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto overflow-hidden">
          {/* Instagram Post Header */}
          <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                <div className="w-8 h-8 rounded-full bg-white p-0.5 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {location.charAt(0)}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>{location.toLowerCase().replace(/\s+/g, '')}.insights</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                </p>
                <p className="text-[10px] text-slate-500 font-medium">{location}, India</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-bold">•••</span>
          </div>

          {/* Interactive Carousel Visual Card */}
          <div className="relative aspect-square bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white p-6 flex flex-col justify-between overflow-hidden group">
            {/* Ambient background accent */}
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

            {/* Slide Header */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-pink-300 border border-white/10">
                Slide {activeSlide + 1} of {defaultCarouselSlides.length}
              </span>
              <span className="text-[11px] font-bold text-white/70">Zenithian Visual Intel</span>
            </div>

            {/* Slide Body */}
            <div className="relative z-10 space-y-2.5 my-auto py-4">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-widest block">
                {activeSlideData.tagline || 'Location Focus'}
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                {activeSlideData.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSlideData.body}
              </p>
            </div>

            {/* Slide Carousel Controls & Dots */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : defaultCarouselSlides.length - 1))}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {defaultCarouselSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === i ? 'w-5 bg-pink-400' : 'w-1.5 bg-white/30'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveSlide((prev) => (prev < defaultCarouselSlides.length - 1 ? prev + 1 : 0))}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Instagram Actions Bar */}
          <div className="p-3.5 space-y-3">
            <div className="flex items-center justify-between text-slate-800">
              <div className="flex items-center gap-4">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500 cursor-pointer" />
                <MessageCircle className="w-5 h-5 hover:text-slate-500 cursor-pointer" />
                <Send className="w-5 h-5 hover:text-slate-500 cursor-pointer" />
              </div>
              <Bookmark className="w-5 h-5 hover:text-slate-500 cursor-pointer" />
            </div>

            <p className="text-xs font-bold text-slate-900">482 likes</p>

            {/* Caption Section */}
            <div className="text-xs text-slate-800 space-y-1.5 leading-relaxed">
              <p>
                <span className="font-bold mr-1.5">{location.toLowerCase().replace(/\s+/g, '')}.insights</span>
                <span className="whitespace-pre-wrap">{content}</span>
              </p>
            </div>

            {/* Hashtag Cloud */}
            {hashtags && hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                {hashtags.map((tag, i) => (
                  <span key={i} className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Creator Visual Prompt Suggestion */}
        {visualPrompt && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 max-w-md mx-auto">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-pink-600" />
              Suggested Instagram Visual / Creative Prompt:
            </span>
            <p className="text-slate-600 italic">"{visualPrompt}"</p>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. 💼 LINKEDIN PREVIEW CARD
  // ==========================================
  if (platform === 'linkedin') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-blue-900 text-white p-3.5 rounded-2xl border border-blue-800 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">LinkedIn Executive Post Preview</span>
          </div>
          <button
            type="button"
            onClick={() => handleCopyText(content, 'linkedin_post')}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            {copiedKey === 'linkedin_post' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'linkedin_post' ? 'Copied!' : 'Copy Post'}</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4 max-w-xl mx-auto font-sans">
          {/* Author Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              Z
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>Zenithian Location Intelligence</span>
                <span className="text-xs text-slate-400 font-normal">· 1st</span>
              </p>
              <p className="text-xs text-slate-500">Regional Analytics, Public Governance & Open Data</p>
              <p className="text-[11px] text-slate-400">Just now · 🌐</p>
            </div>
          </div>

          {/* Body Content */}
          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>

          {/* Hashtags */}
          {hashtags && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {hashtags.map((tag, idx) => (
                <span key={idx} className="text-xs font-semibold text-blue-700 hover:underline">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement Mockup */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>👍 148 · 24 comments</span>
            <span>6 reposts</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-around text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><ThumbsUp className="w-4 h-4" /> Like</span>
            <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><MessageCircle className="w-4 h-4" /> Comment</span>
            <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><Repeat2 className="w-4 h-4" /> Repost</span>
            <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><Send className="w-4 h-4" /> Send</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. 👥 FACEBOOK PREVIEW CARD
  // ==========================================
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-blue-700 text-white p-3.5 rounded-2xl border border-blue-600 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">Facebook Community Briefing Preview</span>
        </div>
        <button
          type="button"
          onClick={() => handleCopyText(content, 'facebook_post')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-blue-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          {copiedKey === 'facebook_post' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey === 'facebook_post' ? 'Copied!' : 'Copy Post'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            F
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{location} Community Desk</p>
            <p className="text-[11px] text-slate-500">Public Briefing · Just now</p>
          </div>
        </div>

        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><ThumbsUp className="w-4 h-4" /> Like</span>
          <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><MessageCircle className="w-4 h-4" /> Comment</span>
          <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"><Share2 className="w-4 h-4" /> Share</span>
        </div>
      </div>
    </div>
  );
}
