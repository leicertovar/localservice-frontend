import api from '@/lib/api'

/** Foto de una reseña o de un servicio (rutas /storage/... del backend). */
export interface Foto {
  id: number
  ruta: string
  orden?: number
  /** El administrador la ocultó tras una denuncia. */
  esta_ocultada?: boolean
}

export type TipoFoto = 'resena' | 'servicio'

/** Máximo de fotos por reseña o por servicio. */
export const MAX_FOTOS = 3

/** Motivos frecuentes al denunciar una foto. */
export const MOTIVOS_DENUNCIA = [
  'Contenido inapropiado u ofensivo',
  'No corresponde al servicio',
  'Muestra datos personales',
  'Es engañosa o falsa',
]

/** Cualquier usuario denuncia una foto para que el administrador la revise. */
export const denunciarFoto = async (tipo: TipoFoto, id: number, motivo: string) => {
  const { data } = await api.post(`/imagenes/${tipo}/${id}/denunciar`, { motivo })
  return data
}

/** El proveedor agrega fotos a uno de sus servicios (máximo 3 en total). */
export const subirFotosServicio = async (servicioId: number, fotos: File[]) => {
  const form = new FormData()
  fotos.forEach(f => form.append('imagenes[]', f))
  const { data } = await api.post(`/servicios/${servicioId}/imagenes`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/** El proveedor quita una foto de uno de sus servicios. */
export const eliminarFotoServicio = async (servicioId: number, fotoId: number) => {
  await api.delete(`/servicios/${servicioId}/imagenes/${fotoId}`)
}

/** Admin: foto denunciada, agrupada con todas sus denuncias y su contexto. */
export interface FotoDenunciada {
  tipo: TipoFoto
  imagen_id: number
  ruta: string
  esta_ocultada: boolean
  contexto: { titulo: string; texto?: string | null; calificacion?: number | null }
  total_denuncias: number
  decision?: 'ocultar' | 'mantener' | null
  denuncias: { id: number; motivo: string; denunciante: string; created_at: string }[]
  ultima_denuncia: string
}

export const obtenerFotosDenunciadas = async (estado: 'pendientes' | 'resueltas' = 'pendientes'): Promise<FotoDenunciada[]> => {
  const { data } = await api.get('/admin/denuncias-imagenes', { params: { estado } })
  return data
}

export const resolverFotoDenunciada = async (tipo: TipoFoto, id: number, decision: 'ocultar' | 'mantener') => {
  const { data } = await api.patch(`/admin/denuncias-imagenes/${tipo}/${id}`, { decision })
  return data
}
