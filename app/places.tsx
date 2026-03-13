import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { FAB, List } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { AppScreen } from "../src/components/AppScreen";
import { StateBlock } from "../src/components/StateBlock";
import { listPlaces } from "../src/database";
import { Place } from "../src/types/models";

export default function PlacesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const loadPlaces = useCallback(async () => {
    try {
      setErrorText(null);
      const data = await listPlaces();
      setPlaces(data);
    } catch (error) {
      console.error("Failed to load places", error);
      setErrorText(t("places.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void loadPlaces();
    }, [loadPlaces])
  );

  return (
    <AppScreen
      title={t("places.title")}
      canGoBack
      actions={[{ icon: "plus", onPress: () => router.push("/place-create") }]}
    >
      {isLoading ? (
        <StateBlock title={t("places.loading")} />
      ) : errorText ? (
        <StateBlock
          title={t("common.error")}
          description={errorText}
          actionLabel={t("common.retry")}
          onActionPress={() => {
            setIsLoading(true);
            void loadPlaces();
          }}
        />
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
              description={item.description || t("common.noDescription")}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              onPress={() => router.push(`/place/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <StateBlock
              title={t("places.emptyTitle")}
              description={t("places.emptyDescription")}
              actionLabel={t("places.createAction")}
              onActionPress={() => router.push("/place-create")}
            />
          }
          onRefresh={() => {
            setIsLoading(true);
            void loadPlaces();
          }}
          refreshing={isLoading && places.length > 0}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/place-create")}
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
