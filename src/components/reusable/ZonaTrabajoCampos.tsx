import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const MUNICIPIOS = ["Buenaventura, Valle del Cauca"];
export const BARRIOS_SUGERIDOS = ["Centro", "El Cristal", "Pueblo Nuevo", "Bellavista"];
export const RADIO_MAX_KM = 15;

export interface ZonaTrabajo {
  ciudad: string;
  radio: number;
  barrios: string[];
}

export const zonaInicial = (ciudad?: string | null, radio?: number | null, barrios?: string[] | null): ZonaTrabajo => ({
  ciudad: ciudad || MUNICIPIOS[0],
  radio: radio || 8,
  barrios: barrios ?? [],
});

interface Props {
  valor: ZonaTrabajo;
  onChange: (zona: ZonaTrabajo) => void;
  error?: string;
}

/**
 * Municipio, radio de desplazamiento y barrios donde atiende el proveedor
 * (los mismos campos del registro de la app móvil). Los clientes los ven en su perfil.
 */
const ZonaTrabajoCampos = ({ valor, onChange, error }: Props) => {
  const [opciones, setOpciones] = useState<string[]>(() => Array.from(new Set([...BARRIOS_SUGERIDOS, ...valor.barrios])));
  const [nuevo, setNuevo] = useState("");
  const municipios = MUNICIPIOS.includes(valor.ciudad) ? MUNICIPIOS : [valor.ciudad, ...MUNICIPIOS];

  const alternar = (barrio: string) =>
    onChange({
      ...valor,
      barrios: valor.barrios.includes(barrio) ? valor.barrios.filter(b => b !== barrio) : [...valor.barrios, barrio],
    });

  const agregar = () => {
    const nombre = nuevo.trim().replace(/\s+/g, " ");
    if (nombre.length < 2) return;
    const existente = opciones.find(o => o.toLowerCase() === nombre.toLowerCase()) ?? nombre;
    setOpciones(prev => (prev.includes(existente) ? prev : [...prev, existente]));
    if (!valor.barrios.includes(existente)) onChange({ ...valor, barrios: [...valor.barrios, existente] });
    setNuevo("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="zona-municipio" className="text-sm font-semibold">Municipio</Label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <select
            id="zona-municipio"
            value={valor.ciudad}
            onChange={e => onChange({ ...valor, ciudad: e.target.value })}
            className="h-11 w-full rounded-xl border border-border/70 bg-card pl-9 pr-3 text-sm focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            {municipios.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="zona-radio" className="text-sm font-semibold">Hasta dónde te desplazas</Label>
          <span className="text-sm font-bold text-primary">{valor.radio} km</span>
        </div>
        <input
          id="zona-radio"
          type="range"
          min={1}
          max={RADIO_MAX_KM}
          step={1}
          value={valor.radio}
          onChange={e => onChange({ ...valor, radio: Number(e.target.value) })}
          className="w-full accent-[hsl(var(--primary))]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Barrios donde atiendes</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Barrios donde atiendes">
          {opciones.map(barrio => {
            const activo = valor.barrios.includes(barrio);
            return (
              <button
                key={barrio}
                type="button"
                aria-pressed={activo}
                onClick={() => alternar(barrio)}
                className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
                  activo ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {barrio}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            value={nuevo}
            maxLength={100}
            placeholder="Agregar otro barrio"
            onChange={e => setNuevo(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                agregar();
              }
            }}
            className="h-10 rounded-xl"
          />
          <Button type="button" variant="outline" onClick={agregar} className="h-10 gap-1 rounded-xl">
            <Plus className="size-4" />Agregar
          </Button>
        </div>
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
      </div>
    </div>
  );
};

export default ZonaTrabajoCampos;
