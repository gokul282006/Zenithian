import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '../services/supabase';
import { Compass, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        if (isRegister) {
          const { data, error: err } = await supabase.auth.signUp({ email, password });
          if (err) throw err;
          if (data.session) {
            onLoginSuccess(data.user);
            navigate('/dashboard');
          } else {
            setNotice('Account created. Check your email to confirm your account, then sign in.');
            setIsRegister(false);
          }
        } else {
          const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
          if (err) throw err;
          onLoginSuccess(data.user);
          navigate('/dashboard');
        }
      } else {
        // Fallback local session mode when Supabase env variables are not provided
        onLoginSuccess({ email, id: 'local_user_1' });
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.message || '';
      if (message.toLowerCase().includes('failed to fetch')) {
        setError('Unable to reach Supabase. In Vercel, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy the frontend.');
      } else {
        setError(message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">ZENITHIAN</h1>
          <p className="text-slate-400 text-sm mt-1">AI Content Transformation Platform</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="mb-6 p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 text-xs text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Local Authentication Mode:</span> Supabase environment credentials not set. Logging in will launch local user workspace.
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-xs text-rose-200 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@domain.gov.in"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-400 font-semibold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Register now'}
          </button>
        </div>
      </div>
    </div>
  );
}
