import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Clock, MessageCircle, History, User, LogOut, Bell, Filter, ChevronRight, FileText, Download, SlidersHorizontal, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationsPanel from "@/components/reusable/NotificationsPanel";
import ChatPanel from "@/components/reusable/ChatPanel";
import { fetchCurrentUser, getUserProfile, UserProfile } from "@/services/authService";
import { obtenerProveedores } from "@/services/proveedorService";
import { 
  obtenerSolicitudesCliente, 
  aceptarCotizacion as apiAceptarCotizacion, 
  rechazarCotizacion as apiRechazarCotizacion,
  SolicitudServicioDatos
} from "@/services/reservaService";

const categorias = ["Todas", "Plomería", "Electricidad", "Limpieza", "Pintura", "Jardinería", "Tecnología"];

const ClientPanel = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  
  // --- Estados de Datos de API ---
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudServicioDatos[]>([]);
  const [cargandoProveedores, setCargandoProveedores] = useState(true);

  // --- Estados de Interfaz ---
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContact, setChatContact] = useState({ name: "", initials: "", role: "" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterLocation, setFilterLocation] = useState("");
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState({ service: "", provider: "" });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [profileData, setProfileData] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [editProfile, setEditProfile] = useState<UserProfile>(profileData);
  const { toast } = useToast();

  /**
   * Carga el perfil del usuario autenticado.
   */
  const cargarPerfil = async () => {
    const perfilGuardado = getUserProfile();
    if (perfilGuardado) {
      setProfileData(perfilGuardado);
      setEditProfile(perfilGuardado);
      return;
    }

    try {
      const usuarioActual = await fetchCurrentUser();
      setProfileData(usuarioActual);
      setEditProfile(usuarioActual);
    } catch (error) {
      console.error("Error al cargar perfil del usuario:", error);
    }
  };

  /**
   * Carga el listado de proveedores desde el backend.
   */
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

  /**
   * Carga las solicitudes del cliente desde la API.
   */
  const cargarSolicitudesCliente = async () => {
    try {
      const datos = await obtenerSolicitudesCliente();
      setSolicitudes(datos);
    } catch (error) {
      console.error("Error al obtener solicitudes del cliente:", error);
    }
  };

  // Carga inicial al montar el componente
  useEffect(() => {
    cargarPerfil();
    cargarProveedores();
    cargarSolicitudesCliente();
  }, []);

  // Leer parámetros de búsqueda de la URL (si vienen de la Landing Page)
  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("categoria");
    if (q) setSearchTerm(q);
    if (cat && categorias.includes(cat)) setSelectedCategory(cat);
  }, [searchParams]);

  // Filtrado de proveedores en el frontend
  const proveedoresFiltrados = proveedores.filter(p => {
    const coincideBusqueda = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideCategoria = selectedCategory === "Todas" || p.category === selectedCategory;
    const coincideUbicacion = !filterLocation || p.location.toLowerCase().includes(filterLocation.toLowerCase());
    const coincideDisponibilidad = !filterAvailable || p.available;
    const coincideCalificacion = p.rating >= filterMinRating;
    return coincideBusqueda && coincideCategoria && coincideUbicacion && coincideDisponibilidad && coincideCalificacion;
  });

  /**
   * Abre la ventana de chat directo con el proveedor.
   */
  const abrirChatConProveedor = (nombre: string) => {
    const iniciales = nombre.split(" ").map(n => n[0]).join("");
    setChatContact({ name: nombre, initials, role: "Proveedor de servicios" });
    setChatOpen(true);
  };

  /**
   * Envía la confirmación al servidor para aceptar la cotización.
   */
  const aceptarCotizacionProveedor = async (id: number) => {
    try {
      await apiAceptarCotizacion(id);
      toast({ 
        title: "Cotización aceptada", 
        description: `Has aceptado la cotización y el servicio ha sido agendado. El proveedor ya lo ve en su agenda.` 
      });
      cargarSolicitudesCliente();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo aceptar la cotización en este momento.", variant: "destructive" });
    }
  };

  /**
   * Envía la denegación al servidor para rechazar la cotización.
   */
  const rechazarCotizacionProveedor = async (id: number) => {
    try {
      await apiRechazarCotizacion(id);
      toast({ 
        title: "Cotización rechazada", 
        description: `Has rechazado la cotización. El estado se ha actualizado a 'rechazada'.`,
        variant: "destructive"
      });
      cargarSolicitudesCliente();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo rechazar la cotización en este momento.", variant: "destructive" });
    }
  };

  const descargarFacturaServicio = (invoiceId: string) => {
    toast({ title: "Descargando factura", description: `Factura ${invoiceId} descargándose...` });
  };

  const guardarCambiosPerfil = () => {
    setProfileData(editProfile);
    setEditProfileOpen(false);
    toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados correctamente." });
  };

  const publicarResenaCliente = () => {
    if (!reviewComment.trim()) return;
    setReviewDialogOpen(false);
    setReviewComment("");
    setReviewRating(5);
    toast({ title: "Reseña publicada", description: `Tu calificación de ${reviewRating} estrellas para "${reviewTarget.service}" ha sido publicada.` });
  };

  // Historial de servicios estáticos (Mock)
  const mockHistory = [
    { id: 2, service: "Reparación eléctrica", provider: "Jorge Ramírez", date: "2026-03-15", total: "$180.000", rating: 4, invoiceId: "INV-2026-0038" },
  ];

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
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                  {solicitudes.filter(s => s.estado === 'cotizado').length}
                </span>
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            </div>
            <Avatar className="w-8 h-8">
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
          <h1 className="text-2xl font-bold text-foreground">¡Hola, {profileData.name ? profileData.name.split(" ")[0] : "Cliente"}! 👋</h1>
          <p className="text-muted-foreground">¿Qué servicio necesitas hoy?</p>
        </div>

        <Tabs defaultValue="buscar" className="space-y-6">
          <TabsList className="bg-muted flex-wrap">
            <TabsTrigger value="buscar" className="gap-2"><Search className="w-4 h-4" />Buscar Proveedor</TabsTrigger>
            <TabsTrigger value="solicitudes" className="gap-2"><Clock className="w-4 h-4" />Mis Solicitudes</TabsTrigger>
            <TabsTrigger value="historial" className="gap-2"><History className="w-4 h-4" />Historial</TabsTrigger>
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
                  {(filterLocation || filterAvailable || filterMinRating > 0) && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </Button>
              </div>

              {/* Panel de Filtros */}
              {filtersOpen && (
                <div className="bg-card border rounded-xl p-5 space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <Filter className="w-4 h-4" />Filtros avanzados
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => { setFilterLocation(""); setFilterAvailable(false); setFilterMinRating(0); }}>
                      Limpiar filtros
                    </Button>
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
                {categorias.map(cat => (
                  <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="text-xs">
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Listado de Proveedores de la API */}
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
                        <Button variant="outline" size="sm" onClick={() => abrirChatConProveedor(provider.name)}><MessageCircle className="w-4 h-4" /></Button>
                        <Button size="sm" asChild><Link to={`/proveedor/${provider.id}`}>Ver perfil<ChevronRight className="w-4 h-4 ml-1" /></Link></Button>
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
            {solicitudes.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                Aún no has enviado solicitudes de cotización. Visita los perfiles de los proveedores para solicitar una.
              </div>
            ) : solicitudes.map(req => {
              // Estilo del badge por estado
              let estadoBadge = "bg-muted text-muted-foreground";
              let estadoTexto = req.estado;
              if (req.estado === 'pendiente') {
                estadoBadge = "bg-info/10 text-info";
                estadoTexto = "Pendiente de Cotizar";
              } else if (req.estado === 'cotizado') {
                estadoBadge = "bg-warning/10 text-warning";
                estadoTexto = "Cotización Recibida";
              } else if (req.estado === 'aceptada') {
                estadoBadge = "bg-success/10 text-success";
                estadoTexto = "Confirmado / Agendado";
              } else if (req.estado === 'rechazada') {
                estadoBadge = "bg-destructive/10 text-destructive";
                estadoTexto = "Rechazada";
              } else if (req.estado === 'completada') {
                estadoBadge = "bg-success text-success-foreground";
                estadoTexto = "Trabajo Completado";
              }

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
                      <p className="text-xs text-muted-foreground mt-1">Fecha programada: {req.fecha} · Hora: {req.hora}</p>
                      
                      {req.estado === 'cotizado' && req.monto_cotizado && (
                        <div className="mt-3 p-3 bg-muted/60 border rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground">Monto Cotizado</p>
                              <p className="text-lg font-bold text-primary">{req.monto_cotizado}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Tiempo de Ejecución</p>
                              <p className="text-sm font-semibold text-foreground">{req.tiempo_estimado}</p>
                            </div>
                          </div>
                          {req.garantia && (
                            <p className="text-xs text-muted-foreground"><strong className="text-foreground">Garantía:</strong> {req.garantia}</p>
                          )}
                          {req.detalles_cotizacion && (
                            <p className="text-xs text-muted-foreground mt-1"><strong className="text-foreground">Detalles del Proveedor:</strong> {req.detalles_cotizacion}</p>
                          )}
                        </div>
                      )}

                      {req.estado === 'aceptada' && req.monto_cotizado && (
                        <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                          <p className="text-xs text-muted-foreground">Monto acordado: <strong className="text-foreground">{req.monto_cotizado}</strong></p>
                          <p className="text-xs text-muted-foreground">Tiempo de trabajo: <strong className="text-foreground">{req.tiempo_estimado}</strong></p>
                          {req.garantia && <p className="text-xs text-muted-foreground">Garantía del trabajo: <strong className="text-foreground">{req.garantia}</strong></p>}
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
                      <Button size="sm" variant="ghost" onClick={() => abrirChatConProveedor(proveedorNombre)}>
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
            {mockHistory.map(item => (
              <div key={item.id} className="bg-card rounded-xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.service}</h3>
                    <p className="text-sm text-muted-foreground">Proveedor: {item.provider} · {item.date}</p>
                  </div>
                  <Badge className="bg-success/10 text-success">Completado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= item.rating ? "text-warning fill-warning" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item.total}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
                      setReviewTarget({ service: item.service, provider: item.provider });
                      setReviewDialogOpen(true);
                    }}>
                      <Star className="w-3 h-3" />Dejar reseña
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => descargarFacturaServicio(item.invoiceId)}>
                      <Download className="w-3 h-3" />Factura
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" />{item.invoiceId}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Tab de Perfil */}
          <TabsContent value="perfil" className="max-w-lg space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Mi Perfil</h2>
            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
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
                <div><label className="text-xs text-muted-foreground">Servicios solicitados</label><p className="text-sm font-medium text-foreground">{solicitudes.length}</p></div>
                <div><label className="text-xs text-muted-foreground">Miembro desde</label><p className="text-sm font-medium text-foreground">Marzo 2026</p></div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setEditProfile(profileData); setEditProfileOpen(true); }}>Editar Perfil</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza tu información personal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editProfile.email} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={editProfile.phone} onChange={e => setEditProfile({ ...editProfile, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input value={editProfile.city} onChange={e => setEditProfile({ ...editProfile, city: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={guardarCambiosPerfil} className="flex-1">Guardar cambios</Button>
              <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leave Review Dialog */}
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

      <ChatPanel contactName={chatContact.name} contactInitials={chatContact.initials} contactRole={chatContact.role} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default ClientPanel;
