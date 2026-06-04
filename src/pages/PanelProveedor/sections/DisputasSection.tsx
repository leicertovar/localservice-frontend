import { useState } from "react";
import { AlertTriangle, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { aportarEvidenciaProveedor, SolicitudServicioDatos } from "@/services/reservaService";
import { storageUrl } from "@/lib/api";

interface Props {
  disputasActivas: SolicitudServicioDatos[];
  onRefresh: () => void;
}

const DisputasSection = ({ disputasActivas, onRefresh }: Props) => {
  const [disputaDialogId, setDisputaDialogId] = useState<number | null>(null);
  const [disputaDescripcion, setDisputaDescripcion] = useState("");
  const [disputaEvidencia, setDisputaEvidencia] = useState<File | null>(null);
  const [enviandoEvidencia, setEnviandoEvidencia] = useState(false);
  const { toast } = useToast();

  const cerrarDialog = () => {
    setDisputaDialogId(null);
    setDisputaDescripcion("");
    setDisputaEvidencia(null);
  };

  const enviarEvidenciaDisputa = async () => {
    if (!disputaDialogId || !disputaDescripcion.trim() || !disputaEvidencia) {
      toast({
        title: "Campos incompletos",
        description: "Debes escribir una descripción y adjuntar un archivo de evidencia.",
        variant: "destructive",
      });
      return;
    }
    setEnviandoEvidencia(true);
    try {
      await aportarEvidenciaProveedor(disputaDialogId, disputaDescripcion, disputaEvidencia);
      toast({ title: "Evidencia enviada", description: "El administrador revisará la disputa y tomará la decisión final." });
      cerrarDialog();
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.mensaje || "No se pudo enviar la evidencia.", variant: "destructive" });
    } finally {
      setEnviandoEvidencia(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">Disputas Activas</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Un cliente rechazó estos servicios. Debes aportar tu evidencia para que el administrador tome la decisión final.
      </p>
      {disputasActivas.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
          No tienes disputas activas.
        </div>
      ) : (
        disputasActivas.map(s => (
          <div key={s.id} className="bg-card rounded-xl border border-destructive/20 p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{s.servicio?.nombre || "Servicio Personalizado"}</p>
                <p className="text-xs text-muted-foreground">
                  Cliente: {s.cliente ? `${s.cliente.nombre} ${s.cliente.apellido || ""}` : "—"} · Fecha: {s.fecha}
                </p>
              </div>
              <span className="text-xs bg-destructive/10 text-destructive font-medium px-2 py-0.5 rounded-full">
                En disputa
              </span>
            </div>
            {s.queja_cliente && (
              <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/10">
                <p className="text-xs font-semibold text-destructive mb-1">Motivo del cliente:</p>
                <p className="text-sm text-foreground">{s.queja_cliente}</p>
              </div>
            )}
            {s.evidencia_cliente && (
              <a
                href={storageUrl(s.evidencia_cliente)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-primary underline"
              >
                <FileText className="w-3.5 h-3.5" />Ver evidencia del cliente
              </a>
            )}
            <Button size="sm" className="gap-2 bg-primary" onClick={() => setDisputaDialogId(s.id)}>
              <Upload className="w-4 h-4" />Aportar mi evidencia
            </Button>
          </div>
        ))
      )}

      <Dialog open={disputaDialogId !== null} onOpenChange={open => { if (!open) cerrarDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />Aportar Evidencia
            </DialogTitle>
            <DialogDescription>
              Describe qué hiciste y adjunta tu evidencia (foto o PDF). El administrador tomará la decisión final.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Tu descripción del trabajo realizado</Label>
              <Textarea
                placeholder="Explica en detalle qué trabajo realizaste, cuándo y cómo..."
                rows={4}
                value={disputaDescripcion}
                onChange={e => setDisputaDescripcion(e.target.value)}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Evidencia (foto o PDF — obligatorio)</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={e => setDisputaEvidencia(e.target.files?.[0] || null)}
              />
              {disputaEvidencia && <p className="text-[11px] text-success">✓ {disputaEvidencia.name}</p>}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={enviarEvidenciaDisputa}
              disabled={enviandoEvidencia || !disputaDescripcion.trim() || !disputaEvidencia}
            >
              {enviandoEvidencia ? "Enviando..." : "Enviar evidencia al admin"}
            </Button>
            <Button variant="outline" onClick={cerrarDialog}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisputasSection;
