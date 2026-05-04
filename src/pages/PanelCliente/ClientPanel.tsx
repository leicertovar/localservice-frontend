import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Star, Clock, MessageCircle, History, User, LogOut, Bell, Filter, ChevronRight, FileText, Download, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationsPanel from "@/components/NotificationsPanel";
import ChatPanel from "@/components/ChatPanel";
import { fetchCurrentUser, getUserProfile, UserProfile } from "@/services/authService";

const mockProviders = [
  { id: 1, name: "Carlos Mendoza", category: "Plomería", rating: 4.9, reviews: 128, price: "$50.000/hora", location: "Buenaventura", available: true },
];

const mockRequests = [
  { id: 1, service: "Reparación de tubería", provider: "Carlos Mendoza", status: "En progreso", date: "2026-04-05", statusColor: "bg-info/10 text-info", quote: "$85.000", quoteStatus: "Aceptada" },
  { id: 2, service: "Instalación eléctrica", provider: "Jorge Ramírez", status: "Cotización recibida", date: "2026-04-08", statusColor: "bg-warning/10 text-warning", quote: "$250.000", quoteStatus: "Pendiente" },
];

const mockHistory = [
  { id: 2, service: "Reparación eléctrica", provider: "Jorge Ramírez", date: "2026-03-15", total: "$180.000", rating: 4, invoiceId: "INV-2026-0038" },
];

const categories = ["Todas", "Plomería", "Electricidad", "Limpieza", "Pintura", "Jardinería", "Tecnología"];

const ClientPanel = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
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

  useEffect(() => {
    const loadProfile = async () => {
      const storedProfile = getUserProfile()
      if (storedProfile) {
        setProfileData(storedProfile)
        setEditProfile(storedProfile)
        return
      }

      try {
        const currentUser = await fetchCurrentUser()
        setProfileData(currentUser)
        setEditProfile(currentUser)
      } catch (error) {
        console.error("Error cargando perfil del usuario:", error)
      }
    }

    loadProfile()
  }, [])

  // Read search params from landing page
  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("categoria");
    if (q) setSearchTerm(q);
    if (cat && categories.includes(cat)) setSelectedCategory(cat);
  }, [searchParams]);

  const filteredProviders = mockProviders.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "Todas" || p.category === selectedCategory;
    const matchLocation = !filterLocation || p.location.toLowerCase().includes(filterLocation.toLowerCase());
    const matchAvailable = !filterAvailable || p.available;
    const matchRating = p.rating >= filterMinRating;
    return matchSearch && matchCategory && matchLocation && matchAvailable && matchRating;
  });

  const openChat = (name: string) => {
    const initials = name.split(" ").map(n => n[0]).join("");
    setChatContact({ name, initials, role: "Proveedor de servicios" });
    setChatOpen(true);
  };

  const handleAcceptQuote = (id: number) => {
    toast({ title: "Cotización aceptada", description: `Has aceptado la cotización de la solicitud #${id}. El proveedor será notificado.` });
  };

  const handleRejectQuote = (id: number) => {
    toast({ title: "Cotización rechazada", description: `La cotización #${id} ha sido rechazada.`, variant: "destructive" });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({ title: "Descargando factura", description: `Factura ${invoiceId} descargándose...` });
  };

  const handleSaveProfile = () => {
    setProfileData(editProfile);
    setEditProfileOpen(false);
    toast({ title: "Perfil actualizado", description: "Tus datos han sido guardados correctamente." });
  };

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) return;
    setReviewDialogOpen(false);
    setReviewComment("");
    setReviewRating(5);
    toast({ title: "Reseña publicada", description: `Tu calificación de ${reviewRating} estrellas para "${reviewTarget.service}" ha sido publicada.` });
  };

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
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">3</span>
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">JU</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><LogOut className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">¡Hola, {profileData.name.split(" ")[0]}! 👋</h1>
          <p className="text-muted-foreground">¿Qué servicio necesitas hoy?</p>
        </div>

        <Tabs defaultValue="buscar" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="buscar" className="gap-2"><Search className="w-4 h-4" />Buscar</TabsTrigger>
            <TabsTrigger value="solicitudes" className="gap-2"><Clock className="w-4 h-4" />Solicitudes</TabsTrigger>
            <TabsTrigger value="historial" className="gap-2"><History className="w-4 h-4" />Historial</TabsTrigger>
            <TabsTrigger value="perfil" className="gap-2"><User className="w-4 h-4" />Mi Perfil</TabsTrigger>
          </TabsList>

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

              {/* Filters Panel */}
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
                {categories.map(cat => (
                  <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="text-xs">
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProviders.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-medium">No se encontraron proveedores</p>
                  <p className="text-sm text-muted-foreground">Intenta con otros filtros o categorías</p>
                </div>
              ) : filteredProviders.map(provider => (
                <div key={provider.id} className="bg-card rounded-xl border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{provider.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
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
                      <Button variant="outline" size="sm" onClick={() => openChat(provider.name)}><MessageCircle className="w-4 h-4" /></Button>
                      <Button size="sm" asChild><Link to={`/proveedor/${provider.id}`}>Ver perfil<ChevronRight className="w-4 h-4 ml-1" /></Link></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="solicitudes" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Mis Solicitudes y Cotizaciones</h2>
            {mockRequests.map(req => (
              <div key={req.id} className="bg-card rounded-xl border p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{req.service}</h3>
                      <Badge className={req.statusColor + " text-xs"}>{req.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Proveedor: {req.provider}</p>
                    <p className="text-xs text-muted-foreground mt-1">{req.date}</p>
                    {req.quote && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">Cotización</p>
                            <p className="text-lg font-bold text-foreground">{req.quote}</p>
                          </div>
                          <Badge variant={req.quoteStatus === "Aceptada" ? "default" : "secondary"} className="text-xs">{req.quoteStatus}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {req.quoteStatus === "Pendiente" && (
                      <>
                        <Button size="sm" onClick={() => handleAcceptQuote(req.id)}>Aceptar cotización</Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleRejectQuote(req.id)}>Rechazar</Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openChat(req.provider)}>
                      <MessageCircle className="w-4 h-4 mr-1" />Chat
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

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
                    <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleDownloadInvoice(item.invoiceId)}>
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

          <TabsContent value="perfil" className="max-w-lg space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Mi Perfil</h2>
            <div className="bg-card rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">{profileData.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{profileData.name}</h3>
                  <p className="text-sm text-muted-foreground">{profileData.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">Teléfono</label><p className="text-sm font-medium text-foreground">{profileData.phone}</p></div>
                <div><label className="text-xs text-muted-foreground">Ciudad</label><p className="text-sm font-medium text-foreground">{profileData.city}</p></div>
                <div><label className="text-xs text-muted-foreground">Servicios solicitados</label><p className="text-sm font-medium text-foreground">12</p></div>
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
              <Button onClick={handleSaveProfile} className="flex-1">Guardar cambios</Button>
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
              <Button onClick={handleSubmitReview} className="flex-1" disabled={!reviewComment.trim()}>Publicar reseña</Button>
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
