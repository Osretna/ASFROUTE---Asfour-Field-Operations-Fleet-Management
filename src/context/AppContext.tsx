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
  SystemSecurityConfig,
  WhatsAppAccount
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

  // Real-Time Notifications & Incident Alert Management
  unreadAlertCount: number;
  markAllLogsRead: () => void;
  triggerSimulatedIncident: (type?: 'speed' | 'vibration' | 'anchor' | 'delay') => void;
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

  // Presentation Detail Modal State
  const [detailModalState, setDetailModalState] = useState<DetailModalState | null>(null);

  const openDetailModal = (type: DetailEntityType, data: any) => {
    setDetailModalState({ type, data });
  };

  const closeDetailModal = () => {
    setDetailModalState(null);
  };

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
  };

  const updateWorkOrder = (updatedWo: WorkOrder) => {
    setWorkOrders(prev => prev.map(w => w.id === updatedWo.id ? updatedWo : w));
    if (selectedWorkOrder?.id === updatedWo.id) {
      setSelectedWorkOrder(updatedWo);
    }
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

  const sendCustomerLocationRequestWhatsApp = (workOrderId: string, accountId?: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return { url: '', message: '' };

    const activeAcc = whatsappAccounts.find(a => accountId ? a.id === accountId : a.isActive) || whatsappAccounts[0];
    const customerPhoneClean = wo.customerPhone.replace(/[^0-9]/g, '');

    const message = language === 'ar'
      ? `مرحباً بك عميلنا العزيز (${wo.customerNameAr}) من شركة عصفور كريستال 💎.\nنحن فريق المتابعة والتوصيل، جاري تجهيز شحنتكم رقم (${wo.orderNumber}) لتركيب (${wo.chandelier.modelNameAr}).\n\nيرجى التكرم بإرسال الموقع الجغرافي الدقيق للعنوان (Live Location أو رابط خرائط Google) عبر هذه المحادثة حتى تتوجه سيارة التوصيل وفريق التركيب إليكم مباشرة وبدون أي تأخير.`
      : `Hello valued client (${wo.customerNameEn}) from Asfour Crystal 💎.\nWe are preparing your installation order (${wo.orderNumber}) for (${wo.chandelier.modelNameEn}).\n\nPlease share your exact location pin or Google Maps link via WhatsApp so our delivery vehicle and rigging team arrive directly at your address.`;

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

    if (activeAcc) {
      setWhatsappAccounts(prev => prev.map(a => a.id === activeAcc.id ? { ...a, messagesSentCount: a.messagesSentCount + 1 } : a));
    }

    addLiveLog(
      `إرسال طلب لوكيشن عبر واتساب: ${wo.customerNameAr}`,
      `WhatsApp Location Request Sent: ${wo.customerNameEn}`,
      `تم إرسال رسالة واتساب للعميل عبر خط [${activeAcc?.nameAr || 'الخدمة'}] لطلب إحداثيات الموقع الدقيق للشحنة`,
      `Dispatched location request via WhatsApp to ${wo.customerPhone}`,
      'info',
      'work_order',
      wo.id
    );

    return { url: waUrl, message };
  };

  const receiveCustomerLocationFromWhatsApp = (workOrderId: string, lat: number, lng: number, addressDesc?: string) => {
    const wo = workOrders.find(w => w.id === workOrderId);
    if (!wo) return;

    setWorkOrders(prev => prev.map(w => {
      if (w.id === workOrderId) {
        return {
          ...w,
          coordinates: [lat, lng],
          customerLocationConfirmed: true,
          whatsappStatus: 'location_received',
          receivedLocationNote: addressDesc || (language === 'ar' ? 'تم استلام وتأكيد الإحداثيات الدقيقة من محادثة الواتساب' : 'Coordinates verified via customer WhatsApp live location')
        };
      }
      return w;
    }));

    addLiveLog(
      `استلام وتأكيد لوكيشن العميل بالواتساب: ${wo.customerNameAr}`,
      `Customer Location Received via WhatsApp: ${wo.customerNameEn}`,
      `تم تثبيت الإحداثيات الدقيقة [${lat.toFixed(4)}, ${lng.toFixed(4)}] والخريطة جاهزة لتوجيه الشاحنة فوراً`,
      `Updated GPS coordinates for ${wo.orderNumber} via WhatsApp live pin`,
      'success',
      'work_order',
      wo.id
    );
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
