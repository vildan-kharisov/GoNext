import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

export type AppThemeMode = "light" | "dark";

export const THEME_PRIMARY_COLORS = [
  "#2A73B8",
  "#D32F2F",
  "#C2185B",
  "#7B1FA2",
  "#512DA8",
  "#1976D2",
  "#00796B",
  "#388E3C",
  "#F57C00",
  "#5D4037",
] as const;

export type AppPrimaryColor = (typeof THEME_PRIMARY_COLORS)[number];

interface AppThemeContextValue {
  mode: AppThemeMode;
  setMode: (mode: AppThemeMode) => void;
  primaryColor: AppPrimaryColor;
  setPrimaryColor: (color: AppPrimaryColor) => void;
}

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined
);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<AppThemeMode>("light");
  const [primaryColor, setPrimaryColor] = useState<AppPrimaryColor>(
    THEME_PRIMARY_COLORS[0]
  );

  const value = useMemo(
    () => ({
      mode,
      setMode,
      primaryColor,
      setPrimaryColor,
    }),
    [mode, primaryColor]
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppThemeMode(): AppThemeContextValue {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppThemeMode must be used within AppThemeProvider.");
  }
  return context;
}
