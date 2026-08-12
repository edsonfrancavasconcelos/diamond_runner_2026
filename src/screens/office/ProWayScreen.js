// Autor: Edson Vasconcelos | Diamond Runner 2026 | Refatorado para expo-video (CORRIGIDO)
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useContext, useEffect } from 'react';
import { 
  ScrollView, 
  StatusBar, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Dimensions,
  Image 
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

import { CountryContext } from '../../i18n/context/CountryContext';
import * as AllTexts from '../../i18n/hooks/texts';

const videoPrincipal = require('../../assets/videos/DIAMONDRUNNER_UP.mp4');
const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = width * (9 / 16); 

const PALETTE = {
  primary: '#2c94bc',
  darkBg: '#0c3c74',
  softGray: '#a4bccc',
};

export default function ProWayScreen() {
  const { country = 'BR' } = useContext(CountryContext) || {};
  const t = AllTexts.prowayTexts?.[country] || AllTexts.prowayTexts?.BR || {};

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

  const handleSelectCourse = (course) => {
    setCurrentVideoSource(course.url);
  };

  const courses = [
    { 
      id: '1', 
      title: t.course1 || 'Diamond Mindset 2026', 
      url: videoPrincipal, 
      thumbnail: 'https://images.unsplash.com',
      category: 'MINDSET',
    },
    { 
      id: '2', 
      title: t.course2 || 'Sales Strategy 2.0', 
      url: 'https://d23dyxeqlo5psv.cloudfront.net',
      thumbnail: 'https://images.unsplash.com',
      category: 'BUSINESS',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.darkBg }}>
      <StatusBar barStyle="light-content" />

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
                <Ionicons name="school" size={40} color={PALETTE.primary} />
             </View>
             <Text style={styles.headerTitle}>{(t.academy || 'PROWAY ACADEMY').toUpperCase()}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{(t.trainings || 'TREINAMENTOS').toUpperCase()}</Text>
        
        {courses.map((course) => (
          <TouchableOpacity 
            key={course.id} 
            style={styles.courseCard} 
            onPress={() => handleSelectCourse(course)}
          >
            <Image source={{ uri: course.thumbnail }} style={styles.cardThumb} />
            <View style={styles.courseInfo}>
              <Text style={styles.catText}>{course.category}</Text>
              <Text style={styles.courseTitle}>{course.title}</Text>
            </View>
            <View style={styles.playBtn}>
              <Ionicons name="play" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topContainer: { width: width, height: VIDEO_HEIGHT + 60, backgroundColor: '#000', justifyContent: 'center' },
  videoBox: { width: '100%', height: VIDEO_HEIGHT + 40 },
  videoPlayer: { width: '100%', height: '100%' },
  closeBtn: { position: 'absolute', top: 10, right: 20, zIndex: 99, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  header: { alignItems: 'center', justifyContent: 'center' },
  iconCircle: { padding: 15, borderRadius: 50, borderWidth: 1, borderColor: PALETTE.primary, marginBottom: 10 },
  headerTitle: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 3 },
  content: { padding: 20 },
  sectionTitle: { color: '#FFF', fontSize: 11, fontWeight: '900', marginBottom: 20, letterSpacing: 1 },
  courseCard: { 
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, 
    marginBottom: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  cardThumb: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#1a1a1a' },
  courseInfo: { flex: 1, marginLeft: 15 },
  catText: { color: PALETTE.primary, fontSize: 9, fontWeight: '900', marginBottom: 4 },
  courseTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  playBtn: { width: 35, height: 35, borderRadius: 18, backgroundColor: PALETTE.primary, justifyContent: 'center', alignItems: 'center' },
});
