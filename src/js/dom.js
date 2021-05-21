/*
 *  MEMORY
 *  fichier dom.js
 *  
 *  Ce fichier contient la sélection des différents 
 *  éléments du DOM nécessaires aux fonctions JS.
 *
 *  Baptiste DELPHIN - Mai 2021
 *
 */

// Éléments de l'écran de jeu
var grid = document.getElementById('grid');
var progress_bar = document.getElementById('progress');
var time_left_span = document.getElementById('time_left');

// Écrans (menu, jeu, gameover et gamewon)
var menu_screen = document.getElementById('menu');
var game_screen = document.getElementById('game');
var gameover_screen = document.getElementById('game_over');
var gamewon_screen = document.getElementById('game_won');

// Élements de l'écran du menu
var highscores_div = document.getElementById('highscores');

// Élements de l'écran de fin du jeu (gamewon)
var new_highscore_span = document.getElementById('new_highscore');
var score_span = document.getElementById('score');
var name_input = document.getElementById('name');
var input_error = document.getElementById('input_error');

// on ajoute la possibilité de valider son score en appuyant sur Entrée
name_input.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13)
    {
        record_score();
    }
});
