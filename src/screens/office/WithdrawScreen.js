// Arquivo: src/screens/office/WithdrawScreen.js
// Status: 100% FUNCIONAL | Integrado com Supabase & Histórico

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { supabase } from "../../services/supabase";

const { width } = Dimensions.get("window");

const PALETTE = {
  primary: "#2c94bc", // Azul Diamond
  dark: "#0c3c74",
  graphite: "#0c467b",
  white: "#FFFFFF",
  gold: "#FFD700", // Dourado para destaque
  danger: "#FF4444",
};

export default function WithdrawScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("Usuário não encontrado");
        return;
      }

      // BUSCA SALDO
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("voucher_balance")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.log("Erro saldo:", profileError.message);
        return;
      }

      setBalance(Number(profile?.voucher_balance || 0));

      // BUSCA SAQUES
      const { data: withdraws, error: withdrawError } = await supabase
        .from("withdraw_requests")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (withdrawError) {
        console.log("Erro histórico:", withdrawError.message);
        return;
      }

      setHistory(withdraws || []);
    } catch (error) {
      console.log("Erro geral:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleWithdraw = async () => {
    const value = parseFloat(amount.replace(",", "."));

    if (!value || value <= 0) return Alert.alert("Erro", "Valor inválido.");
    if (value > balance)
      return Alert.alert(
        "Saldo Insuficiente",
        "Resgate maior que o saldo disponível.",
      );
    if (pixKey.length < 5)
      return Alert.alert("Erro", "Informe uma chave PIX válida.");

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Inserção na tabela que criamos via SQL
      const { error } = await supabase.from("withdraw_requests").insert({
        profile_id: user.id,
        amount: value,
        pix_key: pixKey,
        status: "pending",
      });

      if (error) throw error;

      Alert.alert("Sucesso", "Solicitação enviada para análise.");
      setAmount("");
      setPixKey("");
      fetchData(); // Recarrega saldo e histórico
    } catch (e) {
      Alert.alert("Erro", "Falha ao processar resgate.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOLICITAR SAQUE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD DE SALDO */}
        <View style={styles.megaBalanceCard}>
          <View>
            <Text style={styles.megaLabel}>SALDO TOTAL DISPONÍVEL</Text>
            <Text style={styles.megaValue}>
              <Text style={styles.currency}>R$ </Text>
              {Number(balance).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.cardBrand}>DIAMOND WALLET</Text>
            <Ionicons name="shield-checkmark" size={20} color={PALETTE.gold} />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>VALOR PARA RETIRADA</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.prefix}>R$</Text>
            <TextInput
              style={styles.mainInput}
              placeholder="0,00"
              placeholderTextColor={theme.border}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 30 }]}>CHAVE PIX</Text>
          <TextInput
            style={styles.secondaryInput}
            placeholder="CPF, E-mail ou Telefone"
            placeholderTextColor={theme.border}
            value={pixKey}
            onChangeText={setPixKey}
          />

          <TouchableOpacity
            style={[styles.actionButton, loading && { opacity: 0.7 }]}
            onPress={handleWithdraw}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <Text style={styles.actionButtonText}>EFETUAR RESGATE</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* LISTAGEM DE HISTÓRICO */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>HISTÓRICO RECENTE</Text>
          {history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View>
                <Text style={styles.historyDate}>
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </Text>
                <Text style={styles.historyAmount}>
                  R$ {Number(item.amount || 0).toFixed(2)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      (item.status || "pending") === "pending"
                        ? "#FF9800"
                        : PALETTE.primary,
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {(item.status || "pending").toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  headerTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  scrollContent: { paddingBottom: 40 },
  megaBalanceCard: {
    width: width - 40,
    height: 180,
    backgroundColor: theme.card,
    alignSelf: "center",
    borderRadius: 30,
    padding: 25,
    justifyContent: "space-between",
    marginTop: 20,
  },
  megaLabel: {
    color: theme.text,
    fontSize: 10,
    fontWeight: "bold",
  },
  megaValue: { color: theme.text, fontSize: 38, fontWeight: "bold" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  cardBrand: { color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 2 },
  form: { paddingHorizontal: 25, marginTop: 30 },
  fieldLabel: {
    color: theme.text,
    fontSize: 10,
    fontWeight: "bold",
    opacity: 0.5,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  prefix: { color: theme.text, fontSize: 20, marginRight: 10 },
  mainInput: {
    flex: 1,
    color: theme.text,
    fontSize: 32,
    fontWeight: "bold",
  },
  secondaryInput: {
    backgroundColor: theme.input,
    height: 55,
    borderRadius: 15,
    paddingHorizontal: 15,
    color: theme.text,
  },
  actionButton: {
    backgroundColor: theme.button,
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  actionButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  historySection: { marginTop: 40, paddingHorizontal: 25 },
  sectionTitle: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
    opacity: 0.5,
  },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.card,
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  historyDate: { color: theme.text, fontSize: 10, opacity: 0.7 },
  historyAmount: { color: theme.text, fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#FFF", fontSize: 8, fontWeight: "bold" },
});
