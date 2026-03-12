import { StyleSheet, View } from "react-native";
import { Button, Surface, Text } from "react-native-paper";

interface StateBlockProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function StateBlock({
  title,
  description,
  actionLabel,
  onActionPress,
}: StateBlockProps) {
  return (
    <View style={styles.wrapper}>
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium">{title}</Text>
        {description ? <Text variant="bodyMedium">{description}</Text> : null}
        {actionLabel && onActionPress ? (
          <Button mode="contained" onPress={onActionPress}>
            {actionLabel}
          </Button>
        ) : null}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
});
