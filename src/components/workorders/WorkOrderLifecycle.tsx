import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrder, WorkOrderStatus } from '../../types';
import { WorkOrderModal } from './WorkOrderModal';
import { 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Truck, 
  Users, 
  MapPin, 
  Award, 
  ShieldCheck, 
  ArrowRight,
  Printer,
  QrCode,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye
} from 'lucide-react';

const STAGES: { key: WorkOrderStatus; labelAr: string; labelEn: string }[] = [
  { key: 'new', labelAr: 'طلب جديد', labelEn: 'New Order' },
  { key: 'survey_approved', labelAr: 'معاينة واعتماد السقف', labelEn: 'Ceiling Survey' },
  { key: 'ready_for_dispatch', labelAr: 'جاهز للشحن', labelEn: 'Ready' },
  { key: 'scheduled', labelAr: 'تمت الجدولة', labelEn: 'Scheduled' },
  { key: 'en_route', labelAr: 'بالطريق للموقع', labelEn: 'En Route' },
  { key: 'arrived_rigging', labelAr: 'تجهيز السقالات والمرساة', labelEn: 'Rigging' },
  { key: 'crystal_assembly', labelAr: 'رص ووزن الكريستال', labelEn: 'Assembly' },
  { key: 'illumination_testing', labelAr: 'اختبار الإضاءة وDMX', labelEn: 'Testing' },
  { key: 'completed_handover', labelAr: 'تسليم للعميل', labelEn: 'Handover' },
  { key: 'certified_closed', labelAr: 'شهادة معتمدة ومغلق', labelEn: 'Certified' },
];

