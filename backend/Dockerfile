# Utilise une version légère de Node
FROM node:18-alpine

# Crée le dossier de travail dans le conteneur
WORKDIR /usr/src/app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste du code source
COPY . .

# Expose le port défini dans server.js
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "start"]