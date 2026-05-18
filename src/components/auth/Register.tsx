import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { registrarUsuario, logout } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'

const Register = () => {
  // Estado para controlar el rol seleccionado (Cliente vs Proveedor)
  const [role, setRole] = useState<"cliente" | "proveedor">("cliente");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Consumimos el contexto global de inicio de sesión
  const { setLoggedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Estructura simplificada de campos del formulario en español
  const [form, setForm] = useState({
    nombre: '', 
    apellido: '', 
    email: '', 
    telefono: '', 
    password: '', 
    password_confirmation: '',
    categoria_servicio: 'Plomería',
  })

  // Estado para almacenar el archivo cargado para el proveedor
  const [documentoFile, setDocumentoFile] = useState<File | null>(null)

  /**
   * Maneja el flujo de registro simplificado.
   * Si es Cliente se aprueba de forma automática y accede de inmediato.
   * Si es Proveedor se le notifica que debe esperar aprobación administrativa.
   */
  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación local de coincidencia de contraseñas
    if (form.password !== form.password_confirmation) {
      toast({ 
        title: 'Error de contraseñas', 
        description: 'Las contraseñas ingresadas no coinciden.', 
        variant: 'destructive' 
      })
      return
    }

    setIsLoading(true)

    try {
      // 1. Estructuramos el payload básico de datos comunes solicitados
      const datosRegistro: any = {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        telefono: form.telefono,
        password: form.password,
        password_confirmation: form.password_confirmation,
        rol: role,
      }

      // 2. Adjuntar campos simplificados según el rol seleccionado
      if (role === 'proveedor') {
        datosRegistro.categoria_servicio = form.categoria_servicio
        
        // El documento de soporte es obligatorio para registrar un proveedor
        if (documentoFile) {
          datosRegistro.documento = documentoFile
        } else {
          toast({
            title: 'Documento requerido',
            description: 'Por favor adjunte un documento (PDF o imagen) para verificar su cuenta comercial.',
            variant: 'destructive'
          })
          setIsLoading(false)
          return
        }
      }

      // 3. Ejecutar el servicio de registro
      await registrarUsuario(datosRegistro)

      // 4. Lógica de flujo condicional según el rol
      if (role === 'proveedor') {
        // Informar al proveedor del registro exitoso en espera de validación de documentos
        toast({ 
          title: '¡Registro exitoso!', 
          description: 'Su cuenta ha sido creada. Por favor, espere a que el administrador verifique sus documentos. Le hemos enviado un correo de confirmación.', 
        })
        
        // Forzar desautenticación ya que la cuenta del proveedor está "pendiente" (esta_aprobado = false)
        await logout()
        navigate('/login')
      } else {
        // Clientes inician sesión de inmediato de forma transparente
        setLoggedIn(true)
        toast({ 
          title: '¡Bienvenido!', 
          description: 'Registro completado de forma exitosa.' 
        })
        navigate('/cliente')
      }
    } catch (err: any) {
      // Manejo dinámico de errores de validación de Laravel
      const errores = err.response?.data?.errors
      const mensaje = errores
        ? Object.values(errores).flat().join(' · ')
        : err.response?.data?.mensaje || 'Error al procesar el registro.'
        
      toast({ 
        title: 'Error de registro', 
        description: mensaje, 
        variant: 'destructive' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4 py-12">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg p-8 space-y-6">
        
        {/* Cabecera del Formulario */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">LocalService</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Únete a nuestra plataforma de servicios</p>
        </div>

        {/* Interruptor de Rol (Cliente vs Proveedor) */}
        <div className="flex bg-muted rounded-lg p-1">
          <button 
            type="button"
            onClick={() => setRole("cliente")} 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "cliente" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
          >
            Soy Cliente
          </button>
          <button 
            type="button"
            onClick={() => setRole("proveedor")} 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === "proveedor" ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}
          >
            Soy Proveedor
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarRegistro} className="space-y-4">
          
          {/* Fila de Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input 
                placeholder="Juan" 
                value={form.nombre}
                onChange={(e) => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Apellido</Label>
              <Input 
                placeholder="Pérez" 
                value={form.apellido}
                onChange={(e) => setForm(prev => ({ ...prev, apellido: e.target.value }))}
                required 
              />
            </div>
          </div>

          {/* Fila de Email y Teléfono */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input 
                type="email" 
                placeholder="correo@ejemplo.com" 
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input 
                type="tel" 
                placeholder="3001234567" 
                value={form.telefono}
                onChange={(e) => setForm(prev => ({ ...prev, telefono: e.target.value }))}
                required 
              />
            </div>
          </div>

          {/* Sección de Campos Simplificados Condicionales para Proveedores */}
          {role === "proveedor" && (
            <div className="space-y-4 border-t pt-4 animate-in fade-in-50 duration-300">
              <h3 className="text-sm font-semibold text-foreground">Información Profesional</h3>
              
              <div className="space-y-2">
                <Label>Categoría de servicio</Label>
                <select 
                  value={form.categoria_servicio} 
                  onChange={e => setForm(prev => ({ ...prev, categoria_servicio: e.target.value }))}
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

              <div className="space-y-2">
                <Label className="text-primary font-medium">Documento de Soporte / Cédula / Certificados (PDF, PNG, JPG)</Label>
                <Input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  onChange={e => {
                    const archivo = e.target.files?.[0]
                    if (archivo) {
                      setDocumentoFile(archivo)
                    }
                  }}
                  required
                />
                <p className="text-[10px] text-muted-foreground">Adjunta tu documento de identidad o RUT para validar tu cuenta comercial.</p>
              </div>
            </div>
          )}

          {/* Fila de Contraseñas */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input 
                type="password" 
                placeholder="Mínimo 8 caracteres" 
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Contraseña</Label>
              <Input 
                type="password" 
                placeholder="Repite tu contraseña" 
                value={form.password_confirmation}
                onChange={(e) => setForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                required 
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" size="lg" disabled={isLoading}>
            {isLoading ? 'Registrando...' : `Registrarse como ${role === "proveedor" ? "Proveedor" : "Cliente"}`}
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
