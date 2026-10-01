// Autor: Edson Vasconcelos | Diamond Runner 2026
// Status: TELA DE NOTÍCIAS - Visual Moderno Blue Diamond

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { supabase } from "../../services/supabase";

const COLORS = {
  background: "#0c3c74",
  primary: "#2c94bc",
  gold: "#FFD700",
  white: "#FFFFFF",
  card: "rgba(255, 255, 255, 0.05)",
  textSub: "#a4bccc",
};

export default function NewsScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState([]);

  const fetchNews = async () => {
    try {
      // DICA: Você pode criar uma tabela 'news' no Supabase para gerenciar isso
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.log("Erro ao carregar notícias:", error.message);
      // Fallback para teste se a tabela ainda não existir
      setNews([
        {
          id: 1,
          title: "LANÇAMENTO DIAMOND RUNNER 2026",
          description:
            "Seja bem-vindo à nova era do marketing multinível tecnológico. O futuro começou!",
          image_url: "https://via.placeholder.com",
          link: "https://seu-site.com",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>NOTÍCIAS & AVISOS</Text>
        <Text style={styles.headerSub}>Fique por dentro das novidades</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNews();
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        {news.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.newsCard}
            onPress={() => item.link && Linking.openURL(item.link)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.image_url }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <View style={styles.dateRow}>
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={COLORS.gold}
                />
                <Text style={styles.newsDate}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDesc} numberOfLines={3}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.readMore}>LER MAIS</Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={COLORS.primary}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {news.length === 0 && (
          <Text style={styles.emptyText}>
            Nenhuma notícia publicada no momento.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  center: { justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 20 },
  headerTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerSub: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  newsCard: {
    backgroundColor: theme.card,
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  newsImage: { width: "100%", height: 180, resizeMode: "cover" },
  newsContent: { padding: 20 },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
  },
  newsDate: { color: COLORS.gold, fontSize: 11, fontWeight: "bold" },
  newsTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  newsDesc: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
  },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  readMore: { color: COLORS.primary, fontSize: 11, fontWeight: "900" },
  emptyText: {
    color: theme.text,
    textAlign: "center",
    marginTop: 50,
    fontSize: 14,
  },
});
