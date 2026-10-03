// Autor: Edson Vasconcelos | Diamond Runner 2026
// Status: TELA DE NOTÍCIAS - Visual Moderno Blue Diamond

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { useTexts } from "../../i18n/hooks/useTexts";
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
  const texts = useTexts("news");
  const styles = createStyles(theme);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [news, setNews] = useState([]);
  const [dismissedNewsIds, setDismissedNewsIds] = useState(new Set());
  const [expandedNewsId, setExpandedNewsId] = useState(null);
  const [dismissingNewsId, setDismissingNewsId] = useState(null);

  const fetchNews = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const { data: dismissals, error: dismissalsError } = await supabase
        .from("news_user_dismissals")
        .select("news_id")
        .eq("user_id", user.id);

      if (dismissalsError) throw dismissalsError;
      setNews(data || []);
      setDismissedNewsIds(new Set((dismissals || []).map((row) => row.news_id)));
    } catch (error) {
      console.log("Erro ao carregar notícias:", error.message);
      Alert.alert(texts.error, texts.loadError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const dismissNews = (item) => {
    Alert.alert(
      texts.removeTitle,
      texts.removeConfirmation,
      [
        { text: texts.cancel, style: "cancel" },
        {
          text: texts.remove,
          style: "destructive",
          onPress: async () => {
            const newsId = String(item.id);
            setDismissingNewsId(newsId);
            try {
              const {
                data: { user },
                error: userError,
              } = await supabase.auth.getUser();
              if (userError) throw userError;
              if (!user) throw new Error("Usuário não autenticado.");

              const { error } = await supabase
                .from("news_user_dismissals")
                .insert({ user_id: user.id, news_id: newsId });

              if (error) throw error;

              setDismissedNewsIds((current) =>
                new Set(current).add(newsId),
              );
              setExpandedNewsId(null);
            } catch (error) {
              console.log("Erro ao remover aviso:", error.message);
              Alert.alert(texts.error, texts.removeError);
            } finally {
              setDismissingNewsId(null);
            }
          },
        },
      ],
    );
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const visibleNews = news.filter(
    (item) => !dismissedNewsIds.has(String(item.id)),
  );

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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.headerTitle}>{texts.headerTitle}</Text>
          <Image
            source={require("../../assets/images/logodiamond.png")}
            style={{ width: 38, height: 38 }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.headerSub}>{texts.subtitle}</Text>
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
        {visibleNews.map((item) => {
            const isExpanded = expandedNewsId === String(item.id);
            return (
              <View key={item.id} style={styles.newsCard}>
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.newsImage}
                  />
                ) : null}
                <View style={styles.newsContent}>
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={COLORS.gold}
                    />
                    <Text style={styles.newsDate}>
                      {new Date(item.created_at).toLocaleDateString(texts.locale)}
                    </Text>
                  </View>
                  <Text style={styles.newsTitle}>{item.title}</Text>
                  <Text
                    style={styles.newsDesc}
                    numberOfLines={isExpanded ? undefined : 3}
                  >
                    {item.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedNewsId(isExpanded ? null : String(item.id))
                      }
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isExpanded
                          ? texts.collapse
                          : texts.readMore
                      }
                    >
                      <Text style={styles.readMore}>
                        {isExpanded ? texts.collapse : texts.readMore.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                    {item.link ? (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(item.link)}
                        activeOpacity={0.75}
                        accessibilityRole="button"
                        accessibilityLabel={texts.openOfficial}
                      >
                        <Ionicons
                          name="open-outline"
                          size={16}
                          color={COLORS.primary}
                        />
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity
                      onPress={() => dismissNews(item)}
                      disabled={dismissingNewsId === String(item.id)}
                      activeOpacity={0.75}
                      accessibilityRole="button"
                      accessibilityLabel={texts.removeFromList}
                      style={styles.dismissButton}
                    >
                      {dismissingNewsId === String(item.id) ? (
                        <ActivityIndicator
                          size="small"
                          color={COLORS.textSub}
                        />
                      ) : (
                        <>
                          <Ionicons
                            name="close-circle-outline"
                            size={16}
                            color={COLORS.textSub}
                          />
                          <Text style={styles.dismissText}>{texts.remove.toUpperCase()}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

        {visibleNews.length === 0 && (
          <Text style={styles.emptyText}>
            {news.length > 0
              ? texts.removedAll
              : texts.noPublishedNews}
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
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  readMore: { color: COLORS.primary, fontSize: 11, fontWeight: "900" },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    paddingVertical: 4,
  },
  dismissText: { color: COLORS.textSub, fontSize: 10, fontWeight: "800" },
  emptyText: {
    color: theme.text,
    textAlign: "center",
    marginTop: 50,
    fontSize: 14,
  },
});
