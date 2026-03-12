import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const ROOT_DIR = `${FileSystem.documentDirectory}gonext`;
const PLACE_DIR = `${ROOT_DIR}/places`;
const TRIP_PLACE_DIR = `${ROOT_DIR}/trip-places`;

async function ensureDirectory(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(path, { intermediates: true });
  }
}

function getExtension(uri: string): string {
  const clean = uri.split("?")[0];
  const fileName = clean.split("/").pop() ?? "";
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex <= 0) {
    return "jpg";
  }

  return fileName.slice(dotIndex + 1).toLowerCase();
}

async function copyToLocalFolder(
  sourceUri: string,
  folder: string
): Promise<string> {
  if (Platform.OS === "web") {
    return sourceUri;
  }

  await ensureDirectory(folder);
  const extension = getExtension(sourceUri);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const targetUri = `${folder}/${fileName}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: targetUri,
  });

  return targetUri;
}

export async function savePlacePhotoLocally(sourceUri: string): Promise<string> {
  try {
    return await copyToLocalFolder(sourceUri, PLACE_DIR);
  } catch (error) {
    console.error("Failed to save place photo locally", error);
    throw new Error("Не удалось сохранить фото места в локальное хранилище.");
  }
}

export async function saveTripPlacePhotoLocally(
  sourceUri: string
): Promise<string> {
  try {
    return await copyToLocalFolder(sourceUri, TRIP_PLACE_DIR);
  } catch (error) {
    console.error("Failed to save trip place photo locally", error);
    throw new Error("Не удалось сохранить фото пункта маршрута локально.");
  }
}
