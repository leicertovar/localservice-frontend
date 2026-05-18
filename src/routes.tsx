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
import ProtectedRoute from "./components/auth/ProtectedRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    {/* rutas de autenticación */}
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Register />} />
    <Route path="/recuperar-contrasena" element={<ResetPassword />} />
    {/* rutas del cliente */}
    <Route path="/cliente" element={
      <ProtectedRoute rolRequerido="cliente">
        <PanelCliente />
      </ProtectedRoute>
    } />
    <Route path="/proveedor/:id" element={
      <ProtectedRoute rolRequerido="cliente">
        <ProviderDetail />
      </ProtectedRoute>
    } />
    {/* rutas del proveedor */}
    <Route path="/proveedor" element={
      <ProtectedRoute rolRequerido="proveedor">
        <ProviderPanel />
      </ProtectedRoute>
    } />
    {/* rutas del admin */}
    <Route path="/admin" element={
      <ProtectedRoute rolRequerido="admin">
        <AdminPanel />
      </ProtectedRoute>
    } />
    {/* ruta de 404 no encontrada */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;