var element = document.getElementsByTagName("body")[0].children[0]

element.innerHTML = "Hej du"
var pokemons = []
var moves = []

function update(){
    for(var i in pokemons){
        var pokemon = pokemons[i]
        if(pokemon.name == pokemon.form)
            pokemon.form = "Base"
        else if(pokemon.form.startsWith("Mega")) {
            pokemon.form = "Mega"
            if(pokemon.form.endsWith("X"))
                pokemon.form += " X"
            if(pokemon.form.endsWith("Y"))
                pokemon.form += " Y"
        }
        else if(pokemon.form.startsWith("Alolan")) {
            pokemon.form = "Alola"
        }
    }
    var result = "[<br>"
    for(var i in pokemons){
        result += JSON.stringify(pokemons[i]) + ",<br>"
    }
    element.innerHTML = result + "]"
}

function request(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText)
    }
    xmlHttp.open("GET", url, true)
    xmlHttp.send()
}

function getMoves(response){
    moves = JSON.parse(response)
    if(moves && pokemons)
        update()
}

function getPokemons(response){
    pokemons = JSON.parse(response)
    if(moves && pokemons)
        update()
}

request("https://armienn.github.io/pokemon/static/moves.json", getMoves);
request("https://armienn.github.io/pokemon/static/pokemons-small.json", getPokemons);