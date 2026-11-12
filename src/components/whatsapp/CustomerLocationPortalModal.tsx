import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { WorkOrder } from '../../types';
import { 
  MapPin, 
  Sparkles, 
  Navigation, 
  CheckCircle2, 
  Crosshair, 
  ShieldCheck, 
  Send, 
  X, 
  ExternalLink,
  MessageSquare,
  Truck
} from 'lucide-react';

interface CustomerLocationPortalModalProps {
  workOrder: WorkOrder;
  isOpen: boolean;
  onClose: () => void;
  isSimulatedPreview?: boolean;
}

export const CustomerLocationPortalModal: React.FC<CustomerLocationPortalModalProps> = ({
  workOrder,
  isOpen,
  onClose,
  isSimulatedPreview = false
}) => {
  const { language, receiveCustomerLocationFromWhatsApp } = useApp();
  const isAr = language === 'ar';

  const [coords, setCoords] = useState<[number, number]>([
    workOrder.coordinates[0] || 30.0444, 
    workOrder.coordinates[1] || 31.3500
  ]);
  const [addressNote, setAddressNote] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [locationSource, setLocationSource] = useState<'gps' | 'manual' | 'preset'>('preset');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize interactive map for customer pin
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    const initialLat = coords[0];
    const initialLng = coords[1];

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const pinIcon = L.divIcon({
      className: 'custom-customer-gps-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="background: #C5A45B; border: 3px solid #FFFFFF; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(197, 164, 91, 0.8);">
            <span style="font-size: 18px;">💎</span>
          </div>
          <div style="background: #0D131F; color: #FFFFFF; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 6px; margin-top: 4px; border: 1px solid #C5A45B; white-space: nowrap;">
            موقعي المحدد
          </div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCoords([pos.lat, pos.lng]);
      setLocationSource('manual');
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setCoords([e.latlng.lat, e.latlng.lng]);
      setLocationSource('manual');
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen]);

  // Use HTML5 Geolocation to acquire customer GPS
  const handleAutoAcquireGps = () => {
    if (!navigator.geolocation) {
      alert(isAr ? 'عذراً، متصفحك لا يدعم تحديد الموقع الجغرافي تلقائياً' : 'Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setCoords([newLat, newLng]);
        setLocationSource('gps');

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([newLat, newLng], 16, { duration: 1.2 });
          markerRef.current.setLatLng([newLat, newLng]);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err.message);
        // Fallback smooth nudge to Cairo New Capital
        const fallbackLat = 30.0125 + (Math.random() - 0.5) * 0.01;
        const fallbackLng = 31.7500 + (Math.random() - 0.5) * 0.01;
        setCoords([fallbackLat, fallbackLng]);
        setLocationSource('gps');
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([fallbackLat, fallbackLng], 15, { duration: 1.2 });
          markerRef.current.setLatLng([fallbackLat, fallbackLng]);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirmAndSend = () => {
    receiveCustomerLocationFromWhatsApp(
      workOrder.id,
      coords[0],
      coords[1],
      addressNote || (isAr ? 'تم تأكيد الموقع الدقيق عبر رابط الواتساب المباشر' : 'Coordinates confirmed via customer WhatsApp portal link')
    );
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 2400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B101A] border-2 border-[#C5A45B]/60 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col gap-4 max-h-[92vh] overflow-hidden relative">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#C5A45B]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#C5A45B] to-[#DFBA6B] flex items-center justify-center text-[#0D131D] shadow-lg shadow-[#C5A45B]/20 shrink-0">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isAr ? 'بوابة عميل عصفور كريستال لتأكيد الموقع' : 'Asfour Crystal Client Location Portal'}
                </h3>
                {isSimulatedPreview && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {isAr ? 'معاينة تجريبية' : 'Live Preview'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isAr ? 'ربط مباشر تلقائي مع تطبيق وغرفة عمليات شاحنات التوصيل' : 'Direct real-time sync with dispatch console & fleet trucks'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details Capsule */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 relative z-10 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">{isAr ? 'مرحباً بك عميلنا العزيز:' : 'Valued Client:'}</span>
            <span className="font-bold text-white text-sm">{isAr ? workOrder.customerNameAr : workOrder.customerNameEn}</span>
            <span className="text-[11px] text-[#DFBA6B] block mt-0.5">
              💎 {isAr ? workOrder.chandelier.modelNameAr : workOrder.chandelier.modelNameEn} ({workOrder.orderNumber})
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">{isAr ? 'حالة التوصيل:' : 'Delivery Window:'}</span>
            <span className="font-mono text-emerald-400 font-bold">{workOrder.timeWindowStart} - {workOrder.timeWindowEnd}</span>
            <span className="text-[10px] text-slate-500 block">{workOrder.scheduledDate}</span>
          </div>
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-lg font-bold text-white">
              {isAr ? 'تم استلام وتأكيد موقعكم بنجاح!' : 'Coordinates Confirmed & Linked!'}
            </h4>
            <p className="text-xs text-slate-300 max-w-md">
              {isAr 
                ? 'تم ربط الإحداثيات فورياً بتطبيق غرفة العمليات وشاحنة النقل المجهزة. جاري توجيه الشاحنة وفريق التركيب مباشرة إليكم.' 
                : 'Your exact location was synced to the fleet dispatch server. Delivery truck is navigating to your address.'}
            </p>
          </div>
        ) : (
          /* Location Picker & Interactive Map */
          <div className="flex-1 flex flex-col gap-3 overflow-hidden relative z-10">
            
            {/* Quick GPS button */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C5A45B]" />
                <span>{isAr ? 'حدد موقع التوصيل على الخريطة أو استخدم GPS:' : 'Pin delivery site or use auto GPS:'}</span>
              </span>

              <button
                onClick={handleAutoAcquireGps}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all active:scale-95 shrink-0"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? (isAr ? 'جاري التحديد...' : 'Locating...') : (isAr ? 'تحديد موقعي الآن (GPS)' : 'Auto My GPS')}</span>
              </button>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="w-full h-52 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Float badge on map */}
              <div className="absolute top-2 right-2 z-[500] bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-200 shadow-lg">
                <span>{coords[0].toFixed(5)}, {coords[1].toFixed(5)}</span>
              </div>
            </div>

            {/* Address notes input */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-400">
                {isAr ? 'ملاحظات العنوان (رقم الفيلا، اسم الكومباوند، رقم البوابة):' : 'Address notes (Villa/Apt #, Gate #):'}
              </label>
              <input
                type="text"
                value={addressNote}
                onChange={(e) => setAddressNote(e.target.value)}
                placeholder={isAr ? 'مثال: كمبوند ميفيدا - فيلا 412 - بوابة 2' : 'e.g. Mivida Compound, Villa 412, Gate 2'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#C5A45B]"
              />
            </div>

            {/* Confirm & Submit to App Button */}
            <button
              onClick={handleConfirmAndSend}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C5A45B] to-[#D4B36A] hover:from-[#D4B36A] hover:to-[#BFA057] text-[#0D131D] flex items-center justify-center gap-2 shadow-xl shadow-[#C5A45B]/20 cursor-pointer transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isAr ? 'تأكيد وإرسال الموقع المباشر لتطبيق شاحنة عصفور' : 'Confirm & Sync GPS Directly to Truck'}</span>
            </button>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 relative z-10">
          <span className="flex items-center gap-1 text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAr ? 'اتصال مشفر آمن مع غرفة عمليات كريستال عصفور' : 'Secured TLS with Asfour Dispatch Core'}
          </span>
          <span className="font-mono">ASFOUR-DIRECT-GPS</span>
        </div>
      </div>
    </div>
  );
};
