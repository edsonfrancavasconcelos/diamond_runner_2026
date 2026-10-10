import { Image, ScrollView, StyleSheet, Text } from "react-native";
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
      <Image
        source={require("../../assets/images/logodiamond.png")}
        style={{ width: 38, height: 38, alignSelf: "center" }}
        resizeMode="contain"
      />
      <Text style={styles.title}>{texts.title}</Text>
      <Text style={styles.heading}>{texts.introHeading}</Text>
      <Text style={styles.paragraph}>{texts.intro}</Text>
      <Text style={styles.heading}>{texts.controllerHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.controller}
      </Text>
      <Text style={styles.heading}>{texts.legalBasesHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.legalBases}
      </Text>
      <Text style={styles.heading}>{texts.legalBasesDetailHeading}</Text>
      <Text style={styles.paragraph}>{texts.legalBasesDetail}</Text>
      <Text style={styles.heading}>{texts.dataHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.data}
      </Text>
      <Text style={styles.heading}>{texts.purposesHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.purposes}
      </Text>
      <Text style={styles.heading}>{texts.networkHeading}</Text>
      <Text style={styles.paragraph}>{texts.network}</Text>
      <Text style={styles.heading}>{texts.paymentSharingHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.paymentSharing}
      </Text>
      <Text style={styles.heading}>{texts.transferHeading}</Text>
      <Text style={styles.paragraph}>{texts.transfer}</Text>
      <Text style={styles.heading}>{texts.retentionHeading}</Text>
      <Text style={styles.paragraph}>{texts.retention}</Text>
      <Text style={styles.heading}>{texts.rightsHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.rights}
      </Text>
      <Text style={styles.paragraph}>
        {texts.accountDeletion}
      </Text>
      <Text style={styles.heading}>{texts.rightsHowHeading}</Text>
      <Text style={styles.paragraph}>{texts.rightsHow}</Text>
      <Text style={styles.heading}>{texts.securityHeading}</Text>
      <Text style={styles.paragraph}>
        {texts.security}
      </Text>
      <Text style={styles.heading}>{texts.minorsHeading}</Text>
      <Text style={styles.paragraph}>{texts.minors}</Text>
      <Text style={styles.heading}>{texts.changesHeading}</Text>
      <Text style={styles.paragraph}>{texts.changes}</Text>
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
