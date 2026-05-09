import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/resetPassword";
import PanelCliente from "./pages/PanelCliente/ClientPanel";
import ProviderDetail from "./pages/PanelCliente/ProviderDetail";
import ProviderPanel from "./pages/PanelProveedor/ProviderPanel";


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
    {/* ruta de 404 no encontrada */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;