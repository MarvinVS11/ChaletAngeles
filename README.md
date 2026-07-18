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

`client` y `admin` son proyectos independientes: cada uno tiene su propio `package.json` y `vercel.json`, por lo que se pueden desplegar en Vercel como dos proyectos separados (root directory `client` y `admin` respectivamente), ambos apuntando a la misma API.

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

## Despliegue

- **client** y **admin** se despliegan como dos proyectos Vercel independientes (root directory apuntando a cada carpeta). Cada uno necesita su propia variable `VITE_API_URL` apuntando a la API pública.
- **server** debe desplegarse aparte (por ejemplo Render, Railway o Fly.io), ya que es un servidor Express de larga duración. Configurar ahí `CLIENT_URL` y `ADMIN_URL` con las URLs finales de los dos frontends para que CORS los acepte.
