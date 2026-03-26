import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Search, UserCheck, CalendarCheck, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Busca el servicio",
    description: "Explora las categorías o usa el buscador para encontrar el profesional que necesitas cerca de ti.",
  },
  {
    icon: UserCheck,
    title: "Elige un proveedor",
    description: "Revisa perfiles, calificaciones y reseñas de otros clientes para tomar la mejor decisión.",
  },
  {
    icon: CalendarCheck,
    title: "Solicita y agenda",
    description: "Envía tu solicitud, recibe cotización y agenda el servicio en el horario que prefieras.",
  },
  {
    icon: Star,
    title: "Califica el servicio",
    description: "Una vez completado, comparte tu experiencia y ayuda a otros usuarios de la comunidad.",
  },
];

const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="como-funciona" className="py-24 lg:py-32">
      <div className="container mx-auto px-6" ref={ref}>
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            ¿Cómo Funciona?
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Contratar un profesional es simple, rápido y seguro
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`relative ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${250 + i * 100}ms` }}
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px border-t-2 border-dashed border-border" />
              )}

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent text-accent-foreground font-body text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
