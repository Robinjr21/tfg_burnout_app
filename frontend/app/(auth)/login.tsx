import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { Link } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Rellena todos los campos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.access_token);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Diario Emocional</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Entrar</Text>
          }
        </TouchableOpacity>

        <Link href="/(auth)/register" style={styles.link}>
          ¿No tienes cuenta? Regístrate
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", marginBottom: 8, color: "#1a1a2e" },
  subtitle: { fontSize: 16, textAlign: "center", color: "#666", marginBottom: 32 },
  input: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: "#e0e0e0"
  },
  error: { color: "#e74c3c", textAlign: "center", marginBottom: 12 },
  button: {
    backgroundColor: "#4a90d9", borderRadius: 12, padding: 16,
    alignItems: "center", marginBottom: 16
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { textAlign: "center", color: "#4a90d9", fontSize: 14 },
});