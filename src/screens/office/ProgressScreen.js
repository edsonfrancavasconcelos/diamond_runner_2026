// Autor: Edson Vasconcelos | Diamond Runner 2026
// Arquivo: src/screens/office/ProgressScreen.js

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

import { CountryContext } from '../../i18n/context/CountryContext';
import { useTheme } from '../../i18n/context/ThemeContext';
import * as AllTexts from '../../i18n/hooks/texts';

const { width } = Dimensions.get('window');

const PALETTE = {
  primary: '#2c94bc',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#cd7f32',
  black: '#040d1a', 
  success: '#00f2ff', 
  danger: '#ff4b2b',
};

export default function ProgressScreen() {
  const { country = 'BR' } = useContext(CountryContext) || {};
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [careerData, setCareerData] = useState({
    currentRank: "",
    nextRank: "",
    points: 0,
    goal: 1000,
    percent: 0,
    rankIndex: 0
  });

  useEffect(() => { fetchCareerProgress(); }, [country]);

  const getRankColor = (index) => {
    const colors = [PALETTE.primary, PALETTE.bronze, PALETTE.silver, PALETTE.gold, '#e67e22', PALETTE.success];
    return colors[index] || PALETTE.primary;
  };

  async function fetchCareerProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('package_level, points_total')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const baseRanks = ["EXECUTIVO", "BRONZE", "PRATA", "OURO", "RUBI", "DIAMANTE"];
        const goals = [0, 5000, 15000, 50000, 100000, 160000];
        const rankName = (profile.package_level || "EXECUTIVO").toUpperCase();
        const currentIndex = baseRanks.indexOf(rankName) === -1 ? 0 : baseRanks.indexOf(rankName);
        const points = profile.points_total || 0;
        const nextGoal = goals[currentIndex + 1] || goals[currentIndex];
        const percent = nextGoal === 0 ? 100 : Math.min((points / nextGoal) * 100, 100);
        
        setCareerData({
          currentRank: rankName,
          nextRank: baseRanks[currentIndex + 1] || "MAX LEVEL",
          points: points,
          goal: nextGoal,
          percent: percent.toFixed(0),
          rankIndex: currentIndex
        });
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }

  if (loading) return (
    <View style={[styles.container, styles.center, { backgroundColor: PALETTE.black }]}>
      <ActivityIndicator color={PALETTE.success} size="large" />
    </View>
  );

  const rankColor = getRankColor(careerData.rankIndex);

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.black }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTag}>SISTEMA DE PROGRESSÃO GLOBAL</Text>
          <Text style={[styles.mainTitle, { color: '#FFF' }]}>DIAMOND<Text style={{color: rankColor}}>NAV</Text></Text>
        </View>

        <View style={styles.hero}>
          <View style={[styles.outerGlow, { shadowColor: rankColor }]}>
            <View style={[styles.badgeContainer, { borderColor: rankColor }]}>
              <View style={[styles.scanLine, { backgroundColor: rankColor }]} />
              <Ionicons name="aperture-outline" size={70} color={rankColor} />
              <View style={[styles.rankLevelBox, { backgroundColor: rankColor }]}>
                <Text style={styles.rankLevelText}>RANK {careerData.rankIndex + 1}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.currentRankName}>{careerData.currentRank}</Text>
          <Text style={[styles.statusTag, { color: rankColor }]}>PATENTE ATUAL ATIVA</Text>
        </View>

        <View style={[styles.telemetryCard, { backgroundColor: 'rgba(44, 148, 188, 0.05)', borderColor: rankColor }]}>
          <View style={styles.telemetryHeader}>
            <View>
              <Text style={styles.teleLabel}>OBJETIVO SEGUINTE</Text>
              <Text style={styles.teleGoal}>{careerData.nextRank}</Text>
            </View>
            <View style={styles.percentCircle}>
              <Text style={[styles.percentValue, { color: rankColor }]}>{careerData.percent}%</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${careerData.percent}%`, backgroundColor: rankColor }]} />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ATUAL</Text>
              <Text style={styles.statValue}>{careerData.points.toLocaleString()}<Text style={styles.unit}> PV</Text></Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TARGET</Text>
              <Text style={styles.statValue}>{careerData.goal.toLocaleString()}<Text style={styles.unit}> PV</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>PROTOCOLOS DE QUALIFICAÇÃO</Text>
          <View style={styles.task}>
            <View style={[styles.taskIcon, { backgroundColor: 'rgba(0, 242, 255, 0.1)' }]}>
              <Ionicons name="key" size={16} color={PALETTE.success} />
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskLabel}>CHAVE DE ATIVAÇÃO</Text>
              <Text style={[styles.taskValue, { color: PALETTE.success }]}>VERIFICADO (50 PTS)</Text>
            </View>
          </View>
          <View style={styles.task}>
            <View style={[styles.taskIcon, { backgroundColor: careerData.percent >= 100 ? 'rgba(0, 242, 255, 0.1)' : 'rgba(255,255,255,0.05)' }]}>
              <Ionicons name={careerData.percent >= 100 ? "rocket" : "lock-closed"} size={16} color={careerData.percent >= 100 ? PALETTE.success : '#444'} />
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskLabel}>VOLUME DE IMPACTO</Text>
              <Text style={[styles.taskValue, { color: careerData.percent >= 100 ? PALETTE.success : '#666' }]}>
                {careerData.percent >= 100 ? "PROTOCOLO COMPLETO" : `PENDENTE: ${(careerData.goal - careerData.points).toLocaleString()} PV`}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footerNote}>Sincronizado com o satélite Diamond Runner 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 50 },
  header: { paddingHorizontal: 30, marginTop: 50 },
  headerTag: { fontSize: 8, color: PALETTE.primary, fontWeight: '900', letterSpacing: 2 },
  mainTitle: { fontSize: 28, fontWeight: '900', letterSpacing: 5 },
  hero: { alignItems: 'center', marginVertical: 35 },
  outerGlow: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 25, elevation: 20 },
  badgeContainer: { width: 160, height: 160, borderRadius: 80, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', overflow: 'hidden' },
  scanLine: { position: 'absolute', width: '100%', height: 1.5, opacity: 0.4, top: '50%' },
  rankLevelBox: { position: 'absolute', bottom: 10, paddingHorizontal: 12, paddingVertical: 2, borderRadius: 2 },
  rankLevelText: { color: '#000', fontSize: 10, fontWeight: '900' },
  currentRankName: { 
    color: '#FFF', 
    fontSize: 38, 
    fontWeight: '900', 
    marginTop: 15, 
    letterSpacing: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    shadowRadius: 15
  },
  statusTag: { 
    fontSize: 10, 
    fontWeight: '800', 
    letterSpacing: 4, 
    marginTop: 8,
    textTransform: 'uppercase'
  },
  telemetryCard: { 
    marginHorizontal: 20, 
    padding: 25, 
    borderWidth: 1, 
    borderRadius: 2, 
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  telemetryHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  teleLabel: { 
    color: 'rgba(255,255,255,0.4)', 
    fontSize: 9, 
    letterSpacing: 2, 
    fontWeight: '900' 
  },
  teleGoal: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: '800'
  },
  percentCircle: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.05)', 
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  percentValue: { 
    fontSize: 16, 
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  progressTrack: { 
    height: 6, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    marginBottom: 30,
    overflow: 'hidden'
  },
  progressFill: { 
    height: '100%', 
  },
  statsGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 4
  },
  statItem: { flex: 1 },
  statLabel: { 
    color: 'rgba(255,255,255,0.3)', 
    fontSize: 10, 
    fontWeight: '900', 
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  statValue: { 
    color: '#FFF', 
    fontSize: 20, 
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  unit: { 
    fontSize: 12, 
    color: 'rgba(255,255,255,0.2)',
  },
  statDivider: { 
    width: 1, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    marginHorizontal: 15 
  },
  missionCard: { 
    paddingHorizontal: 25,
    paddingTop: 40 
  },
  missionTitle: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '900', 
    letterSpacing: 3, 
    marginBottom: 30,
    borderLeftWidth: 3,
    borderLeftColor: PALETTE.success,
    paddingLeft: 10
  },
  task: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 25,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  taskIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15,
  },
  taskContent: { 
    flex: 1 
  },
  taskLabel: { 
    color: 'rgba(255,255,255,0.4)', 
    fontSize: 10, 
    letterSpacing: 1,
    fontWeight: '700'
  },
  taskValue: { 
    fontSize: 13, 
    fontWeight: '800', 
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  footerNote: { 
    textAlign: 'center', 
    color: 'rgba(255,255,255,0.1)', 
    fontSize: 9, 
    letterSpacing: 2, 
    marginTop: 30, 
    marginBottom: 50,
    textTransform: 'uppercase'
  }
});
