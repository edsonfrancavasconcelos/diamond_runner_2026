import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import * as ImagePicker from "expo-image-picker"; 
import { decode } from "base64-arraybuffer"; 

const PALETTE = {
  primary: "#2c94bc",
  gold: "#FFD700",
  darkBlue: "#0c3c74",
  bgDark: "#061d36",
  bgLight: "#f4f7f8",
  white: "#FFFFFF",
  lightGray: "#a4bccc",
  textDark: "#333333",
};

// FUNÇÃO DE FORMATAÇÃO DO WHATSAPP
const formatWhatsApp = (phone) => {
  if (!phone) return "Não informado";
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const theme = {
    bg: isDarkMode ? PALETTE.bgDark : PALETTE.bgLight,
    card: isDarkMode ? PALETTE.darkBlue : PALETTE.white,
    text: isDarkMode ? PALETTE.white : PALETTE.textDark,
    subtext: isDarkMode ? PALETTE.lightGray : "#666",
  };

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*, email, whatsapp, sponsor_id, payment_status, profile_active") 
          .eq("id", user.id)
          .single();
        if (data) {
          // buscar código legível do patrocinador (id_dr) se existir
          if (data.sponsor_id) {
            const { data: sponsorData } = await supabase
              .from('profiles')
              .select('id_dr')
              .eq('id', data.sponsor_id)
              .single();
            if (sponsorData && sponsorData.id_dr) {
              data.sponsorCode = sponsorData.id_dr;
            }
          }
          setUserData(data);
        }
      }
    } catch (error) {
      console.log("Erro ao carregar perfil:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const editField = (field, label) => {
    Alert.prompt(
      `Alterar ${label}`,
      `Digite o novo ${label}:`,
      async (text) => {
        if (!text) return;
        setLoading(true);
        const valueToSave = field === "whatsapp" ? text.replace(/\D/g, "") : text;
        const { error } = await supabase.from("profiles").update({ [field]: valueToSave }).eq("id", userData.id);
        if (error) Alert.alert("Erro", "Falha ao atualizar.");
        else fetchProfile();
        setLoading(false);
      },
      "plain-text",
      String(userData[field] || "")
    );
  };

  const handleEditProfile = () => {
    Alert.alert("Editar Perfil", "O que deseja alterar?", [
      { text: "Nome", onPress: () => editField("full_name", "Nome Completo") },
      { text: "WhatsApp", onPress: () => editField("whatsapp", "WhatsApp") },
      { text: "Cancelar", style: "cancel" }
    ]);
  };

  const handleAvatarPress = () => {
    Alert.alert("Foto de Perfil", "Escolha uma opção:", [
      { text: "Escolher da Galeria", onPress: pickImage },
      { text: "Remover Foto", onPress: removeImage, style: "destructive" },
      { text: "Cancelar", style: "cancel" }
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Erro", "Sem permissão.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (asset) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const fileName = `avatar_${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, decode(asset.base64), {
        contentType: 'image/png',
        upsert: true,
      });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      fetchProfile();
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setUploading(false);
    }
  };
  
  const removeImage = async () => {
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userData.id);
    fetchProfile();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  useEffect(() => { fetchProfile(); }, []);

  const handlePasswordReset = () => {
    Alert.alert("Segurança", "Enviar e-mail para redefinir senha?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Enviar", onPress: () => Alert.alert("Sucesso", "E-mail enviado!") }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={PALETTE.gold} />
      </View>
    );
  }

  const isPaid = userData?.status === 'active';

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.bg }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PALETTE.gold} />}
    >
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.themeIconButton} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={26} color={PALETTE.gold} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAvatarPress} style={[styles.avatarCircle, { borderColor: PALETTE.gold }]}>
          {uploading ? (
            <ActivityIndicator color={PALETTE.gold} />
          ) : userData?.avatar_url ? (
            <Image source={{ uri: userData.avatar_url }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={50} color={PALETTE.gold} />
          )}
        </TouchableOpacity>

        <Text style={[styles.userName, { color: theme.text }]}>{userData?.full_name?.toUpperCase()}</Text>
        <Text style={styles.userID}>ID: {userData?.id_dr}</Text>
        
        <View style={[styles.statusBadge, { backgroundColor: isPaid ? '#2ecc71' : '#e74c3c' }]}>
          <Ionicons name={isPaid ? "checkmark-circle" : "time"} size={14} color="white" style={{marginRight: 5}} />
          <Text style={styles.statusText}>{isPaid ? "ASSINATURA ATIVA" : "AGUARDANDO PAGAMENTO"}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: theme.subtext, marginBottom: 0 }]}>DADOS DA CONTA</Text>
          <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
            <Ionicons name={showSettings ? "close-circle-outline" : "settings-outline"} size={22} color={showSettings ? PALETTE.gold : theme.subtext} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={24} color={PALETTE.primary} />
          <View style={styles.infoTextGroup}>
            <Text style={[styles.label, { color: theme.subtext }]}>E-MAIL</Text>
            <Text style={[styles.value, { color: theme.text }]}>{userData?.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <View style={styles.infoTextGroup}>
            <Text style={[styles.label, { color: theme.subtext }]}>WHATSAPP</Text>
            <Text style={[styles.value, { color: theme.text }]}>{formatWhatsApp(userData?.whatsapp)}</Text>
          </View>
          <TouchableOpacity onPress={() => editField("whatsapp", "WhatsApp")} style={{ marginLeft: 'auto', padding: 10 }}>
             <Ionicons name="create-outline" size={22} color={PALETTE.gold} />
          </TouchableOpacity>
        </View>
        {/* PATROCINADOR */}
        {userData?.sponsor_id ? (
          <View style={styles.infoRow}>
            <Ionicons name="person" size={24} color={PALETTE.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>PATROCINADOR</Text>
              <Text style={[styles.value, { color: theme.text }]}>{userData.sponsorCode || userData.sponsor_id}</Text>
            </View>
          </View>
        ) : null}

     {/* CPF CADASTRADO (SOMENTE LEITURA POR SEGURANÇA) */}
<View style={styles.infoRow}>
  <Ionicons name="finger-print-outline" size={24} color={PALETTE.primary} />
  <View style={styles.infoTextGroup}>
    <Text style={[styles.label, { color: theme.subtext }]}>CPF CADASTRADO</Text>
    <Text style={[styles.value, { color: theme.text, opacity: 0.8 }]}>
      {userData?.document_id || "---"}
    </Text>
  </View>
  {/* Removido o TouchableOpacity de editar aqui para travar a alteração */}
  <View style={{ marginLeft: 'auto', padding: 10 }}>
     <Ionicons name="lock-closed-outline" size={18} color={theme.subtext} />
  </View>
</View>


        {showSettings && (
          <View style={{ marginTop: 10, padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
            <TouchableOpacity style={styles.passwordRow} onPress={handlePasswordReset}>
              <Ionicons name="lock-closed-outline" size={20} color={PALETTE.gold} />
              <Text style={[styles.actionLabel, { color: theme.text, marginLeft: 10 }]}>Trocar minha senha</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.passwordRow, { marginTop: 15 }]} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={20} color={PALETTE.primary} />
              <Text style={[styles.actionLabel, { color: theme.text, marginLeft: 10 }]}>Editar nome do perfil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: { padding: 30, alignItems: "center" },
  themeIconButton: { position: 'absolute', top: 15, right: 20, padding: 10 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, justifyContent: "center", alignItems: "center", marginBottom: 15, overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%" },
  userName: { fontSize: 18, fontWeight: "bold" },
  userID: { color: PALETTE.gold, fontSize: 14, fontWeight: "bold", marginTop: 5 },
  statusBadge: { marginTop: 12, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  statusText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  infoSection: { padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 20, letterSpacing: 1 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  infoTextGroup: { marginLeft: 15 },
  label: { fontSize: 11 },
  value: { fontSize: 16, fontWeight: "bold" },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  actionLabel: { fontSize: 14, fontWeight: 'bold' }
});
