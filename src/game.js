
// sélection des éléments du DOM
var grid = document.getElementById('grid');
var progress_bar = document.getElementById('progress');
var time_left_span = document.getElementById('time_left');
var menu_screen = document.getElementById('menu');
var game_screen = document.getElementById('game');
var gameover_screen = document.getElementById('game_over');
var gamewon_screen = document.getElementById('game_won');
var highscores_div = document.getElementById('highscores');
var new_highscore_span = document.getElementById('new_highscore');
var score_span = document.getElementById('score');
var name_input = document.getElementById('name');

// variables globales
var cards = new Array(28);
var selected_cards = new Array(2);
var clickable = true;

var highscores;

var refresh_interval;
var game_timeout;

var backend_url = "backend.php";

// temps imparti et temps écoulé en secondes
var time_allowed = 60;
var time_elapsed = 0;

var pairs_found = 0;

// on appelle get_highscores pour mettre à jour les highscores
get_highscores();

function launch(time)
{
    // on réinitialise les paramètres du jeu
    reset_parameters();

    // on met à jour le temps imparti en fonction de la difficulté choisie
    time_allowed = time;
    time_left_span.textContent = time;

    // on cache l'écran de menu et on affiche l'écran de jeu
    menu_screen.style.display = 'none'; 
    game_screen.style.display = 'block';

    // on remplit les tableaux avec des 'x'
    cards.fill('x');
    selected_cards.fill('x');

    for(var i = 0; i < 28; i++)
    {
        // si la carte n'a pas déjà été définie
        if (cards[i] == 'x')
        {
            // on sélectionne au hasard la première carte qui va composer la paire
            var card = Math.floor(Math.random() * 18) + 1;
            while(cards.includes(card))
            {
                // si/tant que cette carte est déjà dans le tableau, on en choisi une autre
                card = Math.floor(Math.random() * 18) + 1;
            }
            // on place cette carte à la position i
            cards[i] = card;
            
            // on séléctionne ensuite au hasard la seconde position de cette carte
            var next = Math.floor(Math.random() * 28);
            while(next == i || cards[next] != 'x')
            {
                // si/tant que c'est la même position que i OU que la seconde position 
                // est déjà définie, on en choisi une autre
                next = Math.floor(Math.random() * 28);
            }
            cards[next] = card;
        }
    }
    
    // creation des cellules de la grille
    for(var i = 0; i < 28; i++)
    {
        var cell = document.createElement('div');
        cell.setAttribute('id', i);
        cell.style.backgroundPosition = "0 "+cards[i]+"00px";
        cell.classList.add('cell');
        cell.addEventListener("click", click_card, true);
        grid.appendChild(cell);
    }

    // lancement du chrono d'actualisation & du chrono global
    refresh_interval = setInterval(function() { time_elapsed += 1; refresh_progress_bar(); }, 1000);
    game_timeout = setTimeout(function() { game_over(); }, time_allowed*1000);
}

function reset_parameters()
{
    cards = new Array(28);
    grid.innerHTML = '';
    time_elapsed = 0;
    pairs_found = 0;
    new_highscore_span.textContent = "";
}

function refresh_progress_bar()
{
    // calcul de la progression
    progress = (time_elapsed*100)/time_allowed;
    var time_left = time_allowed-time_elapsed;

    // mise à jour de la progress bar et du span
    progress_bar.style.width = progress+'%';
    time_left_span.textContent = time_left;
}

function menu()
{
    // on cache l'écran de jeu et on affiche l'écran de gameover
    gameover_screen.style.display = 'none';
    menu_screen.style.display = 'block'; 
}

function game_over()
{
    progress_bar.style.width = "100%";
    time_left_span.textContent = '0';

    // on stoppe le refresh de la progress bar
    clearInterval(refresh_interval);

    // on cache l'écran de jeu et on affiche l'écran de gameover
    game_screen.style.display = 'none';
    gameover_screen.style.display = 'block'; 

    //alert("Game over !");
}

