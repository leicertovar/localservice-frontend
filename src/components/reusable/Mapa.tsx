import { useEffect, useRef, useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_BUENAVENTURA, obtenerUbicacionActual, type Punto } from "@/lib/geo";

interface Props {
  /** Pin principal. Con `onPinChange` se mueve con un clic o arrastrándolo. */
  pin?: Punto | null;
  onPinChange?: (punto: Punto) => void;
  /** Radio de atención del proveedor. */
  circulo?: { centro: Punto; radioKm: number } | null;
  /** Punto azul con la ubicación actual del usuario. */
  ubicacionUsuario?: Punto | null;
  /** Botón "Mi ubicación": mueve el pin (si es editable) o centra el mapa. */
  botonUbicacion?: boolean;
  onErrorUbicacion?: (mensaje: string) => void;
  alto?: number;
  etiqueta: string;
  /** Editable: encuadrar el radio completo cada vez que cambia (zona del proveedor). */
  ajustarAlCirculo?: boolean;
}

const ICONO_PIN = L.divIcon({
  className: "",
  html: '<span style="position:absolute;left:3px;top:0;width:24px;height:24px;border-radius:50% 50% 50% 0;background:#132651;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>',
  iconSize: [30, 40],
  iconAnchor: [15, 38],
});

const ICONO_USUARIO = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#1a75ee;border:3px solid #fff;box-shadow:0 0 0 6px rgba(26,117,238,.25)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const COLOR_ZONA = "#1a75ee";

/** Mapa de OpenStreetMap (Leaflet) con pin editable, radio de atención y ubicación actual. */
const Mapa = ({ pin, onPinChange, circulo, ubicacionUsuario, botonUbicacion = false, onErrorUbicacion, alto = 260, etiqueta, ajustarAlCirculo = false }: Props) => {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const marcador = useRef<L.Marker | null>(null);
  const zona = useRef<L.Circle | null>(null);
  const usuario = useRef<L.Marker | null>(null);
  const alCambiarPin = useRef(onPinChange);
  alCambiarPin.current = onPinChange;
  const [buscando, setBuscando] = useState(false);
  const editable = Boolean(onPinChange);

  /** Solo lectura: que se vean a la vez el radio, el pin y la ubicación del usuario. */
  const encuadrar = () => {
    const m = mapa.current;
    if (!m || editable) return;
    const puntos: L.LatLngExpression[] = [];
    if (marcador.current) puntos.push(marcador.current.getLatLng());
    if (usuario.current) puntos.push(usuario.current.getLatLng());
    const limites = zona.current ? zona.current.getBounds() : puntos.length ? L.latLngBounds(puntos) : null;
    if (!limites) return;
    puntos.forEach(p => limites.extend(p));
    m.fitBounds(limites, { padding: [16, 16], maxZoom: 15 });
  };
  const encuadrarRef = useRef(encuadrar);
  encuadrarRef.current = encuadrar;

  useEffect(() => {
    if (!contenedor.current) return;
    const inicio = pin ?? circulo?.centro ?? CENTRO_BUENAVENTURA;
    const m = L.map(contenedor.current).setView([inicio.lat, inicio.lng], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    m.on("click", (e: L.LeafletMouseEvent) => alCambiarPin.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
    mapa.current = m;
    // Al tomar su tamaño real (Ionic pinta la página después) se vuelve a encuadrar
    const observador = new ResizeObserver(() => {
      m.invalidateSize();
      encuadrarRef.current();
    });
    observador.observe(contenedor.current);
    return () => {
      observador.disconnect();
      m.remove();
      mapa.current = null;
      marcador.current = null;
      zona.current = null;
      usuario.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    if (!pin) {
      marcador.current?.remove();
      marcador.current = null;
      return;
    }
    if (!marcador.current) {
      marcador.current = L.marker([pin.lat, pin.lng], { icon: ICONO_PIN, draggable: editable, keyboard: false }).addTo(m);
      marcador.current.on("dragend", () => {
        const p = marcador.current!.getLatLng();
        alCambiarPin.current?.({ lat: p.lat, lng: p.lng });
      });
    } else {
      marcador.current.setLatLng([pin.lat, pin.lng]);
    }
    if (!editable) encuadrar();
    else if (!m.getBounds().pad(-0.1).contains([pin.lat, pin.lng])) m.panTo([pin.lat, pin.lng]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, editable]);

  const radio = circulo?.radioKm;
  const centroLat = circulo?.centro.lat;
  const centroLng = circulo?.centro.lng;
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    if (centroLat === undefined || centroLng === undefined || !radio) {
      zona.current?.remove();
      zona.current = null;
      return;
    }
    if (!zona.current) {
      zona.current = L.circle([centroLat, centroLng], {
        radius: radio * 1000,
        color: COLOR_ZONA,
        weight: 2,
        fillColor: COLOR_ZONA,
        fillOpacity: 0.12,
        interactive: false,
      }).addTo(m);
    } else {
      zona.current.setLatLng([centroLat, centroLng]).setRadius(radio * 1000);
    }
    if (editable && ajustarAlCirculo) m.fitBounds(zona.current.getBounds(), { padding: [12, 12] });
    encuadrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centroLat, centroLng, radio, editable, ajustarAlCirculo]);

  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    if (!ubicacionUsuario) {
      usuario.current?.remove();
      usuario.current = null;
      return;
    }
    if (!usuario.current) {
      usuario.current = L.marker([ubicacionUsuario.lat, ubicacionUsuario.lng], { icon: ICONO_USUARIO, interactive: false, keyboard: false }).addTo(m);
    } else {
      usuario.current.setLatLng([ubicacionUsuario.lat, ubicacionUsuario.lng]);
    }
    encuadrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubicacionUsuario, editable]);

  const usarUbicacion = async () => {
    setBuscando(true);
    try {
      const p = await obtenerUbicacionActual();
      mapa.current?.setView([p.lat, p.lng], Math.max(mapa.current.getZoom(), 16));
      alCambiarPin.current?.(p);
    } catch (mensaje) {
      onErrorUbicacion?.(String(mensaje));
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="relative isolate z-0 w-full overflow-hidden rounded-xl border bg-muted" style={{ height: alto }}>
      {/* Posición en línea: Leaflet la lee al crearse y, si el CSS aún no cargó, pondría "relative" (alto 0) */}
      <div ref={contenedor} className="absolute inset-0" style={{ position: "absolute", inset: 0 }} role="application" aria-label={etiqueta} />
      {botonUbicacion && (
        <button
          type="button"
          onClick={usarUbicacion}
          disabled={buscando}
          className="absolute bottom-6 right-3 z-[1000] inline-flex h-9 items-center gap-1.5 rounded-full bg-card px-3.5 text-sm font-semibold text-primary shadow-md hover:bg-muted disabled:opacity-70"
        >
          {buscando ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
          {buscando ? "Buscando…" : "Mi ubicación"}
        </button>
      )}
    </div>
  );
};

export default Mapa;
