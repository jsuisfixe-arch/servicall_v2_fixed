import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface BrandingConfig {
  appName: string;
  logoUrl?: string;
  primaryColor: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  switchable: boolean;
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
}

const defaultBranding: BrandingConfig = {
  appName: "Servicall",
  primaryColor: "#3b82f6", // Default blue-600
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  const [branding, setBranding] = useState<BrandingConfig>(() => {
    const stored = localStorage.getItem("branding");
    return stored ? JSON.parse(stored) : defaultBranding;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  useEffect(() => {
    // Appliquer la couleur primaire aux variables CSS de Tailwind
    const root = document.documentElement;
    root.style.setProperty('--primary', branding.primaryColor);
    // On pourrait aussi générer des variantes (hover, etc.) ici
    localStorage.setItem("branding", JSON.stringify(branding));
    
    // Mettre à jour le titre de la page
    document.title = branding.appName;
  }, [branding]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const updateBranding = (config: Partial<BrandingConfig>) => {
    setBranding(prev => ({ ...prev, ...config }));
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme, 
      switchable, 
      branding, 
      updateBranding 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
