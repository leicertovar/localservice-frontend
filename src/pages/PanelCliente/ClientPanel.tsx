import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Clock, History, User, LogOut, Bell, Star, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationsPanel from "@/components/reusable/NotificationsPanel";
import ChatPanel from "@/components/reusable/ChatPanel";
import { fetchCurrentUser, getUserProfile, actualizarPerfilCliente } from "@/services/authService";
import { obtenerProveedores } from "@/services/proveedorService";
import {
  obtenerSolicitudesCliente,
  aceptarCotizacion as apiAceptarCotizacion,
  rechazarCotizacion as apiRechazarCotizacion,
  confirmarCompletado,
  SolicitudServicioDatos
} from "@/services/reservaService";
import { crearResena, reportarResena } from "@/services/resenaService";
import BuscarProveedorSection from "./sections/BuscarProveedorSection";
import SolicitudesSection from "./sections/SolicitudesSection";
import HistorialSection from "./sections/HistorialSection";
import PerfilSection from "./sections/PerfilSection";

const ClientPanel = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudServicioDatos[]>([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContact, setChatContact] = useState({ name: "", initials: "", role: "", id: "" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ service: string; provider: string; proveedorId: string; solicitudId?: number }>({ service: "", provider: "", proveedorId: "" });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ resenaId: number; providerName: string } | null>(null);
  const [reportMotivo, setReportMotivo] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<SolicitudServicioDatos | null>(null);
  const [quejaTexto, setQuejaTexto] = useState("");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const [profileData, setProfileData] = useState({
    id: "", name: "", email: "", phone: "", city: "", direccion: "", foto_perfil: "",
  });
  const [editProfile, setEditProfile] = useState(profileData);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const mapearPerfil = (usuario: any) => {
    const pc = usuario.perfil_cliente || {};
    const datos = {
      id: usuario.id || "",
      name: `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim(),
      email: usuario.email || "",
      phone: usuario.telefono || "",
      city: pc.ciudad || "",
      direccion: pc.direccion || "",
      foto_perfil: pc.foto_perfil || "",
    };
    setProfileData(datos);
    setEditProfile(datos);
  };

  const cargarPerfil = async () => {
    const perfilGuardado = getUserProfile();
    if (perfilGuardado) mapearPerfil(perfilGuardado);
    try {
      const usuarioActual = await fetchCurrentUser();
      mapearPerfil(usuarioActual);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  };

  const cargarProveedores = async () => {
    try {
      const datos = await obtenerProveedores();
      setProveedores(datos);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
    } finally {
      setCargandoProveedores(false);
    }
  };

  const cargarSolicitudesCliente = async () => {
    try {
      const datos = await obtenerSolicitudesCliente();
      setSolicitudes(datos);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  useEffect(() => {
    cargarPerfil();
    cargarProveedores();
    cargarSolicitudesCliente();
  }, []);

  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("categoria");
    if (q) setSearchTerm(q);
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const abrirChatConProveedor = (nombre: string, id: string) => {
    const iniciales = nombre.split(" ").map(n => n[0]).join("").toUpperCase();
    setChatContact({ name: nombre, initials: iniciales, role: "Proveedor de servicios", id });
    setChatOpen(true);
  };

  const aceptarCotizacionProveedor = async (id: number) => {
    try {
      await apiAceptarCotizacion(id);
      toast({ title: "Cotización aceptada", description: "El servicio ha sido agendado." });
      cargarSolicitudesCliente();
    } catch {
      toast({ title: "Error", description: "No se pudo aceptar la cotización.", variant: "destructive" });
    }
  };

  const rechazarCotizacionProveedor = async (id: number) => {
    try {
      await apiRechazarCotizacion(id);
      toast({ title: "Cotización rechazada", variant: "destructive" });
      cargarSolicitudesCliente();
    } catch {
      toast({ title: "Error", description: "No se pudo rechazar la cotización.", variant: "destructive" });
    }
  };

  const publicarResenaCliente = async () => {
    if (!reviewComment.trim()) return;
    try {
      await crearResena({ proveedor_id: reviewTarget.proveedorId, solicitud_id: reviewTarget.solicitudId, calificacion: reviewRating, comentario: reviewComment });
      setReviewDialogOpen(false);
      setReviewComment("");
      setReviewRating(5);
      toast({ title: "Reseña publicada", description: `Tu calificación de ${reviewRating} estrellas ha sido publicada.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.mensaje || "No se pudo publicar la reseña.", variant: "destructive" });
    }
  };

  const handleReportarResena = async () => {
    if (!reportTarget || !reportMotivo.trim()) return;
    try {
      await reportarResena(reportTarget.resenaId, reportMotivo);
      setReportDialogOpen(false);
      setReportMotivo("");
      toast({ title: "Reseña reportada", description: "El administrador revisará la reseña." });
    } catch {
      toast({ title: "Error", description: "No se pudo reportar la reseña.", variant: "destructive" });
    }
  };

  const confirmarServicio = async (accion: 'aceptar' | 'rechazar') => {
    if (!confirmTarget?.id) return;
    try {
      await confirmarCompletado(confirmTarget.id, accion, accion === 'rechazar' ? quejaTexto : undefined);
      setConfirmDialogOpen(false);
      setQuejaTexto("");
      toast({
        title: accion === 'aceptar' ? "Servicio confirmado" : "Queja enviada",
        description: accion === 'aceptar' ? "¡Gracias por confirmar! Ya puedes dejar tu reseña." : "Tu queja ha sido enviada al administrador.",
      });
      cargarSolicitudesCliente();
    } catch {
      toast({ title: "Error", description: "No se pudo procesar la confirmación.", variant: "destructive" });
    }
  };

  const guardarCambiosPerfil = async () => {
    setGuardandoPerfil(true);
    try {
      const formData = new FormData();
      formData.append('nombre', editProfile.name.split(" ")[0] || editProfile.name);
      formData.append('apellido', editProfile.name.split(" ").slice(1).join(" ") || "");
      formData.append('email', editProfile.email);
      formData.append('telefono', editProfile.phone);
      formData.append('ciudad', editProfile.city);
      formData.append('direccion', editProfile.direccion);
      if (fotoFile) formData.append('foto_perfil', fotoFile);
      const res = await actualizarPerfilCliente(formData);
      if (res.usuario) {
        localStorage.setItem('user_profile', JSON.stringify(res.usuario));
        mapearPerfil(res.usuario);
      }
      setEditProfileOpen(false);
      setFotoFile(null);
      toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados correctamente." });
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.mensaje || "No se pudo actualizar el perfil.", variant: "destructive" });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const serviciosCompletadosPendientes = solicitudes.filter(s => s.estado === 'completada' && !s.confirmacion_cliente);
  const historial = solicitudes.filter(s => s.estado === 'completada' && s.confirmacion_cliente === 'aceptado');
  const nombreCorto = profileData.name ? profileData.name.split(" ")[0] : "Cliente";
  const cotizacionesPendientes = solicitudes.filter(s => s.estado === 'cotizado').length;

  const inputClass = "h-10 rounded-xl border-border/70 bg-white placeholder:text-muted-foreground/50 focus-visible:ring-primary/25 focus-visible:border-primary/50";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border/60 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">LS</span>
            </div>
            <span className="font-bold text-foreground">LocalService</span>
            <Badge className="text-xs bg-primary/10 text-primary border border-primary/20 font-medium">Cliente</Badge>
          </Link>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl hover:bg-muted"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-4.5 h-4.5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold">
                    {notifCount}
                  </span>
                )}
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onCountChange={setNotifCount} />
            </div>

            <Avatar className="w-8 h-8 ring-2 ring-primary/20">
              {profileData.foto_perfil ? <AvatarImage src={profileData.foto_perfil} alt={profileData.name} /> : null}
              <AvatarFallback className="bg-primary text-white text-xs font-bold">
                {profileData.name ? profileData.name.split(" ").map(n => n[0]).join("") : "CL"}
              </AvatarFallback>
            </Avatar>

            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" asChild>
              <Link to="/"><LogOut className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">¡Hola, {nombreCorto}! 👋</h1>
          <p className="text-muted-foreground mt-0.5">¿Qué servicio necesitas hoy?</p>
        </div>

        <Tabs defaultValue="buscar" className="space-y-6">
          <TabsList className="bg-white border border-border/60 p-1 rounded-2xl shadow-sm h-auto gap-1 flex-wrap">
            <TabsTrigger value="buscar" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
              <Search className="w-3.5 h-3.5" />
              Buscar
            </TabsTrigger>
            <TabsTrigger value="solicitudes" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
              <Clock className="w-3.5 h-3.5" />
              Solicitudes
              {cotizacionesPendientes > 0 && (
                <span className="w-4 h-4 rounded-full bg-warning text-warning-foreground text-[9px] flex items-center justify-center font-bold">
                  {cotizacionesPendientes}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
              <History className="w-3.5 h-3.5" />
              Historial
              {serviciosCompletadosPendientes.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-info text-info-foreground text-[9px] flex items-center justify-center font-bold">
                  {serviciosCompletadosPendientes.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2 rounded-xl h-9 px-4 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
              <User className="w-3.5 h-3.5" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buscar">
            <BuscarProveedorSection
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              proveedores={proveedores}
              cargandoProveedores={cargandoProveedores}
              filtersOpen={filtersOpen}
              setFiltersOpen={setFiltersOpen}
              filterLocation={filterLocation}
              setFilterLocation={setFilterLocation}
              filterAvailable={filterAvailable}
              setFilterAvailable={setFilterAvailable}
              filterMinRating={filterMinRating}
              setFilterMinRating={setFilterMinRating}
              onAbrirChat={abrirChatConProveedor}
            />
          </TabsContent>

          <TabsContent value="solicitudes">
            <SolicitudesSection
              solicitudes={solicitudes}
              onAceptarCotizacion={aceptarCotizacionProveedor}
              onRechazarCotizacion={rechazarCotizacionProveedor}
              onAbrirChat={abrirChatConProveedor}
            />
          </TabsContent>

          <TabsContent value="historial">
            <HistorialSection
              historial={historial}
              serviciosCompletadosPendientes={serviciosCompletadosPendientes}
              onOpenReview={target => { setReviewTarget(target); setReviewDialogOpen(true); }}
              onOpenConfirm={target => { setConfirmTarget(target); setConfirmDialogOpen(true); }}
            />
          </TabsContent>

          <TabsContent value="perfil">
            <PerfilSection
              profileData={profileData}
              totalSolicitudes={solicitudes.length}
              onOpenEditProfile={() => { setEditProfile(profileData); setFotoFile(null); setEditProfileOpen(true); }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog: Editar Perfil */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza tu información personal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                {(fotoFile ? URL.createObjectURL(fotoFile) : editProfile.foto_perfil) && (
                  <AvatarImage src={fotoFile ? URL.createObjectURL(fotoFile) : editProfile.foto_perfil} />
                )}
                <AvatarFallback className="bg-primary text-white text-xl font-bold">
                  {editProfile.name ? editProfile.name.split(" ").map(n => n[0]).join("") : "CL"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground font-medium block mb-1.5">Foto de perfil</Label>
                <Input type="file" accept="image/*" className="text-xs h-9 rounded-lg" onChange={e => setFotoFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nombre completo</Label>
              <Input className={inputClass} value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email</Label>
              <Input type="email" className={inputClass} value={editProfile.email} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Teléfono</Label>
              <Input className={inputClass} value={editProfile.phone} onChange={e => setEditProfile({ ...editProfile, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Ciudad</Label>
                <Input className={inputClass} value={editProfile.city} onChange={e => setEditProfile({ ...editProfile, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Dirección</Label>
                <Input className={inputClass} value={editProfile.direccion} onChange={e => setEditProfile({ ...editProfile, direccion: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={guardarCambiosPerfil} className="flex-1 h-10 rounded-xl font-semibold" disabled={guardandoPerfil}>
                {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button variant="outline" className="h-10 rounded-xl border-border/60" onClick={() => setEditProfileOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Dejar Reseña */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Dejar Reseña</DialogTitle>
            <DialogDescription>Califica el servicio de {reviewTarget.provider}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tu calificación</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`w-8 h-8 ${s <= reviewRating ? "text-warning fill-warning" : "text-muted-foreground/20"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tu comentario</Label>
              <Textarea
                placeholder="Describe tu experiencia con este servicio..."
                rows={4}
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                className="rounded-xl border-border/70 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={publicarResenaCliente} className="flex-1 h-10 rounded-xl font-semibold" disabled={!reviewComment.trim()}>
                Publicar reseña
              </Button>
              <Button variant="outline" className="h-10 rounded-xl border-border/60" onClick={() => setReviewDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Reportar Reseña */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Reportar Reseña</DialogTitle>
            <DialogDescription>¿Por qué quieres reportar esta reseña?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Motivo del reporte</Label>
              <Textarea
                placeholder="Describe el problema con esta reseña..."
                rows={3}
                value={reportMotivo}
                onChange={e => setReportMotivo(e.target.value)}
                className="rounded-xl border-border/70 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleReportarResena}
                className="flex-1 h-10 rounded-xl font-semibold gap-2"
                disabled={!reportMotivo.trim()}
                variant="destructive"
              >
                <AlertTriangle className="w-4 h-4" />Reportar
              </Button>
              <Button variant="outline" className="h-10 rounded-xl border-border/60" onClick={() => setReportDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Servicio Completado */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Confirmar Servicio</DialogTitle>
            <DialogDescription>
              ¿Quedaste satisfecho con "{confirmTarget?.servicio?.nombre || "Servicio Personalizado"}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/40 border border-border/60 rounded-xl text-sm space-y-1">
              <p><span className="font-semibold">Proveedor:</span> {confirmTarget?.proveedor ? `${confirmTarget.proveedor.nombre} ${confirmTarget.proveedor.apellido || ""}` : "Proveedor"}</p>
              <p><span className="font-semibold">Monto:</span> {confirmTarget?.monto_cotizado}</p>
              <p><span className="font-semibold">Fecha:</span> {confirmTarget?.fecha}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">¿Tienes alguna queja? (solo si rechazas)</Label>
              <Textarea
                placeholder="Describe el problema si el servicio no fue satisfactorio..."
                rows={3}
                value={quejaTexto}
                onChange={e => setQuejaTexto(e.target.value)}
                className="rounded-xl border-border/70 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => confirmarServicio('aceptar')}
                className="flex-1 h-10 rounded-xl font-semibold bg-success hover:bg-success/90 text-success-foreground"
              >
                ✓ Aceptar servicio
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl font-semibold text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => confirmarServicio('rechazar')}
              >
                Rechazar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChatPanel
        contactName={chatContact.name}
        contactInitials={chatContact.initials}
        contactRole={chatContact.role}
        contactId={chatContact.id}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
};

export default ClientPanel;
