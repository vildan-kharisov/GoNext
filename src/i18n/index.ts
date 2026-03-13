import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

export const LANGUAGE_STORAGE_KEY = "gonext_language";
export const SUPPORTED_LANGUAGES = ["ru", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

let initPromise: Promise<void> | null = null;

function normalizeLanguage(value: string | null): SupportedLanguage {
  if (value === "en") {
    return "en";
  }
  return "ru";
}

export async function initI18n(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const savedLanguage = normalizeLanguage(
      await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
    );

    await i18n.use(initReactI18next).init({
      compatibilityJSON: "v4",
      resources,
      lng: savedLanguage,
      fallbackLng: "ru",
      interpolation: {
        escapeValue: false,
      },
    });
  })();

  return initPromise;
}

export async function setAppLanguage(language: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export function getCurrentLanguage(): SupportedLanguage {
  return normalizeLanguage(i18n.resolvedLanguage ?? i18n.language ?? "ru");
}

export { i18n };
