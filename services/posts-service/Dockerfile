FROM node:20-alpine

# crea directorio dentro del contenedor
WORKDIR /app

# establece el entorno de producción
ENV NODE_ENV=production

# copia el package.json y package-lock.json
COPY package*.json ./

# instala las dependencias
RUN npm ci --omit=dev

# copia el resto del código fuente
COPY . .

# genera el cliente de Prisma
RUN npx prisma generate

# expone el puerto
EXPOSE 3000

# corre la app
CMD ["npm", "start"]
