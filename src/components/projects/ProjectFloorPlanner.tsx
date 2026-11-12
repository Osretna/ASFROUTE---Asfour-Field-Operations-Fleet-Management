import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectBuilding } from '../../types';
import { ProjectModal } from './ProjectModal';
import { 
  Building2, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Search, 
  Plus, 
  Trash2,
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

export const ProjectFloorPlanner: React.FC = () => {
  const { language, projectBuildings, deleteProjectBuilding, deleteChandelierUnit } = useApp();
  const isAr = language === 'ar';

  const [selectedBuilding, setSelectedBuilding] = useState<ProjectBuilding>(projectBuildings[0] || {} as ProjectBuilding);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(projectBuildings[0]?.zones?.[0]?.id || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'building' | 'unit'>('building');

  const selectedZone = selectedBuilding?.zones?.find(z => z.id === selectedZoneId) || selectedBuilding?.zones?.[0];
  const overallProgress = selectedBuilding?.totalChandelierUnits 
    ? Math.round((selectedBuilding.installedUnits / selectedBuilding.totalChandelierUnits) * 100) 
    : 0;

  const handleOpenAddBuilding = () => {
    setModalMode('building');
    setModalOpen(true);
  };

  const handleOpenAddUnit = () => {
    setModalMode('unit');
    setModalOpen(true);
  };

  const handleDeleteBuilding = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا المشروع بالكامل؟' : 'Are you sure you want to delete this project?')) {
      deleteProjectBuilding(id);
      if (selectedBuilding.id === id) {
        setSelectedBuilding(projectBuildings[0] || {} as ProjectBuilding);
      }
    }
  };

  const handleDeleteUnit = (unitId: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذه الثريا من القاعة؟' : 'Remove this chandelier unit?')) {
      deleteChandelierUnit(selectedBuilding.id, selectedZone.id, unitId);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 max-w-7xl mx-auto w-full gap-5 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#C5A45B]" />
            <h1 className="text-xl font-bold text-white">
              {isAr ? 'مخطط الطوابق والمشاريع الكبرى (Floor & Zone Planner)' : 'Palatial Project Floor & Zone Rollout Planner'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? 'إدارة مشاريع الفنادق والقصور متعددة الطوابق: تفكيك المشروع إلى مباني، طوابق، قاعات، وثريات مفردة' 
              : 'Multi-building, multi-floor hotel & palace deployments decomposed into precise chandelier units'}
          </p>
        </div>

        {/* Action Button & Progress Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddBuilding}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] transition-transform active:scale-95 shadow-md shadow-[#C5A45B]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة مشروع / مبنى فندقي' : 'Add Project / Building'}</span>
          </button>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
            <div className="flex flex-col text-end">
              <span className="text-[10px] text-slate-400 uppercase font-mono">{isAr ? 'نسبة الإنجاز:' : 'Progress:'}</span>
              <span className="text-sm font-bold font-mono text-[#DFBA6B]">{overallProgress}%</span>
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-[#C5A45B]/40 flex items-center justify-center font-mono text-xs font-bold text-[#DFBA6B] bg-[#C5A45B]/10">
              {overallProgress}%
            </div>
          </div>
        </div>
      </div>

      {/* Buildings Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {projectBuildings.map(b => (
          <div
            key={b.id}
            onClick={() => {
              setSelectedBuilding(b);
              setSelectedZoneId(b.zones[0]?.id || '');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 group ${
              selectedBuilding?.id === b.id
                ? 'bg-[#C5A45B] text-[#0D131D] shadow-lg shadow-[#C5A45B]/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isAr ? b.nameAr : b.nameEn}</span>
            <button
              onClick={(e) => handleDeleteBuilding(b.id, e)}
              className="ml-1 p-0.5 rounded hover:bg-black/20 text-slate-400 hover:text-red-600 opacity-60 group-hover:opacity-100"
              title={isAr ? 'حذف المشروع' : 'Delete Building'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main 2-Column Floor Planner View */}
      {selectedBuilding && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
          {/* Left Col: Floors & Zones Hierarchy */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-col gap-3 overflow-y-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              {isAr ? 'الطوابق والقاعات المسجلة' : 'FLOORS & ZONES HIERARCHY'}
            </span>

            <div className="flex flex-col gap-2">
              {selectedBuilding.zones?.map(zone => {
                const isSelected = selectedZone?.id === zone.id;
                const completedCount = zone.units.filter(u => u.status === 'certified').length;

                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-slate-950 border-[#C5A45B] shadow-md' 
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {isAr ? zone.nameAr : zone.nameEn}
                      </span>
                      <span className="text-[10px] font-mono text-[#DFBA6B] bg-slate-800 px-1.5 py-0.5 rounded">
                        Floor {zone.floorNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{zone.units.length} {isAr ? 'وحدات إضاءة' : 'Chandelier Units'}</span>
                      <span className="text-emerald-400">{completedCount} {isAr ? 'مكتمل' : 'Certified'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Cols: Zone Floor Map & Unit Cards */}
          {selectedZone && (
            <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-[#DFBA6B] uppercase font-bold">
                      {isAr ? `الطابق رقم ${selectedZone.floorNumber}` : `Floor ${selectedZone.floorNumber}`}
                    </span>
                    <h2 className="text-base font-bold text-white mt-0.5">
                      {isAr ? selectedZone.nameAr : selectedZone.nameEn}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenAddUnit}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة ثريا للقاعة' : 'Add Unit'}</span>
                    </button>
                    <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                      {selectedZone.units.length} Units
                    </span>
                  </div>
                </div>

                {/* Individual Chandelier Units In This Zone */}
                <div className="my-4 flex flex-col gap-3">
                  {selectedZone.units?.map(unit => {
                    const isCertified = unit.status === 'certified';
                    const isInProgress = unit.status === 'in_progress';

                    return (
                      <div 
                        key={unit.id}
                        className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCertified 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : isInProgress 
                              ? 'bg-[#C5A45B]/20 text-[#DFBA6B] border border-[#C5A45B]/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                {isAr ? unit.unitNameAr : unit.unitNameEn}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                ({unit.modelNumber})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                              <span>{isAr ? unit.assignedTechAr : unit.assignedTechEn}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                            isCertified 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : isInProgress 
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {unit.status.toUpperCase()}
                          </span>

                          <button
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="p-1 rounded bg-slate-800 hover:bg-red-600 hover:text-white text-slate-500 cursor-pointer opacity-80 group-hover:opacity-100"
                            title={isAr ? 'حذف الوحدة' : 'Delete Unit'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>{isAr ? 'فحص ومطابقة كود البناء المصري:' : 'Building Code Compliance:'}</span>
                <span className="text-emerald-400 font-mono font-bold">APPROVED & ANCHORED</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Project Modal */}
      {modalOpen && (
        <ProjectModal
          mode={modalMode}
          targetBuildingId={selectedBuilding?.id}
          targetZoneId={selectedZone?.id}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
