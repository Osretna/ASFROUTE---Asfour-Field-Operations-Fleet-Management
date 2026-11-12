import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Compass, 
  Truck, 
  Users, 
  FileCheck, 
  Building2, 
  Smartphone, 
  Database,
  Sliders,
  ShieldAlert,
  Lock,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'gold' | 'emerald' | 'amber';
}

export const Sidebar: React.FC = () => {
  const { 
    language, 
    activeTab, 
    setActiveTab, 
    workOrders, 
    vehicles,
    isAdminAuthenticated,
    setShowLoginModal
  } = useApp();
  const isAr = language === 'ar';

  const enRouteCount = vehicles.filter(v => v.status === 'on_route').length;
  const activeOrdersCount = workOrders.filter(w => w.status !== 'certified_closed').length;

  // Operational modules available for regular users & dispatchers
  const NAV_ITEMS: NavItem[] = [
    {
      id: 'dashboard',
      labelAr: 'لوحة القيادة التنفيذية',
      labelEn: 'Executive Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'dispatch',
      labelAr: 'مركز الجدولة والتحكم (ديسباتش)',
      labelEn: 'Dispatcher Console & Live Map',
      icon: Compass,
      badge: 'LIVE',
      badgeType: 'gold',
    },
    {
      id: 'fleet',
      labelAr: 'إدارة أسطول شاحنات الكريستال',
      labelEn: 'Crystal Fleet Operations',
      icon: Truck,
      badge: `${enRouteCount} Active`,
      badgeType: 'emerald',
    },
    {
      id: 'workforce',
      labelAr: 'فِرق التركيب ومصفوفة المهارات',
      labelEn: 'Workforce & Skill Matrix',
      icon: Users,
    },
    {
      id: 'workorders',
      labelAr: 'أوامر العمل ودورة حياة التركيب',
      labelEn: 'Work Orders & Installation',
      icon: FileCheck,
      badge: `${activeOrdersCount}`,
      badgeType: 'amber',
    },
    {
      id: 'projects',
      labelAr: 'مخطط الطوابق والمشاريع الكبرى',
      labelEn: 'Project Floor Planner',
      icon: Building2,
    },
    {
      id: 'mobile_app',
      labelAr: 'تطبيق الفني والسائق (موبايل)',
      labelEn: 'Field Tech Mobile App (Flutter)',
      icon: Smartphone,
    },
  ];

  // ONLY visible when Admin is authenticated
  if (isAdminAuthenticated) {
    NAV_ITEMS.push({
      id: 'architecture',
      labelAr: 'هندسة النظام وقواعد البيانات',
      labelEn: 'System Architecture & Schema',
      icon: Database,
      badge: 'SCHEMA',
      badgeType: 'amber'
    });
    NAV_ITEMS.push({
      id: 'admin',
      labelAr: 'لوحة تحكم الأدمن والربط السحابي',
      labelEn: 'Admin Control & Cloud Hub',
      icon: Sliders,
      badge: 'ROOT',
      badgeType: 'gold'
    });
  }

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-[#0A0E17] border-e border-slate-200 dark:border-slate-800/80 flex flex-col justify-between p-3 select-none text-slate-700 dark:text-slate-300 transition-colors duration-200">
      <div className="flex flex-col gap-1.5">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
          <span>{isAr ? 'الوحدات التشغيلية' : 'OPERATIONAL MODULES'}</span>
          {isAdminAuthenticated && (
            <span className="text-emerald-500 dark:text-emerald-400 font-mono text-[9px] flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              ADMIN
            </span>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-start cursor-pointer ${
                  isActive 
                    ? 'bg-[#C5A45B]/20 text-[#8E6A23] dark:text-[#DFBA6B] border border-[#C5A45B]/40 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#8E6A23] dark:text-[#DFBA6B]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  }`} />
                  <span className="truncate">{isAr ? item.labelAr : item.labelEn}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded tracking-tight shrink-0 ${
                    item.badgeType === 'gold' 
                      ? 'bg-[#C5A45B]/25 text-[#735315] dark:text-[#DFBA6B] border border-[#C5A45B]/40 font-bold' 
                      : item.badgeType === 'emerald'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {/* Admin Quick Unlock Trigger Link */}
        {!isAdminAuthenticated && (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 hover:text-[#8E6A23] dark:hover:text-[#DFBA6B] hover:border-[#C5A45B]/40 transition-colors cursor-pointer"
            title={isAr ? 'أو انقر 3 مرات متتالية على كلمة ASFROUTE بالأعلى' : 'Or triple-click ASFROUTE wordmark'}
          >
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>{isAr ? 'دخول الأدمن (3 نقرات للشعار)' : 'Admin Login (3 Clicks)'}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">asfroute</span>
          </button>
        )}

        {/* Safety & Protocol Box */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isAr ? 'بروتوكول سلامة الكريستال' : 'Crystal Fragility Rule'}</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-400">
            {isAr 
              ? 'تلتزم شاحنات عصفور بنظام الوسائد الهوائية وعدم تجاوز سرعة 70 كم/س لحماية بلورات الرصاص 30%.'
              : 'Asfour trucks enforce air suspension damping & 70km/h cap for 30% PbO crystal protection.'}
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-mono">
            <span>{isAr ? 'رخصة التشغيل: ISO-9001' : 'Licence: ISO-9001'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
