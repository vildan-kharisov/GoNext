import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Appbar,
  Button,
  HelperText,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { createTrip } from "../src/database";

export default function TripCreateScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const onSave = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorText(t("tripCreate.requiredName"));
      return;
    }

    setErrorText(null);
    setIsSaving(true);

    try {
      const id = await createTrip({
        title: trimmedTitle,
        description: description.trim() || null,
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
        current,
      });
      router.replace(`/trip/${id}`);
    } catch (error) {
      console.error("Failed to create trip", error);
      setErrorText(t("tripCreate.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("tripCreate.title")} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label={t("tripCreate.tripName")}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            mode="outlined"
            label={t("tripCreate.description")}
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            mode="outlined"
            label={t("tripCreate.startDate")}
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            mode="outlined"
            label={t("tripCreate.endDate")}
            value={endDate}
            onChangeText={setEndDate}
          />

          <View style={styles.switchRow}>
            <Text variant="bodyLarge">{t("tripCreate.makeCurrent")}</Text>
            <Switch value={current} onValueChange={setCurrent} />
          </View>

          <HelperText type="error" visible={Boolean(errorText)}>
            {errorText}
          </HelperText>

          <Button mode="contained" loading={isSaving} onPress={onSave}>
            {t("common.save")}
          </Button>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  form: {
    gap: 12,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
