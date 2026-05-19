import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Wrench, ArrowLeft, Mail, CheckCircle, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { solicitarRecuperacionPassword, restablecerPassword } from "@/services/authService";

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Leer parámetros de la URL para el restablecimiento real
  const tokenUrl = searchParams.get("token");
  const emailUrl = searchParams.get("email");
  const esModoRestablecer = Boolean(tokenUrl && emailUrl);

  // Estados para el primer paso: Solicitar recuperación
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargandoSolicitud, setCargandoSolicitud] = useState(false);

  // Estados para el segundo paso: Restablecer contraseña
  const [nuevaContrasenia, setNuevaContrasenia] = useState("");
  const [confirmarContrasenia, setConfirmarContrasenia] = useState("");
  const [cargandoRestablecer, setCargandoRestablecer] = useState(false);

  /**
   * Paso 1: Enviar solicitud de recuperación por correo
   */
  const handleSolicitar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargandoSolicitud(true);
    try {
      await solicitarRecuperacionPassword(email);
      setEnviado(true);
      toast({ 
        title: "Correo enviado", 
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña." 
      });
    } catch (err: any) {
      toast({
        title: "Error al solicitar enlace",
        description: err.response?.data?.mensaje || "El correo ingresado no se encuentra registrado en el sistema.",
        variant: "destructive"
      });
    } finally {
      setCargandoSolicitud(false);
    }
  };

  /**
   * Paso 2: Guardar nueva contraseña en la base de datos
   */
  const handleRestablecer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar coincidencia de contraseñas localmente
    if (nuevaContrasenia !== confirmarContrasenia) {
      toast({
        title: "Contraseñas no coinciden",
        description: "Asegúrate de escribir la misma contraseña en ambos campos de validación.",
        variant: "destructive"
      });
      return;
    }

    if (nuevaContrasenia.length < 8) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña de seguridad debe contener al menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setCargandoRestablecer(true);
    try {
      await restablecerPassword({
        email: emailUrl || "",
        token: tokenUrl || "",
        password: nuevaContrasenia,
        password_confirmation: confirmarContrasenia
      });

      toast({
        title: "¡Contraseña restabledica!",
        description: "Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión.",
      });

      // Redirigir al login
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Error al restablecer contraseña",
        description: err.response?.data?.mensaje || "El token de recuperación es inválido o ha expirado. Por favor, solicita un nuevo enlace.",
        variant: "destructive"
      });
    } finally {
      setCargandoRestablecer(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 space-y-6 animate-in fade-in duration-300">
        
        {/* LOGOTIPO DE LOCALSERVICE */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LocalService</span>
          </Link>

          {/* RENDERIZADO DILIGENTE SEGÚN EL MODO DE ACCESO */}
          {esModoRestablecer ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Nueva Contraseña</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Ingresa tu nueva contraseña para recuperar de forma segura el acceso a tu cuenta de <strong className="text-foreground">{emailUrl}</strong>.
              </p>
            </>
          ) : !enviado ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Recuperar Contraseña</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">¡Correo Enviado!</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Hemos enviado un enlace de recuperación a <strong className="text-foreground">{email}</strong>. 
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
            </>
          )}
        </div>

        {/* MODO 1: FORMULARIO DE RESTABLECIMIENTO REAL (TOKEN PRESENTE) */}
        {esModoRestablecer ? (
          <form onSubmit={handleRestablecer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nueva-contrasenia">Nueva Contraseña</Label>
              <Input
                id="nueva-contrasenia"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={nuevaContrasenia}
                onChange={e => setNuevaContrasenia(e.target.value)}
                required
                disabled={cargandoRestablecer}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmar-contrasenia">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmar-contrasenia"
                type="password"
                placeholder="Repite la contraseña"
                value={confirmarContrasenia}
                onChange={e => setConfirmarContrasenia(e.target.value)}
                required
                disabled={cargandoRestablecer}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={cargandoRestablecer}>
              {cargandoRestablecer ? "Guardando contraseña..." : "Guardar Nueva Contraseña"}
            </Button>
          </form>
        ) : (
          /* MODO 2: FORMULARIO DE SOLICITUD DE ENLACE */
          !enviado ? (
            <form onSubmit={handleSolicitar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={cargandoSolicitud}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={cargandoSolicitud}>
                {cargandoSolicitud ? "Enviando enlace..." : "Enviar enlace de recuperación"}
              </Button>
            </form>
          ) : (
            /* PASO DE SOLICITUD COMPLETADA */
            <div className="space-y-3">
              <Button variant="outline" className="w-full" onClick={() => setEnviado(false)}>
                Enviar de nuevo
              </Button>
              <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground text-center">
                El enlace expira en <strong>30 minutos</strong>. Si no recibes el correo, verifica la dirección e intenta de nuevo.
              </div>
            </div>
          )
        )}

        {/* ENLACE DE RETORNO */}
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
