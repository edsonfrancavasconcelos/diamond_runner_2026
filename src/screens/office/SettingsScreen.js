import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";

const COLORS = { bg: "#0c3c74", primary: "#2c94bc", gold: "#FFD700", white: "#FFFFFF", muted: "#a4bccc", danger: "#d64545" };

export default function SettingsScreen({ navigation }) {
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "A exclusão é permanente. Sua conta, pendente ou ativa, será encerrada e o ID DR deixará de valer no app.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => Alert.alert(
            "Confirmar exclusão",
            "Deseja realmente excluir sua conta? Essa ação não pode ser desfeita.",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Excluir conta", style: "destructive", onPress: completeDeletion },
            ]
          ),
        },
      ]
    );
  };

  const completeDeletion = async () => {
    setDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ status: "EXCLUIDO", is_active: false }).eq("id", user.id);
      }
      await supabase.auth.signOut();
      Alert.alert("Solicitação registrada", "Sua sessão foi encerrada. Para concluir qualquer etapa adicional, entre em contato com o suporte Diamond Runner no app.");
    } catch (_error) {
      await supabase.auth.signOut();
      Alert.alert("Solicitação registrada", "Sua sessão foi encerrada. Entre em contato com o suporte Diamond Runner no app.");
    } finally {
      setDeleting(false);
    }
  };

  const navigateTo = (route) => navigation.navigate(route);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONFIGURAÇÕES</Text>
      <Text style={styles.subtitle}>Gerencie informações e documentos do Diamond Runner.</Text>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo("Terms")}>
        <Ionicons name="document-text-outline" size={22} color={COLORS.gold} />
        <Text style={styles.itemText}>TERMOS DE USO</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo("Privacy")}>
        <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.gold} />
        <Text style={styles.itemText}>PRIVACIDADE</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo("About")}>
        <Ionicons name="information-circle-outline" size={22} color={COLORS.gold} />
        <Text style={styles.itemText}>SOBRE / EMPRESA</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.item, styles.deleteItem]} onPress={deleteAccount} disabled={deleting}>
        <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
        <Text style={[styles.itemText, { color: COLORS.danger }]}>{deleting ? "ENCERRANDO..." : "EXCLUIR CONTA"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 22 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  subtitle: { color: COLORS.muted, fontSize: 14, lineHeight: 21, marginBottom: 22 },
  item: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)", flexDirection: "row", alignItems: "center", gap: 14 },
  itemText: { flex: 1, color: COLORS.white, fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  deleteItem: { marginTop: 34, borderWidth: 1, borderColor: COLORS.danger, borderRadius: 8, paddingHorizontal: 14, borderBottomWidth: 1 },
});
