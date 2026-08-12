// Arquivo: src/onboarding/RunnerRegisterScreen.js
// Diamond Runner 2026
// Cadastro + patrocinador validado

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
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
  // 1. DADOS RECEBIDOS DO HAS SPONSOR
  // ============================================================

  const {
    sponsorUuid: routeSponsorUuid = "",
    sponsorId: routeSponsorId = "",
    sponsorName: routeSponsorName = "",
  } = route.params || {};

  // ============================================================
  // 2. CONTROLES
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [isValidatingSponsor, setIsValidatingSponsor] = useState(false);

  // Guarda o patrocinador originalmente validado.
  //
  // Isso é importante porque o patrocinador que veio do
  // HasSponsorScreen JÁ FOI validado.
  const initialSponsorRef = useRef({
    uuid: routeSponsorUuid || "",
    id: routeSponsorId || "",
    name: routeSponsorName || "",
  });

  // ============================================================
  // 3. FORMULÁRIO
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
  // 4. ATUALIZA FORMULÁRIO
  // ============================================================

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ============================================================
  // 5. GARANTE OS DADOS RECEBIDOS DA ROTA
  // ============================================================
  //
  // NÃO faz consulta ao Supabase.
  //
  // O HasSponsorScreen já fez a validação.
  //

  useEffect(() => {
    if (
      !routeSponsorId &&
      !routeSponsorUuid &&
      !routeSponsorName
    ) {
      return;
    }

    const sponsorId = routeSponsorId
      ? routeSponsorId.trim().toUpperCase()
      : "";

    setForm((prev) => ({
      ...prev,

      sponsorId: sponsorId || prev.sponsorId,

      sponsorName:
        routeSponsorName || prev.sponsorName,

      sponsorUuid:
        routeSponsorUuid || prev.sponsorUuid,
    }));
  }, [
    routeSponsorId,
    routeSponsorUuid,
    routeSponsorName,
  ]);

  // ============================================================
  // 6. VALIDAÇÃO MANUAL DO PATROCINADOR
  // ============================================================
  //
  // Só executa quando o usuário alterar o ID.
  //
  // Se o ID continuar sendo o mesmo que veio do
  // HasSponsorScreen, NÃO consulta novamente.
  //

  useEffect(() => {
    const currentId = (form.sponsorId || "")
      .trim()
      .toUpperCase();

    const originalId = (
      initialSponsorRef.current.id || ""
    )
      .trim()
      .toUpperCase();

    // ----------------------------------------------------------
    // Sem ID
    // ----------------------------------------------------------

    if (!currentId) {
      setIsValidatingSponsor(false);

      setForm((prev) => ({
        ...prev,
        sponsorName: "",
        sponsorUuid: "",
      }));

      return;
    }

    // ----------------------------------------------------------
    // ID original já validado
    // ----------------------------------------------------------

    if (
      originalId &&
      currentId === originalId &&
      initialSponsorRef.current.uuid
    ) {
      setIsValidatingSponsor(false);

      setForm((prev) => ({
        ...prev,
        sponsorId: originalId,
        sponsorName:
          initialSponsorRef.current.name ||
          prev.sponsorName ||
          "PATROCINADOR",
        sponsorUuid:
          initialSponsorRef.current.uuid,
      }));

      return;
    }

    // ----------------------------------------------------------
    // ID alterado manualmente
    // ----------------------------------------------------------

    // Enquanto o usuário está digitando, o patrocinador anterior
    // deixa de ser válido.
    setIsValidatingSponsor(false);

    setForm((prev) => ({
      ...prev,
      sponsorName: "",
      sponsorUuid: "",
    }));

    // ID muito curto.
    if (currentId.length < 4) {
      return;
    }

    setIsValidatingSponsor(true);

    let cancelled = false;

    const debounce = setTimeout(async () => {
      try {
        console.log(
          "🔎 Validando novo patrocinador:",
          currentId
        );

        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, id_dr")
          .eq("id_dr", currentId)
          .maybeSingle();

        if (cancelled) {
          return;
        }

        // ------------------------------------------------------
        // ERRO SUPABASE
        // ------------------------------------------------------

        if (error) {
          console.log(
            "❌ Erro Supabase ao buscar patrocinador:",
            error
          );

          setForm((prev) => ({
            ...prev,
            sponsorName: "NÃO ENCONTRADO ❌",
            sponsorUuid: "",
          }));

          return;
        }

        // ------------------------------------------------------
        // NÃO ENCONTRADO
        // ------------------------------------------------------

        if (!data) {
          console.log(
            "❌ Patrocinador não encontrado:",
            currentId
          );

          setForm((prev) => ({
            ...prev,
            sponsorName: "NÃO ENCONTRADO ❌",
            sponsorUuid: "",
          }));

          return;
        }

        // ------------------------------------------------------
        // ENCONTRADO
        // ------------------------------------------------------

        console.log(
          "✅ Novo patrocinador encontrado:",
          data
        );

        setForm((prev) => ({
          ...prev,

          sponsorId:
            data.id_dr || currentId,

          sponsorName:
            data.full_name || "PATROCINADOR",

          sponsorUuid:
            data.id,
        }));
      } catch (error) {
        if (cancelled) {
          return;
        }

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
        if (!cancelled) {
          setIsValidatingSponsor(false);
        }
      }
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [form.sponsorId]);

  // ============================================================
  // 7. CONTINUAR
  // ============================================================

  const handleContinue = () => {
    // ----------------------------------------------------------
    // PATROCINADOR
    // ----------------------------------------------------------

    if (!form.sponsorUuid) {
      Alert.alert(
        "PATROCINADOR INVÁLIDO",
        "Informe um ID de patrocinador válido antes de continuar."
      );

      return;
    }

    // ----------------------------------------------------------
    // NOME
    // ----------------------------------------------------------

    if (!form.fullName.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu nome completo."
      );

      return;
    }

    // ----------------------------------------------------------
    // CPF
    // ----------------------------------------------------------

    if (!form.documentId.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu CPF."
      );

      return;
    }

    // ----------------------------------------------------------
    // E-MAIL
    // ----------------------------------------------------------

    if (!form.email.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu e-mail."
      );

      return;
    }

    // ----------------------------------------------------------
    // WHATSAPP
    // ----------------------------------------------------------

    if (!form.phone.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu WhatsApp."
      );

      return;
    }

    // ----------------------------------------------------------
    // GARANTE QUE NÃO ESTÁ VALIDANDO
    // ----------------------------------------------------------

    if (isValidatingSponsor) {
      Alert.alert(
        "AGUARDE",
        "Estamos validando o patrocinador."
      );

      return;
    }

    // ----------------------------------------------------------
    // PAGAMENTO
    // ----------------------------------------------------------

    console.log(
      "➡️ Indo para pagamento com:",
      {
        sponsorUuid: form.sponsorUuid,
        sponsorId: form.sponsorId,
        sponsorName: form.sponsorName,
        fullName: form.fullName,
        email: form.email,
      }
    );

    navigation.navigate("PaymentScreen", {
      ...form,
    });
  };

  // ============================================================
  // 8. TELA
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

            <Text style={styles.sponsorName}>
              {form.sponsorName ||
                "PATROCINADOR NÃO INFORMADO"}
            </Text>

            <Text style={styles.sponsorId}>
              ID: {form.sponsorId || "---"}
            </Text>
          </View>

          {isValidatingSponsor && (
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
            updateForm(
              "fullName",
              value
            )
          }
        />

        <InputField
          label="CPF *"
          value={form.documentId}
          keyboard="numeric"
          onChange={(value) =>
            updateForm(
              "documentId",
              value
            )
          }
        />

        <InputField
          label="E-MAIL *"
          value={form.email}
          keyboard="email-address"
          onChange={(value) =>
            updateForm(
              "email",
              value
            )
          }
        />

        <InputField
          label="WHATSAPP *"
          value={form.phone}
          keyboard="phone-pad"
          onChange={(value) =>
            updateForm(
              "phone",
              value
            )
          }
        />

        {/* ====================================================
            TROCAR PATROCINADOR
        ==================================================== */}

        <View style={styles.changeSponsorInfo}>
          <Text style={styles.changeSponsorText}>
            Deseja trocar o patrocinador?
            Altere o ID abaixo:
          </Text>
        </View>

        <InputField
          label="ID DO PATROCINADOR"
          value={form.sponsorId}
          onChange={(value) =>
            updateForm(
              "sponsorId",
              value
                .trim()
                .toUpperCase()
            )
          }
        />

        {/* ====================================================
            STATUS DA VALIDAÇÃO
        ==================================================== */}

        {isValidatingSponsor && (
          <View style={styles.validationStatus}>
            <ActivityIndicator
              size="small"
              color={PALETTE.primary}
            />

            <Text style={styles.validationText}>
              Validando patrocinador...
            </Text>
          </View>
        )}

        {!isValidatingSponsor &&
          form.sponsorName ===
            "NÃO ENCONTRADO ❌" && (
            <Text style={styles.errorText}>
              Patrocinador não encontrado.
              Verifique o ID informado.
            </Text>
          )}

        {!isValidatingSponsor &&
          form.sponsorUuid &&
          form.sponsorName &&
          form.sponsorName !==
            "NÃO ENCONTRADO ❌" && (
            <Text style={styles.successText}>
              ✓ Patrocinador validado
            </Text>
          )}

        {/* ====================================================
            BOTÃO
        ==================================================== */}

        <Button
          title={
            isValidatingSponsor
              ? "VALIDANDO..."
              : loading
              ? "PROCESSANDO..."
              : "IR PARA PAGAMENTO"
          }
          onPress={handleContinue}
          disabled={
            loading ||
            isValidatingSponsor ||
            !form.sponsorUuid ||
            form.sponsorName ===
              "NÃO ENCONTRADO ❌"
          }
        />

        {/* ====================================================
            INDICADOR
        ==================================================== */}

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

  changeSponsorText: {
    color: "#a4bccc",
    fontSize: 11,
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

  validationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -5,
    marginBottom: 15,
  },

  validationText: {
    color: PALETTE.primary,
    fontSize: 12,
    marginLeft: 8,
  },

  successText: {
    color: "#2c94bc",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
  },

  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
  },
});