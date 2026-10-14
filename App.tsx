import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import TrackPlayer, { State, usePlaybackState, Capability } from 'react-native-track-player';
import RNFS from 'react-native-fs';

export default function App() {
  const playbackState = usePlaybackState();
  const [songs, setSongs] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  useEffect(() => {
    const initPlayerAndScan = async () => {
      try {
        await TrackPlayer.setupPlayer();
        
        // Configuración para la pantalla de bloqueo y notificaciones
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          compactCapabilities: [Capability.Play, Capability.Pause],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
        });
      } catch (e) {
        // Ya inicializado
      }
      scanMusic();
    };
    initPlayerAndScan();
  }, []);

  const scanMusic = async () => {
    // Carpetas comunes en Android
    const dirsToScan = [
      `${RNFS.ExternalStorageDirectoryPath}/Music`,
      `${RNFS.ExternalStorageDirectoryPath}/Download`
    ];

    let foundSongs: any[] = [];

    for (const dir of dirsToScan) {
      try {
        const files = await RNFS.readDir(dir);
        const audioFiles = files.filter(f => f.name.endsWith('.mp3'));
        
        const mappedSongs = audioFiles.map((file) => ({
          id: file.path,
          url: `file://${file.path}`,
          title: file.name.replace('.mp3', ''),
          artist: 'Local',
        }));
        
        foundSongs = [...foundSongs, ...mappedSongs];
      } catch (err) {
        console.log(`No se pudo leer el directorio: ${dir}`);
      }
    }

    setSongs(foundSongs);
    if (foundSongs.length > 0) {
      await TrackPlayer.reset();
      await TrackPlayer.add(foundSongs);
    }
  };

  const playSong = async (track: any, index: number) => {
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
    setCurrentTrack(track.title);
  };

  const togglePlayback = async () => {
    const current = await TrackPlayer.getState();
    if (current === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>Mi Música</Text>
      
      <View style={styles.card}>
        <Text style={styles.trackName}>
          {currentTrack ? currentTrack : "Nada reproduciéndose"}
        </Text>
        <Button 
          title={playbackState.state === State.Playing ? "Pausar" : "Reproducir"} 
          onPress={togglePlayback} 
          disabled={!currentTrack}
        />
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.songItem} onPress={() => playSong(item, index)}>
            <Text style={styles.songTitle}>{item.title}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{color: 'gray', textAlign: 'center'}}>Buscando música o carpeta vacía...</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#121212' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20 },
  card: { padding: 20, backgroundColor: '#1e1e1e', borderRadius: 10, marginBottom: 20 },
  trackName: { color: '#1db954', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  songItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  songTitle: { color: '#fff', fontSize: 16 }
});