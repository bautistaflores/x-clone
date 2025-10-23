FROM node:20

# crea directorio dentro del contenedor
WORKDIR /app

# copia el package.json y package-lock.json
COPY package*.json ./

# instala las dependencias
RUN npm install --include=dev

# copia el resto del código fuente
COPY . .

# genera el cliente de Prisma
RUN npx prisma generate

# expone el puerto
EXPOSE 3000

# corre la app
CMD ["npm", "run", "dev"]
