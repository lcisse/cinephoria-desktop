const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

// Définir si l'application est packagée ou en développement
const isPackaged = process.mainModule && process.mainModule.filename.includes('app.asar');

// Définir le bon chemin vers le fichier .env
const envPath = isPackaged 
  ? path.join(process.resourcesPath, '.env')  // Mode packagé
  : path.join(__dirname, '../.env');             // Mode développement

// Charger le fichier .env
require('dotenv').config({ path: envPath });

// Vérification si le fichier `.env` existe bien
if (!fs.existsSync(envPath)) {
    console.error(`❌ ERREUR: Le fichier .env est introuvable à l'emplacement: ${envPath}`);
    console.error("L'application ne peut pas fonctionner sans les configurations.");
    process.exit(1);
}

// Fonction pour récupérer l'IP de l'hôte Docker (Windows uniquement)
function getHostIP() {
    try {
        const result = execSync('ipconfig').toString();
        const matches = result.match(/IPv4.*?(\d+\.\d+\.\d+\.\d+)/);
        return matches ? matches[1] : '127.0.0.1';
    } catch (error) {
        console.error("⚠️ Impossible de récupérer l'adresse IP de l'hôte Docker.", error);
        return '127.0.0.1';
    }
}

// Charger les variables d'environnement MySQL
const DB_HOST = process.env.DB_HOST || getHostIP();
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Vérification stricte des identifiants MySQL
if (!DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error("❌ ERREUR: Identifiants MySQL manquants dans le fichier .env !");
    console.error("Veuillez vous assurer que le fichier .env est bien configuré.");
    process.exit(1);
}

// Création du pool de connexion MySQL sécurisé
const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0
});

module.exports = db;
