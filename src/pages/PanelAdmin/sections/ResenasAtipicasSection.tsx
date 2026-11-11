import { useCallback, useEffect, useState } from "react";
import { BarChart3, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  obtenerResenasAtipicas,
  revisarResenaAtipica,
  type DistribucionCalificaciones,
  type ResenaAtipica,
} from "@/services/resenaService";

/** Diagrama de caja de las calificaciones del proveedor (escala 1–5) con el valor atípico marcado. */
const DiagramaCaja = ({ d, valor }: { d: DistribucionCalificaciones; valor: number }) => {
  const ancho = 260;
  const x = (v: number) => 10 + ((Math.min(5, Math.max(1, v)) - 1) / 4) * (ancho - 20);
  return (
    <svg viewBox={`0 0 ${ancho} 54`} className="w-full max-w-xs" role="img"
      aria-label={`Q1 ${d.q1}, Q3 ${d.q3}, rango normal ${d.inferior} a ${d.superior}, esta calificación ${valor}`}>
      {/* bigotes hasta los límites IQR (recortados a la escala 1–5) */}
      <line x1={x(d.inferior)} x2={x(d.superior)} y1="20" y2="20" className="stroke-muted-foreground" strokeWidth="1.5" />
      <line x1={x(d.inferior)} x2={x(d.inferior)} y1="13" y2="27" className="stroke-muted-foreground" strokeWidth="1.5" />
      <line x1={x(d.superior)} x2={x(d.superior)} y1="13" y2="27" className="stroke-muted-foreground" strokeWidth="1.5" />
      {/* caja Q1–Q3 */}
      <rect x={x(d.q1)} y="10" width={Math.max(2, x(d.q3) - x(d.q1))} height="20" rx="3"
        className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      {/* calificación atípica */}
      <circle cx={x(valor)} cy="20" r="5" className="fill-destructive" />
      {[1, 2, 3, 4, 5].map((v) => (
        <text key={v} x={x(v)} y="48" textAnchor="middle" className="fill-muted-foreground" fontSize="10">{v}</text>
      ))}
    </svg>
  );
};

/**
 * Admin · Calificaciones atípicas (método IQR).
 * Quedan fuera del promedio del proveedor hasta que se investigue su origen:
 * conservar si fue un fallo real del servicio, excluir si fue un error o un cliente "hater".
 */
const ResenasAtipicasSection = () => {
  const { toast } = useToast();
  const [resenas, setResenas] = useState<ResenaAtipica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [revisando, setRevisando] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setResenas(await obtenerResenasAtipicas());
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las calificaciones atípicas.", variant: "destructive" });
    } finally {
      setCargando(false);
    }
  }, [toast]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const revisar = async (r: ResenaAtipica, decision: "conservar" | "excluir") => {
    setRevisando(r.id);
    try {
      await revisarResenaAtipica(r.id, decision);
      setResenas((prev) => prev.filter((x) => x.id !== r.id));
      toast({
        title: decision === "conservar" ? "Calificación conservada" : "Calificación excluida",
        description: decision === "conservar"
          ? "Vuelve a contar en el promedio del proveedor."
          : "Sigue visible, pero no cuenta en el promedio.",
      });
    } catch {
      toast({ title: "Error", description: "No se pudo guardar la decisión.", variant: "destructive" });
    } finally {
      setRevisando(null);
    }
  };

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Calificaciones atípicas</h2>
          <p className="text-sm text-muted-foreground">
            Detectadas con el rango intercuartílico (IQR). No cuentan en el promedio hasta que las revises.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={cargar}>Actualizar</Button>
      </div>

      {cargando ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : resenas.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-foreground font-medium">Sin calificaciones atípicas pendientes</p>
        </div>
      ) : (
        resenas.map((r) => {
          const cliente = r.cliente ? `${r.cliente.nombre} ${r.cliente.apellido || ""}`.trim() : "Cliente";
          const proveedor = r.proveedor ? `${r.proveedor.nombre} ${r.proveedor.apellido || ""}`.trim() : "Proveedor";
          return (
            <div key={r.id} className="bg-card rounded-xl border p-5 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-sm">{cliente}</h3>
                <span className="text-xs text-muted-foreground">calificó a</span>
                <span className="font-semibold text-foreground text-sm">{proveedor}</span>
                <span className="flex gap-0.5 ml-1">
                  {Array.from({ length: r.calificacion }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-warning fill-warning" />
                  ))}
                </span>
                <Badge className="text-xs bg-destructive/10 text-destructive">Atípica</Badge>
              </div>

              <p className="text-sm text-foreground">“{r.comentario}”</p>

              {r.solicitud && (
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                  <p><span className="font-medium text-foreground">Servicio solicitado:</span> {r.solicitud.descripcion}</p>
                  {r.solicitud.confirmacion_cliente === "rechazado" && (
                    <p className="text-destructive">
                      El cliente rechazó el trabajo{r.solicitud.queja_cliente ? `: ${r.solicitud.queja_cliente}` : "."}
                    </p>
                  )}
                </div>
              )}

              {r.distribucion && (
                <div className="flex items-center gap-3 flex-wrap">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                  <DiagramaCaja d={r.distribucion} valor={r.calificacion} />
                  <span className="text-xs text-muted-foreground">
                    {r.distribucion.n} calificaciones · rango normal {Math.max(1, r.distribucion.inferior)}–
                    {Math.min(5, r.distribucion.superior)}
                  </span>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button size="sm" variant="outline" disabled={revisando === r.id} onClick={() => revisar(r, "conservar")}>
                  Conservar (fallo real del servicio)
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" disabled={revisando === r.id}
                  onClick={() => revisar(r, "excluir")}>
                  Excluir (error o cliente “hater”)
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ResenasAtipicasSection;
