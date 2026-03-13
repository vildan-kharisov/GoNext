import { PropsWithChildren } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useAppThemeMode } from "../theme/AppThemeContext";

const backgroundImage = require("../../assets/backgrounds/gonext-bg.png");

export function ScreenBackground({ children }: PropsWithChildren) {
  const { mode } = useAppThemeMode();
  const theme = useTheme();

  if (mode === "dark") {
    return (
      <View style={[styles.background, { backgroundColor: theme.colors.background }]}>
        {children}
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
