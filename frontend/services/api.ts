import axios from "axios";
import { Platform } from "react-native";

const API_URL = Platform.OS === "web"
  ? "http://127.0.0.1:8000/api/v1"
  : "http://192.168.1.72:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = globalThis.__authToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});