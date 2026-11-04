import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, FileText, Star, Calendar, User, LogOut, Bell, TrendingUp, MapPin, AlertTriangle, ArrowUp } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationsPanel from "@/components/reusable/NotificationsPanel";
import ChatPanel from "@/components/reusable/ChatPanel";
import { fetchCurrentUser, getUserProfile } from "@/services/authService";
import { storageUrl } from "@/lib/api";
import { obtenerServicios, ServicioDatos } from "@/services/proveedorService";
import {
  obtenerSolicitudesProveedor,
  marcarCompletado,
  SolicitudServicioDatos,
} from "@/services/reservaService";
import { obtenerResenas, type Resena } from "@/services/resenaService";
import SolicitudesSection from "./sections/SolicitudesSection";
import CotizacionesSection from "./sections/CotizacionesSection";
import CompletadosSection from "./sections/CompletadosSection";
import ServiciosSection from "./sections/ServiciosSection";
import ResenasSection from "./sections/ResenasSection";
import AgendaSection from "./sections/AgendaSection";
import MapaSection from "./sections/MapaSection";
import DisputasSection from "./sections/DisputasSection";
import PerfilSection from "./sections/PerfilSection";

const CATEGORIAS_SERVICIO = ["Plomería","Electricidad","Limpieza","Pintura","Jardinería","Tecnología","Barbería","Manicure","Carpintería","Cerrajería","Mudanzas","Cuidado de Mascotas","Otro"];
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const horarioPorDefecto: Record<string, string> = {
  Lunes: "8:00 AM - 6:00 PM",
  Martes: "8:00 AM - 6:00 PM",
  Miércoles: "8:00 AM - 6:00 PM",
  Jueves: "8:00 AM - 6:00 PM",
  Viernes: "8:00 AM - 6:00 PM",
  Sábado: "9:00 AM - 1:00 PM",
  Domingo: "No disponible",
};

const normalizarHorario = (horario: any): Record<string, string> => {
  if (!horario) return { ...horarioPorDefecto };
  if (typeof horario === "object" && !Array.isArray(horario)) return { ...horarioPorDefecto, ...horario };
  if (typeof horario === "string") {
    try {
      const obj = JSON.parse(horario);
      if (typeof obj === "object" && obj !== null) return { ...horarioPorDefecto, ...obj };
    } catch {}
  }
  return { ...horarioPorDefecto };
};

