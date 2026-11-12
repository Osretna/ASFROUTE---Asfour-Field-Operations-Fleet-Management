import React, { useState } from 'react';
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
  Send,
  Plus
} from 'lucide-react';
import { WorkOrderModal } from '../workorders/WorkOrderModal';

export const ExecutiveDashboard: React.FC = () => {
  const { 
    language, 
    vehicles, 
    technicians, 
    workOrders, 
    eventLogs, 
    setActiveTab, 
    openDetailModal,
    sendCustomerLocationRequestWhatsApp,
    issueDeliveryDispatchOrder
  } = useApp();

  const isAr = language === 'ar';
  const [modalOpen, setModalOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending_location' | 'dispatched'>('all');

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'on_route' || v.status === 'at_customer').length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const totalTasks = workOrders.length;
  const completedTasks = workOrders.filter(w => w.status === 'certified_closed' || w.status === 'completed_handover').length;
  const locationConfirmedCount = workOrders.filter(w => w.customerLocationConfirmed).length;

  const filteredOrders = workOrders.filter(wo => {
    if (quickFilter === 'pending_location') return !wo.customerLocationConfirmed;
    if (quickFilter === 'dispatched') return wo.status === 'en_route';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8 h-full overflow-y-auto max-w-7xl mx-auto w-full pb-32 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Header: Simple & Spacious */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span>{isAr ? 'لوحة المتابعة والعمليات' : 'Operations Dashboard'}</span>
            <span className="text-[11px] font-mono bg-[#C5A45B]/15 text-[#8E6A23] dark:text-[#DFBA6B] border border-[#C5A45B]/30 px-2 py-0.5 rounded-full font-bold">
              {isAr ? 'عصفور كريستال' : 'Asfour'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? 'إدارة سهلة لطلبات العملاء، مواعيد التركيب، وتوجيه الشاحنات عبر الخريطة والواتساب' : 'Simplified view for client orders, installation schedules & WhatsApp live dispatch'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-md shadow-[#C5A45B]/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة عميل / أمر عمل' : 'New Order'}</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <span>{isAr ? 'الخريطة المباشرة' : 'Live Map'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A45B]" />
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards (Spacious, Uncrowded) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div 
          onClick={() => vehicles[0] && openDetailModal('vehicle', vehicles[0])}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-[#C5A45B]/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isAr ? 'الشاحنات بالأسطول' : 'Fleet Trucks'}</span>
            <Truck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{totalVehicles}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">({activeVehicles} {isAr ? 'بالطريق' : 'active'})</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {availableVehicles} {isAr ? 'جاهزة بالمستودع' : 'idle in depot'}
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => workOrders[0] && openDetailModal('work_order', workOrders[0])}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-[#C5A45B]/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isAr ? 'إجمالي طلبات التركيب' : 'Total Orders'}</span>
            <CalendarCheck className="w-4 h-4 text-[#C5A45B]" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">{totalTasks}</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">({completedTasks} {isAr ? 'منجز' : 'done'})</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isAr ? 'نسبة الإنجاز 85%' : '85% SLA rate'}
          </div>
        </div>

        {/* Metric 3: WhatsApp GPS Status */}
        <div 
          onClick={() => setQuickFilter('pending_location')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isAr ? 'لوكيشن محدد بالخريطة' : 'GPS Verified'}</span>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">{locationConfirmedCount}</span>
            <span className="text-xs text-slate-400 font-mono">/{totalTasks} {isAr ? 'موقع' : 'sites'}</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            {isAr ? 'تحديد تلقائي من العنوان' : 'Auto-geocoded'}
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          onClick={() => setActiveTab('dispatch')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500/50 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">{isAr ? 'أوامر تحرك السيارات' : 'Dispatched Trucks'}</span>
            <Navigation className="w-4 h-4 text-blue-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">{activeVehicles}</span>
            <span className="text-xs text-slate-400">{isAr ? 'شاحنة نشطة' : 'en route'}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {isAr ? 'مربوطة بخرائط Google' : 'Google Maps routing'}
          </div>
        </div>
      </div>

      {/* Main Clean Work Orders & WhatsApp Dispatch Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col gap-4">
        {/* Section Header with Quick Clean Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C5A45B]" />
              <span>{isAr ? 'مواقع وطلبات العملاء (تحديد الموقع وأمر التحرك)' : 'Client Locations & Dispatch Orders'}</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isAr ? 'انقر على أي عميل لعرض موقعه، إرسال طلب الواتساب، أو إعطاء أمر التحرك للشاحنة' : 'Click any client to inspect GPS pin, request WhatsApp location, or dispatch truck'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                quickFilter === 'all' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {isAr ? 'كافة الطلبات' : 'All'}
            </button>
            <button
              onClick={() => setQuickFilter('pending_location')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                quickFilter === 'pending_location' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {isAr ? 'بانتظار اللوكيشن' : 'Need Location'}
            </button>
            <button
              onClick={() => setQuickFilter('dispatched')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                quickFilter === 'dispatched' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {isAr ? 'شاحنات بالطريق' : 'Dispatched'}
            </button>
          </div>
        </div>

        {/* Clean, Spacious Cards for Customer Orders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredOrders.map(wo => {
            const hasLocation = wo.customerLocationConfirmed;
            const isEnRoute = wo.status === 'en_route';

            return (
              <div
                key={wo.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 hover:border-[#C5A45B]/60 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                {/* Top Row: Customer info & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="cursor-pointer" onClick={() => openDetailModal('work_order', wo)}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white hover:text-[#8E6A23] dark:hover:text-[#DFBA6B] transition-colors">
                        {isAr ? wo.customerNameAr : wo.customerNameEn}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                        {wo.orderNumber}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A45B] shrink-0" />
                      <span className="truncate">{wo.governorate} · {isAr ? wo.locationNameAr : wo.locationNameEn}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    isEnRoute
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      : hasLocation
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {isEnRoute ? (isAr ? '🚚 السيارة بالطريق' : '🚚 En Route') : hasLocation ? (isAr ? '📍 اللوكيشن محدد' : '📍 Location Set') : (isAr ? '⏳ بانتظار الموقع' : '⏳ Need Pin')}
                  </span>
                </div>

                {/* Chandelier info */}
                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                  <span className="truncate">{isAr ? wo.chandelier.modelNameAr : wo.chandelier.modelNameEn}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 shrink-0">{wo.timeWindowStart} - {wo.timeWindowEnd}</span>
                </div>

                {/* Actions: Send WhatsApp Location Request & Issue Delivery Order */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      const res = sendCustomerLocationRequestWhatsApp(wo.id);
                      if (res.url) window.open(res.url, '_blank');
                    }}
                    className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'طلب الموقع (واتساب)' : 'WhatsApp Req'}</span>
                  </button>

                  <button
                    onClick={() => {
                      issueDeliveryDispatchOrder(wo.id);
                    }}
                    disabled={isEnRoute}
                    className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isEnRoute
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 cursor-default'
                        : 'bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-sm shadow-[#C5A45B]/20'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{isEnRoute ? (isAr ? 'الشاحنة بالطريق' : 'En Route') : (isAr ? 'أمر التوصيل للشاحنة' : 'Dispatch Order')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple Work Order Creation Modal */}
      {modalOpen && (
        <WorkOrderModal onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
};
