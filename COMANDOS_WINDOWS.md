# 💻 Comandos para Windows 11

## Comandos Básicos de PowerShell/CMD

### Navegación de Carpetas

```cmd
# Ver contenido de la carpeta actual
dir

# Cambiar a una carpeta
cd nombre_carpeta

# Ir a una ruta específica
cd C:\Proyectos\hotel-system

# Volver a la carpeta anterior
cd ..

# Ir al disco C:
C:

# Ir al disco D:
D:
```

### Gestión de Archivos y Carpetas

```cmd
# Crear una carpeta
mkdir nombre_carpeta

# Eliminar una carpeta vacía
rmdir nombre_carpeta

# Eliminar una carpeta con contenido
rmdir /s nombre_carpeta

# Copiar archivo
copy origen.txt destino.txt

# Mover archivo
move origen.txt C:\destino\

# Eliminar archivo
del archivo.txt

# Limpiar la pantalla
cls
```

---

## Comandos de Git para Windows

### Ver Cambios Antes de Subir

```cmd
# Ver estado de los archivos (qué cambió)
git status

# Ver diferencias en detalle
git diff

# Ver diferencias de un archivo específico
git diff src\App.jsx

# Ver cambios ya agregados al staging
git diff --staged
```

### Gestión de Ramas

```cmd
# Ver rama actual
git branch

# Ver todas las ramas
git branch -a

# Cambiar de rama
git checkout nombre-rama

# Crear y cambiar a nueva rama
git checkout -b nueva-rama
```

### Flujo de Trabajo Completo

```cmd
# 1. Ver qué archivos cambiaron
git status

# 2. Ver las diferencias exactas
git diff

# 3. Agregar archivos al staging
git add .                           # Todos los archivos
git add src\components\Login.jsx    # Archivo específico

# 4. Hacer commit
git commit -m "Descripción clara de los cambios"

# 5. Subir a tu rama en GitHub
git push origin nombre-de-tu-rama

# 6. Si es la primera vez que subes la rama
git push -u origin nombre-de-tu-rama
```

### Historial y Logs

```cmd
# Ver historial de commits
git log

# Ver historial resumido
git log --oneline

# Ver últimos 5 commits
git log -5

# Ver cambios de un commit específico
git show hash_del_commit
```

---

## Comandos del Proyecto

### Backend (Node.js + Express)

```cmd
# Ir a la carpeta del backend
cd C:\Proyectos\hotel-system\backend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con auto-reinicio)
npm run dev

# Ejecutar en modo producción
npm start

# Generar password hasheado
node scripts\hashPassword.js mi_password
```

### Frontend (React + Vite)

```cmd
# Ir a la carpeta del frontend
cd C:\Proyectos\hotel-system\frontend

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm run dev

# Ejecutar con acceso desde red local
pnpm run dev --host

# Compilar para producción
pnpm run build

# Vista previa de la compilación
pnpm run preview
```

---

## Comandos de MySQL en Windows

### Usando XAMPP

```cmd
# Ruta del ejecutable de MySQL en XAMPP
C:\xampp\mysql\bin\mysql.exe -u root -p

# Crear base de datos
C:\xampp\mysql\bin\mysql.exe -u root -p
CREATE DATABASE hotel_management;
exit

# Importar el esquema
cd C:\Proyectos\hotel-system
C:\xampp\mysql\bin\mysql.exe -u root -p hotel_management < database\schema.sql
```

### Consultas Básicas (dentro de MySQL)

```sql
-- Ver todas las bases de datos
SHOW DATABASES;

-- Usar una base de datos
USE hotel_management;

-- Ver todas las tablas
SHOW TABLES;

-- Ver estructura de una tabla
DESCRIBE usuarios;

-- Consultar datos
SELECT * FROM usuarios;
SELECT * FROM habitaciones;
SELECT * FROM reservas LIMIT 10;

-- Salir de MySQL
exit;
```

---

## Comandos de Gestión de Procesos

### Ver Procesos en Puertos

```cmd
# Ver qué proceso usa el puerto 5000 (backend)
netstat -ano | findstr :5000

# Ver qué proceso usa el puerto 3000 (frontend)
netstat -ano | findstr :3000

# Ver todos los puertos en uso
netstat -ano
```

### Matar Procesos

```cmd
# Matar un proceso por PID
taskkill /PID numero_pid /F

# Ejemplo: Si el PID es 12345
taskkill /PID 12345 /F

# Matar todos los procesos de Node.js
taskkill /IM node.exe /F
```

---

