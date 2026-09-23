import React from 'react';
import { User, Mail, Shield, Key, Compass, LogOut } from 'lucide-react';

export default function Profile({ user, onLogout }) {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/20">
          {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-slate-900">{user?.email || 'Authorized User'}</h1>
          <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Zenithian Content Transformation Account</span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
          Account Credentials
        </h2>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-semibold text-slate-600 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> Email Address
            </span>
            <span className="font-mono text-slate-900">{user?.email || 'user@zenithian.ai'}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="font-semibold text-slate-600 flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" /> Account ID
            </span>
            <span className="font-mono text-slate-900">{user?.id || 'usr_local_active'}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Zenithian</span>
          </button>
        </div>
      </div>
    </div>
  );
}
