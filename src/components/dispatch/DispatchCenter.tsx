import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GanttChart } from './GanttChart';
import { LiveOperationsMap } from './LiveOperationsMap';
import { ReassignModal } from './ReassignModal';
import { Vehicle, InstallationTeam, WorkOrder, GanttTaskBlock } from '../../types';
import { 
  Compass, 
  Truck, 
  Users, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  Filter, 
  Search, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck,
  Maximize2,
  Minimize2,
  Calendar,
  MessageSquare
} from 'lucide-react';

import { WorkOrderModal } from '../workorders/WorkOrderModal';

export const DispatchCenter: React.FC = () => {
  const { 
    language, 
    vehicles, 
    teams, 
    workOrders, 
    setSelectedWorkOrder, 
    setSelectedVehicle, 
    runAutoScheduleOptimizer, 
    isOptimizing,
    openDetailModal 
  } = useApp();

  const isAr = language === 'ar';

  const [resourceFilter, setResourceFilter] = useState<'all' | 'vehicles' | 'teams'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reassignModalWo, setReassignModalWo] = useState<WorkOrder | null>(null);
  const [workOrderModalOpen, setWorkOrderModalOpen] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);

  // Filter resources
  const filteredVehicles = vehicles.filter(v => {
    if (statusFilter === 'active' && v.status !== 'on_route' && v.status !== 'at_customer') return false;
    if (statusFilter === 'available' && v.status !== 'available') return false;
    if (searchQuery && !v.id.toLowerCase().includes(searchQuery.toLowerCase()) && !v.model.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredTeams = teams.filter(t => {
    if (statusFilter === 'active' && t.status !== 'deployed') return false;
    if (statusFilter === 'available' && t.status !== 'ready') return false;
    if (searchQuery && !t.nameAr.includes(searchQuery) && !t.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSelectGanttBlock = (block: GanttTaskBlock) => {
    const wo = workOrders.find(w => w.id === block.workOrderId);
    if (wo) {
      setSelectedWorkOrder(wo);
      setReassignModalWo(wo);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0A0E17] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Dispatch Center Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#8E6A23] dark:text-[#DFBA6B]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isAr ? 'مركز الجدولة والتحكم الميداني (ديسباتشر كونسول)' : 'Dispatcher Console & Live Operations'}</span>
              <span className="text-[10px] font-mono bg-[#C5A45B]/20 text-[#8E6A23] dark:text-[#DFBA6B] px-1.5 py-0.5 rounded border border-[#C5A45B]/40 font-bold">
                SALESFORCE / ORACLE FSM TIER
              </span>
            </h1>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAr ? 'تزامن ثلاثي: قائمة الموارد · مخطط جانت التفاعلي · خريطة الملاحة الحية التفاعلية' : '3-Panel Layout: Resource Dock · Gantt Timeline · Interactive Live Navigation Radar'}
            </span>
          </div>
        </div>

        {/* Global Dispatch Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWorkOrderModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] transition-transform active:scale-95 shadow-md shadow-[#C5A45B]/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة أمر عمل جديد' : 'New Work Order'}</span>
          </button>

          <button
            onClick={() => setReassignModalWo(workOrders[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <span>{isAr ? 'جدولة يدوية / استبدال' : 'Manual Assign / Swap'}</span>
          </button>

          <button
            onClick={runAutoScheduleOptimizer}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] transition-transform active:scale-95 shadow-md shadow-[#C5A45B]/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOptimizing ? (isAr ? 'تحسين المسارات...' : 'Solving...') : (isAr ? 'تحسين ذكي (OR-Tools)' : 'Auto-Optimize')}</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-800 mx-1" />

          <button
            onClick={() => setMapCollapsed(!mapCollapsed)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
            title={mapCollapsed ? "Expand Map" : "Collapse Map"}
          >
            {mapCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3-Panel Main Layout Container */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Panel 1: Left Resource Dock (Vehicles + Teams) */}
        <div className="w-72 shrink-0 bg-white dark:bg-[#0B0F17] rounded-2xl border border-slate-200 dark:border-slate-800/90 flex flex-col overflow-hidden shadow-lg">
          {/* Resource Dock Header */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C5A45B]" />
                <span>{isAr ? 'الموارد المتاحة' : 'Fleet & Teams Dock'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {filteredVehicles.length + filteredTeams.length} units
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-2.5 left-2.5" />
              <input
                type="text"
                placeholder={isAr ? 'بحث برقم الشاحنة أو الفريق...' : 'Search plate, team...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#C5A45B]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                  statusFilter === 'active' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {isAr ? 'نشط' : 'Active'}
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer ${
                  statusFilter === 'available' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {isAr ? 'متاح' : 'Idle'}
              </button>
            </div>
          </div>

          {/* Resources Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {/* Trucks Section */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
              {isAr ? 'شاحنات نقل الثريات' : 'TRANSPORT TRUCKS'}
            </div>
            {filteredVehicles.map(v => {
              const isOnRoute = v.status === 'on_route';
              const isAtCustomer = v.status === 'at_customer';

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 hover:border-[#C5A45B]/60 transition-colors cursor-pointer flex flex-col gap-1.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{v.id}</span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{v.plateNumber}</span>
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                      isOnRoute 
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40' 
                        : isAtCustomer
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isOnRoute ? (isAr ? 'بالطريق' : 'En Route') : isAtCustomer ? (isAr ? 'بالموقع' : 'On Site') : (isAr ? 'متاحة' : 'Depot')}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {v.model}
                  </div>

                  {/* Load bar */}
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-200 dark:border-slate-800/60">
                    <span>{v.currentLoadKg}/{v.maxWeightKg} kg</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{v.hasPneumaticDamping ? 'Air-Damped' : 'Standard'}</span>
                  </div>
                </div>
              );
            })}

            {/* Teams Section */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1 mt-2">
              {isAr ? 'فِرق التركيب المعتمدة' : 'CERTIFIED TEAMS'}
            </div>
            {filteredTeams.map(t => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 hover:border-[#C5A45B]/60 transition-colors cursor-pointer flex flex-col gap-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {isAr ? t.nameAr : t.nameEn}
                  </span>
                  <span className="text-[10px] font-mono text-[#8E6A23] dark:text-[#DFBA6B] font-bold">
                    ★ {t.compositeSkillRating}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{isAr ? 'الحد الأقصى للارتفاع:' : 'Max Height:'}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-200">{t.maxHeightAuthorizedM}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Interactive Gantt Timeline (Center) */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${mapCollapsed ? 'w-full' : ''}`}>
          <GanttChart 
            onSelectBlock={handleSelectGanttBlock}
            onOpenReassign={(woId) => {
              const wo = workOrders.find(w => w.id === woId);
              if (wo) setReassignModalWo(wo);
            }}
          />
        </div>

        {/* Panel 3: Live Radar Map (Right) */}
        {!mapCollapsed && (
          <div className="w-80 lg:w-96 xl:w-[420px] shrink-0 flex flex-col overflow-hidden">
            <LiveOperationsMap
              onSelectWorkOrder={(wo) => {
                setSelectedWorkOrder(wo);
                openDetailModal('work_order', wo);
              }}
              onSelectVehicle={(v) => {
                setSelectedVehicle(v);
                openDetailModal('vehicle', v);
              }}
            />
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      {reassignModalWo && (
        <ReassignModal
          workOrder={reassignModalWo}
          onClose={() => setReassignModalWo(null)}
        />
      )}

      {/* Work Order Modal (Create / Edit) */}
      {workOrderModalOpen && (
        <WorkOrderModal
          onClose={() => setWorkOrderModalOpen(false)}
        />
      )}
    </div>
  );
};
