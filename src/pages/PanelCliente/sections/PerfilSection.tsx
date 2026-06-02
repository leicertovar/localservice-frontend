import { Phone, MapPin, Home, BarChart2, Mail, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { storageUrl } from "@/lib/api";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  direccion: string;
  foto_perfil: string;
}

interface Props {
  profileData: ProfileData;
  totalSolicitudes: number;
  onOpenEditProfile: () => void;
}

const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-xl">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value || "No especificado"}</p>
    </div>
  </div>
);

const PerfilSection = ({ profileData, totalSolicitudes, onOpenEditProfile }: Props) => {
  const iniciales = profileData.name
    ? profileData.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "CL";

  return (
    <div className="max-w-lg space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Mi Perfil</h2>
      </div>

      <div className="bg-white rounded-2xl border border-border/60 overflow-hidden">
        {/* Header del perfil */}
        <div className="bg-hero p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-18 h-18 ring-4 ring-white/30 shadow-lg" style={{ width: 72, height: 72 }}>
              {profileData.foto_perfil && <AvatarImage src={storageUrl(profileData.foto_perfil)} alt={profileData.name} />}
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {iniciales}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h3 className="text-xl font-bold leading-tight">{profileData.name || "Cliente"}</h3>
              <p className="text-white/70 text-sm mt-0.5">{profileData.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-medium text-white">
                  {totalSolicitudes} solicitud{totalSolicitudes !== 1 ? 'es' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Datos del perfil */}
        <div className="p-5 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Información de contacto</h4>
          <div className="grid gap-2.5">
            <InfoItem icon={Mail} label="Correo electrónico" value={profileData.email} />
            <InfoItem icon={Phone} label="Teléfono" value={profileData.phone} />
            <InfoItem icon={MapPin} label="Ciudad" value={profileData.city} />
            <InfoItem icon={Home} label="Dirección" value={profileData.direccion} />
            <InfoItem icon={BarChart2} label="Servicios solicitados" value={String(totalSolicitudes)} />
          </div>

          <Button
            className="w-full h-10 rounded-xl font-semibold gap-2 mt-4"
            onClick={onOpenEditProfile}
          >
            <Edit2 className="w-4 h-4" />
            Editar Perfil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PerfilSection;
