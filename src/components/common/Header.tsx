import React, { useState, useRef, useEffect } from 'react';
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
  Sliders,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Zap,
  X
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
    setActiveTab,
    unreadAlertCount,
    markAllLogsRead,
    triggerSimulatedIncident
  } = useApp();

  const isAr = language === 'ar';
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'alerts' | 'operations'>('all');
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showNotifications]);

  const filteredLogs = eventLogs.filter(log => {
    if (notifFilter === 'alerts') return log.severity === 'alert' || log.severity === 'warning';
    if (notifFilter === 'operations') return log.severity === 'info' || log.severity === 'success';
    return true;
  });

  const alertsCount = eventLogs.filter(l => l.severity === 'alert' || l.severity === 'warning').length;

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-6 py-3 bg-white/95 dark:bg-[#0D131D]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 shadow-sm transition-colors duration-200">
      {/* Zone 1: Single Brand Wordmark with Secret Triple-Click Trigger */}
      <div 
        onClick={handleAsfrouteWordmarkClick}
        className="flex items-center gap-3 shrink-0 cursor-pointer select-none group"
        title={isAr ? 'نظام عصفور الذكي (انقر 3 مرات لفتح بوابة لوحة تحكم الأدمن)' : 'ASFROUTE (Triple-click for Super-Admin Access)'}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C5A45B] to-[#997C38] flex items-center justify-center shadow-lg shadow-[#C5A45B]/20 text-[#0D131D] group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-sans group-hover:text-[#947125] dark:group-hover:text-[#DFBA6B] transition-colors">
              ASFROUTE
            </span>
            <span className="text-[11px] font-semibold text-[#8E6A23] dark:text-[#DFBA6B] border border-[#C5A45B]/50 px-1.5 py-0.2 rounded font-sans tracking-wide bg-[#C5A45B]/10">
              {isAr ? 'عصفور كريستال' : 'ASFOUR CRYSTAL'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            {isAr ? 'نظام العمليات الميدانية والجدولة الذكية' : 'Field Operations & Fleet Management System'}
          </span>
        </div>
      </div>

      {/* Zone 2: Branch Selector & Live Hub Context */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5">
        <MapPin className="w-4 h-4 text-[#C5A45B]" />
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {isAr ? 'النطاق التشغيلي:' : 'Hub Scope:'}
        </span>
        <select 
          value={activeBranchId}
          onChange={(e) => setActiveBranchId(e.target.value as BranchId | 'all')}
          className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
        >
          <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {isAr ? '🌐 كافة الفروع والمستودعات المركزية' : '🌐 All Regional Depots & Hubs'}
          </option>
          {BRANCHES.map(branch => (
            <option key={branch.id} value={branch.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
              {isAr ? branch.nameAr : branch.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* If Admin is authenticated, show Admin Panel quick button */}
        {isAdminAuthenticated && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-[#C5A45B] text-[#0D131D] border-[#DFBA6B]'
                : 'bg-[#C5A45B]/15 text-[#8E6A23] dark:text-[#DFBA6B] border-[#C5A45B]/40 hover:bg-[#C5A45B]/25'
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
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md ${
            isOptimizing 
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/50 cursor-wait'
              : 'bg-gradient-to-r from-[#C5A45B] to-[#B08F47] hover:from-[#D4B36A] hover:to-[#BFA057] text-[#0D131D] active:scale-95 shadow-[#C5A45B]/20 font-bold'
          }`}
          title={isAr ? 'تشغيل خوارزمية التحسين الذكي OR-Tools' : 'Run OR-Tools Constraint Optimizer'}
        >
          <Cpu className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span className="whitespace-nowrap hidden sm:inline">
            {isOptimizing 
              ? (isAr ? 'جاري التحسين...' : 'Optimizing...')
              : (isAr ? 'تحسين خطوط السير' : 'Optimize Routes')}
          </span>
        </button>

        {/* Notifications Button & Dropdown Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
              showNotifications
                ? 'bg-[#C5A45B]/20 text-[#8E6A23] dark:text-[#DFBA6B] border-[#C5A45B]'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80'
            }`}
            title={isAr ? 'مركز الإشعارات والتنبيهات الميدانية' : 'Notifications & Live Alerts'}
          >
            <Bell className="w-4 h-4" />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white font-mono text-[9px] font-bold shadow-md animate-pulse">
                {alertsCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Panel */}
          {showNotifications && (
            <div className="absolute left-0 lg:left-auto right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0D131F] border-2 border-slate-300 dark:border-slate-700 shadow-2xl z-50 text-slate-800 dark:text-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C5A45B]/20 flex items-center justify-center text-[#8E6A23] dark:text-[#DFBA6B]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isAr ? 'مركز الإشعارات والتنبيهات' : 'Operations Notification Center'}
                    </h3>
                    <span className="text-[10px] text-slate-500">
                      {eventLogs.length} {isAr ? 'تنبيه مسجل' : 'events logged'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={markAllLogsRead}
                    className="text-[10px] px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    title={isAr ? 'تمييز الكل كمقروء' : 'Mark all read'}
                  >
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span>{isAr ? 'مقروء' : 'Read'}</span>
                  </button>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`flex-1 py-1 rounded text-center transition-colors font-medium cursor-pointer ${
                    notifFilter === 'all' 
                      ? 'bg-[#C5A45B] text-[#0D131D] font-bold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isAr ? 'الكل' : 'All'}
                </button>
                <button
                  onClick={() => setNotifFilter('alerts')}
                  className={`flex-1 py-1 rounded text-center transition-colors font-medium flex items-center justify-center gap-1 cursor-pointer ${
                    notifFilter === 'alerts' 
                      ? 'bg-red-500 text-white font-bold' 
                      : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{isAr ? `تنبيهات (${alertsCount})` : `Alerts (${alertsCount})`}</span>
                </button>
                <button
                  onClick={() => setNotifFilter('operations')}
                  className={`flex-1 py-1 rounded text-center transition-colors font-medium cursor-pointer ${
                    notifFilter === 'operations' 
                      ? 'bg-[#C5A45B] text-[#0D131D] font-bold' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isAr ? 'العمليات' : 'Ops'}
                </button>
              </div>

              {/* Trigger Simulated Problem / Incident Alert */}
              <div className="p-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-2">
                <span className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1 font-semibold">
                  <Zap className="w-3 h-3 text-amber-500" />
                  {isAr ? 'فحص واختبار التنبيهات:' : 'Test Alert Generator:'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => triggerSimulatedIncident('speed')}
                    className="text-[9px] px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 font-bold transition-all cursor-pointer"
                    title={isAr ? 'محاكاة إنذار تجاوز سرعة الشاحنة' : 'Simulate Speed Violation'}
                  >
                    {isAr ? '⚠️ سرعة' : 'Speed'}
                  </button>
                  <button
                    onClick={() => triggerSimulatedIncident('vibration')}
                    className="text-[9px] px-2 py-0.5 rounded bg-amber-600 text-white hover:bg-amber-700 font-bold transition-all cursor-pointer"
                    title={isAr ? 'محاكاة إنذار اهتزاز بلورات الكريستال' : 'Simulate Vibration Sensor Alert'}
                  >
                    {isAr ? '⚠️ اهتزاز' : 'Vibration'}
                  </button>
                  <button
                    onClick={() => triggerSimulatedIncident('delay')}
                    className="text-[9px] px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 font-bold transition-all cursor-pointer"
                    title={isAr ? 'محاكاة تأخير مسار الشاحنة' : 'Simulate Delay'}
                  >
                    {isAr ? '⚠️ تأخير' : 'Delay'}
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-1">
                {filteredLogs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    {isAr ? 'لا توجد إشعارات في هذا التصنيف' : 'No notifications in this view'}
                  </div>
                ) : (
                  filteredLogs.map(log => {
                    const isAlert = log.severity === 'alert';
                    const isWarn = log.severity === 'warning';
                    const isSuccess = log.severity === 'success';

                    return (
                      <div 
                        key={log.id} 
                        className={`p-2.5 rounded-lg transition-colors flex flex-col gap-1 text-xs ${
                          isAlert 
                            ? 'bg-red-500/10 hover:bg-red-500/15 border-s-2 border-red-500' 
                            : isWarn 
                            ? 'bg-amber-500/10 hover:bg-amber-500/15 border-s-2 border-amber-500'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold flex items-center gap-1.5 ${
                            isAlert ? 'text-red-600 dark:text-red-400' :
                            isWarn ? 'text-amber-600 dark:text-amber-400' :
                            isSuccess ? 'text-emerald-600 dark:text-emerald-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`}>
                            {isAlert && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                            {isWarn && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                            {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                            {!isAlert && !isWarn && !isSuccess && <Clock className="w-3.5 h-3.5 shrink-0" />}
                            <span className="truncate">{isAr ? log.titleAr : log.titleEn}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-400 tabular-nums shrink-0">
                            {log.timestamp}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {isAr ? log.descriptionAr : log.descriptionEn}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title={isAr ? 'تبديل إلى English' : 'Switch to العربية'}
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>

        {/* Theme mode toggle: Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'تبديل للوضع الفاتح (Light Mode)' : 'تبديل للوضع الليلي (Dark Mode)'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-180" />
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-[#C5A45B]/60 flex items-center justify-center text-xs font-bold text-[#8E6A23] dark:text-[#E8D49E]">
            AC
          </div>
          <div className="hidden xl:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAdminAuthenticated ? (isAr ? 'مشرف النظام العام' : 'Super-Admin') : (isAr ? 'غرفة العمليات المركزية' : 'Ops Dispatch Control')}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3" />
              {isAdminAuthenticated ? 'ROOT ACCESS' : (isAr ? 'مُشرف معتمد' : 'Lead Dispatcher')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
