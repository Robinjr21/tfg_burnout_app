import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Platform
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function HistoryScreen() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const LIMIT = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["entries", page],
    queryFn: async () => {
      const { data } = await api.get(`/entries/?skip=${page * LIMIT}&limit=${LIMIT}`);
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("¿Estás seguro? Esta acción no se puede deshacer.");
      if (!confirmed) return;
      try {
        await api.delete(`/entries/${id}`);
        queryClient.invalidateQueries({ queryKey: ["entries", page] });
        queryClient.invalidateQueries({ queryKey: ["entries"] });
      } catch {
        window.alert("No se pudo eliminar la entrada");
      }
    } else {
      Alert.alert(
        "Eliminar entrada",
        "¿Estás seguro? Esta acción no se puede deshacer.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await api.delete(`/entries/${id}`);
                queryClient.invalidateQueries({ queryKey: ["entries", page] });
                queryClient.invalidateQueries({ queryKey: ["entries"] });
              } catch {
                Alert.alert("Error", "No se pudo eliminar la entrada");
              }
            },
          },
        ]
      );
    }

  try {
    await api.delete(`/entries/${id}`);
    console.log("Eliminado:", id);
    queryClient.invalidateQueries({ queryKey: ["entries", page] });
    queryClient.invalidateQueries({ queryKey: ["entries"] });
  } catch (e: any) {
    console.log("Error:", e.response?.data);
    window.alert("No se pudo eliminar la entrada");
  }
};

  const scoreColor = (score: number) => {
    if (score > 0.65) return "#e74c3c";
    if (score > 0.35) return "#f39c12";
    return "#27ae60";
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a90d9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        {data?.total ?? 0} entrada{data?.total !== 1 ? "s" : ""} en total
      </Text>

      {data?.entries?.length === 0 && (
        <Text style={styles.empty}>Aún no tienes entradas. ¡Empieza a escribir!</Text>
      )}

      {data?.entries?.map((entry: any) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.date}>
              {new Date(entry.created_at).toLocaleDateString("es-ES", {
                weekday: "short", day: "numeric",
                month: "long", year: "numeric"
              })}
            </Text>
            <TouchableOpacity onPress={() => handleDelete(entry.id)}>
              <Text style={styles.deleteBtn}>Eliminar</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.content} numberOfLines={3}>
            {entry.content}
          </Text>

          <Text style={styles.wordCount}>{entry.word_count} palabras</Text>

          {entry.analyzed && (
            <View style={styles.scoresRow}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Estrés</Text>
                <Text style={[styles.scoreValue, { color: scoreColor(entry.stress_score) }]}>
                  {Math.round(entry.stress_score * 100)}%
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Fatiga</Text>
                <Text style={[styles.scoreValue, { color: scoreColor(entry.fatigue_score) }]}>
                  {Math.round(entry.fatigue_score * 100)}%
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Cinismo</Text>
                <Text style={[styles.scoreValue, { color: scoreColor(entry.cynicism_score) }]}>
                  {Math.round(entry.cynicism_score * 100)}%
                </Text>
              </View>
            </View>
          )}

          {!entry.analyzed && (
            <Text style={styles.pending}>Pendiente de análisis</Text>
          )}
        </View>
      ))}

      {/* Paginación */}
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageBtn, page === 0 && styles.pageBtnDisabled]}
          onPress={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <Text style={styles.pageBtnText}>← Anterior</Text>
        </TouchableOpacity>
        <Text style={styles.pageNum}>Página {page + 1}</Text>
        <TouchableOpacity
          style={[styles.pageBtn, (!data?.total || (page + 1) * LIMIT >= data.total) && styles.pageBtnDisabled]}
          onPress={() => setPage((p) => p + 1)}
          disabled={!data?.total || (page + 1) * LIMIT >= data.total}
        >
          <Text style={styles.pageBtnText}>Siguiente →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 14, color: "#999", padding: 16, paddingBottom: 8 },
  empty: { textAlign: "center", color: "#999", padding: 32, fontSize: 15 },
  card: { margin: 16, marginTop: 0, marginBottom: 12, backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  date: { fontSize: 12, color: "#999", flex: 1 },
  deleteBtn: { fontSize: 12, color: "#e74c3c" },
  content: { fontSize: 15, color: "#333", lineHeight: 22, marginBottom: 8 },
  wordCount: { fontSize: 11, color: "#bbb", marginBottom: 8 },
  scoresRow: { flexDirection: "row", justifyContent: "space-around", paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  scoreItem: { alignItems: "center" },
  scoreLabel: { fontSize: 11, color: "#999", marginBottom: 2 },
  scoreValue: { fontSize: 16, fontWeight: "bold" },
  pending: { fontSize: 12, color: "#999", fontStyle: "italic" },
  pagination: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, marginBottom: 32 },
  pageBtn: { backgroundColor: "#4a90d9", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  pageBtnDisabled: { backgroundColor: "#b0c4de" },
  pageBtnText: { color: "#fff", fontSize: 14 },
  pageNum: { color: "#666", fontSize: 14 },
});