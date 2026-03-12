import { StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { ScreenBackground } from "../src/components/ScreenBackground";

export default function PlacesScreen() {
  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.Content title="Места" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="titleMedium">Экран списка мест (в разработке)</Text>
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
