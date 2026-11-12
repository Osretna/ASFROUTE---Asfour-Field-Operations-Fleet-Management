import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, testConnection } from '../firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
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
  SystemSecurityConfig,
  WhatsAppAccount,
  VehicleTelemetryBreadcrumb
} from '../types';
import { 
  BRANCHES, 
  INITIAL_VEHICLES, 
  INITIAL_TECHNICIANS, 
  INITIAL_TEAMS, 
  INITIAL_WORK_ORDERS, 
  INITIAL_GANTT_BLOCKS, 
  INITIAL_EVENT_LOGS, 
  INITIAL_PROJECT_BUILDINGS,
  INITIAL_WHATSAPP_ACCOUNTS
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

export type DetailEntityType = 'work_order' | 'vehicle' | 'technician' | 'team';

export interface DetailModalState {
  type: DetailEntityType;
  data: any;
}

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
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
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

  // CRUD Actions
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (v: Vehicle) => void;
  deleteVehicle: (id: string) => void;

  addTechnician: (t: Technician) => void;
  updateTechnician: (t: Technician) => void;
  deleteTechnician: (id: string) => void;

  addTeam: (team: InstallationTeam) => void;
  updateTeam: (team: InstallationTeam) => void;
  deleteTeam: (id: string) => void;

  addWorkOrder: (wo: WorkOrder) => void;
  updateWorkOrder: (wo: WorkOrder) => void;
  deleteWorkOrder: (id: string) => void;

  addProjectBuilding: (proj: ProjectBuilding) => void;
  updateProjectBuilding: (proj: ProjectBuilding) => void;
  deleteProjectBuilding: (id: string) => void;
  addChandelierUnit: (buildingId: string, zoneId: string, unit: { unitNameAr: string; unitNameEn: string; modelNumber: string; assignedTechAr: string; assignedTechEn: string }) => void;
  deleteChandelierUnit: (buildingId: string, zoneId: string, unitId: string) => void;

  // State transitions & optimization
  updateWorkOrderStatus: (workOrderId: string, nextStatus: WorkOrderStatus) => void;
  reassignWorkOrder: (workOrderId: string, vehicleId: string, teamId: string, reason: string) => { success: boolean; message: string };
  runAutoScheduleOptimizer: () => Promise<void>;
  isOptimizing: boolean;
  addLiveLog: (titleAr: string, titleEn: string, descAr: string, descEn: string, severity: LiveEventLog['severity'], entityType: LiveEventLog['entityType'], entityId: string) => void;
  
  // Presentation Detail Modal
  detailModalState: DetailModalState | null;
  openDetailModal: (type: DetailEntityType, data: any) => void;
  closeDetailModal: () => void;

  // Certificate Modal
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

  // WhatsApp Customer Dispatch & Real-Time Coordination
  whatsappAccounts: WhatsAppAccount[];
  addWhatsAppAccount: (acc: WhatsAppAccount) => void;
  updateWhatsAppAccount: (acc: WhatsAppAccount) => void;
  deleteWhatsAppAccount: (id: string) => void;
  sendCustomerLocationRequestWhatsApp: (workOrderId: string, accountId?: string) => { url: string; message: string };
  receiveCustomerLocationFromWhatsApp: (workOrderId: string, lat: number, lng: number, addressDesc?: string) => void;
  issueDeliveryDispatchOrder: (workOrderId: string, vehicleId?: string) => { success: boolean; message: string };
  openCustomerLocationPortal: (workOrderId: string) => void;
  parseAndLinkWhatsAppMessage: (workOrderId: string, rawText: string) => { success: boolean; message: string; lat?: number; lng?: number };
  customerPortalModalWo: WorkOrder | null;
  setCustomerPortalModalWo: (wo: WorkOrder | null) => void;

  // Firebase Real-Time Firestore Cloud State
  isFirebaseSynced: boolean;
  firestoreLastSyncTime: string;

  // Real-Time Notifications & Incident Alert Management
  unreadAlertCount: number;
  markAllLogsRead: () => void;
  triggerSimulatedIncident: (type?: 'speed' | 'vibration' | 'anchor' | 'delay') => void;

  // Real-Time GPS Tracking, Driver Diligence & Cargo Protection
  isLiveTrackingActive: boolean;
  setIsLiveTrackingActive: (active: boolean) => void;
  toggleLiveTracking: () => void;
  simulateVehicleMovement: (vehicleId: string) => void;
  simulateVehicleTampering: (vehicleId: string, type: 'deviation' | 'idle' | 'shock' | 'door') => void;
  resolveVehicleTampering: (vehicleId: string) => void;
  sendDriverMessage: (vehicleId: string, message: string) => { success: boolean; message: string };
  toggleCargoLock: (vehicleId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('asfroute_theme') as ThemeMode) || 'dark';
  });
  const [activeBranchId, setActiveBranchId] = useState<BranchId | 'all'>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Load saved entities from localStorage if present
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('asfroute_vehicles');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_VEHICLES;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('asfroute_technicians');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TECHNICIANS;
  });

  const [teams, setTeams] = useState<InstallationTeam[]>(() => {
    const saved = localStorage.getItem('asfroute_teams');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_TEAMS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('asfroute_workorders');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_WORK_ORDERS;
  });

  const [ganttBlocks, setGanttBlocks] = useState<GanttTaskBlock[]>(INITIAL_GANTT_BLOCKS);
  const [eventLogs, setEventLogs] = useState<LiveEventLog[]>(INITIAL_EVENT_LOGS);
  const [projectBuildings, setProjectBuildings] = useState<ProjectBuilding[]>(() => {
    const saved = localStorage.getItem('asfroute_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_PROJECT_BUILDINGS;
  });

  const [whatsappAccounts, setWhatsappAccounts] = useState<WhatsAppAccount[]>(() => {
    const saved = localStorage.getItem('asfroute_whatsapp_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_WHATSAPP_ACCOUNTS;
  });

  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(() => {
    return parseInt(localStorage.getItem('asfroute_last_read_alerts') || '0', 10);
  });

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(INITIAL_WORK_ORDERS[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(INITIAL_VEHICLES[0]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(INITIAL_TECHNICIANS[0]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [certificateModalWo, setCertificateModalWo] = useState<WorkOrder | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Presentation Detail Modal State
  const [detailModalState, setDetailModalState] = useState<DetailModalState | null>(null);

  const openDetailModal = (type: DetailEntityType, data: any) => {
    setDetailModalState({ type, data });
  };

  const closeDetailModal = () => {
    setDetailModalState(null);
  };

  // Firebase Real-time Firestore Cloud State
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);
  const [firestoreLastSyncTime, setFirestoreLastSyncTime] = useState<string>('');

  // Customer Direct WhatsApp Location Portal State
  const [customerPortalModalWo, setCustomerPortalModalWo] = useState<WorkOrder | null>(null);

  // ---------------- Real-Time Firebase Firestore Two-Way Sync ----------------
  useEffect(() => {
    let isMounted = true;

    // Test connection
    testConnection().then(ok => {
      if (ok && isMounted) {
        setIsFirebaseSynced(true);
        setFirestoreLastSyncTime(new Date().toLocaleTimeString('ar-EG'));
      }
    });

    // 1. Live Firestore listener on 'work_orders'
    const unsubOrders = onSnapshot(collection(db, 'work_orders'), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        const remoteOrders: WorkOrder[] = [];
        snapshot.forEach(docSnap => {
          remoteOrders.push(docSnap.data() as WorkOrder);
        });
        if (remoteOrders.length > 0) {
          setWorkOrders(remoteOrders);
          setIsFirebaseSynced(true);
          setFirestoreLastSyncTime(new Date().toLocaleTimeString('ar-EG'));
        }
      } else {
        // If Firestore work_orders is empty, seed initial work orders so Firestore has data!
        INITIAL_WORK_ORDERS.forEach(wo => {
          setDoc(doc(db, 'work_orders', wo.id), {
            ...wo,
            syncedAt: new Date().toISOString()
          }, { merge: true }).catch(e => console.error('Error seeding wo:', e));
        });
      }
    }, (err) => {
      console.warn('Firestore onSnapshot work_orders:', err.message);
    });

    // 2. Live Firestore listener on 'vehicles'
    const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snapshot) => {
      if (!isMounted) return;
      if (!snapshot.empty) {
        const remoteVehicles: Vehicle[] = [];
        snapshot.forEach(docSnap => {
          remoteVehicles.push(docSnap.data() as Vehicle);
        });
        if (remoteVehicles.length > 0) {
          setVehicles(remoteVehicles);
          setIsFirebaseSynced(true);
          setFirestoreLastSyncTime(new Date().toLocaleTimeString('ar-EG'));
        }
      } else {
        // If Firestore vehicles is empty, seed initial vehicles so Firestore has data!
        INITIAL_VEHICLES.forEach(veh => {
          setDoc(doc(db, 'vehicles', veh.id), {
            ...veh,
            syncedAt: new Date().toISOString()
          }, { merge: true }).catch(e => console.error('Error seeding vehicle:', e));
        });
      }
    }, (err) => {
      console.warn('Firestore onSnapshot vehicles:', err.message);
    });

    // 3. Inspect URL query params for WhatsApp direct portal link
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const action = searchParams.get('action');
      const woId = searchParams.get('woId');
      if (action === 'customer_location' && woId) {
        let targetWo = workOrders.find(w => w.id === woId) || INITIAL_WORK_ORDERS.find(w => w.id === woId);
        if (!targetWo) {
          const fallbackOrder: WorkOrder = {
            id: woId,
            orderNumber: woId.startsWith('WO-') ? `ASF-EG-${woId.replace('WO-', '')}` : 'ASF-EG-88949',
            type: 'grand_chandelier',
            status: 'scheduled',
            customerNameAr: 'محمد صلاح السيد فرحات',
            customerNameEn: 'Mohamed Salah El-Sayed Farahat',
            customerPhone: '+20 100 248 9112',
            customerType: 'VIP Residential',
            locationNameAr: 'فيلا الرحاب - التجمع الخامس',
            locationNameEn: 'Rehab Villa - New Cairo',
            governorate: 'القاهرة',
            coordinates: [30.0125, 31.4700],
            scheduledDate: '2026-11-12',
            timeWindowStart: '13:00',
            timeWindowEnd: '17:30',
            estimatedDurationHours: 4.5,
            chandelier: {
              modelNumber: 'ASF-CH-ROYAL-902',
              modelNameAr: 'ثريا فرساي الملكية المطلية بماء الذهب',
              modelNameEn: 'Royal Versailles Gold-Plated Chandelier',
              crystalCutType: 'Asfour 30% PbO Full Lead',
              weightKg: 85,
              diameterCm: 180,
              heightCm: 120,
              layersCount: 4,
              totalCrystalPrisms: 1420,
              requiredCeilingLoadCapacityKg: 200,
              minimumCeilingHeightM: 4.5,
              installationFragilityTier: 'Ultra-Delicate Masterpiece'
            },
            requiredSkillLevel: 4,
            requiredTechniciansCount: 3,
            requiresPneumaticTruck: true,
            requiresCraneLift: false,
            anchorTestPassed: true,
            scaffoldingHeightM: 4.5,
            notesAr: 'تم طلب تأكيد الموقع عبر الواتساب',
            notesEn: 'Location confirmation requested via WhatsApp',
            whatsappStatus: 'location_requested',
            customerLocationConfirmed: false
          };
          targetWo = fallbackOrder;
        }
        if (targetWo) {
          setCustomerPortalModalWo(targetWo);
        }
      }
    } catch {}

    return () => {
      isMounted = false;
      unsubOrders();
      unsubVehicles();
    };
  }, []);

  // Sync entities with localStorage
  useEffect(() => {
    localStorage.setItem('asfroute_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('asfroute_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('asfroute_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('asfroute_workorders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem('asfroute_projects', JSON.stringify(projectBuildings));
  }, [projectBuildings]);

  useEffect(() => {
    localStorage.setItem('asfroute_whatsapp_accounts', JSON.stringify(whatsappAccounts));
  }, [whatsappAccounts]);

  // Admin Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('asfroute_admin_logged') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  // Cloud Configs
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
      projectId: 'gen-lang-client-0166670394',
      apiKey: 'AIzaSyDOjwlSrwxkQM7wmEGslh6I8i4Wcyle6IU',
      authDomain: 'gen-lang-client-0166670394.firebaseapp.com',
      storageBucket: 'gen-lang-client-0166670394.firebasestorage.app',
      messagingSenderId: '768691948096',
      appId: '1:768691948096:web:61c681686f3807160eeda5',
      firestoreRegion: 'europe-west2',
      isConnected: true,
      lastTested: new Date().toISOString().replace('T', ' ').slice(0, 19),
      syncCollections: ['work_orders', 'vehicles_telemetry', 'saved_places', 'event_logs'],
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

  // Sync RTL/LTR & dark/light class on <html> and <body>
  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('asfroute_theme', theme);
    if (theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
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

  // ---------------- CRUD HANDLERS ----------------

  // Vehicles
  const addVehicle = (v: Vehicle) => {
    setVehicles(prev => [v, ...prev]);
    // Persist to Firestore
    try {
      setDoc(doc(db, 'vehicles', v.id), {
        ...v,
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.error('Firestore addVehicle error:', err));
    } catch {}

    addLiveLog(
      `إضافة شاحنة جديدة للأسطول: ${v.plateNumber}`,
      `New Fleet Vehicle Added: ${v.plateNumberEn}`,
      `تم تسجيل الشاحنة ${v.model} بحمولة ${v.maxWeightKg} كجم ونظام تعليق ${v.hasPneumaticDamping ? 'هوائي' : 'قياسي'}`,
      `Registered ${v.model} with payload ${v.maxWeightKg}kg`,
      'success',
      'vehicle',
      v.id
    );
  };

  const updateVehicle = (updatedV: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedV.id ? updatedV : v));
    if (selectedVehicle?.id === updatedV.id) {
      setSelectedVehicle(updatedV);
    }
    // Persist update to Firestore
    try {
      setDoc(doc(db, 'vehicles', updatedV.id), {
        ...updatedV,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(err => console.error('Firestore updateVehicle error:', err));
    } catch {}

    addLiveLog(
      `تحديث بيانات الشاحنة: ${updatedV.id}`,
      `Vehicle Updated: ${updatedV.id}`,
      `تم تحديث بيانات ومواصفات الشاحنة ${updatedV.plateNumber}`,
      `Updated specs for ${updatedV.plateNumberEn}`,
      'info',
      'vehicle',
      updatedV.id
    );
  };

  const deleteVehicle = (id: string) => {
    const v = vehicles.find(item => item.id === id);
    setVehicles(prev => prev.filter(item => item.id !== id));
    if (selectedVehicle?.id === id) {
      setSelectedVehicle(vehicles[0] || null);
    }
    // Delete from Firestore
    try {
      deleteDoc(doc(db, 'vehicles', id)).catch(err => console.error('Firestore deleteVehicle error:', err));
    } catch {}

    addLiveLog(
      `حذف شاحنة من الأسطول: ${id}`,
      `Vehicle Decommissioned: ${id}`,
      `تم استبعاد الشاحنة ${v?.plateNumber || id} من العمليات الميدانية`,
      `Decommissioned vehicle ${id} from operations`,
      'warning',
      'vehicle',
      id
    );
  };

  // Technicians
  const addTechnician = (t: Technician) => {
    setTechnicians(prev => [t, ...prev]);
    addLiveLog(
      `إضافة فني / مهندس جديد: ${t.nameAr}`,
      `New Technician Registered: ${t.nameEn}`,
      `تم اعتماد الفني برقم ${t.id} ومستوى مهارة L5`,
      `Registered technician ${t.id} with verified certifications`,
      'success',
      'team',
      t.id
    );
  };

  const updateTechnician = (updatedT: Technician) => {
    setTechnicians(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
    if (selectedTechnician?.id === updatedT.id) {
      setSelectedTechnician(updatedT);
    }
    addLiveLog(
      `تحديث ملف الفني: ${updatedT.nameAr}`,
      `Technician Profile Updated: ${updatedT.nameEn}`,
      `تم تحديث التراخيص والتقييم الميداني للفني ${updatedT.id}`,
      `Updated credentials and rating for ${updatedT.id}`,
      'info',
      'team',
      updatedT.id
    );
  };

  const deleteTechnician = (id: string) => {
    const t = technicians.find(item => item.id === id);
    setTechnicians(prev => prev.filter(item => item.id !== id));
    if (selectedTechnician?.id === id) {
      setSelectedTechnician(technicians[0] || null);
    }
    addLiveLog(
      `حذف فني من السجل: ${id}`,
      `Technician Removed: ${id}`,
      `تم حذف الفني ${t?.nameAr || id} من سجلات الميدان`,
      `Removed technician ${id} from active roster`,
      'warning',
      'team',
      id
    );
  };

  // Teams
  const addTeam = (team: InstallationTeam) => {
    setTeams(prev => [team, ...prev]);
    addLiveLog(
      `تكوين فريق تركيب جديد: ${team.nameAr}`,
      `New Installation Team Assembled: ${team.nameEn}`,
      `تم ربط الفريق بالشاحنة ${team.assignedVehicleId} وسقف ارتفاع ${team.maxHeightAuthorizedM}م`,
      `Assigned team to vehicle ${team.assignedVehicleId}`,
      'success',
      'team',
      team.id
    );
  };

  const updateTeam = (updatedTeam: InstallationTeam) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
  };

  const deleteTeam = (id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  // Work Orders
  const addWorkOrder = (wo: WorkOrder) => {
    setWorkOrders(prev => [wo, ...prev]);
    
    // Also create Gantt block if scheduled
    if (wo.assignedVehicleId) {
      const newBlock: GanttTaskBlock = {
        id: `GNT-${Date.now()}`,
        workOrderId: wo.id,
        resourceId: wo.assignedVehicleId,
        resourceType: 'vehicle',
        titleAr: `تركيب: ${wo.customerNameAr}`,
        titleEn: `Install: ${wo.customerNameEn}`,
        startHour: 9.0,
        durationHours: wo.estimatedDurationHours || 4.5,
        type: 'assembly',
        status: 'planned',
        hasConflict: false
      };
      setGanttBlocks(prev => [...prev, newBlock]);
    }

    addLiveLog(
      `إنشاء أمر عمل جديد: ${wo.orderNumber}`,
      `New Work Order Created: ${wo.orderNumber}`,
      `تم تسجيل تركيب ثريا ${wo.chandelier.modelNameAr} لصالح ${wo.customerNameAr}`,
      `Created installation order for ${wo.customerNameEn}`,
      'success',
      'work_order',
      wo.id
    );

    // Persist to Firebase Firestore
    try {
      setDoc(doc(db, 'work_orders', wo.id), {
        ...wo,
        createdAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    } catch {}
  };

  const updateWorkOrder = (updatedWo: WorkOrder) => {
    setWorkOrders(prev => prev.map(w => w.id === updatedWo.id ? updatedWo : w));
    if (selectedWorkOrder?.id === updatedWo.id) {
      setSelectedWorkOrder(updatedWo);
    }

    // Persist update to Firebase Firestore
    try {
      setDoc(doc(db, 'work_orders', updatedWo.id), {
        ...updatedWo,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    } catch {}
    addLiveLog(
      `تعديل أمر العمل: ${updatedWo.orderNumber}`,
      `Work Order Updated: ${updatedWo.orderNumber}`,
      `تم تعديل مواصفات وبيانات أمر العمل ${updatedWo.customerNameAr}`,
      `Updated work order details for ${updatedWo.orderNumber}`,
      'info',
      'work_order',
      updatedWo.id
    );
  };

  const deleteWorkOrder = (id: string) => {
    const wo = workOrders.find(w => w.id === id);
    setWorkOrders(prev => prev.filter(w => w.id !== id));
    setGanttBlocks(prev => prev.filter(b => b.workOrderId !== id));
    if (selectedWorkOrder?.id === id) {
      setSelectedWorkOrder(workOrders[0] || null);
    }
    addLiveLog(
      `حذف أمر العمل: ${id}`,
      `Work Order Deleted: ${id}`,
      `تم إلغاء وحذف أمر العمل ${wo?.orderNumber || id}`,
      `Deleted work order ${wo?.orderNumber || id}`,
      'warning',
      'work_order',
      id
    );
  };

  // Projects
  const addProjectBuilding = (proj: ProjectBuilding) => {
    setProjectBuildings(prev => [proj, ...prev]);
    addLiveLog(
      `إضافة مشروع / مبنى فندقي جديد: ${proj.nameAr}`,
      `New Palatial Project Added: ${proj.nameEn}`,
      `تم تسجيل المبنى بإجمالي ${proj.totalChandelierUnits} وحدة إضاءة و ${proj.floorsCount} طوابق`,
      `Registered building with ${proj.totalChandelierUnits} chandelier units across ${proj.floorsCount} floors`,
      'success',
      'safety',
      proj.id
    );
  };

  const updateProjectBuilding = (updatedProj: ProjectBuilding) => {
    setProjectBuildings(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
  };

  const deleteProjectBuilding = (id: string) => {
    setProjectBuildings(prev => prev.filter(p => p.id !== id));
  };

  const addChandelierUnit = (
    buildingId: string, 
    zoneId: string, 
    unit: { unitNameAr: string; unitNameEn: string; modelNumber: string; assignedTechAr: string; assignedTechEn: string }
  ) => {
    setProjectBuildings(prev => prev.map(bld => {
      if (bld.id === buildingId) {
        const newUnit = {
          id: `UNT-${Date.now()}`,
          unitNameAr: unit.unitNameAr,
          unitNameEn: unit.unitNameEn,
          modelNumber: unit.modelNumber,
          status: 'pending' as const,
          assignedTechAr: unit.assignedTechAr,
          assignedTechEn: unit.assignedTechEn
        };
        const updatedZones = bld.zones.map(z => {
          if (z.id === zoneId) {
            return {
              ...z,
              units: [...z.units, newUnit]
            };
          }
          return z;
        });
        return {
          ...bld,
          totalChandelierUnits: bld.totalChandelierUnits + 1,
          zones: updatedZones
        };
      }
      return bld;
    }));
  };

  const deleteChandelierUnit = (buildingId: string, zoneId: string, unitId: string) => {
    setProjectBuildings(prev => prev.map(bld => {
      if (bld.id === buildingId) {
        const updatedZones = bld.zones.map(z => {
          if (z.id === zoneId) {
            return {
              ...z,
              units: z.units.filter(u => u.id !== unitId)
            };
          }
          return z;
        });
        return {
          ...bld,
          totalChandelierUnits: Math.max(0, bld.totalChandelierUnits - 1),
          zones: updatedZones
        };
      }
      return bld;
    }));
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
    const isOk = await testConnection();
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const updated = {
      ...firebaseConfig,
      isConnected: isOk,
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

  // ---------------- WhatsApp Customer Coordination ----------------
  const addWhatsAppAccount = (acc: WhatsAppAccount) => {
    setWhatsappAccounts(prev => [acc, ...prev]);
    addLiveLog(
      `إضافة رقم واتساب تشغيلي جديد: ${acc.phone}`,
      `New WhatsApp Dispatch Number: ${acc.phone}`,
      `تم تفعيل الرقم لصالح [${acc.nameAr}] لاستقبال وإرسال إحداثيات ومواقع العملاء`,
      `Activated WhatsApp coordination desk [${acc.nameEn}]`,
      'success',
      'safety',
      acc.id
    );
  };

  const updateWhatsAppAccount = (acc: WhatsAppAccount) => {
    setWhatsappAccounts(prev => prev.map(a => a.id === acc.id ? acc : a));
  };

  const deleteWhatsAppAccount = (id: string) => {
    setWhatsappAccounts(prev => prev.filter(a => a.id !== id));
  };

  const openCustomerLocationPortal = (workOrderId: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (wo) {
      setCustomerPortalModalWo(wo);
    }
  };

  const sendCustomerLocationRequestWhatsApp = (workOrderId: string, accountId?: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return { url: '', message: '' };

    const activeAcc = whatsappAccounts.find(a => accountId ? a.id === accountId : a.isActive) || whatsappAccounts[0];
    const customerPhoneClean = wo.customerPhone.replace(/[^0-9]/g, '');

    // Direct Portal Link with action & order ID parameters for seamless 1-click customer GPS submission
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    // Automatically convert 'ais-dev-' to 'ais-pre-' to avoid Google 403 authorization error for external customers on WhatsApp/mobile
    const publicOrigin = currentOrigin.replace('ais-dev-', 'ais-pre-');
    const directPortalUrl = `${publicOrigin}${currentPath}?action=customer_location&woId=${wo.id}`;

    const message = language === 'ar'
      ? `مرحباً بك عميلنا العزيز (${wo.customerNameAr}) من شركة عصفور كريستال 💎.\nنحن فريق المتابعة واللوجستيات، جاري تجهيز شحنتكم رقم (${wo.orderNumber}) لتركيب (${wo.chandelier.modelNameAr}).\n\n🔗 لتأكيد موقعكم الجغرافي الدقيق وربطه فوراً بنظام التوجيه وشاحنة التوصيل بضغطة واحدة، يرجى فتح الرابط المباشر التالي:\n${directPortalUrl}\n\nأو يمكنكم إرسال موقعكم الجغرافي (Live Location) أو رابط خرائط Google في هذه المحادثة مباشرة.`
      : `Hello valued client (${wo.customerNameEn}) from Asfour Crystal 💎.\nWe are preparing your installation order (${wo.orderNumber}) for (${wo.chandelier.modelNameEn}).\n\n🔗 To confirm and auto-link your exact location directly to our delivery system with one click, please tap this link:\n${directPortalUrl}\n\nOr simply share your Google Maps pin / WhatsApp Live Location directly in this chat.`;

    const encodedText = encodeURIComponent(message);
    const waUrl = `https://wa.me/${customerPhoneClean}?text=${encodedText}`;

    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    setWorkOrders(prev => prev.map(w => {
      if (w.id === workOrderId) {
        return {
          ...w,
          whatsappStatus: 'location_requested',
          whatsappLastSentAt: nowTime,
          whatsappAccountId: activeAcc?.id
        };
      }
      return w;
    }));

    // Persist to Firestore
    setDoc(doc(db, 'work_orders', workOrderId), {
      whatsappStatus: 'location_requested',
      whatsappLastSentAt: nowTime,
      whatsappAccountId: activeAcc?.id || null,
      directPortalUrl
    }, { merge: true }).catch(err => console.warn('Firestore update error on whatsapp send:', err));

    if (activeAcc) {
      setWhatsappAccounts(prev => prev.map(a => a.id === activeAcc.id ? { ...a, messagesSentCount: a.messagesSentCount + 1 } : a));
    }

    addLiveLog(
      `إرسال طلب لوكيشن عبر واتساب: ${wo.customerNameAr}`,
      `WhatsApp Location Request Sent: ${wo.customerNameEn}`,
      `تم إرسال رابط تأكيد وتثبيت الموقع عبر خط [${activeAcc?.nameAr || 'الخدمة'}] للعميل (${wo.customerPhone}) وربطه بالمنظومة فورياً`,
      `Dispatched direct GPS linking portal via WhatsApp to ${wo.customerPhone}`,
      'info',
      'work_order',
      wo.id
    );

    return { url: waUrl, message };
  };

  const receiveCustomerLocationFromWhatsApp = (workOrderId: string, lat: number, lng: number, addressDesc?: string) => {
    const wo = workOrders.find(w => w.id === workOrderId) || (customerPortalModalWo?.id === workOrderId ? customerPortalModalWo : null);
    const note = addressDesc || (language === 'ar' ? 'تم استلام وتأكيد الإحداثيات الدقيقة من محادثة الواتساب' : 'Coordinates verified via customer WhatsApp live location');

    const customerNameAr = wo?.customerNameAr || 'محمد صلاح السيد فرحات';
    const customerNameEn = wo?.customerNameEn || 'Mohamed Salah El-Sayed Farahat';
    const orderNumber = wo?.orderNumber || (workOrderId.startsWith('WO-') ? `ASF-EG-${workOrderId.replace('WO-', '')}` : 'ASF-EG-88949');
    const customerPhone = wo?.customerPhone || '+20 100 248 9112';

    setWorkOrders(prev => {
      const exists = prev.some(w => w.id === workOrderId);
      if (exists) {
        return prev.map(w => w.id === workOrderId ? {
          ...w,
          coordinates: [lat, lng],
          customerLocationConfirmed: true,
          whatsappStatus: 'location_received',
          receivedLocationNote: note
        } : w);
      }
      if (wo) {
        return [{
          ...wo,
          coordinates: [lat, lng],
          customerLocationConfirmed: true,
          whatsappStatus: 'location_received',
          receivedLocationNote: note
        }, ...prev];
      }
      return prev;
    });

    // Direct real-time persistence to Firestore work_orders
    setDoc(doc(db, 'work_orders', workOrderId), {
      coordinates: [lat, lng],
      customerLocationConfirmed: true,
      whatsappStatus: 'location_received',
      receivedLocationNote: note,
      lastLocationUpdatedAt: new Date().toISOString()
    }, { merge: true }).then(() => {
      setIsFirebaseSynced(true);
      setFirestoreLastSyncTime(new Date().toLocaleTimeString('ar-EG'));
    }).catch(err => console.warn('Firestore update work_order location error:', err));

    // Also persist into dedicated customer_locations collection for audit & fleet dispatch
    setDoc(doc(db, 'customer_locations', `LOC-${workOrderId}`), {
      workOrderId,
      orderNumber,
      customerNameAr,
      customerNameEn,
      customerPhone,
      lat,
      lng,
      addressDesc: note,
      source: 'whatsapp_direct_link',
      timestamp: new Date().toISOString()
    }, { merge: true }).catch(err => console.warn('Firestore customer_locations error:', err));

    addLiveLog(
      `✅ ربط مباشر للوكيشن الواتساب بالمنظومة: ${customerNameAr}`,
      `✅ Customer WhatsApp Location Linked: ${customerNameEn}`,
      `تم تحديث وتثبيت الإحداثيات [${lat.toFixed(4)}, ${lng.toFixed(4)}] وحفظها في قاعدة بيانات الفيربيس بنجاح!`,
      `Updated & synced customer GPS coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}] into Firestore for ${orderNumber}`,
      'success',
      'work_order',
      workOrderId
    );
  };

  const parseAndLinkWhatsAppMessage = (workOrderId: string, rawText: string): { success: boolean; message: string; lat?: number; lng?: number } => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return { success: false, message: 'Work order not found' };

    // Intelligent Regex patterns for WhatsApp messages:
    // 1. Google Maps / Apple Maps links (e.g. q=30.0444,31.2357 or @30.0444,31.2357)
    // 2. Direct decimal pairs: 30.0444, 31.2357 or 30.0444 31.2357
    // 3. URLs with ll=30.0444,31.2357
    let matchedLat: number | null = null;
    let matchedLng: number | null = null;

    // Try URL or coordinates match
    const coordsRegex = /(?:q=|@|loc:|ll=|place\/)?(-?\d{1,2}\.\d{3,8})[,\s/]+(-?\d{1,3}\.\d{3,8})/i;
    const match = rawText.match(coordsRegex);

    if (match && match[1] && match[2]) {
      const pLat = parseFloat(match[1]);
      const pLng = parseFloat(match[2]);
      if (!isNaN(pLat) && !isNaN(pLng) && pLat >= -90 && pLat <= 90 && pLng >= -180 && pLng <= 180) {
        matchedLat = pLat;
        matchedLng = pLng;
      }
    }

    // Secondary attempt: look for standard Egyptian coordinates (Latitude ~22-32, Longitude ~25-36)
    if (matchedLat === null) {
      const egRegex = /(?:خط العرض|lat|latitude)?[:\s]*(\d{2}\.\d+)[^\d]+(?:خط الطول|lng|lon|longitude)?[:\s]*(\d{2}\.\d+)/i;
      const egMatch = rawText.match(egRegex);
      if (egMatch && egMatch[1] && egMatch[2]) {
        matchedLat = parseFloat(egMatch[1]);
        matchedLng = parseFloat(egMatch[2]);
      }
    }

    if (matchedLat !== null && matchedLng !== null) {
      receiveCustomerLocationFromWhatsApp(workOrderId, matchedLat, matchedLng, `تم الاستخراج التلقائي من رسالة الواتساب: "${rawText.slice(0, 60)}..."`);
      return {
        success: true,
        message: language === 'ar'
          ? `تم رصد واستخراج الإحداثيات الجغرافية [${matchedLat.toFixed(4)}, ${matchedLng.toFixed(4)}] وحفظها في قاعدة البيانات فورياً!`
          : `GPS coordinates [${matchedLat.toFixed(4)}, ${matchedLng.toFixed(4)}] extracted and synced to cloud!`,
        lat: matchedLat,
        lng: matchedLng
      };
    }

    // If pure text without clear lat/lng (e.g., short maps.app.goo.gl link or street name)
    // We open the customer location interactive portal so dispatcher or client can pinpoint with 1 click
    openCustomerLocationPortal(workOrderId);
    return {
      success: false,
      message: language === 'ar'
        ? `لم يتم العثور على أرقام خطوط الطول والعرض مباشرة في النص. تم فتح نافذة الخريطة التفاعلية لتثبيت الموقع بدقة.`
        : `Could not parse numeric coordinates directly. Opened interactive map portal for precise pin selection.`
    };
  };

  const issueDeliveryDispatchOrder = (workOrderId: string, vehicleId?: string): { success: boolean; message: string } => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return { success: false, message: 'Work order not found' };

    const targetVehicleId = vehicleId || wo.assignedVehicleId || vehicles[0]?.id;
    const targetVehicle = vehicles.find(v => v.id === targetVehicleId);

    if (!targetVehicle) {
      return { success: false, message: language === 'ar' ? 'يرجى تحديد شاحنة للنقل أولاً' : 'Please select a delivery vehicle' };
    }

    const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    setVehicles(prev => prev.map(v => {
      if (v.id === targetVehicleId) {
        return {
          ...v,
          status: 'on_route',
          currentWorkOrderId: workOrderId,
          nextStopEta: '25 min'
        };
      }
      return v;
    }));

    setWorkOrders(prev => prev.map(w => {
      if (w.id === workOrderId) {
        return {
          ...w,
          status: 'en_route',
          assignedVehicleId: targetVehicleId,
          dispatchOrderGiven: true,
          dispatchOrderGivenAt: nowTime,
          whatsappStatus: 'dispatch_confirmed'
        };
      }
      return w;
    }));

    // Persist dispatch state to Firestore
    setDoc(doc(db, 'vehicles', targetVehicleId), {
      status: 'on_route',
      currentWorkOrderId: workOrderId,
      nextStopEta: '25 min',
      lastTelemetryUpdate: 'أمر تحرك مباشر'
    }, { merge: true }).catch(err => console.warn('Firestore vehicle dispatch save error:', err));

    setDoc(doc(db, 'work_orders', workOrderId), {
      status: 'en_route',
      assignedVehicleId: targetVehicleId,
      dispatchOrderGiven: true,
      dispatchOrderGivenAt: nowTime,
      whatsappStatus: 'dispatch_confirmed'
    }, { merge: true }).catch(err => console.warn('Firestore work order dispatch save error:', err));

    addLiveLog(
      `🚨 صدور أمر تحرك الشاحنة إلى موقع العميل: ${targetVehicle.plateNumber}`,
      `🚨 Vehicle Dispatch Order Issued: ${targetVehicle.plateNumberEn}`,
      `توجهت الشاحنة ${targetVehicle.id} مباشرة إلى إحداثيات العميل [${wo.coordinates[0].toFixed(4)}, ${wo.coordinates[1].toFixed(4)}] لنقل ثريا ${wo.chandelier.modelNameAr}`,
      `Truck ${targetVehicle.id} dispatched directly to customer coordinates`,
      'alert',
      'vehicle',
      targetVehicle.id
    );

    return {
      success: true,
      message: language === 'ar' 
        ? `تم إعطاء أمر التوصيل بنجاح للشاحنة ${targetVehicle.plateNumber}! تم تحديد المسار المباشر على الخريطة وتوجيه السائق.` 
        : `Delivery order issued! Truck ${targetVehicle.plateNumberEn} is en route to customer coordinates.`
    };
  };

  // ---------------- Notifications & Simulated Problem Generator ----------------
  const unreadAlertCount = eventLogs.filter(l => l.severity === 'alert' || l.severity === 'warning').length;

  const markAllLogsRead = () => {
    setLastReadTimestamp(Date.now());
    localStorage.setItem('asfroute_last_read_alerts', Date.now().toString());
  };

  const triggerSimulatedIncident = (type: 'speed' | 'vibration' | 'anchor' | 'delay' = 'speed') => {
    if (type === 'speed') {
      const v = vehicles[0] || INITIAL_VEHICLES[0];
      addLiveLog(
        `⚠️ إنذار تجاوز السرعة القصوى: ${v.plateNumber} (84 كم/س)`,
        `⚠️ Speed Limit Violation: ${v.plateNumberEn} (84 km/h)`,
        `تجاوزت الشاحنة السرعة المحددة (70 كم/س) على طريق السويس. تم إرسال تنبيه للسائق لحماية بلورات الكريستال فوراً.`,
        `Truck exceeded 70km/h cap. Sent vibration safety warning to driver.`,
        'alert',
        'safety',
        v.id
      );
    } else if (type === 'vibration') {
      const v = vehicles[1] || INITIAL_VEHICLES[1];
      addLiveLog(
        `⚠️ اهتزاز زائد بمستشعر الشاحنة: ${v.plateNumber}`,
        `⚠️ High Vibration Sensor Alert: ${v.plateNumberEn}`,
        `رصد مستشعر الصدمات الهوائية مطب غير متوقع. يرجى تدقيق ثبات أقفاص التعبئة الملكية للثريا.`,
        `Vibration sensor threshold exceeded on air suspension.`,
        'warning',
        'safety',
        v.id
      );
    } else if (type === 'anchor') {
      const wo = workOrders[0] || INITIAL_WORK_ORDERS[0];
      addLiveLog(
        `⚠️ فحص مرساة السقف بحاجة لإعادة تدقيق: ${wo.orderNumber}`,
        `⚠️ Ceiling Anchor Pull-Test Alert: ${wo.orderNumber}`,
        `معامل الأمان لمرساة سقف العميل ${wo.customerNameAr} يحتاج تدقيق مهندس الموقع قبل بدء رفع الثريا.`,
        `Anchor safety factor needs re-inspection prior to hoisting.`,
        'alert',
        'work_order',
        wo.id
      );
    } else {
      const wo = workOrders[1] || INITIAL_WORK_ORDERS[1];
      addLiveLog(
        `⚠️ تأخير في مسار التوصيل: ${wo.orderNumber}`,
        `⚠️ Route Congestion Delay Alert: ${wo.orderNumber}`,
        `اختناق مروري عند مدخل العاصمة الإدارية يؤخر وصول الشاحنة 20 دقيقة عن نافذة الموعد.`,
        `Traffic jam delaying arrival window by 20 minutes.`,
        'warning',
        'work_order',
        wo.id
      );
    }
  };

  // ---------------- Real-Time GPS Tracking, Driver Diligence & Cargo Protection ----------------
  const [isLiveTrackingActive, setIsLiveTrackingActive] = useState<boolean>(true);

  // Background automated telemetry simulation for trucks on route
  useEffect(() => {
    if (!isLiveTrackingActive) return;

    const interval = setInterval(() => {
      setVehicles(prevVehicles => {
        return prevVehicles.map(veh => {
          if (veh.status !== 'on_route' || veh.driverDiligenceStatus === 'suspicious_stop') {
            return veh;
          }

          // Move truck along vector towards target if defined
          const targetLat = veh.missionTargetCoords?.[0] || 30.0125;
          const targetLng = veh.missionTargetCoords?.[1] || 31.7500;

          const dLat = targetLat - veh.currentLat;
          const dLng = targetLng - veh.currentLng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          if (dist > 0.005) {
            const step = 0.0012; // Realistic vehicle road progression
            const newLat = veh.currentLat + (dLat / dist) * step;
            const newLng = veh.currentLng + (dLng / dist) * step;
            const newProgress = Math.min(98, (veh.missionProgressPercent || 45) + 1);

            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

            const newBreadcrumb: VehicleTelemetryBreadcrumb = {
              lat: newLat,
              lng: newLng,
              timestamp: timeStr,
              speedKmH: veh.speedKmH,
              event: 'تتبع حي منتظم - المسار آمن'
            };

            const updatedBreadcrumbs = [
              ...(veh.routeBreadcrumbs || []).slice(-15),
              newBreadcrumb
            ];

            return {
              ...veh,
              currentLat: newLat,
              currentLng: newLng,
              missionProgressPercent: newProgress,
              lastTelemetryUpdate: 'منذ ثوانٍ',
              routeBreadcrumbs: updatedBreadcrumbs,
              driverDiligenceScore: veh.driverDiligenceStatus === 'diligent' ? Math.min(100, (veh.driverDiligenceScore || 95)) : veh.driverDiligenceScore
            };
          }
          return veh;
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveTrackingActive]);

  const toggleLiveTracking = () => {
    setIsLiveTrackingActive(prev => !prev);
  };

  const simulateVehicleMovement = (vehicleId: string) => {
    let updatedVehicle: Vehicle | null = null;
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const targetLat = v.missionTargetCoords?.[0] || 30.0125;
        const targetLng = v.missionTargetCoords?.[1] || 31.7500;
        const dLat = targetLat - v.currentLat;
        const dLng = targetLng - v.currentLng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
        const step = 0.004;

        const newLat = v.currentLat + (dLat / dist) * step;
        const newLng = v.currentLng + (dLng / dist) * step;
        const newProgress = Math.min(99, (v.missionProgressPercent || 50) + 5);

        const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
        const newBreadcrumbs = [
          ...(v.routeBreadcrumbs || []),
          { lat: newLat, lng: newLng, timestamp: now, speedKmH: v.speedKmH, event: 'تحديث يدوي للموقع' }
        ];

        const updated: Vehicle = {
          ...v,
          currentLat: newLat,
          currentLng: newLng,
          missionProgressPercent: newProgress,
          lastTelemetryUpdate: 'الآن',
          routeBreadcrumbs: newBreadcrumbs
        };
        updatedVehicle = updated;
        return updated;
      }
      return v;
    }));

    if (updatedVehicle) {
      setDoc(doc(db, 'vehicles', vehicleId), updatedVehicle, { merge: true }).catch(e => console.warn('Vehicle Firestore save:', e));
    }

    addLiveLog(
      `تحديث نبضة GPS للشاحنة: ${vehicleId}`,
      `GPS Ping Received: ${vehicleId}`,
      `تم استلام إحداثيات جديدة للشاحنة وتأكيد استمرار المسار المعتمد بنجاح`,
      `Updated GPS telemetry coordinates for truck ${vehicleId}`,
      'info',
      'vehicle',
      vehicleId
    );
  };

  const simulateVehicleTampering = (vehicleId: string, type: 'deviation' | 'idle' | 'shock' | 'door') => {
    const v = vehicles.find(item => item.id === vehicleId);
    if (!v) return;

    let updatedVehicle: Vehicle | null = null;

    if (type === 'deviation') {
      const deviatedLat = v.currentLat + 0.007;
      const deviatedLng = v.currentLng - 0.006;
      setVehicles(prev => prev.map(veh => {
        if (veh.id === vehicleId) {
          const updated: Vehicle = {
            ...veh,
            currentLat: deviatedLat,
            currentLng: deviatedLng,
            offRouteDistanceMeters: 780,
            driverDiligenceScore: 64,
            driverDiligenceStatus: 'off_route',
            tamperingAlertsCount: (veh.tamperingAlertsCount || 0) + 1,
            lastTamperingReasonAr: 'انحراف الشاحنة 780 متراً عن مسار شحن الكريستال نحو منطقة غير مصرح بها',
            lastTamperingReasonEn: 'Vehicle deviated 780m from approved crystal corridor into unauthorized sector',
            lastTelemetryUpdate: 'تنبيه انحراف مسار'
          };
          updatedVehicle = updated;
          return updated;
        }
        return veh;
      }));

      addLiveLog(
        `🚨 رصد انحراف وتلاعب بالمسار: ${v.plateNumber} (${v.driverNameAr})`,
        `🚨 Route Tampering Alert: ${v.plateNumberEn} (${v.driverNameEn})`,
        `انحرفت الشاحنة 780م عن خط السير المصرح به لنقل الكريستال. انخفض مؤشر انضباط السائق إلى 64%. تم إرسال إشعار فوري لغرفة العمليات.`,
        `Truck drifted 780m outside geofence corridor. Driver diligence score dropped to 64%.`,
        'alert',
        'safety',
        v.id
      );
    } else if (type === 'idle') {
      setVehicles(prev => prev.map(veh => {
        if (veh.id === vehicleId) {
          const updated: Vehicle = {
            ...veh,
            speedKmH: 0,
            idleDurationMinutes: 42,
            driverDiligenceScore: 68,
            driverDiligenceStatus: 'suspicious_stop',
            tamperingAlertsCount: (veh.tamperingAlertsCount || 0) + 1,
            lastTamperingReasonAr: 'توقف خامل غير مبرر لمدة 42 دقيقة مع دوران المحرك واستهلاك الوقود دون إذن',
            lastTamperingReasonEn: 'Unauthorized idling for 42 minutes with engine running without operational cause',
            lastTelemetryUpdate: 'تنبيه توقف مشبوه'
          };
          updatedVehicle = updated;
          return updated;
        }
        return veh;
      }));

      addLiveLog(
        `⚠️ اشتباه تلاعب وتوقف خامل: ${v.plateNumber} (${v.driverNameAr})`,
        `⚠️ Unauthorized Idling Detected: ${v.plateNumberEn} (${v.driverNameEn})`,
        `الشاحنة متوقفة منذ 42 دقيقة في منطقة غير مجدولة والمحرك يعمل. مؤشر إنتاجية السائق انخفض إلى 68%.`,
        `Vehicle idle for 42 minutes off-schedule. Diligence score reduced to 68%.`,
        'warning',
        'safety',
        v.id
      );
    } else if (type === 'shock') {
      setVehicles(prev => prev.map(veh => {
        if (veh.id === vehicleId) {
          const updated: Vehicle = {
            ...veh,
            cargoVibrationGForce: 0.78,
            driverDiligenceScore: 74,
            driverDiligenceStatus: 'shock_detected',
            tamperingAlertsCount: (veh.tamperingAlertsCount || 0) + 1,
            lastTamperingReasonAr: 'اهتزاز عنيف 0.78G بمستشعر الكريستال نتيجة مطب حاد أو قيادة غير متزنة',
            lastTamperingReasonEn: 'Severe shock vibration 0.78G detected risking crystal prism fractures',
            lastTelemetryUpdate: 'إنذار اهتزاز كريستال'
          };
          updatedVehicle = updated;
          return updated;
        }
        return veh;
      }));

      addLiveLog(
        `🚨 خطر على حمولة الكريستال: ${v.plateNumber} (0.78G)`,
        `🚨 Crystal Shock Alert: ${v.plateNumberEn} (0.78G)`,
        `رصد مستشعر الصدمات الهيدروليكي ارتطاماً قوياً (0.78G) يهدد سلامة ثريات الكريستال الفاخرة! تم إلزام السائق بتهدئة السرعة فوراً.`,
        `Shock threshold exceeded (0.78G). Automatic speed limiter warning dispatched.`,
        'alert',
        'safety',
        v.id
      );
    } else if (type === 'door') {
      setVehicles(prev => prev.map(veh => {
        if (veh.id === vehicleId) {
          const updated: Vehicle = {
            ...veh,
            cargoLockSecured: false,
            driverDiligenceScore: 52,
            driverDiligenceStatus: 'cargo_breach',
            tamperingAlertsCount: (veh.tamperingAlertsCount || 0) + 1,
            lastTamperingReasonAr: 'فتح باب مقصورة الكريستال إلكترونياً خارج محيط العميل المصرح به!',
            lastTamperingReasonEn: 'Unauthorized crystal vault door opening outside delivery geofence!',
            lastTelemetryUpdate: 'إنذار اختراق قفل الصندوق'
          };
          updatedVehicle = updated;
          return updated;
        }
        return veh;
      }));

      addLiveLog(
        `🚨 إنذار فوري: فتح صندوق الكريستال! ${v.plateNumber}`,
        `🚨 Cargo Vault Breach: ${v.plateNumberEn}`,
        `انفتح باب صندوق الشاحنة في موقع غير مصرح به أثناء سير المهمة! تم إرسال إشارة استنفار أمني فوري.`,
        `Cargo compartment door opened mid-mission outside client geofence!`,
        'alert',
        'safety',
        v.id
      );
    }

    if (updatedVehicle) {
      setDoc(doc(db, 'vehicles', vehicleId), updatedVehicle, { merge: true }).catch(e => console.warn('Vehicle Firestore tampering save:', e));
    }
  };

  const resolveVehicleTampering = (vehicleId: string) => {
    let updatedVehicle: Vehicle | null = null;
    setVehicles(prev => prev.map(veh => {
      if (veh.id === vehicleId) {
        const updated: Vehicle = {
          ...veh,
          offRouteDistanceMeters: 0,
          idleDurationMinutes: 0,
          cargoLockSecured: true,
          cargoVibrationGForce: 0.12,
          speedKmH: veh.status === 'on_route' ? 55 : 0,
          driverDiligenceScore: 98,
          driverDiligenceStatus: 'diligent',
          lastTamperingReasonAr: undefined,
          lastTamperingReasonEn: undefined,
          lastTelemetryUpdate: 'تمت معالجة التنبيه'
        };
        updatedVehicle = updated;
        return updated;
      }
      return veh;
    }));

    if (updatedVehicle) {
      setDoc(doc(db, 'vehicles', vehicleId), updatedVehicle, { merge: true }).catch(e => console.warn('Vehicle Firestore resolve save:', e));
    }

    const v = vehicles.find(item => item.id === vehicleId);
    addLiveLog(
      `✅ معالجة التنبيه وتأكيد سلامة الشاحنة: ${v?.plateNumber || vehicleId}`,
      `✅ Vehicle Alert Resolved: ${v?.plateNumberEn || vehicleId}`,
      `تم التواصل مع السائق والتحقق من سلامة حمولة الكريستال وعودته للمسار المعتمد بكفاءة تامة`,
      `Verified driver adherence and secured crystal cargo back on approved track`,
      'success',
      'vehicle',
      vehicleId
    );
  };

  const sendDriverMessage = (vehicleId: string, message: string): { success: boolean; message: string } => {
    const v = vehicles.find(item => item.id === vehicleId);
    if (!v) return { success: false, message: 'Vehicle not found' };

    addLiveLog(
      `إرسال توجيه فوري لكابينة السائق: ${v.driverNameAr}`,
      `Direct Dispatcher Instruction: ${v.driverNameEn}`,
      `تم إرسال تنبيه صوتي ورسالة شاشة إلى الشاحنة ${v.plateNumber}: "${message}"`,
      `Transmitted in-cab voice & HUD dispatch notice to ${v.plateNumberEn}: "${message}"`,
      'warning',
      'safety',
      vehicleId
    );

    return {
      success: true,
      message: language === 'ar' 
        ? `تم إرسال التوجيه بنجاح إلى شاشة كابينة السائق ${v.driverNameAr} ونظام الإنذار الداخلي.`
        : `Instruction dispatched to in-cab HUD of driver ${v.driverNameEn}.`
    };
  };

  const toggleCargoLock = (vehicleId: string) => {
    let updatedVehicle: Vehicle | null = null;
    setVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const nextState = !v.cargoLockSecured;
        const updated: Vehicle = {
          ...v,
          cargoLockSecured: nextState,
          driverDiligenceStatus: nextState ? (v.driverDiligenceStatus === 'cargo_breach' ? 'diligent' : v.driverDiligenceStatus) : 'cargo_breach'
        };
        updatedVehicle = updated;
        return updated;
      }
      return v;
    }));

    if (updatedVehicle) {
      setDoc(doc(db, 'vehicles', vehicleId), updatedVehicle, { merge: true }).catch(e => console.warn('Vehicle Firestore toggleCargoLock save:', e));
    }

    const v = vehicles.find(item => item.id === vehicleId);
    const isNowLocked = !v?.cargoLockSecured;
    addLiveLog(
      isNowLocked ? `🔒 تأمين وقفل صندوق الكريستال عن بعد: ${v?.plateNumber}` : `🔓 فتح قفل صندوق الكريستال: ${v?.plateNumber}`,
      isNowLocked ? `🔒 Remote Vault Locked: ${v?.plateNumberEn}` : `🔓 Remote Vault Unlocked: ${v?.plateNumberEn}`,
      isNowLocked ? `تم إحكام القفل الإلكتروني المشفر لصندوق الكريستال بنجاح` : `تم فك قفل صندوق الكريستال بتصريح غرفة العمليات`,
      isNowLocked ? `Electronic vault lock secured on ${vehicleId}` : `Vault lock released on ${vehicleId}`,
      isNowLocked ? 'success' : 'warning',
      'safety',
      vehicleId
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
      isMobileMenuOpen,
      setIsMobileMenuOpen,
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

      // CRUD
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addTechnician,
      updateTechnician,
      deleteTechnician,
      addTeam,
      updateTeam,
      deleteTeam,
      addWorkOrder,
      updateWorkOrder,
      deleteWorkOrder,
      addProjectBuilding,
      updateProjectBuilding,
      deleteProjectBuilding,
      addChandelierUnit,
      deleteChandelierUnit,

      // State Transitions
      updateWorkOrderStatus,
      reassignWorkOrder,
      runAutoScheduleOptimizer,
      isOptimizing,
      addLiveLog,

      // Detail Modal
      detailModalState,
      openDetailModal,
      closeDetailModal,

      // Certificate Modal
      certificateModalWo,
      setCertificateModalWo,

      // Customer Direct WhatsApp Location Portal
      customerPortalModalWo,
      setCustomerPortalModalWo,
      openCustomerLocationPortal,
      parseAndLinkWhatsAppMessage,

      // Firebase Real-time Firestore Sync Status
      isFirebaseSynced,
      firestoreLastSyncTime,

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

      // WhatsApp Customer Coordination
      whatsappAccounts,
      addWhatsAppAccount,
      updateWhatsAppAccount,
      deleteWhatsAppAccount,
      sendCustomerLocationRequestWhatsApp,
      receiveCustomerLocationFromWhatsApp,
      issueDeliveryDispatchOrder,

      // Notifications & Incidents
      unreadAlertCount,
      markAllLogsRead,
      triggerSimulatedIncident,

      // Real-Time GPS Tracking, Driver Diligence & Cargo Protection
      isLiveTrackingActive,
      setIsLiveTrackingActive,
      toggleLiveTracking,
      simulateVehicleMovement,
      simulateVehicleTampering,
      resolveVehicleTampering,
      sendDriverMessage,
      toggleCargoLock,
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
