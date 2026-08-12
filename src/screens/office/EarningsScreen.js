import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';

import { CountryContext } from '../../i18n/context/CountryContext';
import { useTheme } from '../../i18n/context/ThemeContext';
import * as AllTexts from '../../i18n/hooks/texts';
import { supabase } from '../../services/supabase';

const { width } = Dimensions.get('window');

const PALETTE = {
  primary: '#2c94bc',
  success: '#00C851',
  danger: '#ff4444',
  gold: '#FFD700',
  dark: '#0c3c74',
  black: '#081c34',
  grayBlue: '#647c9c',
  softGray: '#a4bccc',
};

export default function EarningsScreen() {
  const { country = 'BR' } = useContext(CountryContext) || {};
  const { theme, isDark } = useTheme();
  const texts = AllTexts.earningsTexts?.[country] || AllTexts.earningsTexts?.BR;

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [financeData, setFinanceData] = useState({
    balance: 0,
    directBonus: 0,
    teamBonus: 0,
    idDr: '---',
  });

  useEffect(() => {
    fetchFinance();
  }, []);

  async function fetchFinance() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance, id_dr, direct_bonus, team_bonus')
        .eq('id', user.id)
        .single();

      const { data: transactions } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (profile) {
        setFinanceData({
          balance: profile.balance || 0,
          directBonus: profile.direct_bonus || 0,
          teamBonus: profile.team_bonus || 0,
          idDr: profile.id_dr || '---',
        });
      }
      setHistory(transactions || []);
    } catch (error) {
      console.error("Erro financeiro:", error);
    } finally {
      setLoading(false);
    }
  }

  const renderTransaction = (item) => (
    <View key={item.id} style={[styles.transactionItem, { backgroundColor: theme.card }]}>
      <View style={[styles.transIconBox, { backgroundColor: item.amount > 0 ? 'rgba(0, 200, 81, 0.1)' : 'rgba(255, 68, 68, 0.1)' }]}>
        <Ionicons 
          name={item.amount > 0 ? "trending-up" : "trending-down"} 
          size={18} 
          color={item.amount > 0 ? PALETTE.success : PALETTE.danger} 
        />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={[styles.transTitle, { color: theme.text }]}>{item.description || 'Bônus de Rede'}</Text>
        <Text style={[styles.transDate, { color: PALETTE.grayBlue }]}>
          {new Date(item.created_at).toLocaleDateString(texts.locale)} • {new Date(item.created_at).toLocaleTimeString(texts.locale, { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.transAmount, { color: item.amount > 0 ? PALETTE.success : PALETTE.danger }]}>
          {item.amount > 0 ? '+' : ''} {texts.currency} {(item.amount || 0).toLocaleString(texts.locale, { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER MINIMALISTA */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: PALETTE.grayBlue }]}>MEUS GANHOS</Text>
            <Text style={[styles.title, { color: theme.text }]}>DIAMOND WALLET</Text>
          </View>
          <TouchableOpacity onPress={fetchFinance} style={[styles.refreshBtn, { backgroundColor: theme.card }]}>
            <Ionicons name="refresh" size={20} color={PALETTE.primary} />
          </TouchableOpacity>
        </View>

        {/* CARTÃO DE SALDO PREMIUM */}
        <View style={[styles.mainBalanceCard, { backgroundColor: isDark ? PALETTE.black : PALETTE.primary }]}>
          <View style={styles.cardHeader}>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>ID: {financeData.idDr}</Text>
            </View>
            <Ionicons name="shield-checkmark" size={20} color={PALETTE.gold} />
          </View>

          <Text style={styles.cardLabel}>{texts.available.toUpperCase()}</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.mainBalanceValue}>
              {texts.currency} {(financeData.balance || 0).toLocaleString(texts.locale, { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.footerText}> CICLO 2026</Text>
            </View>
            <Text style={styles.systemTag}>SISTEMA GLOBAL</Text>
          </View>
        </View>

        {/* GRID DE RESUMO */}
        <View style={styles.bonusGrid}>
          <View style={[styles.miniBonusCard, { backgroundColor: theme.card }]}>
            <View style={styles.miniIconBox}>
              <Ionicons name="people" size={16} color={PALETTE.primary} />
            </View>
            <Text style={styles.miniLabel}>{texts.directs.toUpperCase()}</Text>
            <Text style={[styles.miniValue, { color: theme.text }]}>
              {texts.currency} {financeData.directBonus.toLocaleString(texts.locale, { minimumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View style={[styles.miniBonusCard, { backgroundColor: theme.card }]}>
            <View style={[styles.miniIconBox, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
              <Ionicons name="trophy" size={16} color={PALETTE.gold} />
            </View>
            <Text style={styles.miniLabel}>{texts.leadershipBonus.toUpperCase()}</Text>
            <Text style={[styles.miniValue, { color: theme.text }]}>
              {texts.currency} {financeData.teamBonus.toLocaleString(texts.locale, { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* HISTÓRICO */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {texts.history.toUpperCase()}
          </Text>
          
          {loading ? (
            <ActivityIndicator color={PALETTE.primary} style={{ marginTop: 40 }} />
          ) : history.length > 0 ? (
            history.map(renderTransaction)
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={50} color={isDark ? '#1a3a5a' : '#eee'} />
              <Text style={{ color: PALETTE.grayBlue, marginTop: 10 }}>Nenhuma transação encontrada</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 25 },
  welcomeText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  title: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  refreshBtn: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  
  mainBalanceCard: { padding: 25, borderRadius: 30, marginBottom: 25, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  idBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  idBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  mainBalanceValue: { fontSize: 34, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold' },
  systemTag: { color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 'bold' },

  bonusGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  miniBonusCard: { width: '48%', padding: 18, borderRadius: 22, borderBottomWidth: 3, borderBottomColor: 'rgba(0,0,0,0.05)' },
  miniIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(44,148,188,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  miniLabel: { fontSize: 9, color: PALETTE.grayBlue, fontWeight: 'bold', marginBottom: 4 },
  miniValue: { fontSize: 16, fontWeight: '900' },

  historySection: { marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '900', marginBottom: 20, letterSpacing: 1.5, opacity: 0.8 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12 },
  transIconBox: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  transTitle: { fontSize: 14, fontWeight: 'bold' },
  transDate: { fontSize: 10, marginTop: 4 },
  transAmount: { fontSize: 15, fontWeight: '900' },
  emptyBox: { padding: 60, alignItems: 'center', justifyContent: 'center' }
});
