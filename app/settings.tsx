import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, List, SegmentedButtons, Text } from "react-native-paper";
import { AppScreen } from "../src/components/AppScreen";
import { resetAllData } from "../src/database";
import { useAppThemeMode } from "../src/theme/AppThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode } = useAppThemeMode();
  const [isResetting, setIsResetting] = useState(false);

  const onResetData = async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      Alert.alert("Готово", "Локальные данные приложения очищены.");
    } catch (error) {
      console.error("Failed to reset app data", error);
      Alert.alert("Ошибка", "Не удалось очистить локальные данные.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AppScreen title="Настройки" canGoBack>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Тема интерфейса" />
          <Card.Content style={styles.aboutBlock}>
            <SegmentedButtons
              value={mode}
              onValueChange={(value) => setMode(value as "light" | "dark")}
              buttons={[
                { value: "light", label: "Светлая" },
                { value: "dark", label: "Тёмная" },
              ]}
            />
            <Text variant="bodyMedium">
              В тёмной теме фоновое изображение автоматически отключается.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Быстрые действия" />
          <Card.Content>
            <List.Item
              title="Места"
              description="Перейти к базе мест"
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              onPress={() => router.push("/places")}
            />
            <List.Item
              title="Поездки"
              description="Открыть список поездок"
              left={(props) => <List.Icon {...props} icon="map-marker-path" />}
              onPress={() => router.push("/trips")}
            />
            <List.Item
              title="Следующее место"
              description="Открыть навигационный экран"
              left={(props) => <List.Icon {...props} icon="navigation-variant" />}
              onPress={() => router.push("/next-place")}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="О приложении и тестирование" />
          <Card.Content style={styles.aboutBlock}>
            <Text variant="bodyMedium">
              GoNext — офлайн-дневник туриста: места, поездки и следующее место по маршруту.
            </Text>
            <Button mode="outlined" onPress={() => router.push("/")}>
              На главный экран
            </Button>
            <Button
              mode="contained-tonal"
              onPress={() => void onResetData()}
              loading={isResetting}
              disabled={isResetting}
            >
              Сбросить локальные данные (MVP тест)
            </Button>
          </Card.Content>
        </Card>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  aboutBlock: {
    gap: 10,
  },
});
