import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Navigation, 
  CheckCircle2, 
  Camera, 
  PenTool, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export const MobileAppSimulator: React.FC = () => {
  const { language, workOrders, updateWorkOrderStatus } = useApp();
  const isAr = language === 'ar';

  const [isOffline, setIsOffline] = useState(false);
  const [dutyStarted, setDutyStarted] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(2); // 0: Start, 1: Travel, 2: Site Check, 3: Sign, 4: Done
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [signatureSigned, setSignatureSigned] = useState(false);

  const activeJob = workOrders[0];

  const handleStepAdvance = () => {
    if (isOffline) {
      setOfflineQueueCount(prev => prev + 1);
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 max-w-7xl mx-auto w-full gap-5 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#C5A45B]" />
            <h1 className="text-xl font-bold text-white">
              {isAr ? 'محاكي تطبيق الفني والسائق الميداني (Flutter Mobile App)' : 'Field Technician & Driver Mobile App Simulator (Flutter)'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? 'تطبيق فلاتر مخصص للفنيين والسائقين يدعم العمل بدون إنترنت (Offline-First) وتوثيق التوقيع والصور الحية' 
              : 'Cross-platform Flutter app: Offline-first SQLite sync, GPS routing, safety checklists & signature'}
          </p>
        </div>

        {/* Offline Mode Switch */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            {isOffline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            <span className="font-semibold">{isOffline ? (isAr ? 'وضع عدم الاتصال (Offline)' : 'Offline Mode') : (isAr ? 'متصل بالسيرفر (Online)' : 'Online Sync')}</span>
          </div>
          <button
            onClick={() => {
              setIsOffline(!isOffline);
              if (isOffline && offlineQueueCount > 0) {
                setOfflineQueueCount(0);
              }
            }}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[#DFBA6B] font-bold cursor-pointer"
          >
            {isOffline ? (isAr ? 'إعادة الاتصال والمزامنة' : 'Reconnect & Sync') : (isAr ? 'محاكاة انقطاع النت' : 'Simulate Offline')}
          </button>
        </div>
      </div>

      {/* Simulator Device Center */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto py-2">
        {/* Smartphone Shell Frame */}
        <div className="w-[370px] h-[720px] bg-[#0A0D14] border-[8px] border-slate-800 rounded-[44px] shadow-2xl flex flex-col overflow-hidden relative shadow-[#C5A45B]/10">
          {/* Top Notch & Phone Bar */}
          <div className="h-6 bg-slate-900 flex items-center justify-between px-6 pt-1 text-[10px] font-mono text-slate-400">
            <span>09:41</span>
            <div className="w-20 h-4 bg-slate-950 rounded-b-xl flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
            <div className="flex items-center gap-1">
              {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
              <span>100%</span>
            </div>
          </div>

          {/* App Top Bar */}
          <div className="bg-[#121824] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C5A45B] text-[#0A0D14] flex items-center justify-center font-bold text-xs">
                MR
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{isAr ? 'م. مصطفى رضوان' : 'Eng. Mostafa'}</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {dutyStarted ? (isAr ? '● في الخدمة (On Duty)' : '● On Duty') : (isAr ? '○ خارج الدوام' : '○ Off Duty')}
                </span>
              </div>
            </div>

            {/* Offline sync queue badge */}
            {offlineQueueCount > 0 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full font-mono">
                {offlineQueueCount} queued
              </span>
            )}
          </div>

          {/* Main Mobile Scrollable Screen */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-slate-100">
            {/* Current Active Work Order Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#162030] to-[#0D1420] border border-[#C5A45B]/40 flex flex-col gap-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#DFBA6B] font-bold">{activeJob.orderNumber}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                  PRIORITY: ROYAL
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white">
                  {isAr ? activeJob.customerNameAr : activeJob.customerNameEn}
                </h3>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#C5A45B]" />
                  {isAr ? activeJob.locationNameAr : activeJob.locationNameEn}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 text-[10px] flex items-center justify-between font-mono text-slate-300">
                <span>{activeJob.chandelier.modelNumber}</span>
                <span className="text-amber-400 font-bold">{activeJob.chandelier.weightKg} kg</span>
              </div>
            </div>

            {/* Field Job Action Steps */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                {isAr ? 'مراحل التنفيذ الميداني:' : 'ACTIVE JOB STEPS:'}
              </span>

              {/* Step 1: GPS Navigation */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                currentStep >= 1 ? 'bg-slate-900/90 border-emerald-500/40' : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isAr ? 'الانطلاق والملاحة لموقع العميل' : 'Navigate to Client Site'}
                    </span>
                    <span className="text-[10px] text-slate-400">Google Maps Platform Traffic Aware</span>
                  </div>
                </div>
                {currentStep > 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              {/* Step 2: Safety & Structural Anchor Pull Test */}
              <div className={`p-3 rounded-xl border flex flex-col gap-2 ${
                currentStep >= 2 ? 'bg-slate-900/90 border-[#C5A45B]/60' : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {isAr ? 'فحص المرساة وتركيب السقالة' : 'Ceiling Anchor Test (>2500kg)'}
                      </span>
                      <span className="text-[10px] text-slate-400">Mandatory Asfour Protocol</span>
                    </div>
                  </div>
                  {currentStep > 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>

                {currentStep === 2 && (
                  <div className="mt-1 flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950 text-[10px] text-slate-300">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#C5A45B]" />
                      <span>{isAr ? 'اختبار شد المرساة بضغط 2.5 طن' : '2.5 Ton hydraulic anchor stress tested'}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#C5A45B]" />
                      <span>{isAr ? 'فحص توازن بلورات الكريستال 30% PbO' : 'Crystal prisms aligned and counted'}</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Step 3: Before / After High-Res Photos */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                currentStep >= 3 ? 'bg-slate-900/90 border-[#C5A45B]/60' : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isAr ? 'توثيق الصور قبل وبعد التثبيت' : 'High-Res Before/After Photos'}
                    </span>
                    <span className="text-[10px] text-slate-400">3 Photos Uploaded</span>
                  </div>
                </div>
                {currentStep > 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              {/* Step 4: Digital Client Signature Pad */}
              <div className={`p-3 rounded-xl border flex flex-col gap-2 ${
                currentStep >= 4 ? 'bg-slate-900/90 border-[#C5A45B]' : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <PenTool className="w-4 h-4 text-[#DFBA6B]" />
                    <span className="text-xs font-bold text-white">
                      {isAr ? 'توقيع العميل الإلكتروني' : 'Customer Digital Signature'}
                    </span>
                  </div>
                  {signatureSigned && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>

                {currentStep === 4 && (
                  <div 
                    onClick={() => setSignatureSigned(true)}
                    className="h-16 bg-slate-950 rounded border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500 cursor-pointer"
                  >
                    {signatureSigned ? (
                      <span className="font-serif italic text-base text-[#DFBA6B]">Hassan El-Ghazaly (Signed ✓)</span>
                    ) : (
                      <span>{isAr ? 'انقر هنا لمحاكاة توقيع العميل' : 'Tap to simulate customer signature'}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Action Button Bar */}
          <div className="p-3 bg-[#121824] border-t border-slate-800">
            <button
              onClick={handleStepAdvance}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0A0D14] flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-98"
            >
              <span>
                {currentStep === 4 
                  ? (isAr ? 'إتمام المهمة ومزامنة التقرير' : 'Finish Job & Sync Report') 
                  : (isAr ? 'تأكيد الخطوة والمتابعة' : 'Complete Step & Proceed')}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
