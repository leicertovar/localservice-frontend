import { MessageCircle, Clock, CheckCircle2, XCircle, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolicitudServicioDatos } from "@/services/reservaService";

interface Props {
  solicitudes: SolicitudServicioDatos[];
  onAceptarCotizacion: (id: number) => void;
  onRechazarCotizacion: (id: number) => void;
  onAbrirChat: (nombre: string, id: string) => void;
}

const estadoConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  pendiente: {
    label: "Pendiente de Cotizar",
    className: "bg-info/10 text-info border border-info/20",
    icon: <Clock className="w-3 h-3" />,
  },
  cotizado: {
    label: "Cotización Recibida",
    className: "bg-warning/10 text-warning border border-warning/20",
    icon: <FileQuestion className="w-3 h-3" />,
  },
  aceptada: {
    label: "Confirmado / Agendado",
    className: "bg-success/10 text-success border border-success/20",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  rechazada: {
    label: "Rechazada",
    className: "bg-destructive/10 text-destructive border border-destructive/20",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const SolicitudesSection = ({ solicitudes, onAceptarCotizacion, onRechazarCotizacion, onAbrirChat }: Props) => {
  const activas = solicitudes.filter(s => s.estado !== 'completada');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Mis Solicitudes y Cotizaciones</h2>
        <span className="text-sm text-muted-foreground">{activas.length} solicitud{activas.length !== 1 ? 'es' : ''}</span>
      </div>

      {activas.length === 0 ? (
        <div className="bg-white border border-border/60 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">Sin solicitudes activas</p>
          <p className="text-sm text-muted-foreground">Visita el perfil de un proveedor para solicitar un servicio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activas.map(req => {
            const config = estadoConfig[req.estado ?? ""] ?? { label: req.estado ?? "", className: "bg-muted text-muted-foreground", icon: null };
            const proveedorNombre = req.proveedor ? `${req.proveedor.nombre} ${req.proveedor.apellido || ""}`.trim() : "Proveedor";

            return (
              <div key={req.id} className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{req.servicio?.nombre || "Servicio Personalizado"}</h3>
                      <Badge className={`${config.className} text-xs flex items-center gap-1 font-medium`}>
                        {config.icon}
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{proveedorNombre}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {req.fecha} · {req.hora}
                    </p>

                    {req.estado === 'cotizado' && req.monto_cotizado && (
                      <div className="mt-3 p-4 bg-warning/5 border border-warning/20 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">Monto Cotizado</p>
                            <p className="text-xl font-bold text-primary">{req.monto_cotizado}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-0.5">Tiempo estimado</p>
                            <p className="text-sm font-semibold text-foreground">{req.tiempo_estimado}</p>
                          </div>
                        </div>
                        {req.garantia && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Garantía:</span> {req.garantia}
                          </p>
                        )}
                        {req.detalles_cotizacion && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Detalles:</span> {req.detalles_cotizacion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    {req.estado === 'cotizado' && req.id && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 rounded-lg text-xs font-semibold bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => req.id && onAceptarCotizacion(req.id)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/5"
                          onClick={() => req.id && onRechazarCotizacion(req.id)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 rounded-lg text-xs gap-1.5"
                      onClick={() => onAbrirChat(proveedorNombre, req.proveedor_id)}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SolicitudesSection;
