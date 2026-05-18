# Frontend de LocalService

El frontend de LocalService es una aplicación moderna desarrollada con **React**, **TypeScript** y **Vite**.
Su objetivo principal es proporcionar una experiencia de usuario fluida para la conexión entre clientes y proveedores de servicios locales.

## 🚀 Características Principales

*   **Autenticación Dual**: Maneja el registro e inicio de sesión tanto para **Clientes** como para **Proveedores**.
*   **Dashboard Diferenciado**: Ofrece vistas y funcionalidades distintas según el tipo de usuario (Clientes, Proveedores y Administradores).
*   **Gestión de Perfiles**: Permite a los usuarios editar su información personal y, en el caso de proveedores, la información específica de su servicio.
*   **Servicios**: Facilita la creación, edición y visualización de servicios ofrecidos por los proveedores.
*   **Validación de Documentos**: Los proveedores deben subir un documento de respaldo al registrarse, el cual es verificado por el administrador.
*   **Tematización**: Sistema de temas con modo oscuro/claro gestionado por usuario y tema global del sistema.
*   **Historial de Transacciones**: Visualización de pagos realizados por clientes y cobros registrados por proveedores.

## 🛠️ Stack Tecnológico

*   **React 18+** - Biblioteca principal para la interfaz de usuario.
*   **TypeScript** - Sistema de tipos para JavaScript.
*   **Vite** - Entorno de desarrollo y empaquetador.
*   **Tailwind CSS 4** - Framework CSS utility-first.
*   **Shadcn UI** - Componentes de interfaz de usuario accesibles y personalizados.
*   **Axios** - Cliente HTTP para comunicación con la API REST.
*   **Lucide-React** - Biblioteca de iconos.
*   **Zustand** - Gestión de estado global.

## 📝 Requisitos Previos

*   Node.js (v16 o superior recomendado)
*   npm (o yarn/pnpm)
*   Backend de LocalService corriendo (API REST de Laravel)

## 🏁 Instalación y Ejecución

1.  **Clonar el repositorio** (o descargar el código fuente).

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configuración de Variables de Entorno**:
    Crea un archivo `.env` en la raíz del proyecto a partir del `.env.example` (si existe) y configura las siguientes variables:
    ```env
    VITE_API_URL=http://localhost:8000/api
    ```
    *Asegúrate de que `VITE_API_URL` apunte a la URL de tu API Laravel (ej. `http://localhost:8000/api`).*

4.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

5.  **Acceder a la aplicación**:
    Abre tu navegador y ve a `http://localhost:8080` (o el puerto que indique Vite).

## 📖 Comandos Útiles

*   `npm run dev`: Inicia el servidor en modo de desarrollo.
*   `npm run build`: Compila la aplicación para producción.
*   `npm run preview`: Previsualiza la compilación de producción localmente.
*   `npm run lint`: Ejecuta el linter para verificar el código.
