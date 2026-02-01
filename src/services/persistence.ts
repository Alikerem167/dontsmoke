import * as SecureStore from "expo-secure-store";

const KEY_LAST_SMOKE_AT = "lastSmokeAt";
const KEY_BEST_STREAK_MS = "bestStreakMs";
const KEY_RELAPSE_COUNT = "relapseCount";

export const saveLastSmokeAt = async (timestamp: number) => {
  await SecureStore.setItemAsync(KEY_LAST_SMOKE_AT, String(timestamp));
};

export const getLastSmokeAt = async (): Promise<number | null> => {
  const cached = await SecureStore.getItemAsync(KEY_LAST_SMOKE_AT);
  if (cached) {
    const n = Number(cached);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

export const saveBestStreakMs = async (ms: number) => {
  await SecureStore.setItemAsync(KEY_BEST_STREAK_MS, String(ms));
};

export const getBestStreakMs = async (): Promise<number> => {
  const cached = await SecureStore.getItemAsync(KEY_BEST_STREAK_MS);
  if (cached) {
    const n = Number(cached);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

export const saveRelapseCount = async (count: number) => {
  await SecureStore.setItemAsync(KEY_RELAPSE_COUNT, String(count));
};

export const getRelapseCount = async (): Promise<number> => {
  const cached = await SecureStore.getItemAsync(KEY_RELAPSE_COUNT);
  if (cached) {
    const n = Number(cached);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

export const resetAllData = async () => {
  await SecureStore.deleteItemAsync(KEY_LAST_SMOKE_AT);
  await SecureStore.deleteItemAsync(KEY_BEST_STREAK_MS);
  await SecureStore.deleteItemAsync(KEY_RELAPSE_COUNT);
};
