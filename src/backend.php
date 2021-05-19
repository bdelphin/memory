<?php

/*
 *  Memory Game
 *  fichier backend.php
 *  
 *  Ce fichier est le backend de l'application.
 *  Il fonctionne comme une mini-API REST (mais loin d'être RESTful).
 *
 *  Documentation de l'API :
 *  GET backend.php -> retourne un JSON avec les scores
 *  POST backend.php -> enregistre nouveau score si
 *  on lui envoi les paramètres nom & temps en x-www-form-urlencoded.
 *
 *  Améliorations :
 *  Un tricheur peut facilement faire des requêtes POST pour fausser
 *  les meilleurs scores. Il faudrait empêcher cela en envoyant un token
 *  au client au lancement d'une partie et en enregistrant l'heure 
 *  précise de l'envoi. Ce token devrait être renvoyé au serveur avec la
 *  requête POST afin de vérifier l'authenticité du score.
 *
 *  Baptiste DELPHIN - Mai 2021
 *
 */


try
{
    // connexion à la DB SQLite
    // le fichier sera créé s'il n'existe pas.
    $pdo = new PDO('sqlite:'.dirname(__FILE__).'/db.sqlite');
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // permet de désaction l'émulation de requêtes préparées
    // et de se protèger des Injections SQL.
    // Attention, ne fonctionne pas sur certaines version de MySQL.
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
}
catch(Exception $e) 
{
    // en cas de connexion impossible, on renvoi un message d'erreur.
    // Attention, dans une application sérieuse il faut faire attention
    // au contenu de ces messages, la divulgation d'informations 
    // techniques est une faille de sécurité potentielle.
    echo "Impossible d'accéder à la base de données SQLite : ".$e->getMessage();
    die();
}

// si la table n'existe pas, on la créé
$pdo->query("CREATE TABLE IF NOT EXISTS highscore ( 
id      INTEGER     PRIMARY KEY AUTOINCREMENT,
nom     VARCHAR( 50 ),
temps   INTEGER
);");

// s'il y a des données en POST, c'est qu'on envoie un nouveau highscore.
// on utilise !empty() plutôt que isset() afin de gérer le fait que les
// paramètres peuvent être définis mais tout de même vides.
if(!empty($_POST["nom"]) && !empty($_POST["temps"]))
{
    // si les paramètres ne sont pas vides, on les insère dans la table.
    // on utilise ici une requête préparée pour se protéger des injections
    // SQL.
    $stmt = $pdo->prepare("INSERT INTO highscore (nom, temps) VALUES (:nom, :temps)");
    $result = $stmt->execute(array(
        'nom'         => $_POST["nom"],
        'temps'       => $_POST["temps"]
    ));
    echo "OK";
}
else // sinon, on retourne la liste des highscores
{
    // on récupère les données dans la BDD avec une requête SELECT
    $stmt = $pdo->prepare("SELECT * FROM highscore ORDER BY temps ASC LIMIT 5");
    $stmt->execute();
    $results = $stmt->fetchAll();
    
    // et on retourne les résultats encodés en JSON
    echo json_encode($results);
}

?>
