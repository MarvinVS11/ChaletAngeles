# Chalet Los Ángeles

Sitio web para un chalet: información del alojamiento, formulario de reservas y panel administrativo.

- **Frontend (cliente):** React + Vite (`/client`)
- **Frontend (admin):** React + Vite (`/admin`)
- **Backend:** Node.js + Express (`/server`)
- **Base de datos:** MongoDB (Mongoose)

## Estructura

```
client/   Sitio público (React + Vite)
admin/    Panel administrativo (React + Vite)
server/   API REST (Express + Mongoose), usada por ambos frontends
```

`client`, `admin` y `server` son proyectos independientes, cada uno con su propio `package.json`, pensados para desplegarse como **tres proyectos Vercel separados** (root directory `client`, `admin` y `server` respectivamente). El servidor corre en Vercel como funciones serverless (`server/api/[...path].js`), no como proceso persistente.

## Requisitos

- Node.js 18+
- Una base de datos MongoDB (local o MongoDB Atlas)

## Configuración

### Servidor (API)

```bash
cd server
cp .env.example .env   # completar MONGODB_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASSWORD
npm install
npm run seed            # carga datos de ejemplo del chalet
npm run dev
```

Variables de entorno relevantes:

- `MONGODB_URI` — conexión a MongoDB
- `CLIENT_URL` / `ADMIN_URL` — orígenes permitidos por CORS
- `JWT_SECRET` — secreto para firmar los tokens del panel admin
- `ADMIN_USER` / `ADMIN_PASSWORD` — credenciales del panel administrativo

### Cliente (sitio público)

```bash
cd client
cp .env.example .env   # completar VITE_API_URL si es distinto de localhost:5000
npm install
npm run dev
```

Disponible en `http://localhost:5173`.

### Admin (panel administrativo)

```bash
cd admin
cp .env.example .env   # completar VITE_API_URL si es distinto de localhost:5000
npm install
npm run dev
```

Disponible en `http://localhost:5174`. Iniciar sesión con las credenciales `ADMIN_USER` / `ADMIN_PASSWORD` configuradas en el servidor. Desde ahí se puede:

- Editar la información del chalet (descripción, precio, comodidades, reglas) — se guarda en MongoDB y el sitio público la lee al instante.
- Ver el listado de reservas y cambiar su estado (pendiente / confirmada / cancelada).

## Endpoints principales

- `GET /api/chalet` — información del chalet (pública)
- `PUT /api/chalet` — actualizar información del chalet (requiere token admin)
- `GET /api/reservations/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` — disponibilidad (pública)
- `POST /api/reservations` — crear una reserva (pública)
- `GET /api/reservations` — listar reservas (requiere token admin)
- `PATCH /api/reservations/:id/status` — cambiar estado de una reserva (requiere token admin)
- `POST /api/auth/login` — iniciar sesión en el panel admin

## Despliegue (Vercel)

Los tres proyectos se despliegan por separado en Vercel, todos importando el mismo repositorio con distinto "Root Directory":

1. **server** (root directory `server`): funciones serverless en `server/api/[...path].js`, sin build command. Variables de entorno: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`, `CLIENT_URL`, `ADMIN_URL`.
2. **client** (root directory `client`): variable `VITE_API_URL` = `https://<tu-proyecto-server>.vercel.app/api`.
3. **admin** (root directory `admin`): variable `VITE_API_URL` = `https://<tu-proyecto-server>.vercel.app/api`.

Después de desplegar `client` y `admin`, volvé al proyecto `server` en Vercel y completá `CLIENT_URL` / `ADMIN_URL` con las URLs finales de esos dos despliegues (para que CORS los acepte), y volvé a desplegar.
