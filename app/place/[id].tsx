import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Appbar,
  Button,
  HelperText,
  Switch,
  Text,
  TextInput,
} from "react-native-paper";
import { ScreenBackground } from "../../src/components/ScreenBackground";
import {
  addPlacePhoto,
  getPlaceById,
  listPlacePhotos,
  updatePlace,
} from "../../src/database";
import { Place, PlacePhoto } from "../../src/types/models";

function parseCoordinate(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const placeId = useMemo(() => Number(id), [id]);

  const [place, setPlace] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [visitLater, setVisitLater] = useState(true);
  const [liked, setLiked] = useState(false);

  const fillForm = useCallback((value: Place) => {
    setName(value.name);
    setDescription(value.description ?? "");
    setLatitude(value.latitude == null ? "" : String(value.latitude));
    setLongitude(value.longitude == null ? "" : String(value.longitude));
    setVisitLater(value.visitLater);
    setLiked(value.liked);
  }, []);

  const loadData = useCallback(async () => {
    if (!Number.isFinite(placeId)) {
      setErrorText("Некорректный id места.");
      setIsLoading(false);
      return;
    }

    try {
      const [placeData, photosData] = await Promise.all([
        getPlaceById(placeId),
        listPlacePhotos(placeId),
      ]);

      if (!placeData) {
        setErrorText("Место не найдено.");
        return;
      }

      setPlace(placeData);
      setPhotos(photosData);
      fillForm(placeData);
    } catch (error) {
      console.error("Failed to load place details", error);
      setErrorText("Не удалось загрузить карточку места.");
    } finally {
      setIsLoading(false);
    }
  }, [fillForm, placeId]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      void loadData();
    }, [loadData])
  );

  const onOpenMap = async () => {
    if (!place || place.latitude == null || place.longitude == null) {
      setErrorText("Для открытия карты нужны координаты.");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      setErrorText("Не удалось открыть карту.");
      return;
    }

    await Linking.openURL(url);
  };

  const onSave = async () => {
    if (!place) {
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorText("Название места обязательно.");
      return;
    }

    setErrorText(null);
    setIsSaving(true);

    try {
      const updated = await updatePlace(place.id, {
        name: trimmedName,
        description: description.trim() || null,
        visitLater,
        liked,
        latitude: parseCoordinate(latitude),
        longitude: parseCoordinate(longitude),
      });

      if (!updated) {
        setErrorText("Не удалось обновить место.");
        return;
      }

      const fresh = await getPlaceById(place.id);
      if (fresh) {
        setPlace(fresh);
        fillForm(fresh);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update place", error);
      setErrorText("Ошибка при сохранении.");
    } finally {
      setIsSaving(false);
    }
  };

  const onAddPhoto = async () => {
    if (!place) {
      return;
    }

    setErrorText(null);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setErrorText("Нужен доступ к галерее для добавления фото.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      await addPlacePhoto(place.id, result.assets[0].uri);
      const updatedPhotos = await listPlacePhotos(place.id);
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Failed to add photo", error);
      setErrorText("Не удалось добавить фото.");
    }
  };

  if (isLoading) {
    return (
      <ScreenBackground>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Карточка места" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text variant="titleMedium">Загрузка...</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Карточка места" />
        <Appbar.Action
          icon={isEditing ? "close" : "pencil"}
          onPress={() => setIsEditing((prev) => !prev)}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {place ? (
          <View style={styles.card}>
            <TextInput
              mode="outlined"
              label="Название"
              value={name}
              onChangeText={setName}
              editable={isEditing}
            />
            <TextInput
              mode="outlined"
              label="Описание"
              value={description}
              onChangeText={setDescription}
              editable={isEditing}
              multiline
            />
            <TextInput
              mode="outlined"
              label="Широта (latitude)"
              value={latitude}
              onChangeText={setLatitude}
              editable={isEditing}
              keyboardType="numeric"
            />
            <TextInput
              mode="outlined"
              label="Долгота (longitude)"
              value={longitude}
              onChangeText={setLongitude}
              editable={isEditing}
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Посетить позже</Text>
              <Switch
                value={visitLater}
                onValueChange={setVisitLater}
                disabled={!isEditing}
              />
            </View>

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">Понравилось</Text>
              <Switch
                value={liked}
                onValueChange={setLiked}
                disabled={!isEditing}
              />
            </View>

            <View style={styles.buttonRow}>
              {isEditing ? (
                <Button mode="contained" loading={isSaving} onPress={onSave}>
                  Сохранить
                </Button>
              ) : (
                <Button mode="contained" onPress={onOpenMap}>
                  Открыть на карте
                </Button>
              )}
              <Button mode="outlined" onPress={onAddPhoto}>
                Добавить фото
              </Button>
            </View>

            <Text variant="titleMedium">Фотографии</Text>
            {photos.length === 0 ? (
              <Text variant="bodyMedium">Фото пока не добавлены.</Text>
            ) : (
              <ScrollView horizontal contentContainerStyle={styles.photosRow}>
                {photos.map((photo) => (
                  <Image
                    key={photo.id}
                    source={{ uri: photo.uri }}
                    style={styles.photo}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.centered}>
            <Text variant="titleMedium">Место не найдено.</Text>
          </View>
        )}

        <HelperText type="error" visible={Boolean(errorText)}>
          {errorText}
        </HelperText>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  content: {
    padding: 16,
  },
  card: {
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
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photosRow: {
    gap: 8,
    paddingVertical: 4,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
});
