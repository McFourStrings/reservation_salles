# Reservation Salle

## Description du projet

Ce projet est un exercice visant à s'entrainer à l'utilisation de PHP Symfony. Il s'agit d'une application web de gestion de réservations de salles. Elle est construite autour d'une API backend en Symfony et d'un frontend en React avec Vite, afin de permettre la réservation, la consultation et la gestion des salles et des réservations de manière fluide.

## Stack et dépendances

### Backend
- PHP 8.4+
- Symfony 8.1
- Doctrine ORM
- Doctrine Migrations
- Lexik JWT Authentication
- Nelmio CORS Bundle
- Twig
- PHPUnit
- PostgreSQL (via Docker Compose)

### Frontend
- React 19
- Vite
- React Router DOM
- Axios
- jwt-decode
- ESLint

## Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :
- PHP 8.4 ou plus
- Composer
- Node.js 20+ et npm
- Docker Desktop (pour la base de données PostgreSQL)
- Git

## Installation du backend

1. Se placer dans le dossier backend :
   ```bash
   cd backend
   ```

2. Installer les dépendances PHP :
   ```bash
   composer install
   ```

3. Configurer les variables d'environnement :
   - Vérifier le fichier `.env` ou créer un fichier `.env.local` si nécessaire.
   - Assurer la configuration de la base de données, notamment `DATABASE_URL`.

4. Démarrer la base de données PostgreSQL avec Docker :
   ```bash
   docker compose up -d database
   ```

5. Créer la base de données et exécuter les migrations :
   ```bash
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate
   ```

6. Générer les clés JWT si vous utilisez l'authentification JWT :
   ```bash
   php bin/console lexik:jwt:generate-keypair
   ```

7. Lancer le serveur Symfony :
   ```bash
   symfony serve
   ```

Le backend sera généralement disponible sur :
- http://localhost:8000

## Installation du frontend

1. Se placer dans le dossier frontend :
   ```bash
   cd reservation-salle-frontend
   ```

2. Installer les dépendances JavaScript :
   ```bash
   npm install
   ```

3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

Le frontend sera généralement disponible sur :
- http://localhost:5173

## Vérification rapide

Une fois les deux parties lancées, vous pouvez vérifier que l'application fonctionne correctement :
- Ouvrir l'interface frontend dans votre navigateur.
- Vérifier que les appels API vers le backend répondent correctement.

## Commandes utiles

### Backend
```bash
php bin/console cache:clear
php bin/console doctrine:migrations:migrate
php bin/console doctrine:schema:validate
```

### Frontend
```bash
npm run build
npm run lint
npm run preview
```

## Notes

- Si vous rencontrez des problèmes de connexion à la base de données, vérifiez la configuration `DATABASE_URL` dans votre environnement.
- Pour un environnement de développement plus propre, il est recommandé d'utiliser des variables d'environnement spécifiques à votre machine.
