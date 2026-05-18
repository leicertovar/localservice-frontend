import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle, XCircle, Star, DollarSign, Calendar, User, LogOut, Bell, Plus, TrendingUp, MessageCircle, Send, FileText } from "lucide-react";
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

const initialServices = [
  { id: 1, name: "Reparación de tuberías", category: "Plomería", price: "$50.000/hora", active: true, requests: 12, description: "Reparación de fugas, roturas y reemplazo de tuberías." },
  { id: 2, name: "Instalación de grifos", category: "Plomería", price: "$80.000", active: true, requests: 8, description: "Instalación y reemplazo de grifería." },
  { id: 3, name: "Destape de cañerías", category: "Plomería", price: "$60.000", active: false, requests: 5, description: "Destape profesional con equipo especializado." },
  { id: 4, name: "Instalación de calentadores", category: "Plomería", price: "$150.000", active: true, requests: 3, description: "Instalación de calentadores eléctricos y a gas." },
];

const incomingRequests = [
  { id: 1, client: "Ana García", service: "Reparación de tuberías", date: "2026-04-10", time: "10:00 AM", location: "Calle 5 #12-30, Barrio Centro", status: "Pendiente", description: "Fuga de agua debajo del lavaplatos de la cocina. La tubería parece tener una pequeña grieta.", phone: "+57 300 111 2233" },
  { id: 2, client: "Luis Martínez", service: "Instalación de grifos", date: "2026-04-11", time: "2:00 PM", location: "Av. Principal #45-12", status: "Pendiente", description: "Necesito instalar un grifo nuevo en el baño principal. Ya compré el grifo.", phone: "+57 311 444 5566" },
  { id: 3, client: "Carmen Díaz", service: "Reparación de tuberías", date: "2026-04-08", time: "9:00 AM", location: "Barrio Central #8-15", status: "Aceptada", description: "Tubería rota en el baño, hay mucha humedad en la pared.", phone: "+57 315 777 8899" },
];

const quotes = [
  { id: 1, client: "Ana García", service: "Reparación de tuberías", amount: "$85.000", status: "Enviada", date: "2026-04-08" },
  { id: 2, client: "Luis Martínez", service: "Instalación de grifos", amount: "$95.000", status: "Aceptada", date: "2026-04-07" },
  { id: 3, client: "Fernando Paz", service: "Destape de cañerías", amount: "$70.000", status: "Rechazada", date: "2026-04-05" },
];

const reviews = [
  { id: 1, client: "Ana García", rating: 5, comment: "Excelente trabajo, muy puntual y profesional.", date: "2026-04-01", response: "¡Gracias Ana! Fue un placer." },
  { id: 2, client: "Pedro López", rating: 4, comment: "Buen servicio, solucionó el problema rápido.", date: "2026-03-25", response: null },
  { id: 3, client: "María Torres", rating: 5, comment: "Lo recomiendo, muy buen precio y calidad.", date: "2026-03-20", response: "¡Muchas gracias María!" },
  { id: 4, client: "Laura Díaz", rating: 4, comment: "Buen trabajo aunque tardó un poco más de lo esperado.", date: "2026-03-10", response: null },
];

const earnings = [
  { month: "Enero", amount: "$1.800.000", jobs: 35 },
  { month: "Febrero", amount: "$2.100.000", jobs: 41 },
  { month: "Marzo", amount: "$2.350.000", jobs: 46 },
  { month: "Abril", amount: "$850.000", jobs: 15 },
];

