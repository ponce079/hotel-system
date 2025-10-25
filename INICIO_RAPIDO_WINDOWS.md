# 🚀 Inicio Rápido - Windows 11

## ⚡ Configuración en 10 Minutos

### ✅ Antes de Empezar

Asegúrate de tener:
- [ ] **Node.js** instalado (https://nodejs.org/)
- [ ] **XAMPP** instalado (https://www.apachefriends.org/)
- [ ] **VS Code** instalado (https://code.visualstudio.com/)
- [ ] El proyecto descomprimido en `C:\Proyectos\hotel-system`

---

## 📝 Paso 1: Base de Datos (3 minutos)

### Opción A: Con phpMyAdmin (Más Fácil)

1. **Inicia XAMPP:**
   - Abre el panel de control de XAMPP
   - Haz clic en **Start** en MySQL

2. **Abre phpMyAdmin:**
   - Haz clic en el botón **Admin** de MySQL
   - O ve a: `http://localhost/phpmyadmin`

3. **Crea la base de datos:**
   - Haz clic en **"Nueva"** (arriba a la izquierda)
   - Nombre: `hotel_management`
   - Haz clic en **"Crear"**

4. **Importa el esquema:**
   - Selecciona la base de datos `hotel_management`
   - Ve a la pestaña **"Importar"**
   - Haz clic en **"Seleccionar archivo"**
   - Busca: `C:\Proyectos\hotel-system\database\schema.sql`
   - Haz clic en **"Continuar"** (al final de la página)

### Opción B: Con Terminal (Más Rápido)

Abre PowerShell o CMD:

```cmd
cd C:\Proyectos\hotel-system

C:\xampp\mysql\bin\mysql.exe -u root -p
# Presiona Enter (sin contraseña si es instalación nueva de XAMPP)

CREATE DATABASE hotel_management;
exit

C:\xampp\mysql\bin\mysql.exe -u root -p hotel_management < database\schema.sql
```

---

## 💻 Paso 2: Backend (3 minutos)

1. **Abre VS Code:**
   ```cmd
   cd C:\Proyectos\hotel-system
   code .
   ```

2. **Abre la terminal en VS Code:**
   - Presiona `Ctrl + ñ`
   - O ve a: Terminal → New Terminal

3. **Instala dependencias del backend:**
   ```cmd
   cd backend
   npm install
   ```

4. **Configura el archivo .env:**
   - En VS Code, abre `backend\.env.example`
   - Renómbralo a `.env` (quita el `.example`)
   - Si usas XAMPP, deja `DB_PASSWORD=` vacío
   - Si configuraste contraseña en MySQL, ponla ahí

5. **Inicia el backend:**
   ```cmd
   npm run dev
   ```

   ✅ **Deberías ver:**
   ```
   ✓ Servidor corriendo en: http://localhost:5000
   ✓ Conexión exitosa a la base de datos MySQL
   ```

---

## 🎨 Paso 3: Frontend (3 minutos)

1. **Abre una NUEVA terminal en VS Code:**
   - Haz clic en el **+** en la terminal
   - O presiona `Ctrl + Shift + ñ`

2. **Instala pnpm (si no lo tienes):**
   ```cmd
   npm install -g pnpm
   ```

3. **Instala dependencias del frontend:**
   ```cmd
   cd frontend
   pnpm install
   ```

4. **Inicia el frontend:**
   ```cmd
   pnpm run dev
   ```

   ✅ **Deberías ver:**
   ```
   ➜  Local:   http://localhost:3000/
   ```

---

## 🎉 Paso 4: ¡Listo! Accede al Sistema

1. **Abre tu navegador** (Chrome, Edge, Firefox)
2. **Ve a:** `http://localhost:3000`
3. **Inicia sesión con:**
   - **Email:** `admin@hotel.com`
   - **Password:** `admin123`

---

## 🖼️ ¿Qué Deberías Ver?

### En VS Code:
- **Terminal 1:** Backend corriendo en puerto 5000
- **Terminal 2:** Frontend corriendo en puerto 3000

### En el Navegador:
- Pantalla de login del sistema hotelero
- Después de iniciar sesión: Dashboard con estadísticas

---

## ❌ Problemas Comunes

### "npm no se reconoce"
**Solución:** Reinicia tu computadora después de instalar Node.js

### "Error: connect ECONNREFUSED"
**Solución:** 
- Verifica que MySQL esté corriendo en XAMPP (botón verde)
- Verifica `backend\.env` → `DB_PASSWORD=` debe estar vacío si usas XAMPP

### "Puerto 5000 ya en uso"
**Solución:**
```cmd
netstat -ano | findstr :5000
taskkill /PID XXXX /F
```
(Reemplaza XXXX con el número que aparece al final)

### "Access denied for user 'root'"
**Solución:** En `backend\.env`, deja `DB_PASSWORD=` vacío (sin comillas, sin espacios)

---

## 📚 Próximos Pasos

1. ✅ **Explora el Dashboard**
   - Verás estadísticas de ocupación e ingresos

2. ✅ **Prueba Habitaciones**
   - Crea algunas habitaciones
   - Cambia sus estados

3. ✅ **Prueba Huéspedes**
   - Registra algunos huéspedes
   - Usa la búsqueda

4. 📖 **Lee la documentación completa:**
   - `GUIA_WINDOWS.md` - Guía detallada
   - `COMANDOS_WINDOWS.md` - Todos los comandos
   - `README.md` - Documentación técnica

---

## 🔄 Comandos para Cada Día

### Iniciar el Sistema

```cmd
# Terminal 1
cd C:\Proyectos\hotel-system\backend
npm run dev

# Terminal 2 (nueva terminal)
cd C:\Proyectos\hotel-system\frontend
pnpm run dev
```

### Detener el Sistema

- Presiona `Ctrl + C` en cada terminal
- O cierra VS Code

### Ver Cambios Antes de Subir a Git

```cmd
git status          # Ver qué cambió
git diff           # Ver diferencias exactas
```

---

## 💡 Consejo Pro

**Crea un script para iniciar todo automáticamente:**

1. Crea un archivo `iniciar.bat` en `C:\Proyectos\hotel-system\`:

```batch
@echo off
echo Iniciando Sistema Hotelero...
echo.

echo [1/2] Iniciando Backend...
start cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend...
start cmd /k "cd frontend && pnpm run dev"

echo.
echo Sistema iniciado!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
```

2. Haz doble clic en `iniciar.bat` para iniciar todo de una vez

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. ✅ Verifica que XAMPP esté corriendo (MySQL verde)
2. ✅ Verifica que Node.js esté instalado: `node --version`
3. ✅ Lee los mensajes de error en la terminal
4. ✅ Consulta `GUIA_WINDOWS.md` para más detalles

---

**¡Disfruta desarrollando tu sistema hotelero! 🏨**
