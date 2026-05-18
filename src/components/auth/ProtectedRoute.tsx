import { Navigate } from 'react-router-dom';
import { obtenerPerfilUsuario, estaAutenticado } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  rolRequerido?: 'cliente' | 'proveedor' | 'admin';
}

/**
 * Componente Guard de Protección de Rutas en Español.
 * Impide accesos no autenticados y restringe accesos según roles relacionales.
 */
export const ProtectedRoute = ({ children, rolRequerido }: ProtectedRouteProps) => {
  // 1. Si el usuario no ha iniciado sesión, redirigir directamente a la página de login
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si se especifica un rol requerido, validar que el usuario cuente con los permisos necesarios
  if (rolRequerido) {
    const perfil = obtenerPerfilUsuario();
    if (!perfil) {
      return <Navigate to="/login" replace />;
    }

    // Extraer de manera segura el nombre del rol (soportando rol string u objeto)
    const rolObj = perfil.rol;
    const nombreRol = typeof rolObj === 'object' && rolObj !== null
      ? rolObj.nombre
      : String(rolObj ?? '');

    const nombreRolLower = nombreRol.toLowerCase();

    // Redirección condicional cruzada si el rol del usuario no coincide con el solicitado
    if (!nombreRolLower.includes(rolRequerido)) {
      if (nombreRolLower.includes('proveedor')) {
        return <Navigate to="/proveedor" replace />;
      } else if (nombreRolLower.includes('admin')) {
        return <Navigate to="/admin" replace />;
      } else {
        return <Navigate to="/cliente" replace />;
      }
    }
  }

  // Si pasa todas las validaciones de seguridad, renderizar la pantalla interna
  return <>{children}</>;
};

export default ProtectedRoute;
