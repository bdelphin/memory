/*
 *  Memory Game
 *  fichier global.js
 *  
 *  Ce fichier contient les variables globales
 *  nécessaires au bon fonctionnement du jeu.
 *
 *  Baptiste DELPHIN - Mai 2021
 *
 */

// Tableaux
var cards = new Array(28); // pour stocker les cartes
var selected_cards = new Array(2); // pour stocker la "main" (les 2 cartes sélectionnées)

// quand clickable est à false, les cartes
// ne peuvent pas être sélectionnées.
var clickable = true;

// permet de stocker les highscores temporairement
var highscores;

// variables pour stocker des setInterval ou setTimeout
// afin de pouvoir les stopper quand la partie est finie.
var refresh_interval;
var game_timeout;

// L'URL du backend, au cas où il faudrait la changer
// (pour ne pas avoir à la changer à plusieurs endroits)
var backend_url = "backend.php";

// pour stocker le temps imparti et temps écoulé en secondes
var time_allowed;
var time_elapsed = 0;

// pour stocker le nombre de paires trouvées.
// quand cette variable vaut 14, la partie est gagnée !
var pairs_found;

