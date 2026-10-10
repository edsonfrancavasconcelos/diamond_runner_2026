// Autor: Edson Vasconcelos | Diamond Runner 2026
// Status: NOTÍCIAS & AVISOS - Visual Premium Black & Gold

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Image,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { useTexts } from "../../i18n/hooks/useTexts";
import { supabase } from "../../services/supabase";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#FFD700";
const FAVORITES_KEY = "news_favorites";
const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const ALL = "__all__";
const FAVORITES = "__favorites__";

const getColors = (isDark) =>
  isDark
    ? {
        bg: "#050505",
        card: "#111111",
        cardAlt: "#1a1a1a",
        text: "#FFFFFF",
        sub: "#B8B8B8",
        border: "rgba(212,175,55,0.28)",
        input: "#141414",
      }
    : {
        bg: "#FAF7EE",
        card: "#FFFFFF",
        cardAlt: "#F1EAD3",
        text: "#111111",
        sub: "#5E5E5E",
        border: "rgba(212,175,55,0.5)",
        input: "#FFFFFF",
      };

const CATEGORY_ICONS = {
  Plataforma: "rocket-outline",
  Comunidade: "people-outline",
  Treinamentos: "school-outline",
  Tecnologia: "hardware-chip-outline",
  Institucional: "ribbon-outline",
};

const iconFor = (category) => CATEGORY_ICONS[category] || "newspaper-outline";

const LOCAL_NEWS = [
  {
    id: "platform-evolving",
    isBuiltin: true,
    featured: true,
    category: "Plataforma",
    date: "2026-10-10T12:00:00",
    title: "Plataforma Diamond Runner evoluindo",
    description:
      "Estamos trabalhando continuamente para oferecer uma experiência mais rápida, segura e intuitiva. Novas melhorias estão sendo preparadas para tornar o Diamond Runner ainda mais completo.",
  },
  {
    id: "community-growth",
    isBuiltin: true,
    featured: true,
    category: "Comunidade",
    date: "2026-10-09T12:00:00",
    title: "Crescimento da Comunidade",
    description:
      "A comunidade Diamond Runner continua crescendo e fortalecendo sua presença. Cada novo associado representa mais oportunidades de networking, aprendizado e desenvolvimento.",
  },
  {
    id: "training-soon",
    isBuiltin: true,
    category: "Treinamentos",
    date: "2026-10-08T12:00:00",
    title: "Capacitação em breve",
    description:
      "Novos conteúdos educativos estão sendo preparados para ajudar nossos associados a desenvolver habilidades em vendas, liderança e utilização da plataforma.",
  },
  {
    id: "tech-news",
    isBuiltin: true,
    category: "Tecnologia",
    date: "2026-10-07T12:00:00",
    title: "Novidades Tecnológicas",
    description:
      "Nossa equipe segue investindo em inovação para trazer novas funcionalidades que facilitem o dia a dia dos associados e melhorem a experiência dentro do aplicativo.",
  },
  {
    id: "community-highlight",
    isBuiltin: true,
    category: "Comunidade",
    date: "2026-10-06T12:00:00",
    title: "Comunidade em Destaque",
    description:
      "A participação ativa dos associados fortalece nosso ecossistema. Continue acompanhando os comunicados oficiais e participe das futuras ações da comunidade.",
  },
  {
    id: "special-message",
    isBuiltin: true,
    category: "Institucional",
    date: "2026-10-05T12:00:00",
    title: "Mensagem Especial",
    description:
      "O sucesso é construído diariamente com dedicação, aprendizado e colaboração. Agradecemos por fazer parte da comunidade Diamond Runner.",
  },
];

const normalizeRemote = (row) => {
  const category = row.category || "Comunicado";
  return {
    id: String(row.id),
    isBuiltin: false,
    category,
    date: row.created_at,
    title: row.title,
    description: row.description,
    image_url: row.image_url,
    link: row.link,
  };
};

const buildShareText = (item) =>
  `${item.title}\n\n${item.description}\n\n— Diamond Runner`;

