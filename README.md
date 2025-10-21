# Sistema de Gestión Hotelera (SGH)

Este es un sistema completo para la gestión de hoteles, desarrollado con el stack MERN (MySQL, Express, React, Node.js) y diseñado para ser robusto, escalable y fácil de usar.

## ✨ Características Principales

El sistema cuenta con un conjunto completo de funcionalidades para administrar todas las operaciones de un hotel:

- **Panel de Control (Dashboard):** Visualización en tiempo real de las métricas más importantes: ocupación, ingresos, check-ins/outs del día y próximas llegadas.
- **Gestión de Huéspedes:** Registro completo de huéspedes, con historial, búsqueda y gestión de datos personales.
- **Gestión de Habitaciones:** Administración del estado de las habitaciones (disponible, ocupada, limpieza, etc.), tipos de habitación, precios y capacidades.
- **Gestión de Reservas:** Creación, modificación y cancelación de reservas. Procesos de check-in y check-out integrados.
- **Facturación y Pagos:** Generación de facturas a partir de las reservas, incluyendo consumos adicionales. Registro de pagos parciales o totales.
- **Gestión de Servicios Adicionales:** Administración de servicios como restaurante, spa, lavandería, etc., para ser añadidos a la cuenta del huésped.
- **Reportes y Estadísticas:** Módulo de reportes para analizar la ocupación, ingresos, servicios más vendidos y más, con filtros por fecha.
- **Gestión de Usuarios y Roles:** Sistema de autenticación seguro con roles (admin, recepcionista, etc.) para controlar el acceso a las diferentes funcionalidades.

## 🛠️ Tecnologías Utilizadas

El proyecto está dividido en dos componentes principales: un backend (API REST) y un frontend (aplicación de una sola página - SPA).

| Componente | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Backend** | **Node.js** | Entorno de ejecución para JavaScript en el servidor. |
| | **Express.js** | Framework para construir la API REST de forma rápida y organizada. |
| | **MySQL** | Base de datos relacional para almacenar toda la información del sistema. |
| | **Sequelize** | ORM para interactuar con la base de datos de forma segura y sencilla. |
| | **JWT (JSON Web Tokens)** | Para la autenticación y autorización basada en tokens. |
| | **Bcrypt.js** | Para el hasheo seguro de contraseñas. |
| **Frontend** | **React.js** | Librería para construir la interfaz de usuario interactiva. |
| | **Material-UI (MUI)** | Biblioteca de componentes de UI para un diseño profesional y consistente. |
| | **React Router** | Para la gestión de rutas en la aplicación de una sola página. |
| | **Axios** | Cliente HTTP para realizar peticiones a la API del backend. |
| | **Date-fns** | Librería para la manipulación y formateo de fechas. |
| **Herramientas** | **Vite** | Entorno de desarrollo para el frontend, rápido y moderno. |
| | **Nodemon** | Para reiniciar automáticamente el servidor de backend durante el desarrollo. |

---

## 🚀 Guía de Instalación y Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

Asegúrate de tener instalado lo siguiente:
- **Node.js** (versión 18 o superior)
- **npm** o **pnpm**
- Un servidor de **MySQL** (ej. XAMPP, WAMP, Docker, o una instalación nativa)

### 1. Configuración de la Base de Datos

1.  **Crear la Base de Datos:**
    - Accede a tu cliente de MySQL (phpMyAdmin, MySQL Workbench, etc.).
    - Crea una nueva base de datos llamada `hotel_management`.

2.  **Importar el Esquema y Datos:**
    - Abre el archivo `database/schema.sql` que se encuentra en la raíz de este proyecto.
    - Copia todo el contenido del archivo.
    - Pega y ejecuta el script SQL en tu base de datos `hotel_management`. Esto creará todas las tablas necesarias e insertará datos iniciales (usuario admin, tipos de habitación, etc.).

### 2. Configuración del Backend

1.  **Navegar al Directorio:**
    ```bash
    cd backend
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    - Renombra el archivo `.env.example` a `.env`.
    - Abre el archivo `.env` y modifica las credenciales de tu base de datos:
      ```env
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD= # Coloca aquí la contraseña de tu usuario root de MySQL
      DB_NAME=hotel_management
      ```

4.  **Ejecutar el Servidor:**
    - Para desarrollo (con reinicio automático):
      ```bash
      npm run dev
      ```
    - Para producción:
      ```bash
      npm start
      ```
    El servidor del backend estará corriendo en `http://localhost:5000`.

### 3. Configuración del Frontend

1.  **Navegar al Directorio:**
    ```bash
    cd frontend
    ```

2.  **Instalar Dependencias:**
    ```bash
    pnpm install
    ```

3.  **Configurar Variables de Entorno:**
    - El archivo `.env` ya está configurado para apuntar al backend en `http://localhost:5000/api`. Si tu backend corre en un puerto diferente, modifica el archivo `.env`.

4.  **Ejecutar la Aplicación:**
    ```bash
    pnpm run dev
    ```
    La aplicación de React estará disponible en `http://localhost:3000` (o el puerto que indique la terminal).

### 4. Acceder al Sistema

- Abre tu navegador y ve a `http://localhost:3000`.
- Usa las siguientes credenciales para iniciar sesión como administrador:
  - **Email:** `admin@hotel.com`
  - **Contraseña:** `admin123`

## 📂 Estructura del Proyecto

```
/hotel-system
├── /backend
│   ├── /src
│   │   ├── /config       # Conexión a BD, variables de entorno
│   │   ├── /controllers  # Lógica de negocio de cada ruta
│   │   ├── /middleware   # Middlewares (auth, validación)
│   │   ├── /models       # (Opcional) Modelos de datos
│   │   ├── /routes       # Definición de las rutas de la API
│   │   └── index.js      # Archivo principal del servidor Express
│   ├── package.json
│   └── .env            # Variables de entorno
├── /frontend
│   ├── /src
│   │   ├── /assets       # Imágenes, fuentes, etc.
│   │   ├── /components   # Componentes reutilizables (Layout, etc.)
│   │   ├── /config       # Configuración de Axios (api.js)
│   │   ├── /context      # Contexto de React (AuthContext)
│   │   ├── /hooks        # Hooks personalizados
│   │   ├── /pages        # Componentes de página (Dashboard, Login, etc.)
│   │   └── App.jsx       # Componente principal y enrutador
│   ├── package.json
│   └── .env            # Variables de entorno de Vite
├── /database
│   └── schema.sql      # Script de creación de la base de datos
└── README.md           # Esta documentación
```

## 📝 Endpoints de la API (Resumen)

La API REST sigue una estructura estándar. Todas las rutas están prefijadas con `/api`.

- **Autenticación:** `/api/auth/login`, `/api/auth/register`, `/api/auth/profile`
- **Huéspedes:** `GET, POST, PUT, DELETE /api/huespedes`
- **Habitaciones:** `GET, POST, PUT /api/habitaciones`, `GET /api/tipos-habitacion`
- **Reservas:** `GET, POST /api/reservas`, `POST /api/reservas/:id/check-in`
- **Facturas:** `GET, POST /api/facturas`, `POST /api/facturas/pagos`
- **Reportes:** `GET /api/reportes/dashboard`, `GET /api/reportes/ingresos`, etc.

Todas las rutas protegidas requieren un `Bearer Token` en la cabecera `Authorization`.

# hotel-system
