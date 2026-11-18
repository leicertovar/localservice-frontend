import { useEffect, useMemo, useRef } from "react";
import { Camera, EyeOff, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storageUrl } from "@/lib/api";
import { MAX_FOTOS, type Foto } from "@/services/fotosService";

interface Props {
  label: string;
  nuevas: File[];
  onNuevasChange: (fotos: File[]) => void;
  existentes?: Foto[];
  onQuitarExistente?: (foto: Foto) => void;
  disabled?: boolean;
  ayuda?: string;
}

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

/** Elige hasta 3 fotos (JPG, PNG o WEBP de hasta 5 MB) con vista previa. */
const SelectorFotos = ({ label, nuevas, onNuevasChange, existentes = [], onQuitarExistente, disabled, ayuda }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const libres = MAX_FOTOS - existentes.length - nuevas.length;
  const previas = useMemo(() => nuevas.map(f => URL.createObjectURL(f)), [nuevas]);
  useEffect(() => () => previas.forEach(u => URL.revokeObjectURL(u)), [previas]);

  const alElegir = (e: React.ChangeEvent<HTMLInputElement>) => {
    const elegidas = Array.from(e.target.files ?? []);
    e.target.value = "";
    const validas = elegidas.filter(f => TIPOS.includes(f.type) && f.size <= MAX_MB * 1024 * 1024);
    if (validas.length < elegidas.length) {
      toast({ title: "Algunas fotos no se agregaron", description: `Usa fotos JPG, PNG o WEBP de hasta ${MAX_MB} MB.`, variant: "destructive" });
    }
    if (validas.length > libres) {
      toast({ title: `Máximo ${MAX_FOTOS} fotos`, description: `Puedes agregar ${libres} más.` });
    }
    onNuevasChange([...nuevas, ...validas.slice(0, Math.max(0, libres))]);
  };

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {existentes.map(f => (
          <div key={`e${f.id}`} className="relative aspect-square overflow-hidden rounded-lg border">
            <img src={storageUrl(f.ruta)} alt="Foto guardada" className="h-full w-full object-cover" />
            {f.esta_ocultada && (
              <span className="absolute bottom-1 left-1 rounded-full bg-destructive p-1 text-white" title="Oculta por el administrador">
                <EyeOff className="size-3.5" />
              </span>
            )}
            {onQuitarExistente && (
              <button type="button" onClick={() => onQuitarExistente(f)} disabled={disabled} aria-label="Quitar foto"
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ))}
        {previas.map((url, i) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-lg border">
            <img src={url} alt={`Foto nueva ${i + 1}`} className="h-full w-full object-cover" />
            <button type="button" onClick={() => onNuevasChange(nuevas.filter((_, j) => j !== i))} disabled={disabled} aria-label="Quitar foto"
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {libres > 0 && (
          <button type="button" onClick={() => input.current?.click()} disabled={disabled}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-60">
            <Camera className="size-5" />
            Agregar ({MAX_FOTOS - libres}/{MAX_FOTOS})
          </button>
        )}
      </div>
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={alElegir} />
    </div>
  );
};

export default SelectorFotos;
