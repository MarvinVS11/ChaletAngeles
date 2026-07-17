# Chalet Los Ángeles

Sitio web para un chalet: información del alojamiento y formulario de reservas.

- **Frontend:** React + Vite (`/client`)
- **Backend:** Node.js + Express (`/server`)
- **Base de datos:** MongoDB (Mongoose)

## Estructura

```
client/   App React (Vite)
server/   API REST (Express + Mongoose)
```

## Requisitos

- Node.js 18+
- Una base de datos MongoDB (local o MongoDB Atlas)

## Configuración

### Servidor

```bash
cd server
cp .env.example .env   # completar MONGODB_URI
npm install
npm run seed            # carga datos de ejemplo del chalet
npm run dev
```

### Cliente

```bash
cd client
cp .env.example .env   # completar VITE_API_URL si es distinto de localhost:5000
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173` y la API en `http://localhost:5000/api`.

## Endpoints principales

- `GET /api/chalet` — información del chalet
- `GET /api/reservations/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` — disponibilidad
- `POST /api/reservations` — crear una reserva
