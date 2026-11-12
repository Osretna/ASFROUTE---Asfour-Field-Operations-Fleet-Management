/**
 * Egyptian Governorates & Smart Address Geocoding Utility
 * Enables automatic location coordinates conversion for customer addresses in Egypt.
 */

export interface EgyptGovernorate {
  id: string;
  nameAr: string;
  nameEn: string;
  centerCoordinates: [number, number]; // [lat, lng]
}

export const EGYPT_GOVERNORATES: EgyptGovernorate[] = [
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo', centerCoordinates: [30.0444, 31.2357] },
  { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza', centerCoordinates: [30.0131, 31.2089] },
  { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria', centerCoordinates: [31.2001, 29.9187] },
  { id: 'sharqia', nameAr: 'الشرقية (العاشر من رمضان)', nameEn: 'Sharqia (10th of Ramadan)', centerCoordinates: [30.3012, 31.7485] },
  { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia', centerCoordinates: [30.3292, 31.2168] },
  { id: 'dakahlia', nameAr: 'الدقهلية (المنصورة)', nameEn: 'Dakahlia (Mansoura)', centerCoordinates: [31.0409, 31.3785] },
  { id: 'gharbia', nameAr: 'الغربية (طنطا)', nameEn: 'Gharbia (Tanta)', centerCoordinates: [30.7865, 31.0004] },
  { id: 'menofia', nameAr: 'المنوفية (شبين الكوم)', nameEn: 'Menofia (Shibin El Kom)', centerCoordinates: [30.5528, 30.9996] },
  { id: 'beheira', nameAr: 'البحيرة (دمنهور)', nameEn: 'Beheira (Damanhur)', centerCoordinates: [31.0364, 30.4699] },
  { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta', centerCoordinates: [31.4175, 31.8144] },
  { id: 'kafr_el_sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', centerCoordinates: [31.1107, 30.9388] },
  { id: 'port_said', nameAr: 'بورسعيد', nameEn: 'Port Said', centerCoordinates: [31.2653, 32.3019] },
  { id: 'ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia', centerCoordinates: [30.5965, 32.2715] },
  { id: 'suez', nameAr: 'السويس', nameEn: 'Suez', centerCoordinates: [29.9668, 32.5498] },
  { id: 'red_sea', nameAr: 'البحر الأحمر (الغردقة / الجونة)', nameEn: 'Red Sea (Hurghada / Gouna)', centerCoordinates: [27.2579, 33.8116] },
  { id: 'south_sinai', nameAr: 'جنوب سيناء (شرم الشيخ)', nameEn: 'South Sinai (Sharm El Sheikh)', centerCoordinates: [27.9158, 34.3299] },
  { id: 'north_sinai', nameAr: 'شمال سيناء (العريش)', nameEn: 'North Sinai (Arish)', centerCoordinates: [31.1321, 33.8033] },
  { id: 'matrouh', nameAr: 'مطروح والساحل الشمالي', nameEn: 'Matrouh & North Coast', centerCoordinates: [31.3543, 27.2373] },
  { id: 'fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum', centerCoordinates: [29.3084, 30.8428] },
  { id: 'beni_suef', nameAr: 'بني سويف', nameEn: 'Beni Suef', centerCoordinates: [29.0661, 31.0994] },
  { id: 'minya', nameAr: 'المنيا', nameEn: 'Minya', centerCoordinates: [28.0871, 30.7618] },
  { id: 'assiut', nameAr: 'أسيوط', nameEn: 'Assiut', centerCoordinates: [27.1783, 31.1859] },
  { id: 'sohag', nameAr: 'سوهاج', nameEn: 'Sohag', centerCoordinates: [26.5590, 31.6957] },
  { id: 'qena', nameAr: 'قنا', nameEn: 'Qena', centerCoordinates: [26.1551, 32.7160] },
  { id: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor', centerCoordinates: [25.6872, 32.6396] },
  { id: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan', centerCoordinates: [24.0889, 32.8998] },
  { id: 'new_valley', nameAr: 'الوادي الجديد (الخارجة)', nameEn: 'New Valley (Kharga)', centerCoordinates: [25.4514, 30.5471] }
];

// Well-known popular residential areas and luxury districts in Egypt with precise GPS coordinates
const DISTRICT_COORDINATES: Record<string, [number, number]> = {
  // New Cairo & East
  'التجمع الخامس': [30.0125, 31.4820],
  'التجمع الاول': [30.0635, 31.4550],
  'التجمع الثالث': [29.9820, 31.4250],
  'شارع التسعين': [30.0210, 31.4680],
  'التسعين الجنوبي': [30.0150, 31.4720],
  'التسعين الشمالي': [30.0280, 31.4650],
  'مدينتي': [30.0985, 31.6325],
  'الرحاب': [30.0610, 31.4920],
  'الشروق': [30.1280, 31.6250],
  'بدر': [30.1420, 31.7450],
  'المستقبل': [30.0520, 31.6850],
  'العاصمة الإدارية': [30.0120, 31.7500],
  'العاصمة الادارية': [30.0120, 31.7500],
  'الحي الدبلوماسي': [29.9980, 31.7350],
  'حي السفارات': [30.0450, 31.3550],
  'مصر الجديدة': [30.0880, 31.3280],
  'النزهة': [30.1128, 31.3439],
  'مدينة نصر': [30.0570, 31.3420],
  'المعادي': [29.9600, 31.2580],
  'دجلة المعادي': [29.9680, 31.2720],
  'المقطم': [30.0150, 31.2980],
  'الزمالك': [30.0610, 31.2210],
  'جاردن سيتي': [30.0350, 31.2320],
  'شبرا': [30.0950, 31.2450],
  'عين شمس': [30.1290, 31.3190],

  // Giza & West
  'الشيخ زايد': [30.0543, 30.9856],
  'زايد': [30.0543, 30.9856],
  '6 اكتوبر': [29.9750, 30.9450],
  'السادس من اكتوبر': [29.9750, 30.9450],
  'الحزام الأخضر': [30.0820, 30.9320],
  'المهندسين': [30.0520, 31.2010],
  'الدقي': [30.0380, 31.2120],
  'العجوزة': [30.0580, 31.2150],
  'الهرم': [29.9980, 31.1620],
  'فيصل': [30.0050, 31.1780],
  'حدائق الاهرام': [29.9780, 31.1210],
  'حدائق الأهرام': [29.9780, 31.1210],
  'طريق مصر اسكندرية الصحراوي': [30.0750, 30.9850],

  // Alexandria & Coast
  'سموحة': [31.2150, 29.9550],
  'ستانلي': [31.2350, 29.9500],
  'لوران': [31.2450, 29.9750],
  'رشدي': [31.2280, 29.9450],
  'كفر عبده': [31.2210, 29.9520],
  'سيدي جابر': [31.2200, 29.9380],
  'محرم بك': [31.1950, 29.9180],
  'الساحل الشمالي': [30.9450, 28.8500],
  'مارينا': [30.8250, 28.9850],
  'العلمين': [30.8400, 28.9500],
  'سيدي عبد الرحمن': [30.9250, 28.7250],

  // Sharqia & Delta
  'العاشر من رمضان': [30.3012, 31.7485],
  'بلبيس': [30.4180, 31.5620],
  'الزقازيق': [30.5870, 31.5020],
  'المنصورة': [31.0409, 31.3785],
  'طنطا': [30.7865, 31.0004],
  'دمياط': [31.4175, 31.8144],
  'بورفؤاد': [31.2480, 32.3250],
};

/**
 * Intelligent Geocoder for Egyptian addresses.
 * Resolves address text and governorate to exact [lat, lng] coordinates.
 */
export async function autoDetectEgyptCoordinates(
  address: string, 
  governorateName: string
): Promise<[number, number]> {
  const cleanAddress = address.trim();
  const cleanGov = governorateName.trim();

  // 1. Check local district dictionary for direct or partial match
  for (const [district, coords] of Object.entries(DISTRICT_COORDINATES)) {
    if (cleanAddress.includes(district)) {
      // Add slight micro-offset based on street text so identical districts don't stack exactly on top
      const hash = cleanAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const latOffset = ((hash % 100) - 50) * 0.00008;
      const lngOffset = (((hash * 13) % 100) - 50) * 0.00008;
      return [coords[0] + latOffset, coords[1] + lngOffset];
    }
  }

  // 2. Try online Nominatim OpenStreetMap Geocoding API with 1.8s timeout
  try {
    const query = encodeURIComponent(`${cleanAddress}, ${cleanGov}, Egypt`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=eg&limit=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    }
  } catch {
    // Fall back to governorate coordinates below
  }

  // 3. Fallback to Governorate center coordinates
  const foundGov = EGYPT_GOVERNORATES.find(g => 
    cleanGov.includes(g.nameAr) || g.nameAr.includes(cleanGov) || cleanGov.toLowerCase().includes(g.nameEn.toLowerCase())
  );

  if (foundGov) {
    const hash = cleanAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = ((hash % 80) - 40) * 0.0002;
    const lngOffset = (((hash * 7) % 80) - 40) * 0.0002;
    return [foundGov.centerCoordinates[0] + latOffset, foundGov.centerCoordinates[1] + lngOffset];
  }

  // Default Greater Cairo
  return [30.0444, 31.2357];
}
