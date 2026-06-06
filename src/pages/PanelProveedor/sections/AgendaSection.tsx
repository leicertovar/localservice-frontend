import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock, Calendar, MessageCircle, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SolicitudServicioDatos } from "@/services/reservaService";

const DIAS_CABECERA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Props {
  solicitudes: SolicitudServicioDatos[];
  onCompletar: (id: number) => void;
  onAbrirChat: (nombre: string, id: string) => void;
}

const AgendaSection = ({ solicitudes, onCompletar, onAbrirChat }: Props) => {
  const hoy = new Date();
  const [mesCalendario, setMesCalendario] = useState(hoy.getMonth());
  const [anioCalendario, setAnioCalendario] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);

  const getDiasEnMes = (mes: number, anio: number) => new Date(anio, mes + 1, 0).getDate();
  const getPrimerDiaSemana = (mes: number, anio: number) => {
    const dia = new Date(anio, mes, 1).getDay();
    return dia === 0 ? 6 : dia - 1;
  };

  const obtenerReservasDia = (dia: number) =>
    solicitudes.filter(sol => {
      if (sol.estado !== "aceptada") return false;
      const f = new Date(sol.fecha + "T00:00:00");
      return f.getDate() === dia && f.getMonth() === mesCalendario && f.getFullYear() === anioCalendario;
    });

  const serviciosAgendados = solicitudes.filter(sol => sol.estado === "aceptada");
  const serviciosFiltrados = diaSeleccionado
    ? serviciosAgendados.filter(sol => {
        const f = new Date(sol.fecha + "T00:00:00");
        return (
          f.getDate() === diaSeleccionado &&
          f.getMonth() === mesCalendario &&
          f.getFullYear() === anioCalendario
        );
      })
    : serviciosAgendados;

  const diasEnMes = getDiasEnMes(mesCalendario, anioCalendario);
  const primerDia = getPrimerDiaSemana(mesCalendario, anioCalendario);
  const hoyDia = hoy.getDate();
  const hoyMes = hoy.getMonth();
  const hoyAnio = hoy.getFullYear();

  const navMesAnterior = () => {
    if (mesCalendario === 0) { setMesCalendario(11); setAnioCalendario(a => a - 1); }
    else setMesCalendario(m => m - 1);
    setDiaSeleccionado(null);
  };
  const navMesSiguiente = () => {
    if (mesCalendario === 11) { setMesCalendario(0); setAnioCalendario(a => a + 1); }
    else setMesCalendario(m => m + 1);
    setDiaSeleccionado(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Mi Agenda y Servicios Programados</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={navMesAnterior}><ChevronLeft className="w-4 h-4" /></Button>
            <h3 className="font-semibold text-foreground text-sm">{MESES[mesCalendario]} {anioCalendario}</h3>
            <Button variant="ghost" size="icon" onClick={navMesSiguiente}><ChevronRight className="w-4 h-4" /></Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DIAS_CABECERA.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: primerDia }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: diasEnMes }).map((_, i) => {
              const dia = i + 1;
              const reservasDia = obtenerReservasDia(dia);
              const tieneReservas = reservasDia.length > 0;
              const esHoy = dia === hoyDia && mesCalendario === hoyMes && anioCalendario === hoyAnio;
              const esSeleccionado = diaSeleccionado === dia;
              let diaClase = "hover:bg-muted text-foreground";
              if (esHoy && !esSeleccionado) diaClase = "ring-2 ring-primary/50 text-primary font-bold";
              if (tieneReservas && !esSeleccionado) diaClase = "bg-primary/20 text-primary border border-primary font-bold";
              if (esSeleccionado) diaClase = "bg-primary text-primary-foreground font-bold shadow-md";
              return (
                <button
                  key={dia}
                  onClick={() => setDiaSeleccionado(esSeleccionado ? null : dia)}
                  className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-all relative ${diaClase}`}
                >
                  <span>{dia}</span>
                  {tieneReservas && !esSeleccionado && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary/20 border border-primary" /><span>Con servicios</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-primary" /><span>Seleccionado</span>
            </div>
            {mesCalendario === hoyMes && anioCalendario === hoyAnio && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded ring-2 ring-primary/50" /><span>Hoy</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground text-sm">
              {diaSeleccionado
                ? `${diaSeleccionado} de ${MESES[mesCalendario]}`
                : "Próximos servicios"}
            </h4>
            {serviciosFiltrados.length > 0 && (
              <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">
                {serviciosFiltrados.length}
              </Badge>
            )}
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5">
            {serviciosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-muted/20 rounded-xl border border-dashed border-border/60">
                <Calendar className="w-7 h-7 text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">
                  Sin servicios {diaSeleccionado ? "ese día" : "programados"}
                </p>
              </div>
            ) : (
              serviciosFiltrados.map(sol => {
                const hoyStr = new Date().toISOString().split("T")[0];
                const puedCompletar = !sol.fecha || hoyStr >= sol.fecha;
                const clienteNombre = sol.cliente
                  ? `${sol.cliente.nombre} ${sol.cliente.apellido || ""}`.trim()
                  : "Cliente";
                const fechaFormato = sol.fecha
                  ? new Date(sol.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
                  : "";

                return (
                  <div key={sol.id} className="bg-card border border-border/60 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
                    {/* Cabecera */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {sol.servicio?.nombre || "Servicio Personalizado"}
                        </p>
                      </div>
                      <Badge className="text-[10px] bg-success/10 text-success border border-success/20 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                        Confirmado
                      </Badge>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{clienteNombre}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{fechaFormato}{sol.hora ? ` · ${sol.hora}` : ""}</span>
                      </div>
                      {sol.direccion && (
                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{sol.direccion}</span>
                        </div>
                      )}
                      {sol.monto_cotizado && (
                        <p className="text-xs font-semibold text-success">{sol.monto_cotizado}</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-1.5 pt-2 border-t border-border/40">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs gap-1 border-border/60"
                        onClick={() =>
                          sol.cliente &&
                          onAbrirChat(`${sol.cliente.nombre} ${sol.cliente.apellido || ""}`, sol.cliente.id)
                        }
                      >
                        <MessageCircle className="w-3 h-3" />
                        Chat
                      </Button>
                      {puedCompletar ? (
                        <Button
                          size="sm"
                          className="flex-1 h-7 text-xs gap-1 bg-success hover:bg-success/90 text-white"
                          onClick={() => sol.id && onCompletar(sol.id)}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Completar
                        </Button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-[10px] text-muted-foreground">
                            Disponible desde {new Date(sol.fecha + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaSection;
