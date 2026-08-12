// Arquivo: src/onboarding/RunnerRegisterScreen.js
// Diamond Runner 2026
// AUTO-FILL DO PATROCINADOR + VALIDAÇÃO SEGURA

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
  // 1. RECEBE OS DADOS DA TELA ANTERIOR
  // ============================================================
  //
  // HasSponsorScreen deve enviar:
  //
  // sponsorUuid
  // sponsorId
  // sponsorName
  //
  const {
    sponsorUuid: routeSponsorUuid = "",
    sponsorId: routeSponsorId = "",
    sponsorName: routeSponsorName = "",
  } = route.params || {};

  // ============================================================
  // 2. ESTADOS
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [isValidatingSponsor, setIsValidatingSponsor] = useState(false);

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
  // 4. ATUALIZA CAMPO DO FORMULÁRIO
  // ============================================================

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ============================================================
  // 5. MANTÉM O PATROCINADOR RECEBIDO PELA ROTA
  // ============================================================
  //
  // Isso evita que o patrocinador apareça como "BUSCANDO..."
  // novamente quando a tela for montada.
  //
  useEffect(() => {
    if (!routeSponsorId) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      sponsorId: routeSponsorId.toUpperCase(),
      sponsorName: routeSponsorName || prev.sponsorName,
      sponsorUuid: routeSponsorUuid || prev.sponsorUuid,
    }));
  }, [routeSponsorId, routeSponsorName, routeSponsorUuid]);

  // ============================================================
  // 6. BUSCA PATROCINADOR SOMENTE QUANDO O USUÁRIO ALTERAR O ID
  // ============================================================

  useEffect(() => {
    const currentId = (form.sponsorId || "").trim().toUpperCase();

    // Não pesquisa se não houver ID.
    if (!currentId) {
      return;
    }

    // Se o ID atual é exatamente o ID que veio da tela anterior,
    // NÃO precisamos consultar novamente.
    if (
      routeSponsorId &&
      currentId === routeSponsorId.trim().toUpperCase()
    ) {
      return;
    }

    // O usuário está alterando manualmente o patrocinador.
    // Só pesquisa depois de pelo menos 4 caracteres.
    if (currentId.length < 4) {
      setForm((prev) => ({
        ...prev,
        sponsorName: "",
        sponsorUuid: "",
      }));

      return;
    }

    setIsValidatingSponsor(true);

    const debounce = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, id_dr")
          .eq("id_dr", currentId)
          .maybeSingle();

        if (error) {
          console.log("Erro ao buscar patrocinador:", error.message);

          setForm((prev) => ({
            ...prev,
            sponsorName: "NÃO ENCONTRADO ❌",
            sponsorUuid: "",
          }));

          return;
        }

        if (!data) {
          setForm((prev) => ({
            ...prev,
            sponsorName: "NÃO ENCONTRADO ❌",
            sponsorUuid: "",
          }));

          return;
        }

        // Patrocinador encontrado.
        setForm((prev) => ({
          ...prev,
          sponsorId: data.id_dr || currentId,
          sponsorName: data.full_name || "PATROCINADOR",
          sponsorUuid: data.id,
        }));
      } catch (error) {
        console.log("Erro inesperado ao buscar patrocinador:", error);

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
  }, [form.sponsorId, routeSponsorId]);

  // ============================================================
  // 7. CONTINUAR PARA PAGAMENTO
  // ============================================================

  const handleContinue = () => {
    // Validação do patrocinador
    if (!form.sponsorUuid) {
      Alert.alert(
        "PATROCINADOR INVÁLIDO",
        "Informe um ID de patrocinador válido antes de continuar."
      );

      return;
    }

    // Nome
    if (!form.fullName.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu nome completo."
      );

      return;
    }

    // CPF
    if (!form.documentId.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu CPF."
      );

      return;
    }

    // E-mail
    if (!form.email.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu e-mail."
      );

      return;
    }

    // WhatsApp
    if (!form.phone.trim()) {
      Alert.alert(
        "DADOS INCOMPLETOS",
        "Informe seu WhatsApp."
      );

      return;
    }

    // Tudo certo.
    navigation.navigate("PaymentScreen", {
      ...form,
    });
  };

  // ============================================================
  // 8. TELA
  // ============================================================

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: theme.bg,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
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
        contentContainerStyle={styles.scrollContent}
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
              {form.sponsorName || "BUSCANDO..."}
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
            ALTERAÇÃO DE PATROCINADOR
        ==================================================== */}

        <TouchableOpacity
          style={styles.changeSponsorInfo}
          onPress={() => {}}
        >
          <Text style={styles.changeSponsorText}>
            Deseja trocar o patrocinador? Altere o ID abaixo:
          </Text>
        </TouchableOpacity>

        <InputField
          label=""
          value={form.sponsorId}
          onChange={(value) =>
            updateForm(
              "sponsorId",
              value.toUpperCase()
            )
          }
        />

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
            form.sponsorName.includes("❌")
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
});