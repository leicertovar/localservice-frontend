import { Search, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  servicesRequested?: number;
  doc_cedula?: string | null;
  doc_rut?: string | null;
  doc_diploma?: string | null;
  categoria_servicio?: string | null;
}

interface Props {
  filteredUsers: UserData[];
  searchUsers: string;
  onSearchChange: (value: string) => void;
  onViewUser: (user: UserData) => void;
  onDeleteUser: (user: UserData) => void;
}

const UsuariosSection = ({ filteredUsers, searchUsers, onSearchChange, onViewUser, onDeleteUser }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Gestión de Usuarios</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o correo..."
            className="pl-10"
            value={searchUsers}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Rol</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Registro</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-muted font-bold text-foreground">
                          {u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs ${u.status === "Activo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewUser(u)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDeleteUser(u)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    No se encontraron usuarios registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsuariosSection;
