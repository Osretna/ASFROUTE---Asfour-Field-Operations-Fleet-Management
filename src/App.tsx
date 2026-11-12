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

function MainAppShell() {
  const { activeTab, certificateModalWo, setCertificateModalWo, language, theme } = useApp();
  const isAr = language === 'ar';

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'} 
      className={`flex h-screen w-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''} bg-slate-100 dark:bg-[#070B12] text-slate-800 dark:text-slate-100 font-sans select-none`}
    >
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 bg-slate-50 dark:bg-[#0A0E17]/60">
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
