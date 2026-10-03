// Autor: Edson Vasconcelos | Diamond Runner 2026 | WayPro — experiência de streaming
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect, useState } from "react";
import {
    Image,
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

const PALETTE = {
  primary: "#2c94bc",
  gold: "#FFD700",
  darkBg: "#0c3c74",
  softGray: "#a4bccc",
};

const VIDEO_TITLE = "Diamond Runner";

export default function ProWayScreen() {
  const { theme, isDark } = useTheme();
  const texts = useTexts("proway");
  const styles = createStyles(theme);

  const [playing, setPlaying] = useState(false);

  const player = useVideoPlayer(videoPrincipal, (p) => {
    p.loop = false;
  });

  // Android: dispara o play após o VideoView estar visível e com controles
  useEffect(() => {
    if (playing) player.play();
  }, [playing, player]);

  const handleWatch = () => {
    setPlaying(true);
    player.play();
  };

  const handleClose = () => {
    player.pause();
    player.currentTime = 0;
    setPlaying(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.column}>
          <View style={styles.hero}>
            <Image
              source={require("../../assets/images/logodiamond.png")}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>{texts.screenTitle}</Text>
          </View>

          <View style={styles.playerBox}>
            <VideoView
              player={player}
              style={styles.videoPlayer}
              contentFit="contain"
              surfaceType="textureView"
              allowsFullscreen
              allowsPictureInPicture
              nativeControls={playing}
            />
            {!playing && (
              <TouchableOpacity
                style={styles.poster}
                onPress={handleWatch}
                activeOpacity={0.9}
              >
                <View style={styles.bigPlay}>
                  <Ionicons name="play" size={36} color={PALETTE.darkBg} />
                </View>
                <Text style={styles.posterTitle}>{VIDEO_TITLE}</Text>
              </TouchableOpacity>
            )}
            {playing && (
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Ionicons name="close-circle" size={30} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>{texts.featured}</Text>

          <TouchableOpacity
            style={[styles.courseCard, playing && styles.courseCardActive]}
            onPress={handleWatch}
            activeOpacity={0.88}
          >
            <View style={styles.cardThumb}>
              <Ionicons name="play-circle" size={40} color={PALETTE.gold} />
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.catText}>{texts.featuredVideo}</Text>
              <Text style={styles.courseTitle} numberOfLines={2}>
                {VIDEO_TITLE}
              </Text>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={14} color="#FFF" />
                <Text style={styles.playBtnText}>{texts.watch}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  content: { padding: 16, alignItems: "center", flexGrow: 1 },
  column: { width: "100%", maxWidth: 900 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: PALETTE.darkBg,
    borderWidth: 1,
    borderColor: PALETTE.gold,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    flexShrink: 1,
  },
  playerBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 22,
  },
  videoPlayer: { width: "100%", height: "100%" },
  poster: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: PALETTE.darkBg,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  bigPlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PALETTE.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
    marginBottom: 10,
  },
  posterTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 99,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 12,
    letterSpacing: 1,
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  courseCardActive: { borderColor: PALETTE.gold },
  cardThumb: {
    width: "36%",
    aspectRatio: 16 / 9,
    backgroundColor: PALETTE.darkBg,
    justifyContent: "center",
    alignItems: "center",
  },
  courseInfo: { flex: 1, padding: 12 },
  catText: {
    color: PALETTE.primary,
    fontSize: 9,
    fontWeight: "900",
    marginBottom: 4,
  },
  courseTitle: { color: theme.text, fontSize: 15, fontWeight: "bold" },
  playBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    minHeight: 34,
    backgroundColor: PALETTE.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  playBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 6,
  },
});