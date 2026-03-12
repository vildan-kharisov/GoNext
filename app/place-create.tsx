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

function parseCoordinates(value: string): { latitude: number; longitude: number } | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parts = trimmed.split(",").map((part) => part.trim().replace(",", "."));
  if (parts.length !== 2) {
    return null;
  }

  const latitude = Number(parts[0]);
  const longitude = Number(parts[1]);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

export default function PlaceCreateScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState("");
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
      const parsedCoordinates = parseCoordinates(coordinates);
      if (coordinates.trim() && !parsedCoordinates) {
        setErrorText("Введите координаты в формате: 55.744920, 37.604677");
        setIsSaving(false);
        return;
      }

      const newId = await createPlace({
        name: trimmedName,
        description: description.trim() || null,
        visitLater,
        liked,
        latitude: parsedCoordinates?.latitude ?? null,
        longitude: parsedCoordinates?.longitude ?? null,
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
            label="Координаты"
            placeholder="55.744920, 37.604677"
            value={coordinates}
            onChangeText={setCoordinates}
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
