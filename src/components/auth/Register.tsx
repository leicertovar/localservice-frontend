import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench, User, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { registrarUsuario, logout } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'

const Register = () => {
  const [role, setRole] = useState<"cliente" | "proveedor">("cliente");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setLoggedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    password_confirmation: '',
    categoria_servicio: 'Plomería',
  })

  const [docCedula, setDocCedula] = useState<File | null>(null)
  const [docRut, setDocRut] = useState<File | null>(null)
  const [docDiploma, setDocDiploma] = useState<File | null>(null)

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast({ title: 'Error de contraseñas', description: 'Las contraseñas ingresadas no coinciden.', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const datosRegistro: any = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        password: form.password,
        password_confirmation: form.password_confirmation,
        rol: role,
      }
      if (role === 'proveedor') {
        datosRegistro.categoria_servicio = form.categoria_servicio
        if (!docCedula || !docRut || !docDiploma) {
          toast({ title: 'Documentos requeridos', description: 'Debes adjuntar los 3 documentos: Cédula, RUT y Diploma/Certificado.', variant: 'destructive' })
          setIsLoading(false)
          return
        }
        datosRegistro.doc_cedula  = docCedula
        datosRegistro.doc_rut     = docRut
        datosRegistro.doc_diploma = docDiploma
      }
      await registrarUsuario(datosRegistro)
      if (role === 'proveedor') {
        toast({ title: '¡Registro exitoso!', description: 'Su cuenta ha sido creada. Por favor, espere a que el administrador verifique sus documentos.' })
        await logout()
        navigate('/login')
      } else {
        setLoggedIn(true)
        toast({ title: '¡Bienvenido!', description: 'Registro completado de forma exitosa.' })
        navigate('/cliente')
      }
    } catch (err: any) {
      const errores = err.response?.data?.errors
      const mensaje = errores ? Object.values(errores).flat().join(' · ') : err.response?.data?.mensaje || 'Error al procesar el registro.'
      toast({ title: 'Error de registro', description: mensaje, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "h-11 rounded-xl border-border/70 bg-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/25 focus-visible:border-primary/50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/60 via-background to-secondary/40 p-4 py-12">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg border border-border/50 p-8 space-y-6">

        {/* Cabecera */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">LocalService</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Únete a nuestra plataforma de servicios</p>
        </div>

        {/* Selector de rol */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setRole("cliente")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === "cliente"
                ? "bg-white shadow-sm text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4" />
            Soy Cliente
          </button>
          <button
            type="button"
            onClick={() => setRole("proveedor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              role === "proveedor"
                ? "bg-white shadow-sm text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Soy Proveedor
          </button>
        </div>

        <form onSubmit={manejarRegistro} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nombre</Label>
              <Input
                placeholder="Juan"
                value={form.nombre}
                onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Apellido</Label>
              <Input
                placeholder="Pérez"
                value={form.apellido}
                onChange={(e) => setForm(prev => ({ ...prev, apellido: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Correo electrónico</Label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Teléfono</Label>
              <Input
                type="tel"
                placeholder="3001234567"
                value={form.telefono}
                onChange={(e) => setForm(prev => ({ ...prev, telefono: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
          </div>

          {role === "proveedor" && (
            <div className="space-y-4 border border-primary/20 bg-primary/5 rounded-xl p-4 animate-in fade-in-50 duration-300">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Información Profesional
              </h3>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Categoría de servicio</Label>
                <select
                  value={form.categoria_servicio}
                  onChange={e => setForm(prev => ({ ...prev, categoria_servicio: e.target.value }))}
                  className="w-full h-11 rounded-xl border border-border/70 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:border-primary/50 transition-all"
                >
                  <option value="Plomería">Plomería</option>
                  <option value="Electricidad">Electricidad</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Jardinería">Jardinería</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Cerrajería">Cerrajería</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Documentos obligatorios: 3 archivos */}
              {[
                { label: 'Cédula de Ciudadanía', setter: setDocCedula, file: docCedula },
                { label: 'RUT', setter: setDocRut, file: docRut },
                { label: 'Diploma o Certificado Profesional', setter: setDocDiploma, file: docDiploma },
              ].map(({ label, setter, file }) => (
                <div key={label} className="space-y-1.5">
                  <Label className="text-sm font-medium text-primary">{label}</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => {
                      const archivo = e.target.files?.[0];
                      if (!archivo) return;
                      const ext = archivo.name.split('.').pop()?.toLowerCase();
                      if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
                        toast({ title: 'Formato no permitido', description: 'Solo se aceptan archivos PDF, JPG o PNG.', variant: 'destructive' });
                        e.target.value = '';
                        return;
                      }
                      setter(archivo);
                    }}
                    required
                    className="h-11 rounded-xl border-border/70 bg-white file:bg-primary file:text-white file:rounded-lg file:border-0 file:px-3 file:py-1 file:text-xs file:font-medium cursor-pointer"
                  />
                  {file && <p className="text-[11px] text-success">✓ {file.name}</p>}
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">Formatos aceptados: PDF, JPG, PNG. Máximo 10 MB por archivo.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Contraseña</Label>
              <Input
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Confirmar Contraseña</Label>
              <Input
                type="password"
                placeholder="Repite tu contraseña"
                value={form.password_confirmation}
                onChange={(e) => setForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                required
                className={inputClass}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl font-semibold gap-2 shadow-sm mt-2" disabled={isLoading}>
            {isLoading ? 'Registrando...' : (
              <><span>Registrarse como {role === "proveedor" ? "Proveedor" : "Cliente"}</span><ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
