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
import { DigitalCertificateModal } from './components/workorders/DigitalCertificateModal';
import { AdminControlPanel } from './components/admin/AdminControlPanel';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { IndependentDetailModal } from './components/common/IndependentDetailModal';

const MainLayout: React.FC = () => {
  const { activeTab, certificateModalWo, setCertificateModalWo, language } = useApp();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0D14] text-slate-100">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-hidden relative bg-[#0E131E]">
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

      {/* Global Modals */}
      <AdminLoginModal />
      <IndependentDetailModal />

      {certificateModalWo && (
        <DigitalCertificateModal
          workOrder={certificateModalWo}
          onClose={() => setCertificateModalWo(null)}
          language={language}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
