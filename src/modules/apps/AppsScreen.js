import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { supabase } from '../../services/supabase';

export default function AppsScreen() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApps = async () => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('active', true);

      if (error) {
        console.log('Erro ao buscar apps:', error);
        return;
      }

      setApps(data || []);
    } catch (err) {
      console.log('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 18 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
