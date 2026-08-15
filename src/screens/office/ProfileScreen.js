import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Alert, ScrollView, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { supabase } from "../../services/supabase";

const PALETTE = {
  primary: "#2c94bc", gold: "#FFD700", darkBlue: "#0c3c74",
  bgDark: "#061d36", lightGray: "#a4bccc",
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, id_dr, document_id, status, is_active, sponsor_id, avatar_url")
        .eq("id", user.id)
        .single();
      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }
      if (data && !data.email) data.email = user.email;
      setUserData(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleAvatarPress = () => {
    Alert.alert("Foto", "Escolha:", [
      { text: "Galeria", onPress: pickImage },
      { text: "Remover", style: "destructive", onPress: removeImage },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permissão", "Libere a galeria");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64) await uploadAvatar(result.assets[0]);
  };

  const uploadAvatar = async (asset) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const filePath = `${user.id}/avatar_${Date.now()}.png`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(asset.base64), { contentType: "image/png", upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: updErr } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      if (updErr) throw updErr;
      await fetchProfile();
      Alert.alert("Ok", "Foto atualizada");
    } catch (e) {
      Alert.alert("Erro", e.message || "Falha upload");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (!userData?.id) return;
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userData.id);
    await fetchProfile();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PALETTE.gold} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Perfil não carregou</Text>
        <TouchableOpacity style={styles.btn} onPress={() => { setLoading(true); fetchProfile(); }}>
          <Text style={styles.btnText}>TENTAR DE NOVO</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPaid =
    String(userData.status || "").toUpperCase() === "ATIVO" || userData.is_active === true;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor={PALETTE.gold} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPress} style={styles.avatar} activeOpacity={0.7}>
          {uploading ? (
            <ActivityIndicator color={PALETTE.gold} />
          ) : userData.avatar_url ? (
            <Image source={{ uri: userData.avatar_url }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="camera" size={40} color={PALETTE.gold} />
          )}
        </TouchableOpacity>
        <Text style={styles.hint}>TOQUE PARA ALTERAR A FOTO</Text>
        <Text style={styles.name}>{(userData.full_name || "").toUpperCase()}</Text>
        <Text style={styles.id}>ID: {userData.id_dr}</Text>
        <View style={[styles.badge, { backgroundColor: isPaid ? "#2ecc71" : "#e74c3c" }]}>
          <Text style={styles.badgeText}>{isPaid ? "ASSINATURA ATIVA" : "AGUARDANDO"}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>E-MAIL</Text>
        <Text style={styles.value}>{userData.email || "---"}</Text>
        <Text style={styles.label}>CPF</Text>
        <Text style={styles.value}>{userData.document_id || "---"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bgDark },
  center: { flex: 1, backgroundColor: PALETTE.bgDark, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", padding: 28 },
  avatar: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: PALETTE.gold,
    backgroundColor: PALETTE.darkBlue, justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  hint: { color: PALETTE.gold, marginTop: 12, fontSize: 11, fontWeight: "bold" },
  name: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 14 },
  id: { color: PALETTE.gold, marginTop: 6, fontWeight: "bold" },
  badge: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  body: { padding: 24 },
  label: { color: PALETTE.lightGray, fontSize: 11, marginTop: 16 },
  value: { color: "#fff", fontSize: 16, fontWeight: "bold", marginTop: 4 },
  btn: { marginTop: 12, backgroundColor: PALETTE.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "bold" },
});