// src/i18n/hooks/useImageUpload.js
// Autor: Edson Vasconcelos | Atualizado em 24 de Jan 2026
// Ajuste: Correção de sintaxe e caminhos para Supabase .ts

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
// ✅ AJUSTE: Sobe dois níveis (de hooks para i18n, de i18n para src) e entra em services
import { supabase } from '../../services/supabase'; 

export const handlePickAndUploadAvatar = async (userId, onUploadSuccess) => {
  try {
    // 1. Solicita permissão de galeria
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso às suas fotos para atualizar o perfil.');
      return;
    }

    // 2. Abre a galeria (Padrão 2026: mediaTypes como array)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const imageAsset = result.assets[0]; 
    const fileExtension = imageAsset.uri.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;

    // 3. Preparar o arquivo para upload via FormData
    const formData = new FormData();
    formData.append('file', {
      uri: imageAsset.uri,
      name: fileName,
      type: `image/${fileExtension}`,
    });

    // 4. Upload para o Supabase Storage (Bucket: avatars)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, formData);

    if (uploadError) throw uploadError;

    // 5. Atualizar o nome do arquivo na tabela 'users' (padrão do projeto)
    const { error: dbError } = await supabase
      .from('users')
      .update({ avatar_url: fileName })
      .eq('id', userId);

    if (dbError) throw dbError;

    // 6. Gerar a URL pública para atualização instantânea na tela
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (onUploadSuccess) {
      onUploadSuccess(publicUrlData.publicUrl);
    }

    Alert.alert('Sucesso', 'Sua foto de perfil foi atualizada com sucesso!');
  } catch (error) {
    console.error('Erro no upload:', error.message);
    Alert.alert('Erro', 'Não foi possível carregar a imagem. Tente novamente.');
  }
};
