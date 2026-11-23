import { useEffect, useRef, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher, { type ChannelAuthorizationCallback } from 'pusher-js';
import api from '@/lib/api';
import type { Mensaje } from '@/services/mensajeService';

// Tiempo real con Laravel Reverb (protocolo de Pusher). Una sola conexión por sesión, en el
// canal privado "usuarios.{id}". Si no hay configuración o no conecta, las pantallas siguen
// consultando la API periódicamente (respaldo).

const KEY = import.meta.env.VITE_REVERB_APP_KEY as string | undefined;
const HOST = import.meta.env.VITE_REVERB_HOST as string | undefined;
const PUERTO = Number(import.meta.env.VITE_REVERB_PORT ?? 443);
const TLS = (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https';

type OyenteMensaje = (m: Mensaje) => void;
type OyenteEstado = (conectado: boolean) => void;

let echo: Echo<'reverb'> | null = null;
let usuarioActual: string | null = null;
let conectado = false;
const oyentesMensaje = new Set<OyenteMensaje>();
const oyentesEstado = new Set<OyenteEstado>();

const avisarEstado = (valor: boolean) => {
  conectado = valor;
  oyentesEstado.forEach((o) => o(valor));
};

/** Abre la conexión del usuario (idempotente). Devuelve false si el tiempo real no está configurado. */
export const conectarTiempoReal = (usuarioId: string): boolean => {
  if (!KEY || !HOST || !usuarioId) return false;
  if (echo && usuarioActual === usuarioId) return true;
  desconectarTiempoReal();

  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
  echo = new Echo({
    broadcaster: 'reverb',
    key: KEY,
    wsHost: HOST,
    wsPort: PUERTO,
    wssPort: PUERTO,
    forceTLS: TLS,
    enabledTransports: ['ws', 'wss'],
    // Los canales privados se autorizan con el JWT de la sesión (POST /api/broadcasting/auth)
    authorizer: (canal: { name: string }) => ({
      authorize: (socketId: string, callback: ChannelAuthorizationCallback) => {
        api
          .post('/broadcasting/auth', { socket_id: socketId, channel_name: canal.name })
          .then(({ data }) => callback(null, data))
          .catch((err) => callback(err, null));
      },
    }),
  });
  usuarioActual = usuarioId;

  const pusher = (echo.connector as unknown as { pusher: Pusher }).pusher;
  pusher.connection.bind('state_change', ({ current }: { current: string }) => avisarEstado(current === 'connected'));

  const avisarMensaje = ({ mensaje }: { mensaje: Mensaje }) => oyentesMensaje.forEach((o) => o(mensaje));
  // Mensajes nuevos, editados o eliminados (desde la app): el chat se vuelve a cargar
  echo.private(`usuarios.${usuarioId}`).listen('.mensaje.nuevo', avisarMensaje).listen('.mensaje.actualizado', avisarMensaje);
  return true;
};

/** Cierra la conexión (al cerrar sesión o cambiar de cuenta). */
export const desconectarTiempoReal = () => {
  echo?.disconnect();
  echo = null;
  usuarioActual = null;
  avisarEstado(false);
};

/** Escucha los mensajes nuevos del usuario (de cualquier conversación). */
export const useMensajesEnVivo = (usuarioId: string | undefined, alRecibir: OyenteMensaje) => {
  const ref = useRef(alRecibir);
  ref.current = alRecibir;
  useEffect(() => {
    if (!usuarioId) return;
    conectarTiempoReal(usuarioId);
    const oyente: OyenteMensaje = (m) => ref.current(m);
    oyentesMensaje.add(oyente);
    return () => {
      oyentesMensaje.delete(oyente);
    };
  }, [usuarioId]);
};

/** true mientras la conexión de tiempo real está activa. */
export const useTiempoRealConectado = () => {
  const [valor, setValor] = useState(conectado);
  useEffect(() => {
    oyentesEstado.add(setValor);
    setValor(conectado);
    return () => {
      oyentesEstado.delete(setValor);
    };
  }, []);
  return valor;
};
