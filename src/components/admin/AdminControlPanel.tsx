import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Database, 
  Cloud, 
  MapPin, 
  Sliders, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  Save, 
  RefreshCw, 
  Cpu, 
  Key, 
  Lock, 
  Globe, 
  Layers, 
  Sparkles,
  Truck,
  Users,
  HardDrive,
  Eye,
  EyeOff,
  MessageSquare,
  Phone,
  Plus,
  Trash2,
  Send
} from 'lucide-react';
import { WhatsAppAccount } from '../../types';
import { ArchitectureViewer } from '../architecture/ArchitectureViewer';

export const AdminControlPanel: React.FC = () => {
  const { 
    language, 
    logoutAdmin,
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
    vehicles,
    technicians,
    workOrders,
    whatsappAccounts,
    addWhatsAppAccount,
    updateWhatsAppAccount,
    deleteWhatsAppAccount
  } = useApp();

  const isAr = language === 'ar';

  const [activeAdminTab, setActiveAdminTab] = useState<'cloud_sql' | 'firebase' | 'storage' | 'maps' | 'whatsapp' | 'architecture' | 'features' | 'system'>('cloud_sql');

  // New WhatsApp line form state
  const [newWaNameAr, setNewWaNameAr] = useState('');
  const [newWaNameEn, setNewWaNameEn] = useState('');
  const [newWaPhone, setNewWaPhone] = useState('');
  const [newWaDeptAr, setNewWaDeptAr] = useState('قسم المتابعة الميدانية وخدمة العملاء');
  const [newWaDeptEn, setNewWaDeptEn] = useState('Field Coordination & Logistics Desk');

  // Local form states for editing configs
  const [localSql, setLocalSql] = useState(sqlConfig);
  const [localFirebase, setLocalFirebase] = useState(firebaseConfig);
  const [localStorage, setLocalStorage] = useState(storageConfig);
  const [localMaps, setLocalMaps] = useState(mapsConfig);
  const [localSecurity, setLocalSecurity] = useState(securityConfig);

  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showSqlPassword, setShowSqlPassword] = useState(false);
  const [showStorageSecret, setShowStorageSecret] = useState(false);

  // Handlers for testing & saving
  const handleSaveAndTestSql = async () => {
    setTestingStatus('sql');
    setStatusFeedback(null);
    setSqlConfig(localSql);

    const res = await testSqlConnection();
    setTestingStatus(null);
    setStatusFeedback({
      type: res.success ? 'success' : 'error',
      message: `${res.message} (Latency: ${res.latencyMs}ms)`
    });
  };

  const handleSaveAndTestFirebase = async () => {
    setTestingStatus('firebase');
    setStatusFeedback(null);
    setFirebaseConfig(localFirebase);

    const res = await testFirebaseConnection();
    setTestingStatus(null);
    setStatusFeedback({
      type: res.success ? 'success' : 'error',
      message: `${res.message} (Latency: ${res.latencyMs}ms)`
    });
  };

  const handleSaveAndTestStorage = async () => {
    setTestingStatus('storage');
    setStatusFeedback(null);
    setStorageConfig(localStorage);

    const res = await testStorageConnection();
    setTestingStatus(null);
    setStatusFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
  };

  const handleSaveAndTestMaps = async () => {
    setTestingStatus('maps');
    setStatusFeedback(null);
    setMapsConfig(localMaps);

    const res = await testMapsConnection();
    setTestingStatus(null);
    setStatusFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message
    });
  };

  const handleSaveFeatures = () => {
    setSecurityConfig(localSecurity);
    setStatusFeedback({
      type: 'success',
      message: isAr ? 'تم حفظ وتفعيل إعدادات ومميزات الأمان بنجاح في النظام!' : 'System features and safety parameters saved and activated!'
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-6 max-w-7xl mx-auto w-full gap-5 text-slate-100">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DFBA6B] to-[#997C38] flex items-center justify-center text-[#0D131D] shadow-md shadow-[#C5A45B]/20">
              <ShieldCheck className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{isAr ? 'لوحة تحكم المشرف العام (Super-Admin Control Hub)' : 'Super-Admin Control Hub'}</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                  AUTHENTICATED
                </span>
              </h1>
              <span className="text-xs text-slate-400">
                {isAr ? 'ربط السحابة وقواعد البيانات (SQL / Firebase) · ضبط قواعد الأمان · تعديل المميزات التشغيلية' : 'Cloud & Database Integrations (SQL / Firebase) · Feature Flags · Safety Constraints'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Admin Button */}
        <button
          onClick={logoutAdmin}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-950/40 text-red-300 border border-red-800/60 hover:bg-red-900/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{isAr ? 'تسجيل خروج الأدمن' : 'Exit Admin Mode'}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'cloud_sql', labelAr: 'قاعدة بيانات SQL / PostgreSQL', labelEn: 'PostgreSQL / SQL Hub', icon: Database },
          { id: 'firebase', labelAr: 'سحابة Firebase (Firestore & Auth)', labelEn: 'Firebase (Firestore/Auth)', icon: Cloud },
          { id: 'storage', labelAr: 'التخزين السحابي (S3 / GCS)', labelEn: 'Cloud Object Storage', icon: HardDrive },
          { id: 'maps', labelAr: 'خرائط وملاحة Google Maps Platform', labelEn: 'Google Maps API', icon: MapPin },
          { id: 'whatsapp', labelAr: 'أرقام وهواتف واتساب المتابعة والتوصيل', labelEn: 'WhatsApp Dispatch Desk', icon: MessageSquare },
          { id: 'architecture', labelAr: 'هندسة النظام وقواعد البيانات', labelEn: 'System Architecture & Schema', icon: Database },
          { id: 'features', labelAr: 'تعديل وتفعيل مميزات النظام', labelEn: 'Feature Flags & Safety', icon: Sliders },
          { id: 'system', labelAr: 'حالة النظام وسجلات السيرفر', labelEn: 'System Health & Telemetry', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveAdminTab(tab.id as any);
                setStatusFeedback(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#C5A45B] text-[#0D131D] shadow-lg shadow-[#C5A45B]/20' 
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Status Feedback Banner */}
      {statusFeedback && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs animate-in fade-in ${
          statusFeedback.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
            : 'bg-red-950/40 border-red-500/50 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span>{statusFeedback.message}</span>
          </div>
          <button onClick={() => setStatusFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 overflow-y-auto">
        {/* ==================== TAB 1: POSTGRESQL / SQL ==================== */}
        {activeAdminTab === 'cloud_sql' && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#C5A45B]" />
                  <span>{isAr ? 'إعدادات ربط قاعدة بيانات SQL / PostgreSQL / PostGIS' : 'PostgreSQL & PostGIS Database Connection'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'أدخل بيانات الخادم السحابي (Cloud SQL أو Neon أو Supabase أو خادم محلي) لتخزين وحفظ الأسطول وأوامر العمل والمسارات المكانية.' 
                    : 'Configure hosted PostgreSQL or Cloud SQL parameters to persist fleet vehicles, work orders and spatial trajectories.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono px-2.5 py-1 rounded-md border ${
                  localSql.isConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {localSql.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Provider */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'نوع مزود قاعدة البيانات (Database Provider):' : 'Database Provider:'}
                </label>
                <select
                  value={localSql.provider}
                  onChange={(e) => setLocalSql({ ...localSql, provider: e.target.value as any })}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
                >
                  <option value="postgresql">PostgreSQL (Self-Hosted / Managed)</option>
                  <option value="cloudsql">Google Cloud SQL for PostgreSQL (PostGIS Enabled)</option>
                  <option value="supabase">Supabase Relational Database</option>
                </select>
              </div>

              {/* Host */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'عنوان الخادم المضيف (Host / IP Address):' : 'Host / Server Address:'}
                </label>
                <input
                  type="text"
                  value={localSql.host}
                  onChange={(e) => setLocalSql({ ...localSql, host: e.target.value })}
                  placeholder="e.g. ep-cold-crystal-904.eu-central-1.aws.neon.tech"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* Port */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'منفذ الاتصال (Port):' : 'Port:'}
                </label>
                <input
                  type="number"
                  value={localSql.port}
                  onChange={(e) => setLocalSql({ ...localSql, port: parseInt(e.target.value) || 5432 })}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* Database Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'اسم قاعدة البيانات (Database Name):' : 'Database Name:'}
                </label>
                <input
                  type="text"
                  value={localSql.databaseName}
                  onChange={(e) => setLocalSql({ ...localSql, databaseName: e.target.value })}
                  placeholder="asfroute_crystal_db"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'اسم مستخدم قاعدة البيانات (User):' : 'Database Username:'}
                </label>
                <input
                  type="text"
                  value={localSql.username}
                  onChange={(e) => setLocalSql({ ...localSql, username: e.target.value })}
                  placeholder="asfour_admin"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'كلمة المرور (Database Password):' : 'Database Password:'}
                </label>
                <div className="relative">
                  <input
                    type={showSqlPassword ? 'text' : 'password'}
                    value={localSql.password || ''}
                    onChange={(e) => setLocalSql({ ...localSql, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSqlPassword(!showSqlPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showSqlPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* SSL Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'وضع تشفير الاتصال (SSL Mode):' : 'SSL Mode:'}
                </label>
                <select
                  value={localSql.sslMode}
                  onChange={(e) => setLocalSql({ ...localSql, sslMode: e.target.value as any })}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
                >
                  <option value="require">require (Encrypted TLS - Recommended)</option>
                  <option value="prefer">prefer</option>
                  <option value="disable">disable (Local Only)</option>
                </select>
              </div>

              {/* Status Indicator */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between text-xs">
                <span className="text-[10px] text-slate-500">{isAr ? 'آخر فحص استجابة:' : 'Last Ping:'}</span>
                <span className="font-mono text-emerald-400 font-bold">{localSql.lastTested || 'Never Tested'}</span>
                <span className="text-[10px] text-slate-400 mt-1">{isAr ? 'الجداول النشطة:' : 'Active Tables:'} 18 Tables (PostGIS Enabled)</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveAndTestSql}
                disabled={testingStatus === 'sql'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-lg shadow-[#C5A45B]/20 transition-transform active:scale-95 cursor-pointer"
              >
                {testingStatus === 'sql' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{testingStatus === 'sql' ? (isAr ? 'جاري فحص الاتصال...' : 'Connecting...') : (isAr ? 'حفظ وربط قاعدة البيانات' : 'Save & Test SQL Connection')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: FIREBASE ==================== */}
        {activeAdminTab === 'firebase' && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#C5A45B]" />
                  <span>{isAr ? 'إعدادات ربط سحابة Google Firebase (Firestore & Auth)' : 'Google Firebase (Firestore & Auth) Integration'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'اربط التطبيق بمشروع Firebase لمزامنة التقارير الميدانية الحية، مصادقة فنيي وسائقي الموبايل، وتخزين التوقيعات الرقمية.' 
                    : 'Connect Firebase project for real-time mobile sync, technician authentication and digital customer sign-off vaults.'}
                </p>
              </div>

              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-md border ${
                localFirebase.isConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {localFirebase.isConnected ? 'FIREBASE ACTIVE' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'معرف مشروع فايربيز (Firebase Project ID):' : 'Project ID:'}
                </label>
                <input
                  type="text"
                  value={localFirebase.projectId}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, projectId: e.target.value })}
                  placeholder="asfour-crystal-fsm-prod"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* API Key */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'مفتاح الويب (Web API Key):' : 'Web API Key:'}
                </label>
                <input
                  type="text"
                  value={localFirebase.apiKey}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, apiKey: e.target.value })}
                  placeholder="AIzaSyA4Q1...Xz9"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* Auth Domain */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'نطاق المصادقة (Auth Domain):' : 'Auth Domain:'}
                </label>
                <input
                  type="text"
                  value={localFirebase.authDomain}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, authDomain: e.target.value })}
                  placeholder="asfour-crystal-fsm-prod.firebaseapp.com"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* Storage Bucket */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'مستودع التخزين (Storage Bucket):' : 'Storage Bucket:'}
                </label>
                <input
                  type="text"
                  value={localFirebase.storageBucket}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, storageBucket: e.target.value })}
                  placeholder="asfour-crystal-fsm-prod.appspot.com"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* App ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'معرف التطبيق (App ID):' : 'Firebase App ID:'}
                </label>
                <input
                  type="text"
                  value={localFirebase.appId}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, appId: e.target.value })}
                  placeholder="1:309004189655:web:88902b1f48c12a"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              {/* Firestore Region */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'منطقة استضافة Firestore (Cloud Region):' : 'Firestore Cloud Region:'}
                </label>
                <select
                  value={localFirebase.firestoreRegion}
                  onChange={(e) => setLocalFirebase({ ...localFirebase, firestoreRegion: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
                >
                  <option value="europe-west1">europe-west1 (Belgium / Low Latency)</option>
                  <option value="me-central1">me-central1 (Doha / Middle East)</option>
                  <option value="me-west1">me-west1 (Tel Aviv)</option>
                  <option value="us-central1">us-central1 (Iowa)</option>
                </select>
              </div>
            </div>

            {/* Synced Collections */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">
                {isAr ? 'مجموعات البيانات المتزامنة تلقائياً (Synchronized Collections):' : 'Auto-Synchronized Collections:'}
              </span>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                {['work_orders', 'vehicles_telemetry', 'job_reports', 'signatures', 'crystal_certifications'].map(col => (
                  <span key={col} className="bg-slate-800 text-[#DFBA6B] px-2.5 py-1 rounded-md border border-slate-700">
                    /{col}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveAndTestFirebase}
                disabled={testingStatus === 'firebase'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-lg shadow-[#C5A45B]/20 transition-transform active:scale-95 cursor-pointer"
              >
                {testingStatus === 'firebase' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{testingStatus === 'firebase' ? (isAr ? 'جاري فحص الاتصال...' : 'Connecting...') : (isAr ? 'حفظ وربط سحابة فايربيز' : 'Save & Test Firebase Connection')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: CLOUD STORAGE ==================== */}
        {activeAdminTab === 'storage' && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#C5A45B]" />
                  <span>{isAr ? 'إعدادات مستودع التخزين السحابي للصور والمستندات (S3 / GCS)' : 'Cloud Object Storage (S3 / Google Cloud Storage)'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'تخزين صور الثريات عالية الدقة قبل وبعد التركيب، وتقارير الفحص الهندسي، وشهادات الأمان الموقعة.' 
                    : 'Storage bucket for high-res before/after installation photos, anchor pull tests and signed certificates.'}
                </p>
              </div>

              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-md border ${
                localStorage.isConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {localStorage.isConnected ? 'BUCKET READY' : 'UNCONNECTED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'مزود التخزين (Storage Provider):' : 'Storage Provider:'}
                </label>
                <select
                  value={localStorage.provider}
                  onChange={(e) => setLocalStorage({ ...localStorage, provider: e.target.value as any })}
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
                >
                  <option value="google_cloud_storage">Google Cloud Storage (GCS)</option>
                  <option value="aws_s3">Amazon Web Services S3 (AWS)</option>
                  <option value="minio">MinIO Private Object Storage</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'اسم الـ Bucket / الحاوية:' : 'Bucket Name:'}
                </label>
                <input
                  type="text"
                  value={localStorage.bucketName}
                  onChange={(e) => setLocalStorage({ ...localStorage, bucketName: e.target.value })}
                  placeholder="asfour-crystal-installation-vault"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'المنطقة الجغرافية (Region):' : 'Region:'}
                </label>
                <input
                  type="text"
                  value={localStorage.region}
                  onChange={(e) => setLocalStorage({ ...localStorage, region: e.target.value })}
                  placeholder="europe-west2 / me-south-1"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'مفتاح الوصول (Access Key ID):' : 'Access Key ID:'}
                </label>
                <input
                  type="text"
                  value={localStorage.accessKeyId}
                  onChange={(e) => setLocalStorage({ ...localStorage, accessKeyId: e.target.value })}
                  placeholder="GOOG... or AKIA..."
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'المفتاح السري (Secret Access Key):' : 'Secret Access Key:'}
                </label>
                <div className="relative">
                  <input
                    type={showStorageSecret ? 'text' : 'password'}
                    value={localStorage.secretAccessKey || ''}
                    onChange={(e) => setLocalStorage({ ...localStorage, secretAccessKey: e.target.value })}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStorageSecret(!showStorageSecret)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showStorageSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveAndTestStorage}
                disabled={testingStatus === 'storage'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-lg shadow-[#C5A45B]/20 transition-transform active:scale-95 cursor-pointer"
              >
                {testingStatus === 'storage' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{testingStatus === 'storage' ? (isAr ? 'جاري الفحص...' : 'Testing...') : (isAr ? 'حفظ وتفعيل التخزين' : 'Save & Test Bucket')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: GOOGLE MAPS PLATFORM ==================== */}
        {activeAdminTab === 'maps' && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C5A45B]" />
                  <span>{isAr ? 'إعدادات Google Maps Platform والملاحة' : 'Google Maps Platform & Routing Engine'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'تفعيل حساب Directions API، مصفوفة المسافات والزمن اللحظي لحركة المرور في مصر والدول العربية.' 
                    : 'Activate Directions API, Distance Matrix, Geocoding and real-time traffic layers for route calculations.'}
                </p>
              </div>

              <span className={`text-[11px] font-mono px-2.5 py-1 rounded-md border ${
                localMaps.isConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {localMaps.isConnected ? 'API KEY ACTIVE' : 'UNCONFIGURED'}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {isAr ? 'مفتاح Google Maps API Key:' : 'Google Maps API Key:'}
                </label>
                <input
                  type="text"
                  value={localMaps.apiKey}
                  onChange={(e) => setLocalMaps({ ...localMaps, apiKey: e.target.value })}
                  placeholder="AIzaSyB3X...98q"
                  className="bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {[
                  { key: 'directionsEnabled', labelAr: 'Directions API', labelEn: 'Directions API' },
                  { key: 'distanceMatrixEnabled', labelAr: 'Distance Matrix API', labelEn: 'Distance Matrix' },
                  { key: 'geocodingEnabled', labelAr: 'Geocoding API', labelEn: 'Geocoding API' },
                  { key: 'trafficLayerEnabled', labelAr: 'طبقة المرور الحية', labelEn: 'Live Traffic Layer' },
                ].map(item => (
                  <label key={item.key} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs cursor-pointer">
                    <span className="text-slate-200">{isAr ? item.labelAr : item.labelEn}</span>
                    <input
                      type="checkbox"
                      checked={(localMaps as any)[item.key]}
                      onChange={(e) => setLocalMaps({ ...localMaps, [item.key]: e.target.checked })}
                      className="rounded text-[#C5A45B] focus:ring-0"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveAndTestMaps}
                disabled={testingStatus === 'maps'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-lg shadow-[#C5A45B]/20 transition-transform active:scale-95 cursor-pointer"
              >
                {testingStatus === 'maps' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{testingStatus === 'maps' ? (isAr ? 'جاري التحقق...' : 'Validating...') : (isAr ? 'حفظ وتفعيل خرائط جوجل' : 'Save & Verify Maps API')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB: WHATSAPP DISPATCH DESK ==================== */}
        {activeAdminTab === 'whatsapp' && (
          <div className="flex flex-col gap-6 max-w-4xl text-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  <span>{isAr ? 'إدارة خطوط وأرقام واتساب المتابعة والتوصيل' : 'WhatsApp Customer Coordination & Dispatch Hub'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'إضافة وتفعيل أكثر من رقم واتساب لمتابعة العملاء، إرسال رسائل طلب اللوكيشن، واستقبال الإحداثيات وتوجيه الشاحنات فوراً.' 
                    : 'Manage active WhatsApp dispatch lines to request client GPS coordinates and issue direct delivery routes.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  {whatsappAccounts.filter(a => a.isActive).length} {isAr ? 'خطوط نشطة' : 'Active Lines'}
                </span>
              </div>
            </div>

            {/* Form to Add New WhatsApp Number */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3.5">
              <span className="text-xs font-bold text-[#DFBA6B] flex items-center gap-1.5 uppercase tracking-wider">
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة رقم واتساب جديد لفريق المتابعة:' : 'Register New WhatsApp Dispatch Number:'}</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">{isAr ? 'اسم الفريق / الخط (عربي):' : 'Team / Desk Name (AR):'}</label>
                  <input
                    type="text"
                    value={newWaNameAr}
                    onChange={(e) => setNewWaNameAr(e.target.value)}
                    placeholder={isAr ? 'مثال: فريق متابعة الشيخ زايد والجيزة' : 'e.g. Zayed Delivery Hotline'}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">{isAr ? 'اسم الفريق / الخط (إنجليزي):' : 'Team / Desk Name (EN):'}</label>
                  <input
                    type="text"
                    value={newWaNameEn}
                    onChange={(e) => setNewWaNameEn(e.target.value)}
                    placeholder="Zayed Dispatch Hotline"
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">{isAr ? 'رقم هاتف الواتساب (مع كود الدولة):' : 'WhatsApp Phone (with Country Code):'}</label>
                  <input
                    type="text"
                    value={newWaPhone}
                    onChange={(e) => setNewWaPhone(e.target.value)}
                    placeholder="201012345678"
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 font-mono outline-none focus:border-[#C5A45B]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-400">{isAr ? 'القسم التشغيلي:' : 'Department:'}</label>
                  <input
                    type="text"
                    value={newWaDeptAr}
                    onChange={(e) => setNewWaDeptAr(e.target.value)}
                    placeholder="قسم المتابعة الميدانية وخدمة العملاء"
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-[#C5A45B]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    if (!newWaPhone.trim()) {
                      setStatusFeedback({ type: 'error', message: isAr ? 'يرجى إدخال رقم الهاتف أولاً' : 'Please provide a valid phone number' });
                      return;
                    }
                    const newAcc: WhatsAppAccount = {
                      id: `WA-${Date.now().toString().slice(-4)}`,
                      nameAr: newWaNameAr.trim() || `خط واتساب ${newWaPhone.slice(-4)}`,
                      nameEn: newWaNameEn.trim() || `WhatsApp Line ${newWaPhone.slice(-4)}`,
                      phone: newWaPhone.replace(/[^0-9]/g, ''),
                      departmentAr: newWaDeptAr,
                      departmentEn: newWaDeptEn,
                      isActive: true,
                      messagesSentCount: 0,
                      addedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
                    };
                    addWhatsAppAccount(newAcc);
                    setNewWaNameAr('');
                    setNewWaNameEn('');
                    setNewWaPhone('');
                    setStatusFeedback({
                      type: 'success',
                      message: isAr ? `تمت إضافة وتفعيل رقم الواتساب (${newAcc.phone}) بنجاح في التطبيق!` : `WhatsApp account (${newAcc.phone}) activated successfully!`
                    });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'تفعيل وإضافة الرقم للنظام' : 'Activate & Save Line'}</span>
                </button>
              </div>
            </div>

            {/* List of Configured WhatsApp Lines */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-300">
                {isAr ? 'الأرقام المفعلة في المنظومة حالياً:' : 'Active Operational WhatsApp Lines:'}
              </span>

              <div className="flex flex-col gap-2.5">
                {whatsappAccounts.map(account => (
                  <div
                    key={account.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                        account.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}>
                        <Phone className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{isAr ? account.nameAr : account.nameEn}</span>
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                            +{account.phone}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{isAr ? account.departmentAr : account.departmentEn}</span>
                          <span>·</span>
                          <span className="text-slate-500 font-mono">{account.messagesSentCount} {isAr ? 'رسالة مرسلة' : 'messages'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          const testUrl = `https://wa.me/${account.phone}?text=${encodeURIComponent('اختبار اتصال منظومة عصفور كريستال - الخط نشط')}`;
                          window.open(testUrl, '_blank');
                        }}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                        title={isAr ? 'إرسال رسالة اختبار' : 'Test WhatsApp Ping'}
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px]">{isAr ? 'تجربة' : 'Ping'}</span>
                      </button>

                      <button
                        onClick={() => updateWhatsAppAccount({ ...account, isActive: !account.isActive })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                          account.isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {account.isActive ? (isAr ? 'مفعل وجاهز' : 'Active') : (isAr ? 'معطل' : 'Paused')}
                      </button>

                      {whatsappAccounts.length > 1 && (
                        <button
                          onClick={() => deleteWhatsAppAccount(account.id)}
                          className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 cursor-pointer"
                          title={isAr ? 'حذف الرقم' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: FEATURE FLAGS & SAFETY CONSTRAINTS ==================== */}
        {activeAdminTab === 'features' && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#C5A45B]" />
                  <span>{isAr ? 'إدارة المميزات وقيود أمان نقل الكريستال الفاخر' : 'Feature Flags & Crystal Fragility Operational Rules'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'تعديل المعايير الهندسية والفيزيائية للنظام، حدود السرعة، ومعاملات أمان مرساة الأسقف.' 
                    : 'Configure operational safety rules, strict payload guards, altitude restrictions and optimizer modes.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max Speed */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{isAr ? 'الحد الأقصى لسرعة الشاحنات (حماية الاهتزاز):' : 'Max Truck Speed Governor:'}</span>
                  <span className="font-mono text-amber-400 font-bold">{localSecurity.maxVehicleSpeedKmH} km/h</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={localSecurity.maxVehicleSpeedKmH}
                  onChange={(e) => setLocalSecurity({ ...localSecurity, maxVehicleSpeedKmH: parseInt(e.target.value) })}
                  className="w-full accent-[#C5A45B]"
                />
                <span className="text-[10px] text-slate-400">
                  {isAr ? 'توصية مصنع عصفور: سرعة لا تتجاوز 70 كم/س لحماية بلورات الرصاص 30%.' : 'Asfour factory standard: Cap at 70 km/h to prevent vibration resonance.'}
                </span>
              </div>

              {/* Safety factor */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{isAr ? 'معامل أمان قوة شد مرساة السقف:' : 'Ceiling Anchor Safety Factor:'}</span>
                  <span className="font-mono text-emerald-400 font-bold">{localSecurity.minAnchorSafetyFactor}x Weight</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="5"
                  step="0.5"
                  value={localSecurity.minAnchorSafetyFactor}
                  onChange={(e) => setLocalSecurity({ ...localSecurity, minAnchorSafetyFactor: parseFloat(e.target.value) })}
                  className="w-full accent-[#C5A45B]"
                />
                <span className="text-[10px] text-slate-400">
                  {isAr ? 'مثال: نجفة 600 كجم تتطلب مرساة تتحمل 1800 كجم (معامل 3 أضعاف).' : 'Example: 600kg chandelier mandates 1800kg pull test anchor.'}
                </span>
              </div>
            </div>

            {/* Toggle Rules */}
            <div className="flex flex-col gap-2.5">
              {[
                { 
                  key: 'enforcePneumaticDampingForFragile', 
                  titleAr: 'إلزام التعليق الهوائي للشاحنات للقطع فائقة الحساسية', 
                  titleEn: 'Enforce Pneumatic Damping for Ultra-Delicate Chandelier Tier',
                  descAr: 'يمنع النظام تعيين أي شاحنة عادية لنقل الثريات الملكية ما لم تكن مزودة بنظام وسائد هوائية.',
                  descEn: 'Blocks standard spring-suspension trucks from delicate crystal masterpieces.'
                },
                { 
                  key: 'enforceStrictAltitudeCertification', 
                  titleAr: 'إلزام ترخيص السقالات الشاهقة (>18م)', 
                  titleEn: 'Strict High-Altitude Certification Guard (>18m)',
                  descAr: 'يرفض النظام إسناد الأعمال في القاعات الكبرى لأي فني غير معتمد بالمستوى 5 للأعمال الشاهقة.',
                  descEn: 'Blocks technicians lacking Level 5 altitude certification from high ceiling jobs.'
                },
                { 
                  key: 'requireDigitalSignature', 
                  titleAr: 'إلزام توقيع العميل الرقمي لإصدار شهادة الضمان', 
                  titleEn: 'Mandatory Customer Digital Signature for Official Certificate',
                  descAr: 'لا يمكن إغلاق أمر العمل أو استخراج شهادة الضمان الرسمية دون توقيع العميل الحي في الموبايل.',
                  descEn: 'Requires client touch signature before generating certified guarantee document.'
                },
                { 
                  key: 'enableOfflineMobileSync', 
                  titleAr: 'تفعيل المزامنة المتقدمة للموبايل بدون إنترنت (Offline-First)', 
                  titleEn: 'Offline-First SQLite Synchronization Queue',
                  descAr: 'السماح للفنيين بالعمل في المناطق المعزولة وتخزين البيانات محلياً ومزامنتها فور توفر الشبكة.',
                  descEn: 'Allows mobile field crews to complete inspections offline and sync automatically.'
                },
              ].map(item => (
                <label key={item.key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer hover:border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isAr ? item.titleAr : item.titleEn}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      {isAr ? item.descAr : item.descEn}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={(localSecurity as any)[item.key]}
                    onChange={(e) => setLocalSecurity({ ...localSecurity, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C5A45B] focus:ring-0 shrink-0"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={handleSaveFeatures}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5A45B] hover:bg-[#D4B36A] text-[#0D131D] shadow-lg shadow-[#C5A45B]/20 transition-transform active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isAr ? 'حفظ وتفعيل كافة الإعدادات' : 'Save & Apply Feature Flags'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 6: SYSTEM HEALTH & TELEMETRY ==================== */}
        {activeAdminTab === 'system' && (
          <div className="flex flex-col gap-6 max-w-4xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#C5A45B]" />
                  <span>{isAr ? 'صحة النظام، الخوادم والاتصال المباشر (System Telemetry)' : 'System Diagnostics & Telemetry'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr 
                    ? 'مراقبة زمن استجابة الاستعلامات المكانية PostGIS، قنوات الـ WebSocket، ومعدل نقل البيانات.' 
                    : 'Real-time telemetry of PostGIS spatial queries, WebSocket sync queues, and database health.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'زمن استجابة السيرفر' : 'API Latency'}</span>
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">24 ms</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'قنوات WebSocket' : 'Active Sockets'}</span>
                <span className="text-lg font-bold font-mono text-blue-400 tabular-nums">6 Live Hubs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'شاحنات متصلة' : 'Connected Fleet'}</span>
                <span className="text-lg font-bold font-mono text-[#DFBA6B] tabular-nums">{vehicles.length} Units</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'الذاكرة المؤقتة Redis' : 'Redis Cache'}</span>
                <span className="text-lg font-bold font-mono text-purple-400 tabular-nums">99.8% HIT</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2 text-xs">
              <span className="font-bold text-slate-200">{isAr ? 'معلومات بيئة التشغيل السحابية:' : 'Cloud Runtime Environment:'}</span>
              <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
                <div>Node.js Engine: v22.14.0 LTS</div>
                <div>Framework: React 19 + TypeScript + Tailwind v4</div>
                <div>Routing Solver: Google OR-Tools v9.8</div>
                <div>Spatial DB: PostGIS 3.4 / PostgreSQL 16</div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: SYSTEM ARCHITECTURE & SCHEMA ==================== */}
        {activeAdminTab === 'architecture' && (
          <ArchitectureViewer isEmbedded />
        )}
      </div>
    </div>
  );
};
