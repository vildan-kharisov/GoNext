import { StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Настройки" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text variant="titleMedium">Экран настроек (в разработке)</Text>
      </View>
    </View>
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
