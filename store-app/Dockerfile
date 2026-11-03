FROM node:26

WORKDIR /workdir/app

# Copiar archivos de dependencias
COPY package*json .

# Instalar dependencias limpiamente
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
