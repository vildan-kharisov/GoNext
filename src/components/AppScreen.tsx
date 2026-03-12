import { ReactNode } from "react";
import { useRouter } from "expo-router";
import { Appbar } from "react-native-paper";
import { ScreenBackground } from "./ScreenBackground";

interface HeaderAction {
  icon: string;
  onPress: () => void;
}

interface AppScreenProps {
  title: string;
  canGoBack?: boolean;
  onBackPress?: () => void;
  actions?: HeaderAction[];
  children: ReactNode;
}

export function AppScreen({
  title,
  canGoBack = false,
  onBackPress,
  actions = [],
  children,
}: AppScreenProps) {
  const router = useRouter();

  return (
    <ScreenBackground>
      <Appbar.Header>
        {canGoBack ? (
          <Appbar.BackAction onPress={onBackPress ?? (() => router.back())} />
        ) : null}
        <Appbar.Content title={title} />
        {actions.map((action, index) => (
          <Appbar.Action
            key={`${action.icon}-${index}`}
            icon={action.icon}
            onPress={action.onPress}
          />
        ))}
      </Appbar.Header>
      {children}
    </ScreenBackground>
  );
}
