import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Wrench, Zap, Leaf, Sparkles, Paintbrush, Hammer } from "lucide-react";

const categories = [
  { icon: Wrench, name: "Plomería", count: 342, color: "bg-blue-50 text-blue-600" },
  { icon: Zap, name: "Electricidad", count: 287, color: "bg-amber-50 text-amber-600" },
  { icon: Leaf, name: "Jardinería", count: 198, color: "bg-emerald-50 text-emerald-600" },
  { icon: Sparkles, name: "Limpieza", count: 456, color: "bg-sky-50 text-sky-600" },
  { icon: Paintbrush, name: "Pintura", count: 163, color: "bg-rose-50 text-rose-600" },
  { icon: Hammer, name: "Reparaciones", count: 391, color: "bg-orange-50 text-orange-600" },
];

const CategoriesSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="servicios" className="py-24 lg:py-32 bg-secondary/40">
      <div className="container mx-auto px-6" ref={ref}>
        <div className={`text-center max-w-2xl mx-auto mb-16 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Categorías de Servicios
          </h2>
          <p className="text-muted-foreground font-body text-lg">
            Encuentra el profesional que necesitas entre nuestras categorías más populares
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <div
              key={cat.name}
              className={`group cursor-pointer rounded-xl bg-card p-6 text-center border border-border/50 
                hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300
                ${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${cat.color} mb-4 
                group-hover:scale-110 transition-transform duration-300`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <h3 className="font-body font-semibold text-sm text-foreground mb-1">{cat.name}</h3>
              <p className="font-body text-xs text-muted-foreground tabular-nums">{cat.count} profesionales</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
