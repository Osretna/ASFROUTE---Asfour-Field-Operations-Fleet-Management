import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GanttTaskBlock, Vehicle, InstallationTeam } from '../../types';
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Truck, 
  Users, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface GanttChartProps {
  onSelectBlock: (block: GanttTaskBlock) => void;
  onOpenReassign: (workOrderId: string) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({ onSelectBlock, onOpenReassign }) => {
  const { language, vehicles, teams, ganttBlocks, workOrders } = useApp();
  const isAr = language === 'ar';

  const [currentDate, setCurrentDate] = useState('2026-11-12');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Working hours from 07:00 to 19:00 (12 hours)
  const START_HOUR = 7;
  const END_HOUR = 19;
  const TOTAL_HOURS = END_HOUR - START_HOUR;
  const hoursArray = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  const getPositionPercent = (startHour: number) => {
    const clamped = Math.max(START_HOUR, Math.min(END_HOUR, startHour));
    return ((clamped - START_HOUR) / TOTAL_HOURS) * 100;
  };

  const getWidthPercent = (durationHours: number) => {
    return (durationHours / TOTAL_HOURS) * 100;
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F17] rounded-xl border border-slate-800/90 overflow-hidden shadow-xl">
      {/* Gantt Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-[#C5A45B]" />
            <span className="text-xs font-mono font-bold text-slate-200">
              {currentDate} (اليوم)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('day')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'day' 
                  ? 'bg-[#C5A45B] text-[#0D131D] font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'يومي (Day)' : 'Day'}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'week' 
                  ? 'bg-[#C5A45B] text-[#0D131D] font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'أسبوعي (Week)' : 'Week'}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden xl:flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/80" />
            <span>{isAr ? 'رحلة ونقل (Travel)' : 'Travel & Transit'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#C5A45B]" />
            <span>{isAr ? 'رص وتجميع كريستال' : 'Crystal Assembly'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/80" />
            <span>{isAr ? 'رفع وسقالات (Rigging)' : 'Rigging & Winch'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80" />
            <span>{isAr ? 'تسليم واعتماد (Handover)' : 'Handover & Cert'}</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[850px] flex flex-col">
          {/* Time axis header */}
          <div className="flex border-b border-slate-800 bg-slate-950/70 text-[11px] font-mono text-slate-400 sticky top-0 z-20">
            <div className="w-48 shrink-0 px-3 py-2 border-e border-slate-800 font-sans font-bold text-slate-300">
              {isAr ? 'المورد (مركبة / فريق)' : 'Resource / Fleet'}
            </div>
            <div className="flex-1 grid grid-cols-12 relative">
              {hoursArray.map((hour) => (
                <div key={hour} className="px-2 py-2 border-e border-slate-800/60 text-center">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Rows */}
          <div className="flex flex-col divide-y divide-slate-800/50">
            {vehicles.map((vehicle) => {
              const blocks = ganttBlocks.filter(b => b.resourceId === vehicle.id);
              const loadPercent = Math.round((vehicle.currentLoadKg / vehicle.maxWeightKg) * 100);

              return (
                <div key={vehicle.id} className="flex hover:bg-slate-900/30 transition-colors group">
                  {/* Left Resource Label */}
                  <div className="w-48 shrink-0 p-2.5 border-e border-slate-800 bg-slate-950/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-blue-400" />
                          <span>{vehicle.id}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {vehicle.plateNumber}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5" title={vehicle.model}>
                        {vehicle.model}
                      </div>
                    </div>

                    {/* Weight Load Capacity Bar */}
                    <div className="mt-1.5 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>{isAr ? 'الحمولة:' : 'Payload:'}</span>
                        <span className={loadPercent > 85 ? 'text-amber-400' : 'text-slate-300'}>
                          {vehicle.currentLoadKg} / {vehicle.maxWeightKg} kg ({loadPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${loadPercent > 85 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                          style={{ width: `${Math.min(100, loadPercent)}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timeline Row Track */}
                  <div className="flex-1 relative h-16 bg-slate-950/20">
                    {/* Vertical grid lines */}
                    <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                      {hoursArray.map((hour) => (
                        <div key={hour} className="border-e border-slate-800/30 h-full" />
                      ))}
                    </div>

                    {/* Render Tasks on this vehicle */}
                    {blocks.map((block) => {
                      const left = getPositionPercent(block.startHour);
                      const width = getWidthPercent(block.durationHours);
                      const isAssembly = block.type === 'assembly';
                      const isTravel = block.type === 'travel';
                      const isRigging = block.type === 'rigging';

                      return (
                        <div
                          key={block.id}
                          onClick={() => onSelectBlock(block)}
                          style={{
                            [isAr ? 'right' : 'left']: `${left}%`,
                            width: `${width}%`
                          }}
                          className={`absolute top-2 bottom-2 rounded-md p-1.5 border shadow-md cursor-pointer transition-all hover:scale-[1.02] hover:z-30 overflow-hidden flex flex-col justify-between ${
                            isAssembly
                              ? 'bg-gradient-to-r from-[#C5A45B]/30 to-[#997C38]/40 border-[#C5A45B]/60 text-amber-200'
                              : isTravel
                              ? 'bg-blue-900/40 border-blue-500/50 text-blue-200'
                              : isRigging
                              ? 'bg-purple-900/40 border-purple-500/50 text-purple-200'
                              : 'bg-emerald-900/40 border-emerald-500/50 text-emerald-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold truncate">
                            <span className="truncate">{isAr ? block.titleAr : block.titleEn}</span>
                            {block.hasConflict && (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 animate-bounce" />
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 opacity-90">
                            <span>{block.startHour}:00 - {block.startHour + block.durationHours}:00</span>
                            <span className="capitalize">{block.type}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gantt Footer Helper */}
      <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A45B]" />
          {isAr 
            ? 'انقر على أي شريط مهمة لعرض التفاصيل أو إعادة التعيين اليدوي مع التدقيق الأمني' 
            : 'Click any task bar to inspect details or trigger constraint-checked reassignment'}
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Gantt Engine v2.4 · Time Step: 30m
        </span>
      </div>
    </div>
  );
};
