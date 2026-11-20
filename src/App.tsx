import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { BloodCompatibilityExplorer } from './components/common/BloodCompatibilityExplorer';
import { RegisterPage } from './pages/RegisterPage';

import { ToastNotificationProvider } from './context/ToastNotificationContext';
import { RealtimeAlertToasts } from './components/common/RealtimeAlertToasts';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [adminTab, setAdminTab] = useState<'DONORS' | 'HOSPITALS' | 'REQUESTS' | 'LOGS' | 'HEATMAP'>('DONORS');
  const { user } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case 'landing':
      case 'login':
        return <LandingPage onNavigate={setCurrentView} />;
      case 'donor-dashboard':
        return <DonorDashboard />;
      case 'hospital-dashboard':
        return <HospitalDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard activeTab={adminTab} setActiveTab={setAdminTab} />;
      case 'compatibility':
        return (
          <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
            <BloodCompatibilityExplorer />
          </div>
        );
      case 'register':
        return <RegisterPage onNavigate={setCurrentView} />;
      default:
        return <LandingPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 font-sans relative overflow-x-hidden">
      {/* Real-Time Emergency Toast Alerts Stack */}
      <RealtimeAlertToasts />

      {/* Prominent Multi-Layer Ambient Background Gradient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Top-left vibrant crimson/rose glow */}
        <div className="absolute -top-32 -left-32 w-[38rem] h-[38rem] rounded-full bg-linear-to-br from-rose-400/35 via-red-500/25 to-transparent blur-3xl" />
        {/* Top-right warm amber/rose glow */}
        <div className="absolute -top-20 -right-20 w-[36rem] h-[36rem] rounded-full bg-linear-to-bl from-rose-500/30 via-red-400/25 to-pink-500/20 blur-3xl" />
        {/* Mid-page subtle purple/indigo aura for contrast */}
        <div className="absolute top-[38%] -left-32 w-[32rem] h-[32rem] rounded-full bg-linear-to-r from-purple-400/20 via-rose-300/20 to-transparent blur-3xl" />
        {/* Lower-page warm emergency glow */}
        <div className="absolute top-[68%] -right-28 w-[40rem] h-[40rem] rounded-full bg-linear-to-tl from-rose-400/25 via-red-500/20 to-transparent blur-3xl" />
        {/* Subtle geometric blood-grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f43f5e0a_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e0a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
        />
        <main className="flex-1">{renderView()}</main>
        <Footer onNavigate={setCurrentView} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastNotificationProvider>
        <AppContent />
      </ToastNotificationProvider>
    </AuthProvider>
  );
}
