import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { useTexts } from "../../i18n/hooks/useTexts";

const COLORS = {
  bg: "#0c3c74",
  gold: "#FFD700",
  white: "#FFFFFF",
  muted: "#d7e3eb",
};

export default function TermsScreen() {
  const { theme } = useTheme();
  const texts = useTexts("terms");
  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{texts.title}</Text>
      <Text style={styles.paragraph}>
        {texts.companyOperation}
      </Text>
      <Text style={styles.heading}>{texts.accountHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.registration}
      </Text>
      <Text style={styles.paragraph}>
        {texts.accountSecurity}
      </Text>
      <Text style={styles.heading}>{texts.platformHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.platformServices}
      </Text>
      <Text style={styles.paragraph}>
        {texts.earningsRules}
      </Text>
      <Text style={styles.paragraph}>
        {texts.noIncomePromise}
      </Text>
      <Text style={styles.paragraph}>
        {texts.recruitment}
      </Text>
      <Text style={styles.heading}>{texts.securityHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.companyChanges}
      </Text>
      <Text style={styles.paragraph}>
        {texts.jurisdiction}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {texts.footer}
        </Text>
      </View>
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginTop: 24,
    paddingTop: 18,
  },
  footerText: {
    color: theme.text,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: "italic",
  },
});
