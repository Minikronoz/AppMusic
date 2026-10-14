import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
  useActiveTrack,
} from 'react-native-track-player';
import { buscarCanciones, pedirPermiso } from './src/scanMusic';

export default function App() {
  const [canciones, setCanciones] = useState<any[]>([]);
  const estado = usePlaybackState();
  const actual = useActiveTrack();

  useEffect(() => {
    (async () => {
      try {
        await TrackPlayer.setupPlayer();
      } catch {
        // ya estaba inicializado (por recarga rápida)
      }
      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
      });
      if (await pedirPermiso()) {
        setCanciones(await buscarCanciones());
      }
    })();
  }, []);

  const reproducir = async (indice: number) => {
    await TrackPlayer.reset();
    await TrackPlayer.add(canciones);
    await TrackPlayer.skip(indice);
    await TrackPlayer.play();
  };

  const sonando = estado.state === State.Playing;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root}>
        <Text style={s.titulo}>Mi música</Text>
        <Text style={{ color: '#888', paddingHorizontal: 16 }}>
          Encontradas: {canciones.length}
        </Text>
        <FlatList
          data={canciones}
          keyExtractor={(c) => c.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={s.fila} onPress={() => reproducir(index)}>
              <Text style={[s.texto, actual?.id === item.id && s.activa]} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />
        <View style={s.barra}>
          <Text style={s.texto} numberOfLines={1}>{actual?.title ?? 'Nada sonando'}</Text>
          <View style={s.controles}>
            <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()}><Text style={s.btn}>⏮</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => (sonando ? TrackPlayer.pause() : TrackPlayer.play())}>
              <Text style={s.btn}>{sonando ? '⏸' : '▶️'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => TrackPlayer.skipToNext()}><Text style={s.btn}>⏭</Text></TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#121212' },
  titulo: { color: '#fff', fontSize: 24, fontWeight: '700', padding: 16 },
  fila: { paddingVertical: 14, paddingHorizontal: 16 },
  texto: { color: '#ddd', fontSize: 16 },
  activa: { color: '#1db954', fontWeight: '700' },
  barra: { padding: 16, backgroundColor: '#1e1e1e' },
  controles: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 8 },
  btn: { fontSize: 28, color: '#fff' },
});