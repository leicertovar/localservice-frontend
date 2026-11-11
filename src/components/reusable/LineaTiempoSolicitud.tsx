import { Check, X } from "lucide-react";
import type { EstadoSolicitud, EventoSolicitud } from "@/services/reservaService";

const PASOS: { estado: EstadoSolicitud; titulo: string; ayuda: string }[] = [
  { estado: "pendiente", titulo: "Solicitud enviada", ayuda: "El proveedor revisará tu solicitud." },
  { estado: "cotizado", titulo: "Cotización recibida", ayuda: "Revisa el valor y acéptalo si estás de acuerdo." },
  { estado: "aceptada", titulo: "Servicio aceptado", ayuda: "El proveedor irá en la fecha acordada." },
  { estado: "en_curso", titulo: "En curso", ayuda: "El proveedor está trabajando en tu servicio." },
  { estado: "completada", titulo: "Completado", ayuda: "" },
];

const FINALES: Partial<Record<EstadoSolicitud, { titulo: string; ayuda: string }>> = {
  cancelada: { titulo: "Solicitud cancelada", ayuda: "Puedes pedir el servicio de nuevo cuando lo necesites." },
  rechazada: { titulo: "Rechazada por el proveedor", ayuda: "Busca otro proveedor disponible para tu servicio." },
};

type Tipo = "hecho" | "actual" | "pendiente" | "final";

const momento = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : undefined;

interface Props {
  estado?: EstadoSolicitud;
  eventos?: EventoSolicitud[];
}

/** Línea de tiempo de una solicitud: qué pasó, cuándo y qué sigue (igual que en la app móvil). */
const LineaTiempoSolicitud = ({ estado = "pendiente", eventos = [] }: Props) => {
  const ultimo = (e: EstadoSolicitud) => [...eventos].reverse().find(x => x.estado === e);
  const alcanzados = new Set(eventos.map(e => e.estado));
  const pasos = PASOS.filter(
    p => p.estado !== "cotizado" || alcanzados.has("cotizado") || estado === "pendiente" || estado === "cotizado"
  );
  const final = FINALES[estado];

  const items: { clave: string; titulo: string; tipo: Tipo; ayuda?: string; fecha?: string; nota?: string | null }[] = final
    ? [
        ...pasos
          .filter(p => alcanzados.has(p.estado))
          .map(p => ({ clave: p.estado, titulo: p.titulo, tipo: "hecho" as Tipo, fecha: momento(ultimo(p.estado)?.created_at), nota: ultimo(p.estado)?.nota })),
        { clave: estado, titulo: final.titulo, tipo: "final", ayuda: final.ayuda, fecha: momento(ultimo(estado)?.created_at), nota: ultimo(estado)?.nota },
      ]
    : (() => {
        const actual = Math.max(0, pasos.findIndex(p => p.estado === estado));
        return pasos.map((p, i) => ({
          clave: p.estado,
          titulo: p.titulo,
          tipo: (i < actual || (p.estado === "completada" && i === actual) ? "hecho" : i === actual ? "actual" : "pendiente") as Tipo,
          ayuda: i === actual ? p.ayuda : undefined,
          fecha: i <= actual ? momento(ultimo(p.estado)?.created_at) : undefined,
          nota: i <= actual ? ultimo(p.estado)?.nota : undefined,
        }));
      })();

  return (
    <ol className="space-y-0" aria-label="Seguimiento de la solicitud">
      {items.map((p, i) => (
        <li key={p.clave} className="relative flex gap-3 pb-4 last:pb-0" aria-current={p.tipo === "actual" ? "step" : undefined}>
          {i < items.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${p.tipo === "hecho" ? "bg-primary" : "bg-border"}`}
            />
          )}
          <span
            aria-hidden="true"
            className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
              p.tipo === "hecho"
                ? "border-primary bg-primary text-white"
                : p.tipo === "actual"
                ? "border-primary bg-card"
                : p.tipo === "final"
                ? "border-muted-foreground bg-muted-foreground text-white"
                : "border-border bg-card"
            }`}
          >
            {p.tipo === "hecho" && <Check className="size-3.5" />}
            {p.tipo === "final" && <X className="size-3.5" />}
            {p.tipo === "actual" && <span className="size-2.5 rounded-full bg-primary" />}
          </span>
          <span className="flex min-w-0 flex-col pt-0.5">
            <span className={`text-sm ${p.tipo === "pendiente" ? "text-muted-foreground" : "font-semibold text-foreground"}`}>{p.titulo}</span>
            {p.fecha && <span className="text-xs text-muted-foreground">{p.fecha}</span>}
            {p.nota && <span className="text-xs italic text-foreground">{p.nota}</span>}
            {p.ayuda && <span className={`text-xs ${p.tipo === "actual" ? "text-primary" : "text-muted-foreground"}`}>{p.ayuda}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
};

export default LineaTiempoSolicitud;
