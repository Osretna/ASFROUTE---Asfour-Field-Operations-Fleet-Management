import React, { useState } from 'react';
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
  Printer,
  MessageSquare,
  Send,
  Navigation,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const IndependentDetailModal: React.FC = () => {
  const { 
    language, 
    detailModalState, 
    closeDetailModal, 
    setCertificateModalWo,
    whatsappAccounts,
    sendCustomerLocationRequestWhatsApp,
    receiveCustomerLocationFromWhatsApp,
    issueDeliveryDispatchOrder,
    setActiveTab
  } = useApp();

  const isAr = language === 'ar';
  const [selectedWaAccount, setSelectedWaAccount] = useState<string>(whatsappAccounts[0]?.id || '');
  const [customLat, setCustomLat] = useState('30.0125');
  const [customLng, setCustomLng] = useState('31.4820');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!detailModalState) return null;

  const { type, data } = detailModalState;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0D131F] border-2 border-slate-300 dark:border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col gap-5 relative overflow-hidden max-h-[92vh] transition-colors duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#C5A45B]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#8E6A23] dark:text-[#DFBA6B] shadow-md shrink-0">
              {type === 'work_order' && <FileCheck className="w-5 h-5" />}
              {type === 'vehicle' && <Truck className="w-5 h-5" />}
              {type === 'technician' && <Users className="w-5 h-5" />}
              {type === 'team' && <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[#8E6A23] dark:text-[#DFBA6B] border border-slate-200 dark:border-slate-700 font-bold">
                  {type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {data.id || data.orderNumber}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {isAr ? (data.customerNameAr || data.nameAr || data.model) : (data.customerNameEn || data.nameEn || data.model)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
              title={isAr ? 'طباعة' : 'Print'}
            >
              <Printer className="w-4 h-4 text-[#C5A45B]" />
            </button>
            <button
              onClick={closeDetailModal}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 text-xs pr-1 relative z-10">
          {/* ================= WORK ORDER DETAILS ================= */}
          {type === 'work_order' && (
            <div className="flex flex-col gap-4">
              {/* Status & Priority */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'حالة أمر العمل اللحظية:' : 'Lifecycle Status:'}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 uppercase font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {data.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Customer & Location */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'العميل:' : 'Client:'}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{isAr ? data.customerNameAr : data.customerNameEn}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono mt-0.5">{data.customerPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'الموقع والمحافظة:' : 'Location:'}</span>
                  <span className="text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A45B]" />
                    {isAr ? data.locationNameAr : data.locationNameEn}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{data.governorate}</span>
                </div>
              </div>

              {/* WhatsApp Customer Location Dispatch Card */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {isAr ? 'متابعة الموقع عبر واتساب وأمر تحرك السيارة' : 'WhatsApp Client GPS Coordination'}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    data.customerLocationConfirmed
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                  }`}>
                    {data.customerLocationConfirmed ? (isAr ? '📍 الموقع مؤكد' : '📍 GPS Verified') : (isAr ? '⏳ بانتظار إرسال اللوكيشن' : '⏳ Awaiting Location')}
                  </span>
                </div>

                {/* WhatsApp Dispatch Account Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {isAr ? 'جهة المتابعة مع العميل (خط الواتساب المحدد من لوحة الأدمن):' : 'Dispatch WhatsApp Desk (from Admin Hub):'}
                  </label>
                  <select
                    value={selectedWaAccount || whatsappAccounts[0]?.id}
                    onChange={(e) => setSelectedWaAccount(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                  >
                    {whatsappAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {isAr ? acc.nameAr : acc.nameEn} (+{acc.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Send WhatsApp Location Request Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const res = sendCustomerLocationRequestWhatsApp(data.id, selectedWaAccount);
                      if (res.url) window.open(res.url, '_blank');
                      showToast(isAr ? 'تم فتح محادثة الواتساب لطلب اللوكيشن من العميل' : 'Opened WhatsApp chat to request location');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إرسال رسالة واتساب للعميل لطلب موقعه' : 'Send WhatsApp Location Request'}</span>
                  </button>
                </div>

                {/* Simulate / Enter Received Customer Location */}
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isAr ? 'استلام وتثبيت إحداثيات العميل من الواتساب:' : 'Confirm Received Customer Coordinates:'}</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400">Lat:</span>
                      <input
                        type="text"
                        value={customLat}
                        onChange={(e) => setCustomLat(e.target.value)}
                        className="w-full bg-transparent font-mono text-xs text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400">Lng:</span>
                      <input
                        type="text"
                        value={customLng}
                        onChange={(e) => setCustomLng(e.target.value)}
                        className="w-full bg-transparent font-mono text-xs text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        const lat = parseFloat(customLat) || 30.0125;
                        const lng = parseFloat(customLng) || 31.4820;
                        receiveCustomerLocationFromWhatsApp(data.id, lat, lng, isAr ? 'تم استلام لوكيشن الواتساب المباشر من العميل' : 'Verified customer location from WhatsApp');
                        showToast(isAr ? 'تم حفظ إحداثيات العميل وتثبيتها بنجاح!' : 'Customer GPS coordinates saved successfully!');
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{isAr ? 'تأكيد استلام اللوكيشن' : 'Save Coordinates'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const randomLat = 29.9800 + Math.random() * 0.15;
                        const randomLng = 31.2000 + Math.random() * 0.40;
                        setCustomLat(randomLat.toFixed(4));
                        setCustomLng(randomLng.toFixed(4));
                        receiveCustomerLocationFromWhatsApp(data.id, randomLat, randomLng, isAr ? 'محاكاة استلام لوكيشن من العميل بالواتساب' : 'Simulated WhatsApp location pin received');
                        showToast(isAr ? 'تمت محاكاة إرسال العميل لموقعه بالواتساب!' : 'Simulated client location received via WhatsApp!');
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 text-[11px] font-bold cursor-pointer"
                    >
                      {isAr ? 'محاكاة رد العميل' : 'Simulate Reply'}
                    </button>
                  </div>
                </div>

                {/* Issue Direct Delivery Order to Vehicles Button */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      const res = issueDeliveryDispatchOrder(data.id);
                      showToast(res.message);
                      closeDetailModal();
                      setActiveTab('dispatch');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] flex items-center justify-center gap-2 shadow-lg shadow-[#C5A45B]/20 cursor-pointer transition-transform active:scale-95"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{isAr ? 'إعطاء أمر التوصيل للسيارة والانتقال للخريطة فوراً' : 'Issue Vehicle Dispatch Order & Navigate'}</span>
                  </button>
                </div>
              </div>

              {/* Chandelier Engineering Specifications */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-[#8E6A23] dark:text-[#DFBA6B]">
                    <Sparkles className="w-4 h-4" />
                    <span>{isAr ? 'مواصفات الثريا الملكية' : 'Royal Chandelier Specs'}</span>
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">{data.chandelier?.weightKg} kg</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'الموديل:' : 'Model:'}</span>
                    <span className="font-mono font-semibold">{data.chandelier?.modelNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'نقاوة الكريستال:' : 'Purity:'}</span>
                    <span className="text-amber-600 dark:text-amber-300">{data.chandelier?.crystalCutType}</span>
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
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{data.chandelier?.requiredCeilingLoadCapacityKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'ارتفاع السقالة:' : 'Scaffold Reach:'}</span>
                    <span className="font-mono text-slate-700 dark:text-slate-200">{data.scaffoldingHeightM} m</span>
                  </div>
                </div>
              </div>

              {/* Assignment details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'الشاحنة المخصصة:' : 'Assigned Truck:'}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{data.assignedVehicleId || 'Unassigned'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 block">{isAr ? 'فريق التركيب:' : 'Assigned Crew:'}</span>
                  <span className="font-mono font-bold text-[#8E6A23] dark:text-[#DFBA6B] text-xs">{data.assignedTeamId || 'Unassigned'}</span>
                </div>
              </div>

              {/* Certificate Quick Trigger */}
              {(data.status === 'certified_closed' || data.status === 'completed_handover') && (
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
              )}
            </div>
          )}

          {/* ================= VEHICLE DETAILS ================= */}
          {type === 'vehicle' && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{isAr ? 'الحمولة القصوى' : 'Max Payload'}</span>
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-white">{data.maxWeightKg} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{isAr ? 'السعة الحجمية' : 'Volume'}</span>
                  <span className="text-base font-bold font-mono text-[#8E6A23] dark:text-[#DFBA6B]">{data.volumetricCapacityM3} m³</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{isAr ? 'الارتفاع الداخلي' : 'Max Height'}</span>
                  <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{data.maxHeightM} m</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'رقم اللوحة:' : 'Plate Number:'}</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{data.plateNumber} ({data.plateNumberEn})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'طراز الشاحنة:' : 'Truck Model:'}</span>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{data.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'عزل الاهتزاز الهوائي:' : 'Vibration Damping:'}</span>
                  <span className={data.hasPneumaticDamping ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                    {data.hasPneumaticDamping ? 'CERTIFIED PNEUMATIC AIRBAGS' : 'STANDARD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'ونش هيدروليكي خلفي:' : 'Hydraulic Crane Lift:'}</span>
                  <span className={data.hasCraneLift ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                    {data.hasCraneLift ? 'EQUIPPED (1500kg)' : 'NONE'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{isAr ? 'السائق المعين:' : 'Assigned Driver:'}</span>
                  <span className="text-[#8E6A23] dark:text-[#DFBA6B] font-semibold">{isAr ? data.driverNameAr : data.driverNameEn}</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TECHNICIAN DETAILS ================= */}
          {type === 'technician' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <img
                  src={data.avatar}
                  alt={data.nameEn}
                  className="w-14 h-14 rounded-xl object-cover border border-[#C5A45B]/50 shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isAr ? data.nameAr : data.nameEn}</h3>
                  <span className="text-xs text-[#8E6A23] dark:text-[#DFBA6B] font-semibold block">{isAr ? data.roleAr : data.roleEn}</span>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span className="text-amber-500 font-bold">★ {data.rating}</span>
                    <span>·</span>
                    <span>{data.completedJobsCount} {isAr ? 'مهمة منجزة' : 'Jobs Done'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">{isAr ? 'الشهادات والاعتمادات الميدانية:' : 'Active Certifications:'}</span>
                {data.certifications?.map((c: any) => (
                  <div key={c.skillId} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{isAr ? c.skillNameAr : c.skillNameEn}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Expires: {c.expiryDate}</span>
                    </div>
                    <span className="font-mono text-[#8E6A23] dark:text-[#DFBA6B] font-bold">Level {c.level}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono">ASFROUTE Enterprise Data Inspector</span>
          <button
            onClick={closeDetailModal}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
