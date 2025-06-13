# 🎬 Cinéphoria Desktop – Application bureautique

Bienvenue dans l'application bureautique de gestion des incidents pour le projet **Cinéphoria**.  
Elle est destinée aux **employés du cinéma** pour signaler, modifier ou supprimer les incidents techniques liés aux salles de projection.

---

## 🖥️ Fonctionnalités

- 🔐 Connexion sécurisée par identifiants employés
- 🛠️ Tableau de suivi des incidents par salle
- ➕ Ajout d’un incident
- ✏️ Modification d’un incident existant
- 🗑️ Suppression d’un incident
- 🎛️ Filtrage des salles par cinéma

L'application communique avec la même base de données que le site web **Cinéphoria**.

---

## 📥 Téléchargement & Installation (Windows)

### ✅ Prérequis

Aucun. L'application est packagée, prête à l’emploi.

### 🔗 Lien de téléchargement

➡️ [Télécharger l'application Cinéphoria Desktop (Windows)](https://github.com/lcisse/cinephoria-desktop/releases/tag/cinephoria-app-desktop-win-1.0.0)

---

### 🧾 Étapes d'installation

1. Cliquez sur le lien ci-dessus.
2. Téléchargez le fichier **`AppCinephoria-win32-x64.zip`**.
3. **Extrayez** le fichier ZIP dans le dossier de votre choix.
4. Double-cliquez sur **`AppCinephoria.exe`** pour lancer l'application.

L’application démarre automatiquement. Vous pouvez directement vous connecter avec les **identifiants fournis aux employés**.

---

## 🧑‍💼 Accès à l'application

🔐 Connectez-vous avec vos **identifiants employé**.  
En cas de mot de passe oublié, veuillez contacter un administrateur via l’espace web.

---

## 📁 Structure du dépôt

Ce dépôt contient :

- Le code source de l'application (ElectronJS)
- Le système de connexion
- L’intégration avec la base de données MySQL existante
- Le packaging avec `electron-builder`

---

## 🛠️ Technologies utilisées

- ElectronJS
- JavaScript (jQuery)
- MySQL (via `mysql2`)
- Bcrypt pour le hashage des mots de passe
