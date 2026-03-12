import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { MD3LightTheme, Provider as PaperProvider } from "react-native-paper";
import { initializeDatabase } from "../src/database/init";

const appTheme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2A73B8",
    secondary: "#4F7FAF",
  },
};

export default function RootLayout() {
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
