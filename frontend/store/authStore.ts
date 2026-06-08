import { create } from "zustand";
import { Platform } from "react-native";

const TOKEN_KEY = "burnout_auth_token";

// Almacenamiento compatible con web y móvil
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      const SecureStore = await import("expo-secure-store");
      return await SecureStore.getItemAsync(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      const SecureStore = await import("expo-secure-store");
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      const SecureStore = await import("expo-secure-store");
      await SecureStore.deleteItemAsync(key);
    }
  },
};

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  loadToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,

  setToken: (token: string) => {
    globalThis.__authToken = token;
    storage.setItem(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    globalThis.__authToken = undefined;
    storage.removeItem(TOKEN_KEY);
    set({ token: null, isAuthenticated: false });
  },

  loadToken: () => {
    storage.getItem(TOKEN_KEY).then((token) => {
      if (token) {
        globalThis.__authToken = token;
        set({ token, isAuthenticated: true });
      }
    });
  },
}));