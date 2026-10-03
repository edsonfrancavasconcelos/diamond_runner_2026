// Autor: Edson Vasconcelos | Diamond Runner 2026
// PackagesScreen corrigido - fluxo Stripe completo

import { useContext, useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

import {
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { CountryContext } from "../../i18n/context/CountryContext";
import { useTheme } from "../../i18n/context/ThemeContext";
import { marketingTexts, packagesTexts } from "../../i18n/hooks/texts";

const COLORS = {
  background: "#0a2e5e",
  primary: "#2c94bc",
  gold: "#ffb300",
  card: "#012549",
  white: "#FFFFFF",
  upgrade: "#e67e22",
  prime: "#1abc9c",
};

export default function PackagesScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const route = useRoute();

  const { country = "BR" } = useContext(CountryContext) || {};

  const m = marketingTexts[country] || marketingTexts.BR;
  const texts = packagesTexts[country] || packagesTexts.BR;

  const cur = m.currency;

  const params = route.params || {};

  const {
    email: paramEmail,
    fullName,
    documentId,
    phone,
    sponsorUuid,
    sponsorId,
    sponsorName,
  } = params;

  const [sessionEmail, setSessionEmail] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active && data?.user?.email) {
        setSessionEmail(data.user.email);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const email = paramEmail || sessionEmail || "";

  const hasAccount = Boolean(email && email.includes("@"));

  function handlePayment(packageId, price, points, planName, type = "adesao") {
    const paymentData = {
      email,

      fullName,

      documentId,

      phone,

      sponsorUuid,

      sponsorId,

      sponsorName,

      packageId,

      amount: Number(price),

      price: Number(price),

      points: Number(points),

      type,

      planName,

      plan: planName,
    };

    console.log("💎 Pacote selecionado:", paymentData);

    if (hasAccount) {
      navigation.navigate("PaymentScreen", paymentData);
    } else {
      navigation.navigate("FindSponsor", paymentData);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.mainTitle}>{texts.pageTitle}</Text>
          <Image
            source={require("../../assets/images/logodiamond.png")}
            style={{ width: 38, height: 38 }}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subTitle}>{texts.activationUpgrade}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* AFILIADO */}

        <View style={styles.card}>
          <Text style={styles.cardTag}>{texts.startTag}</Text>

          <Text style={styles.cardTitle}>{texts.affiliate}</Text>

          <Text style={styles.cardPrice}>{cur} 99,00</Text>

          <TouchableOpacity
            style={styles.actionBtn}

            onPress={() => handlePayment(0, 99, 0, "AFILIADO")}
          >
            <Text style={styles.btnText}>{texts.activateLicense}</Text>
          </TouchableOpacity>
        </View>

        {/* BUILDER */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>BUILDER</Text>

          <Text style={styles.cardPrice}>{cur} 299,00</Text>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: COLORS.primary,
              },
            ]}

            onPress={() => handlePayment(1, 299, 299, "BUILDER")}
          >
            <Text style={styles.btnText}>{texts.activateBuilder}</Text>
          </TouchableOpacity>

          <View style={styles.upgradeRow}>
            <TouchableOpacity
              style={[
                styles.upBtn,
                {
                  backgroundColor: COLORS.prime,
                },
              ]}

              onPress={() => handlePayment(4, 799, 500, "PRIME", "upgrade")}
            >
              <Text style={styles.upBtnText}>{texts.upgradePrime}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.upBtn,
                {
                  backgroundColor: COLORS.gold,
                },
              ]}

              onPress={() => handlePayment(3, 1599, 1300, "ELITE", "upgrade")}
            >
              <Text style={[styles.upBtnText, { color: "#000" }]}>
                {texts.upgradeElite}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIME */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>PRIME</Text>

          <Text style={styles.cardPrice}>{cur} 799,00</Text>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: COLORS.prime,
              },
            ]}

            onPress={() => handlePayment(4, 799, 799, "PRIME")}
          >
            <Text style={styles.btnText}>{texts.activatePrime}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: COLORS.gold,
                marginTop: 10,
              },
            ]}

            onPress={() => handlePayment(3, 1599, 800, "ELITE", "upgrade")}
          >
            <Text style={[styles.btnText, { color: "#000" }]}>
              {texts.upgradeToElite}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ELITE */}

        <View
          style={[
            styles.card,
            {
              backgroundColor: COLORS.primary,
            },
          ]}
        >
          <Ionicons
            name="diamond"

            size={35}

            color={COLORS.gold}
          />

          <Text style={styles.cardTitle}>ELITE</Text>

          <Text style={styles.cardPrice}>{cur} 1.599,00</Text>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: "#fff",
              },
            ]}

            onPress={() => handlePayment(3, 1599, 1599, "ELITE")}
          >
            <Text
              style={[
                styles.btnText,
                {
                  color: COLORS.primary,
                },
              ]}
            >
              {texts.activateElite}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  header: {
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 20 : 60,
    paddingBottom: 20,
  },

  mainTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 3,
  },

  subTitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "bold",
  },

  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },

  cardTag: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "bold",
  },

  cardTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
  },

  cardPrice: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "900",
    marginVertical: 10,
  },

  actionBtn: {
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.button,
  },

  upgradeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  upBtn: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  upBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});
