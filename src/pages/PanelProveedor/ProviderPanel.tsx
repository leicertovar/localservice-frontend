import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, Star, Calendar, User, LogOut, Bell, Plus, TrendingUp, MessageCircle, Send, FileText, Trash2, MapPin, ChevronLeft, ChevronRight, AlertTriangle, Upload } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
import {
  actualizarPerfilProveedor,
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  alternarEstadoServicio,
  ServicioDatos
} from "@/services/proveedorService";
import {
  obtenerSolicitudesProveedor,
  enviarCotizacion,
  rechazarCotizacion,
  marcarCompletado,
  aportarEvidenciaProveedor,
  SolicitudServicioDatos
} from "@/services/reservaService";
import { obtenerResenas, responderResena as apiResponderResena, type Resena } from "@/services/resenaService";

const CATEGORIAS_SERVICIO = ["Plomería", "Electricidad", "Limpieza", "Pintura", "Jardinería", "Tecnología", "Otro"];

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const DIAS_CABECERA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const horarioPorDefecto: Record<string, string> = {
  "Lunes": "8:00 AM - 6:00 PM",
  "Martes": "8:00 AM - 6:00 PM",
  "Miércoles": "8:00 AM - 6:00 PM",
  "Jueves": "8:00 AM - 6:00 PM",
  "Viernes": "8:00 AM - 6:00 PM",
  "Sábado": "9:00 AM - 1:00 PM",
  "Domingo": "No disponible"
};

