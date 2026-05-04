import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/resetPassword";
import PanelCliente from "./pages/PanelCliente/ClientPanel";
import ProviderDetail from "./pages/PanelCliente/ProviderDetail";


const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Register />} />
    <Route path="/recuperar-contrasena" element={<ResetPassword />} />
    <Route path="/cliente" element={<PanelCliente />} />
    <Route path="/proveedor/:id" element={<ProviderDetail />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;