import { useCallback, useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Download, Eye, MapPin, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LineaTiempoSolicitud from "@/components/reusable/LineaTiempoSolicitud";
import { descargarFacturaPDF } from "@/lib/facturaUtils";
import { estadoSolicitud, formatearMonto, mensajeError } from "@/lib/solicitudes";
import { obtenerHistorial, type SolicitudServicioDatos } from "@/services/reservaService";

type Estado = "todos" | "completada" | "cancelada" | "rechazada";

interface Props {
  /** Desde qué panel se consulta (cambia "la otra parte" y la factura). */
  rol: "cliente" | "proveedor";
}

/** Historial de servicios anteriores: lista paginada con filtro por estado y fecha, y detalle de cada uno. */
const HistorialServicios = ({ rol }: Props) => {
  const [estado, setEstado] = useState<Estado>("todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState<{ items: SolicitudServicioDatos[]; ultima: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<SolicitudServicioDatos | null>(null);
  const fechasInvalidas = Boolean(desde && hasta && hasta < desde);

  const cargar = useCallback(async () => {
    if (fechasInvalidas) return;
    setDatos(null);
    try {
      const r = await obtenerHistorial({ estado, desde, hasta, page: pagina, por_pagina: 8 });
      setDatos({ items: r.data, ultima: r.last_page, total: r.total });
      setError(null);
    } catch (err) {
      setError(mensajeError(err, "No se pudo cargar el historial."));
      setDatos({ items: [], ultima: 1, total: 0 });
    }
  }, [estado, desde, hasta, pagina, fechasInvalidas]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Al cambiar un filtro se vuelve a la primera página
  const filtrar = (fn: () => void) => {
    fn();
    setPagina(1);
  };

  const otraParte = (s: SolicitudServicioDatos) => {
    const p = rol === "cliente" ? s.proveedor : s.cliente;
    return `${p?.nombre ?? ""} ${p?.apellido ?? ""}`.trim() || (rol === "cliente" ? "Proveedor" : "Cliente");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor={`hist-estado-${rol}`} className="text-xs">Estado</Label>
          <select
            id={`hist-estado-${rol}`}
            value={estado}
            onChange={e => filtrar(() => setEstado(e.target.value as Estado))}
            className="h-9 rounded-lg border bg-card px-3 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="completada">Completados</option>
            <option value="cancelada">Cancelados</option>
            <option value="rechazada">Rechazados</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`hist-desde-${rol}`} className="text-xs">Desde</Label>
          <Input id={`hist-desde-${rol}`} type="date" value={desde} max={hasta || undefined} onChange={e => filtrar(() => setDesde(e.target.value))} className="h-9 w-40" />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`hist-hasta-${rol}`} className="text-xs">Hasta</Label>
          <Input id={`hist-hasta-${rol}`} type="date" value={hasta} min={desde || undefined} onChange={e => filtrar(() => setHasta(e.target.value))} className="h-9 w-40" />
        </div>
        {(estado !== "todos" || desde || hasta) && (
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => filtrar(() => { setEstado("todos"); setDesde(""); setHasta(""); })}>
            <X className="size-3.5" />Quitar filtros
          </Button>
        )}
        {datos && <span className="ml-auto text-sm text-muted-foreground">{datos.total} {datos.total === 1 ? "servicio" : "servicios"}</span>}
      </div>
      {fechasInvalidas && <p className="text-sm text-destructive">La fecha final debe ser igual o posterior a la inicial.</p>}

      {!datos ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">Cargando…</div>
      ) : error ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-destructive">{error}</div>
      ) : datos.items.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          No hay servicios con esos filtros.
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {datos.items.map(s => {
              const est = estadoSolicitud(s.estado);
              return (
                <li key={s.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{s.servicio?.nombre || "Servicio Personalizado"}</h3>
                      <Badge className={`${est.className} text-xs`}>{est.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{otraParte(s)}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="size-3.5" />{s.fecha} · {s.hora}</span>
                      {s.resena && <span className="flex items-center gap-1"><Star className="size-3.5 fill-warning text-warning" />{Number(s.resena.calificacion).toFixed(1)}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.monto_cotizado && <span className="font-bold text-foreground">{formatearMonto(s.monto_cotizado)}</span>}
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setDetalle(s)}>
                      <Eye className="size-3.5" />Ver detalle
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
          {datos.ultima > 1 && (
            <nav className="flex items-center justify-center gap-3" aria-label="Paginación del historial">
              <Button size="sm" variant="outline" disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)} className="gap-1">
                <ChevronLeft className="size-4" />Anterior
              </Button>
              <span className="text-sm text-muted-foreground">Página {pagina} de {datos.ultima}</span>
              <Button size="sm" variant="outline" disabled={pagina >= datos.ultima} onClick={() => setPagina(p => p + 1)} className="gap-1">
                Siguiente<ChevronRight className="size-4" />
              </Button>
            </nav>
          )}
        </>
      )}

      <Dialog open={detalle !== null} onOpenChange={abierto => !abierto && setDetalle(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          {detalle && (
            <>
              <DialogHeader>
                <DialogTitle>{detalle.servicio?.nombre || "Servicio Personalizado"}</DialogTitle>
                <DialogDescription>
                  {rol === "cliente" ? "Proveedor" : "Cliente"}: {otraParte(detalle)} · {estadoSolicitud(detalle.estado).label}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-4" />{detalle.fecha} · {detalle.hora}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4" />{detalle.direccion}</p>
                <p className="rounded-lg bg-muted p-3 text-foreground">{detalle.descripcion}</p>
                {detalle.monto_cotizado && (
                  <div className="flex justify-between rounded-lg border p-3">
                    <span className="text-muted-foreground">Valor acordado</span>
                    <span className="font-bold">{formatearMonto(detalle.monto_cotizado)}</span>
                  </div>
                )}
                {detalle.resena && (
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <Star className="size-4 fill-warning text-warning" />
                    {rol === "cliente" ? "Calificaste" : "Te calificaron con"} {detalle.resena.calificacion} de 5
                  </p>
                )}
                <div className="rounded-lg border p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seguimiento</p>
                  <LineaTiempoSolicitud estado={detalle.estado} eventos={detalle.eventos} />
                </div>
                {rol === "cliente" && detalle.estado === "completada" && detalle.confirmacion_cliente === "aceptado" && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => descargarFacturaPDF(detalle)}>
                    <Download className="size-4" />Descargar factura
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistorialServicios;
