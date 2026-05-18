import api from '@/lib/api'

// Perfil de Usuario devuelto por el backend
export interface PerfilUsuario {
  id: string
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  rol_id: number
  esta_aprobado: boolean
  rol?: {
    id: number
    nombre: string
    nombre_mostrar: string
    descripcion?: string
  }
  perfil_cliente?: {
    id: number
    direccion?: string
    ciudad?: string
    foto_perfil?: string
    preferencias?: string
  }
  perfil_proveedor?: {
    id: number
    categoria_servicio: string
    biografia?: string
    anios_experiencia: number
    precio_por_hora: number
    habilidades?: string
    enlaces_portafolio?: string
    horario_atencion?: string
    calificacion: number
    total_resenas: number
    url_documento?: string
    esta_verificado: boolean
  }
  [key: string]: any
}

// Estructura de respuesta de autenticación del backend
export interface RespuestaAutenticacion {
  token_acceso: string
  tipo_token: string
  mensaje?: string
  usuario?: PerfilUsuario
  user?: PerfilUsuario // Alias para compatibilidad con paneles
}

// Datos necesarios para registrar un usuario
export interface DatosRegistro {
  nombre: string
  apellido?: string
  email: string
  telefono?: string
  password?: string
  password_confirmation?: string
  rol: 'cliente' | 'proveedor'
  // Campos del Proveedor
  categoria_servicio?: string
  biografia?: string
  anios_experiencia?: number
  precio_por_hora?: number
  habilidades?: string
  horario_atencion?: string
  documento?: File // Documento de validación (PDF o imagen)
  // Campos del Cliente
  direccion?: string
  ciudad?: string
}

// Mapeos de tipos para mantener compatibilidad absoluta en TypeScript
export type UserProfile = PerfilUsuario;
export type AuthResponse = RespuestaAutenticacion;
export type RegisterData = DatosRegistro;

const CLAVE_PERFIL_LOCAL = 'user_profile'

/**
 * Guarda el perfil del usuario autenticado en el almacenamiento local de sesión (localStorage)
 */
export const guardarPerfilUsuario = (perfil: PerfilUsuario) => {
  localStorage.setItem(CLAVE_PERFIL_LOCAL, JSON.stringify(perfil))
}
export const setUserProfile = guardarPerfilUsuario; // Alias de compatibilidad

/**
 * Recupera el perfil del usuario almacenado en la sesión local
 */
export const obtenerPerfilUsuario = (): PerfilUsuario | null => {
  const guardado = localStorage.getItem(CLAVE_PERFIL_LOCAL)
  if (!guardado) return null
  try {
    return JSON.parse(guardado)
  } catch {
    return null
  }
}
export const getUserProfile = obtenerPerfilUsuario; // Alias de compatibilidad

/**
 * Elimina el perfil de usuario del almacenamiento local de sesión
 */
export const limpiarPerfilUsuario = () => {
  localStorage.removeItem(CLAVE_PERFIL_LOCAL)
}
export const clearUserProfile = limpiarPerfilUsuario; // Alias de compatibilidad

/**
 * Consume el endpoint '/auth/mi-perfil' para obtener los datos completos del usuario autenticado.
 * Carga el rol, perfiles asociados en la base de datos y los persiste en localStorage.
 */
export const obtenerUsuarioActual = async (): Promise<PerfilUsuario> => {
  const { data } = await api.get<PerfilUsuario>('/auth/mi-perfil')
  guardarPerfilUsuario(data)
  return data
}
export const fetchCurrentUser = obtenerUsuarioActual; // Alias de compatibilidad

/**
 * Realiza la autenticación del usuario mediante correo y contraseña.
 * Si es exitoso, almacena el token JWT y carga el perfil completo del usuario.
 */
export const iniciarSesion = async (
  email: string,
  contrasenia: string
): Promise<RespuestaAutenticacion> => {
  const { data } = await api.post<RespuestaAutenticacion>(
    '/auth/login',
    { email, password: contrasenia }
  )
  
  // Guardamos el token JWT retornado en el localStorage
  localStorage.setItem('access_token', data.token_acceso)
  
  // Obtenemos el perfil completo recién cargado
  const usuarioCompleto = await obtenerUsuarioActual()
  
  return {
    ...data,
    usuario: usuarioCompleto,
    user: usuarioCompleto // Duplicado para compatibilidad con código en inglés
  }
}
export const login = iniciarSesion; // Alias de compatibilidad

