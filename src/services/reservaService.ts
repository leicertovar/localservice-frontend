import api from '@/lib/api';

/**
 * Interfaz para los datos de una solicitud de servicio.
 */
export interface SolicitudServicioDatos {
  id?: number;
  cliente_id?: string;
  proveedor_id: string;
  servicio_id?: number | null;
  fecha: string;
  hora: string;
  direccion: string;
  descripcion: string;
  telefono: string;
  monto_cotizado?: string;
  tiempo_estimado?: string;
  garantia?: string;
  detalles_cotizacion?: string;
  latitud?: number | null;
  longitud?: number | null;
  estado?: 'pendiente' | 'cotizado' | 'aceptada' | 'rechazada' | 'completada';
  fecha_completado?: string;
  marcado_pagado?: boolean;
  confirmacion_cliente?: 'aceptado' | 'rechazado' | null;
  queja_cliente?: string | null;
  evidencia_cliente?: string | null;
  evidencia_proveedor?: string | null;
  estado_disputa?: 'pendiente_proveedor' | 'pendiente_admin' | 'resuelto' | null;
  resolucion_admin?: 'aprobado' | 'rechazado' | null;
  nota_admin?: string | null;
  cliente?: {
    id: string;
    nombre: string;
    apellido?: string;
    email: string;
    telefono?: string;
  };
  proveedor?: {
    id: string;
    nombre: string;
    apellido?: string;
    email: string;
    telefono?: string;
  };
  servicio?: {
    id: number;
    nombre: string;
    precio: string;
    categoria: string;
  };
  created_at?: string;
}

/**
 * Crea una nueva solicitud de servicio (hecha por el cliente).
 * 
 * @param datos Datos de la solicitud.
 * @returns Promesa con la solicitud creada.
 */
export const crearSolicitud = async (datos: SolicitudServicioDatos): Promise<any> => {
  const { data } = await api.post('/solicitudes', datos);
  return data;
};

/**
 * Obtiene las solicitudes de servicio recibidas por el proveedor autenticado.
 * 
 * @returns Promesa con el listado de solicitudes del proveedor.
 */
export const obtenerSolicitudesProveedor = async (): Promise<SolicitudServicioDatos[]> => {
  const { data } = await api.get<SolicitudServicioDatos[]>('/proveedor/solicitudes');
  return data;
};

/**
 * Obtiene las solicitudes de servicio enviadas por el cliente autenticado.
 * 
 * @returns Promesa con el listado de solicitudes del cliente.
 */
export const obtenerSolicitudesCliente = async (): Promise<SolicitudServicioDatos[]> => {
  const { data } = await api.get<SolicitudServicioDatos[]>('/cliente/solicitudes');
  return data;
};

/**
 * Envía una cotización para una solicitud (hecha por el proveedor).
 * 
 * @param id Identificador de la solicitud.
 * @param datos Datos de la cotización (monto_cotizado, tiempo_estimado, garantia, detalles_cotizacion).
 * @returns Promesa con la solicitud actualizada.
 */
export const enviarCotizacion = async (
  id: number,
  datos: {
    monto_cotizado: string;
    tiempo_estimado: string;
    garantia?: string;
    detalles_cotizacion?: string;
  }
): Promise<any> => {
  const { data } = await api.post(`/solicitudes/${id}/cotizar`, datos);
  return data;
};

/**
 * Acepta una cotización (hecho por el cliente).
 * 
 * @param id Identificador de la solicitud.
 * @returns Promesa con la solicitud actualizada.
 */
export const aceptarCotizacion = async (id: number): Promise<any> => {
  const { data } = await api.post(`/solicitudes/${id}/aceptar`);
  return data;
};

/**
 * Rechaza una solicitud o cotización.
 */
export const rechazarCotizacion = async (id: number): Promise<any> => {
  const { data } = await api.post(`/solicitudes/${id}/rechazar`);
  return data;
};

/**
 * El proveedor marca un servicio como completado y pagado.
 */
export const marcarCompletado = async (id: number): Promise<any> => {
  const { data } = await api.post(`/solicitudes/${id}/completar`);
  return data;
};

/**
 * El cliente confirma o rechaza un servicio completado.
 * Si rechaza, puede adjuntar queja y evidencia (File).
 */
export const confirmarCompletado = async (
  id: number,
  accion: 'aceptar' | 'rechazar',
  queja?: string,
  evidencia?: File
): Promise<any> => {
  const formData = new FormData();
  formData.append('accion', accion);
  if (queja) formData.append('queja', queja);
  if (evidencia) formData.append('evidencia', evidencia);
  const { data } = await api.post(`/solicitudes/${id}/confirmar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

/**
 * El proveedor aporta evidencia en una disputa.
 */
export const aportarEvidenciaProveedor = async (id: number, descripcion: string, evidencia: File): Promise<any> => {
  const formData = new FormData();
  formData.append('descripcion', descripcion);
  formData.append('evidencia', evidencia);
  const { data } = await api.post(`/solicitudes/${id}/evidencia-proveedor`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

/**
 * Admin: lista disputas activas.
 */
export const listarDisputas = async (): Promise<any[]> => {
  const { data } = await api.get('/admin/disputas');
  return data;
};

/**
 * Admin: resuelve una disputa.
 */
export const resolverDisputa = async (id: number, resolucion: 'aprobado' | 'rechazado', nota?: string): Promise<any> => {
  const { data } = await api.post(`/admin/disputas/${id}/resolver`, { resolucion, nota });
  return data;
};