const ProviderPanel = () => {
  const [misServicios, setMisServicios] = useState<ServicioDatos[]>([]);
  const [mostrarNuevoServicio, setMostrarNuevoServicio] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("Plomería");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [servicioEditId, setServicioEditId] = useState<number | null>(null);
  const [datosEditServicio, setDatosEditServicio] = useState({ name: "", price: "", category: "", description: "", active: true });

  const [solicitudes, setSolicitudes] = useState<SolicitudServicioDatos[]>([]);
  const [solicitudCotizarId, setSolicitudCotizarId] = useState<number | null>(null);
  const [montoCotizado, setMontoCotizado] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [garantiaCotizada, setGarantiaCotizada] = useState("");
  const [detallesCotizacion, setDetallesCotizacion] = useState("");

  const [disputaDialogId, setDisputaDialogId] = useState<number | null>(null);
  const [disputaDescripcion, setDisputaDescripcion] = useState("");
  const [disputaEvidencia, setDisputaEvidencia] = useState<File | null>(null);
  const [enviandoEvidencia, setEnviandoEvidencia] = useState(false);

  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
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

  // Calendario
  const hoy = new Date();
  const [mesCalendario, setMesCalendario] = useState(hoy.getMonth());
  const [anioCalendario, setAnioCalendario] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);

  // Reseñas
  const [resenas, setResenas] = useState<Resena[]>([]);

  const { toast } = useToast();
  const mapRef = useRef<any>(null);

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

  // Mapa Leaflet
  const inicializarMapaProveedor = () => {
    if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
    const mapaElement = document.getElementById("mapa-proveedor");
    if (!mapaElement) return;
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
    const mapa = L.map("mapa-proveedor").setView([3.8801, -77.0707], 13);
    mapRef.current = mapa;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenStreetMap' }).addTo(mapa);
    solicitudes.forEach(sol => {
      if (sol.latitud && sol.longitud) {
        const clienteNombre = sol.cliente ? `${sol.cliente.nombre} ${sol.cliente.apellido || ""}` : "Cliente";
        const colorEstado = sol.estado === "aceptada" ? "#10b981" : sol.estado === "cotizado" ? "#f59e0b" : "#3b82f6";
        L.marker([Number(sol.latitud), Number(sol.longitud)]).addTo(mapa).bindPopup(
          `<strong style="color:${colorEstado}">${sol.servicio?.nombre || "Servicio"}</strong><br><b>Cliente:</b> ${clienteNombre}<br><b>Estado:</b> ${sol.estado}`
        );
      }
    });
  };

  useEffect(() => {
    if (activeTab === "mapa") { const t = setTimeout(inicializarMapaProveedor, 150); return () => clearTimeout(t); }
  }, [activeTab, solicitudes]);

  useEffect(() => { return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }; }, []);

  // --- Calendario real ---
  const getDiasEnMes = (mes: number, anio: number) => new Date(anio, mes + 1, 0).getDate();
  const getPrimerDiaSemana = (mes: number, anio: number) => {
    // 0=Dom, 1=Lun, ..., ajustar a Lun=0
    const dia = new Date(anio, mes, 1).getDay();
    return (dia === 0 ? 6 : dia - 1); // Lunes = 0
  };

  const obtenerReservasDia = (dia: number) => {
    return solicitudes.filter(sol => {
      if (sol.estado !== 'aceptada') return false;
      const f = new Date(sol.fecha + 'T00:00:00');
      return f.getDate() === dia && f.getMonth() === mesCalendario && f.getFullYear() === anioCalendario;
    });
  };

  const serviciosAgendados = solicitudes.filter(sol => sol.estado === 'aceptada');
  const serviciosFiltradosAgenda = diaSeleccionado
    ? serviciosAgendados.filter(sol => {
        const f = new Date(sol.fecha + 'T00:00:00');
        return f.getDate() === diaSeleccionado && f.getMonth() === mesCalendario && f.getFullYear() === anioCalendario;
      })
    : serviciosAgendados;

  const diasEnMes = getDiasEnMes(mesCalendario, anioCalendario);
  const primerDia = getPrimerDiaSemana(mesCalendario, anioCalendario);
  const hoyDia = hoy.getDate();
  const hoyMes = hoy.getMonth();
  const hoyAnio = hoy.getFullYear();

  const navMesAnterior = () => {
    if (mesCalendario === 0) { setMesCalendario(11); setAnioCalendario(a => a - 1); }
    else setMesCalendario(m => m - 1);
    setDiaSeleccionado(null);
  };
  const navMesSiguiente = () => {
    if (mesCalendario === 11) { setMesCalendario(0); setAnioCalendario(a => a + 1); }
    else setMesCalendario(m => m + 1);
    setDiaSeleccionado(null);
  };

  // --- Servicios ---
  const crearNuevoServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoPrecio) { toast({ title: "Campos incompletos", variant: "destructive" }); return; }
    try {
      await crearServicio({ nombre: nuevoNombre, precio: nuevoPrecio, categoria: nuevaCategoria, descripcion: nuevaDescripcion });
      toast({ title: "Servicio creado" });
      setMostrarNuevoServicio(false); setNuevoNombre(""); setNuevoPrecio(""); setNuevaCategoria("Plomería"); setNuevaDescripcion("");
      cargarServicios();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.mensaje, variant: "destructive" });
    }
  };

  const abrirEditarServicio = (servicio: ServicioDatos) => {
    if (!servicio.id) return;
    setDatosEditServicio({ name: servicio.nombre, price: servicio.precio, category: servicio.categoria, description: servicio.descripcion || "", active: servicio.esta_activo ?? true });
    setServicioEditId(servicio.id);
  };

  const guardarServicioEditado = async () => {
    if (!servicioEditId) return;
    try {
      await actualizarServicio(servicioEditId, { nombre: datosEditServicio.name, precio: datosEditServicio.price, categoria: datosEditServicio.category, descripcion: datosEditServicio.description });
      setServicioEditId(null);
      toast({ title: "Servicio actualizado" });
      cargarServicios();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.mensaje, variant: "destructive" });
    }
  };

  const cambiarEstadoServicio = async (id: number) => {
    try {
      const res = await alternarEstadoServicio(id);
      toast({ title: res.servicio.esta_activo ? "Servicio activado" : "Servicio desactivado" });
      cargarServicios();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const removerServicio = async (id: number) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    try { await eliminarServicio(id); toast({ title: "Servicio eliminado" }); cargarServicios(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

  // --- Solicitudes ---
  const enviarCotizacionAlCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitudCotizarId || !montoCotizado || !tiempoEstimado) { toast({ title: "Campos vacíos", variant: "destructive" }); return; }
    try {
      await enviarCotizacion(solicitudCotizarId, { monto_cotizado: montoCotizado, tiempo_estimado: tiempoEstimado, garantia: garantiaCotizada, detalles_cotizacion: detallesCotizacion });
      setSolicitudCotizarId(null); setMontoCotizado(""); setTiempoEstimado(""); setGarantiaCotizada(""); setDetallesCotizacion("");
      toast({ title: "Cotización enviada" });
      cargarSolicitudes();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const denegarSolicitud = async (id: number) => {
    try { await rechazarCotizacion(id); toast({ title: "Solicitud rechazada" }); cargarSolicitudes(); }
    catch { toast({ title: "Error", variant: "destructive" }); }
  };

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

  const enviarEvidenciaDisputa = async () => {
    if (!disputaDialogId || !disputaDescripcion.trim() || !disputaEvidencia) {
      toast({ title: "Campos incompletos", description: "Debes escribir una descripción y adjuntar un archivo de evidencia.", variant: "destructive" });
      return;
    }
    setEnviandoEvidencia(true);
    try {
      await aportarEvidenciaProveedor(disputaDialogId, disputaDescripcion, disputaEvidencia);
      toast({ title: "Evidencia enviada", description: "El administrador revisará la disputa y tomará la decisión final." });
      setDisputaDialogId(null);
      setDisputaDescripcion("");
      setDisputaEvidencia(null);
      cargarSolicitudes();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.mensaje || "No se pudo enviar la evidencia.", variant: "destructive" });
    } finally {
      setEnviandoEvidencia(false);
    }
  };

  // --- Perfil ---
  const guardarCambiosPerfil = async () => {
    setGuardandoPerfil(true);
    try {
      const formData = new FormData();
      formData.append('nombre', editProfile.name);
      formData.append('apellido', editProfile.apellido);
      formData.append('email', editProfile.email);
      formData.append('telefono', editProfile.phone);
      formData.append('biografia', editProfile.biografia);
      formData.append('anios_experiencia', String(editProfile.anios_experiencia));
      formData.append('precio_por_hora', String(editProfile.precio_por_hora));
      formData.append('habilidades', editProfile.habilidades);
      formData.append('enlaces_portafolio', editProfile.enlaces_portafolio);
      formData.append('horario_atencion', JSON.stringify(editProfile.horario_atencion));
      formData.append('ciudad', editProfile.ciudad);
      formData.append('categoria_servicio', editProfile.categoria_servicio);
      if (fotoFile) formData.append('foto_perfil', fotoFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/proveedor/perfil`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Error al actualizar');
      const data = await response.json();

      if (data.usuario) {
        localStorage.setItem('user_profile', JSON.stringify(data.usuario));
        rellenarPerfil(data.usuario);
      }
      setEditProfileOpen(false);
      setFotoFile(null);
      toast({ title: "Perfil actualizado" });
    } catch (error: any) {
      toast({ title: "Error al actualizar", description: "No se pudo guardar el perfil.", variant: "destructive" });
    } finally {
      setGuardandoPerfil(false);
    }
  };

  // --- Reseñas ---
  const enviarRespuestaResena = async (id: number) => {
    if (!replyText.trim()) return;
    try {
      await apiResponderResena(id, replyText);
      toast({ title: "Respuesta publicada" });
      setReplyingTo(null); setReplyText("");
      cargarResenas();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const abrirChatConCliente = (nombre: string, id: string) => {
    const initials = nombre.split(" ").map(n => n[0]).join("").toUpperCase();
    setChatContact({ name: nombre, initials, role: "Cliente", id });
    setChatOpen(true);
  };

  const serviciosCompletados = solicitudes.filter(s => s.estado === 'completada');
  const disputasActivas = solicitudes.filter(s => s.estado_disputa === 'pendiente_proveedor');

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border/60 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">LS</span>
            </div>
            <span className="font-bold text-foreground">LocalService</span>
            <Badge className="text-xs bg-accent/10 text-accent border border-accent/20 font-medium">Proveedor</Badge>
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="w-4.5 h-4.5" />
                {notifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold">
                    {notifCount}
                  </span>
                )}
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} onCountChange={setNotifCount} />
            </div>
            <Avatar className="w-8 h-8 ring-2 ring-accent/20">
              {profileData.foto_perfil && <AvatarImage src={storageUrl(profileData.foto_perfil)} alt={profileData.name} />}
              <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                {profileData.name ? profileData.name[0] + (profileData.apellido ? profileData.apellido[0] : "") : "PV"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" asChild>
              <Link to="/"><LogOut className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Solicitudes Nuevas", value: solicitudes.filter(s => s.estado === 'pendiente').length, icon: Clock, color: "text-info", bg: "bg-info/10" },
            { label: "Trabajos Confirmados", value: solicitudes.filter(s => s.estado === 'aceptada').length, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
            { label: "Calificación", value: `${(resenas.length ? (resenas.reduce((a, r) => a + r.calificacion, 0) / resenas.length).toFixed(1) : "—")} ★`, icon: Star, color: "text-warning", bg: "bg-warning/10" },
            { label: "Servicios Publicados", value: misServicios.length, icon: Package, color: "text-primary", bg: "bg-primary/10" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-border/60 p-1 rounded-2xl shadow-sm h-auto gap-1 flex-wrap">
            <TabsTrigger value="solicitudes" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"><Clock className="w-3.5 h-3.5" />Solicitudes</TabsTrigger>
            <TabsTrigger value="cotizaciones" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"><FileText className="w-3.5 h-3.5" />Cotizaciones</TabsTrigger>
            <TabsTrigger value="completados" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
              <CheckCircle className="w-3.5 h-3.5" />Completados
              {serviciosCompletados.filter(s => !s.confirmacion_cliente).length > 0 && (
                <span className="w-4 h-4 rounded-full bg-info text-info-foreground text-[9px] flex items-center justify-center font-bold">
                  {serviciosCompletados.filter(s => !s.confirmacion_cliente).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="servicios" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"><Package className="w-3.5 h-3.5" />Mis Servicios</TabsTrigger>
            <TabsTrigger value="resenas" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"><Star className="w-3.5 h-3.5" />Reseñas</TabsTrigger>
            <TabsTrigger value="agenda" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"><Calendar className="w-3.5 h-3.5" />Agenda</TabsTrigger>
            <TabsTrigger value="mapa" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"><MapPin className="w-3.5 h-3.5" />Mapa</TabsTrigger>
            {disputasActivas.length > 0 && (
              <TabsTrigger value="disputas" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-destructive data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                <AlertTriangle className="w-3.5 h-3.5" />Disputas
                <span className="w-4 h-4 rounded-full bg-destructive text-white text-[9px] flex items-center justify-center font-bold">{disputasActivas.length}</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="perfil" className="gap-1.5 rounded-xl h-9 px-3 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"><User className="w-3.5 h-3.5" />Mi Perfil</TabsTrigger>
          </TabsList>

          {/* Solicitudes */}
          <TabsContent value="solicitudes" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Solicitudes de Servicio Nuevas</h2>
            {solicitudes.filter(s => s.estado === 'pendiente').length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">No tienes solicitudes nuevas.</div>
            ) : solicitudes.filter(s => s.estado === 'pendiente').map(req => (
              <div key={req.id} className="bg-card rounded-xl border p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{req.servicio?.nombre || "Servicio Personalizado"}</h3>
                        <Badge variant="secondary" className="text-xs">{req.estado}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Cliente: {req.cliente?.nombre} {req.cliente?.apellido} · {req.telefono}</p>
                      <p className="text-sm text-muted-foreground">{req.fecha} · {req.hora} · {req.direccion}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => req.id && setSolicitudCotizarId(req.id)} className="gap-1"><CheckCircle className="w-4 h-4" />Cotizar</Button>
                      <Button size="sm" variant="outline" onClick={() => req.id && denegarSolicitud(req.id)} className="gap-1 text-destructive"><XCircle className="w-4 h-4" />Rechazar</Button>
                      <Button size="sm" variant="ghost" onClick={() => req.cliente && abrirChatConCliente(`${req.cliente.nombre} ${req.cliente.apellido || ""}`, req.cliente.id)}><MessageCircle className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Descripción:</p>
                    <p className="text-sm text-foreground">{req.descripcion}</p>
                  </div>
                  {solicitudCotizarId === req.id && (
                    <form onSubmit={enviarCotizacionAlCliente} className="bg-primary/5 rounded-lg p-4 space-y-3 ring-1 ring-primary/20">
                      <h4 className="font-medium text-foreground text-sm">Enviar Cotización</h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1"><Label className="text-xs">Monto Estimado</Label><Input placeholder="Ej: $85.000" value={montoCotizado} onChange={e => setMontoCotizado(e.target.value)} required /></div>
                        <div className="space-y-1"><Label className="text-xs">Tiempo estimado</Label><Input placeholder="Ej: 2 horas" value={tiempoEstimado} onChange={e => setTiempoEstimado(e.target.value)} required /></div>
                        <div className="space-y-1"><Label className="text-xs">Garantía (Opcional)</Label><Input placeholder="Ej: 30 días" value={garantiaCotizada} onChange={e => setGarantiaCotizada(e.target.value)} /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-xs">Detalles</Label><Textarea placeholder="Proceso, materiales, condiciones..." value={detallesCotizacion} onChange={e => setDetallesCotizacion(e.target.value)} rows={2} /></div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="gap-1"><Send className="w-3 h-3" />Enviar</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setSolicitudCotizarId(null)}>Cancelar</Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Cotizaciones */}
          <TabsContent value="cotizaciones" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Cotizaciones Enviadas</h2>
            {solicitudes.filter(s => s.estado === 'cotizado').length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">No tienes cotizaciones activas.</div>
            ) : solicitudes.filter(s => s.estado === 'cotizado').map(q => (
              <div key={q.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{q.servicio?.nombre || "Servicio Personalizado"}</h3>
                  <p className="text-sm text-muted-foreground">Cliente: {q.cliente?.nombre} {q.cliente?.apellido} · {q.fecha}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-foreground">{q.monto_cotizado}</span>
                  <Badge className="text-xs bg-warning/10 text-warning">En espera</Badge>
                </div>
              </div>
            ))}

            {/* Aceptadas (agendadas) */}
            {solicitudes.filter(s => s.estado === 'aceptada').length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-semibold text-success">Servicios Agendados</h3>
                {solicitudes.filter(s => s.estado === 'aceptada').map(q => (
                  <div key={q.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{q.servicio?.nombre || "Servicio Personalizado"}</h3>
                      <p className="text-sm text-muted-foreground">Cliente: {q.cliente?.nombre} {q.cliente?.apellido} · {q.fecha} · {q.hora}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-foreground">{q.monto_cotizado}</span>
                      {(() => {
                        const hoy = new Date().toISOString().split('T')[0];
                        const puedCompletar = !q.fecha || hoy >= q.fecha;
                        return puedCompletar ? (
                          <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => q.id && completarServicio(q.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />Completar
                          </Button>
                        ) : (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Disponible el</p>
                            <p className="text-xs font-semibold text-foreground">{new Date(q.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Servicios Completados */}
          <TabsContent value="completados" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Servicios Completados</h2>
            {serviciosCompletados.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">Aún no tienes servicios completados.</div>
            ) : serviciosCompletados.map(s => {
              const clienteNombre = s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido || ""}`.trim() : "Cliente";
              let estadoConf = "Pendiente de confirmación";
              let badgeColor = "bg-warning/10 text-warning";
              if (s.confirmacion_cliente === 'aceptado') { estadoConf = "Confirmado ✓"; badgeColor = "bg-success/10 text-success"; }
              if (s.confirmacion_cliente === 'rechazado') { estadoConf = "Disputado"; badgeColor = "bg-destructive/10 text-destructive"; }
              return (
                <div key={s.id} className="bg-card rounded-xl border p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{s.servicio?.nombre || "Servicio Personalizado"}</h3>
                        <Badge className={`text-xs ${badgeColor}`}>{estadoConf}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Cliente: {clienteNombre} · Fecha: {s.fecha}</p>
                      <p className="text-sm font-semibold text-foreground">{s.monto_cotizado}</p>
                      {s.queja_cliente && (
                        <div className="mt-2 p-2 bg-destructive/5 border border-destructive/20 rounded text-xs text-destructive">
                          <strong>Queja:</strong> {s.queja_cliente}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => abrirChatConCliente(clienteNombre, s.cliente?.id || "")}>
                      <MessageCircle className="w-4 h-4 mr-1" />Chat
                    </Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Servicios */}
          <TabsContent value="servicios" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Mis Servicios en LocalService</h2>
              <Button size="sm" onClick={() => setMostrarNuevoServicio(!mostrarNuevoServicio)} className="gap-1"><Plus className="w-4 h-4" />Nuevo Servicio</Button>
            </div>
            {mostrarNuevoServicio && (
              <form onSubmit={crearNuevoServicio} className="bg-card rounded-xl border p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Agregar Servicio</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nombre del servicio</Label><Input placeholder="Ej: Reparación de tuberías" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Precio o tarifa base</Label><Input placeholder="Ej: $50.000/hora" value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)} required /></div>
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)}>
                    {CATEGORIAS_SERVICIO.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2"><Label>Descripción</Label><Textarea placeholder="Describe tu servicio..." value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} rows={3} /></div>
                <div className="flex gap-2">
                  <Button type="submit">Guardar</Button>
                  <Button type="button" variant="outline" onClick={() => setMostrarNuevoServicio(false)}>Cancelar</Button>
                </div>
              </form>
            )}
            {misServicios.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">No tienes servicios. Haz clic en "Nuevo Servicio" para empezar.</div>
            ) : misServicios.map(service => (
              <div key={service.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{service.nombre}</h3>
                    <Badge variant={service.esta_activo ? "default" : "secondary"} className="text-xs">{service.esta_activo ? "Activo" : "Inactivo"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.categoria} · {service.precio}</p>
                  {service.descripcion && <p className="text-xs text-muted-foreground mt-1 max-w-lg">{service.descripcion}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => service.id && cambiarEstadoServicio(service.id)}>
                    {service.esta_activo ? "Desactivar" : "Activar"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => abrirEditarServicio(service)}>Editar</Button>
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => service.id && removerServicio(service.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Reseñas */}
          <TabsContent value="resenas" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mis Reseñas ({resenas.length})</h2>
            {resenas.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">Aún no tienes reseñas de clientes.</div>
            ) : resenas.map(r => (
              <div key={r.id} className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-muted">{r.cliente ? (r.cliente.nombre[0] + (r.cliente.apellido?.[0] || "")) : "CL"}</AvatarFallback></Avatar>
                    <span className="font-medium text-foreground text-sm">{r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido || ""}` : "Cliente"}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({length: r.calificacion}).map((_, i) => <Star key={i} className="w-3 h-3 text-warning fill-warning" />)}
                    {Array.from({length: 5 - r.calificacion}).map((_, i) => <Star key={i} className="w-3 h-3 text-muted" />)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comentario}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString('es-CO')}</p>
                {r.respuesta_proveedor && (
                  <div className="mt-3 ml-6 pl-4 border-l-2 border-primary/20 bg-primary/[0.03] rounded-r-lg p-3">
                    <p className="text-xs font-medium text-primary mb-1">Tu respuesta</p>
                    <p className="text-sm text-muted-foreground">{r.respuesta_proveedor}</p>
                  </div>
                )}
                {!r.respuesta_proveedor && replyingTo !== r.id && (
                  <Button size="sm" variant="ghost" className="mt-2 text-xs text-primary" onClick={() => setReplyingTo(r.id)}>Responder reseña</Button>
                )}
                {replyingTo === r.id && (
                  <div className="mt-3 flex gap-2">
                    <Input placeholder="Escribe tu respuesta..." value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1 text-sm h-9" />
                    <Button size="sm" onClick={() => enviarRespuestaResena(r.id)} className="gap-1"><Send className="w-3 h-3" />Enviar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancelar</Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* Agenda - Calendario Real */}
          <TabsContent value="agenda" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mi Agenda y Servicios Programados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl border p-6 md:col-span-2">
                {/* Navegación del mes */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" onClick={navMesAnterior}><ChevronLeft className="w-4 h-4" /></Button>
                  <h3 className="font-semibold text-foreground text-sm">{MESES[mesCalendario]} {anioCalendario}</h3>
                  <Button variant="ghost" size="icon" onClick={navMesSiguiente}><ChevronRight className="w-4 h-4" /></Button>
                </div>

                {/* Cabecera días */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DIAS_CABECERA.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Celdas vacías antes del primer día */}
                  {Array.from({ length: primerDia }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {/* Días reales */}
                  {Array.from({ length: diasEnMes }).map((_, i) => {
                    const dia = i + 1;
                    const reservasDia = obtenerReservasDia(dia);
                    const tieneReservas = reservasDia.length > 0;
                    const esHoy = dia === hoyDia && mesCalendario === hoyMes && anioCalendario === hoyAnio;
                    const esSeleccionado = diaSeleccionado === dia;

                    let diaClase = "hover:bg-muted text-foreground";
                    if (esHoy && !esSeleccionado) diaClase = "ring-2 ring-primary/50 text-primary font-bold";
                    if (tieneReservas && !esSeleccionado) diaClase = "bg-primary/20 text-primary border border-primary font-bold";
                    if (esSeleccionado) diaClase = "bg-primary text-primary-foreground font-bold shadow-md";

                    return (
                      <button
                        key={dia}
                        onClick={() => setDiaSeleccionado(esSeleccionado ? null : dia)}
                        className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-all relative ${diaClase}`}
                      >
                        <span>{dia}</span>
                        {tieneReservas && !esSeleccionado && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary/20 border border-primary" /><span>Con servicios</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary" /><span>Seleccionado</span></div>
                  {mesCalendario === hoyMes && anioCalendario === hoyAnio && (
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded ring-2 ring-primary/50" /><span>Hoy</span></div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground text-sm">
                  {diaSeleccionado ? `Servicios del ${diaSeleccionado} de ${MESES[mesCalendario]}` : "Próximos servicios programados"}
                </h4>
                <div className="space-y-2">
                  {serviciosFiltradosAgenda.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-lg">
                      No hay citas {diaSeleccionado ? "ese día" : "en este mes"}.
                    </p>
                  ) : serviciosFiltradosAgenda.map(sol => (
                    <div key={sol.id} className="p-3 bg-muted/40 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{sol.servicio?.nombre || "Servicio Personalizado"}</p>
                        <Badge className="text-[10px] bg-success/15 text-success">Confirmado</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Cliente: {sol.cliente?.nombre} {sol.cliente?.apellido}</p>
                      <p className="text-xs text-muted-foreground">{sol.fecha} a las {sol.hora}</p>
                      <p className="text-xs text-muted-foreground">{sol.direccion}</p>
                      <div className="flex gap-1 justify-end">
                        <Button size="xs" variant="outline" className="h-7 text-xs" onClick={() => sol.cliente && abrirChatConCliente(`${sol.cliente.nombre} ${sol.cliente.apellido || ""}`, sol.cliente.id)}>Chat</Button>
                        {(() => {
                          const hoy = new Date().toISOString().split('T')[0];
                          const puedCompletar = !sol.fecha || hoy >= sol.fecha;
                          return puedCompletar ? (
                            <Button size="xs" variant="default" className="h-7 text-xs bg-success hover:bg-success/90" onClick={() => sol.id && completarServicio(sol.id)}>Completar</Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">Desde {new Date(sol.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</span>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mapa */}
          <TabsContent value="mapa" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Mapa de Solicitudes</h2>
              <Badge variant="outline" className="text-xs">Leaflet & OpenStreetMap</Badge>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div id="mapa-proveedor" className="w-full h-[500px] rounded-lg overflow-hidden border shadow-inner" style={{ minHeight: "450px" }} />
            </div>
          </TabsContent>

          {/* Perfil */}
          {/* DISPUTAS */}
          <TabsContent value="disputas" className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">Disputas Activas</h2>
            </div>
            <p className="text-sm text-muted-foreground">Un cliente rechazó estos servicios. Debes aportar tu evidencia para que el administrador tome la decisión final.</p>
            {disputasActivas.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">No tienes disputas activas.</div>
            ) : disputasActivas.map(s => (
              <div key={s.id} className="bg-card rounded-xl border border-destructive/20 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{s.servicio?.nombre || "Servicio Personalizado"}</p>
                    <p className="text-xs text-muted-foreground">Cliente: {s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido || ''}` : '—'} · Fecha: {s.fecha}</p>
                  </div>
                  <span className="text-xs bg-destructive/10 text-destructive font-medium px-2 py-0.5 rounded-full">En disputa</span>
                </div>
                {s.queja_cliente && (
                  <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                    <p className="text-xs font-semibold text-destructive mb-1">Motivo del cliente:</p>
                    <p className="text-sm text-foreground">{s.queja_cliente}</p>
                  </div>
                )}
                {s.evidencia_cliente && (
                  <a href={storageUrl(s.evidencia_cliente)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-primary underline">
                    <FileText className="w-3.5 h-3.5" />Ver evidencia del cliente
                  </a>
                )}
                <Button size="sm" className="gap-2 bg-primary" onClick={() => setDisputaDialogId(s.id)}>
                  <Upload className="w-4 h-4" />Aportar mi evidencia
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="perfil" className="max-w-lg space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Mi Perfil de Proveedor</h2>
            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  {profileData.foto_perfil && <AvatarImage src={storageUrl(profileData.foto_perfil)} alt={profileData.name} />}
                  <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                    {profileData.name ? profileData.name[0] + (profileData.apellido ? profileData.apellido[0] : "") : "PV"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{profileData.name} {profileData.apellido}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.title}</p>
                  <Badge variant={profileData.esta_verificado ? "default" : "secondary"} className={`mt-1 text-xs ${profileData.esta_verificado ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {profileData.esta_verificado ? "Verificado ✓" : "Pendiente de verificación"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">Email</label><p className="text-sm font-medium text-foreground">{profileData.email}</p></div>
                <div><label className="text-xs text-muted-foreground">Teléfono</label><p className="text-sm font-medium text-foreground">{profileData.phone || "No especificado"}</p></div>
                <div><label className="text-xs text-muted-foreground">Servicios activos</label><p className="text-sm font-medium text-foreground">{misServicios.filter(s => s.esta_activo).length}</p></div>
                <div><label className="text-xs text-muted-foreground">Años de experiencia</label><p className="text-sm font-medium text-foreground">{profileData.anios_experiencia} años</p></div>
                <div><label className="text-xs text-muted-foreground">Precio por hora</label><p className="text-sm font-medium text-foreground">${profileData.precio_por_hora.toLocaleString()}/hora</p></div>
                <div><label className="text-xs text-muted-foreground">Ciudad</label><p className="text-sm font-medium text-foreground">{profileData.ciudad || "No especificada"}</p></div>
                <div className="col-span-2 border-t pt-3 mt-1">
                  <label className="text-xs text-muted-foreground font-semibold">Horario de atención semanal</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {Object.entries(normalizarHorario(profileData.horario_atencion)).map(([dia, horas]) => (
                      <div key={dia} className="bg-muted p-2 rounded text-[11px] border">
                        <span className="font-semibold block text-foreground">{dia}</span>
                        <span className="text-muted-foreground">{horas as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground">Habilidades</label><p className="text-sm font-medium text-foreground">{profileData.habilidades || "Ninguna"}</p></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground">Biografía</label><p className="text-sm text-muted-foreground">{profileData.biografia || "Sin biografía"}</p></div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setEditProfile(profileData); setFotoFile(null); setEditProfileOpen(true); }}>Editar Perfil</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog: Editar Servicio */}
      <Dialog open={servicioEditId !== null} onOpenChange={open => { if (!open) setServicioEditId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Servicio</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nombre</Label><Input value={datosEditServicio.name} onChange={e => setDatosEditServicio({ ...datosEditServicio, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Precio</Label><Input value={datosEditServicio.price} onChange={e => setDatosEditServicio({ ...datosEditServicio, price: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={datosEditServicio.category} onChange={e => setDatosEditServicio({ ...datosEditServicio, category: e.target.value })}>
                {CATEGORIAS_SERVICIO.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={datosEditServicio.description} onChange={e => setDatosEditServicio({ ...datosEditServicio, description: e.target.value })} rows={3} /></div>
            <div className="flex gap-2 pt-2">
              <Button onClick={guardarServicioEditado} className="flex-1">Guardar</Button>
              <Button variant="outline" onClick={() => setServicioEditId(null)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Aportar Evidencia en Disputa */}
      <Dialog open={disputaDialogId !== null} onOpenChange={open => { if (!open) { setDisputaDialogId(null); setDisputaDescripcion(""); setDisputaEvidencia(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" />Aportar Evidencia</DialogTitle>
            <DialogDescription>Describe qué hiciste y adjunta tu evidencia (foto o PDF). El administrador tomará la decisión final.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tu descripción del trabajo realizado</Label>
              <Textarea
                placeholder="Explica en detalle qué trabajo realizaste, cuándo y cómo..."
                rows={4}
                value={disputaDescripcion}
                onChange={e => setDisputaDescripcion(e.target.value)}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Evidencia (foto o PDF — obligatorio)</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setDisputaEvidencia(e.target.files?.[0] || null)}
              />
              {disputaEvidencia && <p className="text-[11px] text-success">✓ {disputaEvidencia.name}</p>}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={enviarEvidenciaDisputa}
              disabled={enviandoEvidencia || !disputaDescripcion.trim() || !disputaEvidencia}
            >
              {enviandoEvidencia ? "Enviando..." : "Enviar evidencia al admin"}
            </Button>
            <Button variant="outline" onClick={() => { setDisputaDialogId(null); setDisputaDescripcion(""); setDisputaEvidencia(null); }}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Perfil */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Perfil</DialogTitle><DialogDescription>Actualiza tu información de proveedor</DialogDescription></DialogHeader>
          <div className="space-y-4">
            {/* Foto de perfil */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {(fotoFile ? URL.createObjectURL(fotoFile) : editProfile.foto_perfil) ? (
                  <AvatarImage src={fotoFile ? URL.createObjectURL(fotoFile) : storageUrl(editProfile.foto_perfil)} />
                ) : null}
                <AvatarFallback className="bg-accent text-accent-foreground text-xl">
                  {editProfile.name ? editProfile.name[0] + (editProfile.apellido ? editProfile.apellido[0] : "") : "PV"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label className="text-xs text-muted-foreground block mb-1">Foto de perfil</Label>
                <Input type="file" accept="image/*" className="text-xs" onChange={e => setFotoFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre</Label><Input value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={editProfile.apellido} onChange={e => setEditProfile({ ...editProfile, apellido: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Categoría de Servicio</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={editProfile.categoria_servicio} onChange={e => setEditProfile({ ...editProfile, categoria_servicio: e.target.value })}>
                {CATEGORIAS_SERVICIO.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editProfile.email} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={editProfile.phone} onChange={e => setEditProfile({ ...editProfile, phone: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2"><Label>Ciudad</Label><Input value={editProfile.ciudad} onChange={e => setEditProfile({ ...editProfile, ciudad: e.target.value })} /></div>
              <div className="space-y-2"><Label>Exp. (Años)</Label><Input type="number" value={editProfile.anios_experiencia} onChange={e => setEditProfile({ ...editProfile, anios_experiencia: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Precio por Hora</Label><Input type="number" value={editProfile.precio_por_hora} onChange={e => setEditProfile({ ...editProfile, precio_por_hora: parseFloat(e.target.value) || 0 })} /></div>
            <div className="border-t pt-3 space-y-2">
              <Label className="text-sm font-semibold">Horario de Atención por Día</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border rounded p-3 bg-muted/20">
                {diasSemana.map(dia => {
                  const horarioActual = normalizarHorario(editProfile.horario_atencion);
                  return (
                    <div key={dia} className="flex items-center gap-3 text-xs">
                      <span className="font-medium text-foreground w-20">{dia}</span>
                      <Input
                        className="h-8 text-xs flex-1"
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
            <div className="space-y-2"><Label>Habilidades</Label><Input value={editProfile.habilidades} onChange={e => setEditProfile({ ...editProfile, habilidades: e.target.value })} /></div>
            <div className="space-y-2"><Label>Portfolio</Label><Input value={editProfile.enlaces_portafolio} onChange={e => setEditProfile({ ...editProfile, enlaces_portafolio: e.target.value })} /></div>
            <div className="space-y-2"><Label>Biografía</Label><Textarea value={editProfile.biografia} onChange={e => setEditProfile({ ...editProfile, biografia: e.target.value })} rows={3} /></div>
            <div className="flex gap-2 pt-2">
              <Button onClick={guardarCambiosPerfil} className="flex-1" disabled={guardandoPerfil}>
                {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancelar</Button>
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
