import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const CTASection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6" ref={ref}>
        <div
          className={`relative rounded-2xl sm:rounded-3xl overflow-hidden px-6 py-12 sm:p-12 lg:p-20 text-center bg-hero
                      shadow-2xl shadow-primary/20 ${isVisible ? "animate-fade-up" : "opacity-0"}`}
          style={{ animationDelay: "60ms" }}
        >
          <div className="absolute inset-0 bg-dot-grid opacity-10" />
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/6 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                            bg-white/15 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest mb-5 sm:mb-6">
              <Zap className="size-3.5" />
              Únete hoy mismo
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-[1.1] tracking-tight">
              ¿Listo para conectar<br className="hidden sm:block" />
              con tu comunidad?
            </h2>
            <p className="text-white/70 text-sm sm:text-lg mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed">
              Miles de usuarios y proveedores ya confían en LocalService.
              Regístrate gratis y empieza hoy.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <a href="/registro">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 rounded-xl bg-white text-white hover:bg-white/92 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  Comenzar Ahora
                  <ArrowRight className="size-4" />
                </Button>
              </a>
              <a href="/registro">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-xl border-2 border-white/25 text-white bg-white/8 hover:bg-white/15 font-bold hover:scale-[1.02] transition-all duration-200"
                >
                  Ofrecer mis Servicios
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
