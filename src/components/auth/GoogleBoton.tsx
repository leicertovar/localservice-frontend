import { useEffect, useRef, useState } from "react";

/** Tipos mínimos de Google Identity Services (https://accounts.google.com/gsi/client). */
interface GoogleId {
  initialize: (opciones: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: "popup" }) => void;
  renderButton: (
    elemento: HTMLElement,
    opciones: { theme?: string; size?: string; text?: string; shape?: string; width?: number; locale?: string; logo_alignment?: string }
  ) => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT = "https://accounts.google.com/gsi/client";

let carga: Promise<void> | null = null;
/** Carga el script de Google una sola vez. */
const cargarGoogle = () => {
  carga ??= new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      carga = null;
      reject(new Error("No se pudo cargar Google"));
    };
    document.head.appendChild(script);
  });
  return carga;
};

interface Props {
  /** Recibe el idToken de Google para enviarlo al backend. */
  onCredencial: (idToken: string) => void;
  texto?: "continue_with" | "signup_with" | "signin_with";
  deshabilitado?: boolean;
}

/**
 * Botón oficial "Continuar con Google" (logo y colores de Google).
 * Si falta VITE_GOOGLE_CLIENT_ID no se muestra.
 */
const GoogleBoton = ({ onCredencial, texto = "continue_with", deshabilitado = false }: Props) => {
  const contenedor = useRef<HTMLDivElement>(null);
  const alRecibir = useRef(onCredencial);
  alRecibir.current = onCredencial;
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let activo = true;
    cargarGoogle()
      .then(() => {
        const id = window.google?.accounts.id;
        if (!activo || !id || !contenedor.current) return;
        id.initialize({ client_id: CLIENT_ID, callback: r => alRecibir.current(r.credential), ux_mode: "popup" });
        id.renderButton(contenedor.current, {
          theme: "outline",
          size: "large",
          text: texto,
          shape: "pill",
          logo_alignment: "center",
          locale: "es",
          width: Math.min(400, contenedor.current.offsetWidth || 400),
        });
      })
      .catch(() => activo && setError(true));
    return () => {
      activo = false;
    };
  }, [texto]);

  if (!CLIENT_ID) return null;
  if (error) {
    return <p className="text-center text-xs text-muted-foreground">No pudimos cargar el inicio de sesión con Google. Revisa tu conexión.</p>;
  }
  return (
    <div
      ref={contenedor}
      className={`flex min-h-11 w-full justify-center ${deshabilitado ? "pointer-events-none opacity-60" : ""}`}
      aria-busy={deshabilitado}
    />
  );
};

export default GoogleBoton;
