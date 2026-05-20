import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Shield, MessageCircle, Calendar, CheckCircle, DollarSign } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ChatPanel from "@/components/reusable/ChatPanel";
import { obtenerDetalleProveedor } from "@/services/proveedorService";
import { crearSolicitud } from "@/services/reservaService";

// Días de la semana para el horario
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Horario por defecto si el proveedor no ha especificado uno
const horarioPorDefecto = {
  "Lunes": "8:00 AM - 6:00 PM",
  "Martes": "8:00 AM - 6:00 PM",
  "Miércoles": "8:00 AM - 6:00 PM",
  "Jueves": "8:00 AM - 6:00 PM",
  "Viernes": "8:00 AM - 6:00 PM",
  "Sábado": "9:00 AM - 1:00 PM",
  "Domingo": "No disponible"
};

const ProviderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [proveedor, setProveedor] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  // --- Estados de Formulario de Cotización ---
  const [servicioSeleccionadoId, setServicioSeleccionadoId] = useState<string>("");
  const [fechaDeseada, setFechaDeseada] = useState("");
  const [horaDeseada, setHoraDeseada] = useState("");
  const [direccionServicio, setDireccionServicio] = useState("");
  const [descripcionProblema, setDescripcionProblema] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");

  // Coordenadas seleccionadas en el mapa
  const [latitud, setLatitud] = useState<number>(3.8801); // Centro de Buenaventura
  const [longitud, setLongitud] = useState<number>(-77.0707);

  const { toast } = useToast();

  // Referencias para el mapa de Leaflet
  const clientMapRef = useRef<any>(null);
  const clientMarkerRef = useRef<any>(null);

  /**
   * Carga los datos del proveedor y sus servicios desde el backend.
   */
  const cargarInformacionProveedor = async () => {
    if (!id) return;
    try {
      const data = await obtenerDetalleProveedor(id);
      setProveedor(data);
      // Pre-seleccionar el primer servicio si existe
      if (data.servicios && data.servicios.length > 0) {
        setServicioSeleccionadoId(String(data.servicios[0].id));
      }
    } catch (error) {
      console.error("Error al cargar proveedor:", error);
      toast({ 
        title: "Error al cargar", 
        description: "No se pudo obtener la información de este proveedor desde la API.", 
        variant: "destructive" 
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarInformacionProveedor();
  }, [id]);

  /**
   * Inicializa el mini mapa de Leaflet en el formulario de cotización.
   */
  const inicializarMapaCliente = () => {
    // Si ya existe una instancia de mapa activa, la destruimos
    if (clientMapRef.current) {
      try {
        clientMapRef.current.remove();
      } catch (e) {
        console.error("Error al remover mapa del cliente:", e);
      }
      clientMapRef.current = null;
      clientMarkerRef.current = null;
    }

    const mapaElement = document.getElementById("mapa-cliente");
    if (!mapaElement) {
      console.warn("Elemento mapa-cliente no encontrado.");
      return;
    }

    // Corregir problemas de carga de iconos en Leaflet para entornos empaquetados
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Iniciar mapa centrado en Buenaventura
    const mapa = L.map("mapa-cliente").setView([3.8801, -77.0707], 14);
    clientMapRef.current = mapa;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);

    // Marcador arrastrable en el mapa
    const marcador = L.marker([3.8801, -77.0707], { draggable: true }).addTo(mapa);
    clientMarkerRef.current = marcador;

    // Actualizar coordenadas en el estado tras arrastrar el marcador
    marcador.on("dragend", () => {
      const pos = marcador.getLatLng();
      setLatitud(pos.lat);
      setLongitud(pos.lng);
    });

    // Actualizar coordenadas tras hacer clic en cualquier punto del mapa
    mapa.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      marcador.setLatLng([lat, lng]);
      setLatitud(lat);
      setLongitud(lng);
    });
  };

  // Observa cuándo se abre el formulario de cotización para iniciar el mapa
  useEffect(() => {
    if (showQuoteForm) {
      const temporizador = setTimeout(() => {
        inicializarMapaCliente();
      }, 100);
      return () => {
        clearTimeout(temporizador);
        if (clientMapRef.current) {
          clientMapRef.current.remove();
          clientMapRef.current = null;
          clientMarkerRef.current = null;
        }
      };
    }
  }, [showQuoteForm]);

  /**
   * Envía el formulario para crear una solicitud de cotización/servicio en la base de datos.
   */
  const enviarSolicitudCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!fechaDeseada || !horaDeseada || !direccionServicio || !descripcionProblema || !telefonoContacto) {
      toast({ title: "Campos incompletos", description: "Todos los campos obligatorios deben llenarse.", variant: "destructive" });
      return;
    }

    try {
      await crearSolicitud({
        proveedor_id: id,
        servicio_id: servicioSeleccionadoId ? Number(servicioSeleccionadoId) : null,
        fecha: fechaDeseada,
        hora: horaDeseada,
        direccion: direccionServicio,
        descripcion: descripcionProblema,
        telefono: telefonoContacto,
        latitud: latitud,
        longitud: longitud
      });

      setShowQuoteForm(false);
      // Limpiar formulario
      setFechaDeseada("");
      setHoraDeseada("");
      setDireccionServicio("");
      setDescripcionProblema("");
      setTelefonoContacto("");
      setLatitud(3.8801);
      setLongitud(-77.0707);

      toast({ 
        title: "Cotización solicitada", 
        description: "Tu solicitud ha sido registrada correctamente con coordenadas. El proveedor la revisará en su mapa y panel." 
      });
    } catch (error: any) {
      console.error(error);
      toast({ 
        title: "Error de envío", 
        description: error.response?.data?.mensaje || "Hubo un error al intentar crear la solicitud de servicio.", 
        variant: "destructive" 
      });
    }
  };

  /**
   * Normaliza la estructura del horario guardado (soporta string plano y JSON).
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
        // En caso de que sea el string heredado
        return {
          "Lunes - Viernes": horario,
          "Sábado": "9:00 AM - 1:00 PM",
          "Domingo": "No disponible"
        };
      }
    }
    return { ...horarioPorDefecto };
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando perfil del proveedor...</p>
      </div>
    );
  }

  if (!proveedor) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-sm">No se encontró el proveedor especificado.</p>
        <Button asChild variant="outline"><Link to="/cliente">Volver al panel</Link></Button>
      </div>
    );
  }

  const p = proveedor.perfil_proveedor || {};
  const nombreCompleto = `${proveedor.nombre} ${proveedor.apellido || ""}`.trim();
  const iniciales = `${proveedor.nombre ? proveedor.nombre[0] : ""}${proveedor.apellido ? proveedor.apellido[0] : ""}`;
  const servicios = proveedor.servicios || [];

  // Distribución de calificaciones (Estático para maqueta visual de estrellas)
  const ratingDistribution = [
    { stars: 5, count: 98, percent: 77 },
    { stars: 4, count: 22, percent: 17 },
    { stars: 3, count: 5, percent: 4 },
    { stars: 2, count: 2, percent: 1.5 },
    { stars: 1, count: 1, percent: 0.5 },
  ];

  // Reseñas estáticas (Mock)
  const reviewsList = [
    { id: 1, client: "Ana García", rating: 5, comment: "Excelente trabajo, muy puntual y profesional. Reparó la fuga en menos de una hora.", date: "2026-04-01", response: "¡Gracias Ana! Fue un placer atenderte. Cualquier cosa, estoy a la orden." },
    { id: 2, client: "Pedro López", rating: 4, comment: "Buen servicio, solucionó el problema rápido. El precio fue justo.", date: "2026-03-25", response: null },
    { id: 3, client: "María Torres", rating: 5, comment: "Lo recomiendo ampliamente. Muy buen precio y excelente calidad de trabajo.", date: "2026-03-20", response: "¡Muchas gracias María! Me alegra que hayas quedado satisfecha." },
  ];

  // Disponibilidad de horario semanal mapeada a partir de los datos JSON del proveedor
  const availability = Object.entries(normalizarHorario(p.horario_atencion)).map(([day, hours]) => ({ day, hours }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/cliente" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver al listado</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Provider Header */}
        <div className="bg-card rounded-2xl border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="w-24 h-24 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{iniciales}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{nombreCompleto}</h1>
                    {p.esta_verificado && (
                      <Badge className="bg-success/10 text-success border-success/20 gap-1">
                        <Shield className="w-3 h-3" />Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{p.categoria_servicio || "Proveedor de Servicios"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2" onClick={() => setChatOpen(true)}>
                    <MessageCircle className="w-4 h-4" />Mensaje
                  </Button>
                  <Button className="gap-2" onClick={() => setShowQuoteForm(true)}>
                    <DollarSign className="w-4 h-4" />Solicitar Cotización
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1 text-foreground font-medium">
                  <Star className="w-4 h-4 text-warning fill-warning" />{p.calificacion || "4.9"} ({p.total_resenas || 0} reseñas)
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />{p.ciudad || "Ciudad no especificada"}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />Exp. {p.anios_experiencia || 0} años
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />${Number(p.precio_por_hora || 0).toLocaleString()}/hora base
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{p.biografia || "Este proveedor aún no cuenta con una biografía detallada en su perfil público."}</p>
            </div>
          </div>
        </div>

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div className="bg-card rounded-2xl border p-6 mb-6 ring-2 ring-primary/20 animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-4">Solicitar Cotización</h3>
            <form onSubmit={enviarSolicitudCotizacion} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Servicio requerido</Label>
                  <select 
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm" 
                    value={servicioSeleccionadoId} 
                    onChange={e => setServicioSeleccionadoId(e.target.value)}
                  >
                    {servicios.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.nombre} ({s.precio})</option>
                    ))}
                    <option value="">Servicio Personalizado / Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha deseada</Label>
                  <Input type="date" value={fechaDeseada} onChange={e => setFechaDeseada(e.target.value)} required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora de preferencia</Label>
                  <Input placeholder="Ej: 10:00 AM o Tarde (2-5 PM)" value={horaDeseada} onChange={e => setHoraDeseada(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono de contacto</Label>
                  <Input type="tel" placeholder="Ej: +57 310 555 1234" value={telefonoContacto} onChange={e => setTelefonoContacto(e.target.value)} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Dirección del servicio (Barrio, Calle, detalles escritos)</Label>
                <Input placeholder="Ej: Calle 5 #12-30, Barrio Centro" value={direccionServicio} onChange={e => setDireccionServicio(e.target.value)} required />
              </div>

              {/* Mini mapa Leaflet */}
              <div className="space-y-2">
                <Label className="block">Ubicación exacta en el mapa (Haz clic o arrastra el marcador)</Label>
                <div id="mapa-cliente" className="w-full h-64 rounded-lg overflow-hidden border" style={{ minHeight: "250px" }} />
                <div className="grid grid-cols-2 gap-3 text-[11px] text-muted-foreground mt-2 bg-muted/40 p-2 rounded border">
                  <div>
                    <span className="font-semibold text-foreground">Latitud:</span> {latitud.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Longitud:</span> {longitud.toFixed(6)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción detallada del problema o trabajo</Label>
                <Textarea placeholder="Por favor describe lo que necesitas que el proveedor realice..." value={descripcionProblema} onChange={e => setDescripcionProblema(e.target.value)} rows={3} required />
              </div>

              <div className="flex gap-3">
                <Button type="submit">Enviar Solicitud</Button>
                <Button type="button" variant="outline" onClick={() => setShowQuoteForm(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="servicios" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="servicios">Servicios Disponibles</TabsTrigger>
            <TabsTrigger value="resenas">Reseñas ({p.total_resenas || 0})</TabsTrigger>
            <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
          </TabsList>

          <TabsContent value="servicios" className="space-y-4">
            {servicios.length === 0 ? (
              <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
                Este proveedor aún no ha publicado servicios específicos. Puedes pulsar "Solicitar Cotización" para enviarle una propuesta personalizada.
              </div>
            ) : servicios.map((service: any) => (
              <div key={service.id} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{service.nombre}</h3>
                  <span className="text-lg font-bold text-primary">{service.precio}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{service.descripcion || "Sin descripción adicional."}</p>
                <Button size="sm" onClick={() => { setServicioSeleccionadoId(String(service.id)); setShowQuoteForm(true); }}>Solicitar este servicio</Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="resenas" className="space-y-6">
            {/* Resumen de Calificación */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-5xl font-bold text-foreground">{p.calificacion || "4.9"}</p>
                  <div className="flex gap-0.5 mt-2 justify-center sm:justify-start">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 text-warning fill-warning" />)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{p.total_resenas || 0} reseñas totales</p>
                </div>
                <div className="flex-1 space-y-2">
                  {ratingDistribution.map(r => (
                    <div key={r.stars} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-8">{r.stars} ★</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full" style={{ width: `${r.percent}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Listado de Reseñas */}
            {reviewsList.map(r => (
              <div key={r.id} className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-xs bg-muted">{r.client.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.client}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-warning fill-warning" />)}
                    {Array.from({ length: 5 - r.rating }).map((_, i) => <Star key={i} className="w-4 h-4 text-muted" />)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>

                {r.response && (
                  <div className="mt-3 ml-6 pl-4 border-l-2 border-primary/20 bg-primary/[0.03] rounded-r-lg p-3">
                    <p className="text-xs font-medium text-primary mb-1">Respuesta de {nombreCompleto}</p>
                    <p className="text-sm text-muted-foreground">{r.response}</p>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="disponibilidad">
            <div className="bg-card rounded-xl border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />Horario de Atención
              </h3>
              <div className="space-y-3">
                {availability.map(slot => (
                  <div key={slot.day} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium text-foreground text-sm">{slot.day}</span>
                    <span className="text-sm text-muted-foreground">{slot.hours}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Nota:</strong> Los horarios pueden variar según disponibilidad de la zona de cobertura. 
                  Para asegurar tu cita con {nombreCompleto}, por favor realiza la solicitud formal completando el formulario de cotización de arriba.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ChatPanel
        contactName={nombreCompleto}
        contactInitials={iniciales}
        contactRole={p.categoria_servicio || "Proveedor de Servicios"}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
};

export default ProviderDetail;
