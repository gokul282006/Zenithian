import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Share2, 
  History, 
  Settings as SettingsIcon, 
  User, 
  LogOut, 
  Compass, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function Sidebar({ backendStatus, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Generate Content', path: '/generate', icon: Sparkles },
    { label: 'Social & Presentation', path: '/social-presentation', icon: Share2 },
    { label: 'Output History', path: '/history', icon: History },
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
          <Compass className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight text-white">ZENITHIAN</h1>
          <p className="text-xs font-medium text-slate-400">AI Transformation</p>
        </div>
      </div>

      {/* Backend Status Indicator Pill */}
      <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-slate-300">Backend API:</span>
          {backendStatus?.status === 'online' ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold text-[10px]">
              <AlertCircle className="w-3 h-3" />
              Offline / Check API
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Strict Source Grounding</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-800">
        <div className="p-2.5 rounded-lg bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold text-slate-200 truncate">
                {user?.email || 'Authorized User'}
              </p>
              <p className="text-slate-400 text-[10px]">Active Session</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
