import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    InteractionManager,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { CountryContext } from "../../i18n/context/CountryContext";
import { commonTexts, profileTexts } from "../../i18n/hooks/texts";
import { supabase } from "../../services/supabase";
import { isValidBrazilianPhone } from "../../utils/inputValidation";

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
const formatWhatsApp = (phone, notProvided) => {
  if (!phone) return notProvided;
  const cleaned = ("" + phone).replace(/\D/g, "");
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return "(" + match[1] + ") " + match[2] + "-" + match[3];
  }
  return phone;
};

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const { country } = useContext(CountryContext) || {};
  const texts = profileTexts[country] || profileTexts.BR;
  const common = commonTexts[country] || commonTexts.BR;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const theme = {
    bg: isDark ? PALETTE.bgDark : PALETTE.bgLight,
    card: isDark ? PALETTE.darkBlue : PALETTE.white,
    text: isDark ? PALETTE.white : PALETTE.textDark,
    subtext: isDark ? PALETTE.lightGray : "#666",
  };

  async function fetchProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          data.whatsapp =
            data.whatsapp || user.user_metadata?.whatsapp || user.phone || "";
          // buscar código legível do patrocinador (id_dr) se existir
          if (data.sponsor_id) {
            const { data: sponsorData } = await supabase
              .from("profiles")
              .select("id_dr")
              .eq("id", data.sponsor_id)
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
    if (field === "whatsapp" && !isValidBrazilianPhone(text)) {
      Alert.alert(
        texts.invalidWhatsappTitle,
        texts.invalidWhatsappMessage,
      );
      return;
    }

    const valueToSave =
      field === "whatsapp" ? text.replace(/\D/g, "") : text.trim();
    if (!valueToSave) return;

    setLoading(true);
    try {
      const result =
        field === "whatsapp"
          ? await supabase.auth.updateUser({ data: { whatsapp: valueToSave } })
          : await supabase
              .from("profiles")
              .update({ [field]: valueToSave })
              .eq("id", userData.id);
      if (result.error) throw result.error;
      await fetchProfile();
    } catch {
      Alert.alert(common.error, texts.updateError);
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
      texts.changeFieldTitle.replace("{label}", label),
      texts.enterFieldPrompt.replace("{label}", label),
      (text) => saveField(field, text),
      "plain-text",
      currentValue,
    );
  };

  const handleEditProfile = () => {
    Alert.alert(texts.editTitle, texts.editPrompt, [
      { text: texts.name, onPress: () => editField("full_name", texts.fullName) },
      { text: texts.whatsapp, onPress: () => editField("whatsapp", texts.whatsapp) },
      { text: texts.cancel, style: "cancel" },
    ]);
  };

  const handleAvatarPress = () => {
    Alert.alert(texts.photoTitle, texts.photoPrompt, [
      { text: texts.chooseFromGallery, onPress: pickImage },
      { text: texts.removePhoto, onPress: removeImage, style: "destructive" },
      { text: texts.cancel, style: "cancel" },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert(common.error, texts.permissionDenied);
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(texts.sessionExpired);
      const fileName = `avatar_${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;
      const fileData = asset.base64
        ? decode(asset.base64)
        : await fetch(asset.uri).then((response) => response.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileData, {
          contentType: "image/png",
          upsert: true,
        });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (profileError) throw profileError;
      await fetchProfile();
    } catch (error) {
      Alert.alert(
        common.error,
        error.message === texts.sessionExpired
          ? texts.sessionExpired
          : texts.uploadError,
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    try {
      setUploading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userData.id);
      if (error) throw error;
      await fetchProfile();
    } catch {
      Alert.alert(common.error, texts.removePhotoError);
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
    Alert.alert(texts.securityTitle, texts.passwordResetPrompt, [
      { text: texts.cancel, style: "cancel" },
      { text: texts.send, onPress: sendPasswordReset },
    ]);
  };

  const sendPasswordReset = async () => {
    if (!userData?.email) {
      Alert.alert(common.error, texts.accountEmailMissing);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(
      userData.email,
      {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/`
            : undefined,
      },
    );
    if (error) {
      Alert.alert(common.error, texts.passwordEmailError);
      return;
    }
    Alert.alert(common.success, texts.passwordEmailSent);
  };

  if (loading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={PALETTE.gold} />
      </View>
    );
  }

  const isPaid = ["active", "ativo"].includes(userData?.status?.toLowerCase());

  return (
    <>
      <Modal
        visible={Boolean(editingField)}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingField(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.editModal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {texts.changeFieldTitle.replace("{label}", editingField?.label || "")}
            </Text>
            <TextInput
              autoFocus
              value={editingField?.value || ""}
              onChangeText={(value) =>
                setEditingField((current) => ({ ...current, value }))
              }
              keyboardType={
                editingField?.field === "whatsapp" ? "phone-pad" : "default"
              }
              style={[
                styles.editInput,
                { color: theme.text, borderColor: PALETTE.primary },
              ]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditingField(null)}>
                <Text style={[styles.modalAction, { color: theme.subtext }]}>
                  {texts.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const { field, value } = editingField;
                  setEditingField(null);
                  saveField(field, value);
                }}
              >
                <Text style={[styles.modalAction, { color: PALETTE.gold }]}>
                  {texts.save}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.bg }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PALETTE.gold}
          />
        }
      >
        <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            style={[styles.avatarCircle, { borderColor: PALETTE.gold }]}
            accessibilityRole="button"
            accessibilityLabel={texts.editProfilePhoto}
          >
            {uploading ? (
              <ActivityIndicator color={PALETTE.gold} />
            ) : userData?.avatar_url ? (
              <Image
                source={{ uri: userData.avatar_url }}
                style={styles.avatarImg}
              />
            ) : (
              <Ionicons name="person" size={50} color={PALETTE.gold} />
            )}
          </TouchableOpacity>

          <Text style={[styles.userName, { color: theme.text }]}>
            {userData?.full_name?.toUpperCase()}
          </Text>
          <Text style={styles.userID}>ID: {userData?.id_dr}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isPaid ? "#2ecc71" : "#e74c3c" },
            ]}
          >
            <Ionicons
              name={isPaid ? "checkmark-circle" : "time"}
              size={14}
              color="white"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.statusText}>
              {isPaid ? texts.activeSubscription : texts.awaitingPayment}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.subtext, marginBottom: 0 },
              ]}
            >
              {texts.accountData}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSettings(!showSettings)}
              accessibilityRole="button"
              accessibilityLabel={
                showSettings
                  ? texts.closeProfileSettings
                  : texts.openProfileSettings
              }
            >
              <Ionicons
                name={
                  showSettings ? "close-circle-outline" : "settings-outline"
                }
                size={22}
                color={showSettings ? PALETTE.gold : theme.subtext}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={24} color={PALETTE.primary} />
            <View style={styles.infoTextGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>
                {texts.emailLabel}
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {userData?.email}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <View style={styles.infoTextGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>
                {texts.whatsappLabel}
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {formatWhatsApp(userData?.whatsapp, texts.notProvided)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => editField("whatsapp", texts.whatsapp)}
              accessibilityRole="button"
              accessibilityLabel={texts.editFieldTitle.replace(
                "{label}",
                texts.whatsapp,
              )}
              style={{ marginLeft: "auto", padding: 10 }}
            >
              <Ionicons name="create-outline" size={22} color={PALETTE.gold} />
            </TouchableOpacity>
          </View>
          {/* PATROCINADOR */}
          {userData?.sponsor_id ? (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={24} color={PALETTE.primary} />
              <View style={styles.infoTextGroup}>
                <Text style={[styles.label, { color: theme.subtext }]}>
                  {texts.sponsor}
                </Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {userData.sponsorCode || userData.sponsor_id}
                </Text>
              </View>
            </View>
          ) : null}

          {/* CPF CADASTRADO (SOMENTE LEITURA POR SEGURANÇA) */}
          <View style={styles.infoRow}>
            <Ionicons
              name="finger-print-outline"
              size={24}
              color={PALETTE.primary}
            />
            <View style={styles.infoTextGroup}>
              <Text style={[styles.label, { color: theme.subtext }]}>
                {texts.registeredCpf}
              </Text>
              <Text style={[styles.value, { color: theme.text, opacity: 0.8 }]}>
                {userData?.document_id || "---"}
              </Text>
            </View>
            {/* Removido o TouchableOpacity de editar aqui para travar a alteração */}
            <View style={{ marginLeft: "auto", padding: 10 }}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={theme.subtext}
              />
            </View>
          </View>

          {showSettings && (
            <View
              style={{
                marginTop: 10,
                padding: 15,
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 12,
              }}
            >
              <TouchableOpacity
                style={styles.passwordRow}
                onPress={handlePasswordReset}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={PALETTE.gold}
                />
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.text, marginLeft: 10 },
                  ]}
                >
                  {texts.changePassword}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.passwordRow, { marginTop: 15 }]}
                onPress={handleEditProfile}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={PALETTE.primary}
                />
                <Text
                  style={[
                    styles.actionLabel,
                    { color: theme.text, marginLeft: 10 },
                  ]}
                >
                  {texts.editProfileName}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: { padding: 30, alignItems: "center" },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  userName: { fontSize: 18, fontWeight: "bold" },
  userID: {
    color: PALETTE.gold,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: { color: "white", fontSize: 11, fontWeight: "bold" },
  infoSection: { padding: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 1,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  infoTextGroup: { marginLeft: 15 },
  label: { fontSize: 11 },
  value: { fontSize: 16, fontWeight: "bold" },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  actionLabel: { fontSize: 14, fontWeight: "bold" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  editModal: { padding: 22, borderRadius: 12 },
  modalTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 16 },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
    marginTop: 20,
  },
  modalAction: { fontSize: 14, fontWeight: "bold" },
});
