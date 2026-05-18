import { Bell, CheckCircle, Clock, MessageCircle, Star, DollarSign, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number;
  type: "request" | "message" | "review" | "payment" | "system" | "verification";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  { id: 1, type: "request", title: "Nueva solicitud de servicio", description: "Ana García solicita reparación de tubería para el sábado 10 de abril.", time: "Hace 5 min", read: false },
  { id: 2, type: "message", title: "Nuevo mensaje", description: "Luis Martínez: '¿A qué hora puedes venir?'", time: "Hace 15 min", read: false },
  { id: 3, type: "payment", title: "Pago recibido", description: "Has recibido $50.000 por el servicio #1024. Transferencia en proceso.", time: "Hace 1 hora", read: false },
  { id: 4, type: "review", title: "Nueva calificación", description: "María Torres te calificó con ⭐⭐⭐⭐⭐ y dejó un comentario.", time: "Hace 2 horas", read: true },
  { id: 5, type: "system", title: "Servicio completado", description: "El servicio 'Limpieza profunda' ha sido marcado como completado.", time: "Hace 3 horas", read: true },
  { id: 6, type: "verification", title: "Documentos aprobados", description: "Tu identidad ha sido verificada exitosamente. Ya puedes recibir solicitudes.", time: "Ayer", read: true },
];

const iconMap = {
  request: Clock,
  message: MessageCircle,
  review: Star,
  payment: DollarSign,
  system: CheckCircle,
  verification: ShieldCheck,
};

const colorMap = {
  request: "text-info bg-info/10",
  message: "text-primary bg-primary/10",
  review: "text-warning bg-warning/10",
  payment: "text-success bg-success/10",
  system: "text-muted-foreground bg-muted",
  verification: "text-primary bg-primary/10",
};

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-[400px] bg-card border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-primary">Marcar todo como leído</Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto divide-y">
          {notifications.map(notif => {
            const Icon = iconMap[notif.type];
            return (
              <div key={notif.id} className={`flex gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!notif.read ? "bg-primary/[0.02]" : ""}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${colorMap[notif.type]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!notif.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{notif.title}</p>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.description}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{notif.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full text-sm text-primary">Ver todas las notificaciones</Button>
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
