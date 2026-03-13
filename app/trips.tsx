import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { FAB, List } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { AppScreen } from "../src/components/AppScreen";
import { StateBlock } from "../src/components/StateBlock";
import { listTrips } from "../src/database";
import { Trip } from "../src/types/models";

export default function TripsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    try {
      setErrorText(null);
      const data = await listTrips();
      setTrips(data);
    } catch (error) {
      console.error("Failed to load trips", error);
      setErrorText(t("trips.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void loadTrips();
    }, [loadTrips])
  );

  return (
    <AppScreen
      title={t("trips.title")}
      canGoBack
      actions={[{ icon: "plus", onPress: () => router.push("/trip-create") }]}
    >
      {isLoading ? (
        <StateBlock title={t("trips.loading")} />
      ) : errorText ? (
        <StateBlock
          title={t("common.error")}
          description={errorText}
          actionLabel={t("common.retry")}
          onActionPress={() => {
            setIsLoading(true);
            void loadTrips();
          }}
        />
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
                  ? t("trips.currentTrip")
                  : item.description || t("common.noDescription")
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
            <StateBlock
              title={t("trips.emptyTitle")}
              description={t("trips.emptyDescription")}
              actionLabel={t("trips.createAction")}
              onActionPress={() => router.push("/trip-create")}
            />
          }
          onRefresh={() => {
            setIsLoading(true);
            void loadTrips();
          }}
          refreshing={isLoading && trips.length > 0}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/trip-create")}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
    padding: 12,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
