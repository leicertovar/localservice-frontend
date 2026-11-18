import { AlertTriangle, MapPin } from "lucide-react";
import type { ZonaAtencion } from "@/services/reservaService";
import { formatearDistancia } from "@/lib/geo";

/** Para el proveedor: la solicitud está dentro o fuera de su radio de atención. */
const ZonaBadge = ({ zona }: { zona?: ZonaAtencion | null }) => {
  if (!zona) return null;
  return zona.dentro ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
      <MapPin className="size-3.5" />En tu zona · a {formatearDistancia(zona.distancia_km)}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
      <AlertTriangle className="size-3.5" />Fuera de tu zona · a {formatearDistancia(zona.distancia_km)} (tu radio: {zona.radio_km} km)
    </span>
  );
};

export default ZonaBadge;
