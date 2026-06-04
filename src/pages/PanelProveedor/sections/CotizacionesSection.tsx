import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolicitudServicioDatos } from "@/services/reservaService";

interface Props {
  solicitudes: SolicitudServicioDatos[];
  onCompletar: (id: number) => void;
}

const CotizacionesSection = ({ solicitudes, onCompletar }: Props) => {
  const cotizadas = solicitudes.filter(s => s.estado === "cotizado");
  const agendadas = solicitudes.filter(s => s.estado === "aceptada");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Cotizaciones Enviadas</h2>
      {cotizadas.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
          No tienes cotizaciones activas.
        </div>
      ) : (
        cotizadas.map(q => (
          <div key={q.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{q.servicio?.nombre || "Servicio Personalizado"}</h3>
              <p className="text-sm text-muted-foreground">
                Cliente: {q.cliente?.nombre} {q.cliente?.apellido} · {q.fecha}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-foreground">{q.monto_cotizado}</span>
              <Badge className="text-xs bg-warning/10 text-warning">En espera</Badge>
            </div>
          </div>
        ))
      )}

      {agendadas.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-semibold text-success">Servicios Agendados</h3>
          {agendadas.map(q => (
            <div key={q.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{q.servicio?.nombre || "Servicio Personalizado"}</h3>
                <p className="text-sm text-muted-foreground">
                  Cliente: {q.cliente?.nombre} {q.cliente?.apellido} · {q.fecha} · {q.hora}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">{q.monto_cotizado}</span>
                {(() => {
                  const hoy = new Date().toISOString().split("T")[0];
                  const puedCompletar = !q.fecha || hoy >= q.fecha;
                  return puedCompletar ? (
                    <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => q.id && onCompletar(q.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />Completar
                    </Button>
                  ) : (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Disponible el</p>
                      <p className="text-xs font-semibold text-foreground">
                        {new Date(q.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CotizacionesSection;
