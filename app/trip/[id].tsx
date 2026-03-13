import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Appbar,
  Button,
  Card,
  HelperText,
  IconButton,
  List,
  Portal,
  Switch,
  Text,
  TextInput,
  Dialog,
} from "react-native-paper";
import { ScreenBackground } from "../../src/components/ScreenBackground";
import {
  addTripPlace,
  addTripPlacePhoto,
  createPlace,
  deleteTripPlace,
  getTripById,
  listPlacePhotos,
  listPlaces,
  listTripPlacePhotos,
  listTripPlaces,
  updateTrip,
  updateTripPlace,
} from "../../src/database";
import { saveTripPlacePhotoLocally } from "../../src/services/photoStorage";
import { Place, Trip, TripPlace, TripPlacePhoto } from "../../src/types/models";

type PhotosMap = Record<number, TripPlacePhoto[]>;
type TextMap = Record<number, string>;

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const tripId = useMemo(() => Number(id), [id]);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [tripPlaces, setTripPlaces] = useState<TripPlace[]>([]);
  const [photosMap, setPhotosMap] = useState<PhotosMap>({});
  const [visitDatesDraft, setVisitDatesDraft] = useState<TextMap>({});
  const [notesDraft, setNotesDraft] = useState<TextMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isPlaceDialogVisible, setIsPlaceDialogVisible] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);

  const loadData = useCallback(async () => {
    if (!Number.isFinite(tripId)) {
      setErrorText(t("tripDetails.invalidId"));
      setIsLoading(false);
      return;
    }

    try {
      const [tripData, placesData, routeData] = await Promise.all([
        getTripById(tripId),
        listPlaces(),
        listTripPlaces(tripId),
      ]);

      if (!tripData) {
        setErrorText(t("tripDetails.notFound"));
        return;
      }

      setTrip(tripData);
      setAllPlaces(placesData);
      setTripPlaces(routeData);
      setTitle(tripData.title);
      setDescription(tripData.description ?? "");
      setStartDate(tripData.startDate ?? "");
      setEndDate(tripData.endDate ?? "");
      setCurrent(tripData.current);

      const photosEntries = await Promise.all(
        routeData.map(async (item) => [
          item.id,
          await listTripPlacePhotos(item.id),
        ] as const)
      );
      const nextPhotosMap: PhotosMap = {};
      const nextVisitDateDraft: TextMap = {};
      const nextNotesDraft: TextMap = {};

      for (const [tripPlaceId, photos] of photosEntries) {
        nextPhotosMap[tripPlaceId] = photos;
      }
      for (const item of routeData) {
        nextVisitDateDraft[item.id] = item.visitDate ?? "";
        nextNotesDraft[item.id] = item.notes ?? "";
      }

      setPhotosMap(nextPhotosMap);
      setVisitDatesDraft(nextVisitDateDraft);
      setNotesDraft(nextNotesDraft);
    } catch (error) {
      console.error("Failed to load trip details", error);
      setErrorText(t("tripDetails.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [tripId, t]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      void loadData();
    }, [loadData])
  );

  const onSaveTrip = async () => {
    if (!trip) {
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorText(t("tripDetails.requiredName"));
      return;
    }

    setErrorText(null);
    setIsSavingTrip(true);
    try {
      const ok = await updateTrip(trip.id, {
        title: trimmedTitle,
        description: description.trim() || null,
        startDate: startDate.trim() || null,
        endDate: endDate.trim() || null,
        current,
      });
      if (!ok) {
        setErrorText(t("tripDetails.saveTripError"));
      } else {
        await loadData();
      }
    } catch (error) {
      console.error("Failed to save trip", error);
      setErrorText(t("tripDetails.saveTripException"));
    } finally {
      setIsSavingTrip(false);
    }
  };

  const addPlaceToTrip = async (placeId: number) => {
    const nextOrder = tripPlaces.reduce(
      (maxValue, item) => Math.max(maxValue, item.orderIndex),
      -1
    ) + 1;
    await addTripPlace({
      tripId,
      placeId,
      orderIndex: nextOrder,
    });
    await loadData();
  };

  const onCreateAndAddPlace = async () => {
    const trimmed = newPlaceName.trim();
    if (!trimmed) {
      setErrorText(t("tripDetails.newPlaceRequired"));
      return;
    }

    setErrorText(null);
    try {
      const placeId = await createPlace({
        name: trimmed,
        visitLater: true,
      });
      setNewPlaceName("");
      await addPlaceToTrip(placeId);
    } catch (error) {
      console.error("Failed to create and add place", error);
      setErrorText(t("tripDetails.createAndAddError"));
    }
  };

  const moveTripPlace = async (tripPlaceId: number, direction: "up" | "down") => {
    const sorted = [...tripPlaces].sort((a, b) => a.orderIndex - b.orderIndex);
    const index = sorted.findIndex((item) => item.id === tripPlaceId);
    if (index < 0) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) {
      return;
    }

    const first = sorted[index];
    const second = sorted[targetIndex];

    await updateTripPlace(first.id, { orderIndex: second.orderIndex });
    await updateTripPlace(second.id, { orderIndex: first.orderIndex });
    await loadData();
  };

  const onToggleVisited = async (item: TripPlace, visited: boolean) => {
    await updateTripPlace(item.id, {
      visited,
      visitDate: visited
        ? item.visitDate ?? new Date().toISOString().slice(0, 10)
        : null,
    });
    await loadData();
  };

  const onSaveTripPlaceNotes = async (item: TripPlace) => {
    await updateTripPlace(item.id, {
      visitDate: (visitDatesDraft[item.id] ?? "").trim() || null,
      notes: (notesDraft[item.id] ?? "").trim() || null,
    });
    await loadData();
  };

  const onDeleteTripPlace = async (tripPlaceId: number) => {
    await deleteTripPlace(tripPlaceId);
    await loadData();
  };

  const onAddTripPlacePhoto = async (tripPlaceId: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorText(t("tripDetails.routePhotoPermission"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const localUri = await saveTripPlacePhotoLocally(result.assets[0].uri);
    await addTripPlacePhoto(tripPlaceId, localUri);
    await loadData();
  };

  const placesById = useMemo(() => {
    const map = new Map<number, Place>();
    for (const place of allPlaces) {
      map.set(place.id, place);
    }
    return map;
  }, [allPlaces]);

  const sortedTripPlaces = useMemo(
    () => [...tripPlaces].sort((a, b) => a.orderIndex - b.orderIndex),
    [tripPlaces]
  );

  if (isLoading) {
    return (
      <ScreenBackground>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t("tripDetails.titleShort")} />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text variant="titleMedium">{t("common.loading")}</Text>
        </View>
      </ScreenBackground>
    );
  }

  if (!trip) {
    return (
      <ScreenBackground>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t("tripDetails.titleShort")} />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text variant="titleMedium">{t("tripDetails.notFound")}</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("tripDetails.title")} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Title title={t("tripDetails.tripInfo")} />
          <Card.Content style={styles.sectionContent}>
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
              <Text variant="bodyLarge">{t("tripDetails.currentTrip")}</Text>
              <Switch value={current} onValueChange={setCurrent} />
            </View>
            <Button mode="contained" loading={isSavingTrip} onPress={onSaveTrip}>
              {t("tripDetails.saveTrip")}
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title={t("tripDetails.tripRoute")} />
          <Card.Content style={styles.sectionContent}>
            <Button mode="outlined" onPress={() => setIsPlaceDialogVisible(true)}>
              {t("tripDetails.addFromBase")}
            </Button>

            <View style={styles.newPlaceRow}>
              <TextInput
                mode="outlined"
                label={t("tripDetails.newPlace")}
                value={newPlaceName}
                onChangeText={setNewPlaceName}
                style={styles.flexInput}
              />
              <Button mode="contained-tonal" onPress={onCreateAndAddPlace}>
                {t("tripDetails.createAndAdd")}
              </Button>
            </View>

            {sortedTripPlaces.length === 0 ? (
              <Text variant="bodyLarge">
                {t("tripDetails.emptyRoute")}
              </Text>
            ) : (
              sortedTripPlaces.map((item, index) => {
                const place = placesById.get(item.placeId);
                const photos = photosMap[item.id] ?? [];
                return (
                  <Card key={item.id} style={styles.routeCard}>
                    <Card.Title
                      title={`${index + 1}. ${
                        place?.name ?? t("tripDetails.placeFallback", { id: item.placeId })
                      }`}
                      subtitle={place?.description ?? t("common.noDescription")}
                      right={() => (
                        <View style={styles.routeActions}>
                          <IconButton
                            icon="arrow-up"
                            onPress={() => void moveTripPlace(item.id, "up")}
                            disabled={index === 0}
                          />
                          <IconButton
                            icon="arrow-down"
                            onPress={() => void moveTripPlace(item.id, "down")}
                            disabled={index === sortedTripPlaces.length - 1}
                          />
                          <IconButton
                            icon="delete"
                            onPress={() => void onDeleteTripPlace(item.id)}
                          />
                        </View>
                      )}
                    />
                    <Card.Content style={styles.sectionContent}>
                      <View style={styles.switchRow}>
                        <Text variant="bodyLarge">{t("tripDetails.routeVisited")}</Text>
                        <Switch
                          value={item.visited}
                          onValueChange={(value) => void onToggleVisited(item, value)}
                        />
                      </View>
                      <TextInput
                        mode="outlined"
                        label={t("tripDetails.visitDate")}
                        value={visitDatesDraft[item.id] ?? ""}
                        onChangeText={(value) =>
                          setVisitDatesDraft((prev) => ({
                            ...prev,
                            [item.id]: value,
                          }))
                        }
                      />
                      <TextInput
                        mode="outlined"
                        label={t("tripDetails.notes")}
                        value={notesDraft[item.id] ?? ""}
                        onChangeText={(value) =>
                          setNotesDraft((prev) => ({
                            ...prev,
                            [item.id]: value,
                          }))
                        }
                        multiline
                      />
                      <View style={styles.rowButtons}>
                        <Button
                          mode="contained"
                          onPress={() => void onSaveTripPlaceNotes(item)}
                        >
                          {t("tripDetails.saveNotes")}
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => void onAddTripPlacePhoto(item.id)}
                        >
                          {t("tripDetails.addPhoto")}
                        </Button>
                      </View>

                      {photos.length > 0 ? (
                        <ScrollView
                          horizontal
                          contentContainerStyle={styles.photosRow}
                        >
                          {photos.map((photo) => (
                            <Image
                              key={photo.id}
                              source={{ uri: photo.uri }}
                              style={styles.photo}
                            />
                          ))}
                        </ScrollView>
                      ) : (
                        <Text variant="bodySmall">{t("tripDetails.routeNoPhotos")}</Text>
                      )}
                    </Card.Content>
                  </Card>
                );
              })
            )}
          </Card.Content>
        </Card>

        <HelperText type="error" visible={Boolean(errorText)}>
          {errorText}
        </HelperText>
      </ScrollView>

      <Portal>
        <Dialog
          visible={isPlaceDialogVisible}
          onDismiss={() => setIsPlaceDialogVisible(false)}
        >
          <Dialog.Title>{t("tripDetails.selectPlace")}</Dialog.Title>
          <Dialog.Content>
            {allPlaces.length === 0 ? (
              <Text>{t("tripDetails.createPlacesFirst")}</Text>
            ) : (
              <ScrollView style={styles.dialogList}>
                {allPlaces.map((place) => (
                  <List.Item
                    key={place.id}
                    title={place.name}
                    description={place.description ?? t("common.noDescription")}
                    left={(props) => <List.Icon {...props} icon="map-marker" />}
                    onPress={() => {
                      setIsPlaceDialogVisible(false);
                      void addPlaceToTrip(place.id);
                    }}
                  />
                ))}
              </ScrollView>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsPlaceDialogVisible(false)}>
              {t("common.close")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    padding: 12,
    gap: 12,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  sectionContent: {
    gap: 10,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newPlaceRow: {
    gap: 10,
  },
  flexInput: {
    flex: 1,
  },
  routeCard: {
    backgroundColor: "rgba(248, 248, 248, 0.96)",
  },
  routeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photosRow: {
    gap: 8,
    paddingVertical: 4,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  dialogList: {
    maxHeight: 280,
  },
});
