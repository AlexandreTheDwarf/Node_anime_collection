# Node Anime Collection

Node Anime Collection est une application backend permettant de gérer une collection d'animes. Elle offre des fonctionnalités CRUD (Create, Read, Update, Delete) pour ajouter, lire, mettre à jour et supprimer des entrées d'animes dans une base de données JSON, ainsi que la gestion des images associées aux animes.

## Table des matières

1. [Introduction](#introduction)
2. [Technologies utilisées](#technologies-utilisées)
3. [Installation](#installation)
4. [Utilisation](#utilisation)
5. [Exemples](#exemples)

## Introduction

Node Anime Collection est une application développée en Node.js qui fournit une API RESTful pour interagir avec une base de données JSON contenant des informations sur les animes. Elle permet aux utilisateurs d'effectuer des opérations de création, lecture, mise à jour et suppression d'animes, ainsi que de gérer les images associées à chaque anime.

## Technologies utilisées

- Node.js
- Express.js
- Multer
- JSON Web Token (JWT)
- File System (fs)

## Installation

1. Cloner ce dépôt sur votre machine locale.
2. Assurez-vous d'avoir Node.js installé sur votre système.
3. Naviguez jusqu'au répertoire du projet dans votre terminal.
4. Installez les dépendances en exécutant la commande `npm install`.
5. Assurez-vous d'avoir un dossier `DB` dans le répertoire racine du projet pour stocker la base de données JSON des animes.
6. Lancez l'application en exécutant la commande `node index.js`.
7. L'application sera disponible à l'adresse `http://localhost:3000`.

## Utilisation

L'API offre les endpoints suivants :

- `GET /anime` : Récupère tous les animes de la base de données.
- `GET /anime/:id` : Récupère un anime spécifique en fonction de son ID.
- `POST /anime` : Crée un nouvel anime dans la base de données.
- `PATCH /anime/:id` : Met à jour les informations d'un anime existant en fonction de son ID.
- `DELETE /anime/:id` : Supprime un anime de la base de données en fonction de son ID.

## Exemples

Voici quelques exemples d'utilisation de l'API :

- Pour récupérer tous les animes :
  ```
  GET http://localhost:3000/anime
  ```

- Pour créer un nouvel anime :
  ```
  POST http://localhost:3000/anime
  Body:
  {
      "nom_vo": "Nom original de l'anime",
      "nom_fichier": "Nom du fichier",
      "nbre_saisons": 3,
      "nbre_episodes": 24
  }
  ```
