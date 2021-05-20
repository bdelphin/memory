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
 *  Baptiste DELPHIN - Mai 2021
 *
 */

// Ceci aurait dû empêcher les accès à l'API depuis l'extérieur, mais à cause
// du réseau Ingress de docker swarm cela ne fonctionne pas ...
if($_SERVER['REMOTE_ADDR'] != '127.0.0.1' || !str_starts_with($_SERVER['REMOTE_ADDR'], '10.0.0.'))
{
    echo "Host ".$_SERVER['REMOTE_ADDR']." unauthorized.";
    die;
}


// On commence par vérifier si la variable d'environnement DB_PROVIDER 
// est définie ou non
if (getenv("DB_PROVIDER") === false || getenv("DB_PROVIDER") == "SQLite")
{
    // si elle est définie à SQLite ou non définie, on se connecte 
    // à la base de données SQLite
    try
    {
        // connexion à la DB SQLite
        // le fichier sera créé s'il n'existe pas.
        $pdo = new PDO('sqlite:'.dirname(__FILE__).'/db/db.sqlite');
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
}
else if (getenv("DB_PROVIDER") == "MySQL" || getenv("DB_PROVIDER") == "MariaDB")
{
    // on vérifie que toutes les variables d'environnement nécessaires 
    // sont bien définies pour MySQL ou MariaDB
    if (getenv("MYSQL_HOST") !== false || getenv("MYSQL_USER") !== false || getenv("MYSQL_PASSWORD") !== false || getenv("MYSQL_DB") !== false)
    {
        // On récupère ces variables d'environnement
        $host = getenv("MYSQL_HOST");
        $user = getenv("MYSQL_USER");
        $password = getenv("MYSQL_PASSWORD");
        $db = getenv("MYSQL_DB");

        // et on se connecte à MySQL ou à MariaDB
        try
        {
            $pdo = new PDO('mysql:host='.$host.';dbname='.$db.';charset=utf8', $user, $password);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // permet de désaction l'émulation de requêtes préparées
            // et de se protèger des Injections SQL.
            // Attention, ne fonctionne pas sur certaines versions de MySQL.
            $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        }
        catch(Exception $e)
        {
            // en cas de connexion impossible, on renvoi un message d'erreur.
            // Attention, dans une application sérieuse il faut faire attention
            // au contenu de ces messages, la divulgation d'informations 
            // techniques est une faille de sécurité potentielle.
            echo "Impossible d'accéder à la base de données MariaDB ou MySQL : ".$e->getMessage();
            die();
        }
    }
    else
    {
        // il manque des variables d'environnement, on renvoi un message d'erreur
        echo "Variables d'environnement manquantes. Veuillez consulter la documentation !";
        die();
    }
    
    // si la table n'existe pas, on la créé
    $pdo->query("CREATE TABLE IF NOT EXISTS highscore ( 
    id      INTEGER     PRIMARY KEY AUTO_INCREMENT,
    nom     VARCHAR( 50 ),
    temps   INTEGER
    );");
}
else
{
    echo "Incorrect DBMS in env var DB_PROVIDER. Supported DBMS are SQLite, MariaDB or MySQL.";
    die();
}




// s'il y a des données en POST, c'est qu'on envoie un nouveau highscore.
// on utilise !empty() plutôt que isset() afin de gérer le fait que les
// paramètres peuvent être définis mais tout de même vides.
//
// Les deux lignes ci-dessus ne sont plus d'actualité. Pour une raison que
// je ne m'explique pas, !empty() ne fonctionne plus.
// Aucune modification n'a été fait coté XHR ¯\_(ツ)_/¯

//if(!empty($_POST["nom"]) && !empty($_POST["temps"]))
if(isset($_POST["nom"]) && isset($_POST["temps"]))
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
