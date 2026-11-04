import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Briefcase, ArrowRight, CheckCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { registrarUsuario, logout } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";

const CATEGORIAS = [
  "Plomería","Electricidad","Limpieza","Pintura","Jardinería",
  "Tecnología","Cerrajería","Barbería","Manicure","Carpintería",
  "Mudanzas","Cuidado de Mascotas","Otro",
];

const Register = () => {
  const [role, setRole]       = useState<"cliente" | "proveedor">("cliente");
  const { toast }             = useToast();
  const navigate              = useNavigate();
  const { setLoggedIn }       = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    password: "", password_confirmation: "", categoria_servicio: "Plomería",
  });
  const [docCedula,  setDocCedula]  = useState<File | null>(null);
  const [docRut,     setDocRut]     = useState<File | null>(null);
  const [docDiploma, setDocDiploma] = useState<File | null>(null);

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      toast({ title: "Error de contraseñas", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const datos: any = { ...form, rol: role };
      if (role === "proveedor") {
        datos.categoria_servicio = form.categoria_servicio;
        if (!docCedula || !docRut || !docDiploma) {
          toast({ title: "Documentos requeridos", description: "Adjunta los 3 documentos: Cédula, RUT y Diploma.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        datos.doc_cedula  = docCedula;
        datos.doc_rut     = docRut;
        datos.doc_diploma = docDiploma;
      }
      await registrarUsuario(datos);
      if (role === "proveedor") {
        toast({ title: "¡Registro exitoso!", description: "Cuenta creada. Espera la verificación del administrador." });
        await logout();
        navigate("/login");
      } else {
        setLoggedIn(true);
        toast({ title: "¡Bienvenido!", description: "Registro completado exitosamente." });
        navigate("/cliente");
      }
    } catch (err: any) {
      const errores = err.response?.data?.errors;
      const msg = errores
        ? Object.values(errores).flat().join(" · ")
        : err.response?.data?.mensaje || "Error al procesar el registro.";
      toast({ title: "Error de registro", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoc = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["pdf","jpg","jpeg","png"].includes(ext)) {
      toast({ title: "Formato no permitido", description: "Solo PDF, JPG o PNG.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    setter(file);
  };

  const inputClass = "input-enhanced";

  return (
    <div className="min-h-screen flex">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex w-[360px] xl:w-[420px] shrink-0 bg-hero relative overflow-hidden flex-col justify-between p-10">
        <div className="absolute inset-0 bg-dot-grid opacity-10" />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Logo tone="blanco" className="h-10" />
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight tracking-tight">
            Únete a la plataforma de servicios
          </h2>
          <p className="text-white/65 text-sm leading-relaxed mb-6">
            Registra tu cuenta y empieza a conectar con profesionales verificados o a ofrecer tus servicios.
          </p>
          <ul className="space-y-3">
            {[
              "Sin comisiones ocultas",
              "Perfil verificado y visible",
              "Soporte dedicado 24/7",
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5">
                <CheckCircle className="size-4 text-emerald-400 shrink-0" />
                <span className="text-white/75 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { v: "2,847", l: "Proveedores" },
            { v: "4.8★",  l: "Calificación" },
            { v: "13+",   l: "Categorías"  },
            { v: "100%",  l: "Verificados" },
          ].map(({ v, l }) => (
            <div key={l} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
              <p className="font-bold text-white text-lg leading-tight tabular-nums">{v}</p>
              <p className="text-white/55 text-xs">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 overflow-y-auto bg-background relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="min-h-full flex items-start justify-center p-6 sm:p-10 py-12">
          <div className="w-full max-w-lg space-y-6">

            {/* Mobile logo */}
            <div className="lg:hidden flex mb-2">
              <Logo className="h-9" />
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-1">Crear Cuenta</h1>
              <p className="text-muted-foreground text-[15px]">Únete a nuestra plataforma de servicios</p>
            </div>

            {/* Role selector */}
            <div className="flex bg-muted/80 rounded-xl p-1 gap-1 border border-border/50">
              {[
                { value: "cliente",    label: "Soy Cliente",    Icon: User      },
                { value: "proveedor",  label: "Soy Proveedor",  Icon: Briefcase },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value as "cliente" | "proveedor")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    role === value
                      ? "bg-card shadow-sm text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={manejarRegistro} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Nombre</Label>
                  <Input placeholder="Juan" value={form.nombre}
                    onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Apellido</Label>
                  <Input placeholder="Pérez" value={form.apellido}
                    onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} required className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Correo electrónico</Label>
                  <Input type="email" placeholder="correo@ejemplo.com" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Teléfono</Label>
                  <Input type="tel" placeholder="3001234567" value={form.telefono}
                    onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} required className={inputClass} />
                </div>
              </div>

              {/* Provider extra fields */}
              {role === "proveedor" && (
                <div className="space-y-4 border border-primary/20 bg-primary/5 rounded-2xl p-5 animate-in fade-in-50 duration-300">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                    <Briefcase className="size-4" />
                    Información Profesional
                  </h3>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Categoría de servicio</Label>
                    <select
                      value={form.categoria_servicio}
                      onChange={e => setForm(p => ({ ...p, categoria_servicio: e.target.value }))}
                      className="w-full h-11 rounded-xl border border-border/70 bg-card px-3 text-sm
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
                                 focus-visible:border-primary/50 transition-all duration-200"
                    >
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {[
                    { label: "Cédula de Ciudadanía",          setter: setDocCedula,  file: docCedula  },
                    { label: "RUT",                            setter: setDocRut,     file: docRut     },
                    { label: "Diploma o Certificado",          setter: setDocDiploma, file: docDiploma },
                  ].map(({ label, setter, file }) => (
                    <div key={label} className="space-y-1.5">
                      <Label className="text-sm font-semibold text-primary">{label}</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleDoc(setter)}
                        required
                        className="h-11 rounded-xl border-border/70 bg-card cursor-pointer
                                   file:bg-primary file:text-white file:rounded-lg file:border-0
                                   file:px-3 file:py-1 file:text-xs file:font-semibold file:mr-3"
                      />
                      {file && (
                        <p className="text-[11px] text-success font-medium flex items-center gap-1">
                          <CheckCircle className="size-3" /> {file.name}
                        </p>
                      )}
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground">Formatos: PDF, JPG, PNG · Máx. 10 MB por archivo</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Contraseña</Label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Confirmar Contraseña</Label>
                  <Input type="password" placeholder="Repite tu contraseña" value={form.password_confirmation}
                    onChange={e => setForm(p => ({ ...p, password_confirmation: e.target.value }))} required className={inputClass} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl gap-2 text-sm font-bold mt-1"
              >
                {isLoading ? "Registrando..." : (
                  <>Registrarse como {role === "proveedor" ? "Proveedor" : "Cliente"} <ArrowRight className="size-4" /></>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary font-semibold hover:text-primary/75 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
