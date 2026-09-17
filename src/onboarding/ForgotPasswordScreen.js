// Arquivo: src/onboarding/ForgotPasswordScreen.js
// Atualizado em 26 de Jan 2026 com a Nova Paleta Blue Diamond
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useTheme } from '../i18n/context/ThemeContext';
import Button from '../components/Button';

// NOVA PALETA 2026
const PALETTE = {
  primary: '#2c94bc',   // color1
  light: '#bcdcf4',     // color2
  dark: '#0c3c74',      // color3
  grayBlue: '#647c9c',  // color4
  softGray: '#a4bccc',  // color5
};

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email.includes('@')) {
      Alert.alert('Erro', 'Insira um e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'diamondrunner://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Sucesso',
        'Se este e-mail estiver cadastrado, você receberá um link de recuperação.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <Ionicons name="chevron-back" size={24} color={PALETTE.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>RECUPERAR SENHA</Text>
        <Text style={[styles.subtitle, { color: isDark ? PALETTE.softGray : '#8E8E93' }]}>
          Enviaremos as instruções para o seu e-mail.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: PALETTE.primary }]}>E-MAIL CADASTRADO</Text>
          <TextInput
            style={[styles.input, { borderBottomColor: theme.border, color: theme.text }]}
            placeholder="seu@email.com"
            placeholderTextColor={isDark ? "#444" : "#999"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Button 
          title={loading ? 'ENVIANDO...' : 'ENVIAR LINK'} 
          onPress={handleReset} 
          disabled={loading}
          style={{
            backgroundColor: PALETTE.primary,
            height: 55,
            borderRadius: 14,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          textStyle={{ color: '#FFF', fontWeight: 'bold' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  backBtn: { 
    marginTop: 50, 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1 
  },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
  subtitle: { fontSize: 12, textAlign: 'center', marginTop: 10, marginBottom: 50 },
  inputGroup: { marginBottom: 40 },
  label: { fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
  input: { borderBottomWidth: 1.5, paddingVertical: 12, fontSize: 16 }
});
