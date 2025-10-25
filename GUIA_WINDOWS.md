# 🪟 Guía de Instalación para Windows 11

Esta guía está específicamente diseñada para desarrolladores que usan **Windows 11**, **VS Code** y **React**.

## 📋 Requisitos Previos

### 1. Instalar Node.js
- Descarga desde: https://nodejs.org/
- Versión recomendada: LTS (Long Term Support)
- Durante la instalación, marca la opción "Automatically install necessary tools"

**Verificar instalación:**
```cmd
node --version
npm --version
```

### 2. Instalar MySQL
Tienes varias opciones:

**Opción A: XAMPP (Recomendado para principiantes)**
- Descarga desde: https://www.apachefriends.org/
- Instala XAMPP
- Inicia el panel de control de XAMPP
- Inicia el servicio MySQL

**Opción B: MySQL Community Server**
- Descarga desde: https://dev.mysql.com/downloads/mysql/
- Durante la instalación, configura la contraseña de root

### 3. Instalar Git (Opcional pero recomendado)
- Descarga desde: https://git-scm.com/download/win
- Durante la instalación, selecciona "Use Git from the Windows Command Prompt"

### 4. Instalar pnpm (Gestor de paquetes)
```cmd
npm install -g pnpm
```

---

## 🚀 Instalación del Sistema Hotelero

### Paso 1: Descomprimir el Proyecto

1. Descarga el archivo `hotel-system.tar.gz`
2. Usa **7-Zip** o **WinRAR** para descomprimir (puede requerir descomprimir dos veces: primero .gz, luego .tar)
3. Coloca la carpeta `hotel-system` en una ubicación fácil de acceder, por ejemplo:
   ```
   C:\Proyectos\hotel-system
   ```

### Paso 2: Configurar la Base de Datos

#### Opción A: Usando XAMPP y phpMyAdmin

1. Abre el panel de control de XAMPP
2. Inicia el servicio **MySQL**
3. Haz clic en el botón **Admin** de MySQL (se abrirá phpMyAdmin)
4. En phpMyAdmin:
   - Haz clic en "Nueva" para crear una base de datos
   - Nombre: `hotel_management`
   - Cotejamiento: `utf8mb4_general_ci`
   - Haz clic en "Crear"
5. Selecciona la base de datos `hotel_management`
6. Ve a la pestaña "Importar"
7. Haz clic en "Seleccionar archivo"
8. Navega a `C:\Proyectos\hotel-system\database\schema.sql`
9. Haz clic en "Continuar" al final de la página

#### Opción B: Usando MySQL Workbench

1. Abre MySQL Workbench
2. Conecta a tu servidor local
3. Crea una nueva consulta (Query)
4. Abre el archivo `database/schema.sql` con un editor de texto
5. Copia todo el contenido
6. Pégalo en MySQL Workbench
7. Ejecuta el script (icono de rayo ⚡)

#### Opción C: Usando la terminal (CMD o PowerShell)

```cmd
cd C:\Proyectos\hotel-system

# Si usas XAMPP, el ejecutable de MySQL está en:
C:\xampp\mysql\bin\mysql.exe -u root -p

# Una vez dentro de MySQL:
CREATE DATABASE hotel_management;
exit

# Importar el esquema:
C:\xampp\mysql\bin\mysql.exe -u root -p hotel_management < database\schema.sql
```

### Paso 3: Configurar el Backend

1. **Abrir VS Code:**
   ```cmd
   cd C:\Proyectos\hotel-system
   code .
   ```

2. **Abrir terminal en VS Code** (Ctrl + ñ o View > Terminal)

3. **Navegar al backend:**
   ```cmd
   cd backend
   ```

4. **Instalar dependencias:**
   ```cmd
   npm install
   ```

5. **Configurar variables de entorno:**
   - Renombra el archivo `.env.example` a `.env`
   - Abre `.env` en VS Code
   - Modifica según tu configuración:

   ```env
   # Configuración del Servidor
   PORT=5000
   NODE_ENV=development

   # Configuración de Base de Datos MySQL
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=          # Si usas XAMPP, déjalo vacío. Si instalaste MySQL directamente, pon tu contraseña
   DB_NAME=hotel_management
   DB_PORT=3306

   # JWT Secret
   JWT_SECRET=hotel_secret_key_change_in_production_2025
   JWT_EXPIRE=7d

   # CORS
   CORS_ORIGIN=http://localhost:3000
   ```

6. **Iniciar el servidor backend:**
   ```cmd
   npm run dev
   ```

   Deberías ver algo como:
   ```
   ============================================================
   🏨 Sistema de Gestión Hotelera - API REST
   ============================================================
   ✓ Servidor corriendo en: http://localhost:5000
   ✓ Conexión exitosa a la base de datos MySQL
   ============================================================
   ```

### Paso 4: Configurar el Frontend

1. **Abrir una NUEVA terminal en VS Code** (el backend debe seguir corriendo)
   - Haz clic en el icono "+" en la terminal de VS Code
   - O presiona Ctrl + Shift + ñ

2. **Navegar al frontend:**
   ```cmd
   cd frontend
   ```

3. **Instalar dependencias:**
   ```cmd
   pnpm install
   ```

