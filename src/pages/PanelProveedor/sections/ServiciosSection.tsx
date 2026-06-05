import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  alternarEstadoServicio,
  ServicioDatos,
} from "@/services/proveedorService";

const CATEGORIAS_SERVICIO = ["Plomería", "Electricidad", "Limpieza", "Pintura", "Jardinería", "Tecnología", "Otro"];

interface Props {
  misServicios: ServicioDatos[];
  onRefresh: () => void;
}

const ServiciosSection = ({ misServicios, onRefresh }: Props) => {
  const [mostrarNuevoServicio, setMostrarNuevoServicio] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("Plomería");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [servicioEditId, setServicioEditId] = useState<number | null>(null);
  const [datosEditServicio, setDatosEditServicio] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const { toast } = useToast();

  const crearNuevoServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoPrecio) {
      toast({ title: "Campos incompletos", variant: "destructive" });
      return;
    }
    try {
      await crearServicio({ nombre: nuevoNombre, precio: nuevoPrecio, categoria: nuevaCategoria, descripcion: nuevaDescripcion });
      toast({ title: "Servicio creado" });
      setMostrarNuevoServicio(false);
      setNuevoNombre("");
      setNuevoPrecio("");
      setNuevaCategoria("Plomería");
      setNuevaDescripcion("");
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.mensaje, variant: "destructive" });
    }
  };

  const abrirEditarServicio = (servicio: ServicioDatos) => {
    if (!servicio.id) return;
    setDatosEditServicio({
      name: servicio.nombre,
      price: servicio.precio,
      category: servicio.categoria,
      description: servicio.descripcion || "",
    });
    setServicioEditId(servicio.id);
  };

  const guardarServicioEditado = async () => {
    if (!servicioEditId) return;
    try {
      await actualizarServicio(servicioEditId, {
        nombre: datosEditServicio.name,
        precio: datosEditServicio.price,
        categoria: datosEditServicio.category,
        descripcion: datosEditServicio.description,
      });
      setServicioEditId(null);
      toast({ title: "Servicio actualizado" });
      onRefresh();
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.mensaje, variant: "destructive" });
    }
  };

  const cambiarEstadoServicio = async (id: number) => {
    try {
      const res = await alternarEstadoServicio(id);
      toast({ title: res.servicio.esta_activo ? "Servicio activado" : "Servicio desactivado" });
      onRefresh();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const removerServicio = async (id: number) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      await eliminarServicio(id);
      toast({ title: "Servicio eliminado" });
      onRefresh();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Mis Servicios en LocalService</h2>
        <Button size="sm" onClick={() => setMostrarNuevoServicio(!mostrarNuevoServicio)} className="gap-1">
          <Plus className="w-4 h-4" />Nuevo Servicio
        </Button>
      </div>

      {mostrarNuevoServicio && (
        <form onSubmit={crearNuevoServicio} className="bg-card rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Agregar Servicio</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del servicio</Label>
              <Input placeholder="Ej: Reparación de tuberías" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Precio o tarifa base</Label>
              <Input placeholder="Ej: $50.000/hora" value={nuevoPrecio} onChange={e => setNuevoPrecio(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <select
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={nuevaCategoria}
              onChange={e => setNuevaCategoria(e.target.value)}
            >
              {CATEGORIAS_SERVICIO.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea placeholder="Describe tu servicio..." value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} rows={3} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Guardar</Button>
            <Button type="button" variant="outline" onClick={() => setMostrarNuevoServicio(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      {misServicios.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center text-muted-foreground text-sm">
          No tienes servicios. Haz clic en "Nuevo Servicio" para empezar.
        </div>
      ) : (
        misServicios.map(service => (
          <div key={service.id} className="bg-card rounded-xl border p-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{service.nombre}</h3>
                <Badge variant={service.esta_activo ? "default" : "secondary"} className="text-xs">
                  {service.esta_activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{service.categoria} · {service.precio}</p>
              {service.descripcion && (
                <p className="text-xs text-muted-foreground mt-1 max-w-lg">{service.descripcion}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => service.id && cambiarEstadoServicio(service.id)}>
                {service.esta_activo ? "Desactivar" : "Activar"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => abrirEditarServicio(service)}>Editar</Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => service.id && removerServicio(service.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}

      <Dialog open={servicioEditId !== null} onOpenChange={open => { if (!open) setServicioEditId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Servicio</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={datosEditServicio.name} onChange={e => setDatosEditServicio({ ...datosEditServicio, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input value={datosEditServicio.price} onChange={e => setDatosEditServicio({ ...datosEditServicio, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={datosEditServicio.category}
                onChange={e => setDatosEditServicio({ ...datosEditServicio, category: e.target.value })}
              >
                {CATEGORIAS_SERVICIO.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={datosEditServicio.description}
                onChange={e => setDatosEditServicio({ ...datosEditServicio, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={guardarServicioEditado} className="flex-1">Guardar</Button>
              <Button variant="outline" onClick={() => setServicioEditId(null)}>Cancelar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiciosSection;
