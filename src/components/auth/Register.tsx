import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [role, setRole] = useState<"cliente" | "proveedor">("cliente");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "¡Registro exitoso!", description: "Tu cuenta ha sido creada." });
    navigate(role === "proveedor" ? "/proveedor" : "/cliente");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">LocalService</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Únete a nuestra plataforma</p>
        </div>

        <div className="flex bg-muted rounded-lg p-1">
          <button onClick={() => setRole("cliente")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "cliente" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
            Soy Cliente
          </button>
          <button onClick={() => setRole("proveedor")} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "proveedor" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
            Soy Proveedor
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Juan" required />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input placeholder="Pérez" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <Input type="email" placeholder="correo@ejemplo.com" required />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input type="tel" placeholder="+57 300 000 0000" required />
          </div>
          {role === "proveedor" && (
            <div className="space-y-2">
              <Label>Categoría de servicio</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                <option>Plomería</option>
                <option>Electricidad</option>
                <option>Limpieza</option>
                <option>Pintura</option>
                <option>Jardinería</option>
                <option>Tecnología</option>
                <option>Otro</option>
              </select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Contraseña</Label>
            <Input type="password" placeholder="Mínimo 8 caracteres" required />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Registrarse como {role === "proveedor" ? "Proveedor" : "Cliente"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary font-medium hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
