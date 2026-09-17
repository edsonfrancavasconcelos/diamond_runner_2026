// Local: src/onboarding/PaymentScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useMemo } from "react";
import { ActivityIndicator, Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View, Modal, Image, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import axios from "axios";
import { useTheme } from "../i18n/context/ThemeContext";
import { supabase } from "../services/supabase";

const PALETTE = {
  primary: "#2c94bc",
  dark: "#0c3c74",
  gold: "#FFD700",
  success: "#4CAF50"
};

const ASAAS_API_KEY = process.env.EXPO_PUBLIC_ASAAS_API_KEY;
const ASAAS_URL = 'https://sandbox.asaas.com';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [showPix, setShowPix] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [qrCodeBase64, setQrCodeBase64] = useState("");

  const params = route.params || {};
  const { type, fullName, email, documentId, whatsapp, sponsorUuid, amount } = params;

  const planInfo = useMemo(() => {
    const t = type?.toLowerCase() || "";
    if (t.includes("elite")) return { name: "ELITE", price: 1599.0, vouchers: 30 };
    if (t.includes("prime")) return { name: "PRIME", price: 799.0, vouchers: 15 };
    if (t.includes("builder")) return { name: "BUILDER", price: 299.0, vouchers: 7 };
    return { name: "DISTRIBUIDOR", price: amount || 99.0, vouchers: 0 };
  }, [type, amount]);

  // FUNÇÃO 1: GERAR PIX REAL (ASAAS)
  async function handleGeneratePix() {
    if (loading) return;
    setLoading(true);

    try {
      const cleanEmail = email?.trim().toLowerCase();
      const cleanCPF = documentId?.replace(/\D/g, '');

      // 1. Criar/Verificar Cliente no Asaas
      const customerRes = await axios.post(`${ASAAS_URL}/customers`, {
        name: fullName, email: cleanEmail, cpfCnpj: cleanCPF
      }, { headers: { access_token: ASAAS_API_KEY } });

      // 2. Criar Cobrança
      const paymentRes = await axios.post(`${ASAAS_URL}/payments`, {
        customer: customerRes.data.id,
        billingType: "PIX",
        value: planInfo.price,
        dueDate: new Date().toISOString().split('T')[0],
        description: `Diamond Runner - ${planInfo.name}`
      }, { headers: { access_token: ASAAS_API_KEY } });

      // 3. Pegar QR Code
      const qrRes = await axios.get(`${ASAAS_URL}/payments/${paymentRes.data.id}/pixQrCode`, {
        headers: { access_token: ASAAS_API_KEY }
      });

      setPixCode(qrRes.data.payload);
      setQrCodeBase64(qrRes.data.encodedImage);
      setShowPix(true);
    } catch (error) {
      Alert.alert("Erro Asaas", error.response?.data?.errors?.[0]?.description || "Falha ao gerar PIX");
    } finally {
      setLoading(false);
    }
  }


// Local: src/onboarding/PaymentScreen.js
// Ajuste para redirecionar para FirstAccessScreen após ativação

async function handleForcedActivation() {
  if (loading) return;
  setLoading(true);

  try {
    const cleanEmail = email?.trim().toLowerCase();
    const cleanCPF = documentId?.replace(/\D/g, '');
    
    console.log("Iniciando Ativação e Redirecionando para Primeiro Acesso:", cleanEmail);

    // 1. TENTA O SIGNUP (AUTH) - Cria a conta no banco
    // Usamos uma senha aleatória que será resetada no FirstAccess
    const tempPassword = "DR" + Math.random().toString(36).slice(-8) + "!";
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: tempPassword, 
      options: {
        data: {
          full_name: fullName,
          whatsapp: whatsapp,
          document_id: cleanCPF,
          sponsor_id: sponsorUuid,
          profile_type: planInfo.name.toLowerCase(),
          status: 'active' // O Trigger vai ler isso aqui
        }
      }
    });

    // Se o erro for 'User already registered', ele já existe, então só levamos para o FirstAccess
    if (authError && !authError.message.includes("already registered")) {
        throw authError;
    }

    // 2. FORÇA O UPDATE NO PERFIL (Garantia extra se o Trigger demorar)
    // Isso garante que o status esteja 'active' antes dele tentar logar no FirstAccess
    await supabase
      .from("profiles")
      .update({
        status: 'active',
        payment_status: 'CONFIRMED'
      })
      .eq('email', cleanEmail);

    // 3. REDIRECIONAMENTO CORRETO
    // IMPORTANTE: Passamos o e-mail para a próxima tela para ele não ter que digitar de novo
    Alert.alert("PAGAMENTO CONFIRMADO", "Sua conta foi ativada! Vamos configurar sua senha de acesso agora.", [
      { 
        text: "DEFINIR MINHA SENHA", 
        onPress: () => navigation.replace("FirstAccess", { 
            email: cleanEmail,
            isNewUser: true 
        }) 
      }
    ]);

  } catch (error) {
    console.error("Erro no Fluxo de Ativação:", error);
    Alert.alert("FALHA NA ATIVAÇÃO", error.message);
  } finally {
    setLoading(false);
  }
}


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Ionicons name="diamond" size={60} color={PALETTE.gold} />
        <Text style={styles.title}>FINALIZAR ATIVAÇÃO</Text>
        <Text style={styles.planName}>{planInfo.name}</Text>
        <Text style={styles.priceText}>R$ {planInfo.price.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.payButton} onPress={handleGeneratePix} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>GERAR PIX (ASAAS)</Text>}
        </TouchableOpacity>

        <View style={styles.sandboxDivider}>
          <Text style={styles.sandboxLabel}>AMBIENTE DE TESTE</Text>
          <TouchableOpacity style={[styles.payButton, {backgroundColor: PALETTE.success}]} onPress={handleForcedActivation} disabled={loading}>
            <Text style={styles.btnText}>JÁ PAGUEI / ATIVAR MANUAL</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showPix} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>PAGUE COM PIX</Text>
             {qrCodeBase64 && <Image source={{ uri: `data:image/png;base64,${qrCodeBase64}` }} style={styles.qrImg} />}
             <TouchableOpacity style={styles.copyBtn} onPress={() => Clipboard.setStringAsync(pixCode)}>
                <Text style={styles.btnText}>COPIAR CÓDIGO PIX</Text>
             </TouchableOpacity>
             <TouchableOpacity style={{marginTop: 20}} onPress={() => setShowPix(false)}>
                <Text style={{color: '#666'}}>FECHAR</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: PALETTE.dark, padding: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 10 },
  planName: { color: PALETTE.primary, fontSize: 16, fontWeight: 'bold' },
  priceText: { color: PALETTE.gold, fontSize: 40, fontWeight: '900', marginTop: 10 },
  payButton: { backgroundColor: PALETTE.primary, padding: 20, borderRadius: 15, alignItems: 'center', width: '100%' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  sandboxDivider: { marginTop: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20, width: '100%' },
  sandboxLabel: { color: PALETTE.gold, fontSize: 10, textAlign: 'center', marginBottom: 15, letterSpacing: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', padding: 30, borderRadius: 20, alignItems: 'center', width: '85%' },
  modalTitle: { fontWeight: 'bold', marginBottom: 20, fontSize: 18 },
  qrImg: { width: 200, height: 200, marginBottom: 20 },
  copyBtn: { backgroundColor: PALETTE.dark, padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' }
});
