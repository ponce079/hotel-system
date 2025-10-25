# Comandos Útiles - Sistema de Gestión Hotelera

## Comandos de Git

### Ver cambios locales antes de subir a Git

```bash
# Ver el estado de los archivos (modificados, nuevos, eliminados)
git status

# Ver diferencias de los archivos modificados
git diff

# Ver diferencias de un archivo específico
git diff nombre_archivo.js

# Ver cambios de archivos ya agregados al staging area
git diff --staged
```

### Ver tu rama actual y ramas disponibles

```bash
# Ver rama actual y todas las ramas locales
git branch

# Ver todas las ramas (locales y remotas)
git branch -a

# Ver la última commit de cada rama
git branch -v
```

### Flujo de trabajo completo

```bash
# 1. Asegurarte de estar en tu rama
git branch

# 2. Si necesitas cambiar de rama
git checkout nombre-de-tu-rama

# 3. Ver cambios realizados
git status
git diff

# 4. Agregar archivos al staging area
git add .                    # Agregar todos los archivos
git add archivo.js          # Agregar un archivo específico

# 5. Hacer commit con mensaje descriptivo
git commit -m "Descripción clara de los cambios realizados"

# 6. Subir cambios a tu rama en GitHub
git push origin nombre-de-tu-rama

# 7. Si es la primera vez que subes la rama
git push -u origin nombre-de-tu-rama
```

### Ver historial de commits

```bash
# Ver historial de commits
git log

# Ver historial resumido (una línea por commit)
git log --oneline

# Ver últimos 5 commits
git log -5

# Ver cambios de un commit específico
git show hash_del_commit
```

## Comandos del Backend (Node.js)

### Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (con auto-reinicio)
npm run dev

# Ejecutar en modo producción
npm start

# Generar password hasheado
node scripts/hashPassword.js mi_password
```

### Verificar que el backend está funcionando

```bash
# Usando curl
curl http://localhost:5000/api/health

# O abre en el navegador
http://localhost:5000/api/health
```

## Comandos del Frontend (React)

### Desarrollo

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm run dev

# Ejecutar en modo desarrollo con acceso desde red local
pnpm run dev --host

# Construir para producción
pnpm run build

# Vista previa de la build de producción
pnpm run preview
```

## Comandos de MySQL

### Acceder a MySQL desde terminal

```bash
# Acceder a MySQL
mysql -u root -p

# Usar la base de datos del hotel
USE hotel_management;

# Ver todas las tablas
SHOW TABLES;

# Ver estructura de una tabla
DESCRIBE usuarios;

# Consultar datos
SELECT * FROM usuarios;
SELECT * FROM habitaciones;
SELECT * FROM reservas;

# Salir de MySQL
exit;
```

### Importar el esquema de la base de datos

```bash
# Desde la terminal (fuera de MySQL)
mysql -u root -p hotel_management < database/schema.sql
```

## Ver logs en tiempo real

### Backend

```bash
# Si usas npm run dev, los logs aparecen automáticamente
# Para ver logs de un proceso en ejecución
tail -f logs/backend.log
```

### Frontend

```bash
# Los logs aparecen en la terminal donde ejecutaste pnpm run dev
# También puedes ver los logs en la consola del navegador (F12)
```

## Comandos para verificar que todo funciona

```bash
# 1. Verificar que Node.js está instalado
node --version

# 2. Verificar que npm está instalado
npm --version

# 3. Verificar que MySQL está corriendo
# En Windows (XAMPP)
# Abrir XAMPP Control Panel y verificar que MySQL está "Running"

# En Linux/Mac
sudo systemctl status mysql

# 4. Verificar que el puerto 5000 está libre (backend)
# En Windows
netstat -ano | findstr :5000

# En Linux/Mac
lsof -i :5000

# 5. Verificar que el puerto 3000 está libre (frontend)
# En Windows
netstat -ano | findstr :3000

# En Linux/Mac
lsof -i :3000
```

## Solución de problemas comunes

### El backend no se conecta a la base de datos

```bash
# 1. Verificar que MySQL está corriendo
# 2. Verificar las credenciales en backend/.env
# 3. Verificar que la base de datos existe
mysql -u root -p
SHOW DATABASES;
```

### El frontend no se conecta al backend

```bash
# 1. Verificar que el backend está corriendo en el puerto 5000
# 2. Verificar la URL en frontend/.env
# 3. Verificar CORS en backend/.env
```

### Error de permisos en MySQL

```sql
-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON hotel_management.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## Comandos útiles de desarrollo

### Limpiar caché y reinstalar dependencias

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Ver procesos corriendo en puertos

```bash
# Windows
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :5000
lsof -i :3000

# Matar un proceso por PID
# Windows
taskkill /PID numero_pid /F

# Linux/Mac
kill -9 numero_pid
```