export const WorkOrderLifecycle: React.FC = () => {
  const { language, workOrders, updateWorkOrderStatus, setCertificateModalWo, deleteWorkOrder, openDetailModal } = useApp();
  const isAr = language === 'ar';

  const [selectedWo, setSelectedWo] = useState<WorkOrder>(workOrders[0] || {} as WorkOrder);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<WorkOrder | null>(null);

  const currentStageIndex = STAGES.findIndex(s => s.key === selectedWo?.status);

  const handleNextStage = () => {
    if (currentStageIndex < STAGES.length - 1 && selectedWo) {
      const nextStage = STAGES[currentStageIndex + 1].key;
      updateWorkOrderStatus(selectedWo.id, nextStage);
      setSelectedWo(prev => ({ ...prev, status: nextStage }));
    }
  };

  const handleOpenAdd = () => {
    setOrderToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (wo: WorkOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderToEdit(wo);
    setModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isAr ? 'هل أنت متأكد من حذف وإلغاء أمر العمل هذا؟' : 'Are you sure you want to delete this work order?')) {
      deleteWorkOrder(id);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 max-w-7xl mx-auto w-full gap-5 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#C5A45B]" />
            <h1 className="text-xl font-bold text-white">
              {isAr ? 'أوامر العمل ودورة حياة تركيب الثريات' : 'Work Orders & Installation Lifecycle'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? 'تتبع تفصيلي لمراحل المعاينة الإنشائية، الشحن الآمن، الرص اليدوي للبلورات، وإصدار شهادة الضمان الرسمية' 
              : 'End-to-end tracking: Anchor tests, shock-damped transit, crystal balancing & digital warranty'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] transition-transform active:scale-95 shadow-md shadow-[#C5A45B]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء أمر عمل جديد' : 'Create Work Order'}</span>
          </button>

          {selectedWo && (
            <button
              onClick={() => setCertificateModalWo(selectedWo)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#C5A45B]" />
              <span>{isAr ? 'شهادة الضمان' : 'Digital Cert'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left Column: Work Orders List */}
        <div className="overflow-y-auto flex flex-col gap-3 pe-1">
          {workOrders.map((wo) => {
            const isSelected = selectedWo?.id === wo.id;
            return (
              <div
                key={wo.id}
                onClick={() => setSelectedWo(wo)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 group relative ${
                  isSelected 
                    ? 'bg-slate-900 border-[#C5A45B] shadow-lg shadow-[#C5A45B]/10' 
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#DFBA6B]">{wo.orderNumber}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {wo.status.replace(/_/g, ' ')}
                    </span>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleOpenEdit(wo, e)}
                        className="p-1 rounded bg-slate-800 hover:bg-[#C5A45B] hover:text-[#0D131D] text-slate-300 cursor-pointer"
                        title={isAr ? 'تعديل أمر العمل' : 'Edit Order'}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(wo.id, e)}
                        className="p-1 rounded bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 cursor-pointer"
                        title={isAr ? 'حذف أمر العمل' : 'Delete Order'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? wo.customerNameAr : wo.customerNameEn}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {isAr ? wo.chandelier.modelNameAr : wo.chandelier.modelNameEn}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                  <span>{wo.chandelier.weightKg} kg · {wo.chandelier.totalCrystalPrisms.toLocaleString()} prisms</span>
                  <span className="text-slate-300">{wo.timeWindowStart} - {wo.timeWindowEnd}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Lifecycle Stepper & Deep Inspection */}
        {selectedWo && (
          <div className="lg:col-span-2 bg-slate-900/90 rounded-xl border border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Header Details */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#DFBA6B] font-bold">{selectedWo.orderNumber}</span>
                    <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                      {selectedWo.customerType}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {isAr ? selectedWo.customerNameAr : selectedWo.customerNameEn}
                  </h2>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A45B]" />
                    {isAr ? selectedWo.locationNameAr : selectedWo.locationNameEn}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDetailModal('work_order', selectedWo)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-[#C5A45B] hover:text-[#0D131D] text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
                    title={isAr ? 'عرض الشاشة المستقلة بكامل التفاصيل' : 'Open in Dedicated Screen'}
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isAr ? 'شاشة مستقلة' : 'Separate Screen'}</span>
                  </button>

                  {currentStageIndex < STAGES.length - 1 && (
                    <button
                      onClick={handleNextStage}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      <span>{isAr ? 'المرحلة التالية' : 'Next Stage'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 10-Stage Lifecycle Horizontal Stepper */}
              <div className="my-6">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  {isAr ? 'مسار دورة حياة التركيب الميداني (10 مراحل):' : 'Installation Lifecycle Stages (10 Stages):'}
                </div>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
                  {STAGES.map((stage, idx) => {
                    const isDone = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div 
                        key={stage.key}
                        className={`p-2 rounded-lg border text-center flex flex-col items-center justify-between gap-1 transition-all ${
                          isDone 
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                            : isCurrent
                            ? 'bg-[#C5A45B]/20 border-[#C5A45B] text-[#DFBA6B] shadow-md shadow-[#C5A45B]/20 scale-105 z-10'
                            : 'bg-slate-950/40 border-slate-800 text-slate-600'
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                        <span className="text-[9px] font-semibold leading-tight line-clamp-2">
                          {isAr ? stage.labelAr : stage.labelEn}
                        </span>
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chandelier Physical Specifications & Anchor Load Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                {/* Box 1: Chandelier Specs */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Sparkles className="w-4 h-4 text-[#C5A45B]" />
                    <span>{isAr ? 'مواصفات الثريا الكريستالية' : 'Crystal Chandelier Specifications'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'الموديل:' : 'Model:'}</span>
                    <span className="font-semibold text-slate-200">{selectedWo.chandelier.modelNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'نوع الكريستال:' : 'Crystal Type:'}</span>
                    <span className="text-amber-300 font-semibold">{selectedWo.chandelier.crystalCutType}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'الوزن والبلورات:' : 'Weight & Prisms:'}</span>
                    <span className="font-mono text-slate-200">{selectedWo.chandelier.weightKg} kg · {selectedWo.chandelier.totalCrystalPrisms} prisms</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'الأبعاد (ارتفاع × قطر):' : 'Dimensions (H × Dia):'}</span>
                    <span className="font-mono text-slate-200">{selectedWo.chandelier.heightCm}cm × {selectedWo.chandelier.diameterCm}cm</span>
                  </div>
                </div>

                {/* Box 2: Structural Anchorage & Rigging Requirements */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'اشتراطات الأمان والمرساة الإنشائية' : 'Structural Anchor & Safety Requirements'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'قوة تحمل المرساة المطلوبة:' : 'Req. Anchor Capacity:'}</span>
                    <span className="font-mono text-emerald-400 font-bold">{selectedWo.chandelier.requiredCeilingLoadCapacityKg} kg</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'ارتفاع السقالة المطلوبة:' : 'Scaffolding Reach:'}</span>
                    <span className="font-mono text-slate-200">{selectedWo.scaffoldingHeightM} meters</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'اختبار الشد الميكانيكي:' : 'Anchor Pull Test:'}</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {selectedWo.anchorTestPassed ? 'PASSED & CERTIFIED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? 'مستوى كفاءة الفنيين المطلوب:' : 'Min Required Skill:'}</span>
                    <span className="font-mono text-[#DFBA6B] font-bold">Level {selectedWo.requiredSkillLevel}/5 Master</span>
                  </div>
                </div>
              </div>

              {/* Special Instructions & Notes */}
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-[#DFBA6B] block mb-1">{isAr ? 'تعليمات التركيب الخاصة:' : 'Special Field Instructions:'}</span>
                <p className="leading-relaxed text-slate-400">
                  {isAr ? selectedWo.notesAr : selectedWo.notesEn}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{isAr ? 'الشاحنة المخصصة:' : 'Assigned Truck:'} <strong className="text-slate-200 font-mono">{selectedWo.assignedVehicleId || 'Pending'}</strong></span>
              <span>{isAr ? 'الفريق المخصص:' : 'Assigned Crew:'} <strong className="text-slate-200 font-mono">{selectedWo.assignedTeamId || 'Pending'}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Work Order Add/Edit Modal */}
      {modalOpen && (
        <WorkOrderModal
          orderToEdit={orderToEdit}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
