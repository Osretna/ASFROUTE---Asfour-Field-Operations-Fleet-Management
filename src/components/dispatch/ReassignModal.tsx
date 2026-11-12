import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrder } from '../../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Truck, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ReassignModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({ workOrder, onClose }) => {
  const { language, vehicles, teams, reassignWorkOrder } = useApp();
  const isAr = language === 'ar';

  const [selectedVehicleId, setSelectedVehicleId] = useState(workOrder.assignedVehicleId || vehicles[0].id);
  const [selectedTeamId, setSelectedTeamId] = useState(workOrder.assignedTeamId || teams[0].id);
  const [overrideReason, setOverrideReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const targetVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const targetTeam = teams.find(t => t.id === selectedTeamId);

  // Check physical & skill constraints
  const weightViolation = targetVehicle ? targetVehicle.maxWeightKg < workOrder.chandelier.weightKg : false;
  const dampingViolation = targetVehicle && workOrder.requiresPneumaticTruck && !targetVehicle.hasPneumaticDamping;
  const heightViolation = targetTeam ? targetTeam.maxHeightAuthorizedM < workOrder.scaffoldingHeightM : false;

  const hasConstraintViolation = weightViolation || dampingViolation || heightViolation;

  const handleConfirm = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (hasConstraintViolation && (!overrideReason || overrideReason.trim().length < 8)) {
      setErrorMessage(
        isAr 
          ? 'تنبيه أمان: يوجد خرق لقيود الحمولة أو الارتفاع! يجب إدخال سبب تدقيق مفصل للمتابعة.' 
          : 'Security Warning: Physical or skill constraint violated! A detailed audit justification is required.'
      );
      return;
    }

    const res = reassignWorkOrder(
      workOrder.id,
      selectedVehicleId,
      selectedTeamId,
      overrideReason || (isAr ? 'إعادة جدولة روتينية' : 'Routine Dispatch Rebalance')
    );

    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessMessage(res.message);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0E1522] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#DFBA6B]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isAr ? 'إعادة التعيين والجدولة الذكية' : 'Smart Dispatch Reassignment'}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {workOrder.orderNumber} · {isAr ? workOrder.customerNameAr : workOrder.customerNameEn}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chandelier Profile Summary */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-200">
            <span>{isAr ? workOrder.chandelier.modelNameAr : workOrder.chandelier.modelNameEn}</span>
            <span className="text-amber-400 font-mono">{workOrder.chandelier.weightKg} kg</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
            <div>
              <span>{isAr ? 'البلورات:' : 'Prisms:'} </span>
              <span className="text-slate-200 font-mono">{workOrder.chandelier.totalCrystalPrisms.toLocaleString()}</span>
            </div>
            <div>
              <span>{isAr ? 'ارتفاع السقف:' : 'Scaffold:'} </span>
              <span className="text-slate-200 font-mono">{workOrder.scaffoldingHeightM} m</span>
            </div>
            <div>
              <span>{isAr ? 'تصنيف الهشاشة:' : 'Fragility:'} </span>
              <span className="text-amber-300">{workOrder.chandelier.installationFragilityTier}</span>
            </div>
          </div>
        </div>

        {/* Select Vehicle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-blue-400" />
            <span>{isAr ? 'اختر شاحنة النقل والتسليم:' : 'Select Transport Vehicle:'}</span>
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.id} · {v.plateNumber} · {v.model} (Max: {v.maxWeightKg}kg {v.hasPneumaticDamping ? '· Air-Damped' : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Select Team */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#C5A45B]" />
            <span>{isAr ? 'اختر فريق التركيب الميداني:' : 'Select Installation Team:'}</span>
          </label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
          >
            {teams.map(t => (
              <option key={t.id} value={t.id}>
                {isAr ? t.nameAr : t.nameEn} (Max Height: {t.maxHeightAuthorizedM}m · Rating: {t.compositeSkillRating})
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Constraint Verification Banner */}
        {hasConstraintViolation ? (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{isAr ? 'خرق قواعد أمان عصفور كريستال!' : 'Asfour Safety Violation Detected!'}</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-red-300">
              {weightViolation && (
                <li>
                  {isAr 
                    ? `وزن النجفة (${workOrder.chandelier.weightKg} كجم) يتجاوز حمولة الشاحنة (${targetVehicle?.maxWeightKg} كجم)!` 
                    : `Weight exceeds truck max capacity!`}
                </li>
              )}
              {dampingViolation && (
                <li>
                  {isAr 
                    ? 'الشاحنة المحددة لا تحتوي على وسائد هوائية لامتصاص الصدمات للكريستال الحساس!' 
                    : 'Truck lacks pneumatic shock damping for delicate crystal!'}
                </li>
              )}
              {heightViolation && (
                <li>
                  {isAr 
                    ? `ارتفاع السقالة المطلوبة (${workOrder.scaffoldingHeightM}م) أكبر من ترخيص الفريق (${targetTeam?.maxHeightAuthorizedM}م)!` 
                    : `Scaffold height exceeds team certified limit!`}
                </li>
              )}
            </ul>

            {/* Mandatory Override Reason */}
            <div className="mt-2 pt-2 border-t border-red-800/60">
              <label className="text-[11px] font-semibold text-red-300 block mb-1">
                {isAr ? 'سبب التجاوز الاستثنائي (إلزامي للتدقيق والمساءلة):' : 'Mandatory Supervisor Override Justification:'}
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder={isAr ? 'مثال: تم إرفاق ونش خارجي معتمد بموافقة مدير العمليات...' : 'e.g., Authorized with mobile external crane...'}
                rows={2}
                className="w-full bg-slate-950/80 border border-red-700/60 rounded p-2 text-xs text-white outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isAr 
                ? 'كافة متطلبات الوزن، الأبعاد، وعزل الاهتزاز وترخيص السقالات مطابقة بنسبة 100%!' 
                : 'All payload weight, fragility vibration damping, and rigging height rules verified!'}
            </span>
          </div>
        )}

        {errorMessage && (
          <div className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-lg border border-red-800">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="text-xs text-emerald-400 bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800">
            {successMessage}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              hasConstraintViolation
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D]'
            }`}
          >
            <span>{hasConstraintViolation ? (isAr ? 'تأكيد التجاوز وتسجيل الأثر' : 'Override & Log') : (isAr ? 'اعتماد التعيين' : 'Confirm Assignment')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
