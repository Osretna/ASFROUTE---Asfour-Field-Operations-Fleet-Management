import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, WorkOrder, Branch } from '../../types';
import { BRANCHES } from '../../data/mockData';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Layers, 
  ShieldCheck, 
  Compass, 
  Zap, 
  Clock, 
  Gauge, 
  Fuel, 
  AlertCircle,
  X,
  Maximize2
} from 'lucide-react';

interface LiveOperationsMapProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onSelectVehicle: (v: Vehicle) => void;
}

export const LiveOperationsMap: React.FC<LiveOperationsMapProps> = ({ onSelectWorkOrder, onSelectVehicle }) => {
  const { language, vehicles, workOrders } = useApp();
  const isAr = language === 'ar';

  const [selectedMapVehicle, setSelectedMapVehicle] = useState<Vehicle | null>(vehicles[0]);
  const [selectedMapWo, setSelectedMapWo] = useState<WorkOrder | null>(null);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [mapZoom, setMapZoom] = useState<number>(1);

  // Geographic bounds conversion for Greater Cairo & Delta:
  // Lat range: 29.8 to 31.3 (Height: 1.5 deg)
  // Lng range: 29.8 to 32.0 (Width: 2.2 deg)
  const mapCoordsToSvg = (lat: number, lng: number) => {
    const minLat = 29.85;
    const maxLat = 31.35;
    const minLng = 29.80;
    const maxLng = 31.95;

    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    // Invert Y because latitude goes north (up) but SVG Y goes down
    const y = 800 - ((lat - minLat) / (maxLat - minLat)) * 800;

    return { x: Math.max(20, Math.min(980, x)), y: Math.max(20, Math.min(780, y)) };
  };

  return (
    <div className="flex flex-col h-full bg-[#080C14] rounded-xl border border-slate-800/90 overflow-hidden shadow-xl relative">
      {/* Map Control Bar */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 shadow-lg text-xs font-semibold text-slate-200">
          <Navigation className="w-3.5 h-3.5 text-[#C5A45B]" />
          <span>{isAr ? 'خريطة العمليات الحية (نطاق القاهرة والدلتا)' : 'Live Fleet Radar (Cairo & Delta)'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-2.5 py-1 text-xs rounded-lg border backdrop-blur-md transition-colors ${
              showTraffic 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-slate-900/80 text-slate-400 border-slate-800'
            }`}
          >
            {isAr ? 'حركة المرور اللحظية' : 'Live Traffic'}
          </button>
        </div>
      </div>

      {/* Interactive Vector / Canvas Map Engine */}
      <div className="flex-1 w-full h-full relative overflow-hidden select-none bg-[#090E17]">
        {/* Radar grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <svg 
          viewBox="0 0 1000 800" 
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300"
          style={{ transform: `scale(${mapZoom})` }}
        >
          {/* Subtle River Nile Polyline */}
          <path
            d="M 520 800 Q 515 650 510 500 Q 520 400 480 320 Q 450 260 410 180 Q 370 120 320 0"
            fill="none"
            stroke="#1E3A8A"
            strokeWidth="8"
            strokeOpacity="0.4"
          />
          <path
            d="M 480 320 Q 550 240 620 160 Q 680 100 750 0"
            fill="none"
            stroke="#1E3A8A"
            strokeWidth="5"
            strokeOpacity="0.3"
          />

          {/* Main Ring Roads & Highways (Arterial Arteries) */}
          {/* Ring Road (الطريق الدائري) */}
          <ellipse 
            cx="540" 
            cy="460" 
            rx="160" 
            ry="140" 
            fill="none" 
            stroke={showTraffic ? "#EAB308" : "#334155"} 
            strokeWidth="3.5" 
            strokeDasharray={showTraffic ? "8 4" : "none"}
            strokeOpacity="0.6" 
          />

          {/* Cairo - Suez Highway (طريق السويس) */}
          <path
            d="M 580 440 L 980 360"
            fill="none"
            stroke={showTraffic ? "#EF4444" : "#334155"} // Traffic hotspot near New Capital!
            strokeWidth="4"
            strokeOpacity="0.7"
          />

          {/* Mehwar 26th of July towards Sheikh Zayed */}
          <path
            d="M 490 450 L 260 440 L 140 430"
            fill="none"
            stroke={showTraffic ? "#10B981" : "#334155"}
            strokeWidth="3.5"
            strokeOpacity="0.7"
          />

          {/* Cairo - Alexandria Desert Road */}
          <path
            d="M 260 440 L 110 200 L 50 80"
            fill="none"
            stroke={showTraffic ? "#10B981" : "#334155"}
            strokeWidth="3"
            strokeOpacity="0.6"
          />

          {/* Regional Ring Road (الدائري الإقليمي) */}
          <ellipse 
            cx="550" 
            cy="450" 
            rx="340" 
            ry="300" 
            fill="none" 
            stroke="#1E293B" 
            strokeWidth="2.5" 
            strokeOpacity="0.5" 
          />

          {/* Depots & Branches Nodes */}
          {BRANCHES.map(branch => {
            const { x, y } = mapCoordsToSvg(branch.coordinates[0], branch.coordinates[1]);
            return (
              <g key={branch.id} className="cursor-pointer group">
                <circle cx={x} cy={y} r="18" fill="#C5A45B" fillOpacity="0.1" stroke="#C5A45B" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx={x} cy={y} r="6" fill="#C5A45B" />
                <text 
                  x={x} 
                  y={y - 12} 
                  fill="#E2E8F0" 
                  fontSize="10" 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  className="pointer-events-none drop-shadow-md font-sans"
                >
                  {isAr ? branch.nameAr.split(' ')[0] : branch.city}
                </text>
              </g>
            );
          })}

          {/* Active Work Order Delivery Sites with Geofence Rings */}
          {workOrders.map((wo) => {
            const { x, y } = mapCoordsToSvg(wo.coordinates[0], wo.coordinates[1]);
            const isSelected = selectedMapWo?.id === wo.id;

            return (
              <g 
                key={wo.id} 
                onClick={() => {
                  setSelectedMapWo(wo);
                  onSelectWorkOrder(wo);
                }} 
                className="cursor-pointer group"
              >
                {/* Geofence pulse */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r="24" 
                  fill="#DFBA6B" 
                  fillOpacity="0.08" 
                  stroke="#DFBA6B" 
                  strokeWidth="1.5" 
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />

                <circle 
                  cx={x} 
                  cy={y} 
                  r="9" 
                  fill={isSelected ? "#DFBA6B" : "#1E293B"} 
                  stroke="#DFBA6B" 
                  strokeWidth="2" 
                />

                <text 
                  x={x} 
                  y={y + 3.5} 
                  fill="#FFFFFF" 
                  fontSize="8" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  className="pointer-events-none font-mono"
                >
                  💎
                </text>

                <text 
                  x={x} 
                  y={y + 22} 
                  fill="#CBD5E1" 
                  fontSize="9" 
                  fontWeight="600" 
                  textAnchor="middle" 
                  className="pointer-events-none drop-shadow"
                >
                  {isAr ? wo.customerNameAr.split(' - ')[0] : wo.customerNameEn.split(' - ')[0]}
                </text>
              </g>
            );
          })}

          {/* Moving Fleet Vehicles with Live Headings */}
          {vehicles.map((v) => {
            const { x, y } = mapCoordsToSvg(v.currentLat, v.currentLng);
            const isSelected = selectedMapVehicle?.id === v.id;
            const isOnRoute = v.status === 'on_route';

            return (
              <g 
                key={v.id} 
                onClick={() => {
                  setSelectedMapVehicle(v);
                  onSelectVehicle(v);
                }}
                className="cursor-pointer group"
              >
                {/* Ping wave around active vehicle */}
                {isOnRoute && (
                  <circle cx={x} cy={y} r="18" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1" className="animate-ping" />
                )}

                <rect 
                  x={x - 14} 
                  y={y - 12} 
                  width="28" 
                  height="24" 
                  rx="6" 
                  fill={isSelected ? "#C5A45B" : isOnRoute ? "#1D4ED8" : "#334155"} 
                  stroke={isSelected ? "#FFFFFF" : "#60A5FA"} 
                  strokeWidth="1.5" 
                  className="shadow-lg"
                />

                <text 
                  x={x} 
                  y={y + 3} 
                  fill={isSelected ? "#0F172A" : "#FFFFFF"} 
                  fontSize="9" 
                  fontWeight="bold" 
                  textAnchor="middle" 
                  className="font-mono pointer-events-none"
                >
                  {v.id.replace('TRK-', '')}
                </text>

                {/* Speed tag */}
                {isOnRoute && (
                  <text 
                    x={x} 
                    y={y - 16} 
                    fill="#93C5FD" 
                    fontSize="8" 
                    fontWeight="bold" 
                    textAnchor="middle" 
                    className="font-mono"
                  >
                    {v.speedKmH} km/h
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Vehicle Telemetry Floating Card */}
        {selectedMapVehicle && (
          <div className="absolute bottom-3 left-3 right-3 lg:right-auto lg:w-96 z-30 bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl text-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{selectedMapVehicle.id}</span>
                    <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                      {selectedMapVehicle.plateNumber}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate w-56">
                    {selectedMapVehicle.model}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedMapVehicle(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">{isAr ? 'السرعة الحالية' : 'Speed'}</span>
                <span className="text-xs font-bold font-mono text-emerald-400 tabular-nums">
                  {selectedMapVehicle.speedKmH} km/h
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">{isAr ? 'مستوى الوقود' : 'Fuel'}</span>
                <span className="text-xs font-bold font-mono text-amber-400 tabular-nums">
                  {selectedMapVehicle.fuelLevelPercent}%
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-[9px] text-slate-400 block">{isAr ? 'عزل الاهتزاز' : 'Pneumatic'}</span>
                <span className="text-xs font-bold font-mono text-blue-400">
                  {selectedMapVehicle.hasPneumaticDamping ? 'ACTIVE' : 'N/A'}
                </span>
              </div>
            </div>

            {/* Current Driver & Route Details */}
            <div className="flex items-center justify-between text-[11px] bg-slate-950/50 p-2 rounded border border-slate-800">
              <span className="text-slate-400">{isAr ? 'السائق المعين:' : 'Assigned Driver:'}</span>
              <span className="font-semibold text-slate-200">
                {isAr ? selectedMapVehicle.driverNameAr : selectedMapVehicle.driverNameEn}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] bg-[#C5A45B]/10 p-2 rounded border border-[#C5A45B]/30 text-[#DFBA6B]">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {isAr ? 'موعد الوصول المتوقع (ETA):' : 'Next Stop ETA:'}
              </span>
              <span className="font-mono font-bold">
                {selectedMapVehicle.nextStopEta || 'Available in Depot'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
