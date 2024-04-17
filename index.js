const express = require('express');
const path = require('path'); // Importe le module "path"
const multer = require('multer');
const fs = require('fs');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

////////////////////////////////
//permettre l'accés a l'api (CORS)

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,Origin, X-Requested-With, Content, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });
////////////////////////////////////////////////////////////////////////////

// Indique à Express d'utiliser le dossier 'img' pour servir des fichiers statiques
app.use('/img', express.static('img'));

////////////////////////////////////////////////////////////////////////////

// Configuration de Multer pour l'upload d'image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './img'); // Destination où les images seront stockées
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Génère un nom unique pour l'image
    }
});
const upload = multer({ storage });

////////////////////////////////////////////////////////////////////////////

//Read

app.get('/anime', (req, res) => {
    const filePath = path.join(__dirname, 'DB', 'anime.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier', err);
            res.status(500).send('Erreur lors de la lecture du fichier');
            return;
        }

        let animes = JSON.parse(data); 
        animes.sort((a, b) => a.nom_vo.localeCompare(b.nom_vo)); // Tri des animes par nom original

        res.json(animes);
    });
});

////////////////////////////////////////////////////////////////////////////

// Read (ID)

app.get('/anime/:id', (req, res) => {
    const id = parseInt(req.params.id);  // Convertit l'ID de paramètre en nombre
    const filePath = path.join(__dirname, 'DB', 'anime.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier', err);
            res.status(500).send('Erreur lors de la lecture du fichier');
            return;
        }
        
        const animes = JSON.parse(data);
        const anime = animes.find(a => a.id === id);

        if (!anime) {
            res.status(404).send('Anime non trouvé');
            return;
        }

        res.json(anime);
    });
});

////////////////////////////////////////////////////////////////////////////

// Create

// Middleware pour gérer l'upload d'image
app.post('/anime', upload.single('image'), (req, res) => {
    // Récupération des données de l'anime depuis le corps de la requête
    const { nom_vo, nom_fichier, nbre_saisons, nbre_episodes } = req.body;

    // Récupération du chemin de l'image uploadée
    const imagePath = `./img/${req.file.filename}`;

    // Enregistrement des données de l'anime dans la base de données ou le fichier JSON
    // Exemple : sauvegarde dans un fichier JSON
    const anime = {
        id: Date.now(), // Génère un ID unique pour l'anime
        nom_vo,
        nom_fichier,
        nbre_saisons: parseInt(nbre_saisons),
        nbre_episodes: parseInt(nbre_episodes),
        image: imagePath // Stocke le chemin de l'image
    };

    // Lecture du fichier JSON contenant les animes
    const filePath = path.join(__dirname, 'DB', 'anime.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier', err);
            return res.status(500).send('Erreur lors de la lecture du fichier');
        }

        let animes = JSON.parse(data); // Parse le contenu JSON en objet JavaScript
        animes.push(anime); // Ajoute le nouvel anime à la liste des animes

        // Écriture des données mises à jour dans le fichier JSON
        fs.writeFile(filePath, JSON.stringify(animes, null, 2), err => {
            if (err) {
                console.error("Erreur lors de l'écriture du fichier", err);
                return res.status(500).send("Erreur lors de l'enregistrement des données");
            }

            res.json({ message: 'Anime créé avec succès', anime });
        });
    });
});

////////////////////////////////////////////////////////////////////////////

// Update
app.patch('/anime/:id', upload.single('image'), (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send('ID d\'anime invalide');
    }

    const filePath = path.resolve(__dirname, 'DB', 'anime.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier', err);
            return res.status(500).send('Erreur lors de la lecture du fichier');
        }

        let animes = JSON.parse(data);

        const index = animes.findIndex(anime => anime.id === id);
        if (index === -1) {
            return res.status(404).send('Anime non trouvé');
        }

        // Récupère le chemin de l'image actuelle
        const oldImagePath = animes[index].image;

        // Récupération des nouvelles données de l'anime à partir du corps de la requête
        const { nom_fichier } = req.body;

        // Récupération du nouveau chemin de l'image si un fichier d'image est envoyé dans la requête
        const newImagePath = req.file ? `./img/${req.file.filename}` : oldImagePath;

        // Met à jour les données de l'anime avec les nouvelles données reçues
        animes[index] = { ...animes[index], nom_fichier, image: newImagePath };

        fs.writeFile(filePath, JSON.stringify(animes, null, 2), err => {
            if (err) {
                console.error("Erreur lors de l'écriture du fichier", err);
                return res.status(500).send("Erreur lors de l'enregistrement des données");
            }

            // Supprime l'ancienne image si elle existe et si un nouveau fichier d'image a été envoyé
            if (oldImagePath && req.file) {
                fs.unlink(oldImagePath, err => {
                    if (err) {
                        console.error("Erreur lors de la suppression de l'ancienne image", err);
                    }
                });
            }

            res.send('Anime mis à jour avec succès');
        });
    });
});

////////////////////////////////////////////////////////////////////////////

// Delete 

app.delete('/anime/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filePath = path.join(__dirname, 'DB', 'anime.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier', err);
            res.status(500).send('Erreur lors de la lecture du fichier');
            return;
        }

        let animes = JSON.parse(data);
        const index = animes.findIndex(a => a.id === id);
        if (index === -1) {
            res.status(404).send('Anime non trouvé');
            return;
        }

        // Suppression de l'élément du tableau
        animes.splice(index, 1);

        // Écrire les données mises à jour dans le fichier
        fs.writeFile(filePath, JSON.stringify(animes, null, 2), err => {
            if (err) {
                console.error("Erreur lors de l'écriture du fichier", err);
                res.status(500).send("Erreur lors de l'enregistrement des données");
                return;
            }

            res.send('Anime supprimé avec succès');
        });
    });
});

////////////////////////////////////////////////////////////////////////////
app.listen(port, () => {
    console.log(`Le serveur est lancé sur http://localhost:${port}`);
});