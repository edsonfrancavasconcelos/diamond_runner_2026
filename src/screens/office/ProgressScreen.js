import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { useTheme } from "../../i18n/context/ThemeContext";
import { CountryContext } from "../../i18n/context/CountryContext";
import Obsidiana from "../../assets/images/obsidiana.png";
import Topazio from "../../assets/images/topazio.png";
import Safira from "../../assets/images/safira.png";
import Rubi from "../../assets/images/rubi.png";
import Esmeralda from "../../assets/images/esmeralda.png";
import Diamante from "../../assets/images/diamante.png";

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
  const { country = "BR" } = useContext(CountryContext) || {};

  const [loading, setLoading] = useState(true);

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


  const nextRank =
    RANKS[index + 1]?.name || "NÍVEL MÁXIMO";


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
            backgroundColor: PALETTE.black,
          },
        ]}
      >
        <ActivityIndicator size="large" color={PALETTE.success} />
      </View>
    );
  }

  const rankColor = getRankColor(careerData.rankIndex);
  const rankImages = [Obsidiana, Topazio, Safira, Rubi, Esmeralda, Diamante];

  const currentMedal = rankImages[careerData.rankIndex];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PALETTE.dark,
      }}
    >
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTag}>SISTEMA DE PROGRESSÃO GLOBAL</Text>

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
                shadowColor: rankColor,
              },
            ]}
          >
            <View
              style={[
                styles.badgeContainer,
                {
                  borderColor: rankColor,
                },
              ]}
            >
              <View
               
              />

              <Image
                source={currentMedal}
                style={{
                  width: 150,
                  height: 150,
                  resizeMode: "contain",
                }}
              />
            </View>
          </View>

          <Text style={styles.currentRankName}>{careerData.currentRank}</Text>

          <Text
            style={[
              styles.statusTag,
              {
                color: rankColor,
              },
            ]}
          >
        PLANO ATUAL ATIVO
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
              <Text style={styles.teleLabel}>OBJETIVO SEGUINTE</Text>

              <Text style={styles.teleGoal}>{careerData.nextRank}</Text>
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
              <Text style={styles.statLabel}>ATUAL</Text>

              <Text style={styles.statValue}>
                {Number(careerData.points || 0).toLocaleString()}

                <Text style={styles.unit}>PV</Text>
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TARGET</Text>

              <Text style={styles.statValue}>
                {Number(careerData.goal || 0).toLocaleString()}

                <Text style={styles.unit}>PV</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>PROTOCOLOS DE QUALIFICAÇÃO</Text>

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
              <Text style={styles.taskLabel}>CHAVE DE ATIVAÇÃO</Text>

              <Text
                style={[
                  styles.taskValue,
                  {
                    color: PALETTE.success,
                  },
                ]}
              >
                VERIFICADO (50 PTS)
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
                      : "rgba(255,255,255,0.05)",
                },
              ]}
            >
              <Ionicons
                name={careerData.percent >= 100 ? "rocket" : "lock-closed"}

                size={16}

                color={careerData.percent >= 100 ? PALETTE.success : "#444"}
              />
            </View>

            <View style={styles.taskContent}>
              <Text style={styles.taskLabel}>VOLUME DE IMPACTO</Text>

              <Text
                style={[
                  styles.taskValue,
                  {
                    color: careerData.percent >= 100 ? PALETTE.success : "#666",
                  },
                ]}
              >
                {careerData.percent >= 100
                  ? "PROTOCOLO COMPLETO"
                  : `PENDENTE: ${(
                      careerData.goal - careerData.points
                    ).toLocaleString()} PV`}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerNote}>
          Sincronizado com o satélite Diamond Runner 2026
        </Text>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

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
    color: "#FFF",
  },

  hero: {
    alignItems: "center",
    marginVertical: 35,
  },

  outerGlow: {
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },

  badgeContainer: {
    width: 170,
    height: 170,
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
    color: "#FFF",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 15,
    letterSpacing: 6,
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.3)",
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

    backgroundColor: "rgba(44,148,188,0.15)",

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
    color: "rgba(255,255,255,0.75)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },

  teleGoal: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
  },

  percentCircle: {
    width: 60,

    height: 60,

    borderRadius: 30,

    borderWidth: 2,

    borderColor: "rgba(255,255,255,0.1)",

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "rgba(255,255,255,0.02)",
  },

  percentValue: {
    fontSize: 16,

    fontWeight: "900",

    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  progressTrack: {
    height: 6,

    backgroundColor: "rgba(255,255,255,0.05)",

    overflow: "hidden",

    marginBottom: 30,
  },

  progressFill: {
    height: "100%",
  },

  statsGrid: {
    flexDirection: "row",

    justifyContent: "space-between",

    backgroundColor: "rgba(0,0,0,0.3)",

    padding: 15,

    borderRadius: 4,
  },

  statItem: {
    flex: 1,
  },

  statLabel: {
    color: PALETTE.softGray,

    fontSize: 10,

    fontWeight: "900",

    marginBottom: 8,
  },

  statValue: {
    color: "#FFF",

    fontSize: 20,

    fontWeight: "700",

    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },

  unit: {
    fontSize: 12,

    color: "rgba(255,255,255,0.3)",
  },

  statDivider: {
    width: 1,

    backgroundColor: "rgba(255,255,255,0.1)",

    marginHorizontal: 15,
  },

  missionCard: {
    paddingHorizontal: 25,

    paddingTop: 40,
  },

  missionTitle: {
    color: "#FFF",

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

    backgroundColor: "rgba(255,255,255,0.08)",

    padding: 12,

    borderRadius: 8,

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.05)",
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
    color: PALETTE.grayBlue,

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

    color: PALETTE.grayBlue,

    fontSize: 9,

    letterSpacing: 2,

    marginTop: 30,

    marginBottom: 50,

    textTransform: "uppercase",
  },
});
