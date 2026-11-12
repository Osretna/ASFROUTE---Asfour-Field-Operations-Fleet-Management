import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { Vehicle, WorkOrder, DriverDiligenceStatus } from '../../types';
import { BRANCHES } from '../../data/mockData';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  Lock, 
  Unlock, 
  PhoneCall, 
  MessageSquare, 
  Sparkles, 
  RefreshCw, 
  Play, 
  Pause, 
  Compass, 
  Radio, 
  Activity, 
  UserCheck, 
  UserX, 
  Zap, 
  Eye, 
  Layers, 
  X,
  Sliders,
  Send,
  Volume2
} from 'lucide-react';

interface LiveFleetMissionTrackerProps {
  initialSelectedVehicleId?: string;
  onClose?: () => void;
}

export const LiveFleetMissionTracker: React.FC<LiveFleetMissionTrackerProps> = ({ 
  initialSelectedVehicleId,
  onClose 
}) => {
  const { 
    language, 
    vehicles, 
    workOrders, 
    isLiveTrackingActive, 
    toggleLiveTracking, 
    simulateVehicleMovement,
    simulateVehicleTampering,
    resolveVehicleTampering,
    sendDriverMessage,
    toggleCargoLock,
    openDetailModal
  } = useApp();

  const isAr = language === 'ar';

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    initialSelectedVehicleId || vehicles.find(v => v.status === 'on_route')?.id || vehicles[0]?.id || ''
  );

  const [filterMode, setFilterMode] = useState<'all' | 'on_mission' | 'alerts'>('all');
  const [mapLayerType, setMapLayerType] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const [inCabMessage, setInCabMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [selectedVehicle?.currentLat || 30.0444, selectedVehicle?.currentLng || 31.3500],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    corridorLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Tile Layer Update
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    let subdomains = 'abc';

    if (mapLayerType === 'streets') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else if (mapLayerType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains,
    });
    tileLayer.addTo(map);
    tileLayer.bringToBack();
  }, [mapLayerType]);

  // 3. Render Markers, Safe Corridors & Breadcrumbs
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const corridorLayer = corridorLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !markersLayer || !corridorLayer || !routeLayer) return;

    markersLayer.clearLayers();
    corridorLayer.clearLayers();
    routeLayer.clearLayers();

    // Depots / Factory Pins
    BRANCHES.forEach(branch => {
      const depotIcon = L.divIcon({
        className: 'custom-depot-pin',
        html: `
          <div style="background: rgba(197, 164, 91, 0.95); color: #0d131d; padding: 3px 6px; border-radius: 6px; font-weight: bold; font-size: 10px; border: 1px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>🏛️</span>
            <span>${isAr ? branch.nameAr.split(' ')[0] : branch.city}</span>
          </div>
        `,
        iconSize: [80, 26],
        iconAnchor: [40, 13]
      });
      const marker = L.marker([branch.coordinates[0], branch.coordinates[1]], { icon: depotIcon });
      markersLayer.addLayer(marker);
    });

    // Destination Crystal Delivery Sites
    workOrders.forEach(wo => {
      const isTargetOfSelected = selectedVehicle?.currentWorkOrderId === wo.id;
      const crystalIcon = L.divIcon({
        className: 'custom-crystal-site-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: ${isTargetOfSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s;">
            <div style="background: ${isTargetOfSelected ? '#C5A45B' : '#0F172A'}; border: 2px solid #FFFFFF; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(197, 164, 91, 0.8);">
              <span style="font-size: 15px;">💎</span>
            </div>
            <div style="background: rgba(13, 19, 29, 0.95); color: #DFBA6B; font-size: 9px; font-weight: bold; padding: 2px 5px; border-radius: 4px; margin-top: 2px; border: 1px solid rgba(197, 164, 91, 0.4); white-space: nowrap;">
              ${isAr ? wo.customerNameAr.split(' - ')[0] : wo.customerNameEn.split(' - ')[0]}
            </div>
          </div>
        `,
        iconSize: [70, 45],
        iconAnchor: [35, 22]
      });

      const marker = L.marker([wo.coordinates[0], wo.coordinates[1]], { icon: crystalIcon });
      markersLayer.addLayer(marker);

      if (isTargetOfSelected) {
        // Geofence Circle around delivery destination
        const circle = L.circle([wo.coordinates[0], wo.coordinates[1]], {
          radius: 500,
          color: '#C5A45B',
          fillColor: '#C5A45B',
          fillOpacity: 0.15,
          weight: 2,
          dashArray: '6, 6'
        });
        markersLayer.addLayer(circle);
      }
    });

    // Vehicles Layer
    vehicles.forEach(veh => {
      const isSelected = selectedVehicle?.id === veh.id;
      const isOnRoute = veh.status === 'on_route';
      const isAlert = veh.driverDiligenceStatus === 'off_route' || 
                      veh.driverDiligenceStatus === 'cargo_breach' || 
                      veh.driverDiligenceStatus === 'shock_detected';
      const isSuspicious = veh.driverDiligenceStatus === 'suspicious_stop';

      let statusColor = '#10B981'; // Diligent Green
      if (isAlert) statusColor = '#EF4444'; // Red Alert
      else if (isSuspicious) statusColor = '#F59E0B'; // Amber Warning
      else if (!isOnRoute) statusColor = '#64748B'; // Idle Gray

      const truckIcon = L.divIcon({
        className: 'custom-live-truck-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: ${isSelected ? 'scale(1.25)' : 'scale(1)'}; transition: transform 0.25s;">
            <!-- Radar Pulse when selected or alert -->
            ${(isSelected || isAlert) ? `
              <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${statusColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -6px;"></div>
            ` : ''}

            <div style="position: relative; background: ${statusColor}; color: #FFFFFF; padding: 4px 8px; border-radius: 10px; border: 2px solid ${isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.7)'}; box-shadow: 0 4px 18px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 5px; font-weight: bold; font-size: 11px; font-family: monospace;">
              <span>🚚</span>
              <span>${veh.id.replace('TRK-', '')}</span>
              ${veh.cargoLockSecured === false ? '<span style="color: #FEE2E2;">🔓</span>' : ''}
            </div>

            <!-- Diligence Mini Indicator -->
            <div style="background: rgba(13, 19, 29, 0.95); color: ${statusColor}; border: 1px solid ${statusColor}; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; margin-top: 2px; font-family: monospace; display: flex; align-items: center; gap: 2px;">
              <span>${veh.speedKmH}km/h</span>
              <span>•</span>
              <span>${veh.driverDiligenceScore || 95}%</span>
            </div>
          </div>
        `,
        iconSize: [80, 50],
        iconAnchor: [40, 25]
      });

      const marker = L.marker([veh.currentLat, veh.currentLng], { icon: truckIcon });
      marker.on('click', () => {
        setSelectedVehicleId(veh.id);
        map.flyTo([veh.currentLat, veh.currentLng], 13, { duration: 0.8 });
      });
      markersLayer.addLayer(marker);

      // If Selected Vehicle has a target destination, draw the Safe Geofenced Corridor and Breadcrumb Trail
      if (isSelected && veh.missionTargetCoords) {
        // 1. Approved Geofence Safety Corridor (buffer line)
        const corridorLine = L.polyline([
          [veh.currentLat, veh.currentLng],
          [
            (veh.currentLat + veh.missionTargetCoords[0]) / 2 + (veh.driverDiligenceStatus === 'off_route' ? 0.008 : 0.004),
            (veh.currentLng + veh.missionTargetCoords[1]) / 2 - (veh.driverDiligenceStatus === 'off_route' ? 0.006 : 0.002)
          ],
          veh.missionTargetCoords
        ], {
          color: isAlert ? '#EF4444' : '#3B82F6',
          weight: 6,
          opacity: 0.75,
          dashArray: isAlert ? '8, 8' : undefined
        });
        corridorLayer.addLayer(corridorLine);

        // 2. Breadcrumbs Trail
        if (veh.routeBreadcrumbs && veh.routeBreadcrumbs.length > 0) {
          const crumbPoints: L.LatLngExpression[] = veh.routeBreadcrumbs.map(b => [b.lat, b.lng]);
          crumbPoints.push([veh.currentLat, veh.currentLng]);

          const trailLine = L.polyline(crumbPoints, {
            color: '#10B981',
            weight: 3,
            opacity: 0.9,
            dashArray: '3, 6'
          });
          routeLayer.addLayer(trailLine);

          veh.routeBreadcrumbs.forEach(crumb => {
            const dot = L.circleMarker([crumb.lat, crumb.lng], {
              radius: 4,
              color: '#10B981',
              fillColor: '#FFFFFF',
              fillOpacity: 0.9,
              weight: 1.5
            });
            dot.bindPopup(`
              <div style="font-family: sans-serif; font-size: 11px; direction: ${isAr ? 'rtl' : 'ltr'}; padding: 2px;">
                <b>${crumb.event || 'نقطة تدقيق أمان'}</b><br/>
                <span>${crumb.timestamp} · ${crumb.speedKmH} كم/س</span>
              </div>
            `);
            routeLayer.addLayer(dot);
          });
        }
      }
    });
  }, [vehicles, workOrders, selectedVehicleId, isAr]);

  // Center on vehicle
  const handleCenterOnVehicle = (v: Vehicle) => {
    setSelectedVehicleId(v.id);
    mapInstanceRef.current?.flyTo([v.currentLat, v.currentLng], 13, { duration: 1.0 });
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter(v => {
    if (filterMode === 'on_mission') return v.status === 'on_route' || v.status === 'at_customer';
    if (filterMode === 'alerts') return v.driverDiligenceStatus !== 'diligent' && v.driverDiligenceStatus !== undefined;
    return true;
  });

  const getDiligenceStatusBadge = (status?: DriverDiligenceStatus) => {
    switch (status) {
      case 'off_route':
        return {
          label: isAr ? 'انحراف وتلاعب بالمسار' : 'Off-Route Tampering',
          color: 'bg-red-500/20 text-red-400 border-red-500/40',
          icon: AlertTriangle
        };
      case 'suspicious_stop':
        return {
          label: isAr ? 'توقف خامل غير مبرر' : 'Suspicious Idle Stop',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: Clock
        };
      case 'shock_detected':
        return {
          label: isAr ? 'صدمة اهتزاز تعرض الكريستال للخطر' : 'Crystal Shock Hazard',
          color: 'bg-red-500/20 text-red-400 border-red-500/40',
          icon: Activity
        };
      case 'cargo_breach':
        return {
          label: isAr ? 'اختراق قفل صندوق الكريستال!' : 'Vault Breach Alert!',
          color: 'bg-red-600/30 text-red-300 border-red-500',
          icon: Unlock
        };
      default:
        return {
          label: isAr ? 'سائق منضبط ومثابر (على المسار)' : 'Diligent & On Route',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: UserCheck
        };
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C5A45B] to-[#DFBA6B] flex items-center justify-center text-[#0D131D] shadow-lg shadow-[#C5A45B]/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isAr ? 'نظام التتبع الحي وحماية شاحنات الكريستال ورصد تلاعب السائقين' : 'Live Fleet Tracking & Anti-Tamper Diligence Radar'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {isLiveTrackingActive ? (isAr ? 'البث الحي نشط' : 'LIVE RADAR ACTIVE') : (isAr ? 'متوقف مؤقتاً' : 'PAUSED')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr 
                ? 'تتبع لحظي بالـ GPS أثناء المهمة لحماية الثريات الثمينة والتأكد من انضباط السائق وعدم تعطيل العمل' 
                : 'Real-time GPS mission tracking, crystal cargo shock protection, and employee integrity monitoring'}
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {/* Map Layer Switch */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMapLayerType('dark')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                mapLayerType === 'dark' ? 'bg-[#C5A45B] text-[#0D131D]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'رادار' : 'Radar'}
            </button>
            <button
              onClick={() => setMapLayerType('streets')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                mapLayerType === 'streets' ? 'bg-[#C5A45B] text-[#0D131D]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'شوارع' : 'Streets'}
            </button>
            <button
              onClick={() => setMapLayerType('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                mapLayerType === 'satellite' ? 'bg-[#C5A45B] text-[#0D131D]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'قمر صناعي' : 'Satellite'}
            </button>
          </div>

          {/* Toggle Live Auto Simulation */}
          <button
            onClick={() => {
              toggleLiveTracking();
              triggerToast(
                !isLiveTrackingActive 
                  ? (isAr ? 'تم تشغيل التتبع الحي التلقائي للأسطول' : 'Automated Live Fleet Tracking Resumed')
                  : (isAr ? 'تم إيقاف التتبع الحي مؤقتاً' : 'Automated Live Tracking Paused')
              );
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLiveTrackingActive
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30'
            }`}
            title={isAr ? 'تشغيل أو إيقاف محاكاة الحركة الحية للشاحنات' : 'Play / Pause Telemetry Simulation'}
          >
            {isLiveTrackingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveTrackingActive ? (isAr ? 'إيقاف مؤقت' : 'Pause') : (isAr ? 'استئناف البث' : 'Resume')}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Left List + Map + Right Deep Telemetry Inspector */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        
        {/* Left Column (3 Cols): Fleet Mission Cards & Filter */}
        <div className="lg:col-span-3 border-e border-slate-800 bg-slate-900/60 flex flex-col overflow-hidden">
          {/* Filter Pills */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-1 text-[11px]">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                filterMode === 'all' ? 'bg-[#C5A45B] text-[#0D131D]' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isAr ? 'الكل (6)' : 'All (6)'}
            </button>
            <button
              onClick={() => setFilterMode('on_mission')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all ${
                filterMode === 'on_mission' ? 'bg-blue-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isAr ? 'في المهمة (4)' : 'On Mission (4)'}
            </button>
            <button
              onClick={() => setFilterMode('alerts')}
              className={`flex-1 py-1.5 rounded-lg font-bold text-center transition-all flex items-center justify-center gap-1 ${
                filterMode === 'alerts' ? 'bg-red-600 text-white' : 'bg-slate-800/80 text-red-400 hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{isAr ? 'تنبيهات تلاعب' : 'Tamper Alerts'}</span>
            </button>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
            {filteredVehicles.map(veh => {
              const isSelected = selectedVehicle?.id === veh.id;
              const badge = getDiligenceStatusBadge(veh.driverDiligenceStatus);
              const BadgeIcon = badge.icon;
              const isEnRoute = veh.status === 'on_route';

              return (
                <div
                  key={veh.id}
                  onClick={() => handleCenterOnVehicle(veh)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                    isSelected
                      ? 'bg-slate-900 border-[#C5A45B] shadow-lg shadow-[#C5A45B]/15'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                        veh.driverDiligenceStatus === 'off_route' || veh.driverDiligenceStatus === 'cargo_breach'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : veh.driverDiligenceStatus === 'suspicious_stop'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}>
                        {veh.id.replace('TRK-', '')}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{veh.model.split(' ')[0]}</span>
                          <span className="text-[10px] font-mono text-slate-400">{veh.plateNumber}</span>
                        </div>
                        <span className="text-[11px] text-slate-300 block truncate max-w-[130px]">
                          {isAr ? veh.driverNameAr : veh.driverNameEn}
                        </span>
                      </div>
                    </div>

                    {/* Diligence Score Meter */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono font-bold text-white">{veh.driverDiligenceScore || 95}%</span>
                      </div>
                      <span className="text-[9px] text-slate-400">{isAr ? 'مؤشر الانضباط' : 'Diligence'}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-bold ${badge.color}`}>
                    <BadgeIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate">{badge.label}</span>
                  </div>

                  {/* Mission Destination & Speed */}
                  {veh.missionDestinationAr && (
                    <div className="text-[10px] text-slate-400 truncate flex items-center justify-between pt-1 border-t border-slate-800/60">
                      <span className="truncate flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-[#C5A45B] shrink-0" />
                        <span className="truncate">{isAr ? veh.missionDestinationAr : veh.missionDestinationEn}</span>
                      </span>
                      <span className="font-mono text-blue-400 shrink-0 font-bold">{veh.speedKmH} km/h</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column (6 Cols): Leaflet Live GPS Map */}
        <div className="lg:col-span-5 h-[360px] lg:h-full relative overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Quick Ping manual button over map */}
          <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
            <button
              onClick={() => {
                if (selectedVehicle) {
                  simulateVehicleMovement(selectedVehicle.id);
                  triggerToast(isAr ? `تم تحديث نبضة GPS للشاحنة ${selectedVehicle.id} وتقدم المسار بنجاح` : `GPS Ping updated for ${selectedVehicle.id}`);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white hover:bg-[#C5A45B] hover:text-[#0D131D] text-xs font-bold border border-slate-700 shadow-xl backdrop-blur-md transition-all cursor-pointer"
              title={isAr ? 'إرسال نبضة GPS يدوية فورية لتقدم الشاحنة' : 'Send Manual GPS Ping'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAr ? 'نبضة GPS فورية' : 'Manual Ping'}</span>
            </button>
          </div>

          {/* Toast Alert */}
          {toastMessage && (
            <div className="absolute top-14 inset-x-0 mx-auto w-max z-[1001] bg-slate-900/95 text-white border border-[#C5A45B] px-4 py-2 rounded-xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A45B]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Legend Bottom Bar */}
          <div className="absolute bottom-3 inset-x-3 z-[1000] bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl flex items-center justify-between text-[10px] text-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>{isAr ? 'سائق منضبط' : 'Diligent'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>{isAr ? 'توقف مشبوه' : 'Idle Stop'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>{isAr ? 'تلاعب / انحراف' : 'Tampering'}</span>
              </span>
            </div>

            <span className="font-mono text-slate-400">
              {isAr ? 'سقف سرعة الأمان: 70 كم/س' : 'Speed Limit: 70 km/h'}
            </span>
          </div>
        </div>

        {/* Right Column (4 Cols): Deep Driver Diligence & Crystal Protection Cockpit */}
        {selectedVehicle && (
          <div className="lg:col-span-4 border-s border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between overflow-y-auto gap-4">
            <div className="flex flex-col gap-4">
              
              {/* Selected Truck Card Header */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#DFBA6B] font-bold">{selectedVehicle.id}</span>
                    <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {selectedVehicle.plateNumber}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{selectedVehicle.model}</h3>
                  <span className="text-[11px] text-slate-400">
                    {isAr ? 'السائق المسؤول:' : 'Driver:'} <b className="text-slate-200">{isAr ? selectedVehicle.driverNameAr : selectedVehicle.driverNameEn}</b>
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => openDetailModal('vehicle', selectedVehicle)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-[#C5A45B] hover:text-[#0D131D] text-slate-300 transition-colors cursor-pointer text-xs flex items-center gap-1"
                    title={isAr ? 'عرض الشاشة المستقلة للشاحنة' : 'Open Full Screen'}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {selectedVehicle.lastTelemetryUpdate || 'مباشر'}
                  </span>
                </div>
              </div>

              {/* 1. Driver Diligence & Integrity Score Radar */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      (selectedVehicle.driverDiligenceScore || 95) >= 90
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {isAr ? 'مؤشر انضباط وإنتاجية السائق' : 'Driver Diligence & Integrity'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {isAr ? 'تقييم الالتزام بالمسار وأوقات العمل وعدم التلاعب' : 'Compliance with route & duty timings'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xl font-mono font-extrabold ${
                      (selectedVehicle.driverDiligenceScore || 95) >= 90 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {selectedVehicle.driverDiligenceScore || 95}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      (selectedVehicle.driverDiligenceScore || 95) >= 90 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                        : (selectedVehicle.driverDiligenceScore || 95) >= 70
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedVehicle.driverDiligenceScore || 95}%` }}
                  />
                </div>

                {/* Active Status Badge & Tampering Reason */}
                {selectedVehicle.lastTamperingReasonAr ? (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex flex-col gap-1">
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span>{isAr ? 'تنبيه تلاعب مرصود حالياً:' : 'Active Tamper Detected:'}</span>
                      </span>
                      <button
                        onClick={() => {
                          resolveVehicleTampering(selectedVehicle.id);
                          triggerToast(isAr ? 'تم تصحيح المسار وإعادة مؤشر الانضباط لـ 98%' : 'Alert resolved & compliance restored');
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                      >
                        {isAr ? 'معالجة وتصحيح' : 'Resolve'}
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-200">
                      {isAr ? selectedVehicle.lastTamperingReasonAr : selectedVehicle.lastTamperingReasonEn}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{isAr ? 'السائق يعمل بجد وملتزم تماماً بالمسار المعتمد' : 'Driver working diligently on approved corridor'}</span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-300">0 Alerts</span>
                  </div>
                )}

                {/* Detailed Indicators Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'وقت التوقف الخامل:' : 'Idle Time:'}</span>
                    <span className={`font-mono font-bold ${selectedVehicle.idleDurationMinutes && selectedVehicle.idleDurationMinutes > 15 ? 'text-amber-400' : 'text-slate-200'}`}>
                      {selectedVehicle.idleDurationMinutes || 0} min
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'الانحراف عن المسار:' : 'Off-Route Drift:'}</span>
                    <span className={`font-mono font-bold ${selectedVehicle.offRouteDistanceMeters && selectedVehicle.offRouteDistanceMeters > 50 ? 'text-red-400' : 'text-slate-200'}`}>
                      {selectedVehicle.offRouteDistanceMeters || 0} meters
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Crystal Cargo Protection Telemetry */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C5A45B]" />
                    <h4 className="text-xs font-bold text-white">
                      {isAr ? 'درع حماية حمولة الكريستال الملكي' : 'Crystal Cargo Vault Protection'}
                    </h4>
                  </div>

                  <button
                    onClick={() => {
                      toggleCargoLock(selectedVehicle.id);
                      triggerToast(isAr ? 'تم تغيير حالة القفل الإلكتروني للصندوق' : 'Vault lock state toggled');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      selectedVehicle.cargoLockSecured !== false
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30 animate-pulse'
                    }`}
                  >
                    {selectedVehicle.cargoLockSecured !== false ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{selectedVehicle.cargoLockSecured !== false ? (isAr ? 'قفل مشفر مؤمن' : 'Secured') : (isAr ? 'القفل مفتوح' : 'Unlocked')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                    <span className="text-slate-500">{isAr ? 'مستشعر الصدمات:' : 'Vibration:'}</span>
                    <span className={`font-mono font-bold ${
                      (selectedVehicle.cargoVibrationGForce || 0.12) > 0.40 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {selectedVehicle.cargoVibrationGForce || 0.12} G
                    </span>
                    <span className="text-[9px] text-slate-500">Max 0.35G</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                    <span className="text-slate-500">{isAr ? 'حرارة الصندوق:' : 'Bay Temp:'}</span>
                    <span className="font-mono text-slate-200 font-bold">{selectedVehicle.cargoBayTempC || 22.4}°C</span>
                    <span className="text-[9px] text-slate-500">20°C - 24°C</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-0.5">
                    <span className="text-slate-500">{isAr ? 'رطوبة المقصورة:' : 'Humidity:'}</span>
                    <span className="font-mono text-slate-200 font-bold">{selectedVehicle.cargoBayHumidityPercent || 46}%</span>
                    <span className="text-[9px] text-slate-500">40% - 55%</span>
                  </div>
                </div>
              </div>

              {/* 3. Anti-Tamper & Testing Simulation Sandbox */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isAr ? 'أدوات اختبار رصد التلاعب واختبار السائق:' : 'Tamper Testing Sandbox:'}</span>
                  </span>
                  <span className="text-[9px] text-slate-400">{isAr ? 'لغرفة العمليات' : 'Dispatch Test'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <button
                    onClick={() => {
                      simulateVehicleTampering(selectedVehicle.id, 'deviation');
                      triggerToast(isAr ? 'تمت محاكاة انحراف الشاحنة عن المسار ورصد التلاعب' : 'Simulated Route Deviation Tampering');
                    }}
                    className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 font-bold transition-all cursor-pointer text-start flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                    <span>{isAr ? 'محاكاة انحراف تلاعب' : 'Test Route Drift'}</span>
                  </button>

                  <button
                    onClick={() => {
                      simulateVehicleTampering(selectedVehicle.id, 'idle');
                      triggerToast(isAr ? 'تمت محاكاة توقف خامل مريب للسائق' : 'Simulated Suspicious Idle Stop');
                    }}
                    className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/60 font-bold transition-all cursor-pointer text-start flex items-center gap-1.5"
                  >
                    <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{isAr ? 'محاكاة توقف خامل' : 'Test Idle Stop'}</span>
                  </button>

                  <button
                    onClick={() => {
                      simulateVehicleTampering(selectedVehicle.id, 'shock');
                      triggerToast(isAr ? 'تمت محاكاة صدمة اهتزاز تعرض الكريستال للخطر' : 'Simulated Crystal Shock Hazard');
                    }}
                    className="p-2 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/60 font-bold transition-all cursor-pointer text-start flex items-center gap-1.5"
                  >
                    <Activity className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>{isAr ? 'محاكاة صدمة واهتزاز' : 'Test Cargo Shock'}</span>
                  </button>

                  <button
                    onClick={() => {
                      simulateVehicleTampering(selectedVehicle.id, 'door');
                      triggerToast(isAr ? 'تمت محاكاة فتح صندوق الكريستال خارج الموقع' : 'Simulated Vault Door Breach');
                    }}
                    className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 font-bold transition-all cursor-pointer text-start flex items-center gap-1.5"
                  >
                    <Unlock className="w-3 h-3 text-red-400 shrink-0" />
                    <span>{isAr ? 'محاكاة فتح الصندوق' : 'Test Vault Breach'}</span>
                  </button>
                </div>
              </div>

              {/* 4. In-Cab Direct Dispatcher Intervention */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#C5A45B]" />
                  <span>{isAr ? 'إرسال توجيه فوري لكابينة السائق:' : 'Direct In-Cab Voice & HUD Dispatch:'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inCabMessage}
                    onChange={(e) => setInCabMessage(e.target.value)}
                    placeholder={isAr ? 'اكتب توجيه السائق (مثال: عد للمسار فوراً)' : 'Type in-cab instruction...'}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#C5A45B]"
                  />
                  <button
                    onClick={() => {
                      if (inCabMessage.trim()) {
                        const res = sendDriverMessage(selectedVehicle.id, inCabMessage);
                        triggerToast(res.message);
                        setInCabMessage('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isAr ? 'إرسال' : 'Send'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <a
                    href={`tel:${selectedVehicle.driverPhone || '01008124910'}`}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{isAr ? 'اتصال فوري بالسائق' : 'Call Driver'}</span>
                  </a>

                  <a
                    href={`https://wa.me/${(selectedVehicle.driverPhone || '201008124910').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>{isAr ? 'محادثة واتساب' : 'WhatsApp'}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{isAr ? 'بروتوكول عصفور لتتبع الكريستال v2.6' : 'Asfour Crystal Tracking v2.6'}</span>
              <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
