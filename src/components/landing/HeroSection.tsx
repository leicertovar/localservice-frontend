import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Star, Users, Shield, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import imagen1 from "@/assets/hero-image.webp";
import imagen2 from "@/assets/carpintero.webp";
import imagen3 from "@/assets/electricista.webp";
import imagen4 from "@/assets/plomero.webp";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const images = [imagen1, imagen2, imagen3, imagen4];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentIndex(i => (i + 1) % images.length),
      4500
    );
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section className="relative pt-16 overflow-hidden">
      {/* Subtle backgrounds — no blur-3xl en móvil */}
      <div className="absolute inset-0 -z-10 bg-dot-grid opacity-40 dark:opacity-20" />
      <div className="hidden sm:block absolute -top-32 -left-48 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl -z-10" />
      <div className="hidden sm:block absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-blue-400/6 blur-3xl -z-10" />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* ── Left: copy ── */}
          <div className="flex flex-col gap-5 sm:gap-7">

            {/* Badge */}
            <div className="opacity-0 animate-fade-up" style={{ animationDelay: "60ms" }}>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                               bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                <MapPin className="size-3.5" />
                Servicios cerca de ti
              </span>
            </div>

            {/* Heading */}
            <h1
              className="text-3xl sm:text-[2.75rem] lg:text-[3.25rem] font-bold text-foreground leading-[1.1] tracking-tight opacity-0 animate-fade-up"
              style={{ animationDelay: "120ms" }}
            >
              Conecta con profesionales{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">de confianza</span>
                <span className="absolute inset-x-0 bottom-0.5 h-2.5 bg-primary/10 rounded -z-0" />
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed opacity-0 animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              Plomería, electricidad, carpintería, barbería, limpieza y mucho más.
              Profesionales verificados, cotizaciones rápidas, calidad garantizada.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "280ms" }}>
              <Link to="/registro">
                <Button variant="hero" size="lg" className="gap-2 rounded-xl text-sm sm:text-base">
                  <Search className="size-4" />
                  Buscar Servicios
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="heroOutline" size="lg" className="rounded-xl text-sm sm:text-base">
                  Ofrecer Servicios
                </Button>
              </Link>
            </div>

            {/* Stats — grid en móvil, flex con separadores en sm+ */}
            <div className="opacity-0 animate-fade-up" style={{ animationDelay: "360ms" }}>
              {/* Mobile: grid compacto */}
              <div className="grid grid-cols-3 gap-3 sm:hidden">
                {[
                  { icon: Users,  value: "2,847", label: "Proveedores" },
                  { icon: Star,   value: "4.8★",  label: "Calificación" },
                  { icon: Shield, value: "100%",  label: "Verificados"  },
                ].map(stat => (
                  <div key={stat.label} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-muted/40 border border-border/40">
                    <stat.icon className="size-4 text-primary" />
                    <p className="font-bold text-foreground text-sm leading-tight tabular-nums">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* sm+: fila con separadores */}
              <div className="hidden sm:flex items-center gap-0 pt-1">
                {[
                  { icon: Users,  value: "2,847", label: "Proveedores activos" },
                  { icon: Star,   value: "4.8",   label: "Calificación media"  },
                  { icon: Shield, value: "100%",  label: "Verificados"         },
                ].map((stat, i) => (
                  <div key={stat.label} className="flex items-center">
                    {i > 0 && <div className="w-px h-9 bg-border/60 mx-4 md:mx-5 shrink-0" />}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <stat.icon className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm leading-tight tabular-nums">{stat.value}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: carousel ── */}
          <div className="relative opacity-0 animate-slide-right" style={{ animationDelay: "240ms" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-primary/10 ring-1 ring-border/50">
              <img
                src={images[currentIndex]}
                alt="Profesional local"
                className="w-full h-auto object-cover aspect-[4/3] transition-opacity duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5" />

              {/* Arrows */}
              <button
                onClick={() => setCurrentIndex(i => (i - 1 + images.length) % images.length)}
                aria-label="Imagen anterior"
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90
                           hover:bg-white dark:hover:bg-slate-700 rounded-full p-1.5 sm:p-2 shadow-lg
                           transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="size-4 sm:size-5 text-foreground" />
              </button>
              <button
                onClick={() => setCurrentIndex(i => (i + 1) % images.length)}
                aria-label="Imagen siguiente"
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90
                           hover:bg-white dark:hover:bg-slate-700 rounded-full p-1.5 sm:p-2 shadow-lg
                           transition-all duration-200 hover:scale-105"
              >
                <ChevronRight className="size-4 sm:size-5 text-foreground" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Imagen ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "bg-white w-5 h-2" : "bg-white/50 hover:bg-white/75 w-2 h-2"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Floating cards — solo sm+ para no desbordarse */}
            <div
              className="absolute -bottom-4 -left-3 sm:-bottom-5 sm:-left-5 bg-card rounded-2xl p-3 sm:p-4 shadow-xl border border-border/60 hidden sm:block"
              style={{ animationDelay: "600ms" }}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="size-4 sm:size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-foreground">María López</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-2.5 sm:size-3 fill-warning text-warning" />
                    ))}
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground ml-1">hace 2h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-card rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-lg border border-border/60 hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-foreground whitespace-nowrap">340 disponibles ahora</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
