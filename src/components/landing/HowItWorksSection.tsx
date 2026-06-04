import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Search, UserCheck, CalendarCheck, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Busca el servicio",
    description: "Explora categorías o usa el buscador para encontrar el profesional que necesitas cerca de ti.",
    accent: "from-blue-500/15 to-blue-600/5",
    iconBg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Elige un proveedor",
    description: "Revisa perfiles, calificaciones y reseñas de otros clientes para tomar la mejor decisión.",
    accent: "from-violet-500/15 to-violet-600/5",
    iconBg: "bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: CalendarCheck,
    step: "03",
    title: "Solicita y agenda",
    description: "Envía tu solicitud, recibe cotización y agenda el servicio en el horario que prefieras.",
    accent: "from-emerald-500/15 to-emerald-600/5",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Star,
    step: "04",
    title: "Califica el servicio",
    description: "Una vez completado, comparte tu experiencia y ayuda a otros usuarios de la comunidad.",
    accent: "from-amber-500/15 to-amber-600/5",
    iconBg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="como-funciona" className="py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6" ref={ref}>

        <div className={`text-center max-w-2xl mx-auto mb-10 sm:mb-14 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <span className="section-label mb-3 block">
            <span className="w-4 h-px bg-primary inline-block" />
            Proceso
            <span className="w-4 h-px bg-primary inline-block" />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">¿Cómo Funciona?</h2>
          <p className="text-muted-foreground text-base sm:text-lg">Contratar un profesional es simple, rápido y seguro</p>
        </div>

        {/* Cards — animación como grupo, no individualmente */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ${
            isVisible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "100ms" }}
        >
          {steps.map((step, i) => (
            <div key={step.title} className="relative group">
              {/* Connector (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+44px)] w-[calc(100%-88px)] h-px border-t-2 border-dashed border-border/50 z-0" />
              )}

              <div className="relative bg-card rounded-2xl border border-border/60 p-5 sm:p-6 overflow-hidden
                              hover:shadow-lg hover:shadow-primary/6 hover:-translate-y-0.5 hover:border-primary/20
                              transition-all duration-200 ease-in-out">
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-250`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4 sm:mb-5">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${step.iconBg}
                                    group-hover:scale-105 transition-transform duration-200`}>
                      <step.icon className={`size-5 ${step.iconColor}`} />
                    </div>
                    <span className="text-3xl sm:text-4xl font-black text-border/50 leading-none tabular-nums select-none">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
