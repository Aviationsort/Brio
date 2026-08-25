/**
 * Theme Context - Multi-theme support for Brio
 * Themes: obsidian (default), arctic, forest, sunset, ocean
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ThemeId = 'obsidian' | 'arctic' | 'forest' | 'sunset' | 'ocean';

interface ThemeColors {
  id: ThemeId;
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  accentGlow: string;
  border: string;
  glassBg: string;
  glassBorder: string;
  shadow: string;
  cardBg: string;
  buttonText: string;
  success: string;
  warning: string;
  error: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
}

export const THEMES: Record<ThemeId, ThemeColors> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    bgPrimary: '#0a0a0c',
    bgSecondary: '#111113',
    bgTertiary: '#1a1a1e',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#FF5F1F',
    accentHover: '#e55515',
    accentGlow: 'rgba(255, 95, 31, 0.4)',
    border: 'rgba(255, 255, 255, 0.08)',
    glassBg: 'rgba(17, 17, 19, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    shadow: 'rgba(0, 0, 0, 0.6)',
    cardBg: '#141414',
    buttonText: '#000000',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradientStart: '#FF5F1F',
    gradientMid: '#ff8c42',
    gradientEnd: '#ffaa5c',
  },
  arctic: {
    id: 'arctic',
    name: 'Arctic',
    bgPrimary: '#f0f9ff',
    bgSecondary: '#e0f2fe',
    bgTertiary: '#bae6fd',
    textPrimary: '#0c4a6e',
    textSecondary: '#0369a1',
    accent: '#0ea5e9',
    accentHover: '#0284c7',
    accentGlow: 'rgba(14, 165, 233, 0.3)',
    border: 'rgba(14, 165, 233, 0.2)',
    glassBg: 'rgba(255, 255, 255, 0.65)',
    glassBorder: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    cardBg: '#ffffff',
    buttonText: '#ffffff',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    gradientStart: '#0ea5e9',
    gradientMid: '#38bdf8',
    gradientEnd: '#7dd3fc',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    bgPrimary: '#0a1a0a',
    bgSecondary: '#112211',
    bgTertiary: '#1a2e1a',
    textPrimary: '#ecfdf5',
    textSecondary: '#6ee7b7',
    accent: '#10b981',
    accentHover: '#059669',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    border: 'rgba(16, 185, 129, 0.15)',
    glassBg: 'rgba(17, 34, 17, 0.7)',
    glassBorder: 'rgba(16, 185, 129, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    cardBg: '#142814',
    buttonText: '#ffffff',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    gradientStart: '#10b981',
    gradientMid: '#34d399',
    gradientEnd: '#6ee7b7',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    bgPrimary: '#1a0f0a',
    bgSecondary: '#2d1810',
    bgTertiary: '#3d2218',
    textPrimary: '#fff7ed',
    textSecondary: '#fdba74',
    accent: '#f97316',
    accentHover: '#ea580c',
    accentGlow: 'rgba(249, 115, 22, 0.4)',
    border: 'rgba(249, 115, 22, 0.2)',
    glassBg: 'rgba(45, 24, 16, 0.7)',
    glassBorder: 'rgba(249, 115, 22, 0.25)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    cardBg: '#2d1810',
    buttonText: '#ffffff',
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    gradientStart: '#f97316',
    gradientMid: '#fb923c',
    gradientEnd: '#fdba74',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    bgPrimary: '#0a0f1a',
    bgSecondary: '#111827',
    bgTertiary: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentGlow: 'rgba(99, 102, 241, 0.4)',
    border: 'rgba(99, 102, 241, 0.2)',
    glassBg: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(99, 102, 241, 0.25)',
    shadow: 'rgba(0, 0, 0, 0.5)',
    cardBg: '#1e293b',
    buttonText: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    gradientStart: '#6366f1',
    gradientMid: '#818cf8',
    gradientEnd: '#a5b4fc',
  },
};

interface ThemeContextValue {
  theme: ThemeColors;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const stored = localStorage.getItem('brio_theme');
      return (stored as ThemeId) || 'obsidian';
    } catch {
      return 'obsidian';
    }
  });

  const theme = THEMES[themeId];

  const setTheme = useCallback((id: ThemeId) => {
    setThemeId(id);
    try {
      localStorage.setItem('brio_theme', id);
    } catch {
      // ignore
    }
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeId((prev) => {
      const keys = Object.keys(THEMES) as ThemeId[];
      const idx = keys.indexOf(prev);
      const next = keys[(idx + 1) % keys.length];
      try {
        localStorage.setItem('brio_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brio-bg-primary', theme.bgPrimary);
    root.style.setProperty('--brio-bg-secondary', theme.bgSecondary);
    root.style.setProperty('--brio-bg-tertiary', theme.bgTertiary);
    root.style.setProperty('--brio-text-primary', theme.textPrimary);
    root.style.setProperty('--brio-text-secondary', theme.textSecondary);
    root.style.setProperty('--brio-accent', theme.accent);
    root.style.setProperty('--brio-accent-hover', theme.accentHover);
    root.style.setProperty('--brio-accent-glow', theme.accentGlow);
    root.style.setProperty('--brio-border', theme.border);
    root.style.setProperty('--brio-glass-bg', theme.glassBg);
    root.style.setProperty('--brio-glass-border', theme.glassBorder);
    root.style.setProperty('--brio-shadow', theme.shadow);
    root.style.setProperty('--brio-card-bg', theme.cardBg);
    root.style.setProperty('--brio-button-text', theme.buttonText);
    root.style.setProperty('--brio-success', theme.success);
    root.style.setProperty('--brio-warning', theme.warning);
    root.style.setProperty('--brio-error', theme.error);
    root.style.setProperty('--brio-gradient-start', theme.gradientStart);
    root.style.setProperty('--brio-gradient-mid', theme.gradientMid);
    root.style.setProperty('--brio-gradient-end', theme.gradientEnd);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
