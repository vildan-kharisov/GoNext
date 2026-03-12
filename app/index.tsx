import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Appbar, Button } from "react-native-paper";
import { ScreenBackground } from "../src/components/ScreenBackground";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.content}>
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
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
  },
  button: {
    width: "100%",
    maxWidth: 320,
  },
});
