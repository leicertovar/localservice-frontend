import { useState } from "react";
import { CheckCircle, XCircle, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { aceptarSolicitudProveedor, enviarCotizacion, rechazarCotizacion, SolicitudServicioDatos } from "@/services/reservaService";
import { mensajeError } from "@/lib/solicitudes";

interface Props {
  solicitudes: SolicitudServicioDatos[];
  onRefresh: () => void;
  onAbrirChat: (nombre: string, id: string) => void;
}

const SolicitudesSection = ({ solicitudes, onRefresh, onAbrirChat }: Props) => {
  const [solicitudCotizarId, setSolicitudCotizarId] = useState<number | null>(null);
  const [montoCotizado, setMontoCotizado] = useState("");
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [garantiaCotizada, setGarantiaCotizada] = useState("");
  const [detallesCotizacion, setDetallesCotizacion] = useState("");
  const { toast } = useToast();

  const pendientes = solicitudes.filter(s => s.estado === "pendiente");

  const enviarCotizacionAlCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = Number(montoCotizado.replace(/\D/g, ""));
    if (!solicitudCotizarId || !valor || !tiempoEstimado.trim()) {
      toast({ title: "Faltan datos", description: "Escribe el valor y el tiempo estimado.", variant: "destructive" });
      return;
    }
    if (valor < 1000) {
      toast({ title: "Valor muy bajo", description: "El valor debe ser de al menos $1.000.", variant: "destructive" });
      return;
    }
    try {
      await enviarCotizacion(solicitudCotizarId, {
        monto_cotizado: String(valor),
        tiempo_estimado: tiempoEstimado,
        garantia: garantiaCotizada,
        detalles_cotizacion: detallesCotizacion,
      });
      setSolicitudCotizarId(null);
      setMontoCotizado("");
      setTiempoEstimado("");
      setGarantiaCotizada("");
      setDetallesCotizacion("");
      toast({ title: "Cotización enviada", description: "Te avisaremos cuando el cliente responda." });
      onRefresh();
    } catch (err) {
      toast({ title: "No se pudo enviar", description: mensajeError(err, "No se pudo enviar la cotización."), variant: "destructive" });
      onRefresh();
    }
  };

  const denegarSolicitud = async (id: number) => {
    const motivo = prompt("¿Por qué rechazas la solicitud? (opcional, se le muestra al cliente)");
    if (motivo === null) return;
    try {
      await rechazarCotizacion(id, motivo.trim() || undefined);
      toast({ title: "Solicitud rechazada" });
    } catch (err) {
      toast({ title: "No se pudo rechazar", description: mensajeError(err, "Inténtalo de nuevo."), variant: "destructive" });
    }
    onRefresh();
  };

  const aceptarDirecto = async (id: number) => {
    const precio = prompt("Aceptarás el trabajo sin cotizar.\nSi ya acordaste un precio con el cliente, escríbelo (opcional):");
    if (precio === null) return;
    const valor = precio.replace(/\D/g, "");
    if (valor && Number(valor) < 1000) {
      toast({ title: "Valor muy bajo", description: "El precio debe ser de al menos $1.000.", variant: "destructive" });
      return;
    }
    try {
      await aceptarSolicitudProveedor(id, valor || undefined);
      toast({ title: "Trabajo aceptado", description: "Lo verás en Cotizaciones › Servicios agendados." });
    } catch (err) {
      toast({ title: "No se pudo aceptar", description: mensajeError(err, "Inténtalo de nuevo."), variant: "destructive" });
    }
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Solicitudes de Servicio Nuevas</h2>
      {pendientes.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
          No tienes solicitudes nuevas.
        </div>
      ) : (
        pendientes.map(req => (
          <div key={req.id} className="bg-card rounded-xl border p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{req.servicio?.nombre || "Servicio Personalizado"}</h3>
                    <Badge variant="secondary" className="text-xs">Pendiente</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {req.cliente?.nombre} {req.cliente?.apellido} · {req.telefono}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {req.fecha} · {req.hora} · {req.direccion}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => req.id && setSolicitudCotizarId(req.id)} className="gap-1">
                    <Send className="w-4 h-4" />Cotizar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => req.id && aceptarDirecto(req.id)} className="gap-1">
                    <CheckCircle className="w-4 h-4" />Aceptar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => req.id && denegarSolicitud(req.id)}
                    className="gap-1 text-destructive"
                  >
                    <XCircle className="w-4 h-4" />Rechazar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      req.cliente &&
                      onAbrirChat(`${req.cliente.nombre} ${req.cliente.apellido || ""}`, req.cliente.id)
                    }
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Descripción:</p>
                <p className="text-sm text-foreground">{req.descripcion}</p>
              </div>
              {solicitudCotizarId === req.id && (
                <form
                  onSubmit={enviarCotizacionAlCliente}
                  className="bg-primary/5 rounded-lg p-4 space-y-3 ring-1 ring-primary/20"
                >
                  <h4 className="font-medium text-foreground text-sm">Enviar Cotización</h4>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Valor (COP)</Label>
                      <Input
                        inputMode="numeric"
                        placeholder="$85.000"
                        value={montoCotizado}
                        onChange={e => {
                          const digitos = e.target.value.replace(/\D/g, "");
                          setMontoCotizado(digitos ? `$${Number(digitos).toLocaleString("es-CO")}` : "");
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tiempo estimado</Label>
                      <Input placeholder="Ej: 2 horas" value={tiempoEstimado} onChange={e => setTiempoEstimado(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Garantía (Opcional)</Label>
                      <Input placeholder="Ej: 30 días" value={garantiaCotizada} onChange={e => setGarantiaCotizada(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Detalles</Label>
                    <Textarea
                      placeholder="Proceso, materiales, condiciones..."
                      value={detallesCotizacion}
                      onChange={e => setDetallesCotizacion(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="gap-1">
                      <Send className="w-3 h-3" />Enviar
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setSolicitudCotizarId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SolicitudesSection;
