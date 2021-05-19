/*
 *  Memory Game
 *  fichier xhr.js
 *  
 *  Ce fichier contient les fonctions effectuant 
 *  des requêtes XMLHttpRequest et leurs fonctions
 *  de callback.
 *
 *  Baptiste DELPHIN - Mai 2021
 *
 */

// callback de get_highscore()
// cette fonction met à jour le DOM
function update_highscore_menu()
{
    // on parse le JSON
    highscores = JSON.parse(this.responseText);

    // on vérifie s'il y a des highscores
    if (highscores.length > 0)
    {
        highscores_div.textContent = '';
        var ul = document.createElement("ul");

        // on parcourt le JSON avec un forEach
        highscores.forEach((item, index) => {
            var li = document.createElement("li");
            li.textContent = '#' + (index+1) + ' - ' + item['nom'] + ' : ' + item['temps'] + ' secondes.';
            ul.appendChild(li);
        });

        highscores_div.appendChild(ul);
    }
}

// Cette fonction fait une requête  GET au backend
// pour obtenir les highscores enregistrés.
function get_highscores()
{
    var xhr = new XMLHttpRequest();
    xhr.onload = update_highscore_menu;
    xhr.open("get", backend_url, true);
    xhr.send();
}

// callback de record_score()
// retourne au menu, affiche un popup d'erreur
// en cas de problème à l'enregistrement du score
function back_to_menu()
{
    if(this.responseText == 'OK' && this.status == 200)
    {
        // le score a bien été enregistré
        // retournons au menu !

        // on cache l'écran de jeu et on affiche l'écran de fin
        //menu_screen.style.display = 'block';
        //gamewon_screen.style.display = 'none'; 
        switch_to_screen(menu_screen);
    }
}

// Cette fonction fait une requête POST au backend
// pour envoyer le score du joueur (et son nom).
function record_score()
{
    var name = name_input.value;
    
    // vérification de la longueur du pseudo du joueur 
    if(name.length < 3)
        alert("Merci de saisir un pseudo d'au moins 3 caractères !");
    else if (name.length > 20)
        alert("Merci de saisir un pseudo de moins de 20 caractères !");
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
