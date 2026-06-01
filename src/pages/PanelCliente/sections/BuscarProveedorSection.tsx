import { Link } from "react-router-dom";
import { Search, MapPin, Star, MessageCircle, ChevronRight, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CATEGORIAS = ["Todas", "Plomería", "Electricidad", "Limpieza", "Pintura", "Jardinería", "Tecnología", "Otro"];

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  proveedores: any[];
  cargandoProveedores: boolean;
  filtersOpen: boolean;
  setFiltersOpen: (v: boolean) => void;
  filterLocation: string;
  setFilterLocation: (v: string) => void;
  filterAvailable: boolean;
  setFilterAvailable: (v: boolean) => void;
  filterMinRating: number;
  setFilterMinRating: (v: number) => void;
  onAbrirChat: (nombre: string, id: string) => void;
}

const BuscarProveedorSection = ({
  searchTerm, setSearchTerm,
  selectedCategory, setSelectedCategory,
  proveedores, cargandoProveedores,
  filtersOpen, setFiltersOpen,
  filterLocation, setFilterLocation,
  filterAvailable, setFilterAvailable,
  filterMinRating, setFilterMinRating,
  onAbrirChat,
}: Props) => {
  const proveedoresFiltrados = proveedores.filter(p => {
    const coincideBusqueda = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideCategoria = selectedCategory === "Todas" || p.category === selectedCategory;
    const coincideUbicacion = !filterLocation || p.location.toLowerCase().includes(filterLocation.toLowerCase());
    const coincideDisponibilidad = !filterAvailable || p.available;
    const coincideCalificacion = p.rating >= filterMinRating;
    return coincideBusqueda && coincideCategoria && coincideUbicacion && coincideDisponibilidad && coincideCalificacion;
  });

  const hayFiltrosActivos = filterLocation || filterAvailable || filterMinRating > 0;

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar servicio o proveedor..."
              className="pl-10 h-11 rounded-xl border-border/70 bg-white placeholder:text-muted-foreground/50"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className={`gap-2 h-11 rounded-xl border-border/70 font-medium ${hayFiltrosActivos ? 'border-primary text-primary bg-primary/5' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hayFiltrosActivos && <span className="w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </div>

        {filtersOpen && (
          <div className="bg-white border border-border/60 rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                Filtros avanzados
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground h-7 px-2"
                onClick={() => { setFilterLocation(""); setFilterAvailable(false); setFilterMinRating(0); }}
              >
                Limpiar filtros
              </Button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ubicación</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Ej: Buenaventura"
                    className="pl-8 h-9 text-sm rounded-lg border-border/70 bg-white"
                    value={filterLocation}
                    onChange={e => setFilterLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Calificación mínima</Label>
                <div className="flex gap-0.5 pt-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setFilterMinRating(filterMinRating === s ? 0 : s)} className="p-1 hover:scale-110 transition-transform">
                      <Star className={`w-5 h-5 ${s <= filterMinRating ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Disponibilidad</Label>
                <Button
                  variant={filterAvailable ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs h-9 rounded-lg"
                  onClick={() => setFilterAvailable(!filterAvailable)}
                >
                  {filterAvailable ? "✓ Solo disponibles" : "Ver todos"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chips de categoría */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIAS.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs h-8 rounded-full px-3.5 font-medium ${selectedCategory === cat ? 'shadow-sm' : 'border-border/60 bg-white'}`}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {cargandoProveedores ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Obteniendo proveedores en la zona...</p>
        </div>
      ) : proveedoresFiltrados.length === 0 ? (
        <div className="text-center py-16 border border-border/60 rounded-2xl bg-white">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-foreground font-semibold mb-1">No se encontraron proveedores</p>
          <p className="text-sm text-muted-foreground">Intenta con otros filtros o categorías</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proveedoresFiltrados.map(provider => (
            <div key={provider.id} className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-md hover:border-primary/20 transition-all duration-200">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-12 h-12 ring-2 ring-background shadow-sm">
                  {provider.foto_perfil && <AvatarImage src={provider.foto_perfil} alt={provider.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {provider.name ? provider.name.split(" ").map((n: string) => n[0]).join("") : "PV"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link to={`/proveedor/${provider.id}`} className="font-semibold text-foreground hover:text-primary transition-colors block truncate">
                    {provider.name}
                  </Link>
                  <p className="text-sm text-muted-foreground truncate">{provider.category}</p>
                </div>
                <Badge
                  variant={provider.available ? "default" : "secondary"}
                  className={`text-xs shrink-0 ${provider.available ? 'bg-success/10 text-success border border-success/20' : ''}`}
                >
                  {provider.available ? "Disponible" : "Ocupado"}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  <span className="font-medium text-foreground">{provider.rating}</span>
                  <span>({provider.reviews})</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {provider.location}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <span className="font-bold text-foreground">{provider.price}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg border-border/60"
                    onClick={() => onAbrirChat(provider.name, provider.id)}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" className="h-8 rounded-lg gap-1 text-xs font-semibold" asChild>
                    <Link to={`/proveedor/${provider.id}`}>Ver perfil <ChevronRight className="w-3 h-3" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuscarProveedorSection;
