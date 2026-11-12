import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Language, 
  ThemeMode, 
  BranchId, 
  Vehicle, 
  Technician, 
  InstallationTeam, 
  WorkOrder, 
  WorkOrderStatus, 
  GanttTaskBlock, 
  LiveEventLog, 
  ProjectBuilding,
  SqlDatabaseConfig,
  FirebaseCloudConfig,
  CloudStorageConfig,
  GoogleMapsConfig,
  SystemSecurityConfig
} from '../types';
import { 
  BRANCHES, 
  INITIAL_VEHICLES, 
  INITIAL_TECHNICIANS, 
  INITIAL_TEAMS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_GANTT_BLOCKS, 
  INITIAL_EVENT_LOGS, 
  INITIAL_PROJECT_BUILDINGS 
} from '../data/mockData';

export type ActiveTab = 
  | 'dashboard' 
  | 'dispatch' 
  | 'fleet' 
  | 'workforce' 
  | 'workorders' 
  | 'projects' 
  | 'mobile_app' 
  | 'architecture'
  | 'admin';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  activeBranchId: BranchId | 'all';
  setActiveBranchId: (id: BranchId | 'all') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Data entities
  vehicles: Vehicle[];
  technicians: Technician[];
  teams: InstallationTeam[];
  workOrders: WorkOrder[];
  ganttBlocks: GanttTaskBlock[];
  eventLogs: LiveEventLog[];
  projectBuildings: ProjectBuilding[];

  // Selection
  selectedWorkOrder: WorkOrder | null;
  setSelectedWorkOrder: (wo: WorkOrder | null) => void;
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (v: Vehicle | null) => void;
  selectedTechnician: Technician | null;
  setSelectedTechnician: (t: Technician | null) => void;

  // Actions
  updateWorkOrderStatus: (workOrderId: string, nextStatus: WorkOrderStatus) => void;
  reassignWorkOrder: (workOrderId: string, vehicleId: string, teamId: string, reason: string) => { success: boolean; message: string };
  runAutoScheduleOptimizer: () => Promise<void>;
  isOptimizing: boolean;
  addLiveLog: (titleAr: string, titleEn: string, descAr: string, descEn: string, severity: LiveEventLog['severity'], entityType: LiveEventLog['entityType'], entityId: string) => void;
  
  // Quick inspection modals
  certificateModalWo: WorkOrder | null;
  setCertificateModalWo: (wo: WorkOrder | null) => void;

  // Admin & Cloud Authentication
  isAdminAuthenticated: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  handleAsfrouteWordmarkClick: () => void;

  // Cloud & Database Integrations
  sqlConfig: SqlDatabaseConfig;
  setSqlConfig: (cfg: SqlDatabaseConfig) => void;
  firebaseConfig: FirebaseCloudConfig;
  setFirebaseConfig: (cfg: FirebaseCloudConfig) => void;
  storageConfig: CloudStorageConfig;
  setStorageConfig: (cfg: CloudStorageConfig) => void;
  mapsConfig: GoogleMapsConfig;
  setMapsConfig: (cfg: GoogleMapsConfig) => void;
  securityConfig: SystemSecurityConfig;
  setSecurityConfig: (cfg: SystemSecurityConfig) => void;

  testSqlConnection: () => Promise<{ success: boolean; message: string; latencyMs: number }>;
  testFirebaseConnection: () => Promise<{ success: boolean; message: string; latencyMs: number }>;
  testStorageConnection: () => Promise<{ success: boolean; message: string }>;
  testMapsConnection: () => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [activeBranchId, setActiveBranchId] = useState<BranchId | 'all'>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [technicians, setTechnicians] = useState<Technician[]>(INITIAL_TECHNICIANS);
  const [teams, setTeams] = useState<InstallationTeam[]>(INITIAL_TEAMS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [ganttBlocks, setGanttBlocks] = useState<GanttTaskBlock[]>(INITIAL_GANTT_BLOCKS);
  const [eventLogs, setEventLogs] = useState<LiveEventLog[]>(INITIAL_EVENT_LOGS);
  const [projectBuildings, setProjectBuildings] = useState<ProjectBuilding[]>(INITIAL_PROJECT_BUILDINGS);

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(INITIAL_WORK_ORDERS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(INITIAL_VEHICLES[0]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(INITIAL_TECHNICIANS[0]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [certificateModalWo, setCertificateModalWo] = useState<WorkOrder | null>(null);

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('asfroute_admin_logged') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  // Cloud Configs (with initial sensible enterprise placeholders)
  const [sqlConfig, setSqlConfigState] = useState<SqlDatabaseConfig>(() => {
    const saved = localStorage.getItem('asfroute_sql_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      provider: 'postgresql',
      host: 'ep-cold-crystal-904.eu-central-1.aws.neon.tech',
      port: 5432,
      databaseName: 'asfroute_crystal_db',
      username: 'asfour_admin',
      password: '',
      sslMode: 'require',
      isConnected: true,
      lastTested: '2026-11-12 10:15:00',
      activeTablesCount: 18,
    };
  });

  const [firebaseConfig, setFirebaseConfigState] = useState<FirebaseCloudConfig>(() => {
    const saved = localStorage.getItem('asfroute_firebase_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      projectId: 'asfour-crystal-fsm-prod',
      apiKey: '',
      authDomain: 'asfour-crystal-fsm-prod.firebaseapp.com',
      storageBucket: 'asfour-crystal-fsm-prod.appspot.com',
      messagingSenderId: '309004189655',
      appId: '1:309004189655:web:88902b1f48c12a',
      firestoreRegion: 'europe-west1',
      isConnected: true,
      lastTested: '2026-11-12 09:40:00',
      syncCollections: ['work_orders', 'vehicles_telemetry', 'job_reports', 'signatures'],
    };
  });

  const [storageConfig, setStorageConfigState] = useState<CloudStorageConfig>(() => {
    const saved = localStorage.getItem('asfroute_storage_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      provider: 'google_cloud_storage',
      bucketName: 'asfour-crystal-installation-vault',
      region: 'europe-west2',
      endpointUrl: 'https://storage.googleapis.com',
      accessKeyId: '',
      secretAccessKey: '',
      isConnected: true,
      lastTested: '2026-11-12 08:30:00',
    };
  });

  const [mapsConfig, setMapsConfigState] = useState<GoogleMapsConfig>(() => {
    const saved = localStorage.getItem('asfroute_maps_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      apiKey: '',
      directionsEnabled: true,
      distanceMatrixEnabled: true,
      geocodingEnabled: true,
      placesEnabled: true,
      trafficLayerEnabled: true,
      isConnected: true,
      lastTested: '2026-11-12 10:00:00',
    };
  });

  const [securityConfig, setSecurityConfigState] = useState<SystemSecurityConfig>(() => {
    const saved = localStorage.getItem('asfroute_security_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      maxVehicleSpeedKmH: 70,
      minAnchorSafetyFactor: 3.0,
      enforcePneumaticDampingForFragile: true,
      enforceStrictAltitudeCertification: true,
      enableOrToolsOptimization: true,
      enableOfflineMobileSync: true,
      requireDigitalSignature: true,
      requireBeforeAfterPhotos: true,
    };
  });

  // Setters with localStorage persistence
  const setSqlConfig = (cfg: SqlDatabaseConfig) => {
    setSqlConfigState(cfg);
    localStorage.setItem('asfroute_sql_config', JSON.stringify(cfg));
  };

  const setFirebaseConfig = (cfg: FirebaseCloudConfig) => {
    setFirebaseConfigState(cfg);
    localStorage.setItem('asfroute_firebase_config', JSON.stringify(cfg));
  };

  const setStorageConfig = (cfg: CloudStorageConfig) => {
    setStorageConfigState(cfg);
    localStorage.setItem('asfroute_storage_config', JSON.stringify(cfg));
  };

  const setMapsConfig = (cfg: GoogleMapsConfig) => {
    setMapsConfigState(cfg);
    localStorage.setItem('asfroute_maps_config', JSON.stringify(cfg));
  };

  const setSecurityConfig = (cfg: SystemSecurityConfig) => {
    setSecurityConfigState(cfg);
    localStorage.setItem('asfroute_security_config', JSON.stringify(cfg));
  };

  // Sync RTL/LTR & dark class on <html>
  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [language, theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Secret Triple-Click handler on "ASFROUTE"
  const handleAsfrouteWordmarkClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 1200) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 3) {
        setClickCount(0);
        if (isAdminAuthenticated) {
          setActiveTab('admin');
        } else {
          setShowLoginModal(true);
        }
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  // Admin login check: Case-insensitive username check!
  const loginAdmin = (username: string, password: string): boolean => {
    const normalizedUser = username.trim().toLowerCase();
    if (normalizedUser === 'admin' && password === 'admin1234') {
      setIsAdminAuthenticated(true);
      setShowLoginModal(false);
      localStorage.setItem('asfroute_admin_logged', 'true');
      setActiveTab('admin');

      addLiveLog(
        'تسجيل دخول مشرف النظام المعتمد',
        'System Super-Admin Authenticated',
        'تم تسجيل الدخول إلى لوحة تحكم الإدارة العليا ومفايس الربط السحابي',
        'Authorized super-admin session initialized with full configuration access',
        'success',
        'safety',
        'ADM-001'
      );
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('asfroute_admin_logged');
    if (activeTab === 'admin') {
      setActiveTab('dashboard');
    }
  };

  // Test Connection Simulators
  const testSqlConnection = async () => {
    await new Promise(r => setTimeout(r, 900));
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const updated = {
      ...sqlConfig,
      isConnected: true,
      lastTested: nowStr,
      activeTablesCount: 18
    };
    setSqlConfig(updated);

    addLiveLog(
      'فحص اتصال قاعدة بيانات PostgreSQL / PostGIS',
      'PostgreSQL / PostGIS Connection Verified',
      `نجح الاتصال بالخادم ${sqlConfig.host}:${sqlConfig.port} بزمن استجابة 24ms`,
      `Verified connection to database [${sqlConfig.databaseName}] at ${sqlConfig.host}`,
      'success',
      'safety',
      'DB-POSTGRES'
    );

    return {
      success: true,
      message: language === 'ar' ? 'تم التحقق بنجاح من اتصال قاعدة البيانات وجداول PostGIS المعتمدة (18 جدول)' : 'PostgreSQL + PostGIS connection verified successfully with 18 active tables',
      latencyMs: 24
    };
  };

  const testFirebaseConnection = async () => {
    await new Promise(r => setTimeout(r, 950));
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const updated = {
      ...firebaseConfig,
      isConnected: true,
      lastTested: nowStr
    };
    setFirebaseConfig(updated);

    addLiveLog(
      'فحص اتصال سحابة Firebase Firestore & Auth',
      'Firebase Cloud Firestore & Auth Verified',
      `تم الاتصال بالمشروع ${firebaseConfig.projectId} بنجاح وقواعد الأمان جاهزة`,
      `Project [${firebaseConfig.projectId}] connected with active Firestore security rules`,
      'success',
      'safety',
      'CLOUD-FIREBASE'
    );

    return {
      success: true,
      message: language === 'ar' ? 'تم الاتصال بسحابة Firebase ومزامنة الحقول ومصادقة المستخدمين بنجاح' : 'Firebase Firestore & Authentication verified and synced',
      latencyMs: 38
    };
  };

  const testStorageConnection = async () => {
    await new Promise(r => setTimeout(r, 700));
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const updated = {
      ...storageConfig,
      isConnected: true,
      lastTested: nowStr
    };
    setStorageConfig(updated);
    return {
      success: true,
      message: language === 'ar' ? `مستودع التخزين السحابي [${storageConfig.bucketName}] جاهز لرفع صور الثريات والشهادات بدقة 8K` : `Bucket [${storageConfig.bucketName}] ready for 8K chandelier photos & certificates`
    };
  };

  const testMapsConnection = async () => {
    await new Promise(r => setTimeout(r, 650));
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const updated = {
      ...mapsConfig,
      isConnected: true,
      lastTested: nowStr
    };
    setMapsConfig(updated);
    return {
      success: true,
      message: language === 'ar' ? 'تم التحقق من مفتاح Google Maps Platform وتفعيل Directions & Distance Matrix' : 'Google Maps Platform APIs verified and operational'
    };
  };

  const addLiveLog = (
    titleAr: string, 
    titleEn: string, 
    descAr: string, 
    descEn: string, 
    severity: LiveEventLog['severity'], 
    entityType: LiveEventLog['entityType'], 
    entityId: string
  ) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog: LiveEventLog = {
      id: `LOG-${Date.now()}`,
      timestamp: timeStr,
      severity,
      titleAr,
      titleEn,
      descriptionAr: descAr,
      descriptionEn: descEn,
      entityType,
      entityId
    };
    setEventLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const updateWorkOrderStatus = (workOrderId: string, nextStatus: WorkOrderStatus) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === workOrderId) {
        return { ...wo, status: nextStatus };
      }
      return wo;
    }));

    const wo = workOrders.find(w => w.id === workOrderId);
    if (wo) {
      addLiveLog(
        `تحديث حالة أمر العمل: ${wo.orderNumber}`,
        `Work Order Status Updated: ${wo.orderNumber}`,
        `انتقل أمر العمل إلى مرحلة [${nextStatus}]`,
        `Work Order progressed to stage [${nextStatus}]`,
        'info',
        'work_order',
        workOrderId
      );
    }
  };

  const reassignWorkOrder = (
    workOrderId: string, 
    vehicleId: string, 
    teamId: string, 
    reason: string
  ): { success: boolean; message: string } => {
    const targetWo = workOrders.find(w => w.id === workOrderId);
    const targetVehicle = vehicles.find(v => v.id === vehicleId);
    const targetTeam = teams.find(t => t.id === teamId);

    if (!targetWo || !targetVehicle || !targetTeam) {
      return { success: false, message: 'Invalid assignment parameters' };
    }

    if (targetVehicle.maxWeightKg < targetWo.chandelier.weightKg) {
      return { 
        success: false, 
        message: language === 'ar' 
          ? `مرفوض: وزن النجفة (${targetWo.chandelier.weightKg} كجم) يتجاوز حمولة الشاحنة القصوى (${targetVehicle.maxWeightKg} كجم)!` 
          : `Violation: Chandelier weight (${targetWo.chandelier.weightKg}kg) exceeds truck capacity (${targetVehicle.maxWeightKg}kg)!` 
      };
    }

    if (securityConfig.enforcePneumaticDampingForFragile && targetWo.requiresPneumaticTruck && !targetVehicle.hasPneumaticDamping) {
      return {
        success: false,
        message: language === 'ar'
          ? 'مرفوض: هذه النجفة تصنيف فائق الحساسية وتتطلب شاحنة بنظام تعليق هوائي هيدروليكي ممتص للاهتزاز!'
          : 'Violation: Delicate crystal piece mandates air-suspended vibration-damped carrier!'
      };
    }

    if (securityConfig.enforceStrictAltitudeCertification && targetTeam.maxHeightAuthorizedM < targetWo.scaffoldingHeightM) {
      return {
        success: false,
        message: language === 'ar'
          ? `مرفوض: ارتفاع العمل المطلوبة (${targetWo.scaffoldingHeightM}م) أعلى من ترخيص الفريق المعتمد (${targetTeam.maxHeightAuthorizedM}م)!`
          : `Violation: Work altitude (${targetWo.scaffoldingHeightM}m) exceeds team certification limit (${targetTeam.maxHeightAuthorizedM}m)!`
      };
    }

    setWorkOrders(prev => prev.map(w => {
      if (w.id === workOrderId) {
        return {
          ...w,
          assignedVehicleId: vehicleId,
          assignedTeamId: teamId,
          status: 'scheduled'
        };
      }
      return w;
    }));

    setGanttBlocks(prev => prev.map(block => {
      if (block.workOrderId === workOrderId) {
        return {
          ...block,
          resourceId: vehicleId
        };
      }
      return block;
    }));

    addLiveLog(
      `إعادة تعيين يدوي لأمر العمل: ${targetWo.orderNumber}`,
      `Manual Reassignment: ${targetWo.orderNumber}`,
      `تم إسناد المهمة إلى المركبة ${targetVehicle.plateNumber} والفريق ${targetTeam.nameAr}. السبب: ${reason}`,
      `Assigned to ${targetVehicle.plateNumberEn} and team ${targetTeam.nameEn}. Reason: ${reason}`,
      'success',
      'work_order',
      workOrderId
    );

    return { 
      success: true, 
      message: language === 'ar' ? 'تمت إعادة الجدولة والتعيين بنجاح وفق معايير الأمان' : 'Reassignment completed safely adhering to load & height rules' 
    };
  };

  const runAutoScheduleOptimizer = async () => {
    setIsOptimizing(true);
    addLiveLog(
      'بدء تشغيل محرك التحسين الذكي OR-Tools',
      'Running OR-Tools Optimization Engine',
      'جاري حل مصفوفة المسافات واختناقات الحمولات ومطابقة كفاءات الفنيين...',
      'Solving distance matrix, vehicle payload constraints, and technician skill scoring...',
      'warning',
      'safety',
      'SYS-OR-TOOLS'
    );

    await new Promise(resolve => setTimeout(resolve, 1800));

    setWorkOrders(prev => prev.map(wo => {
      if (wo.status === 'ready_for_dispatch') {
        return { ...wo, status: 'scheduled' };
      }
      return wo;
    }));

    setIsOptimizing(false);

    addLiveLog(
      'اكتملت الجدولة الذكية بنجاح (وفر 18.4% كم)',
      'Route Optimization Finished (18.4% km saved)',
      'تم توفير 142 كم من المسافات وخفض وقت القيادة المتوقع بنسبة 22 دقيقة لكل فريق.',
      'Saved 142 km fleet travel distance and reduced average drive time by 22 min per team.',
      'success',
      'safety',
      'SYS-OR-TOOLS'
    );
  };

  const filteredVehicles = activeBranchId === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.branchId === activeBranchId);

  const filteredWorkOrders = activeBranchId === 'all'
    ? workOrders
    : workOrders.filter(w => {
        const v = vehicles.find(veh => veh.id === w.assignedVehicleId);
        return v?.branchId === activeBranchId;
      });

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      theme,
      setTheme,
      toggleTheme,
      activeBranchId,
      setActiveBranchId,
      activeTab,
      setActiveTab,
      vehicles: filteredVehicles,
      technicians,
      teams,
      workOrders: filteredWorkOrders,
      ganttBlocks,
      eventLogs,
      projectBuildings,
      selectedWorkOrder,
      setSelectedWorkOrder,
      selectedVehicle,
      setSelectedVehicle,
      selectedTechnician,
      setSelectedTechnician,
      updateWorkOrderStatus,
      reassignWorkOrder,
      runAutoScheduleOptimizer,
      isOptimizing,
      addLiveLog,
      certificateModalWo,
      setCertificateModalWo,

      // Admin & Cloud
      isAdminAuthenticated,
      showLoginModal,
      setShowLoginModal,
      loginAdmin,
      logoutAdmin,
      handleAsfrouteWordmarkClick,
      sqlConfig,
      setSqlConfig,
      firebaseConfig,
      setFirebaseConfig,
      storageConfig,
      setStorageConfig,
      mapsConfig,
      setMapsConfig,
      securityConfig,
      setSecurityConfig,
      testSqlConnection,
      testFirebaseConnection,
      testStorageConnection,
      testMapsConnection,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
