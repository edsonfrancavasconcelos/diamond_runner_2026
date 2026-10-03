// Autor: Edson Vasconcelos | Diamond Runner 2026 | Refatorado para expo-video (CORRIGIDO)
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useTheme } from "../../i18n/context/ThemeContext";
import { useTexts } from "../../i18n/hooks/useTexts";

const videoPrincipal = require("../../assets/videos/DIAMONDRUNNER_UP1.mp4");
const { width } = Dimensions.get("window");
const VIDEO_HEIGHT = width * (9 / 16);

const PALETTE = {
  primary: "#2c94bc",
  gold: "#FFD700",
  darkBg: "#0c3c74",
  softGray: "#a4bccc",
};

export default function ProWayScreen() {
  const { theme, isDark } = useTheme();
  const texts = useTexts("proway");
  const styles = createStyles(theme);

  const [currentVideoSource, setCurrentVideoSource] = useState(null);

  // Inicializa o Player. O primeiro parâmetro deve ser o source inicial.
  const player = useVideoPlayer(currentVideoSource, (p) => {
    p.loop = false;
    p.autoplay = true;
  });

  // MONITOR DE TROCA: Sempre que selecionar um vídeo novo, força o player a carregar
  useEffect(() => {
    if (currentVideoSource) {
      player.replace(currentVideoSource);
      player.play();
    }
  }, [currentVideoSource]);

  const handleSelectCourse = (video) => {
    setCurrentVideoSource(video.url);
  };

  const videos = [
    {
      id: "1",
      title: "DIAMONDRUNNER_UP1.mp4",
      url: videoPrincipal,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.topContainer}>
        {currentVideoSource ? (
          <View style={styles.videoBox}>
            <VideoView
              player={player}
              style={styles.videoPlayer}
              allowsFullscreen
              allowsPictureInPicture
              nativeControls={true}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                player.pause();
                setCurrentVideoSource(null);
              }}
            >
              <Ionicons name="close-circle" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="play" size={34} color={PALETTE.gold} />
            </View>
            <Text style={styles.headerTitle}>{texts.screenTitle}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{texts.featured}</Text>

        {videos.map((video) => (
          <TouchableOpacity
            key={video.id}
            style={styles.courseCard}
            onPress={() => handleSelectCourse(video)}
            activeOpacity={0.88}
          >
            <View style={styles.cardThumb}>
              <Ionicons name="play-circle-outline" size={48} color={PALETTE.gold} />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.catText}>{texts.featuredVideo}</Text>
              <Text style={styles.courseTitle}>{video.title}</Text>
            </View>
            <View style={styles.playBtn}>
              <Ionicons name="play" size={16} color="#FFF" />
              <Text style={styles.playBtnText}>{texts.watch}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1 },
  topContainer: {
    width: width,
    height: VIDEO_HEIGHT + 60,
    backgroundColor: theme.bg,
    justifyContent: "center",
  },
  videoBox: { width: "100%", height: VIDEO_HEIGHT + 40 },
  videoPlayer: { width: "100%", height: "100%" },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 99,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconCircle: {
    padding: 15,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: PALETTE.primary,
    marginBottom: 10,
  },
  headerTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  content: { padding: 20 },
  sectionTitle: {
    color: theme.text,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 20,
    letterSpacing: 1,
  },
  courseCard: {
    overflow: "hidden",
    borderRadius: 16,
    marginBottom: 18,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardThumb: {
    width: "100%",
    height: 170,
    backgroundColor: theme.card,
    justifyContent: "center",
    alignItems: "center",
  },
  courseInfo: { paddingHorizontal: 16, paddingTop: 14 },
  catText: {
    color: PALETTE.primary,
    fontSize: 9,
    fontWeight: "900",
    marginBottom: 4,
  },
  courseTitle: { color: theme.text, fontSize: 14, fontWeight: "bold" },
  playBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    minHeight: 38,
    backgroundColor: PALETTE.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    margin: 16,
  },
  playBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 7,
  },
});
