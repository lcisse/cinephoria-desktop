const fs = require('fs');
const path = require('path');
const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config(); // Chargement des variables d'environnement

// Détecter si l'application est packagée
const isPackaged = process.mainModule && process.mainModule.filename.includes('app.asar');

// Définir le chemin du fichier `.env`
const envPath = isPackaged 
  ? path.join(process.resourcesPath, '.env')  // Mode packagé (dans app.asar)
  : path.join(__dirname, '../.env');          // Mode développement

// Charger les variables d'environnement depuis le bon chemin
require('dotenv').config({ path: envPath });

// Vérifier si le fichier `.env` existe bien
if (!fs.existsSync(envPath)) {
    console.error(`❌ ERREUR: Le fichier .env est introuvable à l'emplacement: ${envPath}`);
    console.error("L'application ne peut pas fonctionner sans les configurations.");
    process.exit(1);
}

// Clé API pour accéder à l'API
const API_SECRET_KEY = process.env.API_SECRET_KEY;
const API_URL = process.env.API_URL;

let cachedConfig = null; // Cache des infos de connexion pour éviter les requêtes répétées

/**
 * Récupère la configuration depuis l'API et la met en cache.
 */
async function getConfig() {
    if (cachedConfig) return cachedConfig; // Si déjà récupéré, éviter un nouvel appel API

    try {
        console.log("🔍 Récupération de la configuration depuis l'API...");
        const response = await axios.get(API_URL, {
            headers: { "x-api-key": API_SECRET_KEY } // Ajout de la clé API dans l'en-tête
        });
        
        // Nettoyage du format des données (suppression de "http://")
        cachedConfig = {
            DB_HOST: response.data.DB_HOST.replace(/^http:\/\//, ""),
            DB_USER: response.data.DB_USER,
            DB_PASSWORD: response.data.DB_PASSWORD,
            DB_NAME: response.data.DB_NAME,
            DB_CONNECTION_LIMIT: parseInt(response.data.DB_CONNECTION_LIMIT) || 10
        };
        return cachedConfig;
    } catch (error) {
        console.error("❌ Impossible de récupérer la configuration depuis l'API :", error.message);
        process.exit(1); // Arrête l'application si la config ne peut pas être chargée
    }
}

/**
 * Initialise la connexion à la base de données.
 */
async function connectDB() {
    const config = await getConfig(); // Récupération des infos depuis l'API

    if (!config.DB_HOST || !config.DB_USER || !config.DB_PASSWORD || !config.DB_NAME) {
        console.error("❌ Configuration MySQL incomplète !");
        process.exit(1);
    }

    try {
        console.log("🔌 Connexion à la base de données...");
        const db = mysql.createPool({
            host: config.DB_HOST,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            database: config.DB_NAME,
            waitForConnections: true,
            connectionLimit: config.DB_CONNECTION_LIMIT,
            queueLimit: 0
        });

        console.log("✅ Connexion à MySQL réussie !");
        return db;
    } catch (error) {
        console.error("❌ Erreur de connexion à MySQL :", error.message);
        process.exit(1);
    }
}

const dbPromise = connectDB();
module.exports = dbPromise;
