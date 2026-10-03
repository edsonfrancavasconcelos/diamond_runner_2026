import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useContext } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { CountryContext } from "../../i18n/context/CountryContext";
import { useTheme } from "../../i18n/context/ThemeContext";
import * as AllTexts from "../../i18n/hooks/texts";
import { supabase } from "../../services/supabase";

const PALETTE = {
  primary: "#2c94bc",

  success: "#00C851",

  danger: "#ff4444",

  gold: "#FFD700",

  dark: "#0c3c74",

  black: "#081c34",

  grayBlue: "#647c9c",

  softGray: "#a4bccc",
};

export default function EarningsScreen() {
  const { country = "BR" } = useContext(CountryContext) || {};

  const { theme, isDark } = useTheme();

  const texts = AllTexts.earningsTexts?.[country] ||
    AllTexts.earningsTexts?.BR || {
      locale: "pt-BR",
      currency: "R$",
      available: "Disponível",
      history: "Histórico",
    };

  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState([]);

  const [financeData, setFinanceData] = useState({
    balance: 0,

    points: 0,

    level: 0,

    idDr: "---",
  });

  useEffect(() => {
    fetchFinance();
  }, []);

  async function fetchFinance() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);

        return;
      }

      const { data: profile, error: profileError } = await supabase

        .from("profiles")

        .select(
          `

        id_dr,

        voucher_balance,

        points_total,

        level

      `,
        )

        .eq("id", user.id)

        .single();

      if (profileError) {
        console.log("Erro profile:", profileError.message);
      }

      const { data: transactions, error: earningsError } = await supabase

        .from("earnings")

        .select("*")

        .eq("user_id", user.id)

        .order("created_at", {
          ascending: false,
        })

        .limit(20);

      if (earningsError) {
        console.log("Erro earnings:", earningsError.message);
      }

      if (profile) {
        setFinanceData({
          balance: Number(profile.voucher_balance) || 0,

          points: Number(profile.points_total) || 0,

          level: Number(profile.level) || 0,

          idDr: profile.id_dr || "---",
        });
      }

      setHistory(transactions || []);
    } catch (error) {
      console.log("Erro financeiro:", error);
    } finally {
      setLoading(false);
    }
  }

  function money(value) {
    return Number(value || 0).toLocaleString(texts.locale, {
      minimumFractionDigits: 2,
    });
  }

  function integer(value) {
    return Number(value || 0).toLocaleString(texts.locale);
  }

  const renderTransaction = (item) => {
    const amount = Number(item.amount || 0);

    return (
      <View
        key={item.id}

        style={[
          styles.transactionItem,
          {
            backgroundColor: theme.card,
          },
        ]}
      >
        <View
          style={[
            styles.transIconBox,
            {
              backgroundColor:
                amount >= 0 ? "rgba(0,200,81,0.1)" : "rgba(255,68,68,0.1)",
            },
          ]}
        >
          <Ionicons
            name={amount >= 0 ? "trending-up" : "trending-down"}

            size={18}

            color={amount >= 0 ? PALETTE.success : PALETTE.danger}
          />
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: 15,
          }}
        >
          <Text
            style={[
              styles.transTitle,
              {
                color: theme.text,
              },
            ]}
          >
            {item.description || texts.networkBonus}
          </Text>

          <Text
            style={[
              styles.transDate,
              {
                color: PALETTE.grayBlue,
              },
            ]}
          >
            {item.created_at
              ? new Date(item.created_at).toLocaleDateString(texts.locale)
              : ""}
          </Text>
        </View>

        <Text
          style={[
            styles.transAmount,
            {
              color: amount >= 0 ? PALETTE.success : PALETTE.danger,
            },
          ]}
        >
          {amount >= 0 ? "+" : ""} {texts.currency} {money(amount)}
        </Text>
      </View>
    );
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.bg,
      }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView
        style={styles.container}

        showsVerticalScrollIndicator={false}

        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.welcomeText,
                {
                  color: PALETTE.grayBlue,
                },
              ]}
            >
              {texts.screenTitle}
            </Text>

            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                },
              ]}
            >
              DIAMOND WALLET
            </Text>
          </View>

          <TouchableOpacity
            onPress={fetchFinance}

            style={[
              styles.refreshBtn,
              {
                backgroundColor: theme.card,
              },
            ]}
          >
            <Ionicons
              name="refresh"

              size={20}

              color={PALETTE.primary}
            />
          </TouchableOpacity>
        </View>

        {/* SALDO */}

        <View
          style={[
            styles.mainBalanceCard,
            {
              backgroundColor: isDark ? PALETTE.black : PALETTE.primary,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>ID: {financeData.idDr}</Text>
            </View>

            <Ionicons
              name="shield-checkmark"

              size={20}

              color={PALETTE.gold}
            />
          </View>

          <Text style={styles.cardLabel}>
            {texts.available.toUpperCase()}
          </Text>

          <Text style={styles.mainBalanceValue}>
            {texts.currency} {money(financeData.balance)}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>
              {texts.cycle} 2026
            </Text>

            <Text style={styles.systemTag}>{texts.globalSystem}</Text>
          </View>
        </View>

        {/* RESUMO */}

        <View style={styles.bonusGrid}>
          <View
            style={[
              styles.miniBonusCard,
              {
                backgroundColor: theme.card,
              },
            ]}
          >
            <Ionicons
              name="people"

              size={20}

              color={PALETTE.primary}
            />

            <Text style={styles.miniLabel}>{texts.points}</Text>

            <Text
              style={[
                styles.miniValue,
                {
                  color: theme.text,
                },
              ]}
            >
              {integer(financeData.points)}
            </Text>
          </View>

          <View
            style={[
              styles.miniBonusCard,
              {
                backgroundColor: theme.card,
              },
            ]}
          >
            <Ionicons
              name="trophy"

              size={20}

              color={PALETTE.gold}
            />

            <Text style={styles.miniLabel}>{texts.level}</Text>

            <Text
              style={[
                styles.miniValue,
                {
                  color: theme.text,
                },
              ]}
            >
              {integer(financeData.level)}
            </Text>
          </View>
        </View>

        {/* HISTÓRICO */}

        <View style={styles.historySection}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.text,
              },
            ]}
          >
            {texts.history}
          </Text>

          {loading ? (
            <ActivityIndicator
              color={PALETTE.primary}

              style={{
                marginTop: 40,
              }}
            />
          ) : history.length > 0 ? (
            history.map(renderTransaction)
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons
                name="receipt-outline"

                size={50}

                color={isDark ? "#1a3a5a" : "#ddd"}
              />

              <Text
                style={{
                  color: PALETTE.grayBlue,
                  marginTop: 10,
                }}
              >
                {texts.emptyHistory}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 25,
  },

  welcomeText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
  },

  refreshBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  mainBalanceCard: {
    padding: 25,
    borderRadius: 30,
    marginBottom: 25,
    elevation: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  idBadge: {
    backgroundColor: "rgba(255,255,255,.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },

  idBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  cardLabel: {
    color: "rgba(255,255,255,.7)",
    marginTop: 20,
    fontSize: 11,
  },

  mainBalanceValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 5,
  },

  cardFooter: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerText: {
    color: "#fff",
    opacity: 0.6,
    fontSize: 10,
  },

  systemTag: {
    color: "#fff",
    opacity: 0.4,
    fontSize: 10,
  },

  bonusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  miniBonusCard: {
    width: "48%",
    padding: 18,
    borderRadius: 22,
  },

  miniLabel: {
    color: PALETTE.grayBlue,
    fontSize: 10,
    marginTop: 10,
    fontWeight: "bold",
  },

  miniValue: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
  },

  historySection: {
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 20,
  },

  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },

  transIconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  transTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },

  transDate: {
    fontSize: 10,
    marginTop: 4,
  },

  transAmount: {
    fontSize: 14,
    fontWeight: "900",
  },

  emptyBox: {
    padding: 60,
    alignItems: "center",
  },
});
