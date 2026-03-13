import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Button, Card, List, SegmentedButtons, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { AppScreen } from "../src/components/AppScreen";
import { resetAllData } from "../src/database";
import { getCurrentLanguage, setAppLanguage, SupportedLanguage } from "../src/i18n";
import {
  THEME_PRIMARY_COLORS,
  useAppThemeMode,
} from "../src/theme/AppThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { mode, setMode, primaryColor, setPrimaryColor } = useAppThemeMode();
  const [isResetting, setIsResetting] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>(getCurrentLanguage());

  const onLanguageChange = async (value: string) => {
    const nextLanguage = value === "en" ? "en" : "ru";
    setLanguage(nextLanguage);
    await setAppLanguage(nextLanguage);
  };

  const onResetData = async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      Alert.alert(t("settings.resetSuccessTitle"), t("settings.resetSuccessMessage"));
    } catch (error) {
      console.error("Failed to reset app data", error);
      Alert.alert(t("settings.resetErrorTitle"), t("settings.resetErrorMessage"));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AppScreen title={t("settings.title")} canGoBack>
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title={t("settings.languageTitle")} />
          <Card.Content style={styles.aboutBlock}>
            <SegmentedButtons
              value={language}
              onValueChange={(value) => void onLanguageChange(value)}
              buttons={[
                { value: "ru", label: t("settings.languageRu") },
                { value: "en", label: t("settings.languageEn") },
              ]}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title={t("settings.themeTitle")} />
          <Card.Content style={styles.aboutBlock}>
            <SegmentedButtons
              value={mode}
              onValueChange={(value) => setMode(value as "light" | "dark")}
              buttons={[
                { value: "light", label: t("settings.themeLight") },
                { value: "dark", label: t("settings.themeDark") },
              ]}
            />
            <Text variant="bodyMedium">
              {t("settings.darkNoImageHint")}
            </Text>
            <Text variant="bodyMedium">{t("settings.primaryColor")}</Text>
            <View style={styles.paletteGrid}>
              {THEME_PRIMARY_COLORS.map((color) => {
                const isSelected = color === primaryColor;
                return (
                  <Pressable
                    key={color}
                    onPress={() => setPrimaryColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      isSelected ? styles.colorCircleSelected : null,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={t("settings.chooseColorA11y", { color })}
                  >
                    {isSelected ? (
                      <View style={styles.selectedDot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title={t("settings.quickActions")} />
          <Card.Content>
            <List.Item
              title={t("settings.places")}
              description={t("settings.placesDescription")}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              onPress={() => router.push("/places")}
            />
            <List.Item
              title={t("settings.trips")}
              description={t("settings.tripsDescription")}
              left={(props) => <List.Icon {...props} icon="map-marker-path" />}
              onPress={() => router.push("/trips")}
            />
            <List.Item
              title={t("settings.nextPlace")}
              description={t("settings.nextPlaceDescription")}
              left={(props) => <List.Icon {...props} icon="navigation-variant" />}
              onPress={() => router.push("/next-place")}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title={t("settings.aboutAndTesting")} />
          <Card.Content style={styles.aboutBlock}>
            <Text variant="bodyMedium">
              {t("settings.aboutText")}
            </Text>
            <Button mode="outlined" onPress={() => router.push("/")}>
              {t("settings.goHome")}
            </Button>
            <Button
              mode="contained-tonal"
              onPress={() => void onResetData()}
              loading={isResetting}
              disabled={isResetting}
            >
              {t("settings.resetData")}
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
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
});
