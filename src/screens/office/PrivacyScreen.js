import { ScrollView, StyleSheet, Text } from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { useTexts } from "../../i18n/hooks/useTexts";

const COLORS = {
  bg: "#0c3c74",
  gold: "#FFD700",
  white: "#FFFFFF",
  muted: "#d7e3eb",
};

export default function PrivacyScreen() {
  const { theme } = useTheme();
  const texts = useTexts("privacy");
  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{texts.title}</Text>
      <Text style={styles.heading}>{texts.controllerHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.controller}
      </Text>
      <Text style={styles.heading}>{texts.legalBasesHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.legalBases}
      </Text>
      <Text style={styles.heading}>{texts.dataHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.data}
      </Text>
      <Text style={styles.heading}>{texts.purposesHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.purposes}
      </Text>
      <Text style={styles.heading}>{texts.paymentSharingHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.paymentSharing}
      </Text>
      <Text style={styles.heading}>{texts.rightsHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.rights}
      </Text>
      <Text style={styles.paragraph}>
        {texts.accountDeletion}
      </Text>
      <Text style={styles.heading}>{texts.securityHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.security}
      </Text>
      <Text style={styles.heading}>{texts.contactHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.contact}
      </Text>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: 22, paddingBottom: 42 },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 24,
  },
  heading: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 8,
  },
  paragraph: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
});
