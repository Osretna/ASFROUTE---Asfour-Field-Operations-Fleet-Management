import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrder } from '../../types';
import { EGYPT_GOVERNORATES, autoDetectEgyptCoordinates } from '../../utils/egyptGeocoding';
import { 
  FileCheck, 
  X, 
  Save, 
  MapPin, 
  Sparkles, 
  Truck, 
  Calendar, 
  CheckCircle2, 
  Loader2,
  Navigation
} from 'lucide-react';

interface WorkOrderModalProps {
  orderToEdit?: WorkOrder | null;
  onClose: () => void;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({ orderToEdit, onClose }) => {
  const { language, addWorkOrder, updateWorkOrder, vehicles, teams } = useApp();
  const isAr = language === 'ar';
  const isEditing = !!orderToEdit;

  const [customerName, setCustomerName] = useState(
    orderToEdit?.customerNameAr || orderToEdit?.customerNameEn || ''
  );
  const [customerPhone, setCustomerPhone] = useState(orderToEdit?.customerPhone || '010');
  const [selectedGov, setSelectedGov] = useState<string>(() => {
    if (orderToEdit?.governorate) {
      const match = EGYPT_GOVERNORATES.find(g => orderToEdit.governorate.includes(g.nameAr) || orderToEdit.governorate.includes(g.nameEn));
      if (match) return match.nameAr;
    }
    return 'القاهرة';
  });
  const [address, setAddress] = useState(
    orderToEdit?.locationNameAr || orderToEdit?.locationNameEn || ''
  );
  const [coordinates, setCoordinates] = useState<[number, number]>(
    orderToEdit?.coordinates || [30.0125, 31.4820]
  );
  const [chandelierModel, setChandelierModel] = useState(
    orderToEdit?.chandelier.modelNameAr || 'ثريا فرساي الملكية المطلية بماء الذهب'
  );
  const [scheduledDate, setScheduledDate] = useState(
    orderToEdit?.scheduledDate || new Date().toISOString().split('T')[0]
  );
  const [timeWindow, setTimeWindow] = useState(
    orderToEdit?.timeWindowStart ? `${orderToEdit.timeWindowStart} - ${orderToEdit.timeWindowEnd}` : '09:00 - 14:00'
  );
  const [assignedVehicleId, setAssignedVehicleId] = useState(
    orderToEdit?.assignedVehicleId || vehicles[0]?.id || 'TRK-101'
  );

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [autoDetectedNotice, setAutoDetectedNotice] = useState(false);

  // Auto-detect coordinates whenever the governorate or address changes
  useEffect(() => {
    if (!address.trim() && !selectedGov) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const detected = await autoDetectEgyptCoordinates(address || selectedGov, selectedGov);
        if (isMounted) {
          setCoordinates(detected);
          setAutoDetectedNotice(true);
          setTimeout(() => {
            if (isMounted) setAutoDetectedNotice(false);
          }, 2500);
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setIsGeocoding(false);
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [address, selectedGov]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const [startH, endH] = timeWindow.split('-').map(s => s.trim());

    const finalOrder: WorkOrder = {
      ...(orderToEdit || {}),
      id: orderToEdit?.id || `WO-2026-${Math.floor(880 + Math.random() * 100)}`,
      orderNumber: orderToEdit?.orderNumber || `ASF-EG-${Math.floor(88000 + Math.random() * 1000)}`,
      type: orderToEdit?.type || 'grand_chandelier',
      status: orderToEdit?.status || 'scheduled',
      customerNameAr: customerName.trim(),
      customerNameEn: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerType: orderToEdit?.customerType || 'VIP Residential',
      locationNameAr: address.trim() || selectedGov,
      locationNameEn: address.trim() || selectedGov,
      governorate: selectedGov,
      coordinates: coordinates,
      scheduledDate: scheduledDate,
      timeWindowStart: startH || '09:00',
      timeWindowEnd: endH || '14:00',
      estimatedDurationHours: 4.5,
      requiredSkillLevel: 5,
      requiredTechniciansCount: 3,
      requiresPneumaticTruck: true,
      requiresCraneLift: true,
      assignedVehicleId: assignedVehicleId,
      assignedTeamId: orderToEdit?.assignedTeamId || teams[0]?.id || 'TEAM-GOLD-01',
      anchorTestPassed: true,
      scaffoldingHeightM: 8.5,
      notesAr: `تركيب بمحافظة ${selectedGov}`,
      notesEn: `Installation at ${selectedGov}`,
      customerLocationConfirmed: true,
      receivedLocationNote: isAr ? 'تم تحديد الموقع آلياً من العنوان' : 'Auto-geocoded from address',
      chandelier: orderToEdit?.chandelier || {
        modelNumber: 'ASF-LUXURY-75',
        modelNameAr: chandelierModel.trim(),
        modelNameEn: chandelierModel.trim(),
        crystalCutType: 'Asfour 30% PbO Full Lead',
        weightKg: 480,
        diameterCm: 260,
        heightCm: 320,
        layersCount: 5,
        totalCrystalPrisms: 4800,
        requiredCeilingLoadCapacityKg: 1500,
        minimumCeilingHeightM: 6.0,
        installationFragilityTier: 'Ultra-Delicate Masterpiece'
      }
    };

    if (isEditing) {
      updateWorkOrder(finalOrder);
    } else {
      addWorkOrder(finalOrder);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0F1420] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col gap-5 transition-colors">
        
        {/* Simple & Clean Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C5A45B]/15 border border-[#C5A45B]/30 flex items-center justify-center text-[#8E6A23] dark:text-[#DFBA6B]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? (isAr ? 'تعديل بيانات العميل والموقع' : 'Edit Order & Location') : (isAr ? 'إضافة عميل وموقع تركيب جديد' : 'New Client & Installation')}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'إدخال بسيط وسريع مع تحديد الموقع آلياً على الخريطة' : 'Simple data entry with automatic GPS map pin detection'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isAr ? 'اسم العميل:' : 'Customer Name:'}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={isAr ? 'مثال: فيلا المستشار أحمد فؤاد' : 'e.g. Prince Villa'}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isAr ? 'رقم الهاتف / الواتساب:' : 'Phone / WhatsApp:'}
              </label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01008924110"
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B] transition-colors"
              />
            </div>
          </div>

          {/* Governorate Dropdown & Address Auto-Geocoding */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C5A45B]" />
                <span>{isAr ? 'الموقع والعنوان (تحديد الخريطة تلقائياً)' : 'Address & Auto GPS Detection'}</span>
              </span>

              {isGeocoding ? (
                <span className="text-[10px] text-blue-500 flex items-center gap-1 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {isAr ? 'جاري تحديد الإحداثيات...' : 'Locating...'}
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  {isAr ? 'الموقع محدد' : 'Pin Ready'}
                </span>
              )}
            </div>

            {/* Egypt Governorates Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                {isAr ? 'اختر المحافظة (قائمة محافظات مصر):' : 'Select Governorate (Egypt):'}
              </label>
              <select
                value={selectedGov}
                onChange={(e) => setSelectedGov(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B]"
              >
                {EGYPT_GOVERNORATES.map(gov => (
                  <option key={gov.id} value={gov.nameAr}>
                    {isAr ? gov.nameAr : gov.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Address input with smart detection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                {isAr ? 'العنوان الذي أخبرك به العميل:' : 'Detailed Address:'}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isAr ? 'مثال: التجمع الخامس شارع التسعين الجنوبي فيلا 14' : 'e.g. 5th Settlement, South 90th St'}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B]"
              />
            </div>

            {/* Auto-detected Coordinates Live Badge */}
            <div className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300">
                <Navigation className="w-3.5 h-3.5 text-emerald-500" />
                <span>{coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {isAr ? 'إحداثيات الماب الحقيقية' : 'Real Map Coordinates'}
              </span>
            </div>
          </div>

          {/* Chandelier Model & Truck Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isAr ? 'اسم وموديل الثريا:' : 'Chandelier Model:'}
              </label>
              <input
                type="text"
                required
                value={chandelierModel}
                onChange={(e) => setChandelierModel(e.target.value)}
                placeholder={isAr ? 'ثريا فرساي الملكية' : 'Versailles Chandelier'}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isAr ? 'شاحنة النقل:' : 'Assigned Truck:'}
              </label>
              <select
                value={assignedVehicleId}
                onChange={(e) => setAssignedVehicleId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B]"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.id} · {v.plateNumber} ({v.model.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isAr ? 'تاريخ التركيب:' : 'Scheduled Date:'}
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isAr ? 'فترة التوصيل:' : 'Time Window:'}
              </label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B]"
              >
                <option value="09:00 - 13:00">09:00 - 13:00 (صباحي)</option>
                <option value="13:00 - 17:00">13:00 - 17:00 (بعد الظهر)</option>
                <option value="17:00 - 21:00">17:00 - 21:00 (مسائي)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] flex items-center gap-1.5 shadow-lg shadow-[#C5A45B]/20 cursor-pointer transition-transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'تثبيت وحفظ أمر العمل' : 'Save & Confirm Order')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
