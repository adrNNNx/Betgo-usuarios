FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN test -n "$NEXT_PUBLIC_API_URL" || { \
      echo ""; \
      echo "ERROR: falta NEXT_PUBLIC_API_URL."; \
      echo "Debe ser la URL pública del backend."; \
      echo "  Ej. local:    http://localhost:3000/api"; \
      echo ""; \
      exit 1; \
    }
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 4200
CMD ["npm", "run", "start"]
