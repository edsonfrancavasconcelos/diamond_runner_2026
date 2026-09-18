
import React, { useEffect, useState, useMemo } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  SafeAreaView, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Image,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';

const PALETTE = { 
  dark: "#0c3c74", 
  gold: "#FFD700", 
  gray: "#a4bccc", 
  white: "#FFFFFF", 
  primary: "#2c94bc"
};

const DIAMOND_APPS = [
  { id: '1', slug: 'fitmommy', name: 'FITMOMMY', icon: 'fitness', image: require('../../assets/images/FitMommy.png') },
  { id: '2', slug: 'artverse', name: 'ARTVERSE', icon: 'color-palette', image: require('../../assets/images/ArtVerse.jpeg') },
  { id: '3', slug: 'bodyslim', name: 'BODY SLIM', icon: 'body', image: require('../../assets/images/BodySlim.jpeg') },
  { id: '4', slug: 'diacare', name: 'DIA CARE', icon: 'heart', image: require('../../assets/images/DiaCare.jpeg') },
  { id: '5', slug: 'distrave', name: 'DISTRAVE', icon: 'bar-chart', image: require('../../assets/images/Distrave.jpeg') },
  { id: '6', slug: 'exonia', name: 'EXONIA', icon: 'bag', image: require('../../assets/images/Exonia.jpeg') },
  { id: '7', slug: 'flulingo', name: 'FLULINGO', icon: 'language', image: require('../../assets/images/FluLingo.jpeg') },
  { id: '8', slug: 'fluxo-financeiro', name: 'FLUXO FINANCEIRO', icon: 'cash', image: require('../../assets/images/FluxoFinaceiro.jpeg') },
  { id: '9', slug: 'glowup', name: 'GLOW UP', icon: 'sparkles', image: require('../../assets/images/GlowUP.jpeg') },
  { id: '10', slug: 'neurovita', name: 'NEUROVITA', icon: 'bulb', image: require('../../assets/images/NeuroVita.jpeg') },
  { id: '11', slug: 'neverend', name: 'NEVEREND', icon: 'infinite', image: require('../../assets/images/NeverEnd.jpeg') },
  { id: '12', slug: 'nightwave', name: 'NIGHTWAVE', icon: 'moon', image: require('../../assets/images/NigthWave.jpeg') },
  { id: '13', slug: 'tdah-focus', name: 'TDAH FOCUS', icon: 'bulb-outline', image: require('../../assets/images/TdahFocus.jpeg') },
  { id: '14', slug: 'vital-a', name: 'VITAL-A', icon: 'pulse', image: require('../../assets/images/Vital-A.jpeg') },
];


