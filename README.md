# ClearData

Plateforme nationale de surveillance de la qualité de l'air en France, construite autour d'une base de données relationnelle de ~3 millions de relevés réels issus de données INSEE.

## Démo en ligne

**[cleardata-site.vercel.app](https://cleardata-site.vercel.app)**

## Contexte du projet

ClearData est un projet réalisé dans le cadre de la formation **CESI** (groupe projet), simulant une mission pour le Ministère de la Transition Écologique : concevoir un outil centralisé de stockage et d'interrogation des données de qualité de l'air sur le territoire français.

J'ai été responsable de la **contribution technique principale** : modélisation de la base de données (Merise), génération et import du jeu de données, développement du site (Next.js), écriture des requêtes SQL métier et déploiement.

## Stack technique

- **Frontend / Backend** : [Next.js 14.2](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
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
- **Requêtes en langage naturel** — une question en français (« liste des agences », « capteurs actifs »…) est traduite en `SELECT` et exécutée via un endpoint sécurisé (voir ci-dessous)

### Sécurité de l'endpoint SQL libre (`/api/requetes/custom`)

Les requêtes libres passent par un garde-fou applicatif ([`src/lib/sqlGuard.ts`](src/lib/sqlGuard.ts)) :

- une seule instruction, uniquement `SELECT` (pas de commentaires, `UNION`, `INTO OUTFILE`, `SLEEP`, variables système…) ;
- tables autorisées : `Agence`, `CAPTEUR`, `GAZ`, `RELEVE`, `RAPPORT`, `EMPLOYE` (sous-requêtes comprises) ;
- `LIMIT` imposé (100 lignes max) et temps d'exécution limité à 5 s.

## Chiffres clés

| Donnée | Volume |
|---|---|
| Relevés de concentration | ~2 934 540 |
| Capteurs déployés | 244 545 |
| Agences régionales | 101 |
| Gaz surveillés | 7 (CO2, CH4, N2O, O3, HFC, SF6, NH3) |
| Rapports publiés | 96 |
| Agents terrain | 206 |

Les volumes ci-dessus sont ceux renvoyés par `/api/stats` (requêtes `COUNT(*)` sur la base de production). Les relevés couvrent **mai 2025 à avril 2026** (un relevé mensuel par capteur).

### Adaptation des requêtes aux données

Le jeu de données a été régénéré sur la période mai 2025 – avril 2026. Trois requêtes du cahier des charges ont donc été adaptées aux données réellement disponibles, sans modifier la logique SQL :

| Requête | Énoncé d'origine | Version adaptée |
|---|---|---|
| R05 | CH4 en Île-de-France, Bretagne, Occitanie — mai-juin 2023 | même requête sur mai-juin **2025** |
| R07 | Rapports concernant le NH3 | rapports concernant le **CO2** (aucun rapport n'est lié au NH3 dans les données) |
| R09 | Moyennes par gaz en Île-de-France — 2020 | même requête sur **2025** |

Les graphiques « comparaison régions » et « tous les gaz » portent sur les 12 derniers mois disponibles.

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

   Copier `.env.example` en `.env.local` à la racine et le compléter :

   ```
   DB_HOST=<host de la base>
   DB_PORT=<port, ex: 4000 pour TiDB Cloud>
   DB_USER=<utilisateur>
   DB_PASSWORD=<mot de passe>
   DB_NAME=<nom de la base>
   ```

4. **Base de données**

   Le dump SQL (schéma + ~3 M de relevés) n'est pas versionné dans ce dépôt en raison de sa taille. Sans accès à une base peuplée, le site se lance et les pages s'affichent, mais les appels API renvoient une erreur. Pour voir le site avec ses données, utiliser la [démo en ligne](https://cleardata-site.vercel.app).

5. **Lancer le serveur de développement**

   ```bash
   npm run dev
   ```

   Le site est accessible sur [http://localhost:3000](http://localhost:3000).

### Fond de carte (clé CARTO)

Depuis septembre 2026, les fonds de carte [CARTO Basemaps](https://carto.com/basemaps/apikey) exigent une clé d'API (gratuite jusqu'à 5 M de requêtes par mois en usage non commercial). Renseigner `NEXT_PUBLIC_CARTO_API_KEY` dans `.env.local` (et dans les variables d'environnement Vercel). Sans clé, le site fonctionne mais les tuiles affichent un filigrane « API KEY REQUIRED ».

### Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le serveur en mode production |

## Tester en 2 minutes

Sur la démo en ligne :

1. **Accueil** — les compteurs (agences, capteurs, relevés) s'affichent.
2. **Requêtes** — lancer R05, R07 et R09 : chacune renvoie des lignes.
3. **Carte** — choisir un gaz puis un mois entre mai 2025 et avril 2026.
4. **Recherche** — taper « Paris ».
5. API : [`/api/stats`](https://cleardata-site.vercel.app/api/stats), [`/api/requetes?id=5`](https://cleardata-site.vercel.app/api/requetes?id=5)
