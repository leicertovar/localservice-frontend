import { Clock, Star, Download, FileText, CheckCircle2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolicitudServicioDatos } from "@/services/reservaService";
import { useToast } from "@/hooks/use-toast";

interface Props {
  historial: SolicitudServicioDatos[];
  serviciosCompletadosPendientes: SolicitudServicioDatos[];
  onOpenReview: (target: { service: string; provider: string; proveedorId: string; solicitudId?: number }) => void;
  onOpenConfirm: (target: SolicitudServicioDatos) => void;
}

const HistorialSection = ({ historial, serviciosCompletadosPendientes, onOpenReview, onOpenConfirm }: Props) => {
  const { toast } = useToast();
  const sinContenido = historial.length === 0 && serviciosCompletadosPendientes.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Historial de Servicios</h2>
        <span className="text-sm text-muted-foreground">{historial.length} completado{historial.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Pendientes de confirmación */}
      {serviciosCompletadosPendientes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-4 h-4 text-info" />
            <h3 className="text-sm font-semibold text-info">Pendientes de tu confirmación</h3>
            <Badge className="bg-info/10 text-info border border-info/20 text-xs ml-auto">
              {serviciosCompletadosPendientes.length}
            </Badge>
          </div>
          {serviciosCompletadosPendientes.map(sol => {
            const provNombre = sol.proveedor ? `${sol.proveedor.nombre} ${sol.proveedor.apellido || ""}`.trim() : "Proveedor";
            return (
              <div key={sol.id} className="bg-white rounded-2xl border border-info/30 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{sol.servicio?.nombre || "Servicio Personalizado"}</h4>
                    <p className="text-sm text-muted-foreground">{provNombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Fecha: {sol.fecha} · Monto: {sol.monto_cotizado}</p>
                  </div>
                  <Button
                    size="sm"
                    className="h-8 rounded-lg text-xs font-semibold shrink-0"
                    onClick={() => onOpenConfirm(sol)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Confirmar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historial confirmado */}
      {sinContenido ? (
        <div className="bg-white border border-border/60 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">Sin historial aún</p>
          <p className="text-sm text-muted-foreground">Tus servicios completados aparecerán aquí.</p>
        </div>
      ) : historial.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">Completados y confirmados</h3>
          {historial.map(item => {
            const provNombre = item.proveedor ? `${item.proveedor.nombre} ${item.proveedor.apellido || ""}`.trim() : "Proveedor";
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground mb-0.5">{item.servicio?.nombre || "Servicio Personalizado"}</h3>
                    <p className="text-sm text-muted-foreground">{provNombre} · {item.fecha}</p>
                  </div>
                  <Badge className="bg-success/10 text-success border border-success/20 text-xs shrink-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completado
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <div>
                    <span className="text-lg font-bold text-foreground">{item.monto_cotizado}</span>
                    {item.id && (
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <FileText className="w-3 h-3" />
                        INV-{String(item.id).padStart(6, '0')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg gap-1.5 text-xs border-border/60"
                      onClick={() => onOpenReview({
                        service: item.servicio?.nombre || "Servicio Personalizado",
                        provider: provNombre,
                        proveedorId: item.proveedor_id,
                        solicitudId: item.id,
                      })}
                    >
                      <Star className="w-3 h-3 text-warning" />
                      Reseña
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg gap-1.5 text-xs border-border/60"
                      onClick={() => toast({ title: "Factura", description: "La factura se descargará próximamente." })}
                    >
                      <Download className="w-3 h-3" />
                      Factura
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default HistorialSection;
