import { CheckCircle, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Resena } from "@/services/resenaService";

interface Props {
  resenasReportadas: Resena[];
  onModerar: (id: number, accion: 'ocultar' | 'restaurar') => void;
  onEliminar: (id: number) => void;
  onActualizar: () => void;
}

const ResenasSection = ({ resenasReportadas, onModerar, onEliminar, onActualizar }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Reseñas Reportadas</h2>
        <Button variant="outline" size="sm" onClick={onActualizar}>Actualizar</Button>
      </div>

      {resenasReportadas.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-foreground font-medium">Sin reportes pendientes</p>
          <p className="text-sm text-muted-foreground mt-1">No hay reseñas reportadas que necesiten revisión.</p>
        </div>
      ) : (
        resenasReportadas.map(r => (
          <div key={r.id} className="bg-card rounded-xl border p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm">
                    {r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido || ""}` : "Cliente"}
                  </h3>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-xs text-muted-foreground">Proveedor</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.calificacion }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-warning fill-warning" />
                    ))}
                  </div>
                  {r.motivo_reporte && (
                    <Badge className="text-xs bg-destructive/10 text-destructive">{r.motivo_reporte}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{r.comentario}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(r.created_at).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => onModerar(r.id, 'restaurar')}>
                Conservar reseña
              </Button>
              <Button size="sm" variant="outline" className="text-warning gap-1" onClick={() => onModerar(r.id, 'ocultar')}>
                Ocultar temporalmente
              </Button>
              <Button size="sm" variant="destructive" className="gap-1" onClick={() => onEliminar(r.id)}>
                <Trash2 className="w-3 h-3" />Eliminar definitivamente
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ResenasSection;
