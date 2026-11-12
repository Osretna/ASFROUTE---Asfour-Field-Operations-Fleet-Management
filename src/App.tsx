import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { DispatchCenter } from './components/dispatch/DispatchCenter';
import { FleetManagement } from './components/fleet/FleetManagement';
import { WorkforceManagement } from './components/workforce/WorkforceManagement';
import { WorkOrderLifecycle } from './components/workorders/WorkOrderLifecycle';
import { ProjectFloorPlanner } from './components/projects/ProjectFloorPlanner';
import { MobileAppSimulator } from './components/mobile/MobileAppSimulator';
import { ArchitectureViewer } from './components/architecture/ArchitectureViewer';
import { AdminControlPanel } from './components/admin/AdminControlPanel';
import { IndependentDetailModal } from './components/common/IndependentDetailModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { DigitalCertificateModal } from './components/workorders/DigitalCertificateModal';
import { CustomerLocationPortalModal } from './components/whatsapp/CustomerLocationPortalModal';
import { 
  LayoutDashboard, 
  Compass, 
  Truck, 
  FileCheck, 
  Menu 
} from 'lucide-react';

function MainAppShell() {
  const { 
    activeTab, 
    setActiveTab, 
    certificateModalWo, 
    setCertificateModalWo, 
    customerPortalModalWo,
    setCustomerPortalModalWo,
    language, 
    theme,
    setIsMobileMenuOpen 
  } = useApp();
  const isAr = language === 'ar';

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'} 
      className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''} bg-slate-100 dark:bg-[#070B12] text-slate-800 dark:text-slate-100 font-sans select-none`}
    >
      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Header />
        
        {/* Main Content Area with bottom padding on mobile for the navbar */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 lg:p-6 pb-20 lg:pb-6 bg-slate-50 dark:bg-[#0A0E17]/60">
          {activeTab === 'dashboard' && <ExecutiveDashboard />}
          {activeTab === 'dispatch' && <DispatchCenter />}
          {activeTab === 'fleet' && <FleetManagement />}
          {activeTab === 'workforce' && <WorkforceManagement />}
          {activeTab === 'workorders' && <WorkOrderLifecycle />}
          {activeTab === 'projects' && <ProjectFloorPlanner />}
          {activeTab === 'mobile_app' && <MobileAppSimulator />}
          {activeTab === 'architecture' && <ArchitectureViewer />}
          {activeTab === 'admin' && <AdminControlPanel />}
        </main>

        {/* Mobile Bottom Navigation Bar (Tailored for iOS & Android all models) */}
        <nav 
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0A0E17]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
          aria-label="التنقل السريع"
        >
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-[#8E6A23] dark:text-[#DFBA6B] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">{isAr ? 'الرئيسية' : 'Dashboard'}</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'dispatch'
                ? 'text-[#8E6A23] dark:text-[#DFBA6B] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">{isAr ? 'الخريطة' : 'Map'}</span>
            <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'fleet'
                ? 'text-[#8E6A23] dark:text-[#DFBA6B] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="text-[10px]">{isAr ? 'الأسطول' : 'Fleet'}</span>
          </button>

          <button
            onClick={() => setActiveTab('workorders')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'workorders'
                ? 'text-[#8E6A23] dark:text-[#DFBA6B] font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-5 h-5" />
            <span className="text-[10px]">{isAr ? 'التركيبات' : 'Orders'}</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5 text-[#C5A45B]" />
            <span className="text-[10px]">{isAr ? 'المزيد' : 'More'}</span>
          </button>
        </nav>
      </div>

      {/* Presentation & Dialog Modals */}
      <IndependentDetailModal />
      <AdminLoginModal />
      {certificateModalWo && (
        <DigitalCertificateModal 
          workOrder={certificateModalWo} 
          onClose={() => setCertificateModalWo(null)} 
          language={language} 
        />
      )}
      {customerPortalModalWo && (
        <CustomerLocationPortalModal
          workOrder={customerPortalModalWo}
          isOpen={!!customerPortalModalWo}
          onClose={() => setCustomerPortalModalWo(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
