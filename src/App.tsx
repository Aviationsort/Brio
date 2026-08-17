/**
 * Brio Web Application Entry Point
 * Implements the Bento Grid design theme with dark background (#0A0A0A), card panels (#141414),
 * neon orange accents (#FF5F1F), and full 5-hub integration.
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/Layout/ToastContainer';
import { AuthModal } from './components/Layout/AuthModal';
import { InfotainmentMainMenu } from './components/InfotainmentMainMenu';
import { StartupLanguagePicker } from './components/StartupLanguagePicker';
import { MobileWindowsPhoneGUI } from './components/MobileWindowsPhoneGUI';

const MainAppContent: React.FC = () => {
  const {
    activeHub,
    setActiveHub,
    showLanguagePicker,
    showAuthModal,
    setShowAuthModal,
    showMobileGUI,
    setShowMobileGUI,
    user,
    authRequired,
  } = useApp();

  const handleNavigateFromInfotainment = React.useCallback((tabKey: string) => {
    if (tabKey !== activeHub && ['connect', 'media', 'arcade', 'office', 'telemetry'].includes(tabKey)) {
      setActiveHub(tabKey as any);
    }
  }, [activeHub, setActiveHub]);

  return (
    <div className="min-h-screen bg-[#060606] text-white font-sans selection:bg-[#FF5F1F] selection:text-black flex flex-col max-w-full overflow-x-hidden">
      {/* Startup Language Selection Overlay */}
      {showLanguagePicker && <StartupLanguagePicker />}

      {/* Auth / Signup Modal overlay - required if not logged in */}
      {(showAuthModal || (authRequired && !user)) && <AuthModal isOpen={true} onClose={() => {}} />}

      {/* Main Automotive, Tablet IFE, or Mobile Phone Display Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 overflow-x-hidden box-border flex flex-col justify-center my-auto">
        {showMobileGUI ? (
          <div className="flex flex-col items-center">
            <MobileWindowsPhoneGUI
              onNavigateTab={handleNavigateFromInfotainment}
              onCloseMobileView={() => setShowMobileGUI(false)}
            />
          </div>
        ) : (
          <InfotainmentMainMenu onNavigateTab={handleNavigateFromInfotainment} />
        )}
      </main>

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
