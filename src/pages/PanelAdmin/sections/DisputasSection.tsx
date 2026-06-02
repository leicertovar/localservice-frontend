import { CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storageUrl } from "@/lib/api";

interface Props {
  disputas: any[];
  notaResolucion: string;
  onNotaChange: (value: string) => void;
  onResolver: (id: number, resolucion: 'aprobado' | 'rechazado') => void;
  onActualizar: () => void;
}

const DisputasSection = ({ disputas, notaResolucion, onNotaChange, onResolver, onActualizar }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />Disputas de Servicios
        </h2>
        <Button variant="outline" size="sm" onClick={onActualizar}>Actualizar</Button>
      </div>

      {disputas.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-foreground font-medium">Sin disputas pendientes</p>
          <p className="text-sm text-muted-foreground mt-1">No hay servicios en disputa que requieran revisión.</p>
        </div>
      ) : (
        disputas.map(d => (
          <div key={d.id} className="bg-card rounded-xl border border-destructive/20 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {d.servicio?.nombre || 'Servicio Personalizado'} — Solicitud #{d.id}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cliente: <strong>{d.cliente ? `${d.cliente.nombre} ${d.cliente.apellido || ''}` : '—'}</strong> ·
                  Proveedor: <strong>{d.proveedor ? `${d.proveedor.nombre} ${d.proveedor.apellido || ''}` : '—'}</strong> ·
                  Fecha: {d.fecha}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.estado_disputa === 'pendiente_admin' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                {d.estado_disputa === 'pendiente_admin' ? 'Listo para resolver' : 'Esperando al proveedor'}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Motivo del cliente</p>
                <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{d.queja_cliente || 'Sin descripción'}</p>
                {d.evidencia_cliente && (
                  /\.(jpg|jpeg|png)$/i.test(d.evidencia_cliente) ? (
                    <img src={storageUrl(d.evidencia_cliente)} alt="Evidencia cliente" className="w-full max-h-48 object-contain rounded-lg border" />
                  ) : (
                    <a href={storageUrl(d.evidencia_cliente)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-primary underline">
                      <FileText className="w-3.5 h-3.5" />Ver evidencia del cliente
                    </a>
                  )
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Respuesta del proveedor</p>
                {d.evidencia_proveedor ? (
                  <>
                    <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{d.queja_cliente?.split('[Proveedor]')[1] || '—'}</p>
                    {/\.(jpg|jpeg|png)$/i.test(d.evidencia_proveedor) ? (
                      <img src={storageUrl(d.evidencia_proveedor)} alt="Evidencia proveedor" className="w-full max-h-48 object-contain rounded-lg border" />
                    ) : (
                      <a href={storageUrl(d.evidencia_proveedor)} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-primary underline">
                        <FileText className="w-3.5 h-3.5" />Ver evidencia del proveedor
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-3">
                    El proveedor aún no ha aportado evidencia.
                  </p>
                )}
              </div>
            </div>

            {d.estado_disputa === 'pendiente_admin' && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">Tu decisión final</p>
                <textarea
                  className="w-full rounded-lg border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/25"
                  rows={2}
                  placeholder="Nota de resolución (opcional — se enviará a ambas partes)"
                  value={notaResolucion}
                  onChange={e => onNotaChange(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1 bg-success hover:bg-success/90" onClick={() => onResolver(d.id, 'aprobado')}>
                    <CheckCircle className="w-4 h-4" />Aprobar trabajo del proveedor
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => onResolver(d.id, 'rechazado')}>
                    <XCircle className="w-4 h-4" />Rechazar — dar la razón al cliente
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DisputasSection;
