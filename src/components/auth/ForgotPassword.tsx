import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle, KeyRound, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { solicitarRecuperacionPassword, restablecerPassword } from "@/services/authService";

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const tokenUrl = searchParams.get("token");
  const emailUrl = searchParams.get("email");
  const esModoRestablecer = Boolean(tokenUrl && emailUrl);

  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargandoSolicitud, setCargandoSolicitud] = useState(false);
  const [nuevaContrasenia, setNuevaContrasenia] = useState("");
  const [confirmarContrasenia, setConfirmarContrasenia] = useState("");
  const [cargandoRestablecer, setCargandoRestablecer] = useState(false);

  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargandoSolicitud(true);
    try {
      await solicitarRecuperacionPassword(email);
      setEnviado(true);
      toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada para restablecer tu contraseña." });
    } catch (err: any) {
      toast({ title: "Error al solicitar enlace", description: err.response?.data?.mensaje || "El correo ingresado no se encuentra registrado.", variant: "destructive" });
    } finally {
      setCargandoSolicitud(false);
    }
  };

  const handleRestablecer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaContrasenia !== confirmarContrasenia) {
      toast({ title: "Contraseñas no coinciden", description: "Asegúrate de escribir la misma contraseña en ambos campos.", variant: "destructive" });
      return;
    }
    if (nuevaContrasenia.length < 8) {
      toast({ title: "Contraseña muy corta", description: "La contraseña debe contener al menos 8 caracteres.", variant: "destructive" });
      return;
    }
    setCargandoRestablecer(true);
    try {
      await restablecerPassword({ email: emailUrl || "", token: tokenUrl || "", password: nuevaContrasenia, password_confirmation: confirmarContrasenia });
      toast({ title: "¡Contraseña restablecida!", description: "Tu contraseña ha sido actualizada. Ya puedes iniciar sesión." });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Error al restablecer contraseña", description: err.response?.data?.mensaje || "El token es inválido o ha expirado.", variant: "destructive" });
    } finally {
      setCargandoRestablecer(false);
    }
  };

  const inputClass = "h-11 rounded-xl border-border/70 bg-card placeholder:text-muted-foreground/50 focus-visible:ring-primary/25 focus-visible:border-primary/50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/60 via-background to-secondary/40 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border/50 p-8 space-y-6 animate-in fade-in duration-300">

        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex mb-6">
            <Logo className="h-10" />
          </Link>

          {esModoRestablecer ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Nueva Contraseña</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Ingresa tu nueva contraseña para recuperar el acceso a{' '}
                <strong className="text-foreground font-semibold">{emailUrl}</strong>
              </p>
            </>
          ) : !enviado ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Recuperar Contraseña</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">¡Correo Enviado!</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Hemos enviado un enlace a{' '}
                <strong className="text-foreground font-semibold">{email}</strong>.
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
            </>
          )}
        </div>

        {esModoRestablecer ? (
          <form onSubmit={handleRestablecer} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nueva-contrasenia" className="text-sm font-medium">Nueva Contraseña</Label>
              <Input
                id="nueva-contrasenia"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={nuevaContrasenia}
                onChange={e => setNuevaContrasenia(e.target.value)}
                required
                disabled={cargandoRestablecer}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar-contrasenia" className="text-sm font-medium">Confirmar Contraseña</Label>
              <Input
                id="confirmar-contrasenia"
                type="password"
                placeholder="Repite la contraseña"
                value={confirmarContrasenia}
                onChange={e => setConfirmarContrasenia(e.target.value)}
                required
                disabled={cargandoRestablecer}
                className={inputClass}
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-semibold gap-2 shadow-sm" disabled={cargandoRestablecer}>
              {cargandoRestablecer ? "Guardando..." : <><span>Guardar Nueva Contraseña</span><ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>
        ) : !enviado ? (
          <form onSubmit={handleSolicitar} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={cargandoSolicitud}
                className={inputClass}
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-semibold gap-2 shadow-sm" disabled={cargandoSolicitud}>
              {cargandoSolicitud ? "Enviando enlace..." : <><span>Enviar enlace de recuperación</span><ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-semibold border-border/70"
              onClick={() => setEnviado(false)}
            >
              Enviar de nuevo
            </Button>
            <div className="bg-muted/60 rounded-xl p-3.5 text-xs text-muted-foreground text-center border border-border/50">
              El enlace expira en <strong className="text-foreground">30 minutos</strong>. Si no recibes el correo, verifica la dirección e intenta de nuevo.
            </div>
          </div>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