export default function DiamondStoreApps() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ status: 'pending', vouchers: 0, type: '' });
  const [enabledApps, setEnabledApps] = useState([]);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('status, voucher_balance, plan_name')
        .eq('id', authUser.id)
        .single();

      const metadataCredit = Number(authUser.user_metadata?.voucher_credit || 0);
      const profileCredit = Number(profile?.voucher_balance || 0);
      
      setUser({
        status: profile?.status ? profile.status.toString().toLowerCase().trim() : 'pending',
        vouchers: metadataCredit > 0 ? metadataCredit : profileCredit,
        type: profile?.plan_name?.toUpperCase() || 'CONSULTOR'
      });
      setEnabledApps(authUser.user_metadata?.enabled_apps || []);
    } catch (e) {
      console.log("Erro Store:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(fetchUserData);
    return () => task.cancel();
  }, []);

  const totalValue = useMemo(() => Number(user.vouchers).toFixed(2), [user.vouchers]);

   const handleDownload = (app) => {
    if (!['active', 'ativo'].includes(user.status)) {
      return Alert.alert("CONTA PENDENTE", "Pague um plano para liberar os módulos.", [
        { text: "VER PLANOS", onPress: () => navigation.navigate("Packages") },
        { text: "FECHAR", style: "cancel" },
      ]);
    }
    navigation.navigate("Dashboard");
  };

  if (loading && !user.type) return <View style={styles.center}><ActivityIndicator color={PALETTE.gold} size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
     
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>ECOSSISTEMA DIAMOND RUNNER</Text>
          <Text style={styles.title}>Sua loja de apps</Text>
          <Text style={styles.subtitle}>Ative recursos dentro do Escritório Virtual, sem novas contas e sem sair do app.</Text>
        </View>
        <Ionicons name="apps" size={42} color={PALETTE.gold} />
      </View>

      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.headerLabel}>CRÉDITO DISPONÍVEL</Text>
          <Text style={styles.headerValue}>R$ {totalValue.replace('.', ',')}</Text>
          <Text style={styles.planLabel}>{user.type} · acesso integrado</Text>
        </View>
        <View style={styles.walletIcon}>
          <Ionicons name="wallet-outline" size={26} color={PALETTE.gold} />
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Módulos disponíveis</Text>
        <Text style={styles.sectionMeta}>{DIAMOND_APPS.length} opções</Text>
      </View>

      <FlatList
        data={DIAMOND_APPS}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const isEnabled = ['active', 'ativo'].includes(user.status) || enabledApps.includes(item.slug);
          return (
            <TouchableOpacity
              style={[styles.appCard, isEnabled && styles.appCardEnabled]}
              onPress={() => isEnabled ? navigation.navigate("Dashboard") : handleDownload(item)}
              activeOpacity={0.86}
            >
              <View style={styles.appTopline}>
                <View style={styles.iconCircle}>
                  <Image source={item.image} style={styles.appLogo} />
                </View>
                {isEnabled && <Ionicons name="checkmark-circle" size={20} color="#57d69a" />}
              </View>
              <Text style={styles.appName}>{item.name}</Text>
              <Text style={styles.appDescription}>Módulo integrado</Text>
              <View style={styles.appFooter}>
                <Text style={styles.appPrice}>{isEnabled ? 'DISPONÍVEL' : 'PLANO NECESSÁRIO'}</Text>
                <Text style={[styles.btnText, isEnabled && styles.btnTextEnabled]}>{isEnabled ? 'USAR' : 'VER PLANOS'}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.dark, padding: 16 },
  center: { flex: 1, backgroundColor: PALETTE.dark, justifyContent: 'center', alignItems: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 20, backgroundColor: '#103f78', marginBottom: 12 },
  heroCopy: { flex: 1, paddingRight: 16 },
  eyebrow: { color: PALETTE.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  title: { color: PALETTE.white, fontSize: 24, fontWeight: '900' },
  subtitle: { color: PALETTE.gray, fontSize: 11, lineHeight: 17, marginTop: 8 },
  balanceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 16, backgroundColor: 'rgba(255,215,0,0.07)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.35)', marginBottom: 24 },
  headerLabel: { color: PALETTE.gray, fontSize: 10, fontWeight: 'bold' },
  headerValue: { color: PALETTE.gold, fontSize: 30, fontWeight: '900', marginTop: 4 },
  planLabel: { color: PALETTE.gray, fontSize: 10, marginTop: 4 },
  walletIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,215,0,0.12)', justifyContent: 'center', alignItems: 'center' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle: { color: PALETTE.white, fontSize: 16, fontWeight: '800' },
  sectionMeta: { color: PALETTE.gray, fontSize: 10 },
  row: { justifyContent: 'space-between' },
  appCard: { 
    width: '48%',
    minHeight: 166,
    backgroundColor: 'rgba(255,255,255,0.055)',
    marginVertical: 6,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  appCardEnabled: { borderColor: 'rgba(87,214,154,0.45)', backgroundColor: 'rgba(87,214,154,0.08)' },
  appTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconCircle: { width: 64, height: 64, borderRadius: 16, backgroundColor: PALETTE.white, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 16 },
  appLogo: { width: '100%', height: '100%', resizeMode: 'cover' },
  appName: { color: '#FFF', fontWeight: '800', fontSize: 11, minHeight: 28 },
  appDescription: { color: PALETTE.gray, fontSize: 9, marginTop: 3 },
  appFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 },
  appPrice: { color: PALETTE.gold, fontSize: 10, fontWeight: '800' },
  btnText: { color: '#FFF', backgroundColor: PALETTE.primary, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, fontSize: 9, fontWeight: '800' },
  btnTextEnabled: { backgroundColor: 'rgba(87,214,154,0.2)', color: '#57d69a' }
});
