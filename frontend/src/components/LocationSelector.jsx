import React from 'react';
import { COUNTRY_OPTIONS, INDIA_STATE_OPTIONS, LOCATIONS_BY_STATE } from '../data/locations';

export default function LocationSelector({ location, state, country, onLocationChange, onStateChange, onCountryChange }) {
  const isIndia = country === 'India';
  const locations = isIndia ? (LOCATIONS_BY_STATE[state] || []) : [];

  const handleCountryChange = (nextCountry) => {
    onCountryChange(nextCountry);
    onStateChange(nextCountry === 'India' ? 'Tamil Nadu' : '');
    onLocationChange('');
  };

  const handleStateChange = (nextState) => {
    onStateChange(nextState);
    onLocationChange('');
  };

  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Country <span className="text-rose-500">*</span>
        </label>
        <select
          required
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
        >
          {COUNTRY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          State / Province <span className="text-rose-500">*</span>
        </label>
        {isIndia ? (
          <select
            required
            value={state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
          >
            <option value="">Choose a state</option>
            {INDIA_STATE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        ) : (
          <input
            required
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            placeholder="e.g. California"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
          />
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Location / Constituency <span className="text-rose-500">*</span>
        </label>
        {locations.length > 0 ? (
          <select
            required
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
          >
            <option value="">Choose a location ({locations.length} available)</option>
            {locations.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        ) : (
          <input
            required
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Enter a city, town, or local area"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
          />
        )}
      </div>
    </>
  );
}