function game_won()
{
    score_span.textContent = time_elapsed;

    // on regarde si on a un nouveau meilleur score
    if (highscores.length > 0)
    {
        if (time_elapsed < highscores[0]['temps'])
            new_highscore_span.textContent = "NOUVEAU MEILLEUR SCORE !";
    }
    else
        new_highscore_span.textContent = "NOUVEAU MEILLEUR SCORE !";

    // on stoppe le refresh de la progress bar et on stop le chrono du jeu
    clearInterval(refresh_interval);
    clearTimeout(game_timeout);

    // on cache l'écran de jeu et on affiche l'écran de fin
    game_screen.style.display = 'none';
    gamewon_screen.style.display = 'block'; 
}

function click_card(event)
{
    // on récupère la carte sur laquelle on vient de cliquer
    card = event.currentTarget;

    // si les cartes sont clickables
    if (clickable == true)
    {
        card.style.backgroundImage = "url(./cards.png)";
        if(selected_cards[0] == 'x')
        {
            // on vient de sélectionner la première carte
            // on stocke la carte en question
            selected_cards[0] = card;
        }
        else if (card != selected_cards[0])
        {
            // on vient de sélectionner la deuxième carte, on stocke
            selected_cards[1] = card;
            // et on compare
            if(cards[selected_cards[0].id] == cards[selected_cards[1].id])
            {
                // elles sont identiques !
                pairs_found++;

                // on retire l'événement click, on ne peut plus cliquer dessus
                selected_cards[0].removeEventListener("click", click_card, true);
                selected_cards[0].style.cursor = "not-allowed";
                selected_cards[1].removeEventListener("click", click_card, true);
                selected_cards[1].style.cursor = "not-allowed";

                selected_cards[0] = 'x';
                selected_cards[1] = 'x';

                // on vérifie si on a découvert les 14 paires
                if(pairs_found == 14)
                {
                    // partie gagnée !
                    game_won();

                }
            }
            else
            {
                clickable = false;
                // si elles ne sont pas identiques, on les cache 2 secondes plus tard
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


function update_highscore_menu()
{
    // on parse le JSON
    highscores = JSON.parse(this.responseText);

    // on vérifie s'il y a déjà des highscores
    if (highscores.length > 0)
    {
        highscores_div.textContent = '';
        var ul = document.createElement("ul");

        highscores.forEach((item, index) => {
            var li = document.createElement("li");
            li.textContent = '#' + (index+1) + ' - ' + item['nom'] + ' : ' + item['temps'] + ' secondes.';
            ul.appendChild(li);
        });

        highscores_div.appendChild(ul);
    }
}

function get_highscores()
{
    var xhr = new XMLHttpRequest();
    xhr.onload = update_highscore_menu;
    xhr.open("get", backend_url, true);
    xhr.send();
}

function back_to_menu()
{
    if(this.responseText == 'OK' && this.status == 200)
    {
        // le score a bien été enregistré
        // retournons au menu !

        // on cache l'écran de jeu et on affiche l'écran de fin
        menu_screen.style.display = 'block';
        gamewon_screen.style.display = 'none'; 

    }
}

function record_score()
{
    var name = name_input.value;
    if(name.length < 3)
        alert("Merci de saisir un pseudo d'au moins 3 caractères !");
    else if (name.length > 50)
        alert("Merci de saisir un pseudo de moins de 50 caractères !");
    else
    {
        // xhr pour enregistrer le score
        var xhr = new XMLHttpRequest();
        var params = 'nom='+name+'&temps='+time_elapsed;
        xhr.onload = back_to_menu;
        xhr.open("post", backend_url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(params);

    }
    
}


// class Card
// {
//     constructor(number, position)
//     {
//         this.number = number;
//         this.position = position;
//     }
// }
//
// class Pair
// {
//     constructor(number, position1, position2)
//     {
//         this.number = number;
//         this.position1 = position1;
//         this.position2 = position2;
//     }
// }
//
// class Game
// {
//     constructor()
//     {
//         this.pairs = new Array(14);
//         for(var i = 0; i < 14; i++)
//         {
//             cards[i].pairs 
//         }
//     }
// }
