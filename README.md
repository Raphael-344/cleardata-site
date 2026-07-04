# ClearData

Plateforme nationale de surveillance de la qualité de l'air en France, construite autour d'une base de données relationnelle de ~3 millions de relevés réels issus de données INSEE.

## Démo en ligne

**[cleardata-site.vercel.app](https://cleardata-site.vercel.app)**

## Contexte du projet

ClearData est un projet réalisé dans le cadre de la formation **CESI** (groupe projet), simulant une mission pour le Ministère de la Transition Écologique : concevoir un outil centralisé de stockage et d'interrogation des données de qualité de l'air sur le territoire français.

J'ai été responsable de la **contribution technique principale** : modélisation de la base de données (Merise), génération et import du jeu de données, développement du site (Next.js), écriture des requêtes SQL métier et déploiement.

## Stack technique

- **Frontend / Backend** : [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
- **Base de données** : MySQL (schéma relationnel), migré vers [TiDB Cloud](https://www.pingcap.com/tidb-cloud/) (compatible protocole MySQL) pour l'hébergement gratuit en production
- **Modélisation des données** : méthode **Merise** (MCD/MLD) pour la conception du schéma relationnel (agences, capteurs, gaz, relevés, rapports, employés)
- **Génération des données** : scripts **Python** pour produire le jeu de données synthétique à partir de données réelles INSEE (communes, régions)
- **Visualisation** : [Recharts](https://recharts.org/) (graphiques), [Leaflet](https://leafletjs.com/) / react-leaflet (carte interactive)
- **UI** : lucide-react, clsx, tailwind-merge
- **Déploiement** : [Vercel](https://vercel.com/)

## Fonctionnalités principales

- **Carte interactive** — visualisation des concentrations de gaz par ville sur une carte de France zoomable, filtrable par gaz et par date
- **Graphiques & tendances** — évolution temporelle des concentrations, comparaisons inter-régions, répartition par gaz
- **12 requêtes SQL** — jeu de requêtes du cahier des charges (jointures, sous-requêtes corrélées, agrégations) exécutées en direct sur la base et affichées avec leurs résultats
- **Recherche de ville** — recherche par nom de commune avec dernières concentrations relevées, tous gaz confondus
- **Requêtes SQL personnalisées** — endpoint permettant d'exécuter des requêtes `SELECT` arbitraires sur la base

## Chiffres clés

| Donnée | Volume |
|---|---|
| Relevés de concentration | ~2 934 540 |
| Capteurs déployés | 244 545 |
| Agences régionales | 101 |
| Gaz surveillés | 7 (CO2, CH4, N2O, O3, HFC, SF6, NH3) |
| Rapports publiés | 96 |
| Agents terrain | 206 |

## Installation et lancement en local

### Prérequis

- Node.js 18+
- Un accès à une base MySQL compatible (MySQL 8+ ou TiDB Cloud Serverless — [créer un cluster gratuit](https://tidbcloud.com))

### Étapes

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/Raphael-344/cleardata-site.git
   cd cleardata-site
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Créer un fichier `.env.local` à la racine :

   ```
   DB_HOST=<host de la base>
   DB_PORT=<port, ex: 4000 pour TiDB Cloud>
   DB_USER=<utilisateur>
   DB_PASSWORD=<mot de passe>
   DB_NAME=<nom de la base>
   ```

4. **Importer le schéma et les données**

   Importer le dump SQL du schéma (tables `Agence`, `CAPTEUR`, `GAZ`, `RELEVE`, `RAPPORT`, `EMPLOYE`, etc.) dans votre base MySQL/TiDB.

5. **Lancer le serveur de développement**

   ```bash
   npm run dev
   ```

   Le site est accessible sur [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur en mode production |
