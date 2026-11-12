/**
 * ASFROUTE - Asfour Field Operations & Fleet Operations System
 * Core TypeScript Type Definitions
 */

export type Language = 'ar' | 'en';
export type ThemeMode = 'dark' | 'light';

export type BranchId = 'cairo_hq' | 'tenth_ramadan' | 'alexandria' | 'new_cairo' | 'sheikh_zayed' | 'dubai_hub';

export interface Branch {
  id: BranchId;
  nameAr: string;
  nameEn: string;
  city: string;
  coordinates: [number, number]; // [lat, lng]
  isDepot: boolean;
}

export type VehicleStatus = 'available' | 'on_route' | 'at_customer' | 'maintenance' | 'inspection_needed';
export type VehicleType = 'Heavy Crystal Transporter' | 'Medium Installation Truck' | 'Specialized Rigging Van' | 'Rapid Survey Unit';

export interface Vehicle {
  id: string;
  plateNumber: string;
  plateNumberEn: string;
  model: string;
  type: VehicleType;
  branchId: BranchId;
  status: VehicleStatus;
  maxWeightKg: number;
  currentLoadKg: number;
  volumetricCapacityM3: number;
  currentLoadM3: number;
  maxHeightM: number;
  hasCraneLift: boolean;
  hasPneumaticDamping: boolean; // Vital for crystal vibration protection
  driverId?: string;
  driverNameAr?: string;
  driverNameEn?: string;
  currentLat: number;
  currentLng: number;
  speedKmH: number;
  fuelLevelPercent: number;
  batteryOrHealthPercent: number;
  currentWorkOrderId?: string;
  nextStopEta?: string;
}

export type SkillLevel = 1 | 2 | 3 | 4 | 5; // 5 = Master Artisan / Inspector

export interface Skill {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  category: 'crystal_assembly' | 'rigging_scaffolding' | 'electrical_dimming' | 'survey_anchorage' | 'restoration';
  minExperienceYears: number;
}

export interface TechnicianCertification {
  skillId: string;
  skillNameAr: string;
  skillNameEn: string;
  level: SkillLevel;
  issuedDate: string;
  expiryDate: string;
  isHighAltitudeCertified: boolean;
  maxWorkHeightMeters: number;
}

export type TechnicianStatus = 'available' | 'en_route' | 'on_site' | 'on_leave' | 'break';

export interface Technician {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  avatar: string;
  branchId: BranchId;
  status: TechnicianStatus;
  rating: number; // e.g. 4.9
  completedJobsCount: number;
  certifications: TechnicianCertification[];
  teamId?: string;
  phoneNumber: string;
}

export interface InstallationTeam {
  id: string;
  nameAr: string;
  nameEn: string;
  leadTechnicianId: string;
  memberIds: string[];
  assignedVehicleId: string;
  branchId: BranchId;
  compositeSkillRating: number;
  maxHeightAuthorizedM: number;
  status: 'ready' | 'deployed' | 'resting';
}

export type WorkOrderType = 
  | 'grand_chandelier' 
  | 'palatial_lighting' 
  | 'site_survey_anchorage' 
  | 'multi_unit_project' 
  | 'restoration_cleaning' 
  | 'emergency_anchor_check';

export type WorkOrderStatus =
  | 'new'
  | 'survey_approved'
  | 'ready_for_dispatch'
  | 'scheduled'
  | 'en_route'
  | 'arrived_rigging'
  | 'crystal_assembly'
  | 'illumination_testing'
  | 'completed_handover'
  | 'certified_closed';

