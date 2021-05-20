/*
 *  Memory Game
 *  fichier screen.js
 *  
 *  Ce fichier contient les fonctions permettant
 *  de changer de fenêtre (menu, jeu, gameover, ...)
 *  
 *  Baptiste DELPHIN - Mai 2021
 *
 */

// Afficher l'écran menu
function menu()
{
    // on appelle get_highscores pour mettre à jour les highscores
    get_highscores();
    
    // on stoppe le refresh de la progress bar et on stop le chrono du jeu
    // (nécessaire si on quitte le jeu en cours de partie)
    clearInterval(refresh_interval);
    clearTimeout(game_timeout);
    
    // on affiche l'écran du menu 
    switch_to_screen(menu_screen);
}

// Afficher l'écran game_over
function game_over()
{
    progress_bar.style.width = "100%";
    time_left_span.textContent = '0';

    // on stoppe le refresh de la progress bar
    clearInterval(refresh_interval);

    // on affiche l'écran de gameover
    switch_to_screen(gameover_screen);
}

// Afficher l'écran game_won()
function game_won()
{
    score_span.textContent = time_elapsed;

    // on regarde si on a un nouveau meilleur score
    if (highscores.length > 0)
    {
        if (time_elapsed < highscores[0]['temps'])
            new_highscore_span.style.display = 'inline';
    }
    else
        new_highscore_span.style.display = 'inline';

    // on stoppe le refresh de la progress bar et on stop le chrono du jeu
    clearInterval(refresh_interval);
    clearTimeout(game_timeout);

    // on affiche l'écran de fin
    switch_to_screen(gamewon_screen);
}

// fonction permettant de changer d'écran
function switch_to_screen(screen)
{
    // pour changer d'écran, on commence
    // par cacher TOUS les écrans !
    menu_screen.style.display = 'none';
    gamewon_screen.style.display = 'none'; 
    gameover_screen.style.display = 'none';
    game_screen.style.display = 'none';

    // puis on affiche l'écran souhaité
    screen.style.display = 'block';
}

