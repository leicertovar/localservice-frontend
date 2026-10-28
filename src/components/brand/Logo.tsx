import horizontal from "@/assets/brand/horizontal.svg";
import horizontalInvertido from "@/assets/brand/horizontal-invertido.svg";
import isotipo from "@/assets/brand/isotipo.svg";
import isotipoInvertido from "@/assets/brand/isotipo-invertido.svg";
import logotipo from "@/assets/brand/logotipo.svg";
import logotipoInvertido from "@/assets/brand/logotipo-invertido.svg";
import imagotipo from "@/assets/brand/imagotipo.svg";
import imagotipoInvertido from "@/assets/brand/imagotipo-invertido.svg";

/**
 * horizontal: símbolo + nombre en línea (navbars y encabezados)
 * isotipo:    solo el símbolo (espacios reducidos)
 * logotipo:   solo el nombre
 * imagotipo:  símbolo sobre el nombre (pantallas de bienvenida)
 */
type LogoVariant = "horizontal" | "isotipo" | "logotipo" | "imagotipo";

/**
 * auto:      versión normal en tema claro e invertida en oscuro
 * invertido: siempre la versión invertida (fondos azul marino)
 * blanco:    todo en blanco (fondos azules o degradados donde el azul se pierde)
 */
type LogoTone = "auto" | "invertido" | "blanco";

const ARCHIVOS: Record<LogoVariant, { normal: string; invertido: string }> = {
  horizontal: { normal: horizontal, invertido: horizontalInvertido },
  isotipo: { normal: isotipo, invertido: isotipoInvertido },
  logotipo: { normal: logotipo, invertido: logotipoInvertido },
  imagotipo: { normal: imagotipo, invertido: imagotipoInvertido },
};

/** La altura se controla con className (p. ej. "h-8"); el ancho se ajusta solo. */
export const Logo = ({
  variant = "horizontal",
  tone = "auto",
  className = "h-8",
}: {
  variant?: LogoVariant;
  tone?: LogoTone;
  className?: string;
}) => {
  const { normal, invertido } = ARCHIVOS[variant];

  if (tone !== "auto") {
    return (
      <img
        src={invertido}
        alt="LocalService"
        draggable={false}
        className={`w-auto shrink-0 ${tone === "blanco" ? "brightness-0 invert" : ""} ${className}`}
      />
    );
  }

  return (
    <>
      <img src={normal} alt="LocalService" draggable={false} className={`w-auto shrink-0 dark:hidden ${className}`} />
      <img src={invertido} alt="LocalService" draggable={false} className={`w-auto shrink-0 hidden dark:block ${className}`} />
    </>
  );
};
