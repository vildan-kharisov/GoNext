import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { AppScreen } from "../src/components/AppScreen";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <AppScreen title={t("common.appName")}>
      <View style={styles.content}>
        <Surface style={styles.menuCard} elevation={1}>
          <Button mode="contained" style={styles.button} onPress={() => router.push("/places")}>
            {t("home.places")}
          </Button>
          <Button mode="contained" style={styles.button} onPress={() => router.push("/trips")}>
            {t("home.trips")}
          </Button>
          <Button mode="contained" style={styles.button} onPress={() => router.push("/next-place")}>
            {t("home.nextPlace")}
          </Button>
          <Button mode="contained" style={styles.button} onPress={() => router.push("/settings")}>
            {t("home.settings")}
          </Button>
        </Surface>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  menuCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
  },
  button: {
    width: "100%",
  },
});
