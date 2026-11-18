import { useRef, useState } from "react";
import { Camera, EyeOff, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { storageUrl } from "@/lib/api";
import { mensajeError } from "@/lib/solicitudes";
import { eliminarFotoServicio, MAX_FOTOS, subirFotosServicio, type Foto } from "@/services/fotosService";

interface Props {
  servicioId: number;
  fotos: Foto[];
  onCambio: () => void;
}

/** Fotos de un servicio en el panel del proveedor: se suben y se quitan al instante (máximo 3). */
const FotosServicio = ({ servicioId, fotos, onCambio }: Props) => {
  const input = useRef<HTMLInputElement>(null);
  const [ocupado, setOcupado] = useState(false);
  const { toast } = useToast();
  const libres = MAX_FOTOS - fotos.length;

  const subir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const elegidas = Array.from(e.target.files ?? []).slice(0, libres);
    e.target.value = "";
    if (!elegidas.length) return;
    setOcupado(true);
    try {
      await subirFotosServicio(servicioId, elegidas);
      toast({ title: "Fotos agregadas", description: "Los clientes las verán en tu perfil." });
      onCambio();
    } catch (err) {
      toast({ title: "No se pudieron subir las fotos", description: mensajeError(err, "Usa fotos JPG, PNG o WEBP de hasta 5 MB."), variant: "destructive" });
    } finally {
      setOcupado(false);
    }
  };

  const quitar = async (foto: Foto) => {
    if (!confirm("¿Quitar esta foto del servicio?")) return;
    setOcupado(true);
    try {
      await eliminarFotoServicio(servicioId, foto.id);
      onCambio();
    } catch (err) {
      toast({ title: "No se pudo quitar la foto", description: mensajeError(err, "Inténtalo de nuevo."), variant: "destructive" });
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Fotos del servicio">
      {fotos.map(f => (
        <div key={f.id} className="relative size-16 overflow-hidden rounded-lg border">
          <img src={storageUrl(f.ruta)} alt="Foto del servicio" className="h-full w-full object-cover" />
          {f.esta_ocultada && (
            <span className="absolute inset-0 flex items-center justify-center bg-destructive/70 text-white" title="Oculta por el administrador tras una denuncia">
              <EyeOff className="size-4" />
            </span>
          )}
          <button type="button" onClick={() => quitar(f)} disabled={ocupado} aria-label="Quitar foto"
            className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5 text-white">
            <X className="size-3" />
          </button>
        </div>
      ))}
      {libres > 0 && (
        <button type="button" onClick={() => input.current?.click()} disabled={ocupado}
          className="flex size-16 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed text-[10px] font-semibold text-primary hover:bg-primary/5 disabled:opacity-60">
          {ocupado ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {fotos.length}/{MAX_FOTOS}
        </button>
      )}
      {fotos.some(f => f.esta_ocultada) && (
        <p className="w-full text-xs text-destructive">Las fotos en rojo fueron ocultadas por el administrador tras una denuncia.</p>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={subir} />
    </div>
  );
};

export default FotosServicio;
