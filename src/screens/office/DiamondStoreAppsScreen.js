
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
  Platform,
  View,
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

const PALETTE = { 
  dark: "#0c3c74", 
  gold: "#FFD700", 
  gray: "#a4bccc", 
  white: "#FFFFFF", 
  primary: "#2c94bc"
};

const VOUCHER_VALUE = 39.00;

const DIAMOND_APPS = [
  { id: '1', name: 'DIAMOND CRM', icon: 'people', ios: 'https://apps.apple.com', android: 'https://play.google.com' },
  { id: '2', name: 'BOT TRADER PRO', icon: 'trending-up', ios: 'https://apps.apple.com', android: 'https://play.google.com' },
  { id: '3', name: 'MARKETING AUTO', icon: 'megaphone', ios: 'https://google.com', android: 'https://google.com' },
  { id: '4', name: 'LEAD EXTRACTOR', icon: 'search', ios: 'https://google.com', android: 'https://google.com' },
  { id: '5', name: 'DIAMOND WALLET', icon: 'wallet', ios: 'https://google.com', android: 'https://google.com' },
  { id: '6', name: 'SOCIAL GENERATOR', icon: 'share-social', ios: 'https://google.com', android: 'https://google.com' },
  { id: '7', name: 'ADS MANAGER DR', icon: 'bar-chart', ios: 'https://google.com', android: 'https://google.com' },
  { id: '8', name: 'FUNNEL BUILDER', icon: 'funnel', ios: 'https://google.com', android: 'https://google.com' },
  { id: '9', name: 'DIAMOND MEETING', icon: 'videocam', ios: 'https://google.com', android: 'https://google.com' },
  { id: '10', name: 'TRAINING HUB', icon: 'school', ios: 'https://google.com', android: 'https://google.com' },
];


export default function DiamondStoreApps() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ status: 'pending', vouchers: 0, type: '' });

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('status, voucher_balance, profile_type')
        .eq('id', authUser.id)
        .single();
      
      setUser({
        status: profile?.status ? profile.status.toString().toLowerCase().trim() : 'pending',
        vouchers: profile?.voucher_balance || 0,
        type: profile?.profile_type?.toUpperCase() || 'CONSULTOR'
      });
    } catch (e) {
      console.log("Erro Store:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserData(); }, []);

  const totalValue = useMemo(() => (user.vouchers * VOUCHER_VALUE).toFixed(2), [user.vouchers]);

   const handleDownload = (app) => {
    if (user.status !== 'active') {
      return Alert.alert("CONTA PENDENTE", "Ative sua conta para liberar seus vouchers.");
    }
    if (user.vouchers <= 0) {
      return Alert.alert("SALDO ZERADO", "Você não possui mais vouchers.");
    }

    Alert.alert(
      "RESGATAR ACESSO",
      `Usar 1 voucher (R$ 39,00) para liberar o ${app.name}?`,
      [
        { text: "CANCELAR", style: "cancel" },
        { 
          text: "CONFIRMAR", 
          onPress: () => {
            console.log(">>> Iniciando processo para:", app.name);
            processDownload(app); 
          }
        }
      ]
    );
  };

  const processDownload = async (app) => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error("Usuário não encontrado. Faça login novamente.");
      }
      // AQUI VOCÊ USA O PLATFORM (ele vai ficar colorido agora!)
const urlDestino = Platform.OS === 'ios' ? app.ios : app.android;

if (urlDestino) {
  const supported = await Linking.canOpenURL(urlDestino);
  if (supported) {
    await Linking.openURL(urlDestino);
  } else {
    Alert.alert("SUCESSO", `${app.name} liberado! Link em breve.`);
  }
}


      const novoSaldo = Number(user.vouchers) - 1;

      
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ voucher_balance: novoSaldo })
        .eq('id', authUser.id);

      if (dbError) throw dbError;

    
      setUser(prev => ({ ...prev, vouchers: novoSaldo }));

  
      if (app.url) {
        const canOpen = await Linking.canOpenURL(app.url);
        if (canOpen) {
          await Linking.openURL(app.url);
        } else {
          Alert.alert("Sucesso", `${app.name} liberado! (Link indisponível)`);
        }
      }

    } catch (err) {
      console.error("Erro no resgate:", err.message);
      Alert.alert("Erro", "Não foi possível descontar seu voucher. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };


  if (loading && !user.type) return <View style={styles.center}><ActivityIndicator color={PALETTE.gold} size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
     
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>SALDO EM PRODUTOS ({user.type})</Text>
        <Text style={styles.headerValue}>R$ {totalValue}</Text>
        <View style={styles.voucherBadge}>
            <Text style={styles.voucherText}>{user.vouchers} VOUCHERS DISPONÍVEIS</Text>
        </View>
      </View>

      <FlatList
        data={DIAMOND_APPS}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.appCard} onPress={() => handleDownload(item)}>
            <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={28} color={PALETTE.gold} />
            </View>
            <Text style={styles.appName}>{item.name}</Text>
            <Text style={styles.appPrice}>R$ 39,00</Text>
            <View style={styles.btnFake}><Text style={styles.btnText}>BAIXAR</Text></View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.dark, padding: 10 },
  center: { flex: 1, backgroundColor: PALETTE.dark, justifyContent: 'center', alignItems: 'center' },
  headerCard: { backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: PALETTE.gold, alignItems: 'center', marginBottom: 20, marginTop: 10 },
  headerLabel: { color: PALETTE.gray, fontSize: 10, fontWeight: 'bold' },
  headerValue: { color: PALETTE.gold, fontSize: 36, fontWeight: 'bold' },
  voucherBadge: { backgroundColor: PALETTE.gold, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 5 },
  voucherText: { color: PALETTE.dark, fontWeight: 'bold', fontSize: 10 },
  row: { justifyContent: 'space-around', paddingHorizontal: 5 },
  appCard: { 
    width: '46%', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    marginVertical: 8, 
    padding: 20, 
    borderRadius: 25, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,215,0,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  appName: { color: '#FFF', fontWeight: 'bold', fontSize: 11, textAlign: 'center', height: 30 },
  appPrice: { color: PALETTE.gray, fontSize: 9, marginTop: 5 },
  btnFake: { marginTop: 15, backgroundColor: PALETTE.primary, paddingHorizontal: 15, paddingVertical: 6, borderRadius: 8 },
  btnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});
