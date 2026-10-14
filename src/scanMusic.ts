import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

const EXT = ['.mp3', '.m4a', '.flac', '.ogg', '.wav', '.aac', '.opus'];

export async function pedirPermiso(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const permiso =
    Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
  const r = await PermissionsAndroid.request(permiso);
  return r === PermissionsAndroid.RESULTS.GRANTED;
}

async function leerCarpeta(ruta: string, salida: RNFS.ReadDirItem[]) {
  try {
    const items = await RNFS.readDir(ruta);
    for (const it of items) {
      if (it.isDirectory()) {
        await leerCarpeta(it.path, salida);
      } else if (EXT.some((e) => it.name.toLowerCase().endsWith(e))) {
        salida.push(it);
      }
    }
    } catch (e) {
    console.log('No pude leer', ruta, e);
  }
}

export async function buscarCanciones() {
  const base = RNFS.ExternalStorageDirectoryPath;
  const archivos: RNFS.ReadDirItem[] = [];
  await leerCarpeta(`${base}/Music`, archivos);
  await leerCarpeta(`${base}/Download`, archivos);

  return archivos
    .map((f) => ({
      id: f.path,
      url: `file://${f.path}`,
      title: f.name.replace(/\.[^.]+$/, ''),
      artist: 'Desconocido',
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}