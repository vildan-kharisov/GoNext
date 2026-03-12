import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Appbar, FAB, List, Text } from "react-native-paper";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { listPlaces } from "../src/database";
import { Place } from "../src/types/models";

export default function PlacesScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlaces = useCallback(async () => {
    try {
      const data = await listPlaces();
      setPlaces(data);
    } catch (error) {
      console.error("Failed to load places", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPlaces();
    }, [loadPlaces])
  );

  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Места" />
        <Appbar.Action
          icon="plus"
          onPress={() => router.push("/place-create")}
        />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.content}>
          <Text variant="titleMedium">Загрузка мест...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={
            places.length === 0 ? styles.emptyContainer : styles.listContainer
          }
          data={places}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.description || "Без описания"}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              onPress={() => router.push(`/place/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <Text variant="titleMedium">
              Пока нет мест. Нажмите "+" чтобы добавить первое.
            </Text>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/place-create")}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  listContainer: {
    padding: 12,
  },
  listItem: {
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
