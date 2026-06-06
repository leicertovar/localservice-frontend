import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { SolicitudServicioDatos } from "@/services/reservaService";

interface Props {
  solicitudes: SolicitudServicioDatos[];
  isActive: boolean;
}

const ESTADO_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  aceptada:  { color: "#10b981", label: "Aceptada",  bg: "#d1fae5" },
  cotizado:  { color: "#f59e0b", label: "Cotizado",  bg: "#fef3c7" },
  pendiente: { color: "#6C63FF", label: "Pendiente", bg: "#ede9fe" },
};

const crearIconoApp = (estado: string) => {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente;
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:36px;height:36px;
        background:linear-gradient(135deg,#6C63FF,#3b82f6);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 3px 10px rgba(108,99,255,0.45);
        border:2.5px solid white;
      ">
        <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;">
          <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'
            fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
            <path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/>
            <circle cx='12' cy='10' r='3'/>
          </svg>
        </div>
      </div>
      <div style="
        width:6px;height:6px;background:rgba(108,99,255,0.3);
        border-radius:50%;margin:0 auto;margin-top:-1px;
      "></div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -50],
  });
};

const crearContenidoPopup = (sol: SolicitudServicioDatos) => {
  const cfg = ESTADO_CONFIG[sol.estado ?? "pendiente"] ?? ESTADO_CONFIG.pendiente;
  const clienteNombre = sol.cliente
    ? `${sol.cliente.nombre} ${sol.cliente.apellido || ""}`.trim()
    : "Cliente";
  const hora = sol.hora ? ` · ${sol.hora}` : "";
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;min-width:220px;padding:4px 2px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="
          width:32px;height:32px;
          background:linear-gradient(135deg,#6C63FF,#3b82f6);
          border-radius:8px;display:flex;align-items:center;justify-content:center;
          flex-shrink:0;
        ">
          <svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24'
            fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>
            <path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/>
            <circle cx='12' cy='10' r='3'/>
          </svg>
        </div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#1a1a2e;line-height:1.2;">
            ${sol.servicio?.nombre || "Servicio Personalizado"}
          </div>
          ${sol.servicio?.categoria ? `<div style="font-size:11px;color:#94a3b8;">${sol.servicio.categoria}</div>` : ""}
        </div>
      </div>
      <div style="background:#f8fafc;border-radius:8px;padding:10px 12px;margin-bottom:8px;display:flex;flex-direction:column;gap:5px;">
        <div style="display:flex;gap:6px;align-items:center;">
          <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'
            fill='none' stroke='#94a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
            <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/>
          </svg>
          <span style="font-size:12px;color:#334155;">${clienteNombre}</span>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'
            fill='none' stroke='#94a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
            <rect width='18' height='18' x='3' y='4' rx='2' ry='2'/><line x1='16' x2='16' y1='2' y2='6'/>
            <line x1='8' x2='8' y1='2' y2='6'/><line x1='3' x2='21' y1='10' y2='10'/>
          </svg>
          <span style="font-size:12px;color:#334155;">${sol.fecha}${hora}</span>
        </div>
        ${sol.direccion ? `
        <div style="display:flex;gap:6px;align-items:flex-start;">
          <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'
            fill='none' stroke='#94a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style="flex-shrink:0;margin-top:1px;">
            <path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'/><circle cx='12' cy='10' r='3'/>
          </svg>
          <span style="font-size:12px;color:#334155;">${sol.direccion}</span>
        </div>` : ""}
        ${sol.monto_cotizado ? `
        <div style="display:flex;gap:6px;align-items:center;">
          <svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'
            fill='none' stroke='#94a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
            <circle cx='12' cy='12' r='10'/><path d='M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8'/>
            <path d='M12 6v2m0 8v2'/>
          </svg>
          <span style="font-size:12px;font-weight:600;color:#10b981;">${sol.monto_cotizado}</span>
        </div>` : ""}
      </div>
      <div style="
        display:inline-flex;align-items:center;gap:5px;
        background:${cfg.bg};color:${cfg.color};
        font-size:11px;font-weight:700;
        padding:3px 10px;border-radius:20px;
        border:1.5px solid ${cfg.color}40;
      ">
        <span style="width:6px;height:6px;border-radius:50%;background:${cfg.color};display:inline-block;"></span>
        ${cfg.label}
      </div>
    </div>
  `;
};

const MapaSection = ({ solicitudes, isActive }: Props) => {
  const mapRef = useRef<any>(null);

  // Solo mostrar solicitudes activas (excluir completadas y rechazadas)
  const solicitudesActivas = solicitudes.filter(
    sol => sol.estado !== "completada" && sol.estado !== "rechazada" && sol.latitud && sol.longitud
  );

  useEffect(() => {
    if (!isActive) return;

    const t = setTimeout(() => {
      if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; }
      const mapaElement = document.getElementById("mapa-proveedor");
      if (!mapaElement) return;

      const mapa = L.map("mapa-proveedor").setView([3.8801, -77.0707], 13);
      mapRef.current = mapa;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapa);

      solicitudesActivas.forEach(sol => {
        const icono = crearIconoApp(sol.estado ?? "pendiente");
        const popup = L.popup({
          maxWidth: 260,
          className: "localservice-popup",
        }).setContent(crearContenidoPopup(sol));

        L.marker([Number(sol.latitud), Number(sol.longitud)], { icon: icono })
          .addTo(mapa)
          .bindPopup(popup);
      });

      if (solicitudesActivas.length > 0) {
        const coords = solicitudesActivas.map(s => [Number(s.latitud), Number(s.longitud)] as [number, number]);
        mapa.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 15 });
      }
    }, 150);

    return () => clearTimeout(t);
  }, [isActive, solicitudes]);

  useEffect(() => {
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  return (
    <div className="space-y-4">
      <style>{`
        .localservice-popup .leaflet-popup-content-wrapper {
          border-radius: 14px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          padding: 0;
          overflow: hidden;
        }
        .localservice-popup .leaflet-popup-content {
          margin: 14px 14px;
        }
        .localservice-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Mapa de Solicitudes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Solo servicios activos — completados no aparecen</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5">
            <MapPin className="w-3 h-3" />
            {solicitudesActivas.length} activo{solicitudesActivas.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div
          id="mapa-proveedor"
          className="w-full"
          style={{ height: "500px" }}
        />
      </div>

      {solicitudesActivas.length === 0 && (
        <div className="bg-muted/30 rounded-xl p-8 text-center border border-dashed border-border/60">
          <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground font-medium">No hay servicios activos con ubicación</p>
          <p className="text-xs text-muted-foreground mt-1">Los servicios completados o rechazados no se muestran en el mapa</p>
        </div>
      )}
    </div>
  );
};

export default MapaSection;
