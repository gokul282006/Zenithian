import React, { useState } from 'react';
import { Image, ExternalLink, X, ZoomIn, ShieldCheck } from 'lucide-react';

export default function ImageGallery({ images, location }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Image className="w-4 h-4 text-blue-600" />
          Verified Visual Gallery ({images.length} Photos)
        </h3>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Wikimedia Commons Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedImage(img)}
            className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
          >
            <div className="h-40 overflow-hidden bg-slate-100 relative">
              <img
                src={img.url || img.thumbnail}
                alt={img.title || location}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="p-3 space-y-1">
              <h4 className="text-xs font-bold text-slate-800 truncate">{img.title}</h4>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-blue-600">{img.source || 'Wikimedia'}</span>
                <span className="truncate max-w-[120px]">{img.description || 'Verified Image'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Zoom View */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 space-y-4 p-6 relative">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-xl overflow-hidden bg-slate-100 max-h-96 flex items-center justify-center">
              <img
                src={selectedImage.url || selectedImage.thumbnail}
                alt={selectedImage.title}
                className="max-h-96 w-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">{selectedImage.title}</h3>
              <p className="text-xs text-slate-600">{selectedImage.description}</p>
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                <span className="font-semibold text-slate-500">Source: {selectedImage.source || 'Wikimedia Commons'}</span>
                <a
                  href={selectedImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-blue-500 transition-colors"
                >
                  <span>View High Res Original</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
