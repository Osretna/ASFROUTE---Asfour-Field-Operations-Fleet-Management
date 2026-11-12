import React from 'react';
import { WorkOrder } from '../../types';
import { Sparkles, ShieldCheck, QrCode, X, Printer, Award } from 'lucide-react';

interface DigitalCertificateModalProps {
  workOrder: WorkOrder;
  onClose: () => void;
  language: 'ar' | 'en';
}

export const DigitalCertificateModal: React.FC<DigitalCertificateModalProps> = ({ workOrder, onClose, language }) => {
  const isAr = language === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0F141F] border-2 border-[#C5A45B]/60 rounded-3xl max-w-2xl w-full p-8 shadow-2xl text-slate-100 flex flex-col gap-6 relative overflow-hidden">
        {/* Luxury Gold Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C5A45B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#C5A45B]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-[#C5A45B]/30 relative z-10">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#DFBA6B]" />
            <span className="text-xs font-mono tracking-widest text-[#DFBA6B] uppercase font-bold">
              {isAr ? 'شهادة ضمان واعتماد أصلية' : 'OFFICIAL ASFOUR CERTIFICATE'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#C5A45B]" />
              <span>{isAr ? 'طباعة' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Prestige Styling) */}
        <div className="border border-[#C5A45B]/40 rounded-2xl p-6 bg-gradient-to-b from-[#131B2A]/90 to-[#0A0E17]/90 flex flex-col gap-5 text-center relative z-10 shadow-inner">
          {/* Asfour Logo / Crest */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DFBA6B] to-[#997C38] flex items-center justify-center text-[#0D131D] shadow-lg shadow-[#C5A45B]/30 mb-2">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
              {isAr ? 'شركة كريستال عصفور الدولية' : 'ASFOUR CRYSTAL INTERNATIONAL'}
            </h1>
            <span className="text-xs font-semibold text-[#DFBA6B] tracking-wider uppercase font-mono mt-0.5">
              {isAr ? 'شهادة إتمام وتوثيق تركيب الثريات الملكية' : 'Royal Chandelier Installation & Authenticity Certificate'}
            </span>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C5A45B] to-transparent my-2" />
          </div>

          {/* Certificate Description */}
          <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
            {isAr 
              ? `تشهد شركة كريستال عصفور بأن التحفة الكريستالية الموضحة أدناه قد تم فحص مرساتها الإنشائية، ونقلها بشاحنات هوائية ممتصة للاهتزاز، وتركيبها بواسطة كبير مهندسي عصفور المعتمدين وفق أعلى معايير الجودة العالمية.`
              : `Asfour Crystal certifies that the crystal masterpiece detailed below has undergone certified structural load testing, shock-damped transit, and master artisan assembly adhering to the highest international safety standards.`}
          </p>

          {/* Certificate Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 text-start bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">{isAr ? 'رقم الشهادة المعتمد:' : 'Certificate Number:'}</span>
              <span className="font-mono font-bold text-[#DFBA6B]">{workOrder.certificateNumber || 'ASF-CERT-2026-00491'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{isAr ? 'العميل الموقر:' : 'Client Name:'}</span>
              <span className="font-bold text-white">{isAr ? workOrder.customerNameAr : workOrder.customerNameEn}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{isAr ? 'موديل الثريا:' : 'Chandelier Model:'}</span>
              <span className="font-semibold text-slate-200">{workOrder.chandelier.modelNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{isAr ? 'نقاوة الكريستال ورقم الصبة:' : 'Crystal Purity & Lead:'}</span>
              <span className="font-semibold text-amber-300 font-mono">30% PbO Full Lead Crystal</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{isAr ? 'الوزن وعدد البلورات:' : 'Weight & Prisms:'}</span>
              <span className="font-mono text-slate-200">{workOrder.chandelier.weightKg} kg · {workOrder.chandelier.totalCrystalPrisms.toLocaleString()} prisms</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">{isAr ? 'تاريخ التثبيت والاعتماد:' : 'Certified Date:'}</span>
              <span className="font-mono text-slate-200">{workOrder.scheduledDate}</span>
            </div>
          </div>

          {/* Signatures & QR Code */}
          <div className="flex items-center justify-between pt-4 border-t border-[#C5A45B]/30 px-4">
            <div className="flex flex-col text-start">
              <span className="text-[10px] text-slate-500 font-semibold">{isAr ? 'كبير مهندسي التركيب:' : 'Chief Lead Engineer:'}</span>
              <span className="text-xs font-serif italic text-slate-300 mt-1">Mostafa Radwan</span>
              <span className="text-[9px] text-emerald-400 font-mono">Digital Signature Verified</span>
            </div>

            {/* QR Code Stamp */}
            <div className="w-16 h-16 rounded-lg bg-white p-1 shadow-md flex items-center justify-center">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>

            <div className="flex flex-col text-end">
              <span className="text-[10px] text-slate-500 font-semibold">{isAr ? 'توقيع استلام العميل:' : 'Client Acceptance:'}</span>
              <span className="text-xs font-serif italic text-[#DFBA6B] mt-1">Authorized Protocol</span>
              <span className="text-[9px] text-emerald-400 font-mono">Lifetime Warranty Valid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
