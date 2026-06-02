import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { storageUrl } from "@/lib/api";
import { ServicioDatos } from "@/services/proveedorService";

const horarioPorDefecto: Record<string, string> = {
  Lunes: "8:00 AM - 6:00 PM",
  Martes: "8:00 AM - 6:00 PM",
  Miércoles: "8:00 AM - 6:00 PM",
  Jueves: "8:00 AM - 6:00 PM",
  Viernes: "8:00 AM - 6:00 PM",
  Sábado: "9:00 AM - 1:00 PM",
  Domingo: "No disponible",
};

const normalizarHorario = (horario: any): Record<string, string> => {
  if (!horario) return { ...horarioPorDefecto };
  if (typeof horario === "object" && !Array.isArray(horario)) return { ...horarioPorDefecto, ...horario };
  if (typeof horario === "string") {
    try {
      const obj = JSON.parse(horario);
      if (typeof obj === "object" && obj !== null) return { ...horarioPorDefecto, ...obj };
    } catch {}
  }
  return { ...horarioPorDefecto };
};

interface ProfileData {
  name: string;
  apellido: string;
  email: string;
  phone: string;
  ciudad: string;
  title: string;
  biografia: string;
  anios_experiencia: number;
  precio_por_hora: number;
  habilidades: string;
  horario_atencion: Record<string, string>;
  esta_verificado: boolean;
  foto_perfil: string;
}

interface Props {
  profileData: ProfileData;
  misServicios: ServicioDatos[];
  onEditarPerfil: () => void;
}

const PerfilSection = ({ profileData, misServicios, onEditarPerfil }: Props) => (
  <div className="max-w-lg space-y-6">
    <h2 className="text-lg font-semibold text-foreground">Mi Perfil de Proveedor</h2>
    <div className="bg-card rounded-xl border p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          {profileData.foto_perfil && (
            <AvatarImage src={storageUrl(profileData.foto_perfil)} alt={profileData.name} />
          )}
          <AvatarFallback className="bg-accent text-accent-foreground text-xl">
            {profileData.name
              ? profileData.name[0] + (profileData.apellido ? profileData.apellido[0] : "")
              : "PV"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-foreground text-lg">{profileData.name} {profileData.apellido}</h3>
          <p className="text-sm text-muted-foreground">{profileData.title}</p>
          <Badge
            variant={profileData.esta_verificado ? "default" : "secondary"}
            className={`mt-1 text-xs ${profileData.esta_verificado ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
          >
            {profileData.esta_verificado ? "Verificado ✓" : "Pendiente de verificación"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Email</label>
          <p className="text-sm font-medium text-foreground">{profileData.email}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Teléfono</label>
          <p className="text-sm font-medium text-foreground">{profileData.phone || "No especificado"}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Servicios activos</label>
          <p className="text-sm font-medium text-foreground">{misServicios.filter(s => s.esta_activo).length}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Años de experiencia</label>
          <p className="text-sm font-medium text-foreground">{profileData.anios_experiencia} años</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Precio por hora</label>
          <p className="text-sm font-medium text-foreground">${profileData.precio_por_hora.toLocaleString()}/hora</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Ciudad</label>
          <p className="text-sm font-medium text-foreground">{profileData.ciudad || "No especificada"}</p>
        </div>

        <div className="col-span-2 border-t pt-3 mt-1">
          <label className="text-xs text-muted-foreground font-semibold">Horario de atención semanal</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {Object.entries(normalizarHorario(profileData.horario_atencion)).map(([dia, horas]) => (
              <div key={dia} className="bg-muted p-2 rounded text-[11px] border">
                <span className="font-semibold block text-foreground">{dia}</span>
                <span className="text-muted-foreground">{horas as string}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <label className="text-xs text-muted-foreground">Habilidades</label>
          <p className="text-sm font-medium text-foreground">{profileData.habilidades || "Ninguna"}</p>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground">Biografía</label>
          <p className="text-sm text-muted-foreground">{profileData.biografia || "Sin biografía"}</p>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={onEditarPerfil}>
        Editar Perfil
      </Button>
    </div>
  </div>
);

export default PerfilSection;
