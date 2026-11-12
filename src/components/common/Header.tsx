import React from 'react';
import { useApp } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import { BranchId } from '../../types';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Globe, 
  MapPin, 
  Cpu, 
  Bell, 
  ShieldCheck,
  ShieldAlert,
  Sliders
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    theme, 
    toggleTheme, 
    activeBranchId, 
    setActiveBranchId,
    runAutoScheduleOptimizer,
    isOptimizing,
    eventLogs,
    handleAsfrouteWordmarkClick,
    isAdminAuthenticated,
    activeTab,
    setActiveTab
  } = useApp();

  const isAr = language === 'ar';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-6 px-6 py-3.5 bg-[#0D131D]/90 dark:bg-[#0D131D]/95 backdrop-blur-md border-b border-slate-800/80 text-slate-100">
      {/* Zone 1: Single Brand Wordmark with Secret Triple-Click Trigger */}
      <div 
        onClick={handleAsfrouteWordmarkClick}
        className="flex items-center gap-3 shrink-0 cursor-pointer select-none group"
        title={isAr ? 'نظام عصفور الذكي (انقر 3 مرات لفتح بوابة لوحة تحكم الأدمن)' : 'ASFROUTE (Triple-click for Super-Admin Access)'}
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C5A45B] to-[#997C38] flex items-center justify-center shadow-lg shadow-[#C5A45B]/15 text-[#0D131D] group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-white font-sans group-hover:text-[#DFBA6B] transition-colors">
              ASFROUTE
            </span>
            <span className="text-[11px] font-semibold text-[#DFBA6B] border border-[#C5A45B]/40 px-1.5 py-0.2 rounded font-sans tracking-wide">
              {isAr ? 'عصفور كريستال' : 'ASFOUR CRYSTAL'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            {isAr ? 'نظام العمليات الميدانية والجدولة الذكية' : 'Field Operations & Fleet Management System'}
          </span>
        </div>
      </div>

      {/* Zone 2: Branch Selector & Live Hub Context */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5">
        <MapPin className="w-4 h-4 text-[#C5A45B]" />
        <span className="text-xs text-slate-400 font-medium">
          {isAr ? 'النطاق التشغيلي:' : 'Hub Scope:'}
        </span>
        <select 
          value={activeBranchId}
          onChange={(e) => setActiveBranchId(e.target.value as BranchId | 'all')}
          className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer pr-1"
        >
          <option value="all" className="bg-slate-900 text-slate-200">
            {isAr ? '🌐 كافة الفروع والمستودعات المركزية' : '🌐 All Regional Depots & Hubs'}
          </option>
          {BRANCHES.map(branch => (
            <option key={branch.id} value={branch.id} className="bg-slate-900 text-slate-200">
              {isAr ? branch.nameAr : branch.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* If Admin is authenticated, show Admin Panel quick button */}
        {isAdminAuthenticated && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-[#C5A45B] text-[#0D131D] border-[#DFBA6B]'
                : 'bg-[#C5A45B]/15 text-[#DFBA6B] border-[#C5A45B]/40 hover:bg-[#C5A45B]/25'
            }`}
            title={isAr ? 'لوحة تحكم الأدمن والربط السحابي' : 'Admin Control Hub'}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'لوحة الأدمن' : 'Admin Panel'}</span>
          </button>
        )}

        {/* Auto-schedule OR-Tools solver button */}
        <button
          onClick={runAutoScheduleOptimizer}
          disabled={isOptimizing}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
            isOptimizing 
              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 cursor-wait'
              : 'bg-gradient-to-r from-[#C5A45B] to-[#B08F47] hover:from-[#D4B36A] hover:to-[#BFA057] text-[#0D131D] active:scale-95 shadow-[#C5A45B]/20'
          }`}
          title={isAr ? 'تشغيل خوارزمية التحسين الذكي OR-Tools' : 'Run OR-Tools Constraint Optimizer'}
        >
          <Cpu className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span className="whitespace-nowrap">
            {isOptimizing 
              ? (isAr ? 'جاري التحسين الذكي...' : 'Optimizing Routes...')
              : (isAr ? 'تحسين خطوط السير' : 'Optimize Routes')}
          </span>
        </button>

        {/* Notifications indicator */}
        <div className="relative p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          {eventLogs.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C5A45B]" />
          )}
        </div>

        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/80 border border-slate-800 transition-colors"
          title={isAr ? 'تبديل إلى English' : 'Switch to العربية'}
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>

        {/* Theme mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-300 hover:bg-slate-800/80 border border-slate-800 transition-colors"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-[#C5A45B]/40 flex items-center justify-center text-xs font-bold text-[#E8D49E]">
            AC
          </div>
          <div className="hidden xl:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200">
              {isAdminAuthenticated ? (isAr ? 'مشرف النظام العام' : 'Super-Admin') : (isAr ? 'غرفة العمليات المركزية' : 'Ops Dispatch Control')}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" />
              {isAdminAuthenticated ? 'ROOT ACCESS' : (isAr ? 'مُشرف معتمد' : 'Lead Dispatcher')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
