import api from '@/lib/api';

/**
 * Interfaz para los datos del perfil del proveedor.
 */
export interface PerfilProveedorDatos {
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  biografia?: string;
  anios_experiencia?: number;
  precio_por_hora?: number;
  habilidades?: string;
  enlaces_portafolio?: string;
  horario_atencion?: string;
  ciudad?: string;
  categoria_servicio?: string;
}

/**
 * Interfaz para el modelo de Servicio.
 */
export interface ServicioDatos {
  id?: number;
  usuario_id?: string;
  nombre: string;
  categoria: string;
  precio: string;
  descripcion?: string;
  esta_activo?: boolean;
}

/**
 * Actualiza el perfil del proveedor autenticado en el servidor.
 * 
 * @param datos Objeto con los datos a actualizar del perfil.
 * @returns Promesa con la respuesta de la API.
 */
export const actualizarPerfilProveedor = async (datos: PerfilProveedorDatos): Promise<any> => {
  const { data } = await api.put('/proveedor/perfil', datos);
  return data;
};

/**
 * Obtiene la lista de todos los proveedores registrados.
 * 
 * @returns Promesa con la lista de proveedores.
 */
export const obtenerProveedores = async (): Promise<any[]> => {
  const { data } = await api.get('/proveedores');
  return data;
};

/**
 * Obtiene los detalles públicos de un proveedor a partir de su ID.
 * 
 * @param id Identificador único del proveedor.
 * @returns Promesa con los detalles del proveedor y sus servicios.
 */
export const obtenerDetalleProveedor = async (id: string | number): Promise<any> => {
  const { data } = await api.get(`/proveedores/${id}`);
  return data;
};

/**
 * Obtiene el listado de servicios del proveedor autenticado.
 * 
 * @returns Promesa con la lista de servicios.
 */
export const obtenerServicios = async (): Promise<ServicioDatos[]> => {
  const { data } = await api.get<ServicioDatos[]>('/servicios');
  return data;
};

/**
 * Crea un nuevo servicio para el proveedor autenticado.
 * 
 * @param datos Datos del servicio a crear.
 * @returns Promesa con el servicio creado.
 */
export const crearServicio = async (datos: ServicioDatos): Promise<any> => {
  const { data } = await api.post('/servicios', datos);
  return data;
};

/**
 * Actualiza un servicio existente del proveedor autenticado.
 * 
 * @param id Identificador del servicio.
 * @param datos Nuevos datos del servicio.
 * @returns Promesa con el servicio actualizado.
 */
export const actualizarServicio = async (id: number, datos: ServicioDatos): Promise<any> => {
  const { data } = await api.put(`/servicios/${id}`, datos);
  return data;
};

/**
 * Elimina un servicio específico del proveedor.
 * 
 * @param id Identificador del servicio.
 * @returns Promesa con el resultado de la eliminación.
 */
export const eliminarServicio = async (id: number): Promise<any> => {
  const { data } = await api.delete(`/servicios/${id}`);
  return data;
};

/**
 * Alterna el estado activo/inactivo de un servicio.
 * 
 * @param id Identificador del servicio.
 * @returns Promesa con el servicio modificado.
 */
export const alternarEstadoServicio = async (id: number): Promise<any> => {
  const { data } = await api.patch(`/servicios/${id}/activar`);
  return data;
};
