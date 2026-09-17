// Local: src/screens/office/AppsScreen.js
// Status: INTEGRADO COM SUPABASE + DESIGN PREMIUM 2026

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

// 💎 IMPORTA O SUPABASE (Substituindo a api antiga)
import { supabase } from '../../services/supabase';

export default function AppsScreen() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      setLoading(true);
      // 💎 BUSCA DIRETA NA TABELA APPS QUE VOCÊ CRIOU
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('active', true)
        .order('id', { ascending: true });

      if (error) throw error;
      setApps(data || []);
    } catch (error) {
      console.log('Erro ao carregar apps via Supabase', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => item.url && Linking.openURL(item.url)}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>
        <Ionicons name={item.icon || "cube-outline"} size={28} color="#FFD700" />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.title}>{item.name.toUpperCase()}</Text>
        <Text style={styles.slug}>/{item.slug}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#2c94bc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2c94bc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ECOSSISTEMA DIAMOND</Text>
        <Text style={styles.headerSubtitle}>APLICATIVOS DISPONÍVEIS</Text>
      </View>

      <FlatList
        data={apps}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum app cadastrado no banco.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c3c74', // Azul Marinho Profundo
    padding: 16
  },
  header: {
    marginBottom: 20,
    paddingLeft: 4
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1
  },
  headerSubtitle: {
    color: '#2c94bc',
    fontSize: 10,
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(44, 148, 188, 0.2)'
  },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(44, 148, 188, 0.15)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  info: {
    flex: 1
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF'
  },
  slug: {
    fontSize: 11,
    color: '#a4bccc',
    marginTop: 2
  },
  emptyText: {
    color: '#a4bccc',
    textAlign: 'center',
    marginTop: 40
  }
});
