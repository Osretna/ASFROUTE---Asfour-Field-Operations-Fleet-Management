import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GanttChart } from './GanttChart';
import { LiveOperationsMap } from './LiveOperationsMap';
import { ReassignModal } from './ReassignModal';
import { WorkOrder, GanttTaskBlock } from '../../types';
import { 
  Compass, 
  Truck, 
  Users, 
  Plus, 
  MapPin, 
  Sparkles, 
  Calendar,
  Layers,
  Map as MapIcon,
  Maximize2
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

  const [viewMode, setViewMode] = useState<'map' | 'gantt' | 'split'>('map');
  const [reassignModalWo, setReassignModalWo] = useState<WorkOrder | null>(null);
  const [workOrderModalOpen, setWorkOrderModalOpen] = useState(false);

  const handleSelectGanttBlock = (block: GanttTaskBlock) => {
    const wo = workOrders.find(w => w.id === block.workOrderId);
    if (wo) {
      setSelectedWorkOrder(wo);
      setReassignModalWo(wo);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0A0E17] text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Action & View Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C5A45B]/15 border border-[#C5A45B]/30 flex items-center justify-center text-[#8E6A23] dark:text-[#DFBA6B]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isAr ? 'مركز الجدولة والملاحة الميدانية' : 'Dispatch & Navigation Hub'}</span>
            </h1>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAr ? 'تتبع مواقع العملاء الحية ومسارات الشاحنات بدقة عالية' : 'Live customer GPS pins & fleet dispatch navigation'}
            </span>
          </div>
        </div>

        {/* View Switcher: Map (Spacious) | Gantt | Split */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'map' 
                ? 'bg-[#C5A45B] text-[#0D131D] shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{isAr ? 'الخريطة المباشرة الواسعة' : 'Live Map'}</span>
          </button>

          <button
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'gantt' 
                ? 'bg-[#C5A45B] text-[#0D131D] shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isAr ? 'مخطط المواعيد (Gantt)' : 'Timeline'}</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'split' 
                ? 'bg-[#C5A45B] text-[#0D131D] shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'عرض مزدوج' : 'Split'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWorkOrderModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-sm shadow-[#C5A45B]/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'إضافة عميل / موقع' : 'New Order'}</span>
          </button>

          <button
            onClick={runAutoScheduleOptimizer}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A45B]" />
            <span>{isOptimizing ? (isAr ? 'تحسين المسار...' : 'Optimizing...') : (isAr ? 'تحسين ذكي' : 'Optimize')}</span>
          </button>
        </div>
      </div>

      {/* Spacious Main Workspace */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* VIEW 1: Full Spacious Live Map with Quick Dock */}
        {viewMode === 'map' && (
          <div className="flex-1 flex flex-col md:flex-row gap-3 overflow-hidden">
            {/* Quick Customer Location List on Left */}
            <div className="w-full md:w-80 shrink-0 bg-white dark:bg-[#0B0F17] rounded-2xl border border-slate-200 dark:border-slate-800/90 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#C5A45B]" />
                  <span>{isAr ? 'قائمة العملاء والمواقع' : 'Clients & Sites'}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {workOrders.length} {isAr ? 'موقع' : 'sites'}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
                {workOrders.map(wo => {
                  const hasLocation = wo.customerLocationConfirmed;
                  const isEnRoute = wo.status === 'en_route';

                  return (
                    <div
                      key={wo.id}
                      onClick={() => {
                        setSelectedWorkOrder(wo);
                        openDetailModal('work_order', wo);
                      }}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-[#C5A45B]/60 transition-all cursor-pointer flex flex-col gap-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {isAr ? wo.customerNameAr : wo.customerNameEn}
                        </span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                          isEnRoute 
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30'
                            : hasLocation 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        }`}>
                          {isEnRoute ? (isAr ? 'بالطريق' : 'En Route') : hasLocation ? (isAr ? 'محدد' : 'Pinned') : (isAr ? 'بانتظار' : 'Pending')}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C5A45B] shrink-0" />
                        <span className="truncate">{wo.governorate} · {isAr ? wo.locationNameAr : wo.locationNameEn}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Leaflet Map Container */}
            <div className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-md">
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
          </div>
        )}

        {/* VIEW 2: Full Gantt Timeline */}
        {viewMode === 'gantt' && (
          <div className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-md">
            <GanttChart 
              onSelectBlock={handleSelectGanttBlock}
              onOpenReassign={(woId) => {
                const wo = workOrders.find(w => w.id === woId);
                if (wo) setReassignModalWo(wo);
              }}
            />
          </div>
        )}

        {/* VIEW 3: Split View */}
        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col md:flex-row gap-3 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-md">
              <GanttChart 
                onSelectBlock={handleSelectGanttBlock}
                onOpenReassign={(woId) => {
                  const wo = workOrders.find(w => w.id === woId);
                  if (wo) setReassignModalWo(wo);
                }}
              />
            </div>
            <div className="w-full md:w-[480px] flex flex-col overflow-hidden rounded-2xl shadow-md">
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

      {/* Simple Work Order Modal */}
      {workOrderModalOpen && (
        <WorkOrderModal
          onClose={() => setWorkOrderModalOpen(false)}
        />
      )}
    </div>
  );
};
