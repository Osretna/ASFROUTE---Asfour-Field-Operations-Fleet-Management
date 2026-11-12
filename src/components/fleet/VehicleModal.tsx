import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, VehicleType, BranchId } from '../../types';
import { Truck, X, Save, ShieldCheck } from 'lucide-react';
import { BRANCHES } from '../../data/mockData';

interface VehicleModalProps {
  vehicleToEdit?: Vehicle | null;
  onClose: () => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({ vehicleToEdit, onClose }) => {
  const { language, addVehicle, updateVehicle } = useApp();
  const isAr = language === 'ar';

  const isEditing = !!vehicleToEdit;

  const [formData, setFormData] = useState<Partial<Vehicle>>(() => {
    if (vehicleToEdit) return { ...vehicleToEdit };
    return {
      id: `TRK-${Math.floor(100 + Math.random() * 900)}`,
      plateNumber: 'أ ص ف ٨٨٢٠',
      plateNumberEn: 'ASF 8820',
      model: 'Mercedes-Benz Actros 1845 Air-Suspension',
      type: 'Heavy Crystal Transporter',
      branchId: 'tenth_ramadan',
      status: 'available',
      maxWeightKg: 8500,
      currentLoadKg: 0,
      volumetricCapacityM3: 38,
      currentLoadM3: 0,
      maxHeightM: 4.2,
      hasCraneLift: true,
      hasPneumaticDamping: true,
      driverNameAr: 'الكابتن حسام بدوي',
      driverNameEn: 'Capt. Hossam Badawi',
      currentLat: 30.1128,
      currentLng: 31.3439,
      speedKmH: 0,
      fuelLevelPercent: 95,
      batteryOrHealthPercent: 98,
    };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && vehicleToEdit) {
      updateVehicle(formData as Vehicle);
    } else {
      addVehicle(formData as Vehicle);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D131F] border-2 border-slate-700/80 rounded-3xl max-w-xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#DFBA6B]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? (isAr ? 'تعديل بيانات الشاحنة' : 'Edit Fleet Vehicle') : (isAr ? 'إضافة شاحنة نقل كريستال جديدة' : 'Add New Crystal Transport Truck')}
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {formData.id}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col gap-4 text-xs pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'معرف الشاحنة (Vehicle ID):' : 'Vehicle ID:'}</label>
              <input
                type="text"
                required
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'نوع الشاحنة:' : 'Vehicle Type:'}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-[#C5A45B]"
              >
                <option value="Heavy Crystal Transporter">Heavy Crystal Transporter (Air-Suspension)</option>
                <option value="Medium Installation Truck">Medium Installation Truck</option>
                <option value="Specialized Rigging Van">Specialized Rigging Van</option>
                <option value="Rapid Survey Unit">Rapid Survey Unit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'رقم اللوحة (عربي):' : 'Plate (Arabic):'}</label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-[#C5A45B]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'رقم اللوحة (إنجليزي):' : 'Plate (EN):'}</label>
              <input
                type="text"
                required
                value={formData.plateNumberEn}
                onChange={(e) => setFormData({ ...formData, plateNumberEn: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300">{isAr ? 'الموديل والتجهيزات:' : 'Truck Model & Chassis:'}</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-[#C5A45B]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'الحمولة القصوى (كجم):' : 'Max Payload (kg):'}</label>
              <input
                type="number"
                required
                value={formData.maxWeightKg}
                onChange={(e) => setFormData({ ...formData, maxWeightKg: parseInt(e.target.value) || 0 })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'الحجم المكعب (م³):' : 'Volume (m³):'}</label>
              <input
                type="number"
                required
                value={formData.volumetricCapacityM3}
                onChange={(e) => setFormData({ ...formData, volumetricCapacityM3: parseFloat(e.target.value) || 0 })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'الارتفاع الداخلي (م):' : 'Internal Height (m):'}</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.maxHeightM}
                onChange={(e) => setFormData({ ...formData, maxHeightM: parseFloat(e.target.value) || 0 })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-slate-200">{isAr ? 'تعليق هوائي ماص للاهتزاز' : 'Pneumatic Air Damping'}</span>
              <input
                type="checkbox"
                checked={formData.hasPneumaticDamping}
                onChange={(e) => setFormData({ ...formData, hasPneumaticDamping: e.target.checked })}
                className="rounded text-[#C5A45B]"
              />
            </label>
            <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer">
              <span className="text-slate-200">{isAr ? 'ونش رفع هيدروليكي خلفي' : 'Hydraulic Crane Lift'}</span>
              <input
                type="checkbox"
                checked={formData.hasCraneLift}
                onChange={(e) => setFormData({ ...formData, hasCraneLift: e.target.checked })}
                className="rounded text-[#C5A45B]"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'السائق المعين:' : 'Assigned Driver:'}</label>
              <input
                type="text"
                value={formData.driverNameAr}
                onChange={(e) => setFormData({ ...formData, driverNameAr: e.target.value, driverNameEn: e.target.value })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-[#C5A45B]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300">{isAr ? 'الفرع / المستودع:' : 'Branch:'}</label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value as BranchId })}
                className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 outline-none focus:border-[#C5A45B]"
              >
                {BRANCHES.map(b => (
                  <option key={b.id} value={b.id}>{isAr ? b.nameAr : b.nameEn}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              <span>{isEditing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة الشاحنة للأسطول' : 'Register Vehicle')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
