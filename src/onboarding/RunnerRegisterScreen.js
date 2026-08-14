// Arquivo: src/onboarding/RunnerRegisterScreen.js
// Diamond Runner 2026
// Cadastro + patrocinador automático do usuário logado

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "../components/Button";
import { useTheme } from "../i18n/context/ThemeContext";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  gold: "#FFD700",
  darkBlue: "#0c3c74",
};

export default function RunnerRegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark } = useTheme();

  // ============================================================
  // DADOS QUE PODEM VIR DA TELA ANTERIOR
  // ============================================================

  const {
    sponsorUuid: routeSponsorUuid = "",
    sponsorId: routeSponsorId = "",
    sponsorName: routeSponsorName = "",
  } = route.params || {};

  // ============================================================
  // ESTADOS
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [loadingSponsor, setLoadingSponsor] = useState(true);
  const [isValidatingSponsor, setIsValidatingSponsor] =
    useState(false);

  // Indica se o patrocinador atual veio automaticamente
  // do usuário autenticado.
  const [automaticSponsor, setAutomaticSponsor] = useState(false);

  // ============================================================
  // FORMULÁRIO
  // ============================================================

  const [form, setForm] = useState({
    sponsorId: routeSponsorId || "",
    sponsorName: routeSponsorName || "",
    sponsorUuid: routeSponsorUuid || "",

    fullName: "",
    email: "",
    documentId: "",
    birth: "",
    phone: "",
  });

  // ============================================================
  // ATUALIZA CAMPO
  // ============================================================

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ============================================================
  // 1. BUSCAR PATROCINADOR AUTOMATICAMENTE
  // ============================================================
  //
  // Primeiro tentamos os dados enviados pela tela anterior.
  //
  // Se eles não existirem, procuramos o usuário autenticado
  // no Supabase Auth e depois seu registro em profiles.
  //
  // Exemplo:
  //
  // Auth user
  //      ↓
  // profiles.id
  //      ↓
  // full_name
  // id_dr
  //
  // Isso permite usar automaticamente:
  //
  // Edson França Vasconcelos
  // DR000001
  //
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function loadAutomaticSponsor() {
      try {
        setLoadingSponsor(true);

        // --------------------------------------------------------
        // CASO 1:
        // A tela anterior já enviou o patrocinador.
        // --------------------------------------------------------

        if (
          routeSponsorUuid &&
          routeSponsorId &&
          routeSponsorName
        ) {
          console.log(
            "✅ Patrocinador recebido da tela anterior:",
            {
              routeSponsorUuid,
              routeSponsorId,
              routeSponsorName,
            }
          );

          if (mounted) {
            setForm((prev) => ({
              ...prev,
              sponsorUuid: routeSponsorUuid,
              sponsorId: routeSponsorId.toUpperCase(),
              sponsorName: routeSponsorName,
            }));

            setAutomaticSponsor(true);
            setLoadingSponsor(false);
          }

          return;
        }

        // --------------------------------------------------------
        // CASO 2:
        // Procurar usuário atualmente autenticado.
        // --------------------------------------------------------

        console.log(
          "🔎 Procurando usuário autenticado..."
        );

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.log(
            "❌ Erro ao obter usuário autenticado:",
            authError
          );

          throw authError;
        }

        if (!user) {
          console.log(
            "⚠️ Nenhum usuário autenticado."
          );

          if (mounted) {
            setLoadingSponsor(false);
          }

          return;
        }

        console.log(
          "✅ Usuário autenticado:",
          user.id,
          user.email
        );

        // --------------------------------------------------------
        // Buscar o perfil desse usuário.
        // --------------------------------------------------------

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "id, full_name, email, id_dr, document_id, status"
            )
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          console.log(
            "❌ Erro ao buscar perfil:",
            profileError
          );

          throw profileError;
        }

        if (!profile) {
          console.log(
            "⚠️ Usuário autenticado não possui registro em profiles."
          );

          if (mounted) {
            setLoadingSponsor(false);
          }

          return;
        }

        console.log(
          "✅ Perfil encontrado:",
          profile
        );

        // --------------------------------------------------------
        // Preencher patrocinador automaticamente.
        // --------------------------------------------------------

        if (profile.id_dr) {
          if (mounted) {
            setForm((prev) => ({
              ...prev,
              sponsorUuid: profile.id,
              sponsorId: profile.id_dr.toUpperCase(),
              sponsorName:
                profile.full_name ||
                user.user_metadata?.full_name ||
                "PATROCINADOR",
            }));

            setAutomaticSponsor(true);
          }

          console.log(
            "💎 Patrocinador automático:",
            profile.full_name,
            profile.id_dr
          );
        } else {
          console.log(
            "⚠️ O perfil não possui id_dr."
          );
        }
      } catch (error) {
        console.log(
          "❌ Erro ao carregar patrocinador automático:",
          error
        );

        if (mounted) {
          Alert.alert(
            "ATENÇÃO",
            "Não foi possível carregar automaticamente o patrocinador. Você poderá informar o ID manualmente."
          );
        }
      } finally {
        if (mounted) {
          setLoadingSponsor(false);
        }
      }
    }

    loadAutomaticSponsor();

    return () => {
      mounted = false;
    };
  }, [
    routeSponsorUuid,
    routeSponsorId,
    routeSponsorName,
  ]);

  // ============================================================
  // 2. TROCA MANUAL DO PATROCINADOR
  // ============================================================
  //
  // Este efeito NÃO deve ficar pesquisando o patrocinador
  // automático novamente.
  //
  // Ele somente consulta quando o usuário realmente modifica
  // o ID para outro valor.
  //
  // ============================================================

  useEffect(() => {
    const currentId = (form.sponsorId || "")
      .trim()
      .toUpperCase();

    if (!currentId) {
      return;
    }

    // Se ainda estamos carregando o patrocinador automático,
    // não faça uma segunda consulta.
    if (loadingSponsor) {
      return;
    }

    // Se o ID atual é o patrocinador automático, não pesquisar.
    if (
      automaticSponsor &&
      routeSponsorId &&
      currentId ===
        routeSponsorId.trim().toUpperCase()
    ) {
      return;
    }

    // Se o usuário ainda não digitou um ID completo,
    // não consultar.
    if (currentId.length < 4) {
      if (automaticSponsor) {
        setAutomaticSponsor(false);
      }

      setForm((prev) => ({
        ...prev,
        sponsorName: "",
        sponsorUuid: "",
      }));

      return;
    }

    // Se ainda é o mesmo patrocinador automático,
    // não consultar novamente.
    if (
      automaticSponsor &&
      form.sponsorUuid &&
      currentId ===
        (form.sponsorId || "").trim().toUpperCase()
    ) {
      return;
    }

    setIsValidatingSponsor(true);

    const debounce = setTimeout(async () => {
      try {
        console.log(
          "🔎 Procurando novo patrocinador:",
          currentId
        );

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, id_dr")
          .eq("id_dr", currentId)
          .maybeSingle();

        if (error) {
          console.log(
            "❌ Erro ao buscar patrocinador:",
            error
          );

          setForm((prev) => ({
            ...prev,
            sponsorName: "NÃO ENCONTRADO ❌",
            sponsorUuid: "",
          }));

          return;
        }

        if (!data) {
          console.log(
            "⚠️ Patrocinador não encontrado:",
            currentId
          );

          setForm((prev) => ({
            ...prev,
            sponsorName: "NÃO ENCONTRADO ❌",
            sponsorUuid: "",
          }));

          return;
        }

        console.log(
          "✅ Novo patrocinador encontrado:",
          data
        );

        setAutomaticSponsor(false);

        setForm((prev) => ({
          ...prev,
          sponsorId:
            data.id_dr || currentId,
          sponsorName:
            data.full_name || "PATROCINADOR",
          sponsorUuid: data.id,
        }));
      } catch (error) {
        console.log(
          "❌ Erro inesperado ao buscar patrocinador:",
          error
        );

        setForm((prev) => ({
          ...prev,
          sponsorName: "NÃO ENCONTRADO ❌",
          sponsorUuid: "",
        }));
      } finally {
        setIsValidatingSponsor(false);
      }
    }, 700);

    return () => {
      clearTimeout(debounce);
    };
  }, [
    form.sponsorId,
    loadingSponsor,
    automaticSponsor,
    routeSponsorId,
  ]);

  // ============================================================
  // 3. CONTINUAR PARA PAGAMENTO
  // ============================================================

  const handleContinue = () => {
    if (!form.sponsorUuid) {
      Alert.alert(
        "PATROCINADOR INVÁLIDO",
        "Informe um ID de patrocinador válido antes de continuar."
      );

      return;
    }

    if (!form.fullName.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu nome completo."
      );

      return;
    }

    if (!form.documentId.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu CPF."
      );

      return;
    }

    if (!form.email.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu e-mail."
      );

      return;
    }

    if (!form.phone.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu WhatsApp."
      );

      return;
    }

    console.log(
      "➡️ Indo para pagamento com:",
      form
    );

    navigation.navigate("PaymentScreen", {
      ...form,
    });
  };

  // ============================================================
  // TELA
  // ============================================================

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      style={{
        flex: 1,
        backgroundColor: theme.bg,
      }}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
      />

      {/* ======================================================
          BARRA SUPERIOR
      ====================================================== */}

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={PALETTE.primary}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.topTitle,
            {
              color: theme.text,
            },
          ]}
        >
          FINALIZAR CADASTRO
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* ====================================================
            CARD DO PATROCINADOR
        ==================================================== */}

        <View
          style={[
            styles.sponsorHeader,
            {
              backgroundColor: isDark
                ? PALETTE.darkBlue
                : "#e1f0f7",
            },
          ]}
        >
          <Ionicons
            name="shield-checkmark"
            size={32}
            color={PALETTE.gold}
          />

          <View
            style={{
              marginLeft: 12,
              flex: 1,
            }}
          >
            <Text style={styles.sponsorLabel}>
              PATROCINADOR SELECIONADO:
            </Text>

            <Text
              style={[
                styles.sponsorName,
                !isDark && {
                  color: PALETTE.darkBlue,
                },
              ]}
            >
              {loadingSponsor
                ? "CARREGANDO..."
                : form.sponsorName ||
                  "INFORME O PATROCINADOR"}
            </Text>

            <Text style={styles.sponsorId}>
              ID: {form.sponsorId || "---"}
            </Text>

            {automaticSponsor &&
              !loadingSponsor && (
                <Text
                  style={styles.automaticText}
                >
                  ✓ PATROCINADOR AUTOMÁTICO
                </Text>
              )}
          </View>

          {(loadingSponsor ||
            isValidatingSponsor) && (
            <ActivityIndicator
              size="small"
              color={PALETTE.gold}
            />
          )}
        </View>

        {/* ====================================================
            DADOS PESSOAIS
        ==================================================== */}

        <Text style={styles.sectionTitle}>
          SEUS DADOS PESSOAIS
        </Text>

        <InputField
          label="NOME COMPLETO *"
          value={form.fullName}
          onChange={(value) =>
            updateForm("fullName", value)
          }
        />

        <InputField
          label="CPF *"
          value={form.documentId}
          keyboard="numeric"
          onChange={(value) =>
            updateForm("documentId", value)
          }
        />

        <InputField
          label="E-MAIL *"
          value={form.email}
          keyboard="email-address"
          onChange={(value) =>
            updateForm("email", value)
          }
        />

        <InputField
          label="WHATSAPP *"
          value={form.phone}
          keyboard="phone-pad"
          onChange={(value) =>
            updateForm("phone", value)
          }
        />

        {/* ====================================================
            TROCAR PATROCINADOR
        ==================================================== */}

        <View style={styles.changeSponsorInfo}>
          <Text style={styles.changeSponsorTitle}>
            PATROCINADOR
          </Text>

          <Text style={styles.changeSponsorText}>
            O patrocinador foi preenchido
            automaticamente. Se quiser escolher
            outro patrocinador, altere o ID abaixo.
          </Text>
        </View>

        <InputField
          label="ID DO PATROCINADOR"
          value={form.sponsorId}
          onChange={(value) => {
            const newId = value
              .toUpperCase()
              .trimStart();

            setAutomaticSponsor(false);

            updateForm(
              "sponsorId",
              newId
            );
          }}
        />

        {/* ====================================================
            BOTÃO
        ==================================================== */}

        <Button
          title={
            loadingSponsor
              ? "CARREGANDO PATROCINADOR..."
              : isValidatingSponsor
              ? "VALIDANDO..."
              : loading
              ? "PROCESSANDO..."
              : "IR PARA PAGAMENTO"
          }
          onPress={handleContinue}
          disabled={
            loading ||
            loadingSponsor ||
            isValidatingSponsor ||
            !form.sponsorUuid ||
            form.sponsorName.includes("❌")
          }
        />

        {loading && (
          <ActivityIndicator
            style={{
              marginTop: 20,
            }}
            color={PALETTE.primary}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// COMPONENTE DE INPUT
// ============================================================

const InputField = ({
  label,
  value,
  onChange,
  keyboard = "default",
}) => {
  return (
    <View
      style={{
        marginBottom: 15,
      }}
    >
      {label !== "" && (
        <Text style={styles.inputLabel}>
          {label}
        </Text>
      )}

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        autoCapitalize={
          keyboard === "email-address"
            ? "none"
            : "sentences"
        }
        autoCorrect={false}
        placeholderTextColor="#7890a5"
      />
    </View>
  );
};

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  topBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    padding: 4,
  },

  topTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },

  scrollContent: {
    padding: 25,
    paddingBottom: 50,
  },

  sponsorHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: PALETTE.gold,
  },

  sponsorLabel: {
    color: "#a4bccc",
    fontSize: 10,
    fontWeight: "bold",
  },

  sponsorName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },

  sponsorId: {
    color: PALETTE.primary,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 3,
  },

  automaticText: {
    color: PALETTE.gold,
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 5,
  },

  sectionTitle: {
    color: PALETTE.gold,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 10,
  },

  changeSponsorInfo: {
    marginTop: 5,
    marginBottom: 8,
  },

  changeSponsorTitle: {
    color: PALETTE.gold,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },

  changeSponsorText: {
    color: "#a4bccc",
    fontSize: 11,
    lineHeight: 16,
  },

  inputLabel: {
    color: "#a4bccc",
    fontSize: 12,
    marginBottom: 5,
  },

  input: {
    backgroundColor: "#0c3c74",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1a4a8a",
    fontSize: 15,
  },
});