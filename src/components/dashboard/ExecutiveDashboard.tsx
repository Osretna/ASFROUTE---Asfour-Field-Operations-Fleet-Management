import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  Users, 
  CalendarCheck, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  ArrowUpRight, 
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart2,
  MessageSquare,
  Navigation,
  Send
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    language, 
    vehicles, 
    technicians, 
    workOrders, 
    eventLogs, 
    setActiveTab, 
    runAutoScheduleOptimizer,
    isOptimizing,
    openDetailModal,
    sendCustomerLocationRequestWhatsApp,
    issueDeliveryDispatchOrder
  } = useApp();

  const isAr = language === 'ar';

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'on_route' || v.status === 'at_customer').length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const totalTechs = technicians.length;
  const fieldTechs = technicians.filter(t => t.status === 'on_site' || t.status === 'en_route').length;
  
  const totalTasks = workOrders.length;
  const completedTasks = workOrders.filter(w => w.status === 'certified_closed' || w.status === 'completed_handover').length;
  const inProgressTasks = workOrders.filter(w => w.status === 'crystal_assembly' || w.status === 'arrived_rigging' || w.status === 'en_route').length;
  const delayedTasks = 1;

  const completionRate = Math.round((completedTasks / (totalTasks || 1)) * 100);

  // WhatsApp Location Status Counter
  const locationConfirmedCount = workOrders.filter(w => w.customerLocationConfirmed).length;

  // Governorate distribution
  const governorates = [
    { nameAr: 'القاهرة والعاصمة الإدارية', nameEn: 'Cairo & New Capital', count: 4, pct: 50, color: 'bg-[#C5A45B]' },
    { nameAr: 'الجيزة والشيخ زايد', nameEn: 'Giza & Sheikh Zayed', count: 2, pct: 25, color: 'bg-blue-500' },
    { nameAr: 'الإسكندرية والساحل', nameEn: 'Alexandria & North Coast', count: 1, pct: 12.5, color: 'bg-emerald-500' },
    { nameAr: 'العاشر من رمضان والشرقية', nameEn: '10th of Ramadan & Sharqia', count: 1, pct: 12.5, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 h-full overflow-y-auto max-w-7xl mx-auto w-full pb-28 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Welcome & Operational Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-[#131B2A] dark:to-[#0E1522] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-[#C5A45B]/10 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#8E6A23] dark:text-[#DFBA6B] shadow-inner shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                {isAr ? 'لوحة العمليات والتحكم المركزي – عصفور كريستال' : 'Central Operations Control – Asfour Crystal'}
              </h1>
              <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                SLA: 98.4%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isAr 
                ? 'متابعة حية لأسطول الشاحنات المجهزة، فِرق تركيب الثريات الملكية، ومعدلات الأداء اللحظية' 
                : 'Real-time monitoring of shock-damped fleet, royal chandelier rigging crews & live SLAs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('dispatch')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] transition-transform active:scale-95 shadow-lg shadow-[#C5A45B]/20 cursor-pointer"
          >
            <span>{isAr ? 'فتح مركز الجدولة والخريطة' : 'Open Dispatcher Map'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* Vehicles */}
        <div 
          onClick={() => vehicles[0] && openDetailModal('vehicle', vehicles[0])}
          className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between hover:border-[#C5A45B]/60 shadow-sm transition-colors cursor-pointer group"
          title={isAr ? 'انقر لعرض شاشة تفاصيل الشاحنة' : 'Click to inspect vehicle'}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold group-hover:text-[#8E6A23] dark:group-hover:text-[#DFBA6B] transition-colors">{isAr ? 'شاحنات النقل' : 'Fleet Vehicles'}</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{totalVehicles}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">({activeVehicles} {isAr ? 'بالطريق' : 'active'})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{isAr ? 'متاحة بالمستودع:' : 'Depot ready:'}</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums">{availableVehicles}</span>
          </div>
        </div>

        {/* Technicians */}
        <div 
          onClick={() => technicians[0] && openDetailModal('technician', technicians[0])}
          className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between hover:border-[#C5A45B]/60 shadow-sm transition-colors cursor-pointer group"
          title={isAr ? 'انقر لعرض شاشة تفاصيل الفني' : 'Click to inspect technician'}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold group-hover:text-[#8E6A23] dark:group-hover:text-[#DFBA6B] transition-colors">{isAr ? 'فنيي ومهندسي التركيب' : 'Installation Technicians'}</span>
            <Users className="w-4 h-4 text-[#C5A45B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{totalTechs}</span>
            <span className="text-xs text-[#8E6A23] dark:text-[#DFBA6B] font-mono">({fieldTechs} {isAr ? 'بالميدان' : 'in field'})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{isAr ? 'كبير مهندسين معتمد:' : 'Master Certified:'}</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 tabular-nums">4</span>
          </div>
        </div>

        {/* Work Orders Today */}
        <div 
          onClick={() => workOrders[0] && openDetailModal('work_order', workOrders[0])}
          className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between hover:border-[#C5A45B]/60 shadow-sm transition-colors cursor-pointer group"
          title={isAr ? 'انقر لعرض شاشة تفاصيل أمر العمل' : 'Click to inspect work order'}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold group-hover:text-[#8E6A23] dark:group-hover:text-[#DFBA6B] transition-colors">{isAr ? 'مهام اليوم' : 'Today Tasks'}</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{totalTasks}</span>
            <span className="text-xs text-blue-500 font-mono">({inProgressTasks} {isAr ? 'قيد التنفيذ' : 'active'})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{isAr ? 'مكتملة ومُسلّمة:' : 'Completed:'}</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">{completedTasks}</span>
          </div>
        </div>

        {/* Completion % */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isAr ? 'نسبة الإنجاز اللحظية' : 'Daily Completion'}</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{completionRate}%</span>
            <span className="text-xs text-amber-500 font-mono">({delayedTasks} {isAr ? 'تأخير' : 'delayed'})</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#C5A45B] h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* WhatsApp Location Coordination Stat */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between hover:border-emerald-500/50 shadow-sm transition-colors col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isAr ? 'تأكيد لوكيشن الواتساب' : 'WhatsApp GPS Pins'}</span>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{locationConfirmedCount}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">/{totalTasks} {isAr ? 'مؤكد' : 'verified'}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isAr ? 'جاهز للتوجيه المباشر' : 'Ready for Dispatch'}</span>
          </div>
        </div>
      </div>

      {/* WhatsApp Location Dispatcher Quick Action Widget */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-white to-slate-50 dark:from-emerald-950/20 dark:via-slate-900/90 dark:to-slate-900/70 border border-emerald-500/30 shadow-md flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isAr ? 'متابعة إحداثيات ومواقع العملاء عبر واتساب' : 'Customer WhatsApp Location Dispatch Hub'}</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  LIVE WHATSAPP SYNC
                </span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'إرسال طلب الموقع للعميل، واستقبال الإحداثيات وتوجيه الشاحنات آلياً' : 'Request GPS pin from client via WhatsApp and route transport trucks directly'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('dispatch')}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isAr ? 'عرض الخريطة وتفاصيل الملاحة' : 'View Live Radar Map'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick List of Active Orders for WhatsApp Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {workOrders.slice(0, 3).map(wo => {
            const hasLocation = wo.customerLocationConfirmed;
            const isEnRoute = wo.status === 'en_route';

            return (
              <div 
                key={wo.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {isAr ? wo.customerNameAr : wo.customerNameEn}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {wo.customerPhone} · {wo.orderNumber}
                    </span>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    hasLocation
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {hasLocation ? (isAr ? '📍 الموقع مؤكد' : '📍 Location Verified') : (isAr ? '⏳ بانتظار اللوكيشن' : '⏳ Awaiting Pin')}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#C5A45B]" />
                  <span className="truncate">{isAr ? wo.locationNameAr : wo.locationNameEn}</span>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    onClick={() => {
                      const res = sendCustomerLocationRequestWhatsApp(wo.id);
                      if (res.url) window.open(res.url, '_blank');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isAr ? 'طلب اللوكيشن (واتساب)' : 'WhatsApp Req'}</span>
                  </button>

                  <button
                    onClick={() => {
                      issueDeliveryDispatchOrder(wo.id);
                    }}
                    disabled={isEnRoute}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      isEnRoute 
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 cursor-default'
                        : 'bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D]'
                    }`}
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isEnRoute ? (isAr ? 'الشاحنة بالطريق' : 'En Route') : (isAr ? 'أمر التوصيل' : 'Dispatch Order')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Live Operations Stream & Operations Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operations Breakdown & Geographic Distribution */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active Work Orders Snapshot */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#C5A45B]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isAr ? 'أوامر العمل النشطة وقيمة الثريات الجاري تركيبها' : 'Active High-Value Chandelier Work Orders'}
                </h2>
              </div>
              <button 
                onClick={() => setActiveTab('workorders')}
                className="text-xs text-[#8E6A23] dark:text-[#DFBA6B] font-bold hover:underline cursor-pointer"
              >
                {isAr ? 'عرض الكل' : 'View All'}
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {workOrders.slice(0, 4).map(wo => (
                <div 
                  key={wo.id}
                  onClick={() => openDetailModal('work_order', wo)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-[#C5A45B]/60 transition-colors cursor-pointer group shadow-sm"
                  title={isAr ? 'انقر لفتح كامل التفاصيل بشاشة مستقلة' : 'Click to inspect in separate screen'}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#C5A45B]/15 border border-[#C5A45B]/30 flex items-center justify-center text-[#8E6A23] dark:text-[#DFBA6B] text-xs font-bold font-mono shrink-0">
                      {wo.chandelier.layersCount}T
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#8E6A23] dark:group-hover:text-[#DFBA6B] transition-colors">
                          {isAr ? wo.customerNameAr : wo.customerNameEn}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {wo.orderNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{isAr ? wo.chandelier.modelNameAr : wo.chandelier.modelNameEn}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{wo.chandelier.weightKg} kg</span>
                        <span>·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-mono">{wo.chandelier.totalCrystalPrisms.toLocaleString()} prisms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col text-end">
                      <span className="text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200">
                        {wo.timeWindowStart} - {wo.timeWindowEnd}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize font-medium">
                        {wo.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Governorate Share */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isAr ? 'توزيع العمليات الميدانية حسب المحافظات' : 'Field Operations by Governorate'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {workOrders.length} {isAr ? 'موقع نشط' : 'Active Sites'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {governorates.map(gov => (
                <div key={gov.nameEn} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{isAr ? gov.nameAr : gov.nameEn}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">{gov.count} ({gov.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${gov.color} h-full rounded-full`} style={{ width: `${gov.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Event Feed (Audit & Operational Stream) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C5A45B]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isAr ? 'شريط العمليات اللحظي (Live Stream)' : 'Real-Time Operational Stream'}
                </h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto pe-1">
              {eventLogs.map((log) => {
                const isSuccess = log.severity === 'success';
                const isWarning = log.severity === 'warning';
                const isAlert = log.severity === 'alert';

                return (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/90 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold flex items-center gap-1.5 ${
                        isSuccess ? 'text-emerald-600 dark:text-emerald-400' :
                        isWarning ? 'text-amber-600 dark:text-amber-400' :
                        isAlert ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        {isWarning && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        {isAlert && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        {log.severity === 'info' && <Clock className="w-3.5 h-3.5 shrink-0" />}
                        <span>{isAr ? log.titleAr : log.titleEn}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isAr ? log.descriptionAr : log.descriptionEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>{isAr ? 'تزامن الخادم: نشط عبر WebSocket' : 'Sync: Active via WebSocket'}</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">100% OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
