import * as SecureStore from "expo-secure-store";
import { firestore, auth } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const KEY_LAST_SMOKE_AT = "lastSmokeAt";

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User not authenticated");
  return uid;
}

export const saveLastSmokeAt = async (timestamp: number) => {
  // Local cache
  await SecureStore.setItemAsync(KEY_LAST_SMOKE_AT, String(timestamp));

  // Cloud sync
  const uid = requireUid();
  const ref = doc(firestore, "users", uid);

  await setDoc(
    ref,
    { lastSmokeAt: timestamp, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

export const getLastSmokeAt = async (): Promise<number | null> => {
  // 1) Local first (fast startup)
  const cached = await SecureStore.getItemAsync(KEY_LAST_SMOKE_AT);
  if (cached) {
    const n = Number(cached);
    return Number.isFinite(n) ? n : null;
  }

  // 2) Cloud fallback
  const uid = requireUid();
  const ref = doc(firestore, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const data = snap.data();
  const ts = data?.lastSmokeAt;
  return typeof ts === "number" ? ts : null;
};
