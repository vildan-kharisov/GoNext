import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Appbar, FAB, List, Text } from "react-native-paper";
import { ScreenBackground } from "../src/components/ScreenBackground";
import { listTrips } from "../src/database";
import { Trip } from "../src/types/models";

export default function TripsScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    try {
      const data = await listTrips();
      setTrips(data);
    } catch (error) {
      console.error("Failed to load trips", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTrips();
    }, [loadTrips])
  );

  return (
    <ScreenBackground>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Поездки" />
        <Appbar.Action icon="plus" onPress={() => router.push("/trip-create")} />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.content}>
          <Text variant="titleMedium">Загрузка поездок...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={
            trips.length === 0 ? styles.emptyContainer : styles.listContainer
          }
          data={trips}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <List.Item
              title={item.title}
              description={
                item.current
                  ? "Текущая поездка"
                  : item.description || "Без описания"
              }
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={item.current ? "star-circle" : "map-marker-path"}
                />
              )}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              onPress={() => router.push(`/trip/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <Text variant="titleMedium">
              Поездок пока нет. Нажмите "+" для создания.
            </Text>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/trip-create")}
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
