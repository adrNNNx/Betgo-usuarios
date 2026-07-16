# Betgo Usuarios

Frontend de usuarios de Betgo. Next.js 16 (App Router) + React 19, TypeScript, Tailwind CSS y componentes shadcn/ui (Radix).

## Requisitos

- Node.js 20+
- npm
- Docker + Docker Compose (solo si se levanta por Docker)

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend. En Docker se bakea en el build: si cambia, hay que rebuildar la imagen. |

## Levantar en local

```bash
npm install
npm run dev
```

App disponible en [http://localhost:4200](http://localhost:4200).

Otros scripts:

```bash
npm run build   # build de producción
npm run start   # sirve el build (puerto 4200)
npm run lint    # eslint
```

## Levantar con Docker

El `docker-compose.yml` espera una red externa `betgo_network` (compartida con el backend). Crearla una sola vez si no existe:

```bash
docker network create betgo_network
```

Levantar:

```bash
docker-compose up -d --build
```

Ver logs:

```bash
docker-compose logs -f frontend
```

Detener:

```bash
docker-compose down
```

App disponible en [http://localhost:4200](http://localhost:4200).

`NEXT_PUBLIC_API_URL` se toma del `.env` al momento del build (`docker-compose up -d --build`). Si cambia la URL del backend, hay que rebuildar la imagen para que el cambio tenga efecto.

## Stack

- [Next.js](https://nextjs.org/docs) (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Zustand (estado), React Hook Form + Zod (formularios/validación), Axios (HTTP)
