import type { EstadoSolicitud } from "@/services/reservaService";

/** Etiqueta y estilo de cada estado (los mismos nombres que en la app móvil). */
export const ESTADOS_SOLICITUD: Record<EstadoSolicitud, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-info/10 text-info border border-info/20" },
  cotizado: { label: "Cotizada", className: "bg-warning/10 text-warning border border-warning/20" },
  aceptada: { label: "Aceptada", className: "bg-success/10 text-success border border-success/20" },
  en_curso: { label: "En curso", className: "bg-violet-500/10 text-violet-600 border border-violet-500/20" },
  completada: { label: "Completada", className: "bg-success/10 text-success border border-success/20" },
  rechazada: { label: "Rechazada", className: "bg-destructive/10 text-destructive border border-destructive/20" },
  cancelada: { label: "Cancelada", className: "bg-muted text-muted-foreground border border-border" },
};

export const estadoSolicitud = (estado?: string) =>
  ESTADOS_SOLICITUD[(estado ?? "pendiente") as EstadoSolicitud] ?? ESTADOS_SOLICITUD.pendiente;

/** El trabajo sigue en marcha. */
export const ESTADOS_ACTIVOS: EstadoSolicitud[] = ["pendiente", "cotizado", "aceptada", "en_curso"];

/** El cliente puede cancelar mientras el servicio no haya empezado. */
export const SE_PUEDE_CANCELAR: EstadoSolicitud[] = ["pendiente", "cotizado", "aceptada"];

/**
 * Valor de la cotización para mostrar. El backend guarda solo dígitos ("85000");
 * las cotizaciones antiguas pueden traer texto libre ("$85.000"), que se muestra tal cual.
 */
export const formatearMonto = (monto?: string | number | null) => {
  if (monto === undefined || monto === null || monto === "") return "";
  const texto = String(monto);
  return /^\d+$/.test(texto) ? `$${Number(texto).toLocaleString("es-CO")}` : texto;
};

/** "2026-11-12" es posterior a hoy. */
export const esFechaFutura = (fecha?: string) => {
  if (!fecha) return false;
  const d = new Date();
  const hoy = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return fecha.slice(0, 10) > hoy;
};

/** Mensaje del backend (en español) o uno genérico. */
export const mensajeError = (err: unknown, porDefecto: string) => {
  const datos = (err as { response?: { data?: { errors?: Record<string, string[]>; mensaje?: string } } })?.response?.data;
  if (datos?.errors) return Object.values(datos.errors).flat().join(" · ");
  return datos?.mensaje || porDefecto;
};
