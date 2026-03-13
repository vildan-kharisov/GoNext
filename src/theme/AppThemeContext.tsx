import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

export type AppThemeMode = "light" | "dark";

interface AppThemeContextValue {
  mode: AppThemeMode;
  setMode: (mode: AppThemeMode) => void;
}

const AppThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined
);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<AppThemeMode>("light");

  const value = useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode]
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