## Comandos de VS Code desde Terminal

```cmd
# Abrir VS Code en la carpeta actual
code .

# Abrir un archivo específico
code archivo.js

# Abrir VS Code y crear un nuevo archivo
code nuevo-archivo.js

# Abrir carpeta específica
code C:\Proyectos\hotel-system
```

---

## Verificar Instalaciones

```cmd
# Verificar versión de Node.js
node --version
node -v

# Verificar versión de npm
npm --version
npm -v

# Verificar versión de pnpm
pnpm --version

# Verificar versión de Git
git --version

# Ver ruta de Node.js
where node

# Ver ruta de npm
where npm
```

---

## Comandos Útiles de Desarrollo

### Limpiar Caché y Reinstalar

```cmd
# Backend
cd backend
rmdir /s node_modules
del package-lock.json
npm install

# Frontend
cd frontend
rmdir /s node_modules
del pnpm-lock.yaml
pnpm install
```

### Ver Variables de Entorno

```cmd
# Ver todas las variables de entorno
set

# Ver una variable específica
echo %PATH%
echo %USERPROFILE%
```

### Abrir Carpetas y Archivos

```cmd
# Abrir carpeta en el explorador
explorer .
explorer C:\Proyectos\hotel-system

# Abrir archivo con la aplicación predeterminada
start archivo.txt
start README.md
```

---

## Atajos de Teclado en CMD/PowerShell

| Atajo | Acción |
|-------|--------|
| `Tab` | Autocompletar nombre de archivo/carpeta |
| `↑` / `↓` | Navegar por comandos anteriores |
| `Ctrl + C` | Cancelar comando en ejecución |
| `Ctrl + L` | Limpiar pantalla (igual que `cls`) |
| `Ctrl + A` | Ir al inicio de la línea |
| `Ctrl + E` | Ir al final de la línea |

---

## Scripts Útiles para package.json

Si quieres agregar scripts personalizados:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "clean": "rmdir /s node_modules && npm install",
    "db:reset": "mysql -u root -p hotel_management < database/schema.sql"
  }
}
```

---

## Comandos de Red

```cmd
# Ver configuración de red
ipconfig

# Ver todas las conexiones
ipconfig /all

# Renovar IP
ipconfig /renew

# Limpiar caché DNS
ipconfig /flushdns

# Hacer ping a un servidor
ping localhost
ping google.com

# Ver ruta de red
tracert google.com
```

---

## Solución Rápida de Problemas

### Puerto Ocupado

```cmd
# 1. Ver qué proceso usa el puerto
netstat -ano | findstr :5000

# 2. Anotar el PID (última columna)
# 3. Matar el proceso
taskkill /PID XXXX /F
```

### Node.js no Funciona

```cmd
# 1. Verificar instalación
node --version

# 2. Si no funciona, verificar PATH
echo %PATH%

# 3. Reinstalar Node.js si es necesario
```

### MySQL no Conecta

```cmd
# 1. Verificar que MySQL esté corriendo en XAMPP
# 2. Probar conexión
C:\xampp\mysql\bin\mysql.exe -u root -p

# 3. Verificar puerto
netstat -ano | findstr :3306
```

---

## Crear Alias en PowerShell (Opcional)

Para crear comandos más cortos, edita tu perfil de PowerShell:

```powershell
# Abrir perfil de PowerShell
notepad $PROFILE

# Agregar alias (ejemplos):
Set-Alias -Name ll -Value Get-ChildItem
function cdp { cd C:\Proyectos }
function hotel { cd C:\Proyectos\hotel-system }

# Guardar y cerrar
# Recargar perfil
. $PROFILE
```

Ahora puedes usar:
```powershell
hotel        # Va a C:\Proyectos\hotel-system
ll           # Lista archivos (como dir)
```

---

## Comandos Específicos del Proyecto

### Iniciar Todo el Sistema

```cmd
# Terminal 1 - Backend
cd C:\Proyectos\hotel-system\backend
npm run dev

# Terminal 2 - Frontend (nueva terminal)
cd C:\Proyectos\hotel-system\frontend
pnpm run dev
```

### Verificar que Todo Funciona

```cmd
# 1. Verificar backend
curl http://localhost:5000/api/health
# O abre en el navegador: http://localhost:5000/api/health

# 2. Verificar frontend
# Abre en el navegador: http://localhost:3000

# 3. Verificar MySQL
C:\xampp\mysql\bin\mysql.exe -u root -p
SHOW DATABASES;
USE hotel_management;
SHOW TABLES;
exit;
```
