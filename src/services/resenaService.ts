import api from '@/lib/api'

export interface Resena {
  id: number
  cliente_id: string
  proveedor_id: string
  solicitud_id?: number
  calificacion: number
  comentario: string
  respuesta_proveedor?: string
  esta_reportada: boolean
  motivo_reporte?: string
  esta_ocultada: boolean
  created_at: string
  cliente?: { id: string; nombre: string; apellido?: string }
}

/**
 * Lista las reseñas públicas de un proveedor.
 */
export const obtenerResenas = async (proveedorId: string): Promise<Resena[]> => {
  const { data } = await api.get(`/proveedores/${proveedorId}/resenas`)
  return data
}

/**
 * El cliente crea una reseña.
 */
export const crearResena = async (datos: {
  proveedor_id: string
  solicitud_id?: number
  calificacion: number
  comentario: string
}): Promise<Resena> => {
  const { data } = await api.post('/resenas', datos)
  return data.resena
}

/**
 * El proveedor responde a una reseña.
 */
export const responderResena = async (id: number, respuesta: string): Promise<void> => {
  await api.post(`/resenas/${id}/responder`, { respuesta })
}

/**
 * Reporta una reseña como inapropiada.
 */
export const reportarResena = async (id: number, motivo: string): Promise<void> => {
  await api.post(`/resenas/${id}/reportar`, { motivo })
}

/**
 * Admin: Obtiene todas las reseñas reportadas.
 */
export const obtenerResenasReportadas = async (): Promise<Resena[]> => {
  const { data } = await api.get('/admin/resenas-reportadas')
  return data
}

/**
 * Admin: Oculta o restaura una reseña.
 */
export const moderarResena = async (id: number, accion: 'ocultar' | 'restaurar'): Promise<void> => {
  await api.patch(`/admin/resenas/${id}/moderar`, { accion })
}

/**
 * Admin: Elimina definitivamente una reseña.
 */
export const eliminarResena = async (id: number): Promise<void> => {
  await api.delete(`/admin/resenas/${id}`)
}

/** Distribución IQR de las calificaciones de un proveedor (para el diagrama de caja). */
export interface DistribucionCalificaciones {
  q1: number
  q3: number
  iqr: number
  inferior: number
  superior: number
  n: number
}

export interface ResenaAtipica extends Resena {
  es_atipica: boolean
  revision_atipica: 'conservar' | 'excluir' | null
  proveedor?: { id: string; nombre: string; apellido?: string }
  solicitud?: {
    id: number
    descripcion: string
    fecha: string
    estado: string
    confirmacion_cliente?: string | null
    queja_cliente?: string | null
  } | null
  distribucion: DistribucionCalificaciones | null
}

/**
 * Admin: calificaciones atípicas (método IQR), fuera del promedio hasta revisarlas.
 */
export const obtenerResenasAtipicas = async (
  estado: 'pendientes' | 'revisadas' | 'todas' = 'pendientes'
): Promise<ResenaAtipica[]> => {
  const { data } = await api.get('/admin/resenas-atipicas', { params: { estado } })
  return data
}

/**
 * Admin: conservar (vuelve a contar en el promedio) o excluir una calificación atípica.
 */
export const revisarResenaAtipica = async (id: number, decision: 'conservar' | 'excluir'): Promise<void> => {
  await api.patch(`/admin/resenas/${id}/atipica`, { decision })
}
