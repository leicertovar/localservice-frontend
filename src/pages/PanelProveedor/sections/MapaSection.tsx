import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { SolicitudServicioDatos } from "@/services/reservaService";

interface Props {
  solicitudes: SolicitudServicioDatos[];
  isActive: boolean;
}

const MapaSection = ({ solicitudes, isActive }: Props) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!isActive) return;

    const t = setTimeout(() => {
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
      const mapaElement = document.getElementById("mapa-proveedor");
      if (!mapaElement) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const mapa = L.map("mapa-proveedor").setView([3.8801, -77.0707], 13);
      mapRef.current = mapa;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" }).addTo(mapa);

      solicitudes.forEach(sol => {
        if (sol.latitud && sol.longitud) {
          const clienteNombre = sol.cliente ? `${sol.cliente.nombre} ${sol.cliente.apellido || ""}` : "Cliente";
          const colorEstado = sol.estado === "aceptada" ? "#10b981" : sol.estado === "cotizado" ? "#f59e0b" : "#3b82f6";
          L.marker([Number(sol.latitud), Number(sol.longitud)])
            .addTo(mapa)
            .bindPopup(
              `<strong style="color:${colorEstado}">${sol.servicio?.nombre || "Servicio"}</strong><br><b>Cliente:</b> ${clienteNombre}<br><b>Estado:</b> ${sol.estado}`
            );
        }
      });
    }, 150);

    return () => clearTimeout(t);
  }, [isActive, solicitudes]);

  useEffect(() => {
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Mapa de Solicitudes</h2>
        <Badge variant="outline" className="text-xs">Leaflet & OpenStreetMap</Badge>
      </div>
      <div className="bg-card border rounded-xl p-4">
        <div
          id="mapa-proveedor"
          className="w-full h-[500px] rounded-lg overflow-hidden border shadow-inner"
          style={{ minHeight: "450px" }}
        />
      </div>
    </div>
  );
};

export default MapaSection;
