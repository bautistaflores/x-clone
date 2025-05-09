# 1. Usa una imagen oficial de Node
FROM node:20

# 2. Crea un directorio dentro del contenedor
WORKDIR /app

# 3. Copia el package.json y package-lock.json
COPY package*.json ./

COPY .env .

# 4. Instala las dependencias
RUN npm install --include=dev

# 5. Copia el resto del código fuente
COPY . .

# 🔹 Genera el cliente de Prisma
RUN npx prisma generate

# 6. Expone el puerto
EXPOSE 3000

# 7. Comando para correr la app
CMD ["npm", "run", "dev"]
