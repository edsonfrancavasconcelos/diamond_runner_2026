// src/i18n/hooks/useImageUpload.js

import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { supabase } from "../../services/supabase";

export const handlePickAndUploadAvatar = async (userId, onUploadSuccess) => {
  try {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso às suas fotos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled) return;

    const imageAsset = result.assets[0];

    const extension = imageAsset.uri.split(".").pop();

    const fileName = `${userId}/avatar_${Date.now()}.${extension}`;


    const formData = new FormData();

    formData.append("file", {
      uri: imageAsset.uri,
      name: fileName,
      type: `image/${extension}`,
    });


    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, formData, {
        upsert: true,
      });


    if (uploadError) throw uploadError;


    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);


    const publicUrl = data.publicUrl;


    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", userId);


    if (dbError) throw dbError;


    if (onUploadSuccess) {
      onUploadSuccess(publicUrl);
    }


    Alert.alert(
      "Sucesso",
      "Sua foto de perfil foi atualizada!"
    );


  } catch (error) {
    console.log("Erro upload avatar:", error);
    Alert.alert(
      "Erro",
      "Não foi possível atualizar sua foto."
    );
  }
};