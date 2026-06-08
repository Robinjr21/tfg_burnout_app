import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import BurnoutChart from "@/components/BurnoutChart";

export default function DashboardScreen() {
  const logout = useAuthStore((state) => state.logout);

  const { data, isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const { data } = await api.get("/entries/?limit=3");
      return data;
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data } = await api.get("/analysis/alerts");
      return data;
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¿Cómo estás hoy?</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Alertas activas */}
      {alerts && alerts.length > 0 && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>⚠️ Alerta preventiva</Text>
          <Text style={styles.alertText}>{alerts[0].message}</Text>
        </View>
      )}

      {/* Botón nueva entrada */}
      <TouchableOpacity
        style={styles.newEntryButton}
        onPress={() => router.push("/(app)/new-entry")}
      >
        <Text style={styles.newEntryText}>✏️ Escribir en el diario</Text>
      </TouchableOpacity>

      <BurnoutChart entries={data?.entries || []} />

      {/* Últimas entradas */}
      <Text style={styles.sectionTitle}>Últimas entradas</Text>
      {isLoading && <Text style={styles.loading}>Cargando...</Text>}
      {data?.entries?.map((entry: any) => (
        <View key={entry.id} style={styles.entryCard}>
          <Text style={styles.entryDate}>
            {new Date(entry.created_at).toLocaleDateString("es-ES", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </Text>
          <Text style={styles.entryPreview} numberOfLines={2}>
            {entry.content}
          </Text>
          {entry.analyzed && (
            <View style={styles.scores}>
              <Text style={styles.score}>😰 {Math.round(entry.stress_score * 100)}%</Text>
              <Text style={styles.score}>😴 {Math.round(entry.fatigue_score * 100)}%</Text>
              <Text style={styles.score}>😑 {Math.round(entry.cynicism_score * 100)}%</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24, paddingTop: 16 },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#1a1a2e" },
  logout: { color: "#e74c3c", fontSize: 14 },
  alertBox: { margin: 16, padding: 16, backgroundColor: "#fff3cd", borderRadius: 12, borderLeftWidth: 4, borderLeftColor: "#f39c12" },
  alertTitle: { fontWeight: "bold", marginBottom: 4, color: "#856404" },
  alertText: { color: "#856404", fontSize: 14 },
  newEntryButton: { margin: 16, backgroundColor: "#4a90d9", borderRadius: 12, padding: 18, alignItems: "center" },
  newEntryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "600", paddingHorizontal: 16, marginBottom: 8, color: "#1a1a2e" },
  loading: { textAlign: "center", color: "#666", padding: 16 },
  entryCard: { margin: 16, marginTop: 0, backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12 },
  entryDate: { fontSize: 12, color: "#999", marginBottom: 4 },
  entryPreview: { fontSize: 15, color: "#333", lineHeight: 22 },
  scores: { flexDirection: "row", marginTop: 8, gap: 12 },
  score: { fontSize: 13, color: "#666" },
});