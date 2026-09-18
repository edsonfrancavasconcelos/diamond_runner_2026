// Versão Web: react-native-webview não tem renderer para browser, usamos <iframe>.
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createSSOToken } from '../../services/ssoService';

export default function AppWebViewScreen({ route }) {
  const { app } = route.params;
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const openApp = async () => {
    try {
      const token = await createSSOToken(app.slug);
      const finalUrl = `${app.url}?sso=${token}`;
      setUrl(finalUrl);
    } catch (error) {
      console.log('Erro ao gerar SSO:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    openApp();
  }, []);

  if (loading || !url) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <iframe
      src={url}
      title={app.slug}
      style={{ flex: 1, width: '100%', height: '100%', border: 'none' }}
    />
  );
}
