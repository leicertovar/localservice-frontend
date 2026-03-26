import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Shield, MessageCircle, CreditCard, Bell, MapPin, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Proveedores Verificados",
    description: "Todos los profesionales pasan por un proceso de verificación para garantizar calidad y confianza.",
  },
  {
    icon: MessageCircle,
    title: "Chat en Tiempo Real",
    description: "Comunícate directamente con tu proveedor para coordinar detalles del servicio.",
  },
  {
    icon: CreditCard,
    title: "Pagos Seguros",
    description: "Pasarela de pagos integrada con múltiples opciones y confirmación inmediata.",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description: "Recibe actualizaciones en tiempo real sobre el estado de tus solicitudes.",
  },
  {
    icon: MapPin,
    title: "Geolocalización",
    description: "Encuentra profesionales cercanos a tu ubicación con nuestro motor de búsqueda.",
  },
  {
    icon: BarChart3,
    title: "Panel de Control",
    description: "Gestiona solicitudes, historial y calificaciones desde un solo lugar.",
  },
];

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="proveedores" className="py-24 lg:py-32 bg-secondary/40">
      <div className="container mx-auto px-6" ref={ref}>
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Herramientas diseñadas para clientes y proveedores
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`group bg-card rounded-xl p-6 border border-border/50 
                hover:shadow-lg hover:shadow-primary/5 transition-all duration-300
                ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${200 + i * 90}ms` }}
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 
                group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