export interface ChandelierSpec {
  modelNumber: string;
  modelNameAr: string;
  modelNameEn: string;
  crystalCutType: 'Asfour 30% PbO Full Lead' | 'Spectra Elite' | 'Imperial Bohemian Cut';
  weightKg: number;
  diameterCm: number;
  heightCm: number;
  layersCount: number;
  totalCrystalPrisms: number;
  requiredCeilingLoadCapacityKg: number;
  minimumCeilingHeightM: number;
  installationFragilityTier: 'Standard' | 'High Fragility' | 'Ultra-Delicate Masterpiece';
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  customerNameAr: string;
  customerNameEn: string;
  customerPhone: string;
  customerType: 'VIP Residential' | 'Luxury Hotel' | 'Royal/State Palace' | 'Mosque/Cathedral' | 'Commercial Flagship';
  locationNameAr: string;
  locationNameEn: string;
  governorate: string;
  coordinates: [number, number];
  scheduledDate: string;
  timeWindowStart: string; // "09:00"
  timeWindowEnd: string;   // "13:00"
  estimatedDurationHours: number;
  chandelier: ChandelierSpec;
  requiredSkillLevel: SkillLevel;
  requiredTechniciansCount: number;
  requiresPneumaticTruck: boolean;
  requiresCraneLift: boolean;
  assignedTeamId?: string;
  assignedVehicleId?: string;
  anchorTestPassed: boolean;
  scaffoldingHeightM: number;
  notesAr: string;
  notesEn: string;
  certificateNumber?: string;
}

export interface GanttTaskBlock {
  id: string;
  workOrderId: string;
  resourceId: string; // vehicleId or teamId
  resourceType: 'vehicle' | 'team';
  titleAr: string;
  titleEn: string;
  startHour: number; // e.g. 9.5 for 09:30
  durationHours: number;
  type: 'travel' | 'rigging' | 'assembly' | 'handover';
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  hasConflict: boolean;
  conflictReasonAr?: string;
  conflictReasonEn?: string;
}

export interface LiveEventLog {
  id: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  entityType: 'vehicle' | 'work_order' | 'team' | 'safety';
  entityId: string;
}

export interface ProjectBuilding {
  id: string;
  nameAr: string;
  nameEn: string;
  floorsCount: number;
  totalChandelierUnits: number;
  installedUnits: number;
  zones: {
    id: string;
    nameAr: string;
    nameEn: string;
    floorNumber: number;
    units: {
      id: string;
      unitNameAr: string;
      unitNameEn: string;
      modelNumber: string;
      status: 'pending' | 'in_progress' | 'certified';
      assignedTechAr: string;
      assignedTechEn: string;
    }[];
  }[];
}

// ---------------- Admin & Cloud Integration Definitions ----------------

export interface SqlDatabaseConfig {
  provider: 'postgresql' | 'cloudsql' | 'supabase';
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password?: string;
  sslMode: 'require' | 'disable' | 'prefer';
  isConnected: boolean;
  lastTested?: string;
  activeTablesCount?: number;
}

export interface FirebaseCloudConfig {
  projectId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreRegion: string;
  isConnected: boolean;
  lastTested?: string;
  syncCollections: string[];
}

export interface CloudStorageConfig {
  provider: 'aws_s3' | 'google_cloud_storage' | 'minio';
  bucketName: string;
  region: string;
  endpointUrl?: string;
  accessKeyId: string;
  secretAccessKey?: string;
  isConnected: boolean;
  lastTested?: string;
}

export interface GoogleMapsConfig {
  apiKey: string;
  directionsEnabled: boolean;
  distanceMatrixEnabled: boolean;
  geocodingEnabled: boolean;
  placesEnabled: boolean;
  trafficLayerEnabled: boolean;
  isConnected: boolean;
  lastTested?: string;
}

export interface SystemSecurityConfig {
  maxVehicleSpeedKmH: number;
  minAnchorSafetyFactor: number;
  enforcePneumaticDampingForFragile: boolean;
  enforceStrictAltitudeCertification: boolean;
  enableOrToolsOptimization: boolean;
  enableOfflineMobileSync: boolean;
  requireDigitalSignature: boolean;
  requireBeforeAfterPhotos: boolean;
}