const ProviderPanel = () => {
  const [misServicios, setMisServicios] = useState<ServicioDatos[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudServicioDatos[]>([]);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContact, setChatContact] = useState({ name: "", initials: "", role: "", id: "" });
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    apellido: "",
    email: "",
    phone: "",
    ciudad: "",
    title: "Proveedor de servicios",
    biografia: "",
    anios_experiencia: 0,
    precio_por_hora: 0,
    habilidades: "",
    enlaces_portafolio: "",
    horario_atencion: {} as Record<string, string>,
    esta_verificado: false,
    categoria_servicio: "",
    foto_perfil: "",
  });
  const [editProfile, setEditProfile] = useState(profileData);

  const { toast } = useToast();

  const rellenarPerfil = (usuario: any) => {
    const p = usuario.perfil_proveedor || {};
    const datos = {
      id: usuario.id || "",
      name: usuario.nombre || "",
      apellido: usuario.apellido || "",
      email: usuario.email || "",
      phone: usuario.telefono || "",
      ciudad: p.ciudad || "",
      title: p.categoria_servicio || "Proveedor de servicios",
      biografia: p.biografia || "",
      anios_experiencia: p.anios_experiencia || 0,
      precio_por_hora: Number(p.precio_por_hora) || 0,
      habilidades: p.habilidades || "",
      enlaces_portafolio: p.enlaces_portafolio || "",
      horario_atencion: normalizarHorario(p.horario_atencion),
      esta_verificado: p.esta_verificado || false,
      categoria_servicio: p.categoria_servicio || "",
      foto_perfil: p.foto_perfil || "",
    };
    setProfileData(datos);
    setEditProfile(datos);
  };

  const cargarPerfil = async () => {
    const perfilGuardado = getUserProfile();
    if (perfilGuardado) rellenarPerfil(perfilGuardado);
    try {
      const usuarioActual = await fetchCurrentUser();
      rellenarPerfil(usuarioActual);
    } catch (error) { console.error("Error al obtener perfil:", error); }
  };

  const cargarServicios = async () => {
    try { setMisServicios(await obtenerServicios()); } catch (error) { console.error(error); }
  };

  const cargarSolicitudes = async () => {
    try { setSolicitudes(await obtenerSolicitudesProveedor()); } catch (error) { console.error(error); }
  };

  const cargarResenas = async () => {
    if (!profileData.id) return;
    try { setResenas(await obtenerResenas(profileData.id)); } catch {}
  };

  useEffect(() => {
    cargarPerfil();
    cargarServicios();
    cargarSolicitudes();
  }, []);

  useEffect(() => {
    if (profileData.id) cargarResenas();
  }, [profileData.id]);

  const completarServicio = async (id: number) => {
    if (!confirm("¿Marcar este servicio como completado y pagado?")) return;
    try {
      await marcarCompletado(id);
      toast({ title: "Servicio completado", description: "El cliente recibirá una notificación para confirmar." });
      cargarSolicitudes();
    } catch (err: any) {
      toast({ title: "No se puede completar", description: err.response?.data?.mensaje || "Error al marcar el servicio.", variant: "destructive" });
    }
  };

  const abrirChatConCliente = (nombre: string, id: string) => {
    const initials = nombre.split(" ").map(n => n[0]).join("").toUpperCase();
    setChatContact({ name: nombre, initials, role: "Cliente", id });
    setChatOpen(true);
  };

  const guardarCambiosPerfil = async () => {
    setGuardandoPerfil(true);
    try {
      const formData = new FormData();
      formData.append("nombre", editProfile.name);
      formData.append("apellido", editProfile.apellido);
      formData.append("email", editProfile.email);
      formData.append("telefono", editProfile.phone);
      formData.append("biografia", editProfile.biografia);
      formData.append("anios_experiencia", String(editProfile.anios_experiencia));
      formData.append("precio_por_hora", String(editProfile.precio_por_hora));
      formData.append("habilidades", editProfile.habilidades);
      formData.append("enlaces_portafolio", editProfile.enlaces_portafolio);
      formData.append("horario_atencion", JSON.stringify(editProfile.horario_atencion));
      formData.append("ciudad", editProfile.ciudad);
      formData.append("categoria_servicio", editProfile.categoria_servicio);
      if (fotoFile) formData.append("foto_perfil", fotoFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/proveedor/perfil`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
          body: formData,
        }
      );
      if (!response.ok) throw new Error("Error al actualizar");
      const data = await response.json();
      if (data.usuario) {
        localStorage.setItem("user_profile", JSON.stringify(data.usuario));
        rellenarPerfil(data.usuario);
      }
      setEditProfileOpen(false);
      setFotoFile(null);
      toast({ title: "Perfil actualizado" });
    } catch {
      toast({ title: "Error al actualizar", description: "No se pudo guardar el perfil.", variant: "destructive" });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const serviciosCompletados = solicitudes.filter(s => s.estado === "completada");
  const disputasActivas = solicitudes.filter(s => s.estado_disputa === "pendiente_proveedor");

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity duration-200">
            <span className="flex xs:hidden"><Logo variant="isotipo" className="h-6" /></span>
            <span className="hidden xs:flex"><Logo className="h-7" /></span>
            <Badge className="text-xs bg-primary/10 text-primary border border-primary/20 font-semibold hidden sm:inline-flex">Proveedor</Badge>
          </Link>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl hover:bg-muted transition-all duration-200 ease-in-out group"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="size-4 text-slate-400 group-hover:text-primary transition-colors duration-200" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold">
                    {notifCount}
                  </span>
                )}
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onCountChange={setNotifCount} />
            </div>
            <Avatar className="w-8 h-8 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all duration-200 ease-in-out">
              {profileData.foto_perfil && <AvatarImage src={storageUrl(profileData.foto_perfil)} alt={profileData.name} />}
              <AvatarFallback className="bg-primary text-white text-xs font-bold">
                {profileData.name ? profileData.name[0] + (profileData.apellido ? profileData.apellido[0] : "") : "PV"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200 ease-in-out" asChild>
              <Link to="/"><LogOut className="size-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Solicitudes Nuevas", value: solicitudes.filter(s => s.estado === "pendiente").length, icon: Clock, color: "text-info", bg: "bg-info/10 border-info/20" },
            { label: "Trabajos Confirmados", value: solicitudes.filter(s => s.estado === "aceptada").length, icon: CheckCircle, color: "text-success", bg: "bg-success/10 border-success/20" },
            {
              label: "Calificación",
              value: `${resenas.length ? (resenas.reduce((a, r) => a + r.calificacion, 0) / resenas.length).toFixed(1) : "—"} ★`,
              icon: Star, color: "text-warning", bg: "bg-warning/10 border-warning/20",
            },
            { label: "Servicios Publicados", value: misServicios.length, icon: Package, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-md hover:border-border/80 transition-all duration-200 ease-in-out">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl border ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
                <TrendingUp className="size-4 text-success opacity-60" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          <TabsList className="bg-card border border-border/60 p-1 rounded-2xl shadow-sm h-auto gap-1 w-max sm:w-auto min-w-full flex-nowrap">
            <TabsTrigger value="solicitudes" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <Clock className="size-3.5" />Solicitudes
            </TabsTrigger>
            <TabsTrigger value="cotizaciones" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <FileText className="size-3.5" />Cotizaciones
            </TabsTrigger>
            <TabsTrigger value="completados" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <CheckCircle className="size-3.5" />Completados
              {serviciosCompletados.filter(s => !s.confirmacion_cliente).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-info text-info-foreground text-[9px] flex items-center justify-center font-bold">
                  {serviciosCompletados.filter(s => !s.confirmacion_cliente).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="servicios" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <Package className="size-3.5" />Mis Servicios
            </TabsTrigger>
            <TabsTrigger value="resenas" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <Star className="size-3.5" />Reseñas
            </TabsTrigger>
            <TabsTrigger value="agenda" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <Calendar className="size-3.5" />Agenda
            </TabsTrigger>
            <TabsTrigger value="mapa" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <MapPin className="size-3.5" />Mapa
            </TabsTrigger>
            {disputasActivas.length > 0 && (
              <TabsTrigger value="disputas" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-destructive data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
                <AlertTriangle className="size-3.5" />Disputas
                <span className="w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold">
                  {disputasActivas.length}
                </span>
              </TabsTrigger>
            )}
            <TabsTrigger value="perfil" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200 ease-in-out">
              <User className="size-3.5" />Mi Perfil
            </TabsTrigger>
          </TabsList>
        </div>

          <TabsContent value="solicitudes">
            <SolicitudesSection
              solicitudes={solicitudes}
              onRefresh={cargarSolicitudes}
              onAbrirChat={abrirChatConCliente}
            />
          </TabsContent>

          <TabsContent value="cotizaciones">
            <CotizacionesSection
              solicitudes={solicitudes}
              onCompletar={completarServicio}
            />
          </TabsContent>

          <TabsContent value="completados">
            <CompletadosSection
              serviciosCompletados={serviciosCompletados}
              onAbrirChat={abrirChatConCliente}
            />
          </TabsContent>

          <TabsContent value="servicios">
            <ServiciosSection
              misServicios={misServicios}
              onRefresh={cargarServicios}
            />
          </TabsContent>

          <TabsContent value="resenas">
            <ResenasSection
              resenas={resenas}
              onRefresh={cargarResenas}
            />
          </TabsContent>

          <TabsContent value="agenda">
            <AgendaSection
              solicitudes={solicitudes}
              onCompletar={completarServicio}
              onAbrirChat={abrirChatConCliente}
            />
          </TabsContent>

          <TabsContent value="mapa">
            <MapaSection
              solicitudes={solicitudes}
              isActive={activeTab === "mapa"}
            />
          </TabsContent>

          <TabsContent value="disputas">
            <DisputasSection
              disputasActivas={disputasActivas}
              onRefresh={cargarSolicitudes}
            />
          </TabsContent>

          <TabsContent value="perfil">
            <PerfilSection
              profileData={profileData}
              misServicios={misServicios}
              onEditarPerfil={() => { setEditProfile(profileData); setFotoFile(null); setEditProfileOpen(true); }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog: Editar Perfil */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza tu información de proveedor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                {(fotoFile || editProfile.foto_perfil) ? (
                  <AvatarImage src={fotoFile ? URL.createObjectURL(fotoFile) : storageUrl(editProfile.foto_perfil)} />
                ) : null}
                <AvatarFallback className="bg-primary text-white text-xl font-bold">
                  {editProfile.name ? editProfile.name[0] + (editProfile.apellido ? editProfile.apellido[0] : "") : "PV"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground font-medium block mb-1.5">Foto de perfil</Label>
                <Input type="file" accept="image/*" className="text-xs h-9 rounded-lg" onChange={e => setFotoFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Nombre</Label>
                <Input className="h-10 rounded-xl border-border/70 bg-card" value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Apellido</Label>
                <Input className="h-10 rounded-xl border-border/70 bg-card" value={editProfile.apellido} onChange={e => setEditProfile({ ...editProfile, apellido: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Categoría de Servicio</Label>
              <select
                className="w-full h-10 rounded-xl border border-border/70 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/50"
                value={editProfile.categoria_servicio}
                onChange={e => setEditProfile({ ...editProfile, categoria_servicio: e.target.value })}
              >
                {CATEGORIAS_SERVICIO.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email</Label>
              <Input className="h-10 rounded-xl border-border/70 bg-card" type="email" value={editProfile.email} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Teléfono</Label>
              <Input className="h-10 rounded-xl border-border/70 bg-card" value={editProfile.phone} onChange={e => setEditProfile({ ...editProfile, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-sm font-medium">Ciudad</Label>
                <Input className="h-10 rounded-xl border-border/70 bg-card" value={editProfile.ciudad} onChange={e => setEditProfile({ ...editProfile, ciudad: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Exp. (años)</Label>
                <Input className="h-10 rounded-xl border-border/70 bg-card" type="number" value={editProfile.anios_experiencia} onChange={e => setEditProfile({ ...editProfile, anios_experiencia: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Precio por Hora</Label>
              <Input className="h-10 rounded-xl border-border/70 bg-card" type="number" value={editProfile.precio_por_hora} onChange={e => setEditProfile({ ...editProfile, precio_por_hora: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Horario de Atención</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border border-border/60 rounded-xl p-3 bg-muted/30">
                {diasSemana.map(dia => {
                  const horarioActual = normalizarHorario(editProfile.horario_atencion);
                  return (
                    <div key={dia} className="flex items-center gap-3 text-xs">
                      <span className="font-medium text-foreground w-20 shrink-0">{dia}</span>
                      <Input
                        className="h-8 text-xs flex-1 rounded-lg border-border/60 bg-card"
                        value={horarioActual[dia] || ""}
                        placeholder="Ej: 8:00 AM - 6:00 PM"
                        onChange={e => {
                          const nuevoHorario = { ...horarioActual, [dia]: e.target.value };
                          setEditProfile({ ...editProfile, horario_atencion: nuevoHorario });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Habilidades</Label>
              <Input className="h-10 rounded-xl border-border/70 bg-card" value={editProfile.habilidades} onChange={e => setEditProfile({ ...editProfile, habilidades: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Portfolio</Label>
              <Input className="h-10 rounded-xl border-border/70 bg-card" value={editProfile.enlaces_portafolio} onChange={e => setEditProfile({ ...editProfile, enlaces_portafolio: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Biografía</Label>
              <Textarea className="rounded-xl border-border/70 resize-none bg-card" value={editProfile.biografia} onChange={e => setEditProfile({ ...editProfile, biografia: e.target.value })} rows={3} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={guardarCambiosPerfil} className="flex-1 h-10 rounded-xl font-semibold" disabled={guardandoPerfil}>
                {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button variant="outline" className="h-10 rounded-xl border-border/60" onClick={() => setEditProfileOpen(false)}>Cancelar</Button>
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

export default ProviderPanel;
