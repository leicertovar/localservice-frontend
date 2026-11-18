import CarruselFotos from "@/components/reusable/CarruselFotos";
import { mensajeError } from "@/lib/solicitudes";
import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { responderResena as apiResponderResena, type Resena } from "@/services/resenaService";

interface Props {
  resenas: Resena[];
  onRefresh: () => void;
}

const ResenasSection = ({ resenas, onRefresh }: Props) => {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  const enviarRespuesta = async (id: number) => {
    if (replyText.trim().length < 2) return;
    try {
      await apiResponderResena(id, replyText.trim());
      toast({ title: "Respuesta publicada", description: "El cliente la verá debajo de su reseña." });
      setReplyingTo(null);
      setReplyText("");
      onRefresh();
    } catch (err) {
      toast({ title: "No se pudo publicar la respuesta", description: mensajeError(err, "Inténtalo de nuevo."), variant: "destructive" });
    }
  };

  const promedio = resenas.length ? resenas.reduce((a, r) => a + Number(r.calificacion), 0) / resenas.length : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Mis Reseñas ({resenas.length})</h2>
      {resenas.length > 0 && (
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5" aria-label={`Promedio ${promedio.toFixed(1)} de 5`}>
          <span className="text-4xl font-bold text-foreground">{promedio.toFixed(1)}</span>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} className={`w-5 h-5 ${n <= Math.round(promedio) ? "text-warning fill-warning" : "text-muted"}`} />
              ))}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Promedio de {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"} · más recientes primero</p>
          </div>
        </div>
      )}
      {resenas.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
          Aún no tienes reseñas de clientes.
        </div>
      ) : (
        resenas.map(r => (
          <div key={r.id} className="bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-muted">
                    {r.cliente ? r.cliente.nombre[0] + (r.cliente.apellido?.[0] || "") : "CL"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground text-sm">
                  {r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido || ""}` : "Cliente"}
                </span>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: r.calificacion }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-warning fill-warning" />
                ))}
                {Array.from({ length: 5 - r.calificacion }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-muted" />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{r.comentario}</p>
            {(r.imagenes_visibles?.length ?? 0) > 0 && (
              <div className="max-w-sm">
                <CarruselFotos fotos={r.imagenes_visibles!} tipo="resena" descripcion="Foto de la reseña" alto={160} permitirDenunciar />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(r.created_at).toLocaleDateString("es-CO")}
            </p>
            {r.respuesta_proveedor && (
              <div className="mt-3 ml-6 pl-4 border-l-2 border-primary/20 bg-primary/[0.03] rounded-r-lg p-3">
                <p className="text-xs font-medium text-primary mb-1">Tu respuesta</p>
                <p className="text-sm text-muted-foreground">{r.respuesta_proveedor}</p>
              </div>
            )}
            {replyingTo !== r.id && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 text-xs text-primary"
                onClick={() => { setReplyingTo(r.id); setReplyText(r.respuesta_proveedor ?? ""); }}
              >
                {r.respuesta_proveedor ? "Editar respuesta" : "Responder reseña"}
              </Button>
            )}
            {replyingTo === r.id && (
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Escribe tu respuesta..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="flex-1 text-sm h-9"
                />
                <Button size="sm" onClick={() => enviarRespuesta(r.id)} className="gap-1">
                  <Send className="w-3 h-3" />Enviar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ResenasSection;
