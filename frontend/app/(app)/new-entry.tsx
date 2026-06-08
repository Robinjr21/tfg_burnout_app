import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert
} from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function NewEntryScreen() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert("Aviso", "Escribe algo antes de guardar");
      return;
    }
    setLoading(true);
    try {
      // 1. Guardar la entrada
      const { data: entry } = await api.post("/entries/", { content });

      // 2. Analizar con el modelo de IA
      setAnalyzing(true);
      const { data: analysis } = await api.post(`/analysis/entries/${entry.id}`);

      // 3. Invalidar caché para que el dashboard se actualice
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["alerts"] });

      // 4. Mostrar resultado
      if (analysis.alert_triggered) {
        Alert.alert(
          "⚠️ Alerta detectada",
          analysis.message,
          [{ text: "Entendido", onPress: () => router.replace("/(app)") }]
        );
      } else {
        Alert.alert(
          "✅ Entrada guardada",
          "Tu entrada ha sido analizada correctamente.",
          [{ text: "Ver dashboard", onPress: () => router.replace("/(app)") }]
        );
      }
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "No se pudo guardar la entrada");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
        <Text style={styles.subtitle}>
          Escribe libremente. Todo está cifrado y es privado.
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="Hoy me he sentido..."
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={5000}
        />

        <Text style={styles.charCount}>{content.length}/5000</Text>

        <TouchableOpacity
          style={[styles.button, (!content.trim() || loading) && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!content.trim() || loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.buttonText}>
                {analyzing ? "  Analizando..." : "  Guardando..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Guardar y analizar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  inner: { padding: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1a1a2e", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 20 },
  textArea: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16,
    fontSize: 16, lineHeight: 24, minHeight: 250,
    borderWidth: 1, borderColor: "#e0e0e0", marginBottom: 8,
  },
  charCount: { textAlign: "right", color: "#999", fontSize: 12, marginBottom: 24 },
  button: {
    backgroundColor: "#4a90d9", borderRadius: 12,
    padding: 18, alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#b0c4de" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  loadingRow: { flexDirection: "row", alignItems: "center" },
});