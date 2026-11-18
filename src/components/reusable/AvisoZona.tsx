import { AlertTriangle, CheckCircle2, LocateFixed, Loader2 } from "lucide-react";
import { distanciaKm, formatearDistancia, type Punto } from "@/lib/geo";

interface Props {
  zona: { centro: Punto; radioKm: number };
  /** Punto a comparar: ubicación actual o pin de la dirección. */
  punto: Punto | null;
  sujeto: "ubicacion" | "direccion";
  nombreProveedor: string;
  buscando?: boolean;
  error?: string | null;
  onUsarUbicacion?: () => void;
}

/**
 * Letrero que dice si la ubicación del cliente (o la dirección marcada) queda dentro del radio
 * de atención del proveedor. Fuera del radio pide confirmar con el proveedor antes de contratar.
 */
const AvisoZona = ({ zona, punto, sujeto, nombreProveedor, buscando, error, onUsarUbicacion }: Props) => {
  if (!punto) {
    return (
      <div role="status" className="mt-3 flex items-start gap-2.5 rounded-xl bg-primary/5 p-3 text-sm text-foreground">
        <LocateFixed className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p>
            {error ??
              (sujeto === "ubicacion"
                ? `Comparte tu ubicación para saber si ${nombreProveedor} atiende en tu zona.`
                : "Marca en el mapa el lugar exacto del trabajo.")}
          </p>
          {onUsarUbicacion && (
            <button type="button" onClick={onUsarUbicacion} disabled={buscando} className="mt-1.5 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
              {buscando && <Loader2 className="size-4 animate-spin" />}
              {buscando ? "Buscando…" : "Usar mi ubicación"}
            </button>
          )}
        </div>
      </div>
    );
  }

  const km = distanciaKm(zona.centro, punto);
  const dentro = km <= zona.radioKm;
  const quien = sujeto === "ubicacion" ? "Tu ubicación actual" : "La dirección marcada";

  return dentro ? (
    <div role="status" className="mt-3 flex items-start gap-2.5 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
      <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
      <p>
        <strong>{quien} está dentro de su zona de atención</strong> (a {formatearDistancia(km)}; atiende hasta {zona.radioKm} km).
      </p>
    </div>
  ) : (
    <div role="alert" className="mt-3 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-foreground">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
      <p>
        <strong>{quien} está fuera de su zona de atención</strong> (a {formatearDistancia(km)}; atiende hasta {zona.radioKm} km).
        {" "}Confirma con {nombreProveedor} si puede atenderte antes de contratar.
      </p>
    </div>
  );
};

export default AvisoZona;
