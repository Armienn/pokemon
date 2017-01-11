var element = document.getElementsByTagName("body")[0].children[0]

element.innerHTML = "Hej du"
var pokemons = []
var moves = []

function update(){
    var pokesA = moves["False Swipe"].pokemons
    var pokesB = moves["Spore"].pokemons
    var pokes = []
    for(var i in pokesA){
        for(var j in pokesB){
            if(pokesA[i].id == pokesB[j].id && pokesA[i].form == pokesB[j].form)
            pokes.push(pokesA[i])
        }
    }
    var result = ""
    for(var i in pokes){
        result += JSON.stringify(pokes[i]) + ",<br>"
    }
    element.innerHTML = result
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