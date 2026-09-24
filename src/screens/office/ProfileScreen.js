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
  InteractionManager,
  Modal,
  TextInput,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

import { supabase } from "../../services/supabase";

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
  const [editingField, setEditingField] = useState(null);

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
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          data.whatsapp = data.whatsapp || user.user_metadata?.whatsapp || user.phone || "";
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

  const saveField = async (field, text) => {
    if (!text?.trim()) return;
    setLoading(true);
    try {
      const valueToSave = field === "whatsapp" ? text.replace(/\D/g, "") : text.trim();
      if (!valueToSave) return;
      const result = field === "whatsapp"
        ? await supabase.auth.updateUser({ data: { whatsapp: valueToSave } })
        : await supabase.from("profiles").update({ [field]: valueToSave }).eq("id", userData.id);
      if (result.error) throw result.error;
      await fetchProfile();
    } catch (error) {
      Alert.alert("Erro", error.message || "Falha ao atualizar.");
    } finally {
      setLoading(false);
    }
  };

  const editField = (field, label) => {
    const currentValue = String(userData[field] || "");
    if (Platform.OS !== "ios") {
      setEditingField({ field, label, value: currentValue });
      return;
    }
    Alert.prompt(
      `Alterar ${label}`,
      `Digite o novo ${label}:`,
      (text) => saveField(field, text),
      "plain-text",
      currentValue
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
      if (!user) throw new Error("Sessão expirada. Entre novamente.");
      const fileName = `avatar_${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;
      const fileData = asset.base64
        ? decode(asset.base64)
        : await fetch(asset.uri).then((response) => response.arrayBuffer());
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, fileData, {
        contentType: 'image/png',
        upsert: true,
      });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: profileError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      if (profileError) throw profileError;
      await fetchProfile();
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setUploading(false);
    }
  };
  
  const removeImage = async () => {
    try {
      setUploading(true);
      const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userData.id);
      if (error) throw error;
      await fetchProfile();
    } catch (error) {
      Alert.alert("Erro", error.message || "Não foi possível remover a foto.");
    } finally {
      setUploading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(fetchProfile);
    return () => task.cancel();
  }, []);

  const handlePasswordReset = () => {
    Alert.alert("Segurança", "Enviar e-mail para redefinir senha?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Enviar", onPress: sendPasswordReset }
    ]);
  };

  const sendPasswordReset = async () => {
    if (!userData?.email) {
      Alert.alert("Erro", "Não foi possível identificar o e-mail da conta.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(userData.email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
    });
    if (error) {
      Alert.alert("Erro", error.message || "Não foi possível enviar o e-mail.");
      return;
    }
    Alert.alert("Sucesso", "E-mail para redefinir a senha enviado.");
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={PALETTE.gold} />
      </View>
    );
  }

  const isPaid = ['active', 'ativo'].includes(userData?.status?.toLowerCase());

  return (
    <>
      <Modal visible={Boolean(editingField)} transparent animationType="fade" onRequestClose={() => setEditingField(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.editModal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Alterar {editingField?.label}</Text>
            <TextInput
              autoFocus
              value={editingField?.value || ""}
              onChangeText={(value) => setEditingField((current) => ({ ...current, value }))}
              keyboardType={editingField?.field === "whatsapp" ? "phone-pad" : "default"}
              style={[styles.editInput, { color: theme.text, borderColor: PALETTE.primary }]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditingField(null)}>
                <Text style={[styles.modalAction, { color: theme.subtext }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const { field, value } = editingField;
                  setEditingField(null);
                  saveField(field, value);
                }}
              >
                <Text style={[styles.modalAction, { color: PALETTE.gold }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.bg }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PALETTE.gold} />}
      >
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.themeIconButton} onPress={() => setIsDarkMode(!isDarkMode)}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={26} color={PALETTE.gold} />
        </TouchableOpacity>

      <View style={styles.avatarContainer}>

  <TouchableOpacity
    onPress={handleAvatarPress}
    style={[
      styles.avatarCircle,
      { borderColor: PALETTE.gold }
    ]}
  >
    {uploading ? (
      <ActivityIndicator color={PALETTE.gold} />
    ) : userData?.avatar_url ? (
      <Image
        source={{ uri: userData.avatar_url }}
        style={styles.avatarImg}
      />
    ) : (
      <Ionicons
        name="person"
        size={50}
        color={PALETTE.gold}
      />
    )}
  </TouchableOpacity>


  <TouchableOpacity
    onPress={handleAvatarPress}
    style={styles.cameraButton}
  >
    <Ionicons
      name="camera"
      size={18}
      color="#FFF"
    />
  </TouchableOpacity>

</View>


<Text style={[styles.userName, { color: theme.text }]}>
  {userData?.full_name?.toUpperCase()}
</Text>

<Text style={styles.userID}>
  ID: {userData?.id_dr || "AGUARDANDO"}
</Text>


<View
  style={[
    styles.statusBadge,
    { backgroundColor: isPaid ? "#2ecc71" : "#e74c3c" }
  ]}
>
  <Ionicons
    name={isPaid ? "checkmark-circle" : "time"}
    size={14}
    color="white"
    style={{ marginRight: 5 }}
  />

  <Text style={styles.statusText}>
    {isPaid ? "ASSINATURA ATIVA" : "AGUARDANDO PAGAMENTO"}
  </Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
  position: "relative",
  marginBottom: 15,
},

cameraButton: {
  position: "absolute",
  right: 0,
  bottom: 5,
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: PALETTE.primary,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#FFF",
},
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
  actionLabel: { fontSize: 14, fontWeight: 'bold' },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.65)' },
  editModal: { padding: 22, borderRadius: 12 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 16 },
  editInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 24, marginTop: 20 },
  modalAction: { fontSize: 14, fontWeight: 'bold' }
});
