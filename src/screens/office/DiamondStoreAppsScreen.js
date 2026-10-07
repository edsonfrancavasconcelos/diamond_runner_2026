import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    InteractionManager,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { useTexts } from "../../i18n/hooks/useTexts";
import { supabase } from "../../services/supabase";

const PALETTE = {
  dark: "#0c3c74",
  gold: "#FFD700",
  gray: "#a4bccc",
  white: "#FFFFFF",
  primary: "#2c94bc",
};

const DIAMOND_APPS = [
  {
    id: "1",
    slug: "fitmommy",
    name: "FitMater",
    icon: "fitness",
    image: require("../../assets/images/FitMommy.png"),
  },
  {
    id: "2",
    slug: "artverse",
    name: "ARTVERSE",
    icon: "color-palette",
    image: require("../../assets/images/ArtVerse.jpeg"),
  },
  {
    id: "3",
    slug: "bodyslim",
    name: "BODY SLIM",
    icon: "body",
    image: require("../../assets/images/BodySlim.jpeg"),
  },
  {
    id: "4",
    slug: "diacare",
    name: "GlicoDay",
    icon: "heart",
    image: require("../../assets/images/DiaCare.jpeg"),
  },
  {
    id: "5",
    slug: "distrave",
    name: "DISTRAVE",
    icon: "bar-chart",
    image: require("../../assets/images/Distrave.jpeg"),
  },
  {
    id: "6",
    slug: "exonia",
    name: "EXONIA",
    icon: "bag",
    image: require("../../assets/images/Exonia.jpeg"),
  },
  {
    id: "7",
    slug: "flulingo",
    name: "FLULINGO",
    icon: "language",
    image: require("../../assets/images/FluLingo.jpeg"),
  },
  {
    id: "8",
    slug: "fluxo-financeiro",
    name: "FLUXO FINANCEIRO",
    icon: "cash",
    image: require("../../assets/images/FluxoFinaceiro.jpeg"),
  },
  {
    id: "9",
    slug: "glowup",
    name: "UpGlow",
    icon: "sparkles",
    image: require("../../assets/images/GlowUP.jpeg"),
  },
  {
    id: "10",
    slug: "neurovita",
    name: "NeuroTime",
    icon: "bulb",
    image: require("../../assets/images/NeuroVita.jpeg"),
  },
  {
    id: "11",
    slug: "neverend",
    name: "NEVEREND",
    icon: "infinite",
    image: require("../../assets/images/NeverEnd.jpeg"),
  },
  {
    id: "12",
    slug: "nightwave",
    name: "NightWell",
    icon: "moon",
    image: require("../../assets/images/NigthWave.jpeg"),
  },
  {
    id: "13",
    slug: "tdah-focus",
    name: "TDAH FOCUS",
    icon: "bulb-outline",
    image: require("../../assets/images/TdahFocus.jpeg"),
  },
  {
    id: "14",
    slug: "vital-a",
    name: "VitallCor",
    icon: "pulse",
    image: require("../../assets/images/Vital-A.jpeg"),
  },
];

