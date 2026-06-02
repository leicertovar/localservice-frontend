import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Search, Star, Users, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import imagen1 from "@/assets/hero-image.webp";
import imagen2 from "@/assets/carpintero.webp";
import imagen3 from "@/assets/electricista.webp";
import imagen4 from "@/assets/plomero.webp";

const HeroSection = () => {
  const images = [imagen1, imagen2, imagen3, imagen4]; // arreglo de imágenes para el carrusel
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <section className="relative pt-16 overflow-hidden">
      <div className="container mx-auto px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="flex flex-col gap-6">
            <div
              className="opacity-0 animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-body text-sm font-medium">
                <MapPinIcon />
                Servicios cerca de ti
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight opacity-0 animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              Conecta con profesionales{" "}
              <span className="text-primary">de confianza</span>
            </h1>

            <p
              className="text-lg text-muted-foreground max-w-lg font-body leading-relaxed opacity-0 animate-fade-up"
              style={{ animationDelay: "350ms" }}
            >
              Encuentra y contrata proveedores locales para
              plomería, electricidad, limpieza, jardinería y mucho más.
              Rápido, seguro y con calificaciones reales.
            </p>

            <div
              className="flex flex-wrap gap-3 opacity-0 animate-fade-up"
              style={{ animationDelay: "500ms" }}
            >
              <Button variant="hero" size="lg" className="gap-2">
                <Search className="h-4 w-4" />
                Buscar Servicios
              </Button>
              <Button variant="heroOutline" size="lg">
                Ofrecer Servicios
              </Button>
            </div>

            <div
              className="flex flex-wrap gap-6 pt-4 opacity-0 animate-fade-up"
              style={{ animationDelay: "650ms" }}
            >
              <Stat icon={<Users className="h-4 w-4" />} value="2,847" label="Proveedores" />
              <Stat icon={<Star className="h-4 w-4" />} value="4.8" label="Calificación" />
              <Stat icon={<Shield className="h-4 w-4" />} value="100%" label="Verificados" />
            </div>
          </div>

          {/* Image */}
          <div
            className="relative opacity-0 animate-slide-right"
            style={{ animationDelay: "400ms" }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              <img
                src={images[currentIndex]}
                alt="Profesional local saludando a un cliente en la puerta de su hogar"
                className="w-full h-auto object-cover aspect-[4/3] transition-opacity duration-500 ease-in-out"
                loading="eager"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5" />

              {/* Navigation buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-foreground rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 shadow-lg border border-border/60 animate-scale-in" style={{ animationDelay: "900ms" }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-foreground">María López</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">hace 2h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Stat = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className="text-primary">{icon}</div>
    <div>
      <p className="font-body font-bold text-foreground tabular-nums">{value}</p>
      <p className="font-body text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default HeroSection;
