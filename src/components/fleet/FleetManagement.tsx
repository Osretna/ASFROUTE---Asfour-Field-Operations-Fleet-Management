import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { 
  Truck, 
  ShieldCheck, 
  Fuel, 
  Gauge, 
  MapPin, 
  Calendar, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const FleetManagement: React.FC = () => {
  const { language, vehicles } = useApp();
  const isAr = language === 'ar';

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(vehicles[0]);
  const [activeTab, setActiveTab] = useState<'info' | 'maintenance' | 'checklist'>('info');
  const [search, setSearch] = useState('');

  const filteredVehicles = vehicles.filter(v => 
    v.id.toLowerCase().includes(search.toLowerCase()) || 
    v.plateNumber.includes(search) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 max-w-7xl mx-auto w-full gap-5 text-slate-100">
      {/* Fleet Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C5A45B]" />
            <h1 className="text-xl font-bold text-white">
              {isAr ? 'إدارة أسطول شاحنات نقل الكريستال الفاخر' : 'Crystal Transport Fleet Operations'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? 'شاحنات نقل ثقيل ومجهزة بنظام التعليق الهوائي المضاد للاهتزاز وأوناش الرفع الهيدروليكية' 
              : 'Pneumatically damped transport trucks, heavy hydraulic tailgate lifts & live telemetry'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute top-2.5 left-3" />
          <input
            type="text"
            placeholder={isAr ? 'بحث برقم الشاحنة أو اللوحة...' : 'Search plate, ID, model...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-[#C5A45B]"
          />
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left Column: Vehicles Master Table / Cards */}
        <div className="lg:col-span-2 overflow-y-auto flex flex-col gap-3 pe-1">
          {filteredVehicles.map((vehicle) => {
            const isSelected = selectedVehicle.id === vehicle.id;
            const loadPercent = Math.round((vehicle.currentLoadKg / vehicle.maxWeightKg) * 100);

            return (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 ${
                  isSelected 
                    ? 'bg-slate-900 border-[#C5A45B] shadow-lg shadow-[#C5A45B]/10' 
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-xs">
                      {vehicle.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{vehicle.model}</span>
                        <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {vehicle.plateNumber}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {isAr ? 'السائق:' : 'Driver:'} {isAr ? vehicle.driverNameAr : vehicle.driverNameEn}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                    vehicle.status === 'on_route' 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                      : vehicle.status === 'at_customer'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {vehicle.status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/70 text-xs text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'الحمولة القصوى:' : 'Max Payload:'}</span>
                    <span className="font-mono text-slate-200 tabular-nums">{vehicle.maxWeightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'الحجم الداخلي:' : 'Volume:'}</span>
                    <span className="font-mono text-slate-200 tabular-nums">{vehicle.volumetricCapacityM3} m³</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'أقصى ارتفاع:' : 'Max Height:'}</span>
                    <span className="font-mono text-slate-200 tabular-nums">{vehicle.maxHeightM} m</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'مخمد الصدمات:' : 'Damping:'}</span>
                    <span className={vehicle.hasPneumaticDamping ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {vehicle.hasPneumaticDamping ? 'Pneumatic' : 'Standard'}
                    </span>
                  </div>
                </div>

                {/* Load Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{isAr ? 'استغلال حمولة الشاحنة' : 'Capacity Load'}</span>
                    <span className="text-slate-200">{vehicle.currentLoadKg} / {vehicle.maxWeightKg} kg ({loadPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${loadPercent > 85 ? 'bg-amber-500' : 'bg-[#C5A45B]'}`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Vehicle Deep Profile Drawer */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-[#DFBA6B] font-bold">{selectedVehicle.id}</span>
                <h3 className="text-base font-bold text-white">{selectedVehicle.model}</h3>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
                {selectedVehicle.plateNumber}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 my-4 text-xs">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'info' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'المواصفات' : 'Specs'}
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'maintenance' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'الصيانة' : 'Maintenance'}
              </button>
              <button
                onClick={() => setActiveTab('checklist')}
                className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'checklist' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isAr ? 'فحص الأمان' : 'Safety Check'}
              </button>
            </div>

            {/* Tab 1: Info */}
            {activeTab === 'info' && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'تصنيف الشاحنة:' : 'Vehicle Category:'}</span>
                  <span className="font-semibold text-slate-200">{selectedVehicle.type}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'ونش هيدروليكي خلفي:' : 'Hydraulic Tailgate:'}</span>
                  <span className="text-emerald-400 font-bold">{selectedVehicle.hasCraneLift ? 'YES · 1500kg Lift' : 'NO'}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'عزل الاهتزاز الهوائي:' : 'Vibration Damping:'}</span>
                  <span className="text-emerald-400 font-bold">{selectedVehicle.hasPneumaticDamping ? 'CERTIFIED PNEUMATIC' : 'NO'}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">{isAr ? 'السرعة المقيدة للسلامة:' : 'Safety Speed Governor:'}</span>
                  <span className="font-mono text-amber-400">MAX 70 km/h</span>
                </div>
              </div>
            )}

            {/* Tab 2: Maintenance */}
            {activeTab === 'maintenance' && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-slate-200 font-semibold">
                    <span>{isAr ? 'معايرة الوسائد الهوائية الدورية' : 'Pneumatic Airbag Calibration'}</span>
                    <span className="text-emerald-400 font-mono">PASSED</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Date: 2026-10-24 · Depot Sharkia</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-slate-200 font-semibold">
                    <span>{isAr ? 'فحص زيت الونش الهيدروليكي' : 'Hydraulic Winch Fluid Test'}</span>
                    <span className="text-emerald-400 font-mono">PASSED</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Date: 2026-10-18 · Central Garage</span>
                </div>
              </div>
            )}

            {/* Tab 3: Pre-Trip Checklist */}
            {activeTab === 'checklist' && (
              <div className="flex flex-col gap-2 text-xs">
                {[
                  { titleAr: 'أحزمة التثبيت المبطنة بالمخمل للكريستال', titleEn: 'Velvet-padded crystal restraint straps' },
                  { titleAr: 'حساسات التوازن والاهتزاز اللاسلكية', titleEn: 'Wireless real-time vibration sensors' },
                  { titleAr: 'صناديق رغوة الحماية المفرغة EPE', titleEn: 'Custom moulded EPE protective inserts' },
                  { titleAr: 'سقالة الألمنيوم الميكانيكية المعتمدة', titleEn: 'Certified aluminium high-reach scaffold' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded bg-slate-950 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-slate-300">{isAr ? item.titleAr : item.titleEn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>{isAr ? 'حالة الشاحنة:' : 'Chassis Status:'}</span>
            <span className="text-emerald-400 font-mono font-bold">100% OPERATIONAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
