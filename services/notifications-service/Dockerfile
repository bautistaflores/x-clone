# --- BASE para ambas etapas ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# --- DESARROLLO ---
FROM base AS development
ENV NODE_ENV=development

RUN npm ci
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- PRODUCCION ---
FROM base AS production
ENV NODE_ENV=production

RUN npm ci --omit=dev
COPY . .

RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "start"]