/*
 *  MEMORY
 *  fichier game.js
 *  
 *  Ce fichier contient les fonctions principales 
 *  du jeu.
 *  L'algorithme utilisé est expliqué sur Github.
 *
 *  Baptiste DELPHIN - Mai 2021
 *
 */

// On met à jour les highscores au lancement
get_highscores();

function launch(time)
{
    // On réinitialise les paramètres du jeu.
    reset_parameters();

    // On met à jour le temps imparti en fonction de la 
    // difficulté choisie.
    time_allowed = time;
    time_left_span.textContent = time;

    // on affiche l'écran de jeu
    switch_to_screen(game_screen);

    // On remplit les tableaux avec des 'x'.
    // Ces 'x' indiqueront qu'aucune carte n'est sélectionnée
    // ou dans le cas du tableau que la cellule n'a pas encore
    // de carte assignée.
    cards.fill('x');
    selected_cards.fill('x');

    for(var i = 0; i < 28; i++)
    {
        // Si la carte n'a pas déjà été définie :
        if (cards[i] == 'x')
        {
            // On sélectionne au hasard la première carte qui va 
            // composer la paire.
            var card = Math.floor(Math.random() * 18) + 1;
            while(cards.includes(card))
            {
                // Si/tant que cette carte est déjà dans le 
                // tableau, on en choisi une autre
                card = Math.floor(Math.random() * 18) + 1;
            }
            // on place cette carte à la position i
            cards[i] = card;
            
            // On séléctionne ensuite au hasard la seconde 
            // position de cette carte.
            var next = Math.floor(Math.random() * 28);
            while(next == i || cards[next] != 'x')
            {
                // Si/tant que c'est la même position que i OU que la
                // seconde position est déjà définie, on en choisi une autre
                next = Math.floor(Math.random() * 28);
            }
            cards[next] = card;
        }
    }
    
    // Creation des cellules de la grille
    for(var i = 0; i < 28; i++)
    {
        var cell = document.createElement('div');
        cell.setAttribute('id', i);
        // avec la propriété CSS backgroundPosition, on "crop" l'image
        cell.style.backgroundPosition = "0 "+cards[i]+"00px";
        cell.classList.add('cell');
        cell.addEventListener("click", click_card, true);
        grid.appendChild(cell);
    }

    // Lancement du chrono d'actualisation & du chrono global
    refresh_interval = setInterval(function() { time_elapsed += 1; refresh_progress_bar(); }, 1000);
    game_timeout = setTimeout(function() { game_over(); }, time_allowed*1000);
}

// Cette fonction réinitialise les paramètres du jeu
function reset_parameters()
{
    cards = new Array(28);
    grid.innerHTML = '';
    time_elapsed = 0;
    pairs_found = 0;
}

// Cette fonction actualise la progress bar et le temps restant
function refresh_progress_bar()
{
    // calcul de la progression
    progress = (time_elapsed*100)/time_allowed;
    var time_left = time_allowed-time_elapsed;

    // mise à jour de la progress bar et du span
    progress_bar.style.width = progress+'%';
    time_left_span.textContent = time_left;
}

// Fonction appelée lors du clic sur une carte.
// L'algorithme utilisé est expliqué sur le repo Github.
function click_card(event)
{
    // on récupère la carte sur laquelle on vient de cliquer
    card = event.currentTarget;

    // si les cartes sont clickables
    if (clickable == true)
    {
        card.style.backgroundImage = "url(./assets/cards.png)";
        if(selected_cards[0] == 'x')
        {
            // on vient de sélectionner la première carte
            // on stocke la carte en question
            selected_cards[0] = card;
        }
        else if (card != selected_cards[0])
        {
            // on vient de sélectionner la deuxième carte, on la stocke
            selected_cards[1] = card;
            // et on compare les deux cartes de la "main" !
            if(cards[selected_cards[0].id] == cards[selected_cards[1].id])
            {
                // elles sont identiques !
                pairs_found++;

                // on retire l'événement click, on ne peut plus cliquer dessus
                selected_cards[0].removeEventListener("click", click_card, true);
                selected_cards[0].style.cursor = "not-allowed";
                selected_cards[1].removeEventListener("click", click_card, true);
                selected_cards[1].style.cursor = "not-allowed";

                // On vide la "main", en remettant 'x' dans ce tableau
                selected_cards[0] = 'x';
                selected_cards[1] = 'x';

                // On vérifie si on a découvert les 14 paires
                if(pairs_found == 14)
                {
                    // La partie est gagnée !
                    game_won();
                }
            }
            else
            {
                // Si les deux cartes ne sont pas identiques :
                // On rend toutes les cartes "non-clickables" pendant une seconde.
                clickable = false;

                // Une fois cette seconde écoulée, on cache les deux cartes
                // et on rend les cartes clickables.
                setTimeout(function(){ 
                    selected_cards[0].style.backgroundImage = 'none';
                    selected_cards[1].style.backgroundImage = 'none';
                    selected_cards[0] = 'x';
                    selected_cards[1] = 'x'; 
                    clickable = true;
                }, 1000);
            }
        }
    }
}
