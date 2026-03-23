import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { savePlacePhotoLocally } from "../../src/services/photoStorage";
import { Place, PlacePhoto } from "../../src/types/models";

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

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const placeId = useMemo(() => Number(id), [id]);

  const [place, setPlace] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [visitLater, setVisitLater] = useState(true);
  const [liked, setLiked] = useState(false);

  const fillForm = useCallback((value: Place) => {
    setName(value.name);
    setDescription(value.description ?? "");
    setCoordinates(
      value.latitude == null || value.longitude == null
        ? ""
        : `${value.latitude}, ${value.longitude}`
    );
    setVisitLater(value.visitLater);
    setLiked(value.liked);
  }, []);

  const loadData = useCallback(async () => {
    if (!Number.isFinite(placeId)) {
      setErrorText(t("placeDetails.invalidId"));
      setIsLoading(false);
      return;
    }

    try {
      const [placeData, photosData] = await Promise.all([
        getPlaceById(placeId),
        listPlacePhotos(placeId),
      ]);

      if (!placeData) {
        setErrorText(t("placeDetails.notFound"));
        return;
      }

      setPlace(placeData);
      setPhotos(photosData);
      fillForm(placeData);
    } catch (error) {
      console.error("Failed to load place details", error);
      setErrorText(t("placeDetails.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [fillForm, placeId, t]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      void loadData();
    }, [loadData])
  );

  const onOpenMap = async () => {
    if (!place || place.latitude == null || place.longitude == null) {
      setErrorText(t("placeDetails.mapNeedsCoordinates"));
      return;
    }

    // Открываем Yandex Maps с координатами в поле "Поиск" и меткой на карте.
    // "text" — запрос в поиске, для координат обычно ожидают формат "lat, lon".
    // "pt" + "ll" — подсказка карте, куда поставить точку.
    const lat = place.latitude;
    const lon = place.longitude;
    const searchText = `${lat}, ${lon}`;

    const url = `https://yandex.ru/maps/?text=${encodeURIComponent(
      searchText
    )}&ll=${lon},${lat}&z=16&pt=${lon},${lat},pmrdm1`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      setErrorText(t("placeDetails.mapOpenError"));
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
      setErrorText(t("placeDetails.requiredName"));
      return;
    }

    setErrorText(null);
    setIsSaving(true);

    try {
      const parsedCoordinates = parseCoordinates(coordinates);
      if (coordinates.trim() && !parsedCoordinates) {
        setErrorText(t("placeDetails.invalidCoordinates"));
        setIsSaving(false);
        return;
      }

      const updated = await updatePlace(place.id, {
        name: trimmedName,
        description: description.trim() || null,
        visitLater,
        liked,
        latitude: parsedCoordinates?.latitude ?? null,
        longitude: parsedCoordinates?.longitude ?? null,
      });

      if (!updated) {
        setErrorText(t("placeDetails.updateError"));
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
      setErrorText(t("placeDetails.saveError"));
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
        setErrorText(t("placeDetails.galleryPermission"));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const localUri = await savePlacePhotoLocally(result.assets[0].uri);
      await addPlacePhoto(place.id, localUri);
      const updatedPhotos = await listPlacePhotos(place.id);
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Failed to add photo", error);
      setErrorText(t("placeDetails.addPhotoError"));
    }
  };

  if (isLoading) {
    return (
      <ScreenBackground>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t("placeDetails.title")} />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text variant="titleMedium">{t("common.loading")}</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("placeDetails.title")} />
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
              label={t("placeCreate.name")}
              value={name}
              onChangeText={setName}
              editable={isEditing}
            />
            <TextInput
              mode="outlined"
              label={t("placeCreate.description")}
              value={description}
              onChangeText={setDescription}
              editable={isEditing}
              multiline
            />
            <TextInput
              mode="outlined"
              label={t("placeCreate.coordinates")}
              placeholder={t("placeCreate.coordinatesPlaceholder")}
              value={coordinates}
              onChangeText={setCoordinates}
              editable={isEditing}
            />

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">{t("placeCreate.visitLater")}</Text>
              <Switch
                value={visitLater}
                onValueChange={setVisitLater}
                disabled={!isEditing}
              />
            </View>

            <View style={styles.switchRow}>
              <Text variant="bodyLarge">{t("placeCreate.liked")}</Text>
              <Switch
                value={liked}
                onValueChange={setLiked}
                disabled={!isEditing}
              />
            </View>

            <View style={styles.buttonRow}>
              {isEditing ? (
                <Button mode="contained" loading={isSaving} onPress={onSave}>
                  {t("common.save")}
                </Button>
              ) : (
                <Button mode="contained" onPress={onOpenMap}>
                  {t("placeDetails.openOnMap")}
                </Button>
              )}
              <Button mode="outlined" onPress={onAddPhoto}>
                {t("placeDetails.addPhoto")}
              </Button>
            </View>

            <Text variant="titleMedium">{t("placeDetails.photos")}</Text>
            {photos.length === 0 ? (
              <Text variant="bodyMedium">{t("placeDetails.noPhotos")}</Text>
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
            <Text variant="titleMedium">{t("placeDetails.notFoundScreen")}</Text>
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
