import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - route based on email
    if (email.includes("admin")) {
      navigate("/admin");
    } else if (email.includes("proveedor") || email.includes("provider")) {
      navigate("/proveedor");
    } else {
      navigate("/cliente");
    }
    toast({ title: "¡Bienvenido!", description: "Inicio de sesión exitoso." });
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold">LocalService</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Conecta con los mejores profesionales de tu zona</h2>
          <p className="text-primary-foreground/70">Plomería, electricidad, limpieza y más. Todo en un solo lugar.</p>
        </div>
      </div>

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

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Link to="/recuperar-contrasena" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
            <Button type="submit" className="w-full" size="lg">Ingresar</Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes cuenta? <Link to="/registro" className="text-primary font-medium hover:underline">Regístrate aquí</Link>
          </p>

          <div className="text-xs text-center text-muted-foreground bg-muted p-3 rounded-lg">
            <strong>Demo:</strong> Usa "admin@", "proveedor@" o cualquier email para acceder a diferentes paneles.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
