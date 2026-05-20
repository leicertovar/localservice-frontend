import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, Star, DollarSign, Calendar, User, LogOut, Bell, Plus, TrendingUp, MessageCircle, Send, FileText, Trash2, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationsPanel from "@/components/reusable/NotificationsPanel";
import ChatPanel from "@/components/reusable/ChatPanel";
import { fetchCurrentUser, getUserProfile } from "@/services/authService";
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
  SolicitudServicioDatos
} from "@/services/reservaService";

// Días de la semana para mapear el horario JSON
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Horario por defecto
const horarioPorDefecto = {
  "Lunes": "8:00 AM - 6:00 PM",
  "Martes": "8:00 AM - 6:00 PM",
  "Miércoles": "8:00 AM - 6:00 PM",
  "Jueves": "8:00 AM - 6:00 PM",
  "Viernes": "8:00 AM - 6:00 PM",
  "Sábado": "9:00 AM - 1:00 PM",
  "Domingo": "No disponible"
};

const ProviderPanel = () => {
  // --- Estados de Servicios ---
  const [misServicios, setMisServicios] = useState<ServicioDatos[]>([]);
  const [mostrarNuevoServicio, setMostrarNuevoServicio] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("Plomería");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [servicioEditId, setServicioEditId] = useState<number | null>(null);
  const [datosEditServicio, setDatosEditServicio] = useState({ name: "", price: "", category: "", description: "", active: true });

  // --- Estados de Solicitudes y Cotizaciones ---
  const [solicitudes, setSolicitudes] = useState<SolicitudServicioDatos[]>([]);
  const [solicitudCotizarId, setSolicitudCotizarId] = useState<number | null>(null);
  const [montoCotizado, setMontoCotizado] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [garantiaCotizada, setGarantiaCotizada] = useState("");
  const [detallesCotizacion, setDetallesCotizacion] = useState("");

  // --- Estados de Interfaz Comunes ---
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContact, setChatContact] = useState({ name: "", initials: "", role: "" });
  const [activeTab, setActiveTab] = useState("solicitudes");

  // --- Estados del Perfil ---
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
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
    horario_atencion: {} as any, // Cambiado a objeto para soporte de horarios JSON
    esta_verificado: false,
    categoria_servicio: "",
  });
  const [editProfile, setEditProfile] = useState(profileData);

  // --- Estado de la Agenda ---
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);

  const { toast } = useToast();

  // Referencias para el mapa de Leaflet
  const mapRef = useRef<any>(null);

  /**
   * Normaliza la estructura del horario (soporta string plano y JSON).
   */
  const normalizarHorario = (horario: any) => {
    if (!horario) return { ...horarioPorDefecto };
    if (typeof horario === "object") {
      return { ...horarioPorDefecto, ...horario };
    }
    if (typeof horario === "string") {
      try {
        const obj = JSON.parse(horario);
        if (typeof obj === "object" && obj !== null) {
          return { ...horarioPorDefecto, ...obj };
        }
      } catch (e) {
        // Asignar el string anterior a los días laborales
        const nuevoHorario = { ...horarioPorDefecto };
        diasSemana.forEach(dia => {
          if (dia !== "Sábado" && dia !== "Domingo") {
            nuevoHorario[dia] = horario;
          }
        });
        return nuevoHorario;
      }
    }
    return { ...horarioPorDefecto };
  };

  /**
   * Carga el perfil del proveedor autenticado desde el local storage o el backend.
   */
  const cargarPerfil = async () => {
    const perfilGuardado = getUserProfile();
    if (perfilGuardado) {
      rellenarPerfil(perfilGuardado);
    }
    try {
      const usuarioActual = await fetchCurrentUser();
      rellenarPerfil(usuarioActual);
    } catch (error) {
      console.error("Error al obtener perfil en tiempo real:", error);
    }
  };

  /**
   * Asigna los datos obtenidos del backend al estado del perfil.
   */
  const rellenarPerfil = (usuario: any) => {
    const p = usuario.perfil_proveedor || {};
    const datos = {
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
    };
    setProfileData(datos);
    setEditProfile(datos);
  };

  /**
   * Carga los servicios del proveedor desde el backend.
   */
  const cargarServicios = async () => {
    try {
      const serviciosApi = await obtenerServicios();
      setMisServicios(serviciosApi);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    }
  };

  /**
   * Carga las solicitudes de servicio del proveedor.
   */
  const cargarSolicitudes = async () => {
    try {
      const solicitudesApi = await obtenerSolicitudesProveedor();
      setSolicitudes(solicitudesApi);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarPerfil();
    cargarServicios();
    cargarSolicitudes();
  }, []);

  /**
   * Inicializa el mapa de Leaflet y dibuja los marcadores para las solicitudes con coordenadas.
   */
  const inicializarMapaProveedor = () => {
    // Si ya existe una instancia de mapa en esta pestaña, la destruimos para evitar duplicados o mapas huérfanos
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        console.error("Error al remover el mapa anterior:", e);
      }
      mapRef.current = null;
    }

    const mapaElement = document.getElementById("mapa-proveedor");
    if (!mapaElement) {
      console.warn("Elemento mapa-proveedor no encontrado en el DOM.");
      return;
    }

    // Solucionar rutas de marcadores
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Crear mapa centrado en Buenaventura
    const mapa = L.map("mapa-proveedor").setView([3.8801, -77.0707], 13);
    mapRef.current = mapa;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);

    // Iterar solicitudes y colocar un pin para las que tengan coordenadas registradas
    solicitudes.forEach((sol) => {
      if (sol.latitud && sol.longitud) {
        const lat = Number(sol.latitud);
        const lng = Number(sol.longitud);

        const clienteNombre = sol.cliente ? `${sol.cliente.nombre} ${sol.cliente.apellido || ""}`.trim() : "Cliente";
        const servicioNombre = sol.servicio?.nombre || "Servicio Personalizado";

        let colorEstado = "#6b7280"; // gris
        if (sol.estado === "pendiente") colorEstado = "#3b82f6"; // azul
        if (sol.estado === "cotizado") colorEstado = "#f59e0b"; // naranja
        if (sol.estado === "aceptada") colorEstado = "#10b981"; // verde
        if (sol.estado === "completada") colorEstado = "#059669"; // verde oscuro

        const popupContenido = `
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 170px;">
            <strong style="font-size: 13px; color: ${colorEstado}; display: block; margin-bottom: 4px;">${servicioNombre}</strong>
            <b>Cliente:</b> ${clienteNombre}<br/>
            <b>Dirección:</b> ${sol.direccion}<br/>
            <b>Fecha/Hora:</b> ${sol.fecha} ${sol.hora}<br/>
            <b>Estado:</b> <span style="color: ${colorEstado}; font-weight: bold; text-transform: capitalize;">${sol.estado}</span>
          </div>
        `;

        L.marker([lat, lng])
          .addTo(mapa)
          .bindPopup(popupContenido);
      }
    });
  };

  // Re-inicializa o refresca el mapa cuando cambia a la pestaña del mapa
  useEffect(() => {
    if (activeTab === "mapa") {
      const temporizador = setTimeout(() => {
        inicializarMapaProveedor();
      }, 150);
      return () => clearTimeout(temporizador);
    }
  }, [activeTab, solicitudes]);

  // Limpiar mapa al desmontar el componente
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // --- Manejadores de CRUD de Servicios ---

  /**
   * Guarda un nuevo servicio en el backend.
   */
  const crearNuevoServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoPrecio) {
      toast({ title: "Campos incompletos", description: "El nombre y el precio son obligatorios.", variant: "destructive" });
      return;
    }
    try {
      await crearServicio({
        nombre: nuevoNombre,
        precio: nuevoPrecio,
        categoria: nuevaCategoria,
        descripcion: nuevaDescripcion
      });
      toast({ title: "Servicio creado", description: "Tu nuevo servicio ya está disponible para cotizar." });
      setMostrarNuevoServicio(false);
      setNuevoNombre("");
      setNuevoPrecio("");
      setNuevaCategoria("Plomería");
      setNuevaDescripcion("");
      cargarServicios();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.response?.data?.mensaje || "No se pudo crear el servicio.", variant: "destructive" });
    }
  };

  /**
   * Abre el cuadro de diálogo para editar un servicio.
   */
  const abrirEditarServicio = (servicio: ServicioDatos) => {
    if (!servicio.id) return;
    setDatosEditServicio({
      name: servicio.nombre,
      price: servicio.precio,
      category: servicio.categoria,
      description: servicio.descripcion || "",
      active: servicio.esta_activo ?? true
    });
    setServicioEditId(servicio.id);
  };

  /**
   * Guarda los cambios de un servicio editado en el backend.
   */
  const guardarServicioEditado = async () => {
    if (!servicioEditId) return;
    try {
      await actualizarServicio(servicioEditId, {
        nombre: datosEditServicio.name,
        precio: datosEditServicio.price,
        categoria: datosEditServicio.category,
        descripcion: datosEditServicio.description
      });
      setServicioEditId(null);
      toast({ title: "Servicio actualizado", description: "El servicio se guardó con éxito." });
      cargarServicios();
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.response?.data?.mensaje || "No se pudo actualizar el servicio.", variant: "destructive" });
    }
  };

  /**
   * Alterna el estado activo de un servicio en el backend.
   */
  const cambiarEstadoServicio = async (id: number) => {
    try {
      const res = await alternarEstadoServicio(id);
      toast({ 
        title: res.servicio.esta_activo ? "Servicio activado" : "Servicio desactivado", 
        description: `El servicio "${res.servicio.nombre}" ha sido actualizado.` 
      });
      cargarServicios();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo cambiar el estado del servicio.", variant: "destructive" });
    }
  };

  /**
   * Elimina un servicio de manera definitiva.
   */
  const removerServicio = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este servicio definitivamente?")) return;
    try {
      await eliminarServicio(id);
      toast({ title: "Servicio eliminado", description: "El servicio se removió con éxito." });
      cargarServicios();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo eliminar el servicio.", variant: "destructive" });
    }
  };

  // --- Manejadores de Solicitudes y Cotizaciones ---

  /**
   * Abre el formulario para enviar una cotización a una solicitud.
   */
  const iniciarAceptarSolicitud = (id: number) => {
    setSolicitudCotizarId(id);
  };

  /**
   * Envía la cotización económica al cliente a través del backend.
   */
  const enviarCotizacionAlCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitudCotizarId) return;
    if (!montoCotizado || !tiempoEstimado) {
      toast({ title: "Campos vacíos", description: "El monto y el tiempo estimado son obligatorios.", variant: "destructive" });
      return;
    }
    try {
      await enviarCotizacion(solicitudCotizarId, {
        monto_cotizado: montoCotizado,
        tiempo_estimado: tiempoEstimado,
        garantia: garantiaCotizada,
        detalles_cotizacion: detallesCotizacion,
      });
      setSolicitudCotizarId(null);
      setMontoCotizado("");
      setTiempoEstimado("");
      setGarantiaCotizada("");
      setDetallesCotizacion("");
      toast({ title: "Cotización enviada", description: "El cliente ha sido notificado con tu oferta." });
      cargarSolicitudes();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo enviar la cotización.", variant: "destructive" });
    }
  };

  /**
   * Rechaza una solicitud recibida.
   */
  const denegarSolicitud = async (id: number) => {
    try {
      await rechazarCotizacion(id);
      toast({ title: "Solicitud rechazada", description: "Has rechazado la propuesta de servicio." });
      cargarSolicitudes();
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudo rechazar la solicitud.", variant: "destructive" });
    }
  };

  // --- Manejadores de Perfil ---

  /**
   * Envía la actualización de perfil al servidor y actualiza localmente.
   */
  const guardarCambiosPerfil = async () => {
    try {
      const response = await actualizarPerfilProveedor({
        nombre: editProfile.name,
        apellido: editProfile.apellido,
        email: editProfile.email,
        telefono: editProfile.phone,
        biografia: editProfile.biografia,
        anios_experiencia: editProfile.anios_experiencia,
        precio_por_hora: editProfile.precio_por_hora,
        habilidades: editProfile.habilidades,
        enlaces_portafolio: editProfile.enlaces_portafolio,
        horario_atencion: editProfile.horario_atencion, // Objeto JSON de horario semanal
        ciudad: editProfile.ciudad,
        categoria_servicio: editProfile.categoria_servicio,
      });
      
      const stored = getUserProfile();
      if (stored && response.usuario) {
        const updatedUser = { ...stored, ...response.usuario };
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        rellenarPerfil(updatedUser);
      } else if (response.usuario) {
        localStorage.setItem('user_profile', JSON.stringify(response.usuario));
        rellenarPerfil(response.usuario);
      }
      setEditProfileOpen(false);
      toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados correctamente en la base de datos." });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error al actualizar",
        description: error.response?.data?.mensaje || "Hubo un error al guardar tu perfil.",
        variant: "destructive"
      });
    }
  };

  // --- Gestión de la Agenda ---

  /**
   * Obtiene las solicitudes aceptadas (citas agendadas) para un día específico del mes.
   */
  const obtenerReservasDia = (dia: number) => {
    return solicitudes.filter(sol => {
      if (sol.estado !== 'aceptada') return false;
      const fechaObjeto = new Date(sol.fecha + 'T00:00:00');
      return fechaObjeto.getDate() === dia;
    });
  };

  // Filtrar servicios agendados para listar
  const serviciosAgendados = solicitudes.filter(sol => sol.estado === 'aceptada');

  // Filtrar según el día seleccionado en el calendario interactivo
  const serviciosFiltradosAgenda = diaSeleccionado 
    ? serviciosAgendados.filter(sol => new Date(sol.fecha + 'T00:00:00').getDate() === diaSeleccionado)
    : serviciosAgendados;

  // --- Otros ---
  const abrirChatConCliente = (nombre: string) => {
    const initials = nombre.split(" ").map(n => n[0]).join("");
    setChatContact({ name: nombre, initials, role: "Cliente" });
    setChatOpen(true);
  };

  const responderResena = (id: number) => {
    if (!replyText.trim()) return;
    toast({ title: "Respuesta publicada", description: "Tu respuesta a la reseña ha sido guardada." });
    setReplyingTo(null);
    setReplyText("");
  };

  // Reseñas estáticas (Mock)
  const reviews = [
    { id: 1, client: "Ana García", rating: 5, comment: "Excelente trabajo, muy puntual y profesional.", date: "2026-04-01", response: "¡Gracias Ana! Fue un placer." },
    { id: 2, client: "Pedro López", rating: 4, comment: "Buen servicio, solucionó el problema rápido.", date: "2026-03-25", response: null },
    { id: 3, client: "María Torres", rating: 5, comment: "Lo recomiendo, muy buen precio y calidad.", date: "2026-03-20", response: "¡Muchas gracias María!" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">LS</span>
            </div>
            <span className="font-bold text-foreground">LocalService</span>
            <Badge variant="secondary" className="text-xs">Proveedor</Badge>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                  {solicitudes.filter(s => s.estado === 'pendiente').length}
                </span>
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                {profileData.name ? profileData.name[0] + (profileData.apellido ? profileData.apellido[0] : "") : "PV"}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><LogOut className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Solicitudes Nuevas", value: solicitudes.filter(s => s.estado === 'pendiente').length, icon: Clock, color: "text-info" },
            { label: "Trabajos Confirmados", value: solicitudes.filter(s => s.estado === 'aceptada').length, icon: CheckCircle, color: "text-success" },
            { label: "Calificación", value: "4.9 ★", icon: Star, color: "text-warning" },
            { label: "Servicios Publicados", value: misServicios.length, icon: Package, color: "text-primary" },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-xl border p-5">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted flex-wrap">
            <TabsTrigger value="solicitudes" className="gap-2"><Clock className="w-4 h-4" />Solicitudes</TabsTrigger>
            <TabsTrigger value="cotizaciones" className="gap-2"><FileText className="w-4 h-4" />Cotizaciones Enviadas</TabsTrigger>
            <TabsTrigger value="servicios" className="gap-2"><Package className="w-4 h-4" />Mis Servicios</TabsTrigger>
            <TabsTrigger value="resenas" className="gap-2"><Star className="w-4 h-4" />Reseñas</TabsTrigger>
            <TabsTrigger value="agenda" className="gap-2"><Calendar className="w-4 h-4" />Agenda</TabsTrigger>
            <TabsTrigger value="mapa" className="gap-2"><MapPin className="w-4 h-4" />Mapa de Solicitudes</TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2"><User className="w-4 h-4" />Mi Perfil</TabsTrigger>
          </TabsList>

          {/* Solicitudes */}
          <TabsContent value="solicitudes" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Solicitudes de Servicio Nuevas</h2>
            {solicitudes.filter(s => s.estado === 'pendiente').length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                No tienes solicitudes nuevas pendientes de cotizar.
              </div>
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
                      {req.latitud && req.longitud && (
                        <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> Coordenadas del servicio registradas.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => req.id && iniciarAceptarSolicitud(req.id)} className="gap-1"><CheckCircle className="w-4 h-4" />Cotizar</Button>
                      <Button size="sm" variant="outline" onClick={() => req.id && denegarSolicitud(req.id)} className="gap-1 text-destructive"><XCircle className="w-4 h-4" />Rechazar</Button>
                      <Button size="sm" variant="ghost" onClick={() => req.cliente && abrirChatConCliente(req.cliente.nombre)}><MessageCircle className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Descripción del cliente:</p>
                    <p className="text-sm text-foreground">{req.descripcion}</p>
                  </div>
                  {solicitudCotizarId === req.id && (
                    <form onSubmit={enviarCotizacionAlCliente} className="bg-primary/5 rounded-lg p-4 space-y-3 ring-1 ring-primary/20">
                      <h4 className="font-medium text-foreground text-sm">Enviar Cotización</h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1"><Label className="text-xs">Monto Estimado</Label><Input placeholder="Ej: $85.000" value={montoCotizado} onChange={e => setMontoCotizado(e.target.value)} required /></div>
                        <div className="space-y-1"><Label className="text-xs">Tiempo estimado de trabajo</Label><Input placeholder="Ej: 2 horas" value={tiempoEstimado} onChange={e => setTiempoEstimado(e.target.value)} required /></div>
                        <div className="space-y-1"><Label className="text-xs">Garantía (Opcional)</Label><Input placeholder="Ej: 30 días" value={garantiaCotizada} onChange={e => setGarantiaCotizada(e.target.value)} /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-xs">Detalles de la cotización</Label><Textarea placeholder="Describe brevemente el proceso, materiales incluidos o condiciones..." value={detallesCotizacion} onChange={e => setDetallesCotizacion(e.target.value)} rows={2} /></div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="gap-1"><Send className="w-3 h-3" />Enviar cotización</Button>
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
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                No tienes cotizaciones activas en este momento.
              </div>
            ) : solicitudes.filter(s => s.estado === 'cotizado').map(q => (
              <div key={q.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{q.servicio?.nombre || "Servicio Personalizado"}</h3>
                  <p className="text-sm text-muted-foreground">Cliente: {q.cliente?.nombre} {q.cliente?.apellido} · {q.fecha}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-foreground">{q.monto_cotizado}</span>
                  <Badge className="text-xs bg-warning/10 text-warning">En espera de cliente</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Servicios */}
          <TabsContent value="servicios" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Mis Servicios en LocalService</h2>
              <Button size="sm" onClick={() => setMostrarNuevoServicio(!mostrarNuevoServicio)} className="gap-1"><Plus className="w-4 h-4" />Nuevo Servicio</Button>
            </div>
            {mostrarNuevoServicio && (
              <form onSubmit={crearNuevoServicio} className="bg-card rounded-xl border p-6 space-y-4 animate-in fade-in-50">
                <h3 className="font-semibold text-foreground">Agregar Servicio</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nombre del servicio</Label><Input placeholder="Ej: Reparación de tuberías" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Precio o tarifa base</Label><Input placeholder="Ej: $50.000/hora o $80.000" value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)} required /></div>
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={nuevaCategoria} onChange={e => setNuevaCategoria(e.target.value)}>
                    <option>Plomería</option><option>Electricidad</option><option>Limpieza</option><option>Pintura</option><option>Jardinería</option><option>Tecnología</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>Descripción corta</Label><Textarea placeholder="Describe detalladamente tu servicio..." value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} rows={3} /></div>
                <div className="flex gap-2">
                  <Button type="submit">Guardar</Button>
                  <Button type="button" variant="outline" onClick={() => setMostrarNuevoServicio(false)}>Cancelar</Button>
                </div>
              </form>
            )}
            {misServicios.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                No tienes servicios creados en tu perfil. Haz clic en "Nuevo Servicio" para empezar.
              </div>
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
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => service.id && removerServicio(service.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Reseñas */}
          <TabsContent value="resenas" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mis Reseñas</h2>
            {reviews.map(r => (
              <div key={r.id} className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-muted">{r.client.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                    <span className="font-medium text-foreground text-sm">{r.client}</span>
                  </div>
                  <div className="flex gap-0.5">{Array.from({length: r.rating}).map((_, i) => <Star key={i} className="w-3 h-3 text-warning fill-warning" />)}</div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
                {r.response && (
                  <div className="mt-3 ml-6 pl-4 border-l-2 border-primary/20 bg-primary/[0.03] rounded-r-lg p-3">
                    <p className="text-xs font-medium text-primary mb-1">Tu respuesta</p>
                    <p className="text-sm text-muted-foreground">{r.response}</p>
                  </div>
                )}
                {!r.response && replyingTo !== r.id && (
                  <Button size="sm" variant="ghost" className="mt-2 text-xs text-primary" onClick={() => setReplyingTo(r.id)}>Responder reseña</Button>
                )}
                {replyingTo === r.id && (
                  <div className="mt-3 flex gap-2">
                    <Input placeholder="Escribe tu respuesta..." value={replyText} onChange={e => setReplyText(e.target.value)} className="flex-1 text-sm h-9" />
                    <Button size="sm" onClick={() => responderResena(r.id)} className="gap-1"><Send className="w-3 h-3" />Enviar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancelar</Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* Agenda */}
          <TabsContent value="agenda" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mi Agenda y Servicios Programados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl border p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm">Calendario de Reservas (Mayo 2026)</h3>
                  {diaSeleccionado && (
                    <Button variant="link" size="sm" className="text-xs" onClick={() => setDiaSeleccionado(null)}>
                      Ver todos los días
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                  ))}
                  {Array.from({length: 31}).map((_, i) => {
                    const dia = i + 1;
                    const reservasDia = obtenerReservasDia(dia);
                    const tieneReservas = reservasDia.length > 0;
                    const esSeleccionado = diaSeleccionado === dia;
                    
                    let diaClase = "hover:bg-muted text-foreground";
                    if (tieneReservas) {
                      diaClase = "bg-primary/20 text-primary border border-primary font-bold";
                    }
                    if (esSeleccionado) {
                      diaClase = "bg-primary text-primary-foreground font-bold shadow-md ring-2 ring-primary/40";
                    }

                    return (
                      <button 
                        key={i} 
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
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary/20 border border-primary" /><span className="text-foreground">Días con servicios programados</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-primary text-primary-foreground" /><span className="text-foreground">Día seleccionado</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground text-sm">
                  {diaSeleccionado ? `Servicios para el día ${diaSeleccionado}` : "Próximos servicios programados"}
                </h4>
                <div className="space-y-2">
                  {serviciosFiltradosAgenda.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-lg">
                      No hay citas confirmadas para {diaSeleccionado ? `el día ${diaSeleccionado}` : "este mes"}.
                    </p>
                  ) : serviciosFiltradosAgenda.map(sol => (
                    <div key={sol.id} className="p-3 bg-muted/40 border rounded-lg space-y-2 hover:bg-muted/70 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{sol.servicio?.nombre || "Servicio Personalizado"}</p>
                        <Badge className="text-[10px] bg-success/15 text-success">Confirmado</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Cliente: {sol.cliente?.nombre} {sol.cliente?.apellido}</p>
                      <p className="text-xs text-muted-foreground">Fecha: {sol.fecha} a las {sol.hora}</p>
                      <p className="text-xs text-muted-foreground">Dir: {sol.direccion}</p>
                      <p className="text-xs text-muted-foreground">Tel: {sol.telefono}</p>
                      <div className="flex justify-end gap-1">
                        <Button size="xs" variant="outline" className="h-7 text-xs" onClick={() => sol.cliente && abrirChatConCliente(sol.cliente.nombre)}>Chat</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Mapa de Solicitudes */}
          <TabsContent value="mapa" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Mapa de Solicitudes y Cobertura</h2>
              <Badge variant="outline" className="text-xs">Leaflet & OpenStreetMap</Badge>
            </div>
            <div className="bg-card border rounded-xl p-4">
              <div 
                id="mapa-proveedor" 
                className="w-full h-[500px] rounded-lg overflow-hidden border shadow-inner" 
                style={{ minHeight: "450px" }} 
              />
            </div>
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="perfil" className="max-w-lg space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Mi Perfil de Proveedor</h2>
            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
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
                <div><label className="text-xs text-muted-foreground">Teléfono</label><p className="text-sm font-medium text-foreground">{profileData.phone}</p></div>
                <div><label className="text-xs text-muted-foreground">Servicios activos</label><p className="text-sm font-medium text-foreground">{misServicios.filter(s => s.esta_activo).length}</p></div>
                <div><label className="text-xs text-muted-foreground">Años de experiencia</label><p className="text-sm font-medium text-foreground">{profileData.anios_experiencia} años</p></div>
                <div><label className="text-xs text-muted-foreground">Precio por hora</label><p className="text-sm font-medium text-foreground">${profileData.precio_por_hora.toLocaleString()}/hora</p></div>
                <div><label className="text-xs text-muted-foreground">Zona de cobertura (Ciudad)</label><p className="text-sm font-medium text-foreground">{profileData.ciudad || "No especificada"}</p></div>
                
                {/* Horario Semanal JSON renderizado por día */}
                <div className="col-span-2 border-t pt-3 mt-1">
                  <label className="text-xs text-muted-foreground font-semibold">Horario de atención semanal</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {Object.entries(normalizarHorario(profileData.horario_atencion)).map(([dia, horas]) => (
                      <div key={dia} className="bg-muted p-2 rounded text-[11px] border">
                        <span className="font-semibold block text-foreground">{dia}</span>
                        <span className="text-muted-foreground">{horas}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2"><label className="text-xs text-muted-foreground">Enlaces de Portafolio</label><p className="text-sm font-medium text-foreground break-all">{profileData.enlaces_portafolio || "Ninguno"}</p></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground">Habilidades</label><p className="text-sm font-medium text-foreground">{profileData.habilidades || "Ninguna"}</p></div>
                <div className="col-span-2"><label className="text-xs text-muted-foreground">Biografía</label><p className="text-sm text-muted-foreground leading-relaxed">{profileData.biografia || "Sin biografía"}</p></div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setEditProfile(profileData); setEditProfileOpen(true); }}>Editar Perfil</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={servicioEditId !== null} onOpenChange={open => { if (!open) setServicioEditId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Servicio</DialogTitle>
            <DialogDescription>Modifica la información de tu servicio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nombre del servicio</Label><Input value={datosEditServicio.name} onChange={e => setDatosEditServicio({ ...datosEditServicio, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Precio o tarifa base</Label><Input value={datosEditServicio.price} onChange={e => setDatosEditServicio({ ...datosEditServicio, price: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={datosEditServicio.category} onChange={e => setDatosEditServicio({ ...datosEditServicio, category: e.target.value })}>
                <option>Plomería</option><option>Electricidad</option><option>Limpieza</option><option>Pintura</option><option>Jardinería</option><option>Tecnología</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={datosEditServicio.description} onChange={e => setDatosEditServicio({ ...datosEditServicio, description: e.target.value })} rows={3} /></div>
            <div className="flex gap-2 pt-2">
              <Button onClick={guardarServicioEditado} className="flex-1">Guardar cambios</Button>
              <Button variant="outline" onClick={() => setServicioEditId(null)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza tu información de proveedor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre</Label><Input value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={editProfile.apellido} onChange={e => setEditProfile({ ...editProfile, apellido: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Categoría de Servicio</Label><Input value={editProfile.categoria_servicio} onChange={e => setEditProfile({ ...editProfile, categoria_servicio: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editProfile.email} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={editProfile.phone} onChange={e => setEditProfile({ ...editProfile, phone: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2"><Label>Ciudad / Cobertura</Label><Input value={editProfile.ciudad} onChange={e => setEditProfile({ ...editProfile, ciudad: e.target.value })} /></div>
              <div className="space-y-2"><Label>Exp. (Años)</Label><Input type="number" value={editProfile.anios_experiencia} onChange={e => setEditProfile({ ...editProfile, anios_experiencia: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Precio por Hora (Tarifa base)</Label>
              <Input type="number" value={editProfile.precio_por_hora} onChange={e => setEditProfile({ ...editProfile, precio_por_hora: parseFloat(e.target.value) || 0 })} />
            </div>

            {/* Editor de horario de atención diario */}
            <div className="border-t pt-3 mt-2 space-y-2">
              <Label className="text-sm font-semibold text-foreground">Editar Horario de Atención por Día</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border rounded p-3 bg-muted/20">
                {diasSemana.map(dia => {
                  const horarioActual = normalizarHorario(editProfile.horario_atencion);
                  return (
                    <div key={dia} className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-foreground w-20">{dia}</span>
                      <Input 
                        className="h-8 text-xs flex-1" 
                        value={horarioActual[dia] || ""} 
                        placeholder="Ej: 8:00 AM - 6:00 PM o No disponible"
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

            <div className="space-y-2"><Label>Habilidades (separadas por coma)</Label><Input value={editProfile.habilidades} onChange={e => setEditProfile({ ...editProfile, habilidades: e.target.value })} /></div>
            <div className="space-y-2"><Label>Enlaces de Portafolio</Label><Input value={editProfile.enlaces_portafolio} onChange={e => setEditProfile({ ...editProfile, enlaces_portafolio: e.target.value })} /></div>
            <div className="space-y-2"><Label>Biografía</Label><Textarea value={editProfile.biografia} onChange={e => setEditProfile({ ...editProfile, biografia: e.target.value })} rows={3} /></div>
            <div className="flex gap-2 pt-2">
              <Button onClick={guardarCambiosPerfil} className="flex-1">Guardar cambios</Button>
              <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChatPanel contactName={chatContact.name} contactInitials={chatContact.initials} contactRole={chatContact.role} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default ProviderPanel;