4. **Verificar el archivo .env:**
   - Abre `frontend/.env` en VS Code
   - Debe contener:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Iniciar la aplicación React:**
   ```cmd
   pnpm run dev
   ```

   Deberías ver algo como:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:3000/
   ➜  Network: use --host to expose
   ```

### Paso 5: Acceder al Sistema

1. Abre tu navegador (Chrome, Edge, Firefox)
2. Ve a: `http://localhost:3000`
3. Inicia sesión con:
   - **Email:** `admin@hotel.com`
   - **Password:** `admin123`

---

## 🎯 Estructura de Carpetas en Windows

```
C:\Proyectos\hotel-system\
├── backend\
│   ├── src\
│   │   ├── config\
│   │   ├── controllers\
│   │   ├── middleware\
│   │   ├── routes\
│   │   └── index.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend\
│   ├── src\
│   │   ├── components\
│   │   ├── config\
│   │   ├── context\
│   │   ├── pages\
│   │   └── App.jsx
│   ├── .env
│   └── package.json
├── database\
│   └── schema.sql
└── README.md
```

---

## 💻 Comandos Útiles en Windows

### Comandos de PowerShell/CMD

```cmd
# Ver archivos en la carpeta actual
dir

# Cambiar de carpeta
cd nombre_carpeta

# Volver a la carpeta anterior
cd ..

# Crear una carpeta
mkdir nombre_carpeta

# Eliminar una carpeta
rmdir /s nombre_carpeta

# Limpiar la terminal
cls

# Ver procesos en un puerto específico
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Matar un proceso por PID
taskkill /PID numero_pid /F
```

### Comandos de Git en Windows

```cmd
# Ver estado de los archivos
git status

# Ver diferencias
git diff

# Ver tu rama actual
git branch

# Agregar archivos
git add .

# Hacer commit
git commit -m "Descripción de cambios"

# Subir a GitHub
git push origin nombre-de-tu-rama
```

### Comandos de Node.js

```cmd
# Backend
cd backend
npm install          # Instalar dependencias
npm run dev         # Modo desarrollo
npm start           # Modo producción

# Frontend
cd frontend
pnpm install        # Instalar dependencias
pnpm run dev        # Modo desarrollo
pnpm run build      # Compilar para producción
```

---

## 🔧 Solución de Problemas en Windows

### Problema: "npm no se reconoce como comando"
**Solución:**
- Reinicia tu computadora después de instalar Node.js
- O agrega Node.js al PATH manualmente:
  1. Busca "Variables de entorno" en Windows
  2. Edita la variable PATH
  3. Agrega: `C:\Program Files\nodejs\`

### Problema: "Error: connect ECONNREFUSED 127.0.0.1:3306"
**Solución:**
- Verifica que MySQL esté corriendo en XAMPP
- Verifica que el puerto sea 3306 en `.env`
- Verifica las credenciales en `backend/.env`

### Problema: "Puerto 5000 ya está en uso"
**Solución:**
```cmd
# Ver qué proceso usa el puerto 5000
netstat -ano | findstr :5000

# Matar el proceso (reemplaza XXXX con el PID)
taskkill /PID XXXX /F

# O cambia el puerto en backend/.env
PORT=5001
```

### Problema: "Access denied for user 'root'@'localhost'"
**Solución:**
- Si usas XAMPP, la contraseña por defecto está vacía
- En `backend/.env`, deja `DB_PASSWORD=` vacío
- O configura una contraseña en phpMyAdmin

### Problema: El frontend no se conecta al backend
**Solución:**
1. Verifica que el backend esté corriendo (debe mostrar el mensaje de éxito)
2. Verifica que `frontend/.env` tenga `VITE_API_URL=http://localhost:5000/api`
3. Abre `http://localhost:5000/api/health` en el navegador para verificar

---

## 📝 Atajos de VS Code útiles

| Atajo | Acción |
|-------|--------|
| `Ctrl + ñ` | Abrir/cerrar terminal |
| `Ctrl + Shift + ñ` | Nueva terminal |
| `Ctrl + P` | Buscar archivo |
| `Ctrl + Shift + F` | Buscar en todos los archivos |
| `Ctrl + B` | Mostrar/ocultar sidebar |
| `Ctrl + /` | Comentar línea |
| `Alt + ↑/↓` | Mover línea arriba/abajo |
| `Ctrl + D` | Seleccionar siguiente coincidencia |

---

## 🎨 Extensiones Recomendadas de VS Code

Para instalar: Ctrl + Shift + X

1. **ES7+ React/Redux/React-Native snippets** - Snippets para React
2. **ESLint** - Linter para JavaScript
3. **Prettier** - Formateador de código
4. **Auto Rename Tag** - Renombra etiquetas HTML/JSX automáticamente
5. **Material Icon Theme** - Iconos bonitos para archivos
6. **GitLens** - Mejor integración con Git

---

## 🚀 Siguientes Pasos

1. ✅ Verifica que todo funcione correctamente
2. 📚 Explora el código en VS Code
3. 🎨 Personaliza el sistema según tus necesidades
4. 💾 Haz commits frecuentes de tus cambios
5. 🔄 Sube tu código a GitHub

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa esta guía paso a paso
2. Verifica los mensajes de error en la terminal
3. Asegúrate de que MySQL esté corriendo
4. Verifica que los puertos 3000 y 5000 estén libres