const ProviderPanel = () => {
  const [myServices, setMyServices] = useState(initialServices);
  const [showNewService, setShowNewService] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContact, setChatContact] = useState({ name: "", initials: "", role: "" });
  const [editServiceId, setEditServiceId] = useState<number | null>(null);
  const [editServiceData, setEditServiceData] = useState({ name: "", price: "", category: "", description: "", active: true });
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "", email: "", phone: "", zone: "", title: "Proveedor",
  });
  const [editProfile, setEditProfile] = useState(profileData);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      const storedProfile = getUserProfile()
      if (storedProfile) {
        const fullName = `${storedProfile.name}${storedProfile.last_name ? ` ${storedProfile.last_name}` : ''}`.trim()
        setProfileData({
          name: fullName,
          email: storedProfile.email,
          phone: storedProfile.phone,
          zone: storedProfile.city ?? '',
          title: storedProfile.role === 'proveedor' ? 'Proveedor de servicios' : 'Proveedor',
        })
        setEditProfile({
          name: fullName,
          email: storedProfile.email,
          phone: storedProfile.phone,
          zone: storedProfile.city ?? '',
          title: storedProfile.role === 'proveedor' ? 'Proveedor de servicios' : 'Proveedor',
        })
        return
      }

      try {
        const currentUser = await fetchCurrentUser()
        const fullName = `${currentUser.name}${currentUser.last_name ? ` ${currentUser.last_name}` : ''}`.trim()
        setProfileData({
          name: fullName,
          email: currentUser.email,
          phone: currentUser.phone,
          zone: currentUser.city ?? '',
          title: currentUser.role === 'proveedor' ? 'Proveedor de servicios' : 'Proveedor',
        })
        setEditProfile({
          name: fullName,
          email: currentUser.email,
          phone: currentUser.phone,
          zone: currentUser.city ?? '',
          title: currentUser.role === 'proveedor' ? 'Proveedor de servicios' : 'Proveedor',
        })
      } catch (error) {
        console.error('Error cargando perfil del proveedor:', error)
      }
    }

    loadProfile()
  }, [])

  const handleAccept = (id: number) => {
    toast({ title: "Solicitud aceptada", description: `Solicitud #${id} ha sido aceptada. Envía una cotización al cliente.` });
    setShowQuoteForm(id);
  };

  const handleReject = (id: number) => {
    toast({ title: "Solicitud rechazada", description: `Solicitud #${id} ha sido rechazada.`, variant: "destructive" });
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuoteForm(null);
    toast({ title: "Cotización enviada", description: "El cliente recibirá tu cotización y podrá aceptarla o rechazarla." });
  };

  const handleReplyReview = (id: number) => {
    if (!replyText.trim()) return;
    toast({ title: "Respuesta publicada", description: "Tu respuesta a la reseña ha sido publicada." });
    setReplyingTo(null);
    setReplyText("");
  };

  const openChat = (name: string) => {
    const initials = name.split(" ").map(n => n[0]).join("");
    setChatContact({ name, initials, role: "Cliente" });
    setChatOpen(true);
  };

  const openEditService = (service: typeof initialServices[0]) => {
    setEditServiceData({ name: service.name, price: service.price, category: service.category, description: service.description, active: service.active });
    setEditServiceId(service.id);
  };

  const handleSaveService = () => {
    setMyServices(prev => prev.map(s => s.id === editServiceId ? { ...s, ...editServiceData } : s));
    setEditServiceId(null);
    toast({ title: "Servicio actualizado", description: `"${editServiceData.name}" ha sido actualizado correctamente.` });
  };

  const handleToggleService = (id: number) => {
    setMyServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    const service = myServices.find(s => s.id === id);
    toast({ title: service?.active ? "Servicio desactivado" : "Servicio activado", description: `"${service?.name}" ha sido ${service?.active ? "desactivado" : "activado"}.` });
  };

  const handleSaveProfile = () => {
    setProfileData(editProfile);
    setEditProfileOpen(false);
    toast({ title: "Perfil actualizado", description: "Tu información ha sido guardada correctamente." });
  };

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
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">2</span>
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-accent text-accent-foreground text-xs">CM</AvatarFallback>
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
            { label: "Solicitudes Nuevas", value: "5", icon: Clock, color: "text-info" },
            { label: "Trabajos Completados", value: "48", icon: CheckCircle, color: "text-success" },
            { label: "Calificación", value: "4.9 ★", icon: Star, color: "text-warning" },
            { label: "Ingresos del Mes", value: "$2.4M", icon: DollarSign, color: "text-primary" },
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

        <Tabs defaultValue="solicitudes" className="space-y-6">
          <TabsList className="bg-muted flex-wrap">
            <TabsTrigger value="solicitudes" className="gap-2"><Clock className="w-4 h-4" />Solicitudes</TabsTrigger>
            <TabsTrigger value="cotizaciones" className="gap-2"><FileText className="w-4 h-4" />Cotizaciones</TabsTrigger>
            <TabsTrigger value="servicios" className="gap-2"><Package className="w-4 h-4" />Mis Servicios</TabsTrigger>
            <TabsTrigger value="resenas" className="gap-2"><Star className="w-4 h-4" />Reseñas</TabsTrigger>
            <TabsTrigger value="ingresos" className="gap-2"><DollarSign className="w-4 h-4" />Ingresos</TabsTrigger>
            <TabsTrigger value="agenda" className="gap-2"><Calendar className="w-4 h-4" />Agenda</TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2"><User className="w-4 h-4" />Perfil</TabsTrigger>
          </TabsList>

          {/* Solicitudes */}
          <TabsContent value="solicitudes" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Solicitudes de Servicio</h2>
            {incomingRequests.map(req => (
              <div key={req.id} className="bg-card rounded-xl border p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{req.service}</h3>
                        <Badge variant={req.status === "Pendiente" ? "secondary" : "default"} className="text-xs">{req.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Cliente: {req.client} · {req.phone}</p>
                      <p className="text-sm text-muted-foreground">{req.date} · {req.time} · {req.location}</p>
                    </div>
                    <div className="flex gap-2">
                      {req.status === "Pendiente" && (
                        <>
                          <Button size="sm" onClick={() => handleAccept(req.id)} className="gap-1"><CheckCircle className="w-4 h-4" />Aceptar</Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="gap-1 text-destructive"><XCircle className="w-4 h-4" />Rechazar</Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => openChat(req.client)}><MessageCircle className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Descripción del cliente:</p>
                    <p className="text-sm text-foreground">{req.description}</p>
                  </div>
                  {showQuoteForm === req.id && (
                    <form onSubmit={handleSendQuote} className="bg-primary/5 rounded-lg p-4 space-y-3 ring-1 ring-primary/20">
                      <h4 className="font-medium text-foreground text-sm">Enviar Cotización</h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1"><Label className="text-xs">Monto</Label><Input placeholder="$85.000" required /></div>
                        <div className="space-y-1"><Label className="text-xs">Tiempo estimado</Label><Input placeholder="2 horas" required /></div>
                        <div className="space-y-1"><Label className="text-xs">Garantía</Label><Input placeholder="30 días" /></div>
                      </div>
                      <div className="space-y-1"><Label className="text-xs">Detalles de la cotización</Label><Textarea placeholder="Describe los materiales, el proceso y condiciones..." rows={2} /></div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="gap-1"><Send className="w-3 h-3" />Enviar cotización</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowQuoteForm(null)}>Cancelar</Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Cotizaciones */}
          <TabsContent value="cotizaciones" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mis Cotizaciones</h2>
            {quotes.map(q => (
              <div key={q.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{q.service}</h3>
                  <p className="text-sm text-muted-foreground">Cliente: {q.client} · {q.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-foreground">{q.amount}</span>
                  <Badge className={`text-xs ${q.status === "Aceptada" ? "bg-success/10 text-success" : q.status === "Rechazada" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>{q.status}</Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Servicios */}
          <TabsContent value="servicios" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Mis Servicios</h2>
              <Button size="sm" onClick={() => setShowNewService(!showNewService)} className="gap-1"><Plus className="w-4 h-4" />Nuevo Servicio</Button>
            </div>
            {showNewService && (
              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Agregar Servicio</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nombre del servicio</Label><Input placeholder="Ej: Reparación de tuberías" /></div>
                  <div className="space-y-2"><Label>Precio</Label><Input placeholder="$50.000/hora" /></div>
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                    <option>Plomería</option><option>Electricidad</option><option>Limpieza</option><option>Pintura</option><option>Jardinería</option><option>Tecnología</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>Descripción</Label><Textarea placeholder="Describe detalladamente tu servicio..." rows={3} /></div>
                <div className="flex gap-2">
                  <Button onClick={() => { setShowNewService(false); toast({ title: "Servicio creado", description: "Tu nuevo servicio ya está visible para los clientes." }); }}>Guardar</Button>
                  <Button variant="outline" onClick={() => setShowNewService(false)}>Cancelar</Button>
                </div>
              </div>
            )}
            {myServices.map(service => (
              <div key={service.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                    <Badge variant={service.active ? "default" : "secondary"} className="text-xs">{service.active ? "Activo" : "Inactivo"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.category} · {service.price} · {service.requests} solicitudes</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleToggleService(service.id)}>
                    {service.active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditService(service)}>Editar</Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Reseñas */}
          <TabsContent value="resenas" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mis Reseñas</h2>
            <div className="bg-card rounded-xl border p-5 mb-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">4.9</p>
                  <div className="flex gap-0.5 mt-1">{[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-warning fill-warning" />)}</div>
                  <p className="text-xs text-muted-foreground mt-1">128 reseñas</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[{s:5,w:77},{s:4,w:17},{s:3,w:4},{s:2,w:1.5},{s:1,w:0.5}].map(r => (
                    <div key={r.s} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6">{r.s}★</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-warning rounded-full" style={{ width: `${r.w}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                    <Button size="sm" onClick={() => handleReplyReview(r.id)} className="gap-1"><Send className="w-3 h-3" />Enviar</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancelar</Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* Ingresos */}
          <TabsContent value="ingresos" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Resumen de Ingresos</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-card rounded-xl border p-5">
                <p className="text-xs text-muted-foreground mb-1">Ingresos totales (2026)</p>
                <p className="text-3xl font-bold text-foreground">$7.100.000</p>
                <p className="text-xs text-success mt-1">↑ 23% vs año anterior</p>
              </div>
              <div className="bg-card rounded-xl border p-5">
                <p className="text-xs text-muted-foreground mb-1">Trabajos totales</p>
                <p className="text-3xl font-bold text-foreground">137</p>
                <p className="text-xs text-success mt-1">↑ 15% vs año anterior</p>
              </div>
            </div>
            {earnings.map(e => (
              <div key={e.month} className="bg-card rounded-xl border p-4 flex items-center justify-between">
                <div><p className="font-medium text-foreground">{e.month} 2026</p><p className="text-xs text-muted-foreground">{e.jobs} trabajos completados</p></div>
                <p className="text-lg font-bold text-foreground">{e.amount}</p>
              </div>
            ))}
          </TabsContent>

          {/* Agenda */}
          <TabsContent value="agenda" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mi Agenda</h2>
            <div className="bg-card rounded-xl border p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({length: 28}).map((_, i) => (
                  <button key={i} className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                    i === 9 || i === 10 ? "bg-primary text-primary-foreground" :
                    i === 14 ? "bg-accent text-accent-foreground" :
                    i === 7 ? "bg-success/20 text-success" :
                    "hover:bg-muted text-foreground"
                  }`}>{i + 1}</button>
                ))}
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded bg-primary" /><span className="text-foreground">Servicios programados</span></div>
                <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded bg-accent" /><span className="text-foreground">Cotizaciones pendientes</span></div>
                <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded bg-success/60" /><span className="text-foreground">Completados</span></div>
              </div>
              <h4 className="font-medium text-foreground text-sm mb-3">Próximos servicios</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div><p className="text-sm font-medium text-foreground">Reparación de tuberías</p><p className="text-xs text-muted-foreground">Ana García · 10 Abr, 10:00 AM</p></div>
                  <Badge className="text-xs">Confirmado</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div><p className="text-sm font-medium text-foreground">Instalación de grifos</p><p className="text-xs text-muted-foreground">Luis Martínez · 11 Abr, 2:00 PM</p></div>
                  <Badge variant="secondary" className="text-xs">Pendiente</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Perfil */}
          <TabsContent value="perfil" className="max-w-lg space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Mi Perfil de Proveedor</h2>
            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16"><AvatarFallback className="bg-accent text-accent-foreground text-xl">CM</AvatarFallback></Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{profileData.name}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.title}</p>
                  <Badge className="mt-1 text-xs bg-success/10 text-success">Verificado ✓</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">Email</label><p className="text-sm font-medium text-foreground">{profileData.email}</p></div>
                <div><label className="text-xs text-muted-foreground">Teléfono</label><p className="text-sm font-medium text-foreground">{profileData.phone}</p></div>
                <div><label className="text-xs text-muted-foreground">Servicios activos</label><p className="text-sm font-medium text-foreground">{myServices.filter(s => s.active).length}</p></div>
                <div><label className="text-xs text-muted-foreground">Trabajos completados</label><p className="text-sm font-medium text-foreground">48</p></div>
                <div><label className="text-xs text-muted-foreground">Miembro desde</label><p className="text-sm font-medium text-foreground">Enero 2025</p></div>
                <div><label className="text-xs text-muted-foreground">Zona de cobertura</label><p className="text-sm font-medium text-foreground">{profileData.zone}</p></div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setEditProfile(profileData); setEditProfileOpen(true); }}>Editar Perfil</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={editServiceId !== null} onOpenChange={open => { if (!open) setEditServiceId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Servicio</DialogTitle>
            <DialogDescription>Modifica la información de tu servicio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nombre del servicio</Label><Input value={editServiceData.name} onChange={e => setEditServiceData({ ...editServiceData, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Precio</Label><Input value={editServiceData.price} onChange={e => setEditServiceData({ ...editServiceData, price: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={editServiceData.category} onChange={e => setEditServiceData({ ...editServiceData, category: e.target.value })}>
                <option>Plomería</option><option>Electricidad</option><option>Limpieza</option><option>Pintura</option><option>Jardinería</option><option>Tecnología</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={editServiceData.description} onChange={e => setEditServiceData({ ...editServiceData, description: e.target.value })} rows={3} /></div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveService} className="flex-1">Guardar cambios</Button>
              <Button variant="outline" onClick={() => setEditServiceId(null)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza tu información de proveedor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nombre completo</Label><Input value={editProfile.name} onChange={e => setEditProfile({ ...editProfile, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Título profesional</Label><Input value={editProfile.title} onChange={e => setEditProfile({ ...editProfile, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editProfile.email} onChange={e => setEditProfile({ ...editProfile, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={editProfile.phone} onChange={e => setEditProfile({ ...editProfile, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Zona de cobertura</Label><Input value={editProfile.zone} onChange={e => setEditProfile({ ...editProfile, zone: e.target.value })} /></div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveProfile} className="flex-1">Guardar cambios</Button>
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
