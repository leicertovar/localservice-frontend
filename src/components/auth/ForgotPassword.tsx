import { useState } from "react";
import { Link } from "react-router-dom";
import { Wrench, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada para restablecer tu contraseña." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LocalService</span>
          </Link>

          {!sent ? (
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

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" className="w-full" size="lg">
              Enviar enlace de recuperación
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Enviar de nuevo
            </Button>
            <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground text-center">
              El enlace expira en <strong>30 minutos</strong>. Si no recibes el correo, verifica la dirección e intenta de nuevo.
            </div>
          </div>
        )}

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
