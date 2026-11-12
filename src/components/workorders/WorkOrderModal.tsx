import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrder, WorkOrderType, WorkOrderStatus, SkillLevel } from '../../types';
import { FileCheck, X, Save, Sparkles, ShieldCheck } from 'lucide-react';

interface WorkOrderModalProps {
  orderToEdit?: WorkOrder | null;
  onClose: () => void;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({ orderToEdit, onClose }) => {
  const { language, addWorkOrder, updateWorkOrder, vehicles, teams } = useApp();
  const isAr = language === 'ar';

  const isEditing = !!orderToEdit;

  const [formData, setFormData] = useState<Partial<WorkOrder>>(() => {
    if (orderToEdit) return { ...orderToEdit };
    return {
      id: `WO-2026-${Math.floor(880 + Math.random() * 100)}`,
      orderNumber: `ASF-EG-${Math.floor(88000 + Math.random() * 1000)}`,
      type: 'grand_chandelier',
      status: 'scheduled',
      customerNameAr: 'قصر الأمير عبد العزيز - التجمع الخامس',
      customerNameEn: 'Prince Abdulaziz Palace - 5th Settlement',
      customerPhone: '+20 100 892 4110',
      customerType: 'VIP Residential',
      locationNameAr: 'شارع التسعين الجنوبي، فيلا 14',
      locationNameEn: 'South 90th St, Villa 14',
      governorate: 'Cairo / New Cairo',
      coordinates: [30.0125, 31.4820],
      scheduledDate: '2026-11-13',
      timeWindowStart: '09:00',
      timeWindowEnd: '15:00',
      estimatedDurationHours: 6.0,
      requiredSkillLevel: 5,
      requiredTechniciansCount: 3,
      requiresPneumaticTruck: true,
      requiresCraneLift: true,
      assignedVehicleId: vehicles[0]?.id || 'TRK-101',
      assignedTeamId: teams[0]?.id || 'TEAM-GOLD-01',
      anchorTestPassed: true,
      scaffoldingHeightM: 8.5,
      notesAr: 'تركيب ثريا لوتس مذهبة مع تدقيق توازن البلورات',
      notesEn: 'Lotus gilded chandelier assembly with precision crystal balancing',
      certificateNumber: `ASF-CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      chandelier: {
        modelNumber: 'ASF-VERSAILLES-GOLD-75',
        modelNameAr: 'ثريا فرساي الملكية المطلية بماء الذهب',
        modelNameEn: 'Versailles 24K Gold Crystal Masterpiece',
        crystalCutType: 'Asfour 30% PbO Full Lead',
        weightKg: 520,
        diameterCm: 280,
        heightCm: 340,
        layersCount: 5,
        totalCrystalPrisms: 5400,
        requiredCeilingLoadCapacityKg: 1600,
        minimumCeilingHeightM: 6.5,
        installationFragilityTier: 'Ultra-Delicate Masterpiece'
      }
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && orderToEdit) {
      updateWorkOrder(formData as WorkOrder);
    } else {
      addWorkOrder(formData as WorkOrder);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D131F] border-2 border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#DFBA6B]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? (isAr ? 'تعديل أمر العمل' : 'Edit Work Order') : (isAr ? 'إنشاء أمر عمل وتركيب جديد' : 'Create New Chandelier Work Order')}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {formData.orderNumber}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 text-xs pr-1">
          {/* Customer info */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
              {isAr ? 'بيانات العميل والموقع:' : 'CUSTOMER & SITE INFORMATION:'}
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'اسم العميل (عربي):' : 'Customer Name (AR):'}</label>
                <input
                  type="text"
                  required
                  value={formData.customerNameAr}
                  onChange={(e) => setFormData({ ...formData, customerNameAr: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'اسم العميل (إنجليزي):' : 'Customer Name (EN):'}</label>
                <input
                  type="text"
                  required
                  value={formData.customerNameEn}
                  onChange={(e) => setFormData({ ...formData, customerNameEn: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'الهاتف:' : 'Phone:'}</label>
                <input
                  type="text"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'تصنيف العميل:' : 'Customer Type:'}</label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                >
                  <option value="VIP Residential">VIP Residential</option>
                  <option value="Luxury Hotel">Luxury Hotel</option>
                  <option value="Royal/State Palace">Royal/State Palace</option>
                  <option value="Mosque/Cathedral">Mosque/Cathedral</option>
                  <option value="Commercial Flagship">Commercial Flagship</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'المحافظة:' : 'Governorate:'}</label>
                <input
                  type="text"
                  required
                  value={formData.governorate}
                  onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-400">{isAr ? 'عنوان الموقع بالتفصيل:' : 'Site Location Address:'}</label>
              <input
                type="text"
                required
                value={formData.locationNameAr}
                onChange={(e) => setFormData({ ...formData, locationNameAr: e.target.value, locationNameEn: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
              />
            </div>
          </div>

          {/* Chandelier Physical Specifications */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3">
            <span className="font-bold text-[#DFBA6B] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'مواصفات الثريا الكريستالية والأوزان:' : 'CHANDELIER SPECIFICATIONS & LOAD:'}</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'اسم وموديل الثريا:' : 'Chandelier Model Name:'}</label>
                <input
                  type="text"
                  required
                  value={formData.chandelier?.modelNameAr}
                  onChange={(e) => setFormData({
                    ...formData,
                    chandelier: { ...formData.chandelier!, modelNameAr: e.target.value, modelNameEn: e.target.value }
                  })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'كود الموديل:' : 'Model Code:'}</label>
                <input
                  type="text"
                  required
                  value={formData.chandelier?.modelNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    chandelier: { ...formData.chandelier!, modelNumber: e.target.value }
                  })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'الوزن (كجم):' : 'Weight (kg):'}</label>
                <input
                  type="number"
                  required
                  value={formData.chandelier?.weightKg}
                  onChange={(e) => setFormData({
                    ...formData,
                    chandelier: { ...formData.chandelier!, weightKg: parseInt(e.target.value) || 0 }
                  })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'عدد البلورات:' : 'Prisms Count:'}</label>
                <input
                  type="number"
                  required
                  value={formData.chandelier?.totalCrystalPrisms}
                  onChange={(e) => setFormData({
                    ...formData,
                    chandelier: { ...formData.chandelier!, totalCrystalPrisms: parseInt(e.target.value) || 0 }
                  })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'قوة المرساة (كجم):' : 'Anchor Load (kg):'}</label>
                <input
                  type="number"
                  required
                  value={formData.chandelier?.requiredCeilingLoadCapacityKg}
                  onChange={(e) => setFormData({
                    ...formData,
                    chandelier: { ...formData.chandelier!, requiredCeilingLoadCapacityKg: parseInt(e.target.value) || 0 }
                  })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">{isAr ? 'ارتفاع السقالة (م):' : 'Scaffold (m):'}</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.scaffoldingHeightM}
                  onChange={(e) => setFormData({ ...formData, scaffoldingHeightM: parseFloat(e.target.value) || 0 })}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                />
              </div>
            </div>
          </div>

          {/* Logistics & Scheduling */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">{isAr ? 'تاريخ التنفيذ:' : 'Date:'}</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">{isAr ? 'ساعات البداية والنهاية:' : 'Time Window:'}</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={formData.timeWindowStart}
                  onChange={(e) => setFormData({ ...formData, timeWindowStart: e.target.value })}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono text-center"
                />
                <input
                  type="text"
                  value={formData.timeWindowEnd}
                  onChange={(e) => setFormData({ ...formData, timeWindowEnd: e.target.value })}
                  className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono text-center"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">{isAr ? 'شاحنة النقل:' : 'Truck:'}</label>
              <select
                value={formData.assignedVehicleId}
                onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.id} · {v.plateNumber}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-400">{isAr ? 'فريق التركيب:' : 'Team:'}</label>
              <select
                value={formData.assignedTeamId}
                onChange={(e) => setFormData({ ...formData, assignedTeamId: e.target.value })}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-[#C5A45B]"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{isAr ? t.nameAr : t.nameEn}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] flex items-center gap-1.5 shadow-lg shadow-[#C5A45B]/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'تسجيل أمر العمل والجدولة' : 'Create & Schedule Order')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
