# Dockerfile para ms-products
# Usar imagen más reciente y específica
FROM node:20.9.0-alpine3.19 AS base

# Instalar dependencias del sistema
RUN apk add --no-cache dumb-init curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (mejor caching)
COPY --chown=nestjs:nodejs package*.json ./

# ==============================================
# Etapa de desarrollo
# ==============================================
FROM base AS development

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci --no-audit --no-fund

# Copiar código fuente
COPY --chown=nestjs:nodejs . .

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:dev"]

# ==============================================
# Etapa de construcción
# ==============================================
FROM base AS builder

# Instalar todas las dependencias para construir
RUN npm ci --no-audit --no-fund

# Copiar código fuente
COPY --chown=nestjs:nodejs . .

# Construir aplicación
RUN npm run build

# Limpiar devDependencies y instalar solo producción
RUN npm prune --omit=dev && npm cache clean --force

# ==============================================
# Etapa de producción
# ==============================================
FROM base AS production

# Variables de entorno para producción
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn

# Copiar solo dependencias de producción desde builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar aplicación construida
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]