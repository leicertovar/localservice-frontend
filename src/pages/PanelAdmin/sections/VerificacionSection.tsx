import { CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserData {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: string;
  date: string;
  phone: string;
  city: string;
  verified?: boolean;
  completedJobs?: number;
  rating?: number;
  categoria_servicio?: string | null;
  doc_cedula?: string | null;
  doc_rut?: string | null;
  doc_diploma?: string | null;
}

interface Props {
  pendingVerifications: UserData[];
  onVerify: (userId: string | number) => void;
  onReject: (userId: string | number) => void;
  onViewDocs: (user: UserData) => void;
}

const VerificacionSection = ({ pendingVerifications, onVerify, onReject, onViewDocs }: Props) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Verificación de Proveedores</h2>

      {pendingVerifications.length === 0 ? (
        <div className="bg-card rounded-xl border p-8 text-center">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <p className="text-foreground font-medium text-lg">¡Todo al día!</p>
          <p className="text-sm text-muted-foreground mt-1">
            No hay solicitudes de proveedores pendientes de verificación comercial.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingVerifications.map(p => (
            <div key={p.id} className="bg-card rounded-xl border p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-warning/10 text-warning font-bold text-lg">
                      {p.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{p.name}</h3>
                      <Badge variant="outline" className="text-[10px]">{p.categoria_servicio || "Proveedor"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{p.email}</p>
                    <p className="text-xs text-muted-foreground">Registrado: {p.date}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => onViewDocs(p)}>
                    <Eye className="w-4 h-4" />Ver documento
                  </Button>
                  <Button size="sm" className="gap-1 bg-success hover:bg-success/90" onClick={() => onVerify(p.id)}>
                    <CheckCircle className="w-4 h-4" />Aprobar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => onReject(p.id)}>
                    <XCircle className="w-4 h-4" />Rechazar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerificacionSection;