const confirmAction = (title, message, confirmLabel, cancelLabel, onConfirm) => {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
};

function Shimmer({ style, color }) {
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[style, { backgroundColor: color, opacity }]} />
  );
}

function SkeletonCard({ styles, colors }) {
  return (
    <View style={styles.card}>
      <Shimmer style={styles.skelCover} color={colors.cardAlt} />
      <View style={styles.cardBody}>
        <Shimmer style={styles.skelLineShort} color={colors.cardAlt} />
        <Shimmer style={styles.skelLineTitle} color={colors.cardAlt} />
        <Shimmer style={styles.skelLine} color={colors.cardAlt} />
        <Shimmer style={styles.skelLine} color={colors.cardAlt} />
      </View>
    </View>
  );
}

function NewsCard({
  item,
  index,
  styles,
  colors,
  locale,
  texts,
  favorite,
  expanded,
  dismissing,
  onToggleFavorite,
  onToggleExpand,
  onShare,
  onCopy,
  onDismiss,
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 450,
      delay: Math.min(index, 8) * 70,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const isNew = Date.now() - new Date(item.date).getTime() <= NEW_WINDOW_MS;
  const dateLabel = item.date
    ? new Date(item.date).toLocaleDateString(locale)
    : "";

  return (
    <Animated.View
      style={[
        styles.card,
        item.featured && styles.cardFeatured,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
          ],
        },
      ]}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.cover} />
      ) : (
        <LinearGradient
          colors={["#000000", "#1c1604", "#3a2b08"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cover}
        >
          <View style={styles.iconGlow}>
            <Ionicons name={iconFor(item.category)} size={38} color={GOLD_LIGHT} />
          </View>
        </LinearGradient>
      )}

      <View style={styles.cardBody}>
        <View style={styles.metaRow}>
          <View style={styles.categoryChip}>
            <Ionicons name={iconFor(item.category)} size={11} color="#000" />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color={GOLD} />
            <Text style={styles.dateText}>{dateLabel}</Text>
          </View>
          {isNew ? (
            <View style={styles.newBadge}>
              <Ionicons name="sparkles" size={10} color="#000" />
              <Text style={styles.newText}>NOVO</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text
          style={styles.cardDesc}
          numberOfLines={expanded ? undefined : 3}
        >
          {item.description}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={onToggleExpand}
            style={styles.readMoreBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Text style={styles.readMoreText}>
              {expanded ? texts.collapse : texts.readMore.toUpperCase()}
            </Text>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={14}
              color="#000"
            />
          </TouchableOpacity>

          <View style={styles.iconActions}>
            <TouchableOpacity
              onPress={onToggleFavorite}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Favoritar notícia"
            >
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={20}
                color={favorite ? "#ff4d6d" : colors.sub}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onShare}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Compartilhar notícia"
            >
              <Ionicons name="share-social-outline" size={20} color={GOLD} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onCopy}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Copiar texto"
            >
              <Ionicons name="copy-outline" size={20} color={colors.sub} />
            </TouchableOpacity>
            {item.link ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.link)}
                style={styles.iconBtn}
                accessibilityRole="button"
                accessibilityLabel={texts.openOfficial}
              >
                <Ionicons name="open-outline" size={20} color={GOLD} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onDismiss}
              disabled={dismissing}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel={texts.removeFromList}
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={colors.sub}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function NewsScreen() {
  const { isDark } = useTheme();
  const texts = useTexts("news");
  const colors = useMemo(() => getColors(isDark), [isDark]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [remoteNews, setRemoteNews] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [dismissedBuiltinIds, setDismissedBuiltinIds] = useState(new Set());
  const [dismissingId, setDismissingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(ALL);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const bannerAnim = useRef(new Animated.Value(0)).current;

  const showToast = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    Animated.timing(bannerAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [bannerAnim]);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY)
      .then((raw) => {
        if (raw) setFavorites(new Set(JSON.parse(raw)));
      })
      .catch(() => {});
  }, []);

  const fetchNews = useCallback(async () => {
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

      setRemoteNews((data || []).map(normalizeRemote));
      setDismissedIds(new Set((dismissals || []).map((row) => row.news_id)));
    } catch (error) {
      console.log("Erro ao carregar notícias:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const toggleFavorite = (id) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...next])).catch(
        () => {},
      );
      return next;
    });
  };

  const copyItem = async (item) => {
    try {
      await Clipboard.setStringAsync(buildShareText(item));
      showToast("Texto copiado!");
    } catch {
      showToast("Não foi possível copiar.");
    }
  };

  const shareItem = async (item) => {
    try {
      await Share.share({ title: item.title, message: buildShareText(item) });
    } catch {
      await copyItem(item);
    }
  };

  const dismissItem = (item) => {
    confirmAction(
      texts.removeTitle,
      texts.removeConfirmation,
      texts.remove,
      texts.cancel,
      async () => {
        if (item.isBuiltin) {
          setDismissedBuiltinIds((current) => new Set(current).add(item.id));
          setExpandedId(null);
          return;
        }
        setDismissingId(item.id);
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (!user) throw new Error("Usuário não autenticado.");

          const { error } = await supabase
            .from("news_user_dismissals")
            .insert({ user_id: user.id, news_id: item.id });
          if (error) throw error;

          setDismissedIds((current) => new Set(current).add(item.id));
          setExpandedId(null);
        } catch (error) {
          console.log("Erro ao remover aviso:", error.message);
          showToast(texts.removeError);
        } finally {
          setDismissingId(null);
        }
      },
    );
  };

  const allNews = useMemo(() => {
    const visible = [...LOCAL_NEWS, ...remoteNews].filter((item) =>
      item.isBuiltin
        ? !dismissedBuiltinIds.has(item.id)
        : !dismissedIds.has(item.id),
    );
    return visible.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [remoteNews, dismissedIds, dismissedBuiltinIds]);

  const categories = useMemo(
    () => [...new Set(allNews.map((item) => item.category))],
    [allNews],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering =
    normalizedQuery.length > 0 || filter !== ALL;

  const filtered = useMemo(
    () =>
      allNews.filter((item) => {
        if (filter === FAVORITES && !favorites.has(item.id)) return false;
        if (filter !== ALL && filter !== FAVORITES && item.category !== filter)
          return false;
        if (!normalizedQuery) return true;
        return `${item.title} ${item.description} ${item.category}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [allNews, filter, favorites, normalizedQuery],
  );

  const featuredItems = filtered.filter((item) => item.featured);
  const recentItems = filtered.filter((item) => !item.featured);
  const shareTarget = allNews[0] || LOCAL_NEWS[0];

  const renderCard = (item, index) => (
    <NewsCard
      key={item.id}
      item={item}
      index={index}
      styles={styles}
      colors={colors}
      locale={texts.locale}
      texts={texts}
      favorite={favorites.has(item.id)}
      expanded={expandedId === item.id}
      dismissing={dismissingId === item.id}
      onToggleFavorite={() => toggleFavorite(item.id)}
      onToggleExpand={() =>
        setExpandedId(expandedId === item.id ? null : item.id)
      }
      onShare={() => shareItem(item)}
      onCopy={() => copyItem(item)}
      onDismiss={() => dismissItem(item)}
    />
  );

  const chips = [
    { key: ALL, label: "Todas", icon: "apps-outline" },
    { key: FAVORITES, label: "Favoritas", icon: "heart-outline" },
    ...categories.map((category) => ({
      key: category,
      label: category,
      icon: iconFor(category),
    })),
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNews();
            }}
            tintColor={GOLD_LIGHT}
          />
        }
      >
        <View style={styles.column}>
          <Animated.View
            style={{
              opacity: bannerAnim,
              transform: [
                {
                  translateY: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-18, 0],
                  }),
                },
              ],
            }}
          >
            <LinearGradient
              colors={["#000000", "#16120a", "#3a2b08"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={styles.bannerTop}>
                <View style={styles.bannerIcon}>
                  <Ionicons name="newspaper" size={26} color={GOLD_LIGHT} />
                </View>
                <Image
                  source={require("../../assets/images/logodiamond.png")}
                  style={styles.bannerLogo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.bannerTitle}>Notícias & Avisos</Text>
              <Text style={styles.bannerSubtitle}>
                Fique por dentro das novidades do Diamond Runner
              </Text>
              <Text style={styles.bannerDesc}>
                Aqui você acompanha comunicados oficiais, novidades da
                plataforma, atualizações, campanhas e conteúdos exclusivos para
                toda a comunidade Diamond Runner.
              </Text>
              <TouchableOpacity
                onPress={() => shareItem(shareTarget)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Compartilhar novidade"
              >
                <LinearGradient
                  colors={[GOLD_LIGHT, GOLD]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shareButton}
                >
                  <Ionicons name="share-social" size={18} color="#000" />
                  <Text style={styles.shareButtonText}>
                    Compartilhar Novidade
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={GOLD} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Pesquisar notícias"
              placeholderTextColor={colors.sub}
              style={styles.searchInput}
              returnKeyType="search"
              accessibilityLabel="Pesquisar notícias"
            />
            {query ? (
              <TouchableOpacity
                onPress={() => setQuery("")}
                accessibilityRole="button"
                accessibilityLabel="Limpar pesquisa"
              >
                <Ionicons name="close-circle" size={18} color={colors.sub} />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {chips.map((chip) => {
              const active = filter === chip.key;
              return (
                <TouchableOpacity
                  key={chip.key}
                  onPress={() => setFilter(chip.key)}
                  activeOpacity={0.85}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={chip.icon}
                    size={13}
                    color={active ? "#000" : GOLD}
                  />
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? (
            <>
              <SkeletonCard styles={styles} colors={colors} />
              <SkeletonCard styles={styles} colors={colors} />
              <SkeletonCard styles={styles} colors={colors} />
            </>
          ) : (
            <>
              {isFiltering ? (
                <>
                  <Text style={styles.sectionTitle}>
                    Resultados ({filtered.length})
                  </Text>
                  {filtered.map(renderCard)}
                </>
              ) : (
                <>
                  {featuredItems.length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="star" size={16} color={GOLD_LIGHT} />
                        <Text style={styles.sectionTitle}>Em destaque</Text>
                      </View>
                      {featuredItems.map(renderCard)}
                    </>
                  )}
                  {recentItems.length > 0 && (
                    <>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="time" size={16} color={GOLD_LIGHT} />
                        <Text style={styles.sectionTitle}>Recentes</Text>
                      </View>
                      {recentItems.map((item, index) =>
                        renderCard(item, index + featuredItems.length),
                      )}
                    </>
                  )}
                </>
              )}

              {filtered.length === 0 && (
                <View style={styles.empty}>
                  <Ionicons name="newspaper-outline" size={40} color={GOLD} />
                  <Text style={styles.emptyText}>
                    {allNews.length === 0
                      ? texts.removedAll
                      : "Nenhuma notícia encontrada."}
                  </Text>
                </View>
              )}
            </>
          )}

          <LinearGradient
            colors={["#000000", "#16120a", "#3a2b08"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.footer}
          >
            <Image
              source={require("../../assets/images/logodiamond.png")}
              style={styles.footerLogo}
              resizeMode="contain"
            />
            <Text style={styles.footerBrand}>Diamond Runner</Text>
            <Text style={styles.footerText}>
              Tecnologia, inovação e oportunidades para fortalecer nossa
              comunidade todos os dias.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {toast ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const glow = {
  shadowColor: GOLD_LIGHT,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 14,
};

const createStyles = (c) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.bg },
    scroll: { padding: 16, paddingBottom: 48, alignItems: "center" },
    column: { width: "100%", maxWidth: 900 },

    banner: {
      borderRadius: 24,
      padding: 22,
      borderWidth: 1,
      borderColor: GOLD,
      marginBottom: 18,
      ...glow,
      shadowOpacity: 0.35,
      elevation: 8,
    },
    bannerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    bannerIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: GOLD,
      backgroundColor: "rgba(212,175,55,0.12)",
    },
    bannerLogo: { width: 44, height: 44 },
    bannerTitle: {
      color: "#FFFFFF",
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    bannerSubtitle: {
      color: GOLD_LIGHT,
      fontSize: 15,
      fontWeight: "800",
      marginTop: 6,
    },
    bannerDesc: {
      color: "#E4E4E4",
      fontSize: 13,
      lineHeight: 20,
      marginTop: 12,
      marginBottom: 18,
    },
    shareButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 30,
      ...glow,
      shadowOpacity: 0.6,
      elevation: 6,
    },
    shareButtonText: {
      color: "#000",
      fontSize: 14,
      fontWeight: "900",
      letterSpacing: 0.5,
    },

    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.input,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      minHeight: 48,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      color: c.text,
      fontSize: 14,
      paddingVertical: 10,
      outlineStyle: "none",
    },
    chipsRow: { gap: 8, paddingBottom: 14, paddingRight: 8 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chipActive: { backgroundColor: GOLD_LIGHT, borderColor: GOLD_LIGHT },
    chipText: { color: c.text, fontSize: 12, fontWeight: "700" },
    chipTextActive: { color: "#000" },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
      marginBottom: 12,
    },
    sectionTitle: {
      color: c.text,
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: 1,
      marginBottom: 0,
    },

    card: {
      backgroundColor: c.card,
      borderRadius: 22,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 18,
      ...glow,
      shadowOpacity: 0.15,
      elevation: 3,
    },
    cardFeatured: { borderColor: GOLD, shadowOpacity: 0.4, elevation: 7 },
    cover: {
      width: "100%",
      height: 130,
      alignItems: "center",
      justifyContent: "center",
      resizeMode: "cover",
    },
    iconGlow: {
      width: 70,
      height: 70,
      borderRadius: 35,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: GOLD,
      backgroundColor: "rgba(212,175,55,0.1)",
      ...glow,
      shadowOpacity: 0.7,
    },
    cardBody: { padding: 18 },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 10,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: GOLD_LIGHT,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    categoryText: { color: "#000", fontSize: 11, fontWeight: "900" },
    dateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    dateText: { color: c.sub, fontSize: 11, fontWeight: "700" },
    newBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: GOLD,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    newText: { color: "#000", fontSize: 10, fontWeight: "900" },
    cardTitle: {
      color: c.text,
      fontSize: 19,
      fontWeight: "900",
      marginBottom: 8,
    },
    cardDesc: { color: c.sub, fontSize: 14, lineHeight: 22 },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
      marginTop: 16,
    },
    readMoreBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: GOLD_LIGHT,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    readMoreText: { color: "#000", fontSize: 11, fontWeight: "900" },
    iconActions: { flexDirection: "row", alignItems: "center", gap: 2 },
    iconBtn: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },

    skelCover: { width: "100%", height: 130 },
    skelLineShort: { width: "35%", height: 14, borderRadius: 7, marginBottom: 12 },
    skelLineTitle: { width: "75%", height: 20, borderRadius: 8, marginBottom: 12 },
    skelLine: { width: "100%", height: 12, borderRadius: 6, marginBottom: 8 },

    empty: { alignItems: "center", gap: 10, paddingVertical: 40 },
    emptyText: { color: c.sub, fontSize: 14, textAlign: "center" },

    footer: {
      alignItems: "center",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: GOLD,
      padding: 24,
      marginTop: 8,
      ...glow,
      shadowOpacity: 0.3,
      elevation: 6,
    },
    footerLogo: { width: 46, height: 46, marginBottom: 8 },
    footerBrand: {
      color: GOLD_LIGHT,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: 1,
    },
    footerText: {
      color: "#E4E4E4",
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      marginTop: 8,
    },

    toast: {
      position: "absolute",
      bottom: 28,
      alignSelf: "center",
      backgroundColor: "#000",
      borderWidth: 1,
      borderColor: GOLD,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 22,
    },
    toastText: { color: GOLD_LIGHT, fontSize: 13, fontWeight: "800" },
  });
