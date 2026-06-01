import api from '@/lib/api'

export interface Notificacion {
  id: number
  usuario_id: string
  tipo: 'solicitud' | 'mensaje' | 'resena' | 'pago' | 'sistema' | 'verificacion'
  titulo: string
  descripcion: string
  leida: boolean
  enlace?: string
  created_at: string
}

/**
 * Obtiene las notificaciones del usuario autenticado.
 */
export const obtenerNotificaciones = async (): Promise<{ notificaciones: Notificacion[]; no_leidas: number }> => {
  const { data } = await api.get('/notificaciones')
  return data
}

/**
 * Marca todas las notificaciones como leídas.
 */
export const marcarTodasLeidas = async (): Promise<void> => {
  await api.post('/notificaciones/leer-todas')
}

/**
 * Marca una notificación específica como leída.
 */
export const marcarLeida = async (id: number): Promise<void> => {
  await api.patch(`/notificaciones/${id}/leer`)
}
