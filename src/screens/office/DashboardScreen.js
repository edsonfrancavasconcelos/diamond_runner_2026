import DiamondLogo from "../../assets/images/logodiamond.png";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { supabase } from "../../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  gold: "#FFD700",
  white: "#FFFFFF",
  gray: "#a4bccc",
  success: "#4CAF50",
};

const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = 90;
const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { isDark, toggleTheme } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "CARREGANDO...",
    idDr: "---",
    balance: 0,
    networkCount: 0,
    status: "active",
    rankName: "CONSULTOR",
    profileType: "distributor",
    avatarUrl: null,
    points: 0,
    email: "",
    documentId: "",
  });

  const fetchDashboardData = useCallback(async (retryCount = 0) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return;

    // BUSCA O PERFIL
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(); // maybeSingle não quebra se for null

    // SE O PERFIL AINDA NÃO EXISTE (Atraso do banco/webhook)
    if (!profile && retryCount < 3) {
      console.log("Perfil não encontrado, tentando novamente...");
      setTimeout(() => fetchDashboardData(retryCount + 1), 2000);
      return;
    }

    // CONTAGEM DE REDE (Só faz se o profile existir)
    let networkCount = 0;
    if (profile) {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("sponsor_id", user.id);
      networkCount = count || 0;
    }

    // ATUALIZA O ESTADO COM SEGURANÇA (Prevenindo o erro de null)
      setUserData({
      fullName: (
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        "NOVO MEMBRO"
      ).toUpperCase(),
      idDr: profile?.id_dr || "---",
      balance: 0,
      networkCount: networkCount,
      status: profile?.status || "ATIVO",
      rankName: "DISTRIBUIDOR",
      profileType: "distributor",
      avatarUrl: profile?.avatar_url || null,
      // Plano: 10 pts por direto (volume inicial). Pacote Stripe soma depois.
      points: networkCount * 10,
      email: profile?.email || user?.email || "",
      documentId: profile?.document_id || "",
    });

  } catch (e) {
    console.log("Erro ao carregar Dashboard:", e.message);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);


  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ANIMAÇÕES
  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageSize = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [80, 40],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: isDark ? "#061d36" : "#f4f7f8" }]}>
        <ActivityIndicator size="large" color={PALETTE.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#061d36" : "#f4f7f8" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <Animated.View style={[styles.header, { height: headerHeight, backgroundColor: isDark ? PALETTE.dark : PALETTE.white }]}>
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={24} color={PALETTE.gold} />
        </TouchableOpacity>

        <Animated.View style={[styles.avatarWrapper, { width: imageSize, height: imageSize, borderRadius: 40 }]}>
          {userData.avatarUrl ? (
            <Image source={{ uri: userData.avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
               <Text style={styles.avatarLetter}>{userData.fullName.charAt(0)}</Text>
            </View>
          )}
        </Animated.View>
        <Text style={styles.rankTitle}>{userData.rankName}</Text>
        <Text style={[styles.userName, { color: isDark ? "#FFF" : "#333" }]}>{userData.fullName}</Text>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + 20, paddingBottom: 40 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDashboardData(); }} tintColor={PALETTE.gold} />
        }
      >
        <View style={[styles.balanceCard, { backgroundColor: isDark ? PALETTE.dark : "#FFF" }]}>
          <View style={styles.cardHeader}>
             <View>
                <Text style={styles.balanceLabel}>SALDO DISPONÍVEL</Text>
                <Text style={[styles.currency, { color: isDark ? "#FFF" : "#333" }]}>R$ <Text style={styles.amount}>{Number(userData.balance).toFixed(2)}</Text></Text>
             </View>
             <Image source={DiamondLogo} style={styles.logoMini} />
          </View>
          <View style={styles.cardFooter}>
             <Text style={styles.idText}>ID: {userData.idDr}</Text>
             <View style={[styles.badge, { backgroundColor:
  String(userData.status || "").toUpperCase() === "ATIVO" ||
  userData.status === "active"
    ? PALETTE.success
    : "#FF9800" }]}>
                <Text style={styles.badgeText}>ATIVO</Text>
             </View>
          </View>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity onPress={() => navigation.navigate("Network")} style={[styles.gridItem, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFF" }]}>
             <Ionicons name="people" size={24} color={PALETTE.gold} />
             <Text style={[styles.gridValue, { color: isDark ? "#FFF" : "#333" }]}>{userData.networkCount}</Text>
             <Text style={styles.gridLabel}>DIRETOS</Text>
          </TouchableOpacity>
          <View style={[styles.gridItem, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#FFF" }]}>
             <Ionicons name="flash" size={24} color={PALETTE.gold} />
             <Text style={[styles.gridValue, { color: isDark ? "#FFF" : "#333" }]}>{userData.points}</Text>
             <Text style={styles.gridLabel}>PONTOS</Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  header: { position: 'absolute', top: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', zIndex: 1000, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  themeToggle: { position: 'absolute', top: 50, right: 20, padding: 10, zIndex: 1100 },
  avatarWrapper: { backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: PALETTE.gold },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { flex: 1, backgroundColor: PALETTE.primary, width: '100%', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFF', fontWeight: 'bold', fontSize: 24 },
  rankTitle: { color: PALETTE.gold, fontSize: 10, fontWeight: 'bold', marginTop: 10 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  balanceCard: { marginHorizontal: 20, borderRadius: 15, padding: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { color: "#a4bccc", fontSize: 12 },
  currency: { fontSize: 18 },
  amount: { fontSize: 28, fontWeight: 'bold' },
  logoMini: { width: 40, height: 40, resizeMode: 'contain' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  idText: { color: PALETTE.gold, fontWeight: 'bold' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  grid: { flexDirection: 'row', padding: 20, justifyContent: 'space-between' },
  gridItem: { width: '48%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
  gridValue: { fontSize: 20, fontWeight: 'bold', marginVertical: 5 },
  gridLabel: { color: "#a4bccc", fontSize: 10 }
});
