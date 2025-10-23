FROM node:20-alpine

# crea directorio dentro del contenedor
WORKDIR /app

# copia el package.json y package-lock.json
COPY package*.json ./

# instala las dependencias
RUN npm install

# copia el resto del código fuente
COPY . .

# expone el puerto
EXPOSE 5173

# corre la app
CMD ["npm", "run", "dev"]