import { StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { ScreenBackground } from "../src/components/ScreenBackground";

export default function NextPlaceScreen() {
  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="titleMedium">
          Экран следующего места по маршруту (в разработке)
        </Text>
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
    padding: 16,
  },
});
