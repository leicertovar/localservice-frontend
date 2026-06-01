import api from '@/lib/api'

export interface Mensaje {
  id: number
  emisor_id: string
  receptor_id: string
  contenido?: string
  tipo: 'texto' | 'imagen' | 'video' | 'documento'
  url_archivo?: string
  nombre_archivo?: string
  leido: boolean
  created_at: string
  emisor?: { id: string; nombre: string; apellido?: string }
}

export interface Conversacion {
  usuario: { id: string; nombre: string; apellido?: string }
  ultimo_mensaje: Mensaje
  no_leidos: number
}

/**
 * Obtiene los mensajes de una conversación con otro usuario.
 */
export const obtenerConversacion = async (otroUsuarioId: string): Promise<Mensaje[]> => {
  const { data } = await api.get(`/mensajes/${otroUsuarioId}`)
  return data
}

/**
 * Envía un mensaje de texto o con archivo adjunto.
 */
export const enviarMensaje = async (receptorId: string, contenido?: string, archivo?: File): Promise<Mensaje> => {
  const formData = new FormData()
  formData.append('receptor_id', receptorId)
  if (contenido) formData.append('contenido', contenido)
  if (archivo) formData.append('archivo', archivo)

  const { data } = await api.post('/mensajes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return data
}

/**
 * Lista todas las conversaciones del usuario autenticado.
 */
export const listarConversaciones = async (): Promise<Conversacion[]> => {
  const { data } = await api.get('/conversaciones')
  return data
}
