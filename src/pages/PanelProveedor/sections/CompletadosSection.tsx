import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolicitudServicioDatos } from "@/services/reservaService";

interface Props {
  serviciosCompletados: SolicitudServicioDatos[];
  onAbrirChat: (nombre: string, id: string) => void;
}

const CompletadosSection = ({ serviciosCompletados, onAbrirChat }: Props) => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-foreground">Servicios Completados</h2>
    {serviciosCompletados.length === 0 ? (
      <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
        Aún no tienes servicios completados.
      </div>
    ) : (
      serviciosCompletados.map(s => {
        const clienteNombre = s.cliente
          ? `${s.cliente.nombre} ${s.cliente.apellido || ""}`.trim()
          : "Cliente";
        let estadoConf = "Pendiente de confirmación";
        let badgeColor = "bg-warning/10 text-warning";
        if (s.confirmacion_cliente === "aceptado") {
          estadoConf = "Confirmado ✓";
          badgeColor = "bg-success/10 text-success";
        }
        if (s.confirmacion_cliente === "rechazado") {
          estadoConf = "Disputado";
          badgeColor = "bg-destructive/10 text-destructive";
        }
        return (
          <div key={s.id} className="bg-card rounded-xl border p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{s.servicio?.nombre || "Servicio Personalizado"}</h3>
                  <Badge className={`text-xs ${badgeColor}`}>{estadoConf}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Cliente: {clienteNombre} · Fecha: {s.fecha}</p>
                <p className="text-sm font-semibold text-foreground">{s.monto_cotizado}</p>
                {s.queja_cliente && (
                  <div className="mt-2 p-2 bg-destructive/5 border border-destructive/20 rounded text-xs text-destructive">
                    <strong>Queja:</strong> {s.queja_cliente}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onAbrirChat(clienteNombre, s.cliente?.id || "")}
              >
                <MessageCircle className="w-4 h-4 mr-1" />Chat
              </Button>
            </div>
          </div>
        );
      })
    )}
  </div>
);

export default CompletadosSection;
