import { useEffect, useState } from "react";
import { Bell, CheckCircle, Clock, MessageCircle, Star, DollarSign, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { obtenerNotificaciones, marcarTodasLeidas, marcarLeida, type Notificacion } from "@/services/notificacionService";

const iconMap: Record<string, any> = {
  solicitud: Clock,
  mensaje: MessageCircle,
  resena: Star,
  pago: DollarSign,
  sistema: CheckCircle,
  verificacion: ShieldCheck,
};

const colorMap: Record<string, string> = {
  solicitud: "text-info bg-info/10",
  mensaje: "text-primary bg-primary/10",
  resena: "text-warning bg-warning/10",
  pago: "text-success bg-success/10",
  sistema: "text-muted-foreground bg-muted",
  verificacion: "text-primary bg-primary/10",
};

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

const NotificationsPanel = ({ isOpen, onClose, onCountChange }: NotificationsPanelProps) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    try {
      setCargando(true);
      const res = await obtenerNotificaciones();
      setNotificaciones(res.notificaciones);
      onCountChange?.(res.no_leidas);
    } catch {
      // Si no hay token o falla la API, silenciar
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (isOpen) cargar();
  }, [isOpen]);

  // Polling cada 30s cuando el panel está abierto
  useEffect(() => {
    if (!isOpen) return;
    const intervalo = setInterval(cargar, 30000);
    return () => clearInterval(intervalo);
  }, [isOpen]);

  const handleMarcarTodas = async () => {
    await marcarTodasLeidas();
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    onCountChange?.(0);
  };

  const handleMarcarUna = async (id: number) => {
    await marcarLeida(id);
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    const nuevasNoLeidas = notificaciones.filter(n => n.id !== id && !n.leida).length;
    onCountChange?.(nuevasNoLeidas);
  };

  const formatearTiempo = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora mismo";
    if (mins < 60) return `Hace ${mins} min`;
    const horas = Math.floor(mins / 60);
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    return `Hace ${Math.floor(horas / 24)} día(s)`;
  };

  if (!isOpen) return null;

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-[400px] bg-card border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notificaciones</h3>
            {noLeidas > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0">{noLeidas}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {noLeidas > 0 && (
              <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={handleMarcarTodas}>
                Marcar todo como leído
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto divide-y">
          {cargando ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Cargando notificaciones...</div>
          ) : notificaciones.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No tienes notificaciones</p>
            </div>
          ) : notificaciones.map(notif => {
            const Icon = iconMap[notif.tipo] ?? CheckCircle;
            const color = colorMap[notif.tipo] ?? "text-muted-foreground bg-muted";
            return (
              <div
                key={notif.id}
                className={`flex gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notif.leida ? "bg-primary/[0.02]" : ""}`}
                onClick={() => !notif.leida && handleMarcarUna(notif.id)}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!notif.leida ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{notif.titulo}</p>
                    {!notif.leida && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.descripcion}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{formatearTiempo(notif.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full text-sm text-primary" onClick={cargar}>
            Actualizar
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
