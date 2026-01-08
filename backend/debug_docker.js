// Fichier: backend/debug_docker.js
const mysql = require('mysql2');

console.log("🚀 Démarrage du test DEPUIS le conteneur Backend...");

const connection = mysql.createConnection({
    // IMPORTANT : Dans Docker, le nom d'hôte est le nom du service défini dans docker-compose
    host: 'db', 
    user: 'root',
    password: 'rootpassword', // Votre mot de passe docker-compose
    database: 'eco_database',
    port: 3306 // Port interne (entre conteneurs, c'est toujours 3306)
});

connection.connect((err) => {
    if (err) {
        console.error("❌ ÉCHEC CONNEXION :", err.message);
        console.log("👉 Vérifiez que le conteneur 'db' est bien lancé.");
        process.exit(1);
    }
    console.log("✅ CONNECTÉ à la base de données 'db' !");

    connection.query('DESCRIBE products', (error, columns) => {
        if (error) {
            console.error("❌ Erreur SQL :", error.message);
        } else {
            const fields = columns.map(c => c.Field);
            console.log("📋 Colonnes vues par le Backend :", fields.join(', '));
            
            if (fields.includes('image_url')) {
                console.log("\n✨ SUCCÈS : Le backend VOIT la colonne 'image_url'.");
                console.log("💡 Si votre API plante encore, c'est que votre code Controller n'est pas à jour dans le conteneur.");
            } else {
                console.log("\n💀 FATAL : La colonne est ABSENTE pour le backend.");
            }
        }
        connection.end();
    });
});