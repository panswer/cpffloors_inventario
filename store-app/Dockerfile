FROM node:22-alpine

WORKDIR /workdir/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente de la aplicación
COPY . .

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Usar el compilador tradicional estable (Webpack) dentro de Docker
CMD ["npm", "run", "dev:webpack"]
