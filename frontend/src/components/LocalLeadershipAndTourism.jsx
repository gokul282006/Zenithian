import React from 'react';
import { UserCheck, Compass, MapPin, Sparkles, Shield, Award } from 'lucide-react';

export default function LocalLeadershipAndTourism({ location, localLeadership, tourismAndCulture }) {
  if (!localLeadership && !tourismAndCulture) {
    return null;
  }

  const mlaName = localLeadership?.mla_name || "Information currently unavailable";
  const mlaExp = localLeadership?.experience_details || "Detailed political background for the local MLA is unavailable in retrieved public archives.";
  const isMlaAvailable = mlaName && !mlaName.toLowerCase().includes("unavailable");

  const popularSpots = tourismAndCulture?.popular_spots || [];
  const hiddenGems = tourismAndCulture?.hidden_gems || [];
  const whyVisit = tourismAndCulture?.why_visit || `${location} is known for its rich local culture, historical landmarks, and vibrant community life.`;

  return (
    <div className="space-y-6 my-6">
      {/* LOCAL LEADERSHIP CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">Governance & Representation</span>
              <h3 className="text-base font-bold text-white">Local Leadership (MLA)</h3>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isMlaAvailable 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {isMlaAvailable ? 'Verified Record' : 'Record Unavailable'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="md:col-span-1 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>Current MLA</span>
            </div>
            <h4 className="text-lg font-black text-white">{mlaName}</h4>
            <p className="text-xs text-slate-400 font-medium">Constituency: {location}</p>
          </div>

          <div className="md:col-span-2 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Political Background & Governance Record</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {mlaExp}
            </p>
          </div>
        </div>
      </div>

      {/* DISCOVER LOCATION & HIDDEN GEMS CARD */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Tourism & Cultural Identity</span>
            <h3 className="text-base font-bold text-white">Discover {location} & Hidden Gems</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Popular Tourist Spots */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Popular Landmarks</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularSpots.length > 0 ? (
                popularSpots.map((spot, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-700/60 text-slate-200 text-xs font-semibold border border-slate-600/40">
                    • {spot}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Central Landmarks & Heritage Precincts</span>
              )}
            </div>
          </div>

          {/* Hidden Gems & Offbeat Spots */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hidden & Offbeat Gems</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hiddenGems.length > 0 ? (
                hiddenGems.map((gem, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs font-semibold border border-cyan-500/30">
                    ✦ {gem}
                  </span>
                ))
              ) : (
                <span className="text-xs text-cyan-300">Local Offbeat Nature Trails & Precincts</span>
              )}
            </div>
          </div>
        </div>

        {/* Why Visit / Unique Local Charm Narrative */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Why Visit & Unique Local Charm</span>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {whyVisit}
          </p>
        </div>
      </div>
    </div>
  );
}
