# Monitoreo Container

Proyecto full stack para monitorear métricas de contenedores Docker en tiempo real, con backend en Node.js/TypeScript y frontend en React + Vite.  
Además incluye servicios auxiliares en Docker Compose (Checkmk, MySQL y Passbolt) para un entorno integral de operación.

## Arquitectura general

- **Frontend** (`/frontend`): interfaz de monitoreo con dashboards y gráficas.
- **Backend** (`/backend`): API REST que consulta `docker stats` y expone métricas.
- **Orquestación** (`docker-compose.yml`): levanta todos los servicios de la plataforma.
- **Checkmk / Passbolt / MySQL**: servicios complementarios para monitoreo y gestión.

## Tecnologías principales

- **Frontend**: React 19, TypeScript, Vite, TanStack Query, Recharts, Tailwind.
- **Backend**: Node.js 20, Express 5, TypeScript, CORS, Morgan, dotenv.
- **Contenedores**: Docker + Docker Compose.

## Estructura del repositorio

```text
monitoreo-container/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── handlers/monitor.ts
│   │   └── service/monitor.ts
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/custom/
│   │   ├── hooks/
│   │   └── service/
│   └── Dockerfile
├── checkmk/
│   └── Dockerfile
└── docker-compose.yml
```

## Funcionalidades

- Consulta de métricas de contenedores Docker desde backend.
- Endpoint API para exponer consumo de CPU, memoria, red, disco y PIDs.
- Dashboard con:
  - Resumen general de contenedores activos.
  - Vista general o por contenedor.
  - Gráficas de CPU/memoria.
  - Gráficas de red y disco.
  - Ranking Top CPU.

## Puertos y servicios (Docker Compose)

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`
- **Checkmk**: `http://localhost:8080` (y puerto `8000`)
- **Passbolt**: `http://localhost:9797`
- **MySQL**: `localhost:3306`

## Variables de entorno

### Backend (`/backend/.env`)

```env
PORT=3000
```

### Frontend (`/frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## API

### `GET /`
Health check básico:

```json
{ "message": "Service monitor is running!" }
```

### `GET /api/v1/monitor`
Retorna un arreglo con métricas de `docker stats` por contenedor.

## Ejecución rápida con Docker Compose

Desde la raíz del proyecto:

```bash
docker compose up --build -d
```

Para ver logs:

```bash
docker compose logs -f
```

Para detener:

```bash
docker compose down
```

## Ejecución por módulos (desarrollo)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Scripts útiles

### Backend

- `npm run dev` → desarrollo con nodemon.
- `npm run build` → compilación TypeScript.
- `npm run start` → ejecución de build.

### Frontend

- `npm run dev` → servidor Vite.
- `npm run build` → build de producción.
- `npm run lint` → validación ESLint.
- `npm run preview` → preview del build.

## Notas

- El backend requiere acceso al socket Docker (`/var/run/docker.sock`) para consultar métricas.
- En el estado actual del repositorio, existen errores de lint preexistentes en frontend y el script `npm test` de backend es un placeholder.
