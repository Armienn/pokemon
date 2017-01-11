var pokelist = document.getElementById("pokemon-list")
var pokeinfo = document.getElementById("pokemon-info")
var pokemons = []
var moves = []

function update(){
	var pokes = pokemons.filter(hasMoveAmongFilter("tackle"))
	pokes = pokes.filter(hasAbilityAmongFilter("intimidate"))
	for(var i in pokes){
		pokelist.appendChild(createPokemonListElement(pokes[i]))
	}
}

function createPokemonListElement(pokemon) {
	var pokeElement = newTag("li")
	pokeElement.innerHTML = (pokemon.form == "Base" ? "" : pokemon.form + " " ) + pokemon.name
	pokeElement.onclick = function(){
		pokeinfo.innerHTML = JSON.stringify(pokemon)
	}
	return pokeElement
}

function textifyPokemons(pokemons){
	var result = ""
	for(var i in pokemons){
		result += (pokemons[i].form == "Base" ? "" : pokemons[i].form + " " ) + pokemons[i].name + "<br>"
		//result += JSON.stringify(pokemons[i]) + "<br>"
	}
	return result
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

function newTag(tag, parentElement){
	var newElement = document.createElement(tag)
	if(parentElement)
		parentElement.appendChild(newElement)
	return newElement
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