import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width - 32;

interface Entry {
  created_at: string;
  stress_score: number;
  fatigue_score: number;
  analyzed: boolean;
}

interface Props {
  entries: Entry[];
}

export default function BurnoutChart({ entries }: Props) {
  // Solo entradas analizadas, ordenadas por fecha ascendente, máximo 7
  const analyzed = entries
    .filter((e) => e.analyzed)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-7);

  if (analyzed.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Escribe al menos 2 entradas para ver tu evolución 📈
        </Text>
      </View>
    );
  }

  const labels = analyzed.map((e) =>
    new Date(e.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
  );

  const data = {
    labels,
    datasets: [
      {
        data: analyzed.map((e) => Math.round((e.stress_score || 0) * 100)),
        color: () => "#e74c3c",
        strokeWidth: 2,
      },
      {
        data: analyzed.map((e) => Math.round((e.fatigue_score || 0) * 100)),
        color: () => "#f39c12",
        strokeWidth: 2,
      },
    ],
    legend: ["Estrés", "Fatiga"],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolución últimos 7 días</Text>
      <LineChart
        data={data}
        width={screenWidth}
        height={180}
        yAxisSuffix="%"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(74, 144, 217, ${opacity})`,
          labelColor: () => "#999",
          propsForDots: { r: "4" },
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
  },
  title: { fontSize: 15, fontWeight: "600", color: "#1a1a2e", marginBottom: 8 },
  chart: { borderRadius: 8, marginLeft: -16 },
  empty: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    alignItems: "center",
  },
  emptyText: { color: "#999", fontSize: 14, textAlign: "center" },
});