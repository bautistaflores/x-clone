#!/bin/sh
set -e

# Genera el cliente de Prisma
npx prisma generate

# Ejecuta las migraciones
npx prisma migrate deploy

# Ejecuta el servidor de desarrollo
exec npm run dev