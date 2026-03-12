import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  HelperText,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { createPlace } from "../src/database";

function parseCoordinate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function PlaceCreateScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [visitLater, setVisitLater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const onSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorText("Название места обязательно.");
      return;
    }

    setErrorText(null);
    setIsSaving(true);

    try {
      const lat = parseCoordinate(latitude);
      const lng = parseCoordinate(longitude);

      const newId = await createPlace({
        name: trimmedName,
        description: description.trim() || null,
        visitLater,
        liked,
        latitude: lat,
        longitude: lng,
      });

      router.replace(`/place/${newId}`);
    } catch (error) {
      console.error("Failed to create place", error);
      setErrorText("Не удалось сохранить место.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Новое место" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Название"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            mode="outlined"
            label="Описание"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TextInput
            mode="outlined"
            label="Широта (latitude)"
            value={latitude}
            onChangeText={setLatitude}
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            label="Долгота (longitude)"
            value={longitude}
            onChangeText={setLongitude}
            keyboardType="numeric"
          />

          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Посетить позже</Text>
            <Switch value={visitLater} onValueChange={setVisitLater} />
          </View>
          <View style={styles.switchRow}>
            <Text variant="bodyLarge">Понравилось</Text>
            <Switch value={liked} onValueChange={setLiked} />
          </View>

          <HelperText type="error" visible={Boolean(errorText)}>
            {errorText}
          </HelperText>

          <Button mode="contained" loading={isSaving} onPress={onSave}>
            Сохранить
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
