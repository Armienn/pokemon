var element = document.getElementsByTagName("body")[0].children[0]

element.innerHTML = "Hej du"
var pokemons = []
var moves = []

function update(){
    element.innerHTML = JSON.stringify(moves)
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
    update()
}

function getPokemon(response){
    pokemons = JSON.parse(response)
}

request("https://armienn.github.io/pokemon/static/moves.json", getMoves);