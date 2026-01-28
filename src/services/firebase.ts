import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import * as firebaseAuth from "firebase/auth"; // 👈 type bug varsa buradan any ile alacağız
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
  storageBucket: "XXX",
  messagingSenderId: "XXX",
  appId: "XXX",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Bazı Firebase sürümlerinde TS declaration bug var.
// Release notes'e göre fonksiyon var, ama type'lar bazen göstermiyor. :contentReference[oaicite:2]{index=2}
const getReactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const firestore = getFirestore(app);
