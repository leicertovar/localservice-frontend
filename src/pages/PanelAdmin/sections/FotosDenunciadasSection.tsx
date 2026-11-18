import { useCallback, useEffect, useState } from "react";
import { CheckCircle, EyeOff, Flag, ImageIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { storageUrl } from "@/lib/api";
import { mensajeError } from "@/lib/solicitudes";
import { obtenerFotosDenunciadas, resolverFotoDenunciada, type FotoDenunciada } from "@/services/fotosService";

/**
 * Admin: fotos de reseñas y servicios denunciadas por los usuarios. Se ve la foto, su contexto
 * (reseña o servicio) y los motivos; el admin la oculta o la mantiene publicada.
 */
const FotosDenunciadasSection = () => {
  const [estado, setEstado] = useState<"pendientes" | "resueltas">("pendientes");
  const [fotos, setFotos] = useState<FotoDenunciada[] | null>(null);
  const [ocupada, setOcupada] = useState<string | null>(null);
  const { toast } = useToast();

  const cargar = useCallback(async () => {
    try {
      setFotos(await obtenerFotosDenunciadas(estado));
    } catch (err) {
      setFotos([]);
      toast({ title: "No se pudieron cargar las fotos denunciadas", description: mensajeError(err, "Inténtalo de nuevo."), variant: "destructive" });
    }
  }, [estado, toast]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const resolver = async (f: FotoDenunciada, decision: "ocultar" | "mantener") => {
    const clave = `${f.tipo}:${f.imagen_id}`;
    setOcupada(clave);
    try {
      const r = await resolverFotoDenunciada(f.tipo, f.imagen_id, decision);
      toast({ title: r.mensaje, description: decision === "ocultar" ? "Avisamos a quien la publicó." : "Las denuncias quedaron cerradas." });
      cargar();
    } catch (err) {
      toast({ title: "No se pudo guardar la decisión", description: mensajeError(err, "Inténtalo de nuevo."), variant: "destructive" });
    } finally {
      setOcupada(null);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />Fotos denunciadas
        </h2>
        <div className="flex gap-2">
          {(["pendientes", "resueltas"] as const).map(e => (
            <Button key={e} size="sm" variant={estado === e ? "default" : "outline"} onClick={() => setEstado(e)}>
              {e === "pendientes" ? "Pendientes" : "Resueltas"}
            </Button>
          ))}
        </div>
      </div>

      {fotos === null ? (
        <div className="bg-card rounded-xl border p-8 text-center text-sm text-muted-foreground">Cargando…</div>
      ) : fotos.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-foreground font-medium">{estado === "pendientes" ? "Sin fotos por revisar" : "Aún no hay decisiones"}</p>
          <p className="text-sm text-muted-foreground mt-1">Las fotos de reseñas y servicios que denuncien los usuarios aparecerán aquí.</p>
        </div>
      ) : (
        fotos.map(f => {
          const clave = `${f.tipo}:${f.imagen_id}`;
          return (
            <div key={clave} className="bg-card rounded-xl border p-5 flex flex-col sm:flex-row gap-5">
              <a href={storageUrl(f.ruta)} target="_blank" rel="noreferrer" className="shrink-0" title="Abrir la foto en tamaño completo">
                <img src={storageUrl(f.ruta)} alt={`Foto denunciada de ${f.tipo === "resena" ? "una reseña" : "un servicio"}`}
                  className={`w-full sm:w-56 h-48 object-cover rounded-lg border ${f.esta_ocultada ? "opacity-50" : ""}`} />
              </a>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{f.tipo === "resena" ? "Foto de reseña" : "Foto de servicio"}</Badge>
                  <Badge className="bg-destructive/10 text-destructive gap-1"><Flag className="w-3 h-3" />{f.total_denuncias} {f.total_denuncias === 1 ? "denuncia" : "denuncias"}</Badge>
                  {f.esta_ocultada && <Badge className="bg-muted text-muted-foreground gap-1"><EyeOff className="w-3 h-3" />Oculta</Badge>}
                  {f.decision && <Badge variant="outline">Decisión: {f.decision === "ocultar" ? "ocultada" : "mantenida"}</Badge>}
                </div>
                <p className="text-sm font-semibold text-foreground">{f.contexto.titulo}</p>
                {f.contexto.calificacion ? (
                  <div className="flex gap-0.5" aria-label={`${f.contexto.calificacion} estrellas`}>
                    {Array.from({ length: f.contexto.calificacion }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-warning fill-warning" />)}
                  </div>
                ) : null}
                {f.contexto.texto && <p className="text-sm text-muted-foreground line-clamp-3">"{f.contexto.texto}"</p>}
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {f.denuncias.map(d => (
                    <li key={d.id}><span className="font-medium text-foreground">{d.denunciante}:</span> {d.motivo} · {new Date(d.created_at).toLocaleDateString("es-CO")}</li>
                  ))}
                </ul>
                {estado === "pendientes" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="destructive" className="gap-1" disabled={ocupada === clave} onClick={() => resolver(f, "ocultar")}>
                      <EyeOff className="w-3.5 h-3.5" />Ocultar foto
                    </Button>
                    <Button size="sm" variant="outline" disabled={ocupada === clave} onClick={() => resolver(f, "mantener")}>
                      Mantener publicada
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default FotosDenunciadasSection;
