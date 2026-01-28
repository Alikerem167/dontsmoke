export interface User {
  lastSmokeAt: number | null;
  relapseCount: number;
  bestStreakSeconds: number;
  createdAt: number;
  updatedAt: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};