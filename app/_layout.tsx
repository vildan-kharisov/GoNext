import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { initializeDatabase } from "../src/database/init";
import {
  AppThemeMode,
  AppThemeProvider,
  useAppThemeMode,
} from "../src/theme/AppThemeContext";

function getPaperTheme(mode: AppThemeMode) {
  const baseTheme = mode === "dark" ? MD3DarkTheme : MD3LightTheme;
  return {
    ...baseTheme,
  roundness: 12,
  colors: {
      ...baseTheme.colors,
    primary: "#2A73B8",
    secondary: "#4F7FAF",
  },
};
}

function RootLayoutContent() {
  const { mode } = useAppThemeMode();
  const appTheme = getPaperTheme(mode);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void initializeDatabase()
      .catch((error: unknown) => {
        console.error("Database initialization failed", error);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return (
      <PaperProvider theme={appTheme}>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={appTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutContent />
    </AppThemeProvider>
  );
}
