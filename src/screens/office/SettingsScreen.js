import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { useTexts } from "../../i18n/hooks/useTexts";
import { supabase } from "../../services/supabase";

const COLORS = {
  bg: "#0c3c74",
  primary: "#2c94bc",
  gold: "#FFD700",
  white: "#FFFFFF",
  muted: "#a4bccc",
  danger: "#d64545",
};

export default function SettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const texts = useTexts("settings");
  const styles = createStyles(theme);
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = () => {
    Alert.alert(
      texts.deleteTitle,
      texts.deleteMessage,
      [
        { text: texts.cancel, style: "cancel" },
        {
          text: texts.continue,
          style: "destructive",
          onPress: () =>
            Alert.alert(
              texts.confirmDeleteTitle,
              texts.confirmDeleteMessage,
              [
                { text: texts.cancel, style: "cancel" },
                {
                  text: texts.deleteAccount,
                  style: "destructive",
                  onPress: completeDeletion,
                },
              ],
            ),
        },
      ],
    );
  };

  const completeDeletion = async () => {
    setDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ status: "EXCLUIDO", is_active: false })
          .eq("id", user.id);
      }
      await supabase.auth.signOut();
      Alert.alert(
        texts.requestRecorded,
        texts.requestSuccess,
      );
    } catch (_error) {
      await supabase.auth.signOut();
      Alert.alert(
        texts.requestRecorded,
        texts.requestFailure,
      );
    } finally {
      setDeleting(false);
    }
  };

  const navigateTo = (route) => navigation.navigate(route);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{texts.title}</Text>
      <Text style={styles.subtitle}>
        {texts.subtitle}
      </Text>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo("Terms")}>
        <Ionicons name="document-text-outline" size={22} color={COLORS.gold} />
        <Text style={styles.itemText}>{texts.terms}</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.border} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigateTo("Privacy")}
      >
        <Ionicons
          name="shield-checkmark-outline"
          size={22}
          color={COLORS.gold}
        />
        <Text style={styles.itemText}>{texts.privacy}</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.border} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigateTo("About")}>
        <Ionicons
          name="information-circle-outline"
          size={22}
          color={COLORS.gold}
        />
        <Text style={styles.itemText}>{texts.about}</Text>
        <Ionicons name="chevron-forward" size={20} color={theme.border} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.item, styles.deleteItem]}
        onPress={deleteAccount}
        disabled={deleting}
      >
        <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
        <Text style={[styles.itemText, { color: COLORS.danger }]}>
          {deleting ? texts.deleting : texts.deleteAccount}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg, padding: 22 },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },
  item: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  itemText: {
    flex: 1,
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  deleteItem: {
    marginTop: 34,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
});
