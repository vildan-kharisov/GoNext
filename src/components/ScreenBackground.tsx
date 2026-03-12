import { PropsWithChildren } from "react";
import { ImageBackground, StyleSheet } from "react-native";

const backgroundImage = require("../../assets/backgrounds/gonext-bg.png");

export function ScreenBackground({ children }: PropsWithChildren) {
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
