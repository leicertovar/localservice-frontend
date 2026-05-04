import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, Shield, MessageCircle, Phone, Calendar, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ChatPanel from "@/components/ChatPanel";

const providerData = {
  id: 1,
  name: "Carlos Mendoza",
  initials: "CM",
  title: "Plomero Profesional Certificado",
  category: "Plomería",
  rating: 4.9,
  reviews: 128,
  completedJobs: 215,
  memberSince: "Enero 2025",
  location: "Buenaventura, Valle del Cauca",
  phone: "+57 310 555 1234",
  responseTime: "< 30 min",
  verified: true,
  description: "Plomero profesional con más de 10 años de experiencia en reparaciones residenciales y comerciales. Especializado en detección de fugas, instalación de sistemas hidráulicos y mantenimiento preventivo. Cuento con certificación del SENA y herramientas propias.",
  services: [
    { id: 1, name: "Reparación de tuberías", price: "$50.000/hora", description: "Reparación de fugas, roturas y reemplazo de tuberías de PVC, cobre y galvanizadas." },
    { id: 2, name: "Instalación de grifos", price: "$80.000", description: "Instalación y reemplazo de grifería para cocina, baño y lavadero." },
    { id: 3, name: "Destape de cañerías", price: "$60.000", description: "Destape profesional con equipo especializado. Sin productos químicos dañinos." },
    { id: 4, name: "Instalación de calentadores", price: "$150.000", description: "Instalación de calentadores de agua eléctricos y a gas con garantía." },
  ],
  reviewsList: [
    { id: 1, client: "Ana García", rating: 5, comment: "Excelente trabajo, muy puntual y profesional. Reparó la fuga en menos de una hora.", date: "2026-04-01", response: "¡Gracias Ana! Fue un placer atenderte. Cualquier cosa, estoy a la orden." },
    { id: 2, client: "Pedro López", rating: 4, comment: "Buen servicio, solucionó el problema rápido. El precio fue justo.", date: "2026-03-25", response: null },
    { id: 3, client: "María Torres", rating: 5, comment: "Lo recomiendo ampliamente. Muy buen precio y excelente calidad de trabajo.", date: "2026-03-20", response: "¡Muchas gracias María! Me alegra que hayas quedado satisfecha." },
    { id: 4, client: "Jorge Ramírez", rating: 5, comment: "Profesional y honesto. Llegó a tiempo y dejó todo limpio.", date: "2026-03-15", response: null },
    { id: 5, client: "Laura Díaz", rating: 4, comment: "Buen trabajo aunque tardó un poco más de lo esperado.", date: "2026-03-10", response: "Gracias Laura, lamento la demora. El problema fue más complejo de lo anticipado." },
  ],
  availability: [
    { day: "Lunes", hours: "8:00 AM - 6:00 PM" },
    { day: "Martes", hours: "8:00 AM - 6:00 PM" },
    { day: "Miércoles", hours: "8:00 AM - 6:00 PM" },
    { day: "Jueves", hours: "8:00 AM - 6:00 PM" },
    { day: "Viernes", hours: "8:00 AM - 5:00 PM" },
    { day: "Sábado", hours: "9:00 AM - 1:00 PM" },
    { day: "Domingo", hours: "No disponible" },
  ],
};

const ProviderDetail = () => {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { toast } = useToast();

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuoteForm(false);
    toast({ title: "Cotización solicitada", description: "El proveedor recibirá tu solicitud y te responderá en menos de 24 horas." });
  };

  const ratingDistribution = [
    { stars: 5, count: 98, percent: 77 },
    { stars: 4, count: 22, percent: 17 },
    { stars: 3, count: 5, percent: 4 },
    { stars: 2, count: 2, percent: 1.5 },
    { stars: 1, count: 1, percent: 0.5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/cliente" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Provider Header */}
        <div className="bg-card rounded-2xl border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="w-24 h-24 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{providerData.initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">{providerData.name}</h1>
                    {providerData.verified && (
                      <Badge className="bg-success/10 text-success border-success/20 gap-1">
                        <Shield className="w-3 h-3" />Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{providerData.title}</p>
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
                  <Star className="w-4 h-4 text-warning fill-warning" />{providerData.rating} ({providerData.reviews} reseñas)
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />{providerData.location}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />Responde en {providerData.responseTime}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />{providerData.completedJobs} trabajos
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{providerData.description}</p>
            </div>
          </div>
        </div>

        {/* Quote Form Modal */}
        {showQuoteForm && (
          <div className="bg-card rounded-2xl border p-6 mb-6 ring-2 ring-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-4">Solicitar Cotización</h3>
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Servicio requerido</Label>
                  <select className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                    {providerData.services.map(s => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                    <option>Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha deseada</Label>
                  <Input type="date" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Dirección del servicio</Label>
                <Input placeholder="Ej: Calle 5 #12-30, Barrio Centro" required />
              </div>
              <div className="space-y-2">
                <Label>Descripción del problema</Label>
                <Textarea placeholder="Describe detalladamente qué necesitas. Incluye fotos si es posible..." rows={4} required />
              </div>
              <div className="space-y-2">
                <Label>Teléfono de contacto</Label>
                <Input type="tel" placeholder="+57 300 000 0000" required />
              </div>
              <div className="flex gap-3">
                <Button type="submit">Enviar Cotización</Button>
                <Button type="button" variant="outline" onClick={() => setShowQuoteForm(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="servicios" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
            <TabsTrigger value="resenas">Reseñas ({providerData.reviews})</TabsTrigger>
            <TabsTrigger value="disponibilidad">Disponibilidad</TabsTrigger>
          </TabsList>

          <TabsContent value="servicios" className="space-y-4">
            {providerData.services.map(service => (
              <div key={service.id} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <span className="text-lg font-bold text-primary">{service.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                <Button size="sm" onClick={() => setShowQuoteForm(true)}>Solicitar este servicio</Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="resenas" className="space-y-6">
            {/* Rating summary */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-5xl font-bold text-foreground">{providerData.rating}</p>
                  <div className="flex gap-0.5 mt-2 justify-center sm:justify-start">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 text-warning fill-warning" />)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{providerData.reviews} reseñas</p>
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

            {/* Individual reviews */}
            {providerData.reviewsList.map(r => (
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
                    <p className="text-xs font-medium text-primary mb-1">Respuesta de {providerData.name}</p>
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
                {providerData.availability.map(slot => (
                  <div key={slot.day} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium text-foreground text-sm">{slot.day}</span>
                    <span className={`text-sm ${slot.hours === "No disponible" ? "text-destructive" : "text-muted-foreground"}`}>
                      {slot.hours}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Nota:</strong> Los horarios pueden variar según disponibilidad. 
                  Para confirmar una cita, solicita una cotización o envía un mensaje directo.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ChatPanel
        contactName={providerData.name}
        contactInitials={providerData.initials}
        contactRole="Plomero Profesional"
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
};

export default ProviderDetail;
