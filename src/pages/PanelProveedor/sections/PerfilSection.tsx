import { useState } from "react";
import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ZonaTrabajoCampos, { zonaInicial, type ZonaTrabajo } from "@/components/reusable/ZonaTrabajoCampos";
import { actualizarZonaProveedor } from "@/services/proveedorService";
import { mensajeError } from "@/lib/solicitudes";
import type { UserProfile } from "@/services/authService";
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
  radio_cobertura_km: number | null;
  barrios_cobertura: string[];
}

interface Props {
  profileData: ProfileData;
  misServicios: ServicioDatos[];
  onEditarPerfil: () => void;
  /** Recibe el usuario actualizado tras guardar la zona. */
  onZonaGuardada: (usuario: UserProfile) => void;
}

const PerfilSection = ({ profileData, misServicios, onEditarPerfil, onZonaGuardada }: Props) => {
  const { toast } = useToast();
  const [editandoZona, setEditandoZona] = useState(false);
  const [zona, setZona] = useState<ZonaTrabajo>(zonaInicial());
  const [errorZona, setErrorZona] = useState<string>();
  const [guardandoZona, setGuardandoZona] = useState(false);

  const abrirZona = () => {
    setZona(zonaInicial(profileData.ciudad, profileData.radio_cobertura_km, profileData.barrios_cobertura));
    setErrorZona(undefined);
    setEditandoZona(true);
  };

  const guardarZona = async () => {
    if (zona.barrios.length === 0) {
      setErrorZona("Elige al menos un barrio donde atiendes.");
      return;
    }
    setGuardandoZona(true);
    try {
      const { usuario } = await actualizarZonaProveedor({
        ciudad: zona.ciudad,
        radio_cobertura_km: zona.radio,
        barrios_cobertura: zona.barrios,
      });
      onZonaGuardada(usuario);
      setEditandoZona(false);
      toast({ title: "Zona de trabajo actualizada", description: "Los clientes la verán en tu perfil." });
    } catch (err) {
      setErrorZona(mensajeError(err, "No se pudo guardar la zona."));
    } finally {
      setGuardandoZona(false);
    }
  };

  return (
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
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />Zona de trabajo
            </label>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={abrirZona}>Editar zona</Button>
          </div>
          {profileData.barrios_cobertura.length > 0 ? (
            <>
              <p className="text-sm font-medium text-foreground mt-1">
                {profileData.radio_cobertura_km ? `Te desplazas hasta ${profileData.radio_cobertura_km} km` : "Radio sin definir"}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {profileData.barrios_cobertura.map(b => (
                  <span key={b} className="rounded-full border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">{b}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Aún no indicas en qué barrios atiendes. Los clientes lo ven en tu perfil.</p>
          )}
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

    <Dialog open={editandoZona} onOpenChange={setEditandoZona}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mi zona de trabajo</DialogTitle>
          <DialogDescription>Los clientes verán en tu perfil hasta dónde te desplazas y en qué barrios atiendes.</DialogDescription>
        </DialogHeader>
        <ZonaTrabajoCampos
          valor={zona}
          onChange={nueva => {
            setZona(nueva);
            if (nueva.barrios.length) setErrorZona(undefined);
          }}
          error={errorZona}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setEditandoZona(false)} disabled={guardandoZona}>Cancelar</Button>
          <Button onClick={guardarZona} disabled={guardandoZona}>{guardandoZona ? "Guardando…" : "Guardar zona"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
  );
};

export default PerfilSection;
