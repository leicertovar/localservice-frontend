import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Clock, MessageCircle, History, User, LogOut, Bell, Filter, ChevronRight, FileText, Download, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const CATEGORIAS = ["Todas", "Plomería", "Electricidad", "Limpieza", "Pintura", "Jardinería", "Tecnología", "Otro"];

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
  const fotoPreviaRef = useRef<string | null>(null);

  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    direccion: "",
    foto_perfil: "",
  });
  const [editProfile, setEditProfile] = useState(profileData);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const { toast } = useToast();

  const cargarPerfil = async () => {
    const perfilGuardado = getUserProfile();
    if (perfilGuardado) mapearPerfil(perfilGuardado);
    try {
      const usuarioActual = await fetchCurrentUser();
      mapearPerfil(usuarioActual);
    } catch (error) {
      console.error("Error al cargar perfil del usuario:", error);
    }
  };

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
      console.error("Error al obtener solicitudes del cliente:", error);
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
    if (cat && CATEGORIAS.includes(cat)) setSelectedCategory(cat);
  }, [searchParams]);

  const proveedoresFiltrados = proveedores.filter(p => {
    const coincideBusqueda = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideCategoria = selectedCategory === "Todas" || p.category === selectedCategory;
    const coincideUbicacion = !filterLocation || p.location.toLowerCase().includes(filterLocation.toLowerCase());
    const coincideDisponibilidad = !filterAvailable || p.available;
    const coincideCalificacion = p.rating >= filterMinRating;
    return coincideBusqueda && coincideCategoria && coincideUbicacion && coincideDisponibilidad && coincideCalificacion;
  });

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
    } catch (error) {
      toast({ title: "Error", description: "No se pudo aceptar la cotización.", variant: "destructive" });
    }
  };

  const rechazarCotizacionProveedor = async (id: number) => {
    try {
      await apiRechazarCotizacion(id);
      toast({ title: "Cotización rechazada", variant: "destructive" });
      cargarSolicitudesCliente();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo rechazar la cotización.", variant: "destructive" });
    }
  };

  const publicarResenaCliente = async () => {
    if (!reviewComment.trim()) return;
    try {
      await crearResena({
        proveedor_id: reviewTarget.proveedorId,
        solicitud_id: reviewTarget.solicitudId,
        calificacion: reviewRating,
        comentario: reviewComment,
      });
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
        description: accion === 'aceptar' ? "¡Gracias por confirmar! Ya puedes dejar tu reseña." : "Tu queja ha sido enviada al administrador."
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

  // Servicios completados pendientes de confirmación del cliente
  const serviciosCompletadosPendientes = solicitudes.filter(
    s => s.estado === 'completada' && !s.confirmacion_cliente
  );
  // Historial: completados y confirmados por el cliente
  const historial = solicitudes.filter(
    s => s.estado === 'completada' && s.confirmacion_cliente === 'aceptado'
  );

  const nombreCorto = profileData.name ? profileData.name.split(" ")[0] : "Cliente";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">LS</span>
            </div>
            <span className="font-bold text-foreground">LocalService</span>
            <Badge variant="secondary" className="text-xs">Cliente</Badge>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onCountChange={setNotifCount} />
            </div>
            <Avatar className="w-8 h-8">
              {profileData.foto_perfil ? (
                <AvatarImage src={profileData.foto_perfil} alt={profileData.name} />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {profileData.name ? profileData.name.split(" ").map(n => n[0]).join("") : "CL"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><LogOut className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">¡Hola, {nombreCorto}! 👋</h1>
          <p className="text-muted-foreground">¿Qué servicio necesitas hoy?</p>
        </div>

        <Tabs defaultValue="buscar" className="space-y-6">
          <TabsList className="bg-muted flex-wrap">
            <TabsTrigger value="buscar" className="gap-2"><Search className="w-4 h-4" />Buscar Proveedor</TabsTrigger>
            <TabsTrigger value="solicitudes" className="gap-2">
              <Clock className="w-4 h-4" />Mis Solicitudes
              {solicitudes.filter(s => s.estado === 'cotizado').length > 0 && (
                <Badge className="ml-1 text-[10px] px-1.5 py-0 bg-warning text-warning-foreground">
                  {solicitudes.filter(s => s.estado === 'cotizado').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2">
              <History className="w-4 h-4" />Historial
              {serviciosCompletadosPendientes.length > 0 && (
                <Badge className="ml-1 text-[10px] px-1.5 py-0 bg-info text-white">
                  {serviciosCompletadosPendientes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2"><User className="w-4 h-4" />Mi Perfil</TabsTrigger>
          </TabsList>

          {/* Tab de Búsqueda */}
          <TabsContent value="buscar" className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar servicio o proveedor..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <Button variant="outline" className="gap-2" onClick={() => setFiltersOpen(!filtersOpen)}>
                  <SlidersHorizontal className="w-4 h-4" />Filtros
                  {(filterLocation || filterAvailable || filterMinRating > 0) && <span className="w-2 h-2 rounded-full bg-primary" />}
                </Button>
              </div>

              {filtersOpen && (
                <div className="bg-card border rounded-xl p-5 space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><Filter className="w-4 h-4" />Filtros avanzados</h3>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { setFilterLocation(""); setFilterAvailable(false); setFilterMinRating(0); }}>Limpiar</Button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Ubicación</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input placeholder="Ej: Buenaventura" className="pl-8 h-9 text-sm" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Calificación mínima</Label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => setFilterMinRating(filterMinRating === s ? 0 : s)} className="p-1">
                            <Star className={`w-5 h-5 ${s <= filterMinRating ? "text-warning fill-warning" : "text-muted"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Disponibilidad</Label>
                      <Button variant={filterAvailable ? "default" : "outline"} size="sm" className="w-full text-xs" onClick={() => setFilterAvailable(!filterAvailable)}>
                        {filterAvailable ? "✓ Solo disponibles" : "Todos"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {CATEGORIAS.map(cat => (
                  <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="text-xs">{cat}</Button>
                ))}
              </div>
            </div>

            {cargandoProveedores ? (
              <p className="text-muted-foreground text-sm text-center py-12">Obteniendo proveedores de servicios en la zona...</p>
            ) : proveedoresFiltrados.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-card">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">No se encontraron proveedores</p>
                <p className="text-sm text-muted-foreground">Intenta con otros filtros o categorías</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proveedoresFiltrados.map(provider => (
                  <div key={provider.id} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        {provider.foto_perfil && <AvatarImage src={provider.foto_perfil} alt={provider.name} />}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {provider.name ? provider.name.split(" ").map((n: string) => n[0]).join("") : "PV"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link to={`/proveedor/${provider.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">{provider.name}</Link>
                        <p className="text-sm text-muted-foreground">{provider.category}</p>
                      </div>
                      <Badge variant={provider.available ? "default" : "secondary"} className="text-xs">{provider.available ? "Disponible" : "Ocupado"}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-warning fill-warning" />{provider.rating} ({provider.reviews})</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{provider.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{provider.price}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => abrirChatConProveedor(provider.name, provider.id)}>
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" asChild>
                          <Link to={`/proveedor/${provider.id}`}>Ver perfil<ChevronRight className="w-4 h-4 ml-1" /></Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab de Solicitudes */}
          <TabsContent value="solicitudes" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mis Solicitudes y Cotizaciones</h2>
            {solicitudes.filter(s => s.estado !== 'completada').length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                Aún no has enviado solicitudes de cotización. Visita los perfiles de los proveedores para solicitar una.
              </div>
            ) : solicitudes.filter(s => s.estado !== 'completada').map(req => {
              let estadoBadge = "bg-muted text-muted-foreground";
              let estadoTexto = req.estado ?? "";
              if (req.estado === 'pendiente') { estadoBadge = "bg-info/10 text-info"; estadoTexto = "Pendiente de Cotizar"; }
              else if (req.estado === 'cotizado') { estadoBadge = "bg-warning/10 text-warning"; estadoTexto = "Cotización Recibida"; }
              else if (req.estado === 'aceptada') { estadoBadge = "bg-success/10 text-success"; estadoTexto = "Confirmado / Agendado"; }
              else if (req.estado === 'rechazada') { estadoBadge = "bg-destructive/10 text-destructive"; estadoTexto = "Rechazada"; }

              const proveedorNombre = req.proveedor ? `${req.proveedor.nombre} ${req.proveedor.apellido || ""}`.trim() : "Proveedor";

              return (
                <div key={req.id} className="bg-card rounded-xl border p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{req.servicio?.nombre || "Servicio Personalizado"}</h3>
                        <Badge className={`${estadoBadge} text-xs`}>{estadoTexto}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Proveedor: {proveedorNombre}</p>
                      <p className="text-xs text-muted-foreground mt-1">Fecha: {req.fecha} · Hora: {req.hora}</p>

                      {req.estado === 'cotizado' && req.monto_cotizado && (
                        <div className="mt-3 p-3 bg-muted/60 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div><p className="text-xs text-muted-foreground">Monto Cotizado</p><p className="text-lg font-bold text-primary">{req.monto_cotizado}</p></div>
                            <div className="text-right"><p className="text-xs text-muted-foreground">Tiempo</p><p className="text-sm font-semibold">{req.tiempo_estimado}</p></div>
                          </div>
                          {req.garantia && <p className="text-xs text-muted-foreground"><strong>Garantía:</strong> {req.garantia}</p>}
                          {req.detalles_cotizacion && <p className="text-xs text-muted-foreground"><strong>Detalles:</strong> {req.detalles_cotizacion}</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {req.estado === 'cotizado' && req.id && (
                        <>
                          <Button size="sm" onClick={() => req.id && aceptarCotizacionProveedor(req.id)}>Aceptar cotización</Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => req.id && rechazarCotizacionProveedor(req.id)}>Rechazar</Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => abrirChatConProveedor(proveedorNombre, req.proveedor_id)}>
                        <MessageCircle className="w-4 h-4 mr-1" />Chat
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Tab de Historial */}
          <TabsContent value="historial" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Historial de Servicios</h2>

            {/* Servicios completados pendientes de confirmación */}
            {serviciosCompletadosPendientes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-info flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Servicios completados — pendiente tu confirmación
                </h3>
                {serviciosCompletadosPendientes.map(sol => {
                  const provNombre = sol.proveedor ? `${sol.proveedor.nombre} ${sol.proveedor.apellido || ""}`.trim() : "Proveedor";
                  return (
                    <div key={sol.id} className="bg-card rounded-xl border border-info/30 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{sol.servicio?.nombre || "Servicio Personalizado"}</h4>
                          <p className="text-sm text-muted-foreground">Proveedor: {provNombre}</p>
                          <p className="text-xs text-muted-foreground">Fecha: {sol.fecha} · Monto: {sol.monto_cotizado}</p>
                        </div>
                        <Button size="sm" onClick={() => { setConfirmTarget(sol); setConfirmDialogOpen(true); }}>
                          Confirmar servicio
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Historial confirmado */}
            {historial.length === 0 && serviciosCompletadosPendientes.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                Aún no tienes servicios completados en tu historial.
              </div>
            ) : historial.map(item => {
              const provNombre = item.proveedor ? `${item.proveedor.nombre} ${item.proveedor.apellido || ""}`.trim() : "Proveedor";
              return (
                <div key={item.id} className="bg-card rounded-xl border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.servicio?.nombre || "Servicio Personalizado"}</h3>
                      <p className="text-sm text-muted-foreground">Proveedor: {provNombre} · {item.fecha}</p>
                    </div>
                    <Badge className="bg-success/10 text-success">Completado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">{item.monto_cotizado}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
                        setReviewTarget({
                          service: item.servicio?.nombre || "Servicio Personalizado",
                          provider: provNombre,
                          proveedorId: item.proveedor_id,
                          solicitudId: item.id,
                        });
                        setReviewDialogOpen(true);
                      }}>
                        <Star className="w-3 h-3" />Dejar reseña
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
                        toast({ title: "Factura", description: "La factura se descargará próximamente." });
                      }}>
                        <Download className="w-3 h-3" />Factura
                      </Button>
                    </div>
                  </div>
                  {item.id && (
                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" />INV-{String(item.id).padStart(6, '0')}
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>

          {/* Tab de Perfil */}
          <TabsContent value="perfil" className="max-w-lg space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Mi Perfil</h2>
            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {profileData.foto_perfil && <AvatarImage src={profileData.foto_perfil} alt={profileData.name} />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {profileData.name ? profileData.name.split(" ").map(n => n[0]).join("") : "CL"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{profileData.name}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">Teléfono</label><p className="text-sm font-medium text-foreground">{profileData.phone || "No especificado"}</p></div>
                <div><label className="text-xs text-muted-foreground">Ciudad</label><p className="text-sm font-medium text-foreground">{profileData.city || "No especificada"}</p></div>
                <div><label className="text-xs text-muted-foreground">Dirección</label><p className="text-sm font-medium text-foreground">{profileData.direccion || "No especificada"}</p></div>
                <div><label className="text-xs text-muted-foreground">Servicios solicitados</label><p className="text-sm font-medium text-foreground">{solicitudes.length}</p></div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setEditProfile(profileData); setFotoFile(null); setEditProfileOpen(true); }}>Editar Perfil</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog: Editar Perfil */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza tu información personal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Foto de perfil */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {(fotoFile ? URL.createObjectURL(fotoFile) : editProfile.foto_perfil) && (
                  <AvatarImage src={fotoFile ? URL.createObjectURL(fotoFile) : editProfile.foto_perfil} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {editProfile.name ? editProfile.name.split(" ").map(n => n[0]).join("") : "CL"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label className="text-xs text-muted-foreground block mb-1">Foto de perfil</Label>
                <Input
                  type="file"
                  accept="image/*"
                  className="text-xs"
                  onChange={e => setFotoFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="space-y-2"><Label>Nombre completo</Label><Input value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editProfile.email} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={editProfile.phone} onChange={e => setEditProfile({ ...editProfile, phone: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Ciudad</Label><Input value={editProfile.city} onChange={e => setEditProfile({ ...editProfile, city: e.target.value })} /></div>
              <div className="space-y-2"><Label>Dirección</Label><Input value={editProfile.direccion} onChange={e => setEditProfile({ ...editProfile, direccion: e.target.value })} /></div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={guardarCambiosPerfil} className="flex-1" disabled={guardandoPerfil}>
                {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Dejar Reseña */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dejar Reseña</DialogTitle>
            <DialogDescription>Califica el servicio "{reviewTarget.service}" de {reviewTarget.provider}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tu calificación</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`w-7 h-7 ${s <= reviewRating ? "text-warning fill-warning" : "text-muted hover:text-warning/50"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tu comentario</Label>
              <Textarea placeholder="Describe tu experiencia con este servicio..." rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={publicarResenaCliente} className="flex-1" disabled={!reviewComment.trim()}>Publicar reseña</Button>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Reportar Reseña */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reportar Reseña</DialogTitle>
            <DialogDescription>¿Por qué quieres reportar esta reseña?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo del reporte</Label>
              <Textarea placeholder="Describe el problema con esta reseña..." rows={3} value={reportMotivo} onChange={e => setReportMotivo(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleReportarResena} className="flex-1 gap-2" disabled={!reportMotivo.trim()} variant="destructive">
                <AlertTriangle className="w-4 h-4" />Reportar
              </Button>
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Servicio Completado */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Servicio</DialogTitle>
            <DialogDescription>
              ¿Quedaste satisfecho con el servicio "{confirmTarget?.servicio?.nombre || "Servicio Personalizado"}"?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p><strong>Proveedor:</strong> {confirmTarget?.proveedor ? `${confirmTarget.proveedor.nombre} ${confirmTarget.proveedor.apellido || ""}` : "Proveedor"}</p>
              <p><strong>Monto:</strong> {confirmTarget?.monto_cotizado}</p>
              <p><strong>Fecha:</strong> {confirmTarget?.fecha}</p>
            </div>
            <div className="space-y-2">
              <Label>¿Tienes alguna queja? (solo si rechazas)</Label>
              <Textarea placeholder="Describe el problema si el servicio no fue satisfactorio..." rows={3} value={quejaTexto} onChange={e => setQuejaTexto(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => confirmarServicio('aceptar')} className="flex-1 bg-success hover:bg-success/90">
                ✓ Aceptar servicio
              </Button>
              <Button variant="outline" className="text-destructive" onClick={() => confirmarServicio('rechazar')}>
                Rechazar y quejar
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
