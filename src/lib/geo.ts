// Utilidades de ubicación para los mapas (las mismas reglas que en la app móvil).

export interface Punto {
  lat: number;
  lng: number;
}

/** Centro de Buenaventura: vista inicial cuando aún no hay un punto marcado. */
export const CENTRO_BUENAVENTURA: Punto = { lat: 3.8801, lng: -77.0707 };

/** Radio máximo de atención de un proveedor. */
export const RADIO_MAX_KM = 30;

/** Distancia en km entre dos puntos (fórmula de Haversine). */
export const distanciaKm = (a: Punto, b: Punto): number => {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

/** 3.24 → "3,2 km"; 0.4 → "400 m" */
export const formatearDistancia = (km: number): string =>
  km < 1 ? `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m` : `${km.toLocaleString("es-CO", { maximumFractionDigits: 1 })} km`;

/** Punto a partir de latitud/longitud del backend (pueden venir como texto o null). */
export const aPunto = (lat?: number | string | null, lng?: number | string | null): Punto | null => {
  if (lat === null || lat === undefined || lng === null || lng === undefined || lat === "" || lng === "") return null;
  const p = { lat: Number(lat), lng: Number(lng) };
  return Number.isFinite(p.lat) && Number.isFinite(p.lng) ? p : null;
};

/** Ubicación actual del navegador; rechaza con un mensaje para el usuario. */
export const obtenerUbicacionActual = (): Promise<Punto> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Tu navegador no permite compartir la ubicación. Marca el punto en el mapa.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      (err) =>
        reject(
          err.code === err.PERMISSION_DENIED
            ? "Permite el acceso a tu ubicación en el navegador para usarla."
            : "No pudimos obtener tu ubicación. Marca el punto en el mapa."
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 120000 }
    );
  });
