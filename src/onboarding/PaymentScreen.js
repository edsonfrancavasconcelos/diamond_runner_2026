// Arquivo: src/onboarding/PaymentScreen.js
// Diamond Runner 2026
// Ativação através do Diamond Backend
// Sem signUp direto no aplicativo
// Botão voltar

import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTheme } from "../i18n/context/ThemeContext";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  gold: "#FFD700",
  success: "#4CAF50",
  danger: "#d9534f",
};

// ============================================================
// DIAMOND BACKEND
// ============================================================
// IP DO SEU COMPUTADOR NA REDE LOCAL
// NÃO usar localhost em celular físico.
// ============================================================

const API_URL =
  "http://192.168.18.111:3333/api";

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { theme, isDark } = useTheme();

  const [loading, setLoading] = useState(false);

  const params = route.params || {};

  const {
    type,
    fullName,
    email,
    documentId,
    phone,
    whatsapp,
    sponsorUuid,
    sponsorId,
    sponsorName,
    amount,
  } = params;

   const planInfo = useMemo(() => {
    const t = String(type || "").toLowerCase();
    const priceFromParams = Number(amount);

    if (t.includes("elite")) {
      return { name: "ELITE", price: priceFromParams || 1599, vouchers: 30 };
    }
    if (t.includes("prime")) {
      return { name: "PRIME", price: priceFromParams || 799, vouchers: 15 };
    }
    if (t.includes("builder")) {
      return { name: "BUILDER", price: priceFromParams || 299, vouchers: 7 };
    }
    if (t.includes("afiliado") || t.includes("adesao")) {
      return { name: "AFILIADO", price: priceFromParams || 99, vouchers: 0 };
    }

    return {
      name: "DISTRIBUIDOR",
      price: priceFromParams || 99,
      vouchers: 0,
    };
  }, [type, amount]);

  // ==========================================================
  // WHATSAPP
  // ==========================================================

  const finalWhatsapp = phone || whatsapp || "";

  // ==========================================================
  // ATIVAÇÃO PELO BACKEND
  // ==========================================================

  async function handleForcedActivation() {
    if (loading) {
      return;
    }

    const cleanEmail =
      email?.trim().toLowerCase();

    const cleanCPF =
      documentId?.replace(/\D/g, "");

    const cleanName =
      fullName?.trim();

    const cleanWhatsapp =
      finalWhatsapp?.trim();

    // ========================================================
    // VALIDAÇÕES
    // ========================================================

    if (!cleanName) {
      Alert.alert(
        "NOME OBRIGATÓRIO",
        "Informe seu nome completo."
      );
      return;
    }

    if (!cleanEmail) {
      Alert.alert(
        "E-MAIL OBRIGATÓRIO",
        "Informe seu e-mail."
      );
      return;
    }

    if (!cleanCPF) {
      Alert.alert(
        "CPF OBRIGATÓRIO",
        "Informe seu CPF."
      );
      return;
    }

    if (!sponsorUuid) {
      Alert.alert(
        "PATROCINADOR INVÁLIDO",
        "O patrocinador não foi identificado corretamente."
      );
      return;
    }

    setLoading(true);

    try {
      console.log("");
      console.log("========================================");
      console.log("💎 DIAMOND RUNNER 2026");
      console.log("💳 ATIVAÇÃO PELO BACKEND");
      console.log("========================================");
      console.log("🌐 Backend:", API_URL);
      console.log("👤 Nome:", cleanName);
      console.log("📧 E-mail:", cleanEmail);
      console.log("🪪 CPF:", cleanCPF);
      console.log("📱 WhatsApp:", cleanWhatsapp);
      console.log("💎 Patrocinador UUID:", sponsorUuid);
      console.log("💎 Patrocinador ID:", sponsorId);
      console.log("💎 Patrocinador Nome:", sponsorName);
      console.log("📦 Plano:", planInfo.name);
      console.log("💰 Valor:", planInfo.price);
      console.log("========================================");

      // ======================================================
      // ENVIA PARA O BACKEND
      // ======================================================

      console.log(
        "🌐 Enviando cadastro para:",
        `${API_URL}/payments/confirm`
      );

      const response = await fetch(
        `${API_URL}/payments/confirm`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            // PATROCINADOR
            sponsorUuid: sponsorUuid,
            sponsorId: sponsorId || null,
            sponsorName: sponsorName || null,

            // NOVO USUÁRIO
            email: cleanEmail,
            fullName: cleanName,
            documentId: cleanCPF,
            whatsapp: cleanWhatsapp,
            phone: cleanWhatsapp,

            // PLANO
            planName: planInfo.name,
            amount: planInfo.price,
          }),
        }
      );

      // ======================================================
      // TENTA LER A RESPOSTA
      // ======================================================

      let result = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }

      console.log(
        "📥 Status HTTP:",
        response.status
      );

      console.log(
        "📥 Resposta:",
        result
      );

      // ======================================================
      // ERRO HTTP
      // ======================================================

      if (!response.ok) {
        // ----------------------------------------------------
        // PROFILE JÁ EXISTE
        // ----------------------------------------------------

        if (
          result?.code ===
          "PROFILE_ALREADY_EXISTS"
        ) {
          Alert.alert(
            "CADASTRO JÁ EXISTE",
            "Este e-mail já possui um cadastro no Diamond Runner.",
            [
              {
                text: "IR PARA ACESSO",
                onPress: () =>
                  navigation.replace(
                    "FirstAccess",
                    {
                      email: cleanEmail,
                      isNewUser: false,
                    }
                  ),
              },
              {
                text: "VOLTAR",
                style: "cancel",
              },
            ]
          );

          return;
        }

        // ----------------------------------------------------
        // AUTH JÁ EXISTE
        // ----------------------------------------------------

        if (
          result?.code ===
          "AUTH_USER_ALREADY_EXISTS"
        ) {
          Alert.alert(
            "CONTA JÁ EXISTE",
            "Este e-mail já possui uma conta no Diamond Runner.",
            [
              {
                text: "IR PARA ACESSO",
                onPress: () =>
                  navigation.replace(
                    "FirstAccess",
                    {
                      email: cleanEmail,
                      isNewUser: false,
                    }
                  ),
              },
              {
                text: "VOLTAR",
                style: "cancel",
              },
            ]
          );

          return;
        }

        // ----------------------------------------------------
        // PATROCINADOR INVÁLIDO
        // ----------------------------------------------------

        if (
          result?.code ===
          "SPONSOR_NOT_FOUND"
        ) {
          Alert.alert(
            "PATROCINADOR INVÁLIDO",
            "O patrocinador informado não foi encontrado."
          );

          return;
        }

        throw new Error(
          result?.message ||
            `O servidor retornou o erro ${response.status}.`
        );
      }

      // ======================================================
      // VALIDA RESPOSTA
      // ======================================================

      if (
        result?.status !==
        "success"
      ) {
        throw new Error(
          result?.message ||
            "O servidor não confirmou o cadastro."
        );
      }

      // ======================================================
      // DADOS RETORNADOS
      // ======================================================

      const createdUserId =
        result.userId;

      const createdIdDr =
        result.id_dr;

      const returnedSponsorUuid =
        result.sponsorUuid ||
        sponsorUuid;

      const returnedSponsorId =
        result.sponsorId ||
        sponsorId;

      const returnedSponsorName =
        result.sponsorName ||
        sponsorName;

      console.log("");
      console.log("========================================");
      console.log("✅ CADASTRO CONCLUÍDO");
      console.log("========================================");
      console.log(
        "🆔 UUID:",
        createdUserId
      );
      console.log(
        "💎 ID DR:",
        createdIdDr
      );
      console.log(
        "👤 Patrocinador:",
        returnedSponsorName
      );
      console.log(
        "💎 ID Patrocinador:",
        returnedSponsorId
      );
      console.log(
        "🔑 UUID Patrocinador:",
        returnedSponsorUuid
      );
      console.log("========================================");

      // ======================================================
      // SUCESSO
      // ======================================================

      Alert.alert(
        "PAGAMENTO CONFIRMADO",
        `Cadastro criado com sucesso!\n\nSeu ID Diamond Runner:\n${createdIdDr}`,
        [
          {
            text: "DEFINIR MINHA SENHA",
            onPress: () => {
              navigation.replace(
                "FirstAccess",
                {
                  email: cleanEmail,

                  isNewUser: true,

                  userId:
                    createdUserId,

                  idDr:
                    createdIdDr,

                  sponsorUuid:
                    returnedSponsorUuid,

                  sponsorId:
                    returnedSponsorId,

                  sponsorName:
                    returnedSponsorName,
                }
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "❌ Erro na ativação:",
        error
      );

      const errorMessage =
        error?.message || "";

      // ======================================================
      // ERRO DE REDE
      // ======================================================

      if (
        errorMessage
          .toLowerCase()
          .includes(
            "network request failed"
          ) ||
        errorMessage
          .toLowerCase()
          .includes(
            "network error"
          )
      ) {
        Alert.alert(
          "SERVIDOR INDISPONÍVEL",
          "Não foi possível conectar ao Diamond Backend.\n\nVerifique se:\n\n• O backend está rodando;\n• O computador está conectado à rede;\n• O celular está na mesma rede Wi-Fi;\n• O IP configurado está correto:\n\n192.168.18.111:3333"
        );

        return;
      }

      // ======================================================
      // ERRO GERAL
      // ======================================================

      Alert.alert(
        "FALHA NA ATIVAÇÃO",
        errorMessage ||
          "Não foi possível concluir a ativação."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // TELA
  // ==========================================================

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            theme?.bg ||
            PALETTE.dark,
        },
      ]}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
      />

      {/* ====================================================
          BARRA SUPERIOR
      ==================================================== */}

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
          disabled={loading}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={
              PALETTE.primary
            }
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.topTitle,
            {
              color:
                theme?.text ||
                "#FFFFFF",
            },
          ]}
        >
          FINALIZAR ATIVAÇÃO
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* ==================================================
            CABEÇALHO
        ================================================== */}

        <View style={styles.header}>
          <Ionicons
            name="diamond"
            size={60}
            color={
              PALETTE.gold
            }
          />

          <Text style={styles.title}>
            FINALIZAR ATIVAÇÃO
          </Text>

          <Text
            style={
              styles.planName
            }
          >
            {planInfo.name}
          </Text>

          <Text
            style={
              styles.priceText
            }
          >
            R${" "}
            {planInfo.price.toFixed(
              2
            )}
          </Text>
        </View>

        {/* ==================================================
            PATROCINADOR
        ================================================== */}

        <View
          style={
            styles.sponsorCard
          }
        >
          <Ionicons
            name="people"
            size={25}
            color={
              PALETTE.gold
            }
          />

          <View
            style={
              styles.sponsorInfo
            }
          >
            <Text
              style={
                styles.sponsorLabel
              }
            >
              PATROCINADOR
            </Text>

            <Text
              style={
                styles.sponsorName
              }
            >
              {sponsorName ||
                "Patrocinador selecionado"}
            </Text>

            <Text
              style={
                styles.sponsorId
              }
            >
              ID:{" "}
              {sponsorId ||
                "---"}
            </Text>
          </View>
        </View>

        {/* ==================================================
            PAGAMENTO STRIPE
        ================================================== */}

        <View
          style={styles.actions}
        >
          <TouchableOpacity
            style={
              styles.payButton
            }
            onPress={() =>
              navigation.navigate(
                "StripeCheckout",
                {
                  ...params,
                  planName:
                    planInfo.name,
                  price:
                    planInfo.price,
                }
              )
            }
            disabled={loading}
          >
            <Ionicons
              name="card"
              size={22}
              color="#FFF"
            />

            <Text
              style={
                styles.btnText
              }
            >
              PAGAR COM CARTÃO (STRIPE)
            </Text>
          </TouchableOpacity>

          {/* ==================================================
              ATIVAÇÃO DE TESTE
          ================================================== */}

          <View
            style={
              styles.sandboxDivider
            }
          >
            <Text
              style={
                styles.sandboxLabel
              }
            >
              AMBIENTE DE TESTE
            </Text>

            <TouchableOpacity
              style={[
                styles.payButton,
                {
                  backgroundColor:
                    PALETTE.success,
                },
              ]}
              onPress={
                handleForcedActivation
              }
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="#FFF"
                  />

                  <Text
                    style={
                      styles.btnText
                    }
                  >
                    JÁ PAGUEI / ATIVAR MANUAL
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <Text
            style={
              styles.testWarning
            }
          >
            A ativação manual é
            somente para testes.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
    },

    topBar: {
      paddingTop: 55,
      paddingHorizontal: 20,
      paddingBottom: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    backButton: {
      width: 45,
      height: 45,
      borderRadius: 23,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    topTitle: {
      fontSize: 18,
      fontWeight:
        "900",
      marginLeft: 10,
    },

    container: {
      flexGrow: 1,
      backgroundColor:
        PALETTE.dark,
      padding: 30,
      paddingTop: 20,
      paddingBottom: 50,
      justifyContent:
        "center",
    },

    header: {
      alignItems:
        "center",
      marginBottom: 30,
    },

    title: {
      color: "#FFF",
      fontSize: 22,
      fontWeight:
        "900",
      marginTop: 10,
    },

    planName: {
      color:
        PALETTE.primary,
      fontSize: 16,
      fontWeight:
        "bold",
      marginTop: 5,
    },

    priceText: {
      color:
        PALETTE.gold,
      fontSize: 40,
      fontWeight:
        "900",
      marginTop: 10,
    },

    sponsorCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#103f76",
      borderWidth: 1,
      borderColor:
        PALETTE.gold,
      borderRadius: 15,
      padding: 18,
      marginBottom: 25,
    },

    sponsorInfo: {
      marginLeft: 12,
      flex: 1,
    },

    sponsorLabel: {
      color:
        "#a4bccc",
      fontSize: 10,
      fontWeight:
        "bold",
    },

    sponsorName: {
      color: "#FFF",
      fontSize: 15,
      fontWeight:
        "900",
      marginTop: 3,
    },

    sponsorId: {
      color:
        PALETTE.primary,
      fontSize: 12,
      fontWeight:
        "bold",
      marginTop: 3,
    },

    actions: {
      width: "100%",
    },

    payButton: {
      backgroundColor:
        PALETTE.primary,
      padding: 18,
      borderRadius: 15,
      alignItems:
        "center",
      justifyContent:
        "center",
      width: "100%",
      flexDirection:
        "row",
      gap: 10,
    },

    btnText: {
      color: "#FFF",
      fontWeight:
        "bold",
      fontSize: 15,
      flexShrink: 1,
      textAlign:
        "center",
    },

    sandboxDivider: {
      marginTop: 35,
      borderTopWidth: 1,
      borderTopColor:
        "rgba(255,255,255,0.1)",
      paddingTop: 20,
      width: "100%",
    },

    sandboxLabel: {
      color:
        PALETTE.gold,
      fontSize: 10,
      textAlign:
        "center",
      marginBottom: 15,
      letterSpacing: 2,
    },

    testWarning: {
      color:
        "#a4bccc",
      fontSize: 11,
      textAlign:
        "center",
      marginTop: 15,
    },
  });