import { useState } from "react";
import { Link } from "react-router-dom";
import { Users, ShieldCheck, MessageSquare, BarChart3, LogOut, Bell, Search, CheckCircle, XCircle, Eye, Trash2, AlertTriangle, FileText, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import NotificationsPanel from "@/components/reusable/NotificationsPanel";

interface UserData {
  id: number; name: string; email: string; role: string; status: string; date: string; phone: string; city: string;
  verified?: boolean; completedJobs?: number; rating?: number; servicesRequested?: number;
}

const initialUsers: UserData[] = [
  { id: 1, name: "Juan Usuario", email: "juan@ejemplo.com", role: "Cliente", status: "Activo", date: "2026-03-01", phone: "+57 300 123 4567", city: "Buenaventura", servicesRequested: 12 },
  { id: 2, name: "Carlos Mendoza", email: "carlos@ejemplo.com", role: "Proveedor", status: "Activo", date: "2026-02-15", verified: true, phone: "+57 310 555 1234", city: "Buenaventura", completedJobs: 48, rating: 4.9 },
  { id: 3, name: "María López", email: "maria@ejemplo.com", role: "Proveedor", status: "Activo", date: "2026-03-10", verified: true, phone: "+57 311 222 3344", city: "Buenaventura", completedJobs: 35, rating: 4.7 },
  { id: 4, name: "Pedro Silva", email: "pedro@ejemplo.com", role: "Proveedor", status: "Pendiente", date: "2026-04-05", verified: false, phone: "+57 315 666 7788", city: "Cali", completedJobs: 0, rating: 0 },
  { id: 5, name: "Ana Torres", email: "ana@ejemplo.com", role: "Cliente", status: "Activo", date: "2026-04-01", phone: "+57 300 999 8877", city: "Buenaventura", servicesRequested: 5 },
  { id: 6, name: "Laura Gómez", email: "laura@ejemplo.com", role: "Proveedor", status: "Pendiente", date: "2026-04-07", verified: false, phone: "+57 312 333 4455", city: "Cali", completedJobs: 0, rating: 0 },
];

const pendingDocs = [
  { userId: 4, docName: "Cédula de Ciudadanía", status: "Pendiente", uploadDate: "2026-04-05" },
  { userId: 4, docName: "Certificado SENA", status: "Pendiente", uploadDate: "2026-04-05" },
  { userId: 4, docName: "Antecedentes Penales", status: "Pendiente", uploadDate: "2026-04-06" },
  { userId: 6, docName: "Cédula de Ciudadanía", status: "Pendiente", uploadDate: "2026-04-07" },
  { userId: 6, docName: "Certificado Profesional", status: "Pendiente", uploadDate: "2026-04-07" },
];

const flaggedReviews = [
  { id: 1, reviewer: "Usuario Anónimo", provider: "Carlos Mendoza", rating: 1, comment: "Contenido inapropiado y ofensivo...", date: "2026-04-06", reason: "Lenguaje ofensivo" },
  { id: 2, reviewer: "Test User", provider: "María López", rating: 1, comment: "Spam repetido sin sentido...", date: "2026-04-07", reason: "Spam" },
  { id: 3, reviewer: "Bot Account", provider: "Pedro Silva", rating: 5, comment: "Review falsa generada automáticamente", date: "2026-04-08", reason: "Review falsa" },
];

const AdminPanel = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchUsers, setSearchUsers] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof initialUsers[0] | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<typeof initialUsers[0] | null>(null);
  const [docsDialogUser, setDocsDialogUser] = useState<number | null>(null);
  const { toast } = useToast();

  const pendingVerifications = users.filter(u => u.role === "Proveedor" && !u.verified);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const handleDeleteUser = () => {
    if (!deleteConfirm) return;
    setUsers(prev => prev.filter(u => u.id !== deleteConfirm.id));
    toast({ title: "Usuario eliminado", description: `${deleteConfirm.name} ha sido eliminado del sistema.`, variant: "destructive" });
    setDeleteConfirm(null);
  };

  const handleVerify = (userId: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true, status: "Activo" } : u));
    const user = users.find(u => u.id === userId);
    toast({ title: "Proveedor verificado", description: `${user?.name} ha sido verificado exitosamente.` });
  };

  const handleRejectVerification = (userId: number) => {
    const user = users.find(u => u.id === userId);
    toast({ title: "Verificación rechazada", description: `La verificación de ${user?.name} ha sido rechazada.`, variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-sm">LS</span>
            </div>
            <span className="font-bold text-foreground">LocalService</span>
            <Badge className="text-xs bg-destructive/10 text-destructive border-destructive/20">Admin</Badge>
          </Link>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">5</span>
              </Button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-foreground text-background text-xs">AD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><LogOut className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Usuarios", value: users.length.toString(), icon: Users, color: "text-primary" },
            { label: "Proveedores Verificados", value: users.filter(u => u.verified).length.toString(), icon: ShieldCheck, color: "text-success" },
            { label: "Verificación Pendiente", value: pendingVerifications.length.toString(), icon: AlertTriangle, color: "text-warning" },
            { label: "Reseñas Reportadas", value: flaggedReviews.length.toString(), icon: MessageSquare, color: "text-destructive" },
          ].map(stat => (
            <div key={stat.label} className="bg-card rounded-xl border p-5">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="usuarios" className="gap-2"><Users className="w-4 h-4" />Usuarios</TabsTrigger>
            <TabsTrigger value="verificacion" className="gap-2"><ShieldCheck className="w-4 h-4" />Verificación</TabsTrigger>
            <TabsTrigger value="resenas" className="gap-2"><MessageSquare className="w-4 h-4" />Reseñas</TabsTrigger>
            <TabsTrigger value="reportes" className="gap-2"><BarChart3 className="w-4 h-4" />Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Gestión de Usuarios</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar usuario..." className="pl-10" value={searchUsers} onChange={e => setSearchUsers(e.target.value)} />
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
                            <Avatar className="w-8 h-8"><AvatarFallback className="text-xs bg-muted">{u.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                            <div>
                              <p className="text-sm font-medium text-foreground">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{u.role}</Badge></td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${u.status === "Activo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{u.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{u.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(u)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(u)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verificacion" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Verificación de Proveedores</h2>
            {pendingVerifications.length === 0 ? (
              <div className="bg-card rounded-xl border p-8 text-center">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <p className="text-foreground font-medium">No hay verificaciones pendientes</p>
                <p className="text-sm text-muted-foreground mt-1">Todos los proveedores están verificados</p>
              </div>
            ) : (
              pendingVerifications.map(p => (
                <div key={p.id} className="bg-card rounded-xl border p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12"><AvatarFallback className="bg-warning/10 text-warning">{p.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">{p.email}</p>
                        <p className="text-xs text-muted-foreground">Registrado: {p.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setDocsDialogUser(p.id)}><Eye className="w-4 h-4" />Ver documentos</Button>
                      <Button size="sm" className="gap-1" onClick={() => handleVerify(p.id)}><CheckCircle className="w-4 h-4" />Aprobar</Button>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => handleRejectVerification(p.id)}><XCircle className="w-4 h-4" />Rechazar</Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="resenas" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Moderación de Reseñas</h2>
            {flaggedReviews.map(r => (
              <div key={r.id} className="bg-card rounded-xl border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{r.reviewer}</h3>
                      <span className="text-xs text-muted-foreground">→ {r.provider}</span>
                    </div>
                    <Badge className="text-xs bg-destructive/10 text-destructive mb-2">{r.reason}</Badge>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{r.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast({ title: "Reseña conservada", description: "La reseña ha sido marcada como válida." })}>Conservar</Button>
                  <Button size="sm" variant="outline" className="text-destructive gap-1" onClick={() => toast({ title: "Reseña eliminada", description: "La reseña ha sido eliminada del sistema.", variant: "destructive" })}>
                    <Trash2 className="w-3 h-3" />Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="reportes" className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Reportes y Estadísticas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold text-foreground mb-4">Usuarios por Rol</h3>
                <div className="space-y-3">
                  {[
                    { label: "Clientes", value: users.filter(u => u.role === "Cliente").length, total: users.length, color: "bg-primary" },
                    { label: "Proveedores", value: users.filter(u => u.role === "Proveedor").length, total: users.length, color: "bg-accent" },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1"><span className="text-foreground">{item.label}</span><span className="text-muted-foreground">{item.value}</span></div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / item.total) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl border p-6">
                <h3 className="font-semibold text-foreground mb-4">Servicios Populares</h3>
                <div className="space-y-3">
                  {[
                    { name: "Plomería", count: 340 },
                    { name: "Limpieza", count: 520 },
                    { name: "Electricidad", count: 280 },
                    { name: "Tecnología", count: 410 },
                  ].map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{i + 1}. {s.name}</span>
                      <span className="text-sm font-medium text-muted-foreground">{s.count} proveedores</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={selectedUser !== null} onOpenChange={open => { if (!open) setSelectedUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de Usuario</DialogTitle>
            <DialogDescription>Información completa del usuario</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">{selectedUser.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground">{selectedUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{selectedUser.role}</Badge>
                    <Badge className={`text-xs ${selectedUser.status === "Activo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{selectedUser.status}</Badge>
                    {selectedUser.verified && <Badge className="text-xs bg-success/10 text-success">Verificado ✓</Badge>}
                  </div>
                </div>
              </div>
              <div className="space-y-3 bg-muted rounded-lg p-4">
                <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{selectedUser.email}</span></div>
                <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{selectedUser.phone}</span></div>
                <div className="flex items-center gap-3 text-sm"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">Registrado: {selectedUser.date}</span></div>
                <div className="flex items-center gap-3 text-sm"><Eye className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">Ciudad: {selectedUser.city}</span></div>
              </div>
              {selectedUser.role === "Proveedor" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{selectedUser.completedJobs}</p>
                    <p className="text-xs text-muted-foreground">Trabajos</p>
                  </div>
                  <div className="bg-card border rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-foreground">{selectedUser.rating || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">Calificación</p>
                  </div>
                </div>
              )}
              {selectedUser.role === "Cliente" && (
                <div className="bg-card border rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{selectedUser.servicesRequested || 0}</p>
                  <p className="text-xs text-muted-foreground">Servicios solicitados</p>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setSelectedUser(null)}>Cerrar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={open => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Eliminar Usuario</DialogTitle>
            <DialogDescription>¿Estás seguro de que deseas eliminar a <strong>{deleteConfirm?.name}</strong>? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button variant="destructive" className="flex-1" onClick={handleDeleteUser}>Sí, eliminar</Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={docsDialogUser !== null} onOpenChange={open => { if (!open) setDocsDialogUser(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Documentos del Proveedor</DialogTitle>
            <DialogDescription>Revisa los documentos enviados para verificación</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {pendingDocs.filter(d => d.userId === docsDialogUser).map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.docName}</p>
                    <p className="text-xs text-muted-foreground">Subido: {doc.uploadDate}</p>
                  </div>
                </div>
                <Badge className="text-xs bg-warning/10 text-warning">{doc.status}</Badge>
              </div>
            ))}
            {pendingDocs.filter(d => d.userId === docsDialogUser).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No hay documentos disponibles</p>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={() => { if (docsDialogUser) handleVerify(docsDialogUser); setDocsDialogUser(null); }}>Aprobar documentos</Button>
            <Button variant="outline" onClick={() => setDocsDialogUser(null)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
