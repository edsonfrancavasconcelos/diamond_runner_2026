// Autor: Edson Vasconcelos | Diamond Runner 2026
// Arquivo: src/screens/office/GPSScreen.js

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import * as Location from 'expo-location';

import { useTheme } from '../../i18n/context/ThemeContext';
import { useTexts } from '../../i18n/hooks/useTexts';

const { width } = Dimensions.get('window');

const PALETTE = {
  primary: '#2c94bc',
  success: '#2ecc71',
  error: '#e74c3c',
  dark: '#0c3c74',
  black: '#081c34',
  softGray: '#a4bccc',
};

export default function GPSScreen() {
  const texts = useTexts('office');
  const { theme, isDark } = useTheme();

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  // ANIMAÇÕES
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Radar Pulse
    Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, { toValue: 2.2, duration: 2500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();

    // Rotação da Bússola Decorativa
    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(texts.permissionRequired || 'ACESSO NEGADO');
        setLoading(false);
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setLoading(false);
    })();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? PALETTE.black : theme.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* HEADER DE NAVEGAÇÃO */}
      <View style={styles.header}>
        <Text style={[styles.headerTag, { color: PALETTE.primary }]}>DIAMOND SYSTEM v2.6</Text>
        <Text style={[styles.mainTitle, { color: theme.text }]}>NAVIGATOR</Text>
      </View>

      {/* RADAR TÁTICO */}
      <View style={styles.radarWrapper}>
        {/* Bússola Rotativa Decorativa */}
        <Animated.View style={[styles.compassRing, { transform: [{ rotate: spin }], borderColor: isDark ? 'rgba(44,148,188,0.2)' : '#eee' }]} />
        
        {/* Pulsos de Radar */}
        <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }], opacity: opacityAnim, borderColor: PALETTE.primary }]} />
        <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }], opacity: opacityAnim, borderColor: PALETTE.primary, delay: 1250 }]} />

        <View style={[styles.core, { backgroundColor: isDark ? PALETTE.dark : '#FFF', elevation: 20 }]}>
          {loading ? (
            <ActivityIndicator size="small" color={PALETTE.primary} />
          ) : (
            <Ionicons name="navigate" size={32} color={PALETTE.primary} />
          )}
        </View>
      </View>

      {/* STATUS DO SINAL */}
      <View style={[styles.statusBox, { backgroundColor: errorMsg ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)' }]}>
        <View style={[styles.dot, { backgroundColor: errorMsg ? PALETTE.error : PALETTE.success }]} />
        <Text style={[styles.statusText, { color: errorMsg ? PALETTE.error : PALETTE.success }]}>
          {errorMsg ? errorMsg.toUpperCase() : "CONEXÃO ESTÁVEL (GPS_LOCK)"}
        </Text>
      </View>

      {/* PAINEL DE COORDENADAS */}
      <View style={[styles.telemetryCard, { backgroundColor: theme.card, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#eee' }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="scan" size={16} color={PALETTE.primary} />
          <Text style={[styles.cardHeaderText, { color: theme.text }]}>TELEMETRIA EM TEMPO REAL</Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>LATITUDE</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {location ? location.coords.latitude.toFixed(6) : '0.000000'}
            </Text>
          </View>
          <View style={[styles.dividerVertical, { backgroundColor: theme.border }]} />
          <View style={styles.gridItem}>
            <Text style={styles.label}>LONGITUDE</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {location ? location.coords.longitude.toFixed(6) : '0.000000'}
            </Text>
          </View>
        </View>

        <View style={[styles.grid, { marginTop: 25, borderTopWidth: 0.5, borderTopColor: 'rgba(150,150,150,0.1)', paddingTop: 20 }]}>
          <View style={styles.gridItem}>
            <Text style={styles.label}>ALTITUDE</Text>
            <View style={styles.rowCenter}>
              <Text style={[styles.value, { color: theme.text }]}>{location ? `${Math.round(location.coords.altitude)}` : '0'}</Text>
              <Text style={styles.unit}> M</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.label}>PRECISÃO</Text>
            <View style={styles.rowCenter}>
              <Text style={[styles.value, { color: PALETTE.success }]}>{location ? `${location.coords.accuracy.toFixed(1)}` : '0.0'}</Text>
              <Text style={styles.unit}> ACC</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={[styles.footerText, { color: PALETTE.softGray }]}>© DIAMOND RUNNER GLOBAL TRACKING</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 25, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 20 },
  headerTag: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  mainTitle: { fontSize: 32, fontWeight: '900', letterSpacing: 5, marginTop: 5 },
  
  radarWrapper: { width: width * 0.7, height: width * 0.7, justifyContent: 'center', alignItems: 'center' },
  compassRing: { position: 'absolute', width: '100%', height: '100%', borderRadius: 200, borderWidth: 1, borderStyle: 'dashed' },
  pulseCircle: { position: 'absolute', width: 60, height: 60, borderRadius: 100, borderWidth: 2 },
  core: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', shadowColor: PALETTE.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15 },
  
  statusBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  telemetryCard: { width: '100%', padding: 25, borderRadius: 30, borderWidth: 1, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, opacity: 0.7 },
  cardHeaderText: { fontSize: 9, fontWeight: '900', marginLeft: 10, letterSpacing: 1 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gridItem: { flex: 1, alignItems: 'center' },
  dividerVertical: { width: 1, height: 30, opacity: 0.2 },
  label: { fontSize: 9, fontWeight: 'bold', color: PALETTE.primary, marginBottom: 5, letterSpacing: 1 },
  value: { fontSize: 18, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  rowCenter: { flexDirection: 'row', alignItems: 'baseline' },
  unit: { fontSize: 10, fontWeight: 'bold', opacity: 0.4 },
  footerText: { fontSize: 9, fontWeight: 'bold', marginBottom: 20, opacity: 0.5 }
});
