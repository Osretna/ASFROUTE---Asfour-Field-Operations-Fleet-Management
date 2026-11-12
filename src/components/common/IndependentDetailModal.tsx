import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Truck, 
  Users, 
  FileCheck, 
  Sparkles, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Phone, 
  Star, 
  Award, 
  Fuel, 
  Gauge, 
  Wrench,
  Printer
} from 'lucide-react';

export const IndependentDetailModal: React.FC = () => {
  const { language, detailModalState, closeDetailModal, setCertificateModalWo } = useApp();
  const isAr = language === 'ar';

  if (!detailModalState) return null;

  const { type, data } = detailModalState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D131F] border-2 border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5 relative overflow-hidden max-h-[90vh]">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#C5A45B]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#DFBA6B] shadow-md">
              {type === 'work_order' && <FileCheck className="w-5 h-5" />}
              {type === 'vehicle' && <Truck className="w-5 h-5" />}
              {type === 'technician' && <Users className="w-5 h-5" />}
              {type === 'team' && <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-[#DFBA6B] border border-slate-700">
                  {type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {data.id || data.orderNumber}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {isAr ? (data.customerNameAr || data.nameAr || data.model) : (data.customerNameEn || data.nameEn || data.model)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
              title={isAr ? 'طباعة' : 'Print'}
            >
              <Printer className="w-4 h-4 text-[#C5A45B]" />
            </button>
            <button
              onClick={closeDetailModal}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 text-xs pr-1 relative z-10">
          {/* ================= WORK ORDER DETAILS ================= */}
          {type === 'work_order' && (
            <div className="flex flex-col gap-4">
              {/* Status & Priority */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">{isAr ? 'حالة أمر العمل اللحظية:' : 'Lifecycle Status:'}</span>
                <span className="font-mono text-emerald-400 uppercase font-bold text-xs">
                  {data.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Customer & Location */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'العميل:' : 'Client:'}</span>
                  <span className="font-bold text-white text-xs">{isAr ? data.customerNameAr : data.customerNameEn}</span>
                  <span className="text-[11px] text-slate-400 block font-mono mt-0.5">{data.customerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'الموقع والمحافظة:' : 'Location:'}</span>
                  <span className="text-slate-200 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A45B]" />
                    {isAr ? data.locationNameAr : data.locationNameEn}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{data.governorate}</span>
                </div>
              </div>

              {/* Chandelier Engineering Specifications */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-[#DFBA6B]">
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? 'مواصفات الثريا الملكية' : 'Royal Chandelier Specs'}</span>
                  </span>
                  <span className="text-amber-400 font-mono">{data.chandelier?.weightKg} kg</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'الموديل:' : 'Model:'}</span>
                    <span className="font-mono font-semibold">{data.chandelier?.modelNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'نقاوة الكريستال:' : 'Purity:'}</span>
                    <span className="text-amber-300">{data.chandelier?.crystalCutType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'البلورات:' : 'Prisms:'}</span>
                    <span className="font-mono">{data.chandelier?.totalCrystalPrisms?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'الأبعاد:' : 'Dimensions:'}</span>
                    <span className="font-mono">{data.chandelier?.heightCm}cm × {data.chandelier?.diameterCm}cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'قوة المرساة المطلوبة:' : 'Anchor Load:'}</span>
                    <span className="font-mono text-emerald-400">{data.chandelier?.requiredCeilingLoadCapacityKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'ارتفاع السقالة:' : 'Scaffold Reach:'}</span>
                    <span className="font-mono text-slate-200">{data.scaffoldingHeightM} m</span>
                  </div>
                </div>
              </div>

              {/* Assignment details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'الشاحنة المخصصة:' : 'Assigned Truck:'}</span>
                  <span className="font-mono font-bold text-blue-400 text-xs">{data.assignedVehicleId || 'Unassigned'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'فريق التركيب:' : 'Assigned Crew:'}</span>
                  <span className="font-mono font-bold text-[#DFBA6B] text-xs">{data.assignedTeamId || 'Unassigned'}</span>
                </div>
              </div>

              {/* Certificate Quick Trigger */}
              {data.status === 'certified_closed' || data.status === 'completed_handover' ? (
                <button
                  onClick={() => {
                    closeDetailModal();
                    setCertificateModalWo(data);
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Award className="w-4 h-4" />
                  <span>{isAr ? 'عرض وتوثيق شهادة التركيب الرسمية' : 'View Official Digital Certificate'}</span>
                </button>
              ) : null}
            </div>
          )}

          {/* ================= VEHICLE DETAILS ================= */}
          {type === 'vehicle' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'الحمولة القصوى' : 'Max Payload'}</span>
                  <span className="text-base font-bold font-mono text-white">{data.maxWeightKg} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'السعة الحجمية' : 'Volume'}</span>
                  <span className="text-base font-bold font-mono text-[#DFBA6B]">{data.volumetricCapacityM3} m³</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'الارتفاع الداخلي' : 'Max Height'}</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{data.maxHeightM} m</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'رقم اللوحة:' : 'Plate Number:'}</span>
                  <span className="font-mono text-white font-bold">{data.plateNumber} ({data.plateNumberEn})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'طراز الشاحنة:' : 'Truck Model:'}</span>
                  <span className="text-slate-200">{data.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'عزل الاهتزاز الهوائي:' : 'Vibration Damping:'}</span>
                  <span className={data.hasPneumaticDamping ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {data.hasPneumaticDamping ? 'CERTIFIED PNEUMATIC AIRBAGS' : 'STANDARD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'ونش هيدروليكي خلفي:' : 'Hydraulic Crane Lift:'}</span>
                  <span className={data.hasCraneLift ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {data.hasCraneLift ? 'EQUIPPED (1500kg)' : 'NONE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAr ? 'السائق المعين:' : 'Assigned Driver:'}</span>
                  <span className="text-[#DFBA6B] font-semibold">{isAr ? data.driverNameAr : data.driverNameEn}</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TECHNICIAN DETAILS ================= */}
          {type === 'technician' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <img
                  src={data.avatar}
                  alt={data.nameEn}
                  className="w-14 h-14 rounded-xl object-cover border border-[#C5A45B]/50 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{isAr ? data.nameAr : data.nameEn}</h3>
                  <span className="text-xs text-[#DFBA6B] block">{isAr ? data.roleAr : data.roleEn}</span>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                    <span className="text-amber-400 font-bold">★ {data.rating}</span>
                    <span>·</span>
                    <span>{data.completedJobsCount} {isAr ? 'مهمة منجزة' : 'Jobs Done'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-slate-200">{isAr ? 'الشهادات والاعتمادات الميدانية:' : 'Active Certifications:'}</span>
                {data.certifications?.map((c: any) => (
                  <div key={c.skillId} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block">{isAr ? c.skillNameAr : c.skillNameEn}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Expires: {c.expiryDate}</span>
                    </div>
                    <span className="font-mono text-[#DFBA6B] font-bold">Level {c.level}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono">ASFROUTE Enterprise Data Inspector</span>
          <button
            onClick={closeDetailModal}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
