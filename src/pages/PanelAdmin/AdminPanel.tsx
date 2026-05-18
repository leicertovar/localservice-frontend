import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, ShieldCheck, MessageSquare, BarChart3, LogOut, Bell, Search, CheckCircle, XCircle, Eye, Trash2, AlertTriangle, FileText, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationsPanel from "@/components/reusable/NotificationsPanel";
import { 
  obtenerUsuariosAdmin, 
  eliminarUsuarioAdmin, 
  aprobarProveedorAdmin, 
  rechazarProveedorAdmin, 
  obtenerEstadisticasAdmin 
} from '@/services/authService'

interface UserData {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: string;
  date: string;
  phone: string;
  city: string;
  verified?: boolean;
  completedJobs?: number;
  rating?: number;
  servicesRequested?: number;
  url_documento?: string | null;
  categoria_servicio?: string | null;
}

const flaggedReviews = [
  { id: 1, reviewer: "Usuario Anónimo", provider: "Carlos Mendoza", rating: 1, comment: "Contenido inapropiado y ofensivo...", date: "2026-04-06", reason: "Lenguaje ofensivo" },
  { id: 2, reviewer: "Test User", provider: "María López", rating: 1, comment: "Spam repetido sin sentido...", date: "2026-04-07", reason: "Spam" },
  { id: 3, reviewer: "Bot Account", provider: "Pedro Silva", rating: 5, comment: "Review falsa generada automáticamente", date: "2026-04-08", reason: "Review falsa" },
];

