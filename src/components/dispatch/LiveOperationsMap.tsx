import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { Vehicle, WorkOrder } from '../../types';
import { BRANCHES } from '../../data/mockData';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Layers, 
  Clock, 
  Compass, 
  Send,
  MessageSquare,
  X,
  ExternalLink,
  Target,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface LiveOperationsMapProps {
  onSelectWorkOrder: (wo: WorkOrder) => void;
  onSelectVehicle: (v: Vehicle) => void;
}

export const LiveOperationsMap: React.FC<LiveOperationsMapProps> = ({ onSelectWorkOrder, onSelectVehicle }) => {
  const { 
    language, 
    vehicles, 
    workOrders, 
    theme,
    sendCustomerLocationRequestWhatsApp,
    issueDeliveryDispatchOrder,
    openCustomerLocationPortal,
    parseAndLinkWhatsAppMessage,
    isFirebaseSynced,
    firestoreLastSyncTime
  } = useApp();

  const isAr = language === 'ar';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapLayerType, setMapLayerType] = useState<'dark' | 'streets' | 'satellite'>('dark');
  const [selectedMapVehicle, setSelectedMapVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const [selectedMapWo, setSelectedMapWo] = useState<WorkOrder | null>(workOrders[0] || null);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  // Hidden by default to avoid cluttering the map view as requested
  const [isMenuExpanded, setIsMenuExpanded] = useState<boolean>(false);
  const [isPasteBoxOpen, setIsPasteBoxOpen] = useState<boolean>(false);
  const [pasteWaInput, setPasteWaInput] = useState<string>('');

  // Initialize real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center on Cairo / New Capital
    const map = L.map(mapContainerRef.current, {
      center: [30.0444, 31.3500],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // Add zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Click on map to capture exact GPS coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer based on selection and theme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Watermark-free, high-speed tile providers
    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    let subdomains = 'abc';

    if (mapLayerType === 'streets') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    } else if (mapLayerType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abc';
    } else if (theme === 'light' && mapLayerType === 'dark') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains,
    });
    tileLayer.addTo(map);
    tileLayer.bringToBack();
  }, [mapLayerType, theme]);

  // Render Real Markers and Polylines whenever data updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routeLayer = routeLayerRef.current;
    if (!map || !markersLayer || !routeLayer) return;

    markersLayer.clearLayers();
    routeLayer.clearLayers();

    // 1. Asfour Factory & Depots Markers
    BRANCHES.forEach(branch => {
      const depotIcon = L.divIcon({
        className: 'custom-depot-pin',
        html: `
          <div style="background: rgba(197, 164, 91, 0.95); color: #0d131d; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 10px; border: 2px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>🏛️</span>
            <span>${isAr ? branch.nameAr.split(' ')[0] : branch.city}</span>
          </div>
        `,
        iconSize: [100, 30],
        iconAnchor: [50, 15]
      });

      const marker = L.marker([branch.coordinates[0], branch.coordinates[1]], { icon: depotIcon });
      marker.bindPopup(`
        <div style="font-family: Cairo, sans-serif; direction: ${isAr ? 'rtl' : 'ltr'}; padding: 4px;">
          <b style="color: #947125;">${isAr ? branch.nameAr : branch.nameEn}</b>
          <div style="font-size: 11px; margin-top: 4px;">${branch.city}</div>
          <div style="font-size: 10px; color: #64748b;">[${branch.coordinates[0].toFixed(4)}, ${branch.coordinates[1].toFixed(4)}]</div>
        </div>
      `);
      markersLayer.addLayer(marker);
    });

    // 2. Customer Delivery Sites Markers (Diamond Pins)
    workOrders.forEach(wo => {
      const isSelected = selectedMapWo?.id === wo.id;
      const isLocationConfirmed = wo.customerLocationConfirmed;
      const isDispatched = wo.status === 'en_route';

      const customerIcon = L.divIcon({
        className: 'custom-customer-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;">
            <div style="background: ${isDispatched ? '#3B82F6' : isLocationConfirmed ? '#10B981' : '#C5A45B'}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFFFF; box-shadow: 0 0 15px ${isLocationConfirmed ? 'rgba(16, 185, 129, 0.7)' : 'rgba(197, 164, 91, 0.6)'};">
              <span style="font-size: 16px;">💎</span>
            </div>
            <div style="background: rgba(13, 19, 31, 0.95); color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; margin-top: 3px; white-space: nowrap; border: 1px solid rgba(197, 164, 91, 0.4); text-shadow: 0 1px 2px #000;">
              ${isAr ? wo.customerNameAr.split(' - ')[0] : wo.customerNameEn.split(' - ')[0]}
            </div>
          </div>
        `,
        iconSize: [80, 50],
        iconAnchor: [40, 25]
      });

      const marker = L.marker([wo.coordinates[0], wo.coordinates[1]], { icon: customerIcon });
      marker.on('click', () => {
        setSelectedMapWo(wo);
        onSelectWorkOrder(wo);
      });

      // Add geofence pulsing circle
      const circle = L.circle([wo.coordinates[0], wo.coordinates[1]], {
        radius: isLocationConfirmed ? 350 : 600,
        color: isLocationConfirmed ? '#10B981' : '#C5A45B',
        fillColor: isLocationConfirmed ? '#10B981' : '#C5A45B',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: isLocationConfirmed ? undefined : '4, 4'
      });
      markersLayer.addLayer(circle);
      markersLayer.addLayer(marker);

      // 3. If delivery order is dispatched, draw polyline from truck to customer
      if (wo.assignedVehicleId && (wo.status === 'en_route' || wo.dispatchOrderGiven)) {
        const assignedTruck = vehicles.find(v => v.id === wo.assignedVehicleId);
        if (assignedTruck) {
          const latlngs: L.LatLngExpression[] = [
            [assignedTruck.currentLat, assignedTruck.currentLng],
            [
              (assignedTruck.currentLat + wo.coordinates[0]) / 2 + 0.015,
              (assignedTruck.currentLng + wo.coordinates[1]) / 2 - 0.01
            ],
            [wo.coordinates[0], wo.coordinates[1]]
          ];

          const polyline = L.polyline(latlngs, {
            color: '#3B82F6',
            weight: 4,
            opacity: 0.85,
            dashArray: '8, 6'
          });
          routeLayer.addLayer(polyline);
        }
      }
    });

    // 4. Moving Fleet Vehicles Markers
    vehicles.forEach(v => {
      const isSelected = selectedMapVehicle?.id === v.id;
      const isOnRoute = v.status === 'on_route';
      const isAlert = v.driverDiligenceStatus && v.driverDiligenceStatus !== 'diligent';

      let pinBg = isSelected ? '#C5A45B' : isOnRoute ? '#2563EB' : '#334155';
      if (isAlert) pinBg = '#EF4444';

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s; position: relative;">
            ${isAlert ? `
              <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: #EF4444; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; top: -5px;"></div>
            ` : ''}

            <div style="background: ${pinBg}; color: #FFFFFF; padding: 4px 8px; border-radius: 8px; border: 2px solid ${isSelected ? '#FFFFFF' : isAlert ? '#FCA5A5' : '#60A5FA'}; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; font-weight: bold; font-size: 11px; font-family: monospace;">
              <span>🚚</span>
              <span>${v.id.replace('TRK-', '')}</span>
              ${v.cargoLockSecured === false ? '<span style="color: #FEE2E2;">🔓</span>' : ''}
            </div>

            <div style="background: rgba(13, 19, 31, 0.95); color: ${isAlert ? '#FCA5A5' : '#93C5FD'}; border: 1px solid ${isAlert ? '#EF4444' : '#1D4ED8'}; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 3px; margin-top: 2px; font-family: monospace; display: flex; align-items: center; gap: 2px;">
              <span>${v.speedKmH}km/h</span>
              <span>•</span>
              <span>${v.driverDiligenceScore || 95}%</span>
            </div>
          </div>
        `,
        iconSize: [80, 50],
        iconAnchor: [40, 25]
      });

      const marker = L.marker([v.currentLat, v.currentLng], { icon: vehicleIcon });
      marker.on('click', () => {
        setSelectedMapVehicle(v);
        onSelectVehicle(v);
      });
      markersLayer.addLayer(marker);
    });
  }, [vehicles, workOrders, selectedMapVehicle, selectedMapWo, isAr]);

  // Fly to region helper
  const handleFlyTo = (lat: number, lng: number, zoom = 13) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 });
  };

  const handleCopyCoords = (lat: number, lng: number) => {
    navigator.clipboard?.writeText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    setToastMsg(isAr ? 'تم نسخ الإحداثيات بنجاح' : 'Coordinates copied to clipboard');
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-2xl relative">
      {/* Map Header / Floating Controls (Permanently Visible & Mobile-Optimized) */}
      <div className="absolute top-2 inset-x-2 sm:top-3 sm:inset-x-3 z-[1000] flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        {/* Title Badge (Responsive on all phones) */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto bg-white/95 dark:bg-[#0A0E17]/95 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100">
          <Navigation className="w-3.5 h-3.5 text-[#C5A45B] shrink-0" />
          <span className="truncate max-w-[150px] sm:max-w-none">{isAr ? 'خريطة العمليات الحية' : 'Live Fleet GPS'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>

        {/* Action Controls Group: Always-Visible Layer Switcher + Collapsible Cities Trigger */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* ALWAYS VISIBLE MAP LAYER SWITCHER (رادار | شوارع | قمر صناعي) */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-[#0A0E17]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl">
            <button
              onClick={() => setMapLayerType('dark')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                mapLayerType === 'dark'
                  ? 'bg-[#C5A45B] text-[#0D131D] shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'رادار' : 'Dark'}
            </button>
            <button
              onClick={() => setMapLayerType('streets')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                mapLayerType === 'streets'
                  ? 'bg-[#C5A45B] text-[#0D131D] shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'شوارع' : 'Streets'}
            </button>
            <button
              onClick={() => setMapLayerType('satellite')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                mapLayerType === 'satellite'
                  ? 'bg-[#C5A45B] text-[#0D131D] shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'قمر صناعي' : 'Satellite'}
            </button>
          </div>

          {/* Cloud Firebase Real-Time Sync Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#0A0E17]/95 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 shadow-xl">
            <span className={`w-2 h-2 rounded-full ${isFirebaseSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold">{isFirebaseSynced ? (isAr ? 'مزامنة الفيربيس نشطة' : 'Firestore Live') : (isAr ? 'ربط محلي' : 'Local')}</span>
            {firestoreLastSyncTime && <span className="text-slate-400 font-mono text-[9px]">({firestoreLastSyncTime})</span>}
          </div>

          {/* Collapsible City Navigation Toggle Button (Prevents map clutter) */}
          <button
            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-200 text-[11px] sm:text-xs font-bold cursor-pointer ${
              isMenuExpanded
                ? 'bg-[#C5A45B] text-[#0D131D] border-[#C5A45B]'
                : 'bg-white/95 dark:bg-[#0A0E17]/95 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#C5A45B]'
            }`}
            title={isAr ? 'عرض أو إخفاء قائمة المدن' : 'Toggle Cities List'}
          >
            <MapPin className="w-3.5 h-3.5 text-[#C5A45B]" />
            <span className="hidden xs:inline">{isAr ? 'المدن (5)' : 'Cities (5)'}</span>
            <span className="xs:hidden">{isAr ? 'المدن' : 'Cities'}</span>
            {isMenuExpanded ? (
              <EyeOff className="w-3 h-3 text-[#0D131D]" />
            ) : (
              <Eye className="w-3 h-3 text-[#C5A45B]" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Floating Cities Pill List (Only visible when toggled to avoid cluttering the map) */}
      {isMenuExpanded && (
        <div className="absolute top-14 right-2 sm:right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto w-44 sm:w-52 max-w-[80vw] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-white/95 dark:bg-[#0F141F]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[10px] sm:text-xs text-slate-400 shadow-md">
            <span className="font-bold text-[#8E6A23] dark:text-[#DFBA6B] flex items-center gap-1">
              <Compass className="w-3 h-3" />
              <span>{isAr ? 'الانتقال السريع للمدينة' : 'Quick City Jump'}</span>
            </span>
            <button
              onClick={() => setIsMenuExpanded(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {[
            { labelAr: 'القاهرة الجديدة', labelEn: 'New Cairo', lat: 30.0131, lng: 31.4989 },
            { labelAr: 'العاصمة الإدارية', labelEn: 'New Capital', lat: 30.0125, lng: 31.7500 },
            { labelAr: 'الشيخ زايد', labelEn: 'Sheikh Zayed', lat: 30.0543, lng: 30.9856 },
            { labelAr: 'العاشر من رمضان', labelEn: '10th of Ramadan', lat: 30.3012, lng: 31.7485 },
            { labelAr: 'الإسكندرية', labelEn: 'Alexandria', lat: 31.2001, lng: 29.9187 }
          ].map(r => (
            <button
              key={r.labelEn}
              onClick={() => {
                handleFlyTo(r.lat, r.lng, 12);
                setIsMenuExpanded(false); // auto-collapse on selection for maximum clean map view
              }}
              className="w-full py-2 px-3 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-[#10192e]/95 hover:bg-[#C5A45B] hover:text-[#0D131D] dark:hover:bg-[#17233e] dark:hover:border-[#C5A45B] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#243556] text-[11px] sm:text-xs font-bold shadow-lg transition-all cursor-pointer text-center active:scale-98"
            >
              {isAr ? r.labelAr : r.labelEn}
            </button>
          ))}
        </div>
      )}

      {/* Real Leaflet Map Container */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-20 inset-x-0 mx-auto w-max z-[1001] bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-2xl animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* Clicked Map Coordinates Display Tooltip */}
      {clickedCoords && (
        <div className="absolute top-16 left-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl text-xs flex flex-col gap-1.5 max-w-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#8E6A23] dark:text-[#DFBA6B] flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>{isAr ? 'الإحداثيات الحقيقية المحددة:' : 'Inspected GPS Pin:'}</span>
            </span>
            <button onClick={() => setClickedCoords(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span>{clickedCoords.lat.toFixed(5)}, {clickedCoords.lng.toFixed(5)}</span>
            <button 
              onClick={() => handleCopyCoords(clickedCoords.lat, clickedCoords.lng)}
              className="text-[10px] text-[#C5A45B] hover:underline"
            >
              {isAr ? 'نسخ' : 'Copy'}
            </button>
          </div>

          <a
            href={`https://www.google.com/maps?q=${clickedCoords.lat},${clickedCoords.lng}`}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{isAr ? 'فتح على خرائط Google' : 'Open in Google Maps'}</span>
          </a>
        </div>
      )}

      {/* Floating Customer Location & Vehicle Dispatch Panel (Bottom - Mobile Responsive) */}
      {selectedMapWo && (
        <div className="absolute bottom-2 inset-x-2 sm:inset-x-auto sm:bottom-3 sm:left-3 sm:w-96 max-h-[48vh] overflow-y-auto z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#C5A45B]/20 border border-[#C5A45B]/40 flex items-center justify-center text-[#8E6A23] dark:text-[#DFBA6B] shrink-0">
                💎
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{isAr ? selectedMapWo.customerNameAr : selectedMapWo.customerNameEn}</span>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                    {selectedMapWo.orderNumber}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-60">
                  {isAr ? selectedMapWo.locationNameAr : selectedMapWo.locationNameEn}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMapWo(null)}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Coordinates & WhatsApp Status */}
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#C5A45B]" />
              <span>{selectedMapWo.coordinates[0].toFixed(4)}, {selectedMapWo.coordinates[1].toFixed(4)}</span>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              selectedMapWo.customerLocationConfirmed
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}>
              {selectedMapWo.customerLocationConfirmed ? (isAr ? '📍 لوكيشن مؤكد' : '📍 Verified GPS') : (isAr ? '⏳ بانتظار اللوكيشن' : '⏳ Awaiting Pin')}
            </span>
          </div>

          {/* Received Location Note or Source if present */}
          {selectedMapWo.receivedLocationNote && (
            <div className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-2 rounded-xl border border-emerald-500/20 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-500" />
              <span>{selectedMapWo.receivedLocationNote}</span>
            </div>
          )}

          {/* Actions Row 1: WhatsApp Location Request & Direct Portal Preview */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const res = sendCustomerLocationRequestWhatsApp(selectedMapWo.id);
                if (res.url) window.open(res.url, '_blank');
              }}
              className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-colors"
              title={isAr ? 'إرسال رابط تأكيد اللوكيشن للعميل عبر واتساب' : 'Send WhatsApp Location Request Link'}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isAr ? 'طلب لوكيشن (واتساب)' : 'Send WA Req'}</span>
            </button>

            <button
              onClick={() => openCustomerLocationPortal(selectedMapWo.id)}
              className="py-2 px-3 rounded-xl bg-[#C5A45B]/20 hover:bg-[#C5A45B]/30 text-[#8E6A23] dark:text-[#DFBA6B] border border-[#C5A45B]/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              title={isAr ? 'فتح صفحة العميل المباشرة لاختبار تثبيت الموقع' : 'Open Direct Customer Location Portal'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{isAr ? '🔗 رابط العميل' : '🔗 Portal'}</span>
            </button>

            <button
              onClick={() => setIsPasteBoxOpen(!isPasteBoxOpen)}
              className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                isPasteBoxOpen
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
              }`}
              title={isAr ? 'لصق واستخراج الإحداثيات من رسالة الواتساب تلقائياً' : 'Paste & Auto-Parse WhatsApp Location'}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{isAr ? 'لصق موقع' : 'Paste'}</span>
            </button>
          </div>

          {/* Collapsible Quick-Paste WhatsApp Location Parser */}
          {isPasteBoxOpen && (
            <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-blue-500/40 flex flex-col gap-2 animate-in fade-in duration-150">
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>{isAr ? '📥 لصق رسالة أو رابط خرائط واتساب لربطه فوراً:' : '📥 Paste WhatsApp message or Google Maps link:'}</span>
                <button onClick={() => setIsPasteBoxOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={pasteWaInput}
                  onChange={(e) => setPasteWaInput(e.target.value)}
                  placeholder={isAr ? 'مثال: https://maps.google.com/?q=30.012,31.498 أو 30.012, 31.498' : 'Paste link or lat, lng coordinates here...'}
                  className="flex-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pasteWaInput.trim()) {
                      const res = parseAndLinkWhatsAppMessage(selectedMapWo.id, pasteWaInput);
                      setToastMsg(res.message);
                      setTimeout(() => setToastMsg(null), 3500);
                      if (res.success) {
                        setPasteWaInput('');
                        setIsPasteBoxOpen(false);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (!pasteWaInput.trim()) return;
                    const res = parseAndLinkWhatsAppMessage(selectedMapWo.id, pasteWaInput);
                    setToastMsg(res.message);
                    setTimeout(() => setToastMsg(null), 3500);
                    if (res.success) {
                      setPasteWaInput('');
                      setIsPasteBoxOpen(false);
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold cursor-pointer shrink-0"
                >
                  {isAr ? 'ربط فوري' : 'Link'}
                </button>
              </div>
              <span className="text-[9px] text-slate-500 dark:text-slate-400">
                {isAr ? '⚡ يستخرج خط الطول والعرض تلقائياً ويثبته بالخريطة ويحفظه في الفيربيس.' : '⚡ Extracts coordinates, updates map pin, and saves to Firestore.'}
              </span>
            </div>
          )}

          {/* Actions Row 2: Vehicle Dispatch Order */}
          <button
            onClick={() => {
              const res = issueDeliveryDispatchOrder(selectedMapWo.id);
              setToastMsg(res.message);
              setTimeout(() => setToastMsg(null), 3000);
            }}
            disabled={selectedMapWo.status === 'en_route'}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors ${
              selectedMapWo.status === 'en_route'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 cursor-default'
                : 'bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-[#C5A45B]/20'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{selectedMapWo.status === 'en_route' ? (isAr ? 'الشاحنة بالطريق للعميل' : 'En Route to Client') : (isAr ? 'أمر التوصيل للشاحنة' : 'Issue Dispatch Order')}</span>
          </button>

          {/* Open in Google Maps Navigation */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMapWo.coordinates[0]},${selectedMapWo.coordinates[1]}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-center text-blue-500 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 pt-0.5"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{isAr ? 'فتح المسار والملاحة في Google Maps للسيارة' : 'Open Navigation Route in Google Maps'}</span>
          </a>
        </div>
      )}
    </div>
  );
};
