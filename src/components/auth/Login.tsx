import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { obtenerUsuarioActual, iniciarSesion } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setLoggedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const manejarInicioSesion = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const respuesta = await iniciarSesion(email, password)
      setLoggedIn(true)
      toast({ title: '¡Bienvenido!', description: 'Inicio de sesión completado de forma exitosa.' })
      const usuarioActual = respuesta.usuario ?? await obtenerUsuarioActual()
      const rolObj = usuarioActual.rol
      const nombreRol = typeof rolObj === 'object' && rolObj !== null ? rolObj.nombre : String(rolObj ?? 'cliente')
      const nombreRolMinusc = nombreRol.toLowerCase()
      const rutaRedireccion = nombreRolMinusc.includes('proveedor') ? '/proveedor' : nombreRolMinusc.includes('admin') ? '/admin' : '/cliente'
      navigate(rutaRedireccion)
    } catch (err: any) {
      const mensajeError = err.response?.data?.mensaje || 'Credenciales de acceso incorrectas.'
      toast({ title: 'Error de acceso', description: mensajeError, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex flex-1 bg-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/30" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-white/20" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/15" />
        </div>
        <div className="max-w-sm text-white relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">LocalService</span>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Conecta con los mejores profesionales de tu zona
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Plomería, electricidad, limpieza y más. Todo en un solo lugar, con garantía de calidad.
          </p>
          <div className="mt-10 flex flex-col gap-3">
            {["Proveedores verificados", "Solicitudes en minutos", "Pagos seguros"].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho con formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">LocalService</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1.5">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>

          <form onSubmit={manejarInicioSesion} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-border/70 bg-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/25 focus-visible:border-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</Label>
                <Link to="/recuperar-contrasena" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl border-border/70 bg-white placeholder:text-muted-foreground/50 pr-10 focus-visible:ring-primary/25 focus-visible:border-primary/50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl font-semibold text-sm gap-2 shadow-sm"
            >
              {isLoading ? 'Iniciando sesión...' : (
                <><span>Iniciar Sesión</span><ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
