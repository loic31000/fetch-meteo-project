# 🌤️ Application Météo - JavaScript Vanilla

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

Conception d'une application météo Single Page Application (SPA) en JavaScript natif, exploitant les API REST de la plateforme **Open-Meteo**. L'application permet de récupérer les conditions météorologiques en temps réel soit par géolocalisation, soit par recherche textuelle de ville.

---

## 📋 Cahier des Charges & Fonctionnalités

| Statut | Fonctionnalité | Description |
| :---: | :--- | :--- |
| 🔹 | **Recherche par coordonnées** | Affiche la météo en saisissant manuellement une latitude et une longitude. |
| 🔹 | **Recherche par Ville** | Intégration de l'API de géocodage pour trouver les coordonnées à partir d'un nom de ville. |
| 🔹 | **Rendus Visuels Dynamiques** | Affichage d'une icône cohérente (`/icon/`) selon le code météo retourné par l'API (soleil, pluie, etc.). |
| 🎁 | **[BONUS] Géolocalisation Native** | Utilisation de l'API Geolocation du navigateur pour afficher la météo locale dès l'ouverture du site. |
| 🎁 | **[BONUS] Mode Jour / Nuit** | Modification dynamique du dégradé de fond (`body`) selon l'état `is_day` fourni par l'API. |

---

## 🎨 Maquette du Projet

Les spécifications visuelles et l'interface utilisateur sont disponibles sur la [Maquette Figma](https://www.figma.com/proto/SxzRQi4Gdf3NkEvVr0gvg5/Untitled?node-id=1-2&t=VxVuPYHtZZgQDDAg-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1).

![Aperçu Maquette](image-3.png)

---

## ⚙️ Installation et Lancement

Pour éviter les restrictions de sécurité des navigateurs (erreurs CORS) lors des appels API et de la gestion des assets, l'application doit impérativement être servie via un serveur HTTP local.

### Option 1 : Lancement local (Sans Docker)

* **Via l'extension VS Code (Recommandé) :**
  Installez l'extension **Live Server** dans Visual Studio Code. Faites un clic droit sur votre fichier `index.html` puis sélectionnez **Open with Live Server**.

* **Via Python :**
  Lancez un serveur instantané dans votre terminal à la racine du projet :
  ```bash
  python3 -m http.server 1212
```

Accédez ensuite à l'application sur [http://localhost:1212](https://www.google.com/search?q=http://localhost:1212).

### Option 2 : Lancement conteneurisé (Avec Docker)

Cette méthode utilise un conteneur léger basé sur Apache (`httpd:2.4`) pour héberger l'application.

1. **Construire l'image Docker (en minuscules) :**
```bash
docker build -t dom-vanilla .
```


2. **Créer et lancer le conteneur en arrière-plan :**
```bash
docker run -d -p 1212:80 --name twelve-project dom-vanilla
```


3. **Accéder à l'application :**
Ouvrez votre navigateur sur [http://localhost:1212](https://www.google.com/search?q=http://localhost:1212).

---

## 🛠️ Aide-mémoire Docker

* **Arrêter l'application :** `docker stop twelve-project`
* **Relancer l'application :** `docker start twelve-project`
* **Re-buider après modification (sans cache) :** ```bash
docker rm -f twelve-project && docker build --no-cache -t dom-vanilla . && docker run -d -p 1212:80 --name twelve-project dom-vanilla
```

---

## ⚠️ Notes techniques sur la Géolocalisation

L'implémentation de l'API native `navigator.geolocation` dépend fortement des politiques de sécurité des navigateurs (ex: restrictions strictes sur Firefox ou Chromium sans HTTPS).