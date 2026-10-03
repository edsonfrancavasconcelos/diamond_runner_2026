import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../i18n/context/ThemeContext";
import { useTexts } from "../../i18n/hooks/useTexts";

const COLORS = {
  bg: "#0c3c74",
  gold: "#FFD700",
  white: "#FFFFFF",
  muted: "#d7e3eb",
  primary: "#2c94bc",
};

export default function AboutScreen() {
  const { theme } = useTheme();
  const texts = useTexts("about");
  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{texts.title}</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{texts.appSection}</Text>
        <Text style={styles.label}>{texts.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/logodiamond.png")}
            resizeMode="contain"
            style={{ width: 36, height: 34, marginRight: 10 }}
          />
          <Text style={styles.value}>Diamond Runner</Text>
        </View>
        <Text style={styles.label}>{texts.developedBy}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image
            source={require("../../assets/images/logo_vasconcelos.png")}
            resizeMode="contain"
            style={{ width: 36, height: 36, marginRight: 10 }}
          />
          <Text style={styles.value}>EFVasconcelos Sistemas</Text>
        </View>
        <Text style={styles.label}>{texts.version}</Text>
        <Text style={styles.value}>1.0.0</Text>
        <Text style={styles.paragraph}>
          {texts.appDescription}
        </Text>
        <Text style={styles.paragraph}>
          {texts.appDisclaimer}
        </Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{texts.companySection}</Text>
        <Text style={styles.label}>{texts.tradeName}</Text>
        <Text style={styles.value}>Diamond Runner</Text>
        <Text style={styles.label}>{texts.developmentTechnology}</Text>
        <Text style={styles.value}>EFVasconcelos Sistemas</Text>
        <Text style={styles.label}>{texts.businessModel}</Text>
        <Text style={styles.value}>
          {texts.modelDescription}
        </Text>
        <Text style={styles.heading}>{texts.mission}</Text>
        <Text style={styles.paragraph}>
          {texts.missionDescription}
        </Text>
        <Text style={styles.heading}>{texts.vision}</Text>
        <Text style={styles.paragraph}>
          {texts.visionDescription}
        </Text>
        <Text style={styles.heading}>{texts.values}</Text>
        <Text style={styles.paragraph}>
          {texts.valuesDescription}
        </Text>
        <Text style={styles.heading}>{texts.commitment}</Text>
        <Text style={styles.paragraph}>
          {texts.commitmentDescription}
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
  section: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    paddingTop: 18,
    marginBottom: 28,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 18,
  },
  label: { color: theme.text, fontSize: 12, marginTop: 10 },
  value: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  heading: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
});
