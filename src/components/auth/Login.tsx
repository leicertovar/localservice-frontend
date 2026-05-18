import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { obtenerUsuarioActual, iniciarSesion } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'

const Login = () => {
  // Estados para capturar correo, contraseña y visibilidad
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  
  // Utilidades de la UI (toast para alertas, navigate para redirecciones)
  const { toast } = useToast();
  const navigate = useNavigate();

  // Consumimos el contexto global de autenticación para cambiar el estado de sesión
  const { setLoggedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * Envía las credenciales al backend de Laravel en español.
   */
  const manejarInicioSesion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // 1. Ejecutar el login en el servicio y guardar el JWT token
      const respuesta = await iniciarSesion(email, password)
      setLoggedIn(true)
      
      toast({ 
        title: '¡Bienvenido!', 
        description: 'Inicio de sesión completado de forma exitosa.' 
      })

      // 2. Extraer el perfil del usuario autenticado
      const usuarioActual = respuesta.usuario ?? await obtenerUsuarioActual()
      
      // 3. Evaluar el rol del usuario de forma robusta (soporta objeto de rol o string directo)
      const rolObj = usuarioActual.rol
      const nombreRol = typeof rolObj === 'object' && rolObj !== null 
        ? rolObj.nombre 
        : String(rolObj ?? 'cliente')
        
      const nombreRolMinusc = nombreRol.toLowerCase()

      // 4. Redirección dinámica basada en los roles relacionales en español
      const rutaRedireccion = nombreRolMinusc.includes('proveedor')
        ? '/proveedor'
        : nombreRolMinusc.includes('admin')
          ? '/'
          : '/cliente'

      navigate(rutaRedireccion)
    } catch (err: any) {
      // Capturar errores del backend (como el bloqueo 403 por falta de aprobación del proveedor)
      const mensajeError = err.response?.data?.mensaje || 'Credenciales de acceso incorrectas.'
      toast({ 
        title: 'Error de acceso', 
        description: mensajeError, 
        variant: 'destructive' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Columna Lateral Izquierda Informativa (Visible en laptops y pantallas grandes) */}
      <div className="hidden lg:flex flex-1 bg-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">LocalService</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Conecta con los mejores profesionales de tu zona</h2>
          <p className="text-primary-foreground/70">Plomería, electricidad, limpieza y más. Todo en un solo lugar.</p>
        </div>
      </div>

      {/* Columna Derecha con el Formulario de Acceso */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">LocalService</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Iniciar Sesión</h1>
            <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={manejarInicioSesion} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="correo@ejemplo.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPass ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Link to="/recuperar-contrasena" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta? <Link to="/registro" className="text-primary font-medium hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
