/**
 * Brio Web Application Entry Point
 * Implements the Bento Grid design theme with dark background (#0A0A0A), card panels (#141414),
 * neon orange accents (#FF5F1F), and full 5-hub integration.
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/Layout/ToastContainer';
import { AuthModal } from './components/Layout/AuthModal';
import { InfotainmentMainMenu } from './components/InfotainmentMainMenu';
import { ErrorBoundary } from './components/ErrorBoundary';

const MainAppContent: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
  } = useApp();

  return (
    <div className="min-h-screen text-[var(--brio-text-primary)] font-sans selection:bg-[var(--brio-accent)] selection:text-[var(--brio-button-text)] flex flex-col max-w-full overflow-x-hidden">
      {/* Nordic Aurora background */}
      <div className="aurora-background" aria-hidden="true">
        <div className="aurora-curtain aurora-curtain--a" />
        <div className="aurora-stars" />
      </div>

      {/* IFE Frame - matches home screen border */}
      <div className="relative z-10 w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 flex-1 flex flex-col">
        {/* Main IFE Display Container */}
      <main className="flex-1 w-full overflow-x-hidden box-border flex flex-col justify-center my-auto">
        <ErrorBoundary name="InfotainmentMainMenu">
          <InfotainmentMainMenu />
        </ErrorBoundary>
      </main>
      </div>

      {/* Auth / Signup Modal overlay */}
      {showAuthModal && <AuthModal isOpen={true} onClose={() => setShowAuthModal(false)} />}

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <MainAppContent />
      </ThemeProvider>
    </AppProvider>
  );
}
