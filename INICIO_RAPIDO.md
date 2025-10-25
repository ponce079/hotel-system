# 🚀 Guía de Inicio Rápido

## Pasos para ver el sistema funcionando

### 1. Configurar la Base de Datos (5 minutos)

1. Abre tu cliente de MySQL (phpMyAdmin, MySQL Workbench, etc.)
2. Crea una base de datos llamada `hotel_management`
3. Importa el archivo `database/schema.sql`

**Desde terminal:**
```bash
mysql -u root -p
CREATE DATABASE hotel_management;
exit

mysql -u root -p hotel_management < database/schema.sql
```

### 2. Iniciar el Backend (2 minutos)

```bash
# Ir a la carpeta del backend
cd backend

# Instalar dependencias (solo la primera vez)
npm install

# Configurar .env (solo la primera vez)
# Edita backend/.env y coloca tu contraseña de MySQL

# Iniciar el servidor
npm run dev
```

✅ **El backend estará corriendo en:** `http://localhost:5000`

### 3. Iniciar el Frontend (2 minutos)

**Abre una nueva terminal** (deja el backend corriendo)

```bash
# Ir a la carpeta del frontend
cd frontend

# Instalar dependencias (solo la primera vez)
pnpm install

# Iniciar la aplicación
pnpm run dev
```

✅ **El frontend estará corriendo en:** `http://localhost:3000`

### 4. Acceder al Sistema

1. Abre tu navegador en `http://localhost:3000`
2. Inicia sesión con:
   - **Email:** `admin@hotel.com`
   - **Password:** `admin123`

---

## ✨ ¡Listo! Ya puedes usar el sistema

### Funcionalidades disponibles:

- ✅ **Dashboard:** Ver estadísticas en tiempo real
- ✅ **Habitaciones:** Gestionar habitaciones y sus estados
- ✅ **Huéspedes:** Registrar y buscar huéspedes
- 🚧 **Reservas:** En desarrollo
- 🚧 **Facturación:** En desarrollo
- 🚧 **Servicios:** En desarrollo
- 🚧 **Reportes:** En desarrollo

---

## 📋 Checklist de Verificación

Antes de empezar, asegúrate de tener:

- [ ] Node.js instalado (versión 18+)
- [ ] MySQL instalado y corriendo
- [ ] npm o pnpm instalado
- [ ] Base de datos `hotel_management` creada
- [ ] Archivo `backend/.env` configurado con tus credenciales de MySQL

---

## ⚠️ Problemas Comunes

### "Error: connect ECONNREFUSED" en el backend
- Verifica que MySQL esté corriendo
- Verifica las credenciales en `backend/.env`

### "Cannot GET /api/..." en el frontend
- Verifica que el backend esté corriendo en el puerto 5000
- Verifica que `frontend/.env` tenga `VITE_API_URL=http://localhost:5000/api`

### "Access denied for user 'root'@'localhost'"
- Verifica tu contraseña de MySQL en `backend/.env`
- Asegúrate de que el usuario tenga permisos en la base de datos

---

## 🎯 Próximos Pasos

Una vez que el sistema esté funcionando:

1. Explora el Dashboard para ver las estadísticas
2. Crea algunas habitaciones desde el módulo de Habitaciones
3. Registra huéspedes desde el módulo de Huéspedes
4. Revisa el código para entender la estructura
5. Personaliza el sistema según tus necesidades

---

## 📚 Documentación Completa

Para más información, consulta:
- `README.md` - Documentación completa del proyecto
- `COMANDOS_UTILES.md` - Comandos útiles para desarrollo y Git
- `database/schema.sql` - Estructura de la base de datos
