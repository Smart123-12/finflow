import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Gem, 
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth = ({ isLoginMode }) => {
  const [isLogin, setIsLogin] = useState(isLoginMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(isLogin ? 'Authenticating...' : 'Registering your security ledger...');
    
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back to FinFlow!', { id: toastId });
      } else {
        await register(name, email, password);
        toast.success('Account created! Welcome to the gold standard.', { id: toastId });
      }
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Authorization failed. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Visual Marketing Board Panel (Left 7 cols on Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 text-white relative overflow-hidden">
        {/* Ambient backdrop glow elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <Gem className="w-6 h-6 text-brand-200" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight font-sans">
              FinFlow
            </h2>
            <span className="text-[10px] text-brand-200 font-bold uppercase tracking-widest leading-none">
              SaaS Personal Finance Ledger
            </span>
          </div>
        </div>

        {/* Mid Features slider mockup */}
        <div className="my-auto max-w-lg space-y-8 relative z-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/10 backdrop-blur-md text-brand-200">
              <Sparkles className="w-3.5 h-3.5" /> Introducing AI Financial Heuristics v2.0
            </span>
            <h3 className="text-4xl font-extrabold leading-tight tracking-tight font-sans">
              Take complete sovereignty over your wealth.
            </h3>
            <p className="text-brand-100 text-base leading-relaxed">
              Experience the visual elegance of institutional-grade cash flow analytics, dynamic warning parameters, and smart category budgeting triggers.
            </p>
          </div>

          {/* Core lists */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs hover:bg-white/8">
              <TrendingUp className="w-6 h-6 text-brand-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Compound Growth Mapping</h4>
                <p className="text-xs text-brand-200 leading-normal mt-0.5">Visualize your monthly net savings compounding through elegant vector graphics and charts.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs hover:bg-white/8">
              <ShieldCheck className="w-6 h-6 text-brand-300 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Cryptographic Encrypted Ledgers</h4>
                <p className="text-xs text-brand-200 leading-normal mt-0.5">Secure JWT sessions coupled with salt password hashing structures guard your statistics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-brand-300 relative z-10">
          © 2026 FinFlow Technologies Inc. All transactions fully simulated for analytical tracking.
        </div>
      </div>

      {/* Interactive Form Panel (Right 5 cols on Desktop) */}
      <div className="flex lg:col-span-5 items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          
          {/* Mobile App Branding Info */}
          <div className="flex flex-col items-center text-center lg:hidden">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 text-white glow-brand mb-4">
              <Gem className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              FinFlow
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest font-semibold">
              Premium SaaS AI Tracker
            </p>
          </div>

          {/* Title Header */}
          <div className="hidden lg:block space-y-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? 'Provide your credentials to access your ledger' : 'Get started by mapping your credentials'}
            </p>
          </div>

          {/* Form Element */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 focus:border-brand-500 dark:focus:border-brand-500 outline-none text-sm transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 focus:border-brand-500 dark:focus:border-brand-500 outline-none text-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <span className="text-xs text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 font-medium cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? 'Enter security passcode' : 'Minimum 6 characters'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 focus:border-brand-500 dark:focus:border-brand-500 outline-none text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm shadow-premium hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50"
            >
              <span>{isLogin ? 'Authorize Entry' : 'Register Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle mode trigger */}
          <div className="pt-2 text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {isLogin ? "New to FinFlow? " : "Already registered? "}
            </span>
            <button
              onClick={toggleMode}
              className="font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 underline decoration-2 decoration-brand-500/20"
            >
              {isLogin ? 'Sign up here' : 'Log in here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
