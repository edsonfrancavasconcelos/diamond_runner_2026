import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";

export default function SettingsScreen() {
  const resetPassword = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      Alert.alert("Erro", "E-mail não encontrado.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) Alert.alert("Erro", error.message);
    else Alert.alert("E-mail enviado", "Verifique sua caixa de entrada para redefinir a senha.");
  };

  const openSupport = () => {
    Linking.openURL("https://wa.me/5583986104110?text=Suporte%20Diamond%20Runner");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CONFIGURAÇÕES</Text>

      <TouchableOpacity style={styles.row} onPress={resetPassword}>
        <Ionicons name="key-outline" size={22} color="#FFD700" />
        <Text style={styles.rowText}>Trocar senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={openSupport}>
        <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
        <Text style={styles.rowText}>Suporte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#061d36", padding: 24 },
  title: { color: "#FFD700", fontWeight: "900", marginBottom: 24, letterSpacing: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rowText: { color: "#fff", marginLeft: 14, fontWeight: "bold" },
});