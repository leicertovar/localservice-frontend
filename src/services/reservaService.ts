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
 * 
 * @param id Identificador de la solicitud.
 * @returns Promesa con la solicitud actualizada.
 */
export const rechazarCotizacion = async (id: number): Promise<any> => {
  const { data } = await api.post(`/solicitudes/${id}/rechazar`);
  return data;
};
