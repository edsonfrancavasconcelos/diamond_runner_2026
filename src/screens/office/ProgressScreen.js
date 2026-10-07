import { useContext, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Diamante from "../../assets/images/diamante.png";
import Esmeralda from "../../assets/images/esmeralda.png";
import Obsidiana from "../../assets/images/obsidiana.png";
import Rubi from "../../assets/images/rubi.png";
import Safira from "../../assets/images/safira.png";
import Topazio from "../../assets/images/topazio.png";
import { CountryContext } from "../../i18n/context/CountryContext";
import { useTheme } from "../../i18n/context/ThemeContext";
import { progressTexts } from "../../i18n/hooks/texts";
import { supabase } from "../../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  light: "#bcdcf4",
  dark: "#0c3c74",
  grayBlue: "#647c9c",
  softGray: "#a4bccc",
  gold:"#FFD700",

  black:"#06111f",
  white:"#ffffff",
  success:"#2c94bc",
};

const RANKS = [
  {
    name:"OBSIDIANA",
    min:0,
    max:4999,
    goal:5000,
    image:Obsidiana
  },
  {
    name:"TOPAZIO",
    min:5000,
    max:14999,
    goal:15000,
    image:Topazio
  },
  {
    name:"SAFIRA",
    min:15000,
    max:49999,
    goal:50000,
    image:Safira
  },
  {
    name:"RUBI",
    min:50000,
    max:99999,
    goal:100000,
    image:Rubi
  },
  {
    name:"ESMERALDA",
    min:100000,
    max:159999,
    goal:160000,
    image:Esmeralda
  },
  {
    name:"DIAMANTE",
    min:160000,
    max:null,
    goal:200000,
    image:Diamante
  }
];

export default function ProgressScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const { country = "BR" } = useContext(CountryContext) || {};
  const texts = progressTexts[country] || progressTexts.BR;
  const stoneScale = useRef(new Animated.Value(1)).current;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(stoneScale, {
          toValue: 1.08,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(stoneScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [stoneScale]);

  const [careerData, setCareerData] = useState({
    currentRank: "",
    nextRank: "",
    points: 0,
    goal: 1000,
    percent: 0,
    rankIndex: 0,
  });

  useEffect(() => {
    fetchCareerProgress();
  }, [country]);

  const getRankColor = (index) => {
    const colors = [
      PALETTE.grayBlue, // OBSIDIANA
      PALETTE.primary, // TOPAZIO
      PALETTE.primary, // SAFIRA
      PALETTE.primary, // RUBI
      PALETTE.light, // ESMERALDA
      PALETTE.light, // DIAMANTE
    ];

    return colors[index] || PALETTE.primary;
  };

  async function fetchCareerProgress() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("level, points_total, plan_name")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.log("Profile error:", error);
        return;
      }

    if (profile) {

  const points = Number(profile.points_total || 0);


  const index = RANKS.findIndex(rank =>
    points >= rank.min &&
    (rank.max === null || points <= rank.max)
  );


  const currentRank = RANKS[index];


  const nextRank = RANKS[index + 1]?.name || texts.maxRank;


  const percent =
    currentRank.goal === 0
      ? 100
      :
      Math.min(
        (
          (points - currentRank.min) /
          (currentRank.goal - currentRank.min)
        ) * 100,
        100
      );


  setCareerData({

    currentRank: currentRank.name,

    nextRank,

    points,

    goal: currentRank.goal,

    percent: Math.round(percent),

    rankIndex:index,

  });

}
    } catch (error) {
      console.log("Progress error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          {
            backgroundColor: theme.bg,
          },
        ]}
      >
        <View style={[styles.loadingCard, { backgroundColor: theme.card }]}>
          <Image
            source={require("../../assets/images/logodiamond.png")}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color={PALETTE.success} />
        </View>
      </View>
    );
  }

  const rankColor = getRankColor(careerData.rankIndex);
  const rankImages = [Obsidiana, Topazio, Safira, Rubi, Esmeralda, Diamante];

  const currentMedal = rankImages[careerData.rankIndex];
  const currentRankLabel =
    texts.ranks[careerData.rankIndex] || careerData.currentRank;
  const nextRankLabel =
    texts.ranks[careerData.rankIndex + 1] || texts.maxRank;

  return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTag}>{texts.systemTitle}</Text>

          <Text style={styles.mainTitle}>
            DIAMOND
            <Text style={{ color: rankColor }}>NAV</Text>
          </Text>
        </View>

        <View style={styles.hero}>
          <View
            style={[
              styles.outerGlow,
              {
                shadowColor: PALETTE.gold,
              },
            ]}
          >
            <View
              style={[
                styles.badgeContainer,
                {
                  borderColor: PALETTE.gold,
                },
              ]}
            >
              <View
               
              />

              <Animated.Image
                source={currentMedal}
                style={[
                  {
                    width: 170,
                    height: 170,
                    resizeMode: "contain",
                  },
                  { transform: [{ scale: stoneScale }] },
                ]}
              />
            </View>
          </View>

          <Text style={styles.currentRankName}>{currentRankLabel}</Text>

          <Text
            style={[
              styles.statusTag,
              {
                color: rankColor,
              },
            ]}
          >
            {texts.currentPlanActive}
          </Text>
        </View>

        <View
          style={[
            styles.telemetryCard,
            {
              borderColor: rankColor,
            },
          ]}
        >
          <View style={styles.telemetryHeader}>
            <View>
              <Text style={styles.teleLabel}>{texts.nextGoal}</Text>

              <Text style={styles.teleGoal}>{nextRankLabel}</Text>
            </View>

            <View style={styles.percentCircle}>
              <Text
                style={[
                  styles.percentValue,
                  {
                    color: rankColor,
                  },
                ]}
              >
                {careerData.percent}%
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
      <View
