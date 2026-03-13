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
  AppPrimaryColor,
  AppThemeMode,
  AppThemeProvider,
  useAppThemeMode,
} from "../src/theme/AppThemeContext";

function getPaperTheme(mode: AppThemeMode, primaryColor: AppPrimaryColor) {
  const baseTheme = mode === "dark" ? MD3DarkTheme : MD3LightTheme;
  return {
    ...baseTheme,
    roundness: 12,
    colors: {
      ...baseTheme.colors,
      primary: primaryColor,
      secondary: primaryColor,
    },
  };
}

function RootLayoutContent() {
  const { mode, primaryColor } = useAppThemeMode();
  const appTheme = getPaperTheme(mode, primaryColor);

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
