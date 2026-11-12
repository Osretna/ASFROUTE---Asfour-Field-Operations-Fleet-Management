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
    issueDeliveryDispatchOrder
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

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';

    if (mapLayerType === 'streets') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    } else if (mapLayerType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abc';
    } else if (theme === 'light' && mapLayerType === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
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

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;">
            <div style="background: ${isSelected ? '#C5A45B' : isOnRoute ? '#2563EB' : '#334155'}; color: #FFFFFF; padding: 4px 8px; border-radius: 8px; border: 2px solid ${isSelected ? '#FFFFFF' : '#60A5FA'}; box-shadow: 0 4px 14px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; font-weight: bold; font-size: 11px; font-family: monospace;">
              <span>🚚</span>
              <span>${v.id.replace('TRK-', '')}</span>
            </div>
            ${isOnRoute ? `
              <div style="background: #1D4ED8; color: #93C5FD; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 3px; margin-top: 2px; font-family: monospace;">
                ${v.speedKmH} km/h
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [70, 45],
        iconAnchor: [35, 22]
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
      {/* Map Header / Floating Controls */}
      <div className="absolute top-3 inset-x-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Title Badge */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs font-bold text-slate-800 dark:text-slate-100">
          <Navigation className="w-4 h-4 text-[#C5A45B]" />
          <span>{isAr ? 'خريطة العمليات الحية (نظام ملاحة متفاعل)' : 'Interactive Live Fleet & Customer GPS Radar'}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
        </div>

        {/* Toggle Button when menu is hidden (Keeps map uncluttered by default) */}
        {!isMenuExpanded && (
          <button
            onClick={() => setIsMenuExpanded(true)}
            className="pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/95 dark:bg-[#0f172a]/95 hover:dark:bg-[#162035] backdrop-blur-md border border-slate-200 dark:border-[#263756] hover:border-[#C5A45B] text-slate-800 dark:text-slate-100 shadow-xl transition-all duration-200 text-xs font-bold group cursor-pointer"
            title={isAr ? 'إظهار قوائم الطبقات والمدن' : 'Show Map Layers & Cities'}
          >
            <Layers className="w-3.5 h-3.5 text-[#C5A45B] group-hover:rotate-12 transition-transform" />
            <span>{isAr ? 'عرض القوائم والمدن' : 'Map Controls'}</span>
            <Eye className="w-3.5 h-3.5 text-[#C5A45B]" />
          </button>
        )}
      </div>

      {/* Expanded Floating Menu Widget (Shown only when toggled) */}
      {isMenuExpanded && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2 pointer-events-auto max-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header & Close Button */}
          <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-slate-200 dark:border-[#263756] text-xs shadow-md">
            <span className="text-[11px] font-bold text-[#8E6A23] dark:text-[#DFBA6B] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#C5A45B]" />
              <span>{isAr ? 'طبقات ومدن الخريطة' : 'Layers & Cities'}</span>
            </span>
            <button
              onClick={() => setIsMenuExpanded(false)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'إخفاء القوائم لتفريغ الخريطة' : 'Hide menus'}
            >
              <EyeOff className="w-3 h-3 text-[#C5A45B]" />
              <span>{isAr ? 'إخفاء' : 'Hide'}</span>
            </button>
          </div>

          {/* Tile Layer Selector Pills (رادار | شوارع | قمر صناعي) */}
          <div className="flex items-center justify-between p-1 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-slate-200 dark:border-[#263756] shadow-xl w-full">
            <button
              onClick={() => setMapLayerType('dark')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                mapLayerType === 'dark'
                  ? 'bg-[#C5A45B] text-[#0D131D] shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'رادار' : 'Dark'}
            </button>
            <button
              onClick={() => setMapLayerType('streets')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                mapLayerType === 'streets'
                  ? 'bg-[#C5A45B] text-[#0D131D] shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'شوارع' : 'Streets'}
            </button>
            <button
              onClick={() => setMapLayerType('satellite')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                mapLayerType === 'satellite'
                  ? 'bg-[#C5A45B] text-[#0D131D] shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-white'
              }`}
            >
              {isAr ? 'قمر صناعي' : 'Satellite'}
            </button>
          </div>

          {/* Region Quick Zoom Vertical Pill Stack */}
          <div className="flex flex-col gap-1.5 w-full">
            {[
              { labelAr: 'القاهرة الجديدة', labelEn: 'New Cairo', lat: 30.0131, lng: 31.4989 },
              { labelAr: 'العاصمة الإدارية', labelEn: 'New Capital', lat: 30.0125, lng: 31.7500 },
              { labelAr: 'الشيخ زايد', labelEn: 'Sheikh Zayed', lat: 30.0543, lng: 30.9856 },
              { labelAr: 'العاشر من رمضان', labelEn: '10th of Ramadan', lat: 30.3012, lng: 31.7485 },
              { labelAr: 'الإسكندرية', labelEn: 'Alexandria', lat: 31.2001, lng: 29.9187 }
            ].map(r => (
              <button
                key={r.labelEn}
                onClick={() => handleFlyTo(r.lat, r.lng, 12)}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/90 dark:bg-[#10192e]/95 hover:bg-[#C5A45B] hover:text-[#0D131D] dark:hover:bg-[#17233e] dark:hover:border-[#C5A45B] text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-[#243556] text-xs font-bold shadow-lg transition-all cursor-pointer text-center"
              >
                {isAr ? r.labelAr : r.labelEn}
              </button>
            ))}
          </div>
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

      {/* Floating Customer Location & Vehicle Dispatch Panel (Bottom) */}
      {selectedMapWo && (
        <div className="absolute bottom-3 left-3 right-3 lg:right-auto lg:w-96 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col gap-3">
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

          {/* Actions: WhatsApp Location Request & Vehicle Dispatch */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const res = sendCustomerLocationRequestWhatsApp(selectedMapWo.id);
                if (res.url) window.open(res.url, '_blank');
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isAr ? 'طلب اللوكيشن (واتساب)' : 'Send WhatsApp Req'}</span>
            </button>

            <button
              onClick={() => {
                const res = issueDeliveryDispatchOrder(selectedMapWo.id);
                setToastMsg(res.message);
                setTimeout(() => setToastMsg(null), 3000);
              }}
              disabled={selectedMapWo.status === 'en_route'}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors ${
                selectedMapWo.status === 'en_route'
                  ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 cursor-default'
                  : 'bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-[#C5A45B]/20'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{selectedMapWo.status === 'en_route' ? (isAr ? 'الشاحنة بالطريق' : 'En Route') : (isAr ? 'أمر التوصيل للشاحنة' : 'Issue Dispatch Order')}</span>
            </button>
          </div>

          {/* Open in Google Maps Navigation */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMapWo.coordinates[0]},${selectedMapWo.coordinates[1]}`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-center text-blue-500 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 pt-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{isAr ? 'فتح المسار والملاحة في Google Maps للسيارة' : 'Open Navigation Route in Google Maps'}</span>
          </a>
        </div>
      )}
    </div>
  );
};
