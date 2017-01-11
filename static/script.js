var element = document.getElementsByTagName("body")[0].children[0]

element.innerHTML = "Hej du"
var pokemons = []
var moves = []

function update(){
	var pokes = pokemons.filter(hasMoveAmongFilter("tackle"))
	pokes = pokes.filter(hasAbilityAmongFilter("intimidate"))
	var result = ""
	for(var i in pokes){
		result += (pokes[i].form == "Base" ? "" : pokes[i].form + " " ) + pokes[i].name + "<br>"
		//result += JSON.stringify(pokes[i]) + "<br>"
	}
	element.innerHTML = result
}

function hasMoveAmongFilter(...moves) {
	return function(pokemon) {
		for(var i in moves){
			if(pokemon.moves.filter(e => e.name.toLowerCase() == moves[i].toLowerCase()).length)
				return true
		}
		return false
	}
}

function hasAbilityAmongFilter(...abilities) {
	return function(pokemon) {
		for(var i in abilities){
			if(pokemon.abilities.filter(e => e ? e.toLowerCase() == abilities[i].toLowerCase() : false).length)
				return true
		}
		return false
	}
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