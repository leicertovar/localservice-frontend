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
    if (!replyText.trim()) return;
    try {
      await apiResponderResena(id, replyText);
      toast({ title: "Respuesta publicada" });
      setReplyingTo(null);
      setReplyText("");
      onRefresh();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Mis Reseñas ({resenas.length})</h2>
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
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(r.created_at).toLocaleDateString("es-CO")}
            </p>
            {r.respuesta_proveedor && (
              <div className="mt-3 ml-6 pl-4 border-l-2 border-primary/20 bg-primary/[0.03] rounded-r-lg p-3">
                <p className="text-xs font-medium text-primary mb-1">Tu respuesta</p>
                <p className="text-sm text-muted-foreground">{r.respuesta_proveedor}</p>
              </div>
            )}
            {!r.respuesta_proveedor && replyingTo !== r.id && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 text-xs text-primary"
                onClick={() => setReplyingTo(r.id)}
              >
                Responder reseña
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