const AdminPanel = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserData | null>(null);
  const [docsDialogUser, setDocsDialogUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    total_usuarios: 0,
    proveedores_verificados: 0,
    verificaciones_pendientes: 0,
    resenas_reportadas: 0,
    clientes_count: 0,
    proveedores_count: 0,
    categorias: [] as { categoria_servicio: string; total: number }[]
  });

  const { toast } = useToast();

  /**
   * Mapea el formato relacional del backend de Laravel al formato esperado por la UI del frontend.
   */
  const mapearUsuario = (u: any): UserData => {
    const esProveedor = u.rol_id === 2;
    const esAdmin = u.rol_id === 3;
    const rolNombre = esProveedor ? "Proveedor" : esAdmin ? "Admin" : "Cliente";
    
    return {
      id: u.id,
      name: `${u.nombre} ${u.apellido || ''}`.trim(),
      email: u.email,
      role: rolNombre,
      status: u.esta_aprobado ? "Activo" : "Pendiente",
      date: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : '2026-05-18',
      phone: u.telefono || 'No registrado',
      city: esProveedor ? (u.perfil_proveedor?.ciudad || 'Buenaventura') : (u.perfil_cliente?.ciudad || 'Buenaventura'),
      verified: u.esta_aprobado,
      completedJobs: esProveedor ? (u.perfil_proveedor?.total_resenas || 0) : 0,
      rating: esProveedor ? parseFloat(u.perfil_proveedor?.calificacion || 0) : 0,
      servicesRequested: !esProveedor ? 0 : 0,
      url_documento: esProveedor ? u.perfil_proveedor?.url_documento : null,
      categoria_servicio: esProveedor ? u.perfil_proveedor?.categoria_servicio : null
    };
  };

  /**
   * Carga todos los usuarios y estadísticas desde la API en español.
   */
  const cargarDatos = async () => {
    try {
      // 1. Obtener lista completa de usuarios
      const listaUsuarios = await obtenerUsuariosAdmin();
      setUsers(listaUsuarios.map(mapearUsuario));

      // 2. Obtener estadísticas del backend en tiempo real
      const datosStats = await obtenerEstadisticasAdmin();
      setStats(datosStats);
    } catch (err: any) {
      toast({
        title: "Error al cargar datos",
        description: err.response?.data?.mensaje || "No se pudieron sincronizar los datos del servidor.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar los proveedores que tienen verificación pendiente
  const pendingVerifications = users.filter(u => u.role === "Proveedor" && !u.verified);

  // Filtrar los usuarios según el campo de búsqueda
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  /**
   * Administrador: Confirma y elimina definitivamente a un usuario del sistema.
   */
  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    try {
      await eliminarUsuarioAdmin(deleteConfirm.id);
      toast({ 
        title: "Usuario eliminado", 
        description: `${deleteConfirm.name} ha sido eliminado de forma definitiva del sistema.`, 
        variant: "destructive" 
      });
      setDeleteConfirm(null);
      await cargarDatos();
    } catch (err: any) {
      toast({
        title: "Error al eliminar usuario",
        description: err.response?.data?.mensaje || "No se pudo procesar la eliminación.",
        variant: "destructive"
      });
    }
  };

  /**
   * Administrador: Aprueba a un proveedor, activando su estatus y notificándolo.
   */
  const handleVerify = async (userId: string | number) => {
    try {
      await aprobarProveedorAdmin(userId);
      toast({ 
        title: "Proveedor verificado exitosamente", 
        description: "La cuenta ha sido habilitada y se ha enviado la notificación por correo SMTP." 
      });
      await cargarDatos();
    } catch (err: any) {
      toast({
        title: "Error en aprobación",
        description: err.response?.data?.mensaje || "No se pudo habilitar al proveedor.",
        variant: "destructive"
      });
    }
  };

  /**
   * Administrador: Rechaza a un proveedor eliminando su solicitud de la plataforma.
   */
  const handleRejectVerification = async (userId: string | number) => {
    try {
      await rechazarProveedorAdmin(userId);
      toast({ 
        title: "Verificación rechazada", 
        description: "La solicitud ha sido rechazada y la cuenta ha sido cancelada.", 
        variant: "destructive" 
      });
      await cargarDatos();
    } catch (err: any) {
      toast({
        title: "Error al rechazar",
        description: err.response?.data?.mensaje || "No se pudo completar la operación.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-sm">LS</span>
            </div>
            <span className="font-bold text-foreground">LocalService</span>
            <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">Admin</Badge>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                  {pendingVerifications.length}
                </span>
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-foreground text-background text-xs">AD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><LogOut className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 animate-in fade-in duration-300">
        
        {/* Fila superior de Tarjetas de Estadísticas Reales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Usuarios", value: stats.total_usuarios.toString(), icon: Users, color: "text-primary" },
            { label: "Proveedores Verificados", value: stats.proveedores_verificados.toString(), icon: ShieldCheck, color: "text-success" },
            { label: "Verificación Pendiente", value: stats.verificaciones_pendientes.toString(), icon: AlertTriangle, color: "text-warning" },
            { label: "Reseñas Reportadas", value: stats.resenas_reportadas.toString(), icon: MessageSquare, color: "text-destructive" },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-xl border p-5 hover:shadow-sm transition-shadow">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="usuarios" className="gap-2"><Users className="w-4 h-4" />Usuarios</TabsTrigger>
            <TabsTrigger value="verificacion" className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Verificación
              {pendingVerifications.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-warning text-warning-foreground text-[10px] font-bold">
                  {pendingVerifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="resenas" className="gap-2"><MessageSquare className="w-4 h-4" />Reseñas</TabsTrigger>
            <TabsTrigger value="reportes" className="gap-2"><BarChart3 className="w-4 h-4" />Reportes</TabsTrigger>
          </TabsList>

          {/* TAB 1: GESTIÓN DE USUARIOS REAL */}
          <TabsContent value="usuarios" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-foreground">Gestión de Usuarios</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o correo..." className="pl-10" value={searchUsers} onChange={e => setSearchUsers(e.target.value)} />
              </div>
            </div>
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Usuario</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Rol</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Estado</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Registro</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-muted font-bold text-foreground">
                                {u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{u.role}</Badge></td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${u.status === "Activo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{u.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{u.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(u)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(u)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                          No se encontraron usuarios registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: VERIFICACIÓN DE PROVEEDORES REAL */}
          <TabsContent value="verificacion" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Verificación de Proveedores</h2>
            {pendingVerifications.length === 0 ? (
              <div className="bg-card rounded-xl border p-8 text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-foreground font-medium text-lg">¡Todo al día!</p>
                <p className="text-sm text-muted-foreground mt-1">No hay solicitudes de proveedores pendientes de verificación comercial.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingVerifications.map(p => (
                  <div key={p.id} className="bg-card rounded-xl border p-5 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-warning/10 text-warning font-bold text-lg">
                            {p.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{p.name}</h3>
                            <Badge variant="outline" className="text-[10px]">{p.categoria_servicio || "Proveedor"}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{p.email}</p>
                          <p className="text-xs text-muted-foreground">Registrado: {p.date}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setDocsDialogUser(p)}><Eye className="w-4 h-4" />Ver documento</Button>
                        <Button size="sm" className="gap-1 bg-success hover:bg-success/90" onClick={() => handleVerify(p.id)}><CheckCircle className="w-4 h-4" />Aprobar</Button>
                        <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleRejectVerification(p.id)}><XCircle className="w-4 h-4" />Rechazar</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: MODERACIÓN DE RESEÑAS */}
          <TabsContent value="resenas" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Moderación de Reseñas</h2>
            {flaggedReviews.map(r => (
              <div key={r.id} className="bg-card rounded-xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{r.reviewer}</h3>
                      <span className="text-xs text-muted-foreground">→ {r.provider}</span>
                    </div>
                    <Badge className="text-xs bg-destructive/10 text-destructive mb-2">{r.reason}</Badge>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Reseña conservada", description: "La reseña ha sido marcada como válida." })}>Conservar</Button>
                  <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={() => toast({ title: "Reseña eliminada", description: "La reseña ha sido eliminada del sistema.", variant: "destructive" })}>
                    <Trash2 className="w-3 h-3" />Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* TAB 4: REPORTES Y ESTADÍSTICAS REALES */}
          <TabsContent value="reportes" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Reportes y Estadísticas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border p-6 space-y-5">
                <h3 className="font-semibold text-foreground">Usuarios por Rol</h3>
                <div className="space-y-4">
                  {[
                    { label: "Clientes", value: stats.clientes_count, total: stats.total_usuarios, color: "bg-primary" },
                    { label: "Proveedores", value: stats.proveedores_count, total: stats.total_usuarios, color: "bg-amber-500" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-foreground font-medium">{item.label}</span>
                        <span className="text-muted-foreground">{item.value} ({item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%)</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`} 
                          style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold text-foreground mb-4">Categorías con Proveedores</h3>
                <div className="space-y-3">
                  {stats.categorias.map((s, i) => (
                    <div key={s.categoria_servicio} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <span className="text-sm text-foreground font-medium">{i + 1}. {s.categoria_servicio}</span>
                      <span className="text-sm font-semibold text-muted-foreground">{s.total} proveedor{s.total !== 1 ? 'es' : ''}</span>
                    </div>
                  ))}
                  {stats.categorias.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No hay proveedores registrados todavía.</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* DIALOG 1: DETALLE DE USUARIO */}
      <Dialog open={selectedUser !== null} onOpenChange={open => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Usuario</DialogTitle>
            <DialogDescription>Información completa del usuario almacenada en el sistema</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {selectedUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{selectedUser.role}</Badge>
                    <Badge className={`text-xs ${selectedUser.status === "Activo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{selectedUser.status}</Badge>
                    {selectedUser.verified && <Badge className="text-xs bg-success/10 text-success font-medium">Verificado ✓</Badge>}
                  </div>
                </div>
              </div>
              <div className="space-y-3 bg-muted rounded-lg p-4">
                <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-foreground font-medium">{selectedUser.email}</span></div>
                <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{selectedUser.phone}</span></div>
                <div className="flex items-center gap-3 text-sm"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">Registrado: {selectedUser.date}</span></div>
                <div className="flex items-center gap-3 text-sm"><Eye className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">Ciudad: {selectedUser.city}</span></div>
              </div>
              
              {selectedUser.role === "Proveedor" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{selectedUser.completedJobs}</p>
                    <p className="text-xs text-muted-foreground">Calificaciones Recibidas</p>
                  </div>
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{selectedUser.rating ? selectedUser.rating.toFixed(1) : "0.0"}</p>
                    <p className="text-xs text-muted-foreground">Calificación General</p>
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setSelectedUser(null)}>Cerrar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: CONFIRMACIÓN DE ELIMINACIÓN */}
      <Dialog open={deleteConfirm !== null} onOpenChange={open => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Eliminar Usuario</DialogTitle>
            <DialogDescription>¿Estás seguro de que deseas eliminar permanentemente a <strong>{deleteConfirm?.name}</strong>? Esta acción no se puede deshacer y borrará todos sus perfiles.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="destructive" className="flex-1" onClick={handleDeleteUser}>Sí, eliminar</Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: DOCUMENTOS REALES DE VERIFICACIÓN */}
      <Dialog open={docsDialogUser !== null} onOpenChange={open => { if (!open) setDocsDialogUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Documentos del Proveedor</DialogTitle>
            <DialogDescription>Revisa el documento de identidad / RUT / Certificado cargado por el proveedor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {docsDialogUser?.url_documento ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Documento de Soporte</p>
                    <p className="text-xs text-muted-foreground">Archivo de validación de identidad</p>
                  </div>
                </div>
                <a 
                  href={`http://127.0.0.1:8000${docsDialogUser.url_documento}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Abrir documento ↗
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-xs font-medium">El proveedor no cargó ningún archivo de soporte en su registro.</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              className="flex-1 bg-success hover:bg-success/90" 
              onClick={() => { if (docsDialogUser) handleVerify(docsDialogUser.id); setDocsDialogUser(null); }}
            >
              Aprobar proveedor
            </Button>
            <Button variant="outline" onClick={() => setDocsDialogUser(null)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
