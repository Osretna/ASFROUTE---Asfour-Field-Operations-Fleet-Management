import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, KeyRound, User, Eye, EyeOff, X, Sparkles, ArrowRight, AlertCircle, Lock } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { language, showLoginModal, setShowLoginModal, loginAdmin } = useApp();
  const isAr = language === 'ar';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg(isAr ? 'يرجى إدخال اسم المستخدم وكلمة المرور' : 'Please enter both username and password');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const success = loginAdmin(username, password);
      setIsSubmitting(false);

      if (!success) {
        setErrorMsg(
          isAr 
            ? 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم وكلمة المرور.' 
            : 'Invalid credentials. Please verify your username and password.'
        );
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D131F] border-2 border-[#C5A45B]/60 rounded-3xl max-w-md w-full p-7 shadow-2xl text-slate-100 flex flex-col gap-5 relative overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#C5A45B]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DFBA6B] to-[#997C38] flex items-center justify-center text-[#0D131D] shadow-md shadow-[#C5A45B]/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isAr ? 'بوابة إدارة النظام والتحكم' : 'System Admin Control Portal'}
              </h2>
              <span className="text-[11px] text-[#DFBA6B] font-mono">
                {isAr ? 'جلسة مشفرة ومحمية' : 'Encrypted Super-Admin Session'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowLoginModal(false);
              setErrorMsg('');
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr 
              ? 'أدخل بيانات الاعتماد للوصول إلى لوحة ربط قواعد البيانات، السحابة، وتعديل مميزات أسطول عصفور.' 
              : 'Enter authorized credentials to access cloud connection hub, database sync, and fleet features.'}
          </p>

          {/* Username Input - empty by default, case-insensitive */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C5A45B]" />
              <span>{isAr ? 'اسم المستخدم (User Name):' : 'Username:'}</span>
            </label>
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={isAr ? 'أدخل اسم المستخدم (غير حساس للحالة)' : 'Enter username (case-insensitive)'}
              className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-[#C5A45B] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
            />
          </div>

          {/* Password Input - empty by default, masked */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#C5A45B]" />
              <span>{isAr ? 'كلمة المرور (Password):' : 'Password:'}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isAr ? '••••••••' : '••••••••'}
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-[#C5A45B] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 outline-none pr-10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#C5A45B] to-[#B08F47] hover:from-[#D4B36A] hover:to-[#BFA057] text-[#0A0D14] flex items-center justify-center gap-2 shadow-lg shadow-[#C5A45B]/20 cursor-pointer transition-transform active:scale-98"
          >
            <span>{isSubmitting ? (isAr ? 'جاري التحقق...' : 'Authenticating...') : (isAr ? 'دخول لوحة تحكم الأدمن' : 'Authenticate to Admin Panel')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          <span>ASFROUTE Enterprise IAM · RBAC Level 0</span>
        </div>
      </div>
    </div>
  );
};
