import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/entries/?limit=1");
      return data;
    },
  });

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "¿Eliminar tu cuenta? Se borrarán todos tus datos permanentemente. Esta acción no se puede deshacer."
    );
    if (!confirmed) return;
    logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tu actividad</Text>
        <Text style={styles.stat}>
          📝 Entradas totales: <Text style={styles.statValue}>{data?.total ?? 0}</Text>
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Privacidad</Text>
        <Text style={styles.infoText}>
          Todas tus entradas están cifradas con AES-256-GCM. 
          Nadie más puede leer tu contenido.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sesión</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Zona de peligro</Text>
        <Text style={styles.infoText}>
          Al eliminar tu cuenta se borrarán todos tus datos conforme al RGPD.
        </Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Eliminar mi cuenta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#1a1a2e", marginBottom: 12 },
  stat: { fontSize: 15, color: "#333" },
  statValue: { fontWeight: "bold", color: "#4a90d9" },
  infoText: { fontSize: 14, color: "#666", lineHeight: 20, marginBottom: 12 },
  logoutBtn: {
    backgroundColor: "#f5f5f5", borderRadius: 8,
    padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: "#e0e0e0",
  },
  logoutText: { color: "#333", fontSize: 15, fontWeight: "500" },
  deleteBtn: {
    backgroundColor: "#fff0f0", borderRadius: 8,
    padding: 14, alignItems: "center",
    borderWidth: 1, borderColor: "#e74c3c",
  },
  deleteText: { color: "#e74c3c", fontSize: 15, fontWeight: "500" },
});