import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, EyeOff, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { storageUrl } from "@/lib/api";
import { mensajeError } from "@/lib/solicitudes";
import { denunciarFoto, MOTIVOS_DENUNCIA, type Foto, type TipoFoto } from "@/services/fotosService";

interface Props {
  fotos: Foto[];
  tipo: TipoFoto;
  descripcion: string;
  /** Alto del carrusel en píxeles. */
  alto?: number;
  /** Muestra "Denunciar foto" al ampliarla (no a quien la publicó). */
  permitirDenunciar?: boolean;
}

/**
 * Carrusel de hasta 3 fotos (flechas y desplazamiento). Al hacer clic se amplía la foto,
 * y desde ahí se puede denunciar para que el administrador la revise.
 */
const CarruselFotos = ({ fotos, tipo, descripcion, alto = 180, permitirDenunciar = false }: Props) => {
  const pista = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const [ampliada, setAmpliada] = useState<number | null>(null);
  const [denunciando, setDenunciando] = useState(false);
  const [motivo, setMotivo] = useState(MOTIVOS_DENUNCIA[0]);
  const [enviando, setEnviando] = useState(false);
  const { toast } = useToast();

  if (fotos.length === 0) return null;

  const ir = (i: number) => {
    const el = pista.current;
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: "smooth" });
  };

  const enviarDenuncia = async () => {
    if (ampliada === null) return;
    setEnviando(true);
    try {
      await denunciarFoto(tipo, fotos[ampliada].id, motivo);
      toast({ title: "Foto denunciada", description: "El administrador la revisará." });
      setDenunciando(false);
    } catch (err) {
      toast({ title: "No se pudo denunciar", description: mensajeError(err, "Inténtalo de nuevo."), variant: "destructive" });
    } finally {
      setEnviando(false);
    }
  };

  const foto = ampliada !== null ? fotos[ampliada] : null;

  return (
    <>
      <div className="relative mt-3 overflow-hidden rounded-xl bg-muted" style={{ height: alto }}>
        <div
          ref={pista}
          className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={e => setActual(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        >
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setAmpliada(i); setDenunciando(false); }}
              className="relative h-full w-full flex-none snap-center cursor-zoom-in"
              aria-label={`${descripcion} ${i + 1} de ${fotos.length}. Ampliar`}
            >
              <img src={storageUrl(f.ruta)} alt="" loading="lazy" className="h-full w-full object-cover" />
              {f.esta_ocultada && (
                <span className="absolute inset-x-2 bottom-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                  <EyeOff className="size-3.5" />Oculta por el administrador
                </span>
              )}
            </button>
          ))}
        </div>
        {fotos.length > 1 && (
          <>
            <button type="button" onClick={() => ir(Math.max(0, actual - 1))} disabled={actual === 0} aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white disabled:opacity-0">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => ir(Math.min(fotos.length - 1, actual + 1))} disabled={actual === fotos.length - 1} aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white disabled:opacity-0">
              <ChevronRight className="size-5" />
            </button>
            <span className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5" aria-hidden="true">
              {fotos.map((f, i) => (
                <span key={f.id} className={`size-2 rounded-full shadow ${i === actual ? "bg-white" : "bg-white/55"}`} />
              ))}
            </span>
          </>
        )}
      </div>

      <Dialog open={ampliada !== null} onOpenChange={abierto => !abierto && setAmpliada(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Foto {ampliada !== null ? ampliada + 1 : ""} de {fotos.length}</DialogTitle>
            <DialogDescription>{descripcion}</DialogDescription>
          </DialogHeader>
          {foto && (
            <div className="relative flex items-center justify-center rounded-lg bg-black/90">
              <img src={storageUrl(foto.ruta)} alt={`${descripcion} ${ampliada! + 1}`} className="max-h-[65vh] w-auto object-contain" />
              {fotos.length > 1 && (
                <>
                  <button type="button" onClick={() => { setAmpliada((ampliada! - 1 + fotos.length) % fotos.length); setDenunciando(false); }}
                    aria-label="Foto anterior" className="absolute left-2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
                    <ChevronLeft className="size-5" />
                  </button>
                  <button type="button" onClick={() => { setAmpliada((ampliada! + 1) % fotos.length); setDenunciando(false); }}
                    aria-label="Foto siguiente" className="absolute right-2 rounded-full bg-white/15 p-2 text-white hover:bg-white/25">
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>
          )}
          {permitirDenunciar && foto && !foto.esta_ocultada && (
            denunciando ? (
              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-sm font-medium">¿Por qué crees que esta foto no debería estar publicada?</p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {MOTIVOS_DENUNCIA.map(m => (
                    <label key={m} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="radio" name="motivo-denuncia" checked={motivo === m} onChange={() => setMotivo(m)} />{m}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={enviarDenuncia} disabled={enviando}>
                    {enviando ? "Enviando…" : "Denunciar"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDenunciando(false)} disabled={enviando}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="w-fit gap-1.5 text-muted-foreground" onClick={() => setDenunciando(true)}>
                <Flag className="size-4" />Denunciar foto
              </Button>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CarruselFotos;