/**
 * Registra un nuevo usuario en la base de datos de LocalService.
 * Construye de forma automatizada un objeto FormData para soportar la subida del documento.
 */
export const registrarUsuario = async (
  datos: DatosRegistro
): Promise<RespuestaAutenticacion> => {
  const formData = new FormData()
  
  // Rellenamos el FormData con todos los campos provistos
  Object.entries(datos).forEach(([llave, valor]) => {
    if (valor !== undefined && valor !== null) {
      if (llave === 'documento' && valor instanceof File) {
        formData.append('documento', valor)
      } else {
        formData.append(llave, String(valor))
      }
    }
  })

  // Enviamos la petición multipart/form-data al endpoint en español
  const { data } = await api.post<RespuestaAutenticacion>(
    '/auth/registro',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  // Si el backend devuelve un token directo, lo persistimos
  if (data.token_acceso) {
    localStorage.setItem('access_token', data.token_acceso)
  }

  // Cargamos los datos del perfil del usuario registrado
  const usuarioCompleto = await obtenerUsuarioActual()

  return {
    ...data,
    usuario: usuarioCompleto,
    user: usuarioCompleto // Alias de compatibilidad
  }
}
export const register = registrarUsuario; // Alias de compatibilidad

/**
 * Cierra la sesión activa en el servidor e invalida el token localmente.
 */
export const cerrarSesion = async () => {
  try {
    await api.post('/auth/cerrar-sesion')
  } finally {
    // Nos aseguramos de limpiar la sesión local pase lo que pase con la petición
    localStorage.removeItem('access_token')
    limpiarPerfilUsuario()
  }
}
export const logout = cerrarSesion; // Alias de compatibilidad

/**
 * Verifica si existe una sesión activa basándose en la presencia del token JWT.
 */
export const estaAutenticado = () =>
  Boolean(localStorage.getItem('access_token'))
export const isAuthenticated = estaAutenticado; // Alias de compatibilidad

/**
 * Administrador: Obtiene la lista completa de todos los usuarios registrados
 */
export const obtenerUsuariosAdmin = async (): Promise<PerfilUsuario[]> => {
  const { data } = await api.get<{ usuarios: PerfilUsuario[] }>('/auth/admin/usuarios')
  return data.usuarios
}

/**
 * Administrador: Elimina a un usuario por su ID
 */
export const eliminarUsuarioAdmin = async (id: string | number): Promise<void> => {
  await api.delete(`/auth/admin/usuarios/${id}`)
}

/**
 * Administrador: Obtiene la lista de proveedores en espera de aprobación
 */
export const obtenerProveedoresPendientesAdmin = async (): Promise<PerfilUsuario[]> => {
  const { data } = await api.get<{ proveedores_pendientes: PerfilUsuario[] }>('/auth/admin/proveedores-pendientes')
  return data.proveedores_pendientes
}

/**
 * Administrador: Aprueba la verificación de un proveedor
 */
export const aprobarProveedorAdmin = async (id: string | number): Promise<void> => {
  await api.post(`/auth/admin/aprobar-proveedor/${id}`)
}

/**
 * Administrador: Rechaza la verificación de un proveedor
 */
export const rechazarProveedorAdmin = async (id: string | number): Promise<void> => {
  await api.post(`/auth/admin/rechazar-proveedor/${id}`)
}

/**
 * Administrador: Obtiene estadísticas agregadas de la plataforma en tiempo real
 */
export const obtenerEstadisticasAdmin = async (): Promise<{
  total_usuarios: number
  proveedores_verificados: number
  verificaciones_pendientes: number
  resenas_reportadas: number
  clientes_count: number
  proveedores_count: number
  categorias: { categoria_servicio: string; total: number }[]
}> => {
  const { data } = await api.get('/auth/admin/estadisticas')
  return data
}
