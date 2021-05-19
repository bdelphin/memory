<?php

// ini_set('display_errors', '1');
// ini_set('display_startup_errors', '1');
// error_reporting(E_ALL);

// connexion à la DB SQLite
// le fichier sera créé s'il n'existe pas
try
{
    $pdo = new PDO('sqlite:'.dirname(__FILE__).'/db.sqlite');
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
}
catch(Exception $e) 
{
    echo "Impossible d'accéder à la base de données SQLite : ".$e->getMessage();
    die();
}

// si la table n'existe pas, on la créé
$pdo->query("CREATE TABLE IF NOT EXISTS highscore ( 
id      INTEGER     PRIMARY KEY AUTOINCREMENT,
nom     VARCHAR( 50 ),
temps   INTEGER
);");

// s'il y a des données en POST, c'est qu'on envoie un nouveau highscore
if(!empty($_POST["nom"]) && !empty($_POST["temps"]))
{
    $stmt = $pdo->prepare("INSERT INTO highscore (nom, temps) VALUES (:nom, :temps)");
    $result = $stmt->execute(array(
        'nom'         => $_POST["nom"],
        'temps'       => $_POST["temps"]
    ));
    echo "OK";
}
else // sinon, on retourne la liste des highscores au format JSON
{
    // on récupère les données dans la BDD avec une requête SELECT
    $stmt = $pdo->prepare("SELECT * FROM highscore ORDER BY temps ASC LIMIT 5");
    $stmt->execute();
    $results = $stmt->fetchAll();
    
    // on retourne les résultats au format JSON
    echo json_encode($results);
}

?>
