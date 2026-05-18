import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Autenticacion/Login";
import Register from "./pages/Autenticacion/Register";
import ResetPassword from "./pages/Autenticacion/resetPassword";
import PanelCliente from "./pages/PanelCliente/ClientPanel";
import ProviderDetail from "./pages/PanelCliente/ProviderDetail";
import ProviderPanel from "./pages/PanelProveedor/ProviderPanel";
import AdminPanel from "./pages/PanelAdmin/AdminPanel";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    {/* rutas de autenticación */}
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Register />} />
    <Route path="/recuperar-contrasena" element={<ResetPassword />} />
    {/* rutas del cliente */}
    <Route path="/cliente" element={<PanelCliente />} />
    <Route path="/proveedor/:id" element={<ProviderDetail />} />
    {/* rutas del proveedor */}
    <Route path="/proveedor" element={<ProviderPanel />} />
    {/* rutas del admin */}
    <Route path="/admin" element={<AdminPanel />} />
    {/* ruta de 404 no encontrada */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;