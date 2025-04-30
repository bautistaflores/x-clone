# 1. Usa una imagen oficial de Node
FROM node:20

# 2. Crea un directorio dentro del contenedor
WORKDIR /app

# 3. Copia el package.json y package-lock.json
COPY package*.json ./

# 4. Instala las dependencias
RUN npm install

# 5. Copia el resto del código fuente
COPY . .

# 6. Expone el puerto (por ejemplo 3000, depende del servicio)
EXPOSE 3000

# 7. Comando para correr la app
CMD ["npm", "start"]
