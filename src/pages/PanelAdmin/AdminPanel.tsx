import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, ShieldCheck, MessageSquare, BarChart3, LogOut, Bell, AlertTriangle, FileText, Mail, Phone, Calendar, Star, MapPin } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { storageUrl } from "@/lib/api";
import NotificationsPanel from "@/components/reusable/NotificationsPanel";
import {
  obtenerUsuariosAdmin,
  eliminarUsuarioAdmin,
  aprobarProveedorAdmin,
  rechazarProveedorAdmin,
  obtenerEstadisticasAdmin
} from '@/services/authService'
import { obtenerResenasReportadas, moderarResena, eliminarResena, type Resena } from '@/services/resenaService'
import { listarDisputas, resolverDisputa } from '@/services/reservaService'
import { obtenerNotificaciones } from '@/services/notificacionService'
import UsuariosSection from "./sections/UsuariosSection";
import VerificacionSection from "./sections/VerificacionSection";
import ResenasSection from "./sections/ResenasSection";
import ReportesSection from "./sections/ReportesSection";
import DisputasSection from "./sections/DisputasSection";

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
  doc_cedula?: string | null;
  doc_rut?: string | null;
  doc_diploma?: string | null;
  categoria_servicio?: string | null;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserData | null>(null);
  const [docsDialogUser, setDocsDialogUser] = useState<UserData | null>(null);
  const [notaRechazo, setNotaRechazo] = useState("");
  const [resenasReportadas, setResenasReportadas] = useState<Resena[]>([]);
  const [disputas, setDisputas] = useState<any[]>([]);
  const [notaResolucion, setNotaResolucion] = useState("");
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
      doc_cedula:  esProveedor ? u.perfil_proveedor?.doc_cedula  : null,
      doc_rut:     esProveedor ? u.perfil_proveedor?.doc_rut     : null,
      doc_diploma: esProveedor ? u.perfil_proveedor?.doc_diploma : null,
      categoria_servicio: esProveedor ? u.perfil_proveedor?.categoria_servicio : null
    };
  };

  const cargarDatos = async () => {
    try {
      const listaUsuarios = await obtenerUsuariosAdmin();
      setUsers(listaUsuarios.map(mapearUsuario));
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

  const cargarResenasReportadas = async () => {
    try {
      const resenas = await obtenerResenasReportadas();
      setResenasReportadas(resenas);
    } catch {}
  };

  const cargarDisputas = async () => {
    try {
      const data = await listarDisputas();
      setDisputas(data);
    } catch {}
  };

  const handleResolverDisputa = async (id: number, resolucion: 'aprobado' | 'rechazado') => {
    try {
      await resolverDisputa(id, resolucion, notaResolucion || undefined);
      toast({ title: resolucion === 'aprobado' ? 'Disputa aprobada' : 'Disputa rechazada', description: 'La decisión fue notificada a ambas partes.' });
      setNotaResolucion("");
      cargarDisputas();
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.mensaje || 'No se pudo resolver la disputa.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarResenasReportadas();
    cargarDisputas();
    // Carga inicial del conteo de notificaciones sin abrir el panel
    obtenerNotificaciones().then(res => setNotifCount(res.no_leidas)).catch(() => {});
    const intervalo = setInterval(() => {
      obtenerNotificaciones().then(res => setNotifCount(res.no_leidas)).catch(() => {});
    }, 30000);
    return () => clearInterval(intervalo);
  }, []);

  const pendingVerifications = users.filter(u => u.role === "Proveedor" && !u.verified);
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

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

  const handleRejectVerification = async (userId: string | number, nota?: string) => {
    try {
      await rechazarProveedorAdmin(userId, nota);
      toast({
        title: "Verificación rechazada",
        description: "La solicitud ha sido rechazada y el proveedor fue notificado por correo.",
        variant: "destructive"
      });
      setDocsDialogUser(null);
      setNotaRechazo("");
      await cargarDatos();
    } catch (err: any) {
      toast({
        title: "Error al rechazar",
        description: err.response?.data?.mensaje || "No se pudo completar la operación.",
        variant: "destructive"
      });
    }
  };

  const handleModerarResena = async (id: number, accion: 'ocultar' | 'restaurar') => {
    try {
      await moderarResena(id, accion);
      toast({ title: accion === 'ocultar' ? 'Reseña ocultada' : 'Reseña conservada' });
      cargarResenasReportadas();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.mensaje || "No se pudo moderar la reseña.", variant: "destructive" });
    }
  };

  const handleEliminarResena = async (id: number) => {
    if (!confirm("¿Eliminar esta reseña definitivamente? Esta acción no se puede deshacer.")) return;
    try {
      await eliminarResena(id);
      toast({ title: "Reseña eliminada", description: "La reseña fue eliminada y la calificación del proveedor recalculada." });
      cargarResenasReportadas();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.mensaje || "No se pudo eliminar la reseña.", variant: "destructive" });
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
      <header className="bg-card/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200 ease-in-out shrink-0">
              <MapPin className="size-4 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight hidden xs:inline">Local<span className="text-primary">Service</span></span>
            <Badge className="text-xs bg-destructive/10 text-destructive border border-destructive/20 font-semibold hidden sm:inline-flex">Admin</Badge>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted transition-all duration-200 ease-in-out group" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="size-4 text-slate-400 group-hover:text-primary transition-colors duration-200" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold">
                    {notifCount}
                  </span>
                )}
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onCountChange={setNotifCount} />
            </div>
            <Avatar className="w-8 h-8 ring-2 ring-destructive/20">
              <AvatarFallback className="bg-destructive text-white text-xs font-bold">AD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200 ease-in-out" asChild>
              <Link to="/"><LogOut className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 animate-in fade-in duration-300">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Usuarios", value: stats.total_usuarios.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: "Proveedores Verificados", value: stats.proveedores_verificados.toString(), icon: ShieldCheck, color: "text-success", bg: "bg-success/10 border-success/20" },
            { label: "Verificación Pendiente", value: stats.verificaciones_pendientes.toString(), icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10 border-warning/20" },
            { label: "Reseñas Reportadas", value: stats.resenas_reportadas.toString(), icon: MessageSquare, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-md hover:border-border/80 transition-all duration-200 ease-in-out">
              <div className={`w-9 h-9 rounded-xl border ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="usuarios" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          <TabsList className="bg-card border border-border/60 p-1 rounded-2xl shadow-sm h-auto gap-1 w-max sm:w-auto min-w-full flex-nowrap">
            <TabsTrigger value="usuarios" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <Users className="size-3.5" />Usuarios
            </TabsTrigger>
            <TabsTrigger value="verificacion" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <ShieldCheck className="size-3.5" />
              Verificación
              {pendingVerifications.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-warning text-warning-foreground text-[9px] flex items-center justify-center font-bold">
                  {pendingVerifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="resenas" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <MessageSquare className="size-3.5" />Reseñas
            </TabsTrigger>
            <TabsTrigger value="reportes" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <BarChart3 className="size-3.5" />Reportes
            </TabsTrigger>
            <TabsTrigger value="disputas" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-destructive data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <AlertTriangle className="size-3.5" />Disputas
              {disputas.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold ml-1">
                  {disputas.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          </div>

          <TabsContent value="usuarios">
            <UsuariosSection
              filteredUsers={filteredUsers}
              searchUsers={searchUsers}
              onSearchChange={setSearchUsers}
              onViewUser={setSelectedUser}
              onDeleteUser={setDeleteConfirm}
            />
          </TabsContent>

          <TabsContent value="verificacion">
            <VerificacionSection
              pendingVerifications={pendingVerifications}
              onVerify={handleVerify}
              onReject={handleRejectVerification}
              onViewDocs={setDocsDialogUser}
            />
          </TabsContent>

          <TabsContent value="resenas">
            <ResenasSection
              resenasReportadas={resenasReportadas}
              onModerar={handleModerarResena}
              onEliminar={handleEliminarResena}
              onActualizar={cargarResenasReportadas}
            />
          </TabsContent>

          <TabsContent value="reportes">
            <ReportesSection stats={stats} />
          </TabsContent>

          <TabsContent value="disputas">
            <DisputasSection
              disputas={disputas}
              notaResolucion={notaResolucion}
              onNotaChange={setNotaResolucion}
              onResolver={handleResolverDisputa}
              onActualizar={cargarDisputas}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog: Detalle de Usuario */}
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
                <div className="flex items-center gap-3 text-sm"><Star className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">Ciudad: {selectedUser.city}</span></div>
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

      {/* Dialog: Confirmación de Eliminación */}
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

      {/* Dialog: Documentos de Verificación */}
      <Dialog open={docsDialogUser !== null} onOpenChange={open => { if (!open) { setDocsDialogUser(null); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Documentos del Proveedor</DialogTitle>
            <DialogDescription>Revisa los documentos cargados por {docsDialogUser?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
              <p><strong>Proveedor:</strong> {docsDialogUser?.name}</p>
              <p><strong>Email:</strong> {docsDialogUser?.email}</p>
              <p><strong>Categoría:</strong> {docsDialogUser?.categoria_servicio || "No especificada"}</p>
            </div>
            {[
              { label: 'Cédula de Ciudadanía', url: docsDialogUser?.doc_cedula },
              { label: 'RUT', url: docsDialogUser?.doc_rut },
              { label: 'Diploma / Certificado', url: docsDialogUser?.doc_diploma },
            ].map(({ label, url }) => (
              <div key={label} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
                {url ? (
                  /\.(jpg|jpeg|png|webp)$/i.test(url) ? (
                    <img
                      src={storageUrl(url)}
                      alt={label}
                      className="w-full rounded-lg border max-h-56 object-contain bg-muted"
                    />
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <p className="text-sm font-medium text-foreground">{label} (PDF)</p>
                      </div>
                      <a
                        href={storageUrl(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-primary text-primary-foreground font-semibold px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Abrir ↗
                      </a>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-xs font-medium">No cargado</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Nota de rechazo (opcional)</Label>
            <Textarea
              placeholder="Indica el motivo del rechazo para notificar al proveedor..."
              value={notaRechazo}
              onChange={e => setNotaRechazo(e.target.value)}
              className="rounded-xl border-border/70 resize-none"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDocsDialogUser(null)}>Cerrar</Button>
              {docsDialogUser && (
                <Button variant="destructive" onClick={() => handleRejectVerification(docsDialogUser.id, notaRechazo || undefined)}>
                  Rechazar con nota
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
