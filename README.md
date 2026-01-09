
# FreshConnect - HyperFresh MVP

Une application web de lutte contre le gaspillage alimentaire connectant magasins et consommateurs autour de paniers surprises à prix réduits.

## 🎯 Concept

**FreshConnect** est un "Serious Game" écologique qui :
- Connecte les magasins **HyperFresh** aux consommateurs
- Propose des paniers surprises pour écouler les stocks
- Calcule l'impact écologique réel (économies € et CO2 évité)
- Gamifie la réduction des déchets alimentaires

## 🏗️ Architecture Technique

### Stack Technologies
- **Backend** : Node.js + Express
- **Base de données** : MySQL 8.0
- **Frontend** : React + Vite + TailwindCSS
- **Conteneurisation** : Docker + Docker Compose
- **Authentification** : JWT

### Déploiement Hybride
```
┌─────────────────────────────────────┐
│   Docker (Backend + Base de données) │
│  ├─ MySQL 8.0 (Port 3307)          │
│  └─ Node.js Express (Port 5000)    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Local (Frontend)                   │
│  └─ React Vite (Port 5173)          │
└─────────────────────────────────────┘
```

## 📁 Structure du Projet

```
hyperfresh-mvp/
├── backend/
│   ├── Dockerfile
│   ├── uploads/          (Stockage images - volume Docker)
│   └── ...
├── db/
│   └── init.sql          (Initialisation MySQL)
├── frontend/
│   ├── src/
│   └── ...
├── docker-compose.yaml
└── README.md
```

## ⚙️ Configuration Docker

### Services disponibles

| Service | Image | Port (Externe:Interne) | Identifiants |
|---------|-------|------------------------|--------------|
| **Database** | MySQL 8.0 | 3307:3306 | root / rootpassword |
| **Backend** | Node.js | 5000:5000 | - |

### Variables d'environnement clés
- **Database** : `eco_database`
- **Volume uploads** : `backend_uploads` (persistant)

## ✨ Fonctionnalités

- ✅ **Authentification** : Login/Register avec JWT
- ✅ **Catalogue paniers** : Tri par date, gestion stocks en temps réel
- ✅ **Détail panier** : Calcul prix barré et économies réalisées
- ✅ **Dashboard profil** : Jauge d'impact écologique personnalisée
- ✅ **Paiement simulé** : Apple Pay / Google Pay
- 🎉 **Easter Egg** : Clause "Paillettes" cachée dans les CGU (animation)

## 🚀 Installation & Démarrage

### Prérequis
- Docker Desktop (dernière version)
- Node.js v18+ 
- Git

### Étape 1 : Cloner le projet
```bash
git clone https://github.com/username/hyperfresh-mvp.git
cd hyperfresh-mvp
```

### Étape 2 : Lancer Backend + Base de données
```bash
docker-compose up --build
```

⏳ **Attendre le message** : `Connected to database`

Les services seront accessibles à :
- **API Backend** : `http://localhost:5000`
- **MySQL** : `localhost:3307`

### Étape 3 : Lancer le Frontend
```bash
cd frontend
npm install
npm run dev
```

Accéder à : **`http://localhost:5173`**

## 🔧 Dépannage

### Port déjà utilisé
Si le port `3307` (DB) ou `5000` (Backend) est occupé, modifiez `docker-compose.yaml` :
```yaml
# Exemple : changer le port MySQL
ports:
    - "3308:3306"  # Nouveau port externe
```

Puis relancez : `docker-compose up --build`

### Problème de persistance des images
Les uploads sont stockés dans le **volume Docker** `backend_uploads`. Pour les réinitialiser :
```bash
docker-compose down -v  # Supprime volumes
docker-compose up --build
```

### Logs en direct
```bash
docker-compose logs -f backend
docker-compose logs -f db
```

## 📦 Volumes Docker

| Volume | Chemin conteneur | Fonction |
|--------|------------------|----------|
| `backend_uploads` | `/app/uploads` | Stockage images produits |

## 🛑 Arrêter les services
```bash
docker-compose down
```

## 📝 Notes de développement

- Le **Frontend tourne localement** (pas containerisé) pour faciliter le hot-reload avec Vite
- Les **images produits** persisten dans le volume Docker après redémarrage
- L'API est totalement indépendante du Frontend (CORS configuré)

## 📞 Support
Pour tout problème, consultez les logs Docker ou vérifiez la disponibilité des ports.
