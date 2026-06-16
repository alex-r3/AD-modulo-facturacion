# Imagen base: Node.js LTS (versión ligera)
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias primero (aprovecha caché de Docker)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código fuente
COPY . .

# Puerto expuesto (mismo que en .env)
EXPOSE 3001

# Comando de inicio
CMD ["node", "server.js"]
