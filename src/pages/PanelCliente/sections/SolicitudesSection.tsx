import { useState } from "react";
import { MessageCircle, CheckCircle2, XCircle, FileQuestion, Ban, ChevronDown, ChevronUp, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolicitudServicioDatos } from "@/services/reservaService";
import LineaTiempoSolicitud from "@/components/reusable/LineaTiempoSolicitud";
import { ESTADOS_ACTIVOS, SE_PUEDE_CANCELAR, estadoSolicitud, formatearMonto } from "@/lib/solicitudes";

interface Props {
  solicitudes: SolicitudServicioDatos[];
  onAceptarCotizacion: (id: number) => void;
  onRechazarCotizacion: (id: number) => void;
  onCancelar: (id: number) => void;
  onAbrirChat: (nombre: string, id: string) => void;
}

const NOTAS: Partial<Record<string, string>> = {
  pendiente: "Esperando la cotización del proveedor.",
  aceptada: "Servicio programado. El proveedor irá en la fecha acordada.",
  en_curso: "El proveedor está trabajando en tu servicio.",
  rechazada: "El proveedor no pudo atender esta solicitud.",
  cancelada: "Cancelaste esta solicitud.",
};

const SolicitudesSection = ({ solicitudes, onAceptarCotizacion, onRechazarCotizacion, onCancelar, onAbrirChat }: Props) => {
  const [verCerradas, setVerCerradas] = useState(false);
  const [abierta, setAbierta] = useState<number | null>(null);

  const activas = solicitudes.filter(s => ESTADOS_ACTIVOS.includes(s.estado ?? "pendiente"));
  const cerradas = solicitudes.filter(s => s.estado === "rechazada" || s.estado === "cancelada");
  const visibles = verCerradas ? [...activas, ...cerradas] : activas;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-foreground">Mis Solicitudes y Cotizaciones</h2>
        <span className="text-sm text-muted-foreground">{activas.length} activa{activas.length !== 1 ? "s" : ""}</span>
      </div>

      {visibles.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">Sin solicitudes activas</p>
          <p className="text-sm text-muted-foreground">Visita el perfil de un proveedor para solicitar un servicio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibles.map(req => {
            const config = estadoSolicitud(req.estado);
            const proveedorNombre = req.proveedor ? `${req.proveedor.nombre} ${req.proveedor.apellido || ""}`.trim() : "Proveedor";
            const expandida = abierta === req.id;
            const nota = NOTAS[req.estado ?? "pendiente"];

            return (
              <div key={req.id} className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{req.servicio?.nombre || "Servicio Personalizado"}</h3>
                      <Badge className={`${config.className} text-xs font-medium`}>{config.label}</Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{proveedorNombre}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />{req.fecha} · {req.hora}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />{req.direccion}
                    </p>
                    {nota && <p className="text-xs text-muted-foreground mt-2">{nota}</p>}

                    {req.monto_cotizado && req.estado !== "pendiente" && (
                      <div className={`mt-3 p-4 rounded-xl space-y-2 border ${req.estado === "cotizado" ? "bg-warning/5 border-warning/20" : "bg-muted/40 border-border/60"}`}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">{req.estado === "cotizado" ? "Valor cotizado" : "Valor acordado"}</p>
                            <p className="text-xl font-bold text-primary">{formatearMonto(req.monto_cotizado)}</p>
                          </div>
                          {req.tiempo_estimado && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-0.5">Tiempo estimado</p>
                              <p className="text-sm font-semibold text-foreground">{req.tiempo_estimado}</p>
                            </div>
                          )}
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
                    {req.estado === "cotizado" && req.id && (
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
                    {req.id && req.estado !== "cotizado" && SE_PUEDE_CANCELAR.includes(req.estado ?? "pendiente") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/5"
                        onClick={() => req.id && onCancelar(req.id)}
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" />
                        Cancelar
                      </Button>
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

                <button
                  type="button"
                  aria-expanded={expandida}
                  onClick={() => setAbierta(expandida ? null : req.id ?? null)}
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {expandida ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {expandida ? "Ocultar seguimiento" : "Ver seguimiento"}
                </button>
                {expandida && (
                  <div className="mt-3 border-t pt-4">
                    <LineaTiempoSolicitud estado={req.estado} eventos={req.eventos} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cerradas.length > 0 && (
        <button type="button" onClick={() => setVerCerradas(v => !v)} className="text-sm font-semibold text-primary hover:underline">
          {verCerradas ? "Ocultar canceladas y rechazadas" : `Ver canceladas y rechazadas (${cerradas.length})`}
        </button>
      )}
    </div>
  );
};

export default SolicitudesSection;
