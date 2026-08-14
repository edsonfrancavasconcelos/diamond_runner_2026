// Local: src/screens/office/NetworkScreen.js
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { 
  StatusBar, StyleSheet, Text, TouchableOpacity, 
  View, ActivityIndicator, Alert, SafeAreaView, Image 
} from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';

const PALETTE = {
  primary: '#2c94bc',
  dark: '#0c3c74',
  gold: '#FFD700', 
  success: '#2ecc71',
  error: '#e74c3c',
  white: '#FFFFFF',
  gray: '#a4bccc'
};

const NetworkNode = ({ member, isRoot = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleNode = async () => {
    if (!isOpen && children.length === 0) {
      setLoading(true);
      try {
       const { data, error } = await supabase
  .from('profiles')
  .select('id, full_name, status, profile_type, id_dr, avatar_url')
  .eq('sponsor_id', member.id)
  .order('full_name', { ascending: true });

console.log("REDE DO MEMBRO:", member.id);
console.log("FILHOS ENCONTRADOS:", data);
console.log("ERRO REDE:", error);

        if (error) throw error;
        setChildren(data || []);
      } catch (err) {
        Alert.alert("Erro", "Falha ao carregar rede.");
      } finally {
        setLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.nodeContainer}>
      <View style={styles.nodeWrapper}>
        {!isRoot && <View style={styles.verticalLineTop} />}
        
        <TouchableOpacity 
          onPress={toggleNode}
          activeOpacity={0.9}
          style={[
            styles.memberCard, 
          {
 borderColor:
   member.status?.toUpperCase() === 'ATIVO'
     ? PALETTE.success
     : PALETTE.error
}
          ]}
        >
          {/* AVATAR COM FOTO OU ÍCONE */}
          <View style={[styles.avatar, isRoot && styles.avatarRoot]}>
            {member.avatar_url ? (
              <Image source={{ uri: member.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={18} color={PALETTE.gold} />
            )}
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {member.full_name?.split(' ')[0].toUpperCase()}
          </Text>
          
          <View style={styles.idBadge}>
            <Text style={styles.idText}>{member.id_dr}</Text>
          </View>

          <View style={styles.statusIndicator}>
             {loading ? (
               <ActivityIndicator size="small" color={PALETTE.gold} />
             ) : (
               <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={14} color={PALETTE.gray} />
             )}
          </View>
        </TouchableOpacity>

        {isOpen && children.length > 0 && <View style={styles.verticalLineBottom} />}
      </View>

      {isOpen && children.length > 0 && (
        <View style={styles.childrenWrapper}>
          {children.map((child, index) => (
            <View key={child.id} style={styles.childBranch}>
              <View style={[
                styles.horizontalLine, 
                index === 0 && children.length > 1 && styles.horizontalLineRight, 
                index === children.length - 1 && children.length > 1 && styles.horizontalLineLeft,
                children.length === 1 && { width: 0 }
              ]} />
              <NetworkNode member={child} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function NetworkScreen() {
  const navigation = useNavigation();
  const [rootMember, setRootMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    async function loadInitial() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
   const { data } = await supabase
  .from('profiles')
  .select('id, full_name, status, profile_type, id_dr, avatar_url, sponsor_id')
  .eq('id', user.id)
  .single();
        setRootMember(data);
      }
      setLoading(false);
    }
    loadInitial();
  }, []);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => { scale.value = savedScale.value * e.scale; })
    .onEnd(() => { savedScale.value = scale.value; });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const resetPosition = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: PALETTE.dark }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={{marginLeft: 10, flex: 1}}>
            <Text style={styles.headerTitle}>REDE DIAMOND</Text>
            <Text style={{color: PALETTE.gray, fontSize: 10, fontWeight: '600'}}>FEV 2026 • GESTÃO ATIVA</Text>
          </View>
          <TouchableOpacity onPress={resetPosition} style={styles.resetBtn}>
            <Ionicons name="locate" size={22} color={PALETTE.gold} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={PALETTE.gold} /></View>
        ) : (
          <View style={styles.canvasContainer}>
            <GestureDetector gesture={composed}>
              <Animated.View style={[styles.canvas, animatedStyle]}>
                <View style={styles.treeRoot}>
                  {rootMember && <NetworkNode member={rootMember} isRoot={true} />}
                </View>
              </Animated.View>
            </GestureDetector>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#0a2e5a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,215,0,0.2)'
  },
  headerTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  resetBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  
  canvasContainer: { flex: 1, backgroundColor: '#081f3d' },
  canvas: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 60 },
  treeRoot: { alignItems: 'center', minWidth: 2000 },

  nodeContainer: { alignItems: 'center' },
  nodeWrapper: { alignItems: 'center', width: 180 },
  memberCard: { 
    width: 140, 
    backgroundColor: '#11407c', 
    padding: 15, 
    borderRadius: 24, 
    borderWidth: 2, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: PALETTE.dark, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden'
  },
  avatarRoot: { borderColor: PALETTE.gold, borderWidth: 3 },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  name: { color: '#FFF', fontWeight: '900', fontSize: 11, marginBottom: 4, letterSpacing: 0.5 },
  idBadge: { backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  idText: { color: PALETTE.gold, fontSize: 9, fontWeight: 'bold' },
  statusIndicator: { marginTop: 8 },

  verticalLineTop: { width: 2, height: 30, backgroundColor: 'rgba(164, 188, 204, 0.3)' },
  verticalLineBottom: { width: 2, height: 30, backgroundColor: 'rgba(164, 188, 204, 0.3)' },
  horizontalLine: { height: 2, backgroundColor: 'rgba(164, 188, 204, 0.3)', position: 'absolute', top: 0, width: '100%' },
  horizontalLineLeft: { left: '50%', width: '50%' },
  horizontalLineRight: { right: '50%', width: '50%' },
  
  childrenWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
  childBranch: { alignItems: 'center', position: 'relative' }
});
