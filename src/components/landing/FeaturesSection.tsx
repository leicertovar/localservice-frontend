import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Shield, MessageCircle, Bell, MapPin, BarChart3, Star } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Proveedores Verificados",
    description: "Todos los profesionales pasan por verificación con documentos reales para garantizar calidad.",
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    iconBorder: "border-blue-100 dark:border-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    hoverBg: "group-hover:bg-blue-600",
  },
  {
    icon: MessageCircle,
    title: "Chat en Tiempo Real",
    description: "Comunícate directamente con tu proveedor para coordinar detalles al instante.",
    iconBg: "bg-violet-50 dark:bg-violet-950/40",
    iconBorder: "border-violet-100 dark:border-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    hoverBg: "group-hover:bg-violet-600",
  },
  {
    icon: Bell,
    title: "Notificaciones Instantáneas",
    description: "Recibe actualizaciones en tiempo real sobre el estado de tus solicitudes.",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconBorder: "border-amber-100 dark:border-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    hoverBg: "group-hover:bg-amber-600",
  },
  {
    icon: MapPin,
    title: "Búsqueda Geolocalizada",
    description: "Encuentra profesionales cercanos a tu ubicación con nuestro motor de búsqueda inteligente.",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconBorder: "border-emerald-100 dark:border-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    hoverBg: "group-hover:bg-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Panel de Control",
    description: "Gestiona solicitudes, historial y calificaciones desde un panel intuitivo centralizado.",
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconBorder: "border-rose-100 dark:border-rose-900/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    hoverBg: "group-hover:bg-rose-600",
  },
  {
    icon: Star,
    title: "Sistema de Reseñas",
    description: "Calificaciones auténticas de clientes reales para que siempre elijas al mejor profesional.",
    iconBg: "bg-sky-50 dark:bg-sky-950/40",
    iconBorder: "border-sky-100 dark:border-sky-900/50",
    iconColor: "text-sky-600 dark:text-sky-400",
    hoverBg: "group-hover:bg-sky-600",
  },
];

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="proveedores" className="py-16 sm:py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6" ref={ref}>

        <div className={`text-center max-w-2xl mx-auto mb-10 sm:mb-14 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <span className="section-label mb-3 block">
            <span className="w-4 h-px bg-primary inline-block" />
            Características
            <span className="w-4 h-px bg-primary inline-block" />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Herramientas para que clientes y proveedores trabajen sin fricciones
          </p>
        </div>

        {/* Grid — animación única como bloque */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 ${
            isVisible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "100ms" }}
        >
          {features.map(feature => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-5 sm:p-6
                border border-border/60
                hover:shadow-lg hover:shadow-primary/6 hover:-translate-y-0.5 hover:border-primary/20
                transition-all duration-200 ease-in-out"
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-4 sm:mb-5
                              border ${feature.iconBg} ${feature.iconBorder}
                              ${feature.hoverBg} group-hover:border-transparent
                              transition-all duration-200`}>
                <feature.icon className={`size-4 sm:size-5 ${feature.iconColor} group-hover:text-white transition-colors duration-200`} />
              </div>
              <h3 className="font-bold text-foreground mb-2 text-sm sm:text-[15px] tracking-tight">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
