import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";
import { initializeDatabase } from "../src/database/init";

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
      <PaperProvider>
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
