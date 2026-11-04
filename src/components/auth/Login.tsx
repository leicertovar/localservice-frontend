import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Shield, Star, Users, Zap } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { obtenerUsuarioActual, iniciarSesion } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

const PERKS = [
  { icon: Shield, label: "Proveedores 100% verificados"     },
  { icon: Star,   label: "Calificaciones auténticas"        },
  { icon: Zap,    label: "Cotizaciones en minutos"          },
  { icon: Users,  label: "Más de 2,800 profesionales"       },
];

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast }      = useToast();
  const navigate       = useNavigate();
  const { setLoggedIn } = useAuth();

  const manejarInicioSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const respuesta  = await iniciarSesion(email, password);
      setLoggedIn(true);
      toast({ title: "¡Bienvenido!", description: "Inicio de sesión completado." });
      const usuario    = respuesta.usuario ?? await obtenerUsuarioActual();
      const rolObj     = usuario.rol;
      const nombreRol  = typeof rolObj === "object" && rolObj !== null ? rolObj.nombre : String(rolObj ?? "cliente");
      const ruta       = nombreRol.toLowerCase().includes("proveedor") ? "/proveedor"
                       : nombreRol.toLowerCase().includes("admin")     ? "/admin"
                       : "/cliente";
      navigate(ruta);
    } catch (err: any) {
      toast({
        title: "Error de acceso",
        description: err.response?.data?.mensaje || "Credenciales incorrectas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-1 bg-hero relative overflow-hidden flex-col justify-between p-12">
        {/* Dot grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-10" />
        {/* Blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Logo tone="blanco" className="h-10" />
        </div>

        {/* Copy */}
        <div className="relative z-10 max-w-sm">
          <h2 className="text-4xl font-bold text-white mb-4 leading-[1.1] tracking-tight">
            Conecta con los mejores profesionales de tu zona
          </h2>
          <p className="text-white/65 text-[15px] leading-relaxed mb-8">
            Plomería, electricidad, carpintería, barbería y mucho más. Profesionales verificados, calificaciones reales.
          </p>
          <ul className="space-y-3">
            {PERKS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
                  <Icon className="size-3.5 text-white" />
                </div>
                <span className="text-white/80 text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial card */}
        <div className="relative z-10 bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-white/80 text-sm leading-relaxed mb-3 italic">
            "Encontré un electricista en menos de 10 minutos. El servicio fue impecable y el precio justo."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold text-white">CG</div>
            <div>
              <p className="text-white text-xs font-semibold">Carlos García</p>
              <p className="text-white/55 text-[11px]">Cliente verificado</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex mb-8">
            <Logo className="h-9" />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1.5 tracking-tight">Iniciar Sesión</h1>
            <p className="text-muted-foreground text-[15px]">Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>

          {/* Form */}
          <form onSubmit={manejarInicioSesion} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-enhanced"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Contraseña
                </Label>
                <Link
                  to="/recuperar-contrasena"
                  className="text-xs text-primary hover:text-primary/75 font-semibold transition-colors"
                >
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
                  className="input-enhanced pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Mostrar contraseña"
                >
                  {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl gap-2 text-sm font-bold mt-1"
            >
              {isLoading ? "Iniciando sesión..." : (
                <>Iniciar Sesión <ArrowRight className="size-4" /></>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-medium">¿Nuevo aquí?</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          <Link to="/registro">
            <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-semibold">
              Crear cuenta gratis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
