import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  Wrench, Zap, Leaf, Sparkles, Paintbrush, Hammer,
  Monitor, Scissors, Hand, Truck, Dog, KeyRound, Sofa, ChevronRight,
} from "lucide-react";

const categories = [
  { icon: Wrench,     name: "Plomería",      bg: "bg-blue-50   dark:bg-blue-950/40",    text: "text-blue-600   dark:text-blue-400",    border: "border-blue-100 dark:border-blue-900/50"    },
  { icon: Zap,        name: "Electricidad",  bg: "bg-amber-50  dark:bg-amber-950/40",   text: "text-amber-600  dark:text-amber-400",   border: "border-amber-100 dark:border-amber-900/50"   },
  { icon: Leaf,       name: "Jardinería",    bg: "bg-emerald-50 dark:bg-emerald-950/40",text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-900/50"},
  { icon: Sparkles,   name: "Limpieza",      bg: "bg-sky-50    dark:bg-sky-950/40",     text: "text-sky-600    dark:text-sky-400",     border: "border-sky-100 dark:border-sky-900/50"     },
  { icon: Paintbrush, name: "Pintura",       bg: "bg-rose-50   dark:bg-rose-950/40",    text: "text-rose-600   dark:text-rose-400",    border: "border-rose-100 dark:border-rose-900/50"    },
  { icon: Monitor,    name: "Tecnología",    bg: "bg-violet-50 dark:bg-violet-950/40",  text: "text-violet-600 dark:text-violet-400",  border: "border-violet-100 dark:border-violet-900/50"  },
  { icon: Hammer,     name: "Reparaciones",  bg: "bg-orange-50 dark:bg-orange-950/40",  text: "text-orange-600 dark:text-orange-400",  border: "border-orange-100 dark:border-orange-900/50"  },
  { icon: Scissors,   name: "Barbería",      bg: "bg-pink-50   dark:bg-pink-950/40",    text: "text-pink-600   dark:text-pink-400",    border: "border-pink-100 dark:border-pink-900/50"    },
  { icon: Hand,       name: "Manicure",      bg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",text: "text-fuchsia-600 dark:text-fuchsia-400", border: "border-fuchsia-100 dark:border-fuchsia-900/50"},
  { icon: Sofa,       name: "Carpintería",   bg: "bg-yellow-50 dark:bg-yellow-950/40",  text: "text-yellow-700 dark:text-yellow-400",  border: "border-yellow-100 dark:border-yellow-900/50"  },
  { icon: Truck,      name: "Mudanzas",      bg: "bg-teal-50   dark:bg-teal-950/40",    text: "text-teal-600   dark:text-teal-400",    border: "border-teal-100 dark:border-teal-900/50"    },
  { icon: KeyRound,   name: "Cerrajería",    bg: "bg-slate-50  dark:bg-slate-800/60",   text: "text-slate-600  dark:text-slate-400",   border: "border-slate-200 dark:border-slate-700/50"   },
  { icon: Dog,        name: "Mascotas",      bg: "bg-lime-50   dark:bg-lime-950/40",    text: "text-lime-700   dark:text-lime-400",    border: "border-lime-100 dark:border-lime-900/50"    },
];

const CategoriesSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="servicios" className="py-16 sm:py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6" ref={ref}>

        {/* Header — una sola animación */}
        <div className={`text-center max-w-2xl mx-auto mb-10 sm:mb-14 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <span className="section-label mb-3 block">
            <span className="w-4 h-px bg-primary inline-block" />
            Categorías
            <span className="w-4 h-px bg-primary inline-block" />
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Categorías de Servicios
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Encuentra el profesional que necesitas entre nuestras categorías más populares
          </p>
        </div>

        {/* Grid — el grid completo anima como bloque, sin stagger individual */}
        <div
          className={`grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3.5 ${
            isVisible ? "animate-fade-up" : "opacity-0"
          }`}
          style={{ animationDelay: "120ms" }}
        >
          {categories.map(cat => (
            <div
              key={cat.name}
              className={`group cursor-pointer rounded-xl sm:rounded-2xl bg-card p-3 sm:p-5 text-center
                border ${cat.border}
                hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30
                transition-all duration-200 ease-in-out`}
            >
              <div className={`inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl
                              ${cat.bg} border ${cat.border} mb-2 sm:mb-3
                              group-hover:scale-110 transition-transform duration-200`}>
                <cat.icon className={`size-4 sm:size-5 ${cat.text}`} />
              </div>
              <h3 className="font-bold text-[11px] sm:text-xs text-foreground mb-0.5 leading-tight">{cat.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
