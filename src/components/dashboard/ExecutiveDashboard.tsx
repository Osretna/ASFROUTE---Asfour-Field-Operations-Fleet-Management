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
  BarChart2
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
    openDetailModal 
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
  const delayedTasks = 1; // 1 delayed for realistic operations

  const completionRate = Math.round((completedTasks / (totalTasks || 1)) * 100);

  // Governorate distribution
  const governorates = [
    { nameAr: 'القاهرة والعاصمة الإدارية', nameEn: 'Cairo & New Capital', count: 4, pct: 50, color: 'bg-[#C5A45B]' },
    { nameAr: 'الجيزة والشيخ زايد', nameEn: 'Giza & Sheikh Zayed', count: 2, pct: 25, color: 'bg-blue-500' },
    { nameAr: 'الإسكندرية والساحل', nameEn: 'Alexandria & North Coast', count: 1, pct: 12.5, color: 'bg-emerald-500' },
    { nameAr: 'العاشر من رمضان والشرقية', nameEn: '10th of Ramadan & Sharqia', count: 1, pct: 12.5, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Hero Welcome & Operational Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-[#131B2A] to-[#0E1522] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-[#C5A45B]/5 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#DFBA6B] shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">
                {isAr ? 'لوحة العمليات والتحكم المركزي – عصفور كريستال' : 'Central Operations Control – Asfour Crystal'}
              </h1>
              <span className="text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                SLA: 98.4%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAr 
                ? 'متابعة حية لأسطول الشاحنات المجهزة، فِرق تركيب الثريات الملكية، ومعدلات الأداء اللحظية' 
                : 'Real-time monitoring of shock-damped fleet, royal chandelier rigging crews & live SLAs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setActiveTab('dispatch')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] transition-transform active:scale-95 shadow-lg shadow-[#C5A45B]/20 cursor-pointer"
          >
            <span>{isAr ? 'فتح مركز الجدولة (Gantt & Map)' : 'Open Dispatcher Console'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {/* Vehicles */}
        <div 
          onClick={() => vehicles[0] && openDetailModal('vehicle', vehicles[0])}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-[#C5A45B]/60 transition-colors cursor-pointer group"
          title={isAr ? 'انقر لعرض شاشة تفاصيل الشاحنة' : 'Click to inspect vehicle'}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold group-hover:text-[#DFBA6B] transition-colors">{isAr ? 'شاحنات النقل' : 'Fleet Vehicles'}</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{totalVehicles}</span>
            <span className="text-xs text-emerald-400 font-mono">({activeVehicles} {isAr ? 'بالطريق' : 'active'})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{isAr ? 'متاحة بالمستودع:' : 'Depot ready:'}</span>
            <span className="font-mono text-slate-300 tabular-nums">{availableVehicles}</span>
          </div>
        </div>

        {/* Technicians */}
        <div 
          onClick={() => technicians[0] && openDetailModal('technician', technicians[0])}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-[#C5A45B]/60 transition-colors cursor-pointer group"
          title={isAr ? 'انقر لعرض شاشة تفاصيل الفني' : 'Click to inspect technician'}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold group-hover:text-[#DFBA6B] transition-colors">{isAr ? 'فنيي ومهندسي التركيب' : 'Installation Technicians'}</span>
            <Users className="w-4 h-4 text-[#C5A45B]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{totalTechs}</span>
            <span className="text-xs text-[#DFBA6B] font-mono">({fieldTechs} {isAr ? 'بالميدان' : 'in field'})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{isAr ? 'كبير مهندسين معتمد:' : 'Master Certified:'}</span>
            <span className="font-mono text-slate-300 tabular-nums">4</span>
          </div>
        </div>

        {/* Work Orders Today */}
        <div 
          onClick={() => workOrders[0] && openDetailModal('work_order', workOrders[0])}
          className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-[#C5A45B]/60 transition-colors cursor-pointer group"
          title={isAr ? 'انقر لعرض شاشة تفاصيل أمر العمل' : 'Click to inspect work order'}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold group-hover:text-[#DFBA6B] transition-colors">{isAr ? 'مهام اليوم' : 'Today Tasks'}</span>
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{totalTasks}</span>
            <span className="text-xs text-blue-400 font-mono">({inProgressTasks} {isAr ? 'قيد التنفيذ' : 'active'})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{isAr ? 'مكتملة ومُسلّمة:' : 'Completed:'}</span>
            <span className="font-mono text-emerald-400 tabular-nums">{completedTasks}</span>
          </div>
        </div>

        {/* Completion % */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{isAr ? 'نسبة الإنجاز اللحظية' : 'Daily Completion'}</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{completionRate}%</span>
            <span className="text-xs text-amber-400 font-mono">({delayedTasks} {isAr ? 'تأخير' : 'delayed'})</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#C5A45B] h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Average Arrival Time */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-colors col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{isAr ? 'متوسط زمن الوصول' : 'Avg Arrival ETA'}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">28</span>
            <span className="text-xs text-slate-400">{isAr ? 'دقيقة' : 'mins'}</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>-6 min vs Target</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Operations Stream & Operations Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operations Breakdown & Geographic Distribution */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active Work Orders Snapshot */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#C5A45B]" />
                <h2 className="text-sm font-bold text-slate-100">
                  {isAr ? 'أوامر العمل النشطة وقيمة الثريات الجاري تركيبها' : 'Active High-Value Chandelier Work Orders'}
                </h2>
              </div>
              <button 
                onClick={() => setActiveTab('workorders')}
                className="text-xs text-[#DFBA6B] hover:underline cursor-pointer"
              >
                {isAr ? 'عرض الكل' : 'View All'}
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {workOrders.slice(0, 4).map(wo => (
                <div 
                  key={wo.id}
                  onClick={() => openDetailModal('work_order', wo)}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-[#C5A45B]/50 transition-colors cursor-pointer group"
                  title={isAr ? 'انقر لفتح كامل التفاصيل بشاشة مستقلة' : 'Click to inspect in separate screen'}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C5A45B]/15 border border-[#C5A45B]/30 flex items-center justify-center text-[#DFBA6B] text-xs font-bold font-mono shrink-0">
                      {wo.chandelier.layersCount}T
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 group-hover:text-[#DFBA6B] transition-colors">
                          {isAr ? wo.customerNameAr : wo.customerNameEn}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {wo.orderNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{isAr ? wo.chandelier.modelNameAr : wo.chandelier.modelNameEn}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-300">{wo.chandelier.weightKg} kg</span>
                        <span>·</span>
                        <span className="text-amber-400 font-mono">{wo.chandelier.totalCrystalPrisms.toLocaleString()} prisms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col text-end">
                      <span className="text-[11px] font-mono font-semibold text-slate-200">
                        {wo.timeWindowStart} - {wo.timeWindowEnd}
                      </span>
                      <span className="text-[10px] text-emerald-400 capitalize">
                        {wo.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Governorate Share */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  {isAr ? 'توزيع العمليات الميدانية حسب المحافظات' : 'Field Operations by Governorate'}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {workOrders.length} {isAr ? 'موقع نشط' : 'Active Sites'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {governorates.map(gov => (
                <div key={gov.nameEn} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{isAr ? gov.nameAr : gov.nameEn}</span>
                    <span className="text-slate-400 font-mono tabular-nums">{gov.count} ({gov.pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${gov.color} h-full rounded-full`} style={{ width: `${gov.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Event Feed (Audit & Operational Stream) */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#C5A45B]" />
                <h3 className="text-sm font-bold text-slate-100">
                  {isAr ? 'شريط العمليات اللحظي (Live Stream)' : 'Real-Time Operational Stream'}
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="flex flex-col gap-3.5 max-h-[460px] overflow-y-auto pe-1">
              {eventLogs.map((log) => {
                const isSuccess = log.severity === 'success';
                const isWarning = log.severity === 'warning';
                const isAlert = log.severity === 'alert';

                return (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/90 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold flex items-center gap-1.5 ${
                        isSuccess ? 'text-emerald-400' :
                        isWarning ? 'text-amber-400' :
                        isAlert ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        {isWarning && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                        {log.severity === 'info' && <Clock className="w-3.5 h-3.5 shrink-0" />}
                        <span>{isAr ? log.titleAr : log.titleEn}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAr ? log.descriptionAr : log.descriptionEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'تزامن الخادم: نشط عبر WebSocket' : 'Sync: Active via WebSocket'}</span>
            <span className="font-mono text-[11px] text-emerald-400">100% OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};
