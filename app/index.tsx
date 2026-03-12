import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Surface } from "react-native-paper";
import { AppScreen } from "../src/components/AppScreen";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <AppScreen title="GoNext">
      <View style={styles.content}>
        <Surface style={styles.menuCard} elevation={1}>
          <Button mode="contained" style={styles.button} onPress={() => router.push("/places")}>
          Места
          </Button>
          <Button mode="contained" style={styles.button} onPress={() => router.push("/trips")}>
          Поездки
          </Button>
          <Button mode="contained" style={styles.button} onPress={() => router.push("/next-place")}>
          Следующее место
          </Button>
          <Button mode="contained" style={styles.button} onPress={() => router.push("/settings")}>
          Настройки
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