export default function DiamondStoreApps() {
  const { theme, isDark } = useTheme();
  const texts = useTexts("diamondStore");
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    status: "pending",
    vouchers: 0,
    type: "",
  });
  const [enabledApps, setEnabledApps] = useState([]);

  const fetchUserData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("status, voucher_balance, plan_name")
        .eq("id", authUser.id)
        .single();

      const metadataCredit = Number(
        authUser.user_metadata?.voucher_credit || 0,
      );
      const profileCredit = Number(profile?.voucher_balance || 0);

      setUser({
        status: profile?.status
          ? profile.status.toString().toLowerCase().trim()
          : "pending",
        vouchers: metadataCredit > 0 ? metadataCredit : profileCredit,
        type: profile?.plan_name?.toUpperCase() || "",
      });
      setEnabledApps(authUser.user_metadata?.enabled_apps || []);
    } catch (e) {
      console.log("Erro Store:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(fetchUserData);
    return () => task.cancel();
  }, []);

  const totalValue = useMemo(
    () => Number(user.vouchers).toFixed(2),
    [user.vouchers],
  );

  const handleDownload = (app) => {
    if (!["active", "ativo"].includes(user.status)) {
      return Alert.alert(
        texts.pendingAccount,
        texts.payPlanToUnlock,
        [
          {
            text: texts.seePlans,
            onPress: () => navigation.navigate("Packages"),
          },
          { text: texts.close, style: "cancel" },
        ],
      );
    }
    navigation.navigate("Dashboard");
  };

  if (loading && !user.type)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={PALETTE.gold} size="large" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>{texts.ecosystem}</Text>
          <Text style={styles.title}>{texts.title}</Text>
          <Text style={styles.subtitle}>{texts.description}</Text>
        </View>
        <Ionicons name="apps" size={42} color={PALETTE.gold} />
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.headerLabel}>{texts.availableCredit}</Text>
          <Text style={styles.headerValue}>
            R$ {totalValue.replace(".", ",")}
          </Text>
          <Text style={styles.planLabel}>
            {user.type || texts.defaultPlan} · {texts.integratedAccess}
          </Text>
        </View>
        <View style={styles.walletIcon}>
          <Ionicons name="wallet-outline" size={26} color={PALETTE.gold} />
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{texts.availableModules}</Text>
        <Text style={styles.sectionMeta}>{DIAMOND_APPS.length} {texts.options}</Text>
      </View>

      <FlatList
        data={DIAMOND_APPS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isEnabled =
            ["active", "ativo"].includes(user.status) ||
            enabledApps.includes(item.slug);
          return (
            <TouchableOpacity
              style={[styles.appCard, isEnabled && styles.appCardEnabled]}
              onPress={() =>
                isEnabled
                  ? navigation.navigate("Dashboard")
                  : handleDownload(item)
              }
              activeOpacity={0.86}
            >
              <View style={styles.appTopline}>
                <View style={styles.iconCircle}>
                  <Image source={item.image} style={styles.appLogo} />
                </View>
                <View style={styles.appToplineRight}>
                  <Image
                    source={require("../../assets/images/logodiamond.png")}
                    style={styles.diamondLogo}
                    resizeMode="contain"
                  />
                  {isEnabled && (
                    <Ionicons name="checkmark-circle" size={20} color="#57d69a" />
                  )}
                </View>
              </View>
              <Text style={styles.appName}>{item.name}</Text>
              <Text style={styles.appDescription}>{texts.integratedModule}</Text>
              <View style={styles.appFooter}>
                <Text style={styles.appPrice}>
                  {isEnabled ? texts.available : texts.planRequired}
                </Text>
                <Text
                  style={[styles.btnText, isEnabled && styles.btnTextEnabled]}
                >
                  {isEnabled ? texts.use : texts.seePlans}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 16 },
  center: {
    flex: 1,
    backgroundColor: theme.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    backgroundColor: theme.card,
    marginBottom: 12,
  },
  heroCopy: { flex: 1, paddingRight: 16 },
  eyebrow: {
    color: PALETTE.gold,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: { color: theme.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: theme.text, fontSize: 11, lineHeight: 17, marginTop: 8 },
  balanceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 24,
  },
  headerLabel: { color: theme.text, fontSize: 10, fontWeight: "bold" },
  headerValue: {
    color: PALETTE.gold,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },
  planLabel: { color: theme.text, fontSize: 10, marginTop: 4 },
  walletIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.input,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionTitle: { color: theme.text, fontSize: 16, fontWeight: "800" },
  sectionMeta: { color: theme.text, fontSize: 10 },
  row: { justifyContent: "space-between" },
  appCard: {
    width: "48%",
    minHeight: 166,
    backgroundColor: theme.card,
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  appCardEnabled: {
    borderColor: "rgba(87,214,154,0.45)",
    backgroundColor: "rgba(87,214,154,0.08)",
  },
  appTopline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appToplineRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  diamondLogo: { width: 24, height: 24 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.card,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
  },
  appLogo: { width: "100%", height: "100%", resizeMode: "cover" },
  appName: { color: theme.text, fontWeight: "800", fontSize: 11, minHeight: 28 },
  appDescription: { color: theme.text, fontSize: 9, marginTop: 3 },
  appFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 12,
  },
  appPrice: { color: PALETTE.gold, fontSize: 10, fontWeight: "800" },
  btnText: {
    color: "#FFF",
    backgroundColor: PALETTE.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    fontSize: 9,
    fontWeight: "800",
  },
  btnTextEnabled: { backgroundColor: "rgba(87,214,154,0.2)", color: "#57d69a" },
});
