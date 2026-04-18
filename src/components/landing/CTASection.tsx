import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-6" ref={ref}>
        <div
          className={`relative rounded-3xl bg-primary overflow-hidden p-12 lg:p-20 text-center ${isVisible ? "animate-scale-in" : "opacity-0"}`}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              ¿Listo para conectar con tu comunidad?
            </h2>
            <p className="text-primary-foreground/80 font-body text-lg mb-8 max-w-lg mx-auto">
              Únete a miles de usuarios y proveedores que ya confían en LocalService
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/registro">
              <Button variant="hero" size="lg" className="gap-2 bg-accent hover:bg-accent/90">
                Comenzar Ahora
                <ArrowRight className="h-4 w-4" />
              </Button>
              </a>

              <a href="/registro">
              <Button
                variant="heroOutline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Soy Proveedor
              </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
