// Local: src/screens/office/OfficeDrawer.js
// Status: CICLO DE REQUISIÇÃO E MENU DUPLO CORRIGIDOS

import { Ionicons } from "@expo/vector-icons";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useIsFocused } from "@react-navigation/native";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CountryContext } from "../../i18n/context/CountryContext";
import { officeTexts } from "../../i18n/hooks/texts";
import { supabase } from "../../services/supabase";

// 💎 IMPORTAÇÃO DAS TELAS
import DashboardScreen from "./DashboardScreen";
import EarningsScreen from "./EarningsScreen";
import GPSScreen from "./GPSScreen";
import MarketingPlanScreen from "./MarketingPlanScreen";
import NetworkScreen from "./NetworkScreen";
import NewsScreen from "./NewsScreen";
import PackagesScreen from "./PackagesScreen";
import ProfileScreen from "./ProfileScreen"; // 👈 Certifique-se que esta tela NÃO importa o OfficeDrawer
import ProgressScreen from "./ProgressScreen";
import ProWayScreen from "./ProWayScreen";
import WithdrawScreen from "./WithdrawScreen";
import DiamondStoreApps from "./DiamondStoreAppsScreen";
import SettingsScreen from "./SettingsScreen";
import TermsScreen from "./TermsScreen";
import PrivacyScreen from "./PrivacyScreen";
import AboutScreen from "./AboutScreen";

const PALETTE = {
  primary: "#2c94bc",
  gold: "#FFD700", 
  darkBlue: "#0c3c74",
  lightGray: "#a4bccc",
};

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const isFocused = useIsFocused();
  const [profile, setProfile] = useState({ name: "...", id_dr: "...", avatar_url: null });
  const [loading, setLoading] = useState(true);

  async function fetchProfileData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, id_dr, avatar_url")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile({
            name: data.full_name || "EXECUTIVO",
            id_dr: data.id_dr || "---",
            avatar_url: data.avatar_url,
          });
        }
      }
    } catch (err) {
      console.log("Erro Drawer Profile:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (isFocused) fetchProfileData(); }, [isFocused]);

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: PALETTE.darkBlue }}>
      <TouchableOpacity
        onPress={() => props.navigation.navigate("MyProfile")} // 👈 Nome único para evitar conflito
        style={styles.drawerHeader}
      >
        <View style={[styles.avatarCircle, { borderColor: PALETTE.gold }]}>
          {loading ? (
            <ActivityIndicator color={PALETTE.gold} size="small" />
          ) : profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={30} color={PALETTE.gold} />
          )}
        </View>
        <Text style={styles.userName}>{profile.name.toUpperCase()}</Text>
        <Text style={[styles.userRole, { color: PALETTE.gold }]}>{profile.id_dr}</Text>
      </TouchableOpacity>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function OfficeDrawer() {
  const { country } = useContext(CountryContext);
  const texts = useMemo(() => officeTexts[country?.toUpperCase()] || officeTexts["BR"], [country]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: PALETTE.darkBlue },
        headerTintColor: "#FFF",
        headerTitleStyle: { fontWeight: "900", fontSize: 12, letterSpacing: 2 },
        drawerActiveTintColor: "#FFF",
        drawerActiveBackgroundColor: PALETTE.primary,
        drawerInactiveTintColor: PALETTE.lightGray,
        drawerLabelStyle: { fontSize: 11, fontWeight: "bold" },
        unmountOnBlur: true, // 👈 Limpa a tela ao sair dela, matando menus fantasmas
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: texts.dashboard, drawerIcon: () => <Ionicons name="grid-outline" size={20} color={PALETTE.gold}/> }} />
      
      {/* 🚀 ROTA DE PERFIL ÚNICA E ESCONDIDA */}
      <Drawer.Screen 
        name="MyProfile" 
        component={ProfileScreen} 
        options={{ 
            drawerItemStyle: { display: 'none' },
            title: texts.viewProfile || "MEU PERFIL"
        }} 
      />

      <Drawer.Screen name="Network" component={NetworkScreen} options={{ title: texts.network, drawerIcon: () => <Ionicons name="people-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="DiamondStore" component={DiamondStoreApps} options={{ title: "DIAMOND STORE", drawerIcon: () => <Ionicons name="cart-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: texts.earnings, drawerIcon: () => <Ionicons name="wallet-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="Withdraw" component={WithdrawScreen} options={{ title: texts.withdraw, drawerIcon: () => <Ionicons name="cash-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="Packages" component={PackagesScreen} options={{ title: texts.packages, drawerIcon: () => <Ionicons name="diamond-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="MarketingPlan" component={MarketingPlanScreen} options={{ title: "PLANO DE MARKETING", drawerIcon: () => <Ionicons name="document-text-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="GPS" component={GPSScreen} options={{ title: texts.gps, drawerIcon: () => <Ionicons name="map-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="Progress" component={ProgressScreen} options={{ title: texts.progress, drawerIcon: () => <Ionicons name="trending-up-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="ProWay" component={ProWayScreen} options={{ title: texts.proway, drawerIcon: () => <Ionicons name="school-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen name="News" component={NewsScreen} options={{ title: texts.news, drawerIcon: () => <Ionicons name="newspaper-outline" size={20} color={PALETTE.gold}/> }} />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "CONFIGURAÇÕES",
          drawerIcon: () => (
            <Ionicons name="settings-outline" size={20} color={PALETTE.gold} />
          ),
        }}
      />
      <Drawer.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          title: "TERMOS DE USO",
          drawerIcon: () => (
            <Ionicons name="document-text-outline" size={20} color={PALETTE.gold} />
          ),
        }}
      />
      <Drawer.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{
          title: "PRIVACIDADE",
          drawerIcon: () => (
            <Ionicons name="lock-closed-outline" size={20} color={PALETTE.gold} />
          ),
        }}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: "SOBRE / EMPRESA",
          drawerIcon: () => (
            <Ionicons name="business-outline" size={20} color={PALETTE.gold} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Logout" 
        component={View} 
        listeners={({ navigation }) => ({
          focus: () => {
            Alert.alert(
              texts.logout || "Sair", 
              texts.logoutConfirm || "Deseja realmente sair?",
              [
                { text: "Não", onPress: () => navigation.navigate("Dashboard") },
                { text: "Sim", onPress: async () => await supabase.auth.signOut() }
              ]
            );
          }
        })}
        options={{ 
          title: texts.logout || "SAIR", 
          drawerIcon: () => <Ionicons name="log-out-outline" size={20} color={PALETTE.gold}/> 
        }} 
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: { 
    padding: 25, 
    borderBottomWidth: 1, 
    borderBottomColor: "rgba(255,255,255,0.1)", 
    marginBottom: 10,
    alignItems: 'center', 
    justifyContent: 'center'
  },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, justifyContent: "center", alignItems: "center", marginBottom: 12, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  userName: { color: "#FFF", fontWeight: "bold", fontSize: 14, textAlign: 'center' },
  userRole: { fontSize: 11, fontWeight: "bold", marginTop: 2, textAlign: 'center' },
});
