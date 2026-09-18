import React from "react";
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity } from "react-native";

const LOGO = require("../../assets/images/logo_vasconcelos.jpeg");

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={styles.brand}>EFVasconcelos Sistemas</Text>
      <Text style={styles.app}>Diamond Runner 2026</Text>
      <Text style={styles.desc}>
        Plataforma de produtos digitais, área de membros e gestão de rede.
        Desenvolvimento e operação: EFVasconcelos Sistemas.
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL("mailto:comercial@diamondrunner.com.br")}>
        <Text style={styles.link}>comercial@diamondrunner.com.br</Text>
      </TouchableOpacity>
      <Text style={styles.ver}>Versão 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061d36",
    alignItems: "center",
    padding: 28,
  },
  logo: { width: 160, height: 160, marginTop: 20, marginBottom: 20 },
  brand: { color: "#FFD700", fontWeight: "900", fontSize: 16, letterSpacing: 1 },
  app: { color: "#fff", marginTop: 6, fontWeight: "bold" },
  desc: {
    color: "#a4bccc",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 20,
    fontSize: 13,
  },
  link: { color: "#2c94bc", marginTop: 20, fontWeight: "bold" },
  ver: { color: "#647c9c", marginTop: 30, fontSize: 12 },
});