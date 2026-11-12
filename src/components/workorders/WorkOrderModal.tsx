import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../../context/AppContext';
import { WorkOrder } from '../../types';
import { 
  EGYPT_GOVERNORATES, 
  searchEgyptianPlaces,
  autoDetectEgyptCoordinatesDetailed,
  EgyptLocationSuggestion,
  GeocodingResult
} from '../../utils/egyptGeocoding';
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
  Navigation,
  Compass,
  Maximize2,
  Minimize2,
  Search,
  Check
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
    orderToEdit?.timeWindowStart ? `${orderToEdit.timeWindowStart} - ${orderToEdit.timeWindowEnd}` : '09:00 - 13:00'
  );
  const [assignedVehicleId, setAssignedVehicleId] = useState(
    orderToEdit?.assignedVehicleId || vehicles[0]?.id || 'TRK-101'
  );

  // Smart Place Resolution States (NO raw numbers forced)
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [detectedPlaceTitle, setDetectedPlaceTitle] = useState<string>(
    orderToEdit?.locationNameAr || 'التجمع الخامس - القاهرة الجديدة'
  );
  const [detectedPlaceSubtitle, setDetectedPlaceSubtitle] = useState<string>(
    'محافظة القاهرة • نطاق العاصمة الكبرى'
  );
  const [detectedAccuracyLabel, setDetectedAccuracyLabel] = useState<string>(
    'محدد بدقة بالاسم'
  );
  const [isManualPinTuned, setIsManualPinTuned] = useState(false);

  // Suggestions & Map Expansion State
  const [suggestions, setSuggestions] = useState<EgyptLocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showTechnicalCoords, setShowTechnicalCoords] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const suggestionsBoxRef = useRef<HTMLDivElement>(null);

  // Popular quick location chips for 1-click select
  const quickLocations = [
    { label: isAr ? 'ميفيدا (التجمع)' : 'Mivida (Tagamoa)', query: 'كمبوند ميفيدا التجمع الخامس', gov: 'القاهرة' },
    { label: isAr ? 'هايد بارك' : 'Hyde Park', query: 'كمبوند هايد بارك شارع التسعين', gov: 'القاهرة' },
    { label: isAr ? 'بالم هيلز (زايد)' : 'Palm Hills (Zayed)', query: 'كمبوند بالم هيلز الشيخ زايد', gov: 'الجيزة' },
    { label: isAr ? 'بيفرلي هيلز' : 'Beverly Hills', query: 'كمبوند بيفرلي هيلز سوديك الشيخ زايد', gov: 'الجيزة' },
    { label: isAr ? 'العاصمة R5' : 'New Capital R5', query: 'الحي السكني الخامس R5 جاردن سيتي العاصمة الإدارية', gov: 'القاهرة' },
    { label: isAr ? 'مدينتي' : 'Madinaty', query: 'مدينتي مجموعة الفيلات', gov: 'القاهرة' },
    { label: isAr ? 'الرحاب' : 'Rehab City', query: 'مدينة الرحاب فيلات المرحلة الأولى', gov: 'القاهرة' },
    { label: isAr ? 'دجلة المعادي' : 'Maadi Degla', query: 'سرايات دجلة المعادي شارع 200', gov: 'القاهرة' },
    { label: isAr ? 'مراسي الساحل' : 'Marassi', query: 'قرية مراسي سيدي عبد الرحمن', gov: 'مطروح والساحل الشمالي' },
  ];

  // 1. Initialize Interactive Mini-Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = coordinates[0];
    const initialLng = coordinates[1];

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const customPinIcon = L.divIcon({
      className: 'asfour-crystal-modal-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="background: linear-gradient(135deg, #C5A45B, #DFBA6B); border: 2.5px solid #FFFFFF; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(197, 164, 91, 0.7);">
            <span style="font-size: 16px;">💎</span>
          </div>
          <div style="background: #090D16; color: #DFBA6B; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 6px; margin-top: 3px; border: 1px solid #C5A45B; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
            موقع التركيب
          </div>
        </div>
      `,
      iconSize: [80, 50],
      iconAnchor: [40, 25]
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: customPinIcon,
      draggable: true
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCoordinates([pos.lat, pos.lng]);
      setIsManualPinTuned(true);
      setDetectedAccuracyLabel(isAr ? 'تم ضبط النقطة يدوياً على الخريطة' : 'Manually Fine-Tuned on Map');
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setCoordinates([e.latlng.lat, e.latlng.lng]);
      setIsManualPinTuned(true);
      setDetectedAccuracyLabel(isAr ? 'تم ضبط النقطة يدوياً على الخريطة' : 'Manually Fine-Tuned on Map');
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Sync map center and marker when coordinates change externally
  const moveMapToCoordinates = (coords: [number, number], zoom = 15) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, { duration: 1.0 });
      markerRef.current.setLatLng(coords);
    }
  };

  // Close suggestions if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsBoxRef.current && !suggestionsBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions whenever user types in address
  const handleAddressChange = (val: string) => {
    setAddress(val);
    setIsManualPinTuned(false);
    if (val.trim().length >= 2) {
      const results = searchEgyptianPlaces(val, selectedGov);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select suggestion from dropdown
  const handleSelectSuggestion = (sug: EgyptLocationSuggestion) => {
    setAddress(`${sug.nameAr} - ${sug.areaAr}`);
    setCoordinates(sug.coordinates);
    setDetectedPlaceTitle(sug.nameAr);
    setDetectedPlaceSubtitle(`${sug.areaAr} • ${sug.categoryLabelAr}`);
    setDetectedAccuracyLabel(isAr ? 'محدد بدقة بالاسم (مستوى الكمبوند)' : 'Exact Named Place');
    setIsManualPinTuned(false);
    setShowSuggestions(false);

    // Auto-match governorate if needed
    if (sug.governorateAr) {
      const matchGov = EGYPT_GOVERNORATES.find(g => sug.governorateAr.includes(g.nameAr) || g.nameAr.includes(sug.governorateAr));
      if (matchGov) {
        setSelectedGov(matchGov.nameAr);
      }
    }

    moveMapToCoordinates(sug.coordinates, 16);
  };

  // Quick chip click handler
  const handleQuickChipClick = (chip: typeof quickLocations[0]) => {
    setSelectedGov(chip.gov);
    setAddress(chip.query);
    handleAddressChange(chip.query);
    setShowSuggestions(false);
  };

  // Auto-detect coordinates & rich named place whenever governorate or address stops typing
  useEffect(() => {
    if (!address.trim() && !selectedGov) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const result: GeocodingResult = await autoDetectEgyptCoordinatesDetailed(
          address || selectedGov, 
          selectedGov
        );
        if (isMounted) {
          setCoordinates(result.coordinates);
          setDetectedPlaceTitle(result.displayNameAr);
          setDetectedPlaceSubtitle(`${result.districtAr} • ${result.governorateAr}`);
          setDetectedAccuracyLabel(result.accuracyLabelAr);
          moveMapToCoordinates(result.coordinates, 15);
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

  // Submit order
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
      locationNameAr: address.trim() || detectedPlaceTitle || selectedGov,
      locationNameEn: address.trim() || detectedPlaceTitle || selectedGov,
      governorate: selectedGov,
      coordinates: coordinates,
      scheduledDate: scheduledDate,
      timeWindowStart: startH || '09:00',
      timeWindowEnd: endH || '13:00',
      estimatedDurationHours: 4.5,
      requiredSkillLevel: 5,
      requiredTechniciansCount: 3,
      requiresPneumaticTruck: true,
      requiresCraneLift: true,
      assignedVehicleId: assignedVehicleId,
      assignedTeamId: orderToEdit?.assignedTeamId || teams[0]?.id || 'TEAM-GOLD-01',
      anchorTestPassed: true,
      scaffoldingHeightM: 8.5,
      notesAr: `تركيب في: ${detectedPlaceTitle} (${selectedGov})`,
      notesEn: `Installation at: ${detectedPlaceTitle} (${selectedGov})`,
      customerLocationConfirmed: true,
      receivedLocationNote: isAr ? `محدد بالاسم: ${detectedPlaceTitle}` : `Named location: ${detectedPlaceTitle}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white dark:bg-[#0B101A] border-2 border-slate-200 dark:border-[#C5A45B]/40 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col gap-4 my-auto relative">
        
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A45B]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#C5A45B] to-[#DFBA6B] flex items-center justify-center text-[#0D131D] shadow-md shadow-[#C5A45B]/20">
              <FileCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? (isAr ? 'تعديل بيانات العميل وموقع التركيب' : 'Edit Client & Installation Site') : (isAr ? 'إضافة عميل وموقع تركيب جديد' : 'New Client & Installation Site')}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'تحديد دقيق للموقع بالاسم والكمبوند على الخريطة مباشرة' : 'Name-based location geocoding & interactive site pinpointing'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs relative z-10">
          
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
                placeholder={isAr ? 'مثال: فيلا المستشار أحمد فؤاد' : 'e.g. VIP Residence'}
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

          {/* Location & Smart Name-Based Resolution Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 relative shadow-inner">
            
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C5A45B]" />
                <span>{isAr ? 'الموقع والعنوان (تحديد تلقائي بالاسم والمكان):' : 'Location & Name-Based Site Resolution:'}</span>
              </span>

              {isGeocoding ? (
                <span className="text-[10px] text-blue-500 dark:text-blue-400 flex items-center gap-1 font-medium animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {isAr ? 'جاري البحث وإيجاد المكان...' : 'Searching place...'}
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isAr ? 'المكان محدد ومعتمد' : 'Place Verified'}
                </span>
              )}
            </div>

            {/* Quick 1-Click Popular Destination Chips */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isAr ? 'أماكن سريعة شائعة (اضغط للاختيار الفوري):' : 'Popular luxury sites (1-click select):'}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                {quickLocations.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickChipClick(chip)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800/80 hover:bg-[#C5A45B] hover:text-[#0D131D] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
                  >
                    💎 {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Governorate Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                {isAr ? 'اختر المحافظة (قائمة محافظات مصر):' : 'Select Governorate:'}
              </label>
              <select
                value={selectedGov}
                onChange={(e) => setSelectedGov(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B]"
              >
                {EGYPT_GOVERNORATES.map(gov => (
                  <option key={gov.id} value={gov.nameAr}>
                    {isAr ? gov.nameAr : gov.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Address Input with Live Smart Autocomplete */}
            <div className="flex flex-col gap-1 relative" ref={suggestionsBoxRef}>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center justify-between">
                <span>{isAr ? 'العنوان أو اسم الكمبوند الذي أخبرك به العميل:' : 'Address or Compound Name:'}</span>
                <span className="text-[10px] text-[#C5A45B]">
                  {isAr ? 'اكتب اسم الكمبوند أو الشارع للبحث الفوري' : 'Type compound or street name'}
                </span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => {
                    if (address.trim().length >= 2) {
                      const res = searchEgyptianPlaces(address, selectedGov);
                      setSuggestions(res);
                      setShowSuggestions(res.length > 0);
                    }
                  }}
                  placeholder={isAr ? 'مثال: كمبوند ميفيدا التجمع الخامس فيلا 14' : 'e.g. Mivida Compound, Villa 14, New Cairo'}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 pe-8 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B] transition-colors"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
              </div>

              {/* Autocomplete Dropdown List */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#0D131F] border border-[#C5A45B]/60 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-medium flex items-center justify-between">
                    <span>{isAr ? 'الأماكن والكمبوندات المطابقة:' : 'Matching Places:'}</span>
                    <span className="text-[#C5A45B]">{suggestions.length} {isAr ? 'نتائج دقيقة' : 'results'}</span>
                  </div>
                  {suggestions.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className="w-full p-2.5 text-right flex items-start gap-2.5 hover:bg-[#C5A45B]/15 border-b border-slate-100 dark:border-slate-800/60 transition-colors cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-[#C5A45B]/15 text-[#C5A45B] shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#DFBA6B] truncate">
                            {sug.nameAr}
                          </span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shrink-0">
                            {sug.categoryLabelAr}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                          {sug.areaAr} • {sug.governorateAr}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RESOLVED PLACE NAME DISPLAY (NO RAW NUMBERS!) */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0 shadow-sm">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isAr ? 'المكان الذي تم تحديده بالظبط بالاسم:' : 'Exact Named Place Resolved:'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate mt-0.5">
                    {detectedPlaceTitle}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {detectedPlaceSubtitle}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 gap-1">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {detectedAccuracyLabel}
                </span>
                {isManualPinTuned && (
                  <span className="text-[9px] text-[#C5A45B] font-mono">
                    {isAr ? 'تم تعديل النقطة يدوياً' : 'Pin fine-tuned'}
                  </span>
                )}
              </div>
            </div>

            {/* Interactive Leaflet Mini-Map Container with Pin Positioning */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A45B]" />
                  <span>{isAr ? 'معاينة الموقع وتثبيت النقطة على الخريطة (يمكنك سحب الدبوس):' : 'Interactive Map Pin (Click or drag pin to adjust):'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsMapExpanded(prev => !prev)}
                  className="text-[10px] text-[#C5A45B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isMapExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  <span>{isMapExpanded ? (isAr ? 'تصغير' : 'Collapse') : (isAr ? 'تكبير الخريطة' : 'Expand')}</span>
                </button>
              </div>

              <div 
                className={`w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-inner relative transition-all duration-300 ${
                  isMapExpanded ? 'h-64' : 'h-36'
                }`}
              >
                <div ref={mapContainerRef} className="w-full h-full z-0" />
                
                {/* Floating Map Status Overlay */}
                <div className="absolute top-2 right-2 z-[400] bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#C5A45B]/40 text-[10px] font-bold text-[#DFBA6B] shadow-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{detectedPlaceTitle}</span>
                </div>
              </div>
            </div>

            {/* Optional Discreet Technical GPS Drawer Toggle */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowTechnicalCoords(prev => !prev)}
                className="text-slate-500 hover:text-slate-400 underline cursor-pointer"
              >
                {showTechnicalCoords 
                  ? (isAr ? 'إخفاء الإحداثيات التقنية' : 'Hide technical coordinates') 
                  : (isAr ? 'عرض الإحداثيات الجغرافية التقنية (اختياري)' : 'Show technical coordinates (optional)')}
              </button>
              <span className="font-mono text-emerald-500 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {isAr ? 'جاهز للتوجيه الملاحي للشاحنة' : 'Fleet Routing Ready'}
              </span>
            </div>

            {/* Collapsed Technical Coordinates (hidden by default) */}
            {showTechnicalCoords && (
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>GPS: {coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}</span>
                <span className="text-[9px] text-slate-500">WGS84 EPSG:4326</span>
              </div>
            )}
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
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#C5A45B] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                {isAr ? 'شاحنة النقل المجهزة:' : 'Assigned Truck:'}
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
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[#C5A45B] to-[#DFBA6B] hover:from-[#DFBA6B] hover:to-[#C5A45B] text-[#0D131D] flex items-center gap-2 shadow-lg shadow-[#C5A45B]/25 cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{isEditing ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'تثبيت وحفظ أمر العمل' : 'Save & Confirm Order')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