style={[
styles.progressFill,
{
width:`${careerData.percent}%`,
backgroundColor:PALETTE.gold
}
]}
/>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{texts.current}</Text>

              <Text style={styles.statValue}>
                {Number(careerData.points || 0).toLocaleString(texts.locale)}

                <Text style={styles.unit}>PV</Text>
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>{texts.target}</Text>

              <Text style={styles.statValue}>
                {Number(careerData.goal || 0).toLocaleString(texts.locale)}

                <Text style={styles.unit}>PV</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>{texts.qualificationProtocols}</Text>

          <View style={styles.task}>
            <View
              style={[
                styles.taskIcon,
                {
                  backgroundColor: "rgba(0,242,255,0.1)",
                },
              ]}
            >
              <Ionicons name="key" size={16} color={PALETTE.success} />
            </View>

            <View style={styles.taskContent}>
              <Text style={styles.taskLabel}>{texts.activationKey}</Text>

              <Text
                style={[
                  styles.taskValue,
                  {
                    color: PALETTE.success,
                  },
                ]}
              >
                {texts.verifiedPoints}
              </Text>
            </View>
          </View>

          <View style={styles.task}>
            <View
              style={[
                styles.taskIcon,
                {
                  backgroundColor:
                    careerData.percent >= 100
                      ? "rgba(0,242,255,0.1)"
                      : theme.input,
                },
              ]}
            >
              <Ionicons
                name={careerData.percent >= 100 ? "rocket" : "lock-closed"}

                size={16}

                color={careerData.percent >= 100 ? PALETTE.success : theme.border}
              />
            </View>

            <View style={styles.taskContent}>
              <Text style={styles.taskLabel}>{texts.impactVolume}</Text>

              <Text
                style={[
                  styles.taskValue,
                  {
                    color: careerData.percent >= 100 ? PALETTE.success : theme.text,
                  },
                ]}
              >
                {careerData.percent >= 100
                  ? texts.protocolComplete
                  : texts.pendingPoints.replace(
                      "{points}",
                      (careerData.goal - careerData.points).toLocaleString(
                        texts.locale,
                      ),
                    )}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerNote}>
          {texts.syncedWith}
        </Text>
      </ScrollView>
    </View>
  );
}
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  loadingCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    borderRadius: 16,
  },
  loadingLogo: { width: 48, height: 48 },

  scroll: {
    paddingBottom: 60,
  },

  header: {
    paddingHorizontal: 30,
    marginTop: 50,
  },

  headerTag: {
    fontSize: 9,
    color: PALETTE.primary,
    fontWeight: "900",
    letterSpacing: 3,
  },

  mainTitle: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 5,
    color: theme.text,
  },

  hero: {
    alignItems: "center",
    marginVertical: 35,
  },

  outerGlow: {
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },

  badgeContainer: {
    width: 170,
    height: 170,
    borderWidth: 2,
    borderRadius: 85,
    justifyContent: "center",
    alignItems: "center",
  },

  rankLevelBox: {
    position: "absolute",
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 3,
  },

  rankLevelText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
  },

  currentRankName: {
    color: theme.text,
    fontSize: 38,
    fontWeight: "900",
    marginTop: 15,
    letterSpacing: 6,
    textAlign: "center",
    textShadowColor: theme.border,
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 15,
  },

  statusTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 4,
    marginTop: 8,
    textTransform: "uppercase",
  },

  telemetryCard: {
    marginHorizontal: 20,

    padding: 25,

    borderWidth: 1,

    borderRadius: 4,

    borderLeftWidth: 4,

    backgroundColor: theme.card,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.5,

    shadowRadius: 10,
  },

  telemetryHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 25,
  },

  teleLabel: {
    color: theme.text,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },

  teleGoal: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "800",
  },

  percentCircle: {
    width: 60,

    height: 60,

    borderRadius: 30,

    borderWidth: 2,

    borderColor: theme.border,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: theme.card,
  },

  percentValue: {
    fontSize: 16,

    fontWeight: "900",

    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  progressTrack: {
    height: 6,

    backgroundColor: theme.input,

    overflow: "hidden",

    marginBottom: 30,
  },

  progressFill: {
    height: "100%",
  },

  statsGrid: {
    flexDirection: "row",

    justifyContent: "space-between",

    backgroundColor: theme.card,

    padding: 15,

    borderRadius: 4,
  },

  statItem: {
    flex: 1,
  },

  statLabel: {
    color: theme.text,

    fontSize: 10,

    fontWeight: "900",

    marginBottom: 8,
  },

  statValue: {
    color: theme.text,

    fontSize: 20,

    fontWeight: "700",

    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  unit: {
    fontSize: 12,

    color: theme.border,
  },

  statDivider: {
    width: 1,

    backgroundColor: theme.border,

    marginHorizontal: 15,
  },

  missionCard: {
    paddingHorizontal: 25,

    paddingTop: 40,
  },

  missionTitle: {
    color: theme.text,

    fontSize: 12,

    fontWeight: "900",

    letterSpacing: 3,

    marginBottom: 30,

    borderLeftWidth: 3,

    borderLeftColor: PALETTE.success,

    paddingLeft: 10,
  },

  task: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 25,

    backgroundColor: theme.card,

    padding: 12,

    borderRadius: 8,

    borderWidth: 1,

    borderColor: theme.border,
  },

  taskIcon: {
    width: 40,

    height: 40,

    borderRadius: 20,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 15,
  },

  taskContent: {
    flex: 1,
  },

  taskLabel: {
    color: theme.text,

    fontSize: 10,

    fontWeight: "700",

    letterSpacing: 1,
  },

  taskValue: {
    fontSize: 13,

    fontWeight: "800",

    marginTop: 4,

    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  footerNote: {
    textAlign: "center",

    color: theme.text,

    fontSize: 9,

    letterSpacing: 2,

    marginTop: 30,

    marginBottom: 50,

    textTransform: "uppercase",
  },
});
