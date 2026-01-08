const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Définir le chemin ABSOLU vers le dossier uploads
// On remonte d'un cran (..) si ce fichier est dans un dossier 'middleware' ou 'routes'
// Ajuste le nombre de '../' selon où se trouve ce fichier par rapport à la racine !
const uploadDir = path.join(__dirname, '../uploads'); 

// 2. Vérifier que le dossier existe, sinon le créer (Sécurité)
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // On utilise le chemin absolu calculé plus haut
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // On génère un nom unique avec extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname); // ex: .jpg
        cb(null, 'image-' + uniqueSuffix + ext);
    }
});

// 3. Configuration finale
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite 5 Mo
});

module.exports = upload;