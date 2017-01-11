var element = document.getElementsByTagName("body")[0].children[0]

element.innerHTML = "Hej du"
var pokemons = []
var moves = []

function update(){
    for(var i in pokemons){
        for(var j in pokemons[i].moves){
            var move = pokemons[i].moves[j].name
            if(!moves[move].pokemons)
                moves[move].pokemons = []
            moves[move].push({id: pokemons[i].id, form: pokemons[i].form})
        }
    }
    var result = "{<br>"
    for(var i in moves){
        result += "\"" + i + "\":" + JSON.stringify(moves[i]) + ",<br>"
    }
    element.innerHTML = result + "}"
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