import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle } from '../../types';
import { INITIAL_VEHICLES } from '../../data/mockData';
import { VehicleModal } from './VehicleModal';
import { LiveFleetMissionTracker } from './LiveFleetMissionTracker';
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
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Radio,
  Navigation,
  Compass,
  Lock,
  Unlock,
  Activity,
  UserCheck,
  UserX,
  PhoneCall,
  Clock,
  Zap
} from 'lucide-react';

export const FleetManagement: React.FC = () => {
  const { 
    language, 
    vehicles, 
    deleteVehicle, 
    openDetailModal,
    simulateVehicleTampering,
    resolveVehicleTampering,
    toggleCargoLock 
  } = useApp();
  const isAr = language === 'ar';

  const effectiveVehicles = vehicles && vehicles.length > 0 ? vehicles : INITIAL_VEHICLES;
  const [viewMode, setViewMode] = useState<'roster' | 'live_map'>('roster');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(effectiveVehicles[0]?.id || 'TRK-101');
  const [activeTab, setActiveTab] = useState<'info' | 'telemetry' | 'maintenance' | 'checklist'>('telemetry');
  const [search, setSearch] = useState('');
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);

  const selectedVehicle = effectiveVehicles.find(v => v.id === selectedVehicleId) || effectiveVehicles[0] || INITIAL_VEHICLES[0];

  const filteredVehicles = effectiveVehicles.filter(v => {
    if (!v) return false;
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      (v.id && v.id.toLowerCase().includes(term)) || 
      (v.plateNumber && v.plateNumber.includes(term)) ||
      (v.plateNumberEn && v.plateNumberEn.toLowerCase().includes(term)) ||
      (v.model && v.model.toLowerCase().includes(term)) ||
      (v.driverNameAr && v.driverNameAr.includes(term)) ||
      (v.driverNameEn && v.driverNameEn.toLowerCase().includes(term))
    );
  });

  const activeOnMissionCount = effectiveVehicles.filter(v => v.status === 'on_route' || v.status === 'at_customer').length;
  const tamperAlertsCount = effectiveVehicles.filter(v => v.driverDiligenceStatus && v.driverDiligenceStatus !== 'diligent').length;

  const handleOpenAdd = () => {
    setVehicleToEdit(null);
    setVehicleModalOpen(true);
  };

  const handleOpenEdit = (v: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setVehicleToEdit(v);
    setVehicleModalOpen(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف واستبعاد هذه الشاحنة من الأسطول؟' : 'Are you sure you want to decommission this vehicle?')) {
      deleteVehicle(id);
    }
  };

  const handleLiveTrackVehicle = (v: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVehicleId(v.id);
    setViewMode('live_map');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-3 sm:p-5 max-w-7xl mx-auto w-full gap-4 text-slate-100">
      {/* Fleet Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#C5A45B]" />
            <h1 className="text-xl font-bold text-white">
              {isAr ? 'إدارة أسطول شاحنات نقل الكريستال الفاخر' : 'Crystal Transport Fleet Operations'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? 'تتبع حي لحظي بالـ GPS أثناء المهمة، حماية الثريات من الاهتزاز، ومراقبة انضباط وإنتاجية السائقين' 
              : 'Live GPS mission tracking, crystal vibration damping, and driver diligence & integrity radar'}
          </p>
        </div>

        {/* View Mode Switcher (Roster vs Live GPS Tracker) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-md">
            <button
              onClick={() => setViewMode('roster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'roster'
                  ? 'bg-[#C5A45B] text-[#0D131D] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{isAr ? 'سجل الأسطول والمواصفات' : 'Fleet Roster'}</span>
            </button>

            <button
              onClick={() => setViewMode('live_map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                viewMode === 'live_map'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{isAr ? 'خريطة التتبع الحي ورصد التلاعب' : 'Live GPS & Diligence Map'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] transition-transform active:scale-95 shadow-md shadow-[#C5A45B]/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{isAr ? 'إضافة شاحنة' : 'Add Truck'}</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Full-screen Live GPS Mission Tracker & Diligence Radar */}
      {viewMode === 'live_map' ? (
        <div className="flex-1 overflow-hidden">
          <LiveFleetMissionTracker 
            initialSelectedVehicleId={selectedVehicle?.id} 
            onClose={() => setViewMode('roster')}
          />
        </div>
      ) : (
        /* VIEW MODE 2: Master Roster + Deep Profile Drawer */
        <div className="flex flex-col flex-1 overflow-hidden gap-4">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي الأسطول:' : 'Total Fleet:'}</span>
                <span className="text-lg font-bold font-mono text-white">{vehicles.length} {isAr ? 'شاحنة' : 'Trucks'}</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{isAr ? 'في مهمات حية:' : 'On Active Mission:'}</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{activeOnMissionCount} {isAr ? 'متحركة' : 'En Route'}</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{isAr ? 'متوسط انضباط السائقين:' : 'Avg Driver Diligence:'}</span>
                <span className="text-lg font-bold font-mono text-[#DFBA6B]">96.8%</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#C5A45B]/10 text-[#DFBA6B] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{isAr ? 'تنبيهات اشتباه تلاعب:' : 'Tamper Alerts:'}</span>
                <span className={`text-lg font-bold font-mono ${tamperAlertsCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {tamperAlertsCount} {isAr ? 'تنبيه' : 'Alerts'}
                </span>
              </div>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tamperAlertsCount > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 left-3" />
            <input
              type="text"
              placeholder={isAr ? 'بحث برقم الشاحنة، اللوحة، السائق، أو الطراز...' : 'Search plate, ID, driver, model...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-[#C5A45B]"
            />
          </div>

          {/* Main 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 overflow-hidden">
            {/* Left Column: Vehicles Master Table / Cards */}
            <div className="lg:col-span-2 overflow-y-auto flex flex-col gap-3 pe-1">
              {filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicle?.id === vehicle.id;
                const loadPercent = Math.round((vehicle.currentLoadKg / vehicle.maxWeightKg) * 100);
                const isAlert = vehicle.driverDiligenceStatus && vehicle.driverDiligenceStatus !== 'diligent';

                return (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 relative group ${
                      isSelected 
                        ? 'bg-slate-900 border-[#C5A45B] shadow-lg shadow-[#C5A45B]/10' 
                        : isAlert
                        ? 'bg-red-950/20 border-red-500/40 hover:border-red-500'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isAlert 
                            ? 'bg-red-500/20 border border-red-500/40 text-red-400' 
                            : 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                        }`}>
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
                            {isAr ? 'السائق:' : 'Driver:'} <b className="text-slate-300">{isAr ? vehicle.driverNameAr : vehicle.driverNameEn}</b>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Live Tracking Jump Button */}
                        <button
                          onClick={(e) => handleLiveTrackVehicle(vehicle, e)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                          title={isAr ? 'فتح شاشة التتبع الحي لهذه الشاحنة' : 'Open Live GPS Radar'}
                        >
                          <Radio className="w-3.5 h-3.5 animate-pulse" />
                          <span>{isAr ? 'تتبع بالخريطة' : 'Live Track'}</span>
                        </button>

                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                          vehicle.status === 'on_route' 
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                            : vehicle.status === 'at_customer'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {vehicle.status.replace(/_/g, ' ').toUpperCase()}
                        </span>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleOpenEdit(vehicle, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-[#C5A45B] hover:text-[#0D131D] text-slate-300 transition-colors cursor-pointer"
                            title={isAr ? 'تعديل الشاحنة' : 'Edit Truck'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(vehicle.id, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors cursor-pointer"
                            title={isAr ? 'حذف الشاحنة' : 'Delete Truck'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mission Destination & Real-time Diligence Telemetry Pill */}
                    {vehicle.missionDestinationAr && (
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#C5A45B] shrink-0" />
                          <span className="text-slate-300 truncate font-semibold">
                            {isAr ? vehicle.missionDestinationAr : vehicle.missionDestinationEn}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-blue-400 text-xs">{vehicle.speedKmH} km/h</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isAlert 
                              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          }`}>
                            {isAlert ? (isAr ? '⚠️ اشتباه تلاعب' : 'Tamper Alert') : (isAr ? `انضباط: ${vehicle.driverDiligenceScore || 96}%` : `Diligence: ${vehicle.driverDiligenceScore || 96}%`)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Specs Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/70 text-xs text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isAr ? 'الحمولة القصوى:' : 'Max Payload:'}</span>
                        <span className="font-mono text-slate-200 tabular-nums">{vehicle.maxWeightKg} kg</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isAr ? 'مخمد الاهتزاز:' : 'Vibration:'}</span>
                        <span className={vehicle.hasPneumaticDamping ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                          {vehicle.hasPneumaticDamping ? 'Pneumatic 0.12G' : 'Standard'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isAr ? 'قفل الصندوق:' : 'Vault Lock:'}</span>
                        <span className={vehicle.cargoLockSecured !== false ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          {vehicle.cargoLockSecured !== false ? 'LOCKED' : 'UNSECURED'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isAr ? 'الوقود / البطارية:' : 'Fuel / Batt:'}</span>
                        <span className="font-mono text-slate-200">{vehicle.fuelLevelPercent}%</span>
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
            {selectedVehicle && (
              <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-[#DFBA6B] font-bold">{selectedVehicle.id}</span>
                      <h3 className="text-base font-bold text-white">{selectedVehicle.model}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDetailModal('vehicle', selectedVehicle)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-[#C5A45B] hover:text-[#0D131D] text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                        title={isAr ? 'فتح بشاشة مستقلة' : 'Open in Separate Screen'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
                        {selectedVehicle.plateNumber}
                      </span>
                    </div>
                  </div>

                  {/* Tabs: Added 'telemetry' as primary tab! */}
                  <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 my-4 text-xs">
                    <button
                      onClick={() => setActiveTab('telemetry')}
                      className={`flex-1 py-1.5 rounded-md transition-colors cursor-pointer ${
                        activeTab === 'telemetry' ? 'bg-[#C5A45B] text-[#0D131D] font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {isAr ? 'التتبع والأمان' : 'Tracking'}
                    </button>
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
                      {isAr ? 'الأمان' : 'Safety'}
                    </button>
                  </div>

                  {/* Tab 0: Real-time Telemetry & Diligence */}
                  {activeTab === 'telemetry' && (
                    <div className="flex flex-col gap-3 text-xs">
                      {/* Driver Diligence Meter */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-semibold">{isAr ? 'مؤشر انضباط السائق:' : 'Driver Diligence Score:'}</span>
                          <span className="text-emerald-400 font-mono font-bold text-sm">{selectedVehicle.driverDiligenceScore || 95}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${selectedVehicle.driverDiligenceScore || 95}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {isAr ? 'السائق: ' : 'Driver: '} {isAr ? selectedVehicle.driverNameAr : selectedVehicle.driverNameEn} ({selectedVehicle.driverPhone || '01008124910'})
                        </span>
                      </div>

                      {/* GPS & Mission Coordinates */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#C5A45B]" />
                            <span>{isAr ? 'إحداثيات GPS المباشرة:' : 'Live GPS Pin:'}</span>
                          </span>
                          <span className="font-mono text-slate-200">
                            {(selectedVehicle.currentLat ?? 30.0382).toFixed(4)}, {(selectedVehicle.currentLng ?? 31.3912).toFixed(4)}
                          </span>
                        </div>
                        {selectedVehicle.missionDestinationAr && (
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                            <span className="text-slate-500 block">{isAr ? 'الوجهة المعتمدة للثريا:' : 'Mission Destination:'}</span>
                            <span className="text-white font-semibold">{isAr ? selectedVehicle.missionDestinationAr : selectedVehicle.missionDestinationEn}</span>
                          </div>
                        )}
                      </div>

                      {/* Cargo Vault & Shock Sensors */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{isAr ? 'قفل صندوق الكريستال:' : 'Cargo Vault Lock:'}</span>
                          <span className={selectedVehicle.cargoLockSecured !== false ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {selectedVehicle.cargoLockSecured !== false ? 'SECURED LOCKED' : 'UNLOCKED ALERT'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>{isAr ? 'مستشعر الاهتزاز الهوائي:' : 'Vibration G-Force:'}</span>
                          <span className="font-mono text-emerald-400 font-bold">{selectedVehicle.cargoVibrationGForce || 0.12} G</span>
                        </div>
                      </div>

                      {/* Jump to Map Tracker Button */}
                      <button
                        onClick={() => setViewMode('live_map')}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer transition-all"
                      >
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>{isAr ? 'فتح الخريطة التفاعلية ورادار التلاعب' : 'Open Live Radar & Anti-Tamper'}</span>
                      </button>
                    </div>
                  )}

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
                  <button
                    onClick={() => openDetailModal('vehicle', selectedVehicle)}
                    className="text-xs text-[#DFBA6B] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isAr ? 'عرض الشاشة المستقلة للشاحنة' : 'Open Dedicated Screen'}</span>
                  </button>
                  <span className="text-emerald-400 font-mono font-bold">100% OPERATIONAL</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vehicle Add/Edit Modal */}
      {vehicleModalOpen && (
        <VehicleModal
          vehicleToEdit={vehicleToEdit}
          onClose={() => setVehicleModalOpen(false)}
        />
      )}
    </div>
  );
};
