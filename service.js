import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  // Cuando tocas "Reproducir" en la notificación o pantalla de bloqueo
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

  // Cuando tocas "Pausa"
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

  // Cuando tocas "Siguiente"
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());

  // Cuando tocas "Anterior"
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  
  // Cuando descartas la notificación para cerrar el reproductor
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());
};