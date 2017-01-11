var filterlist = document.getElementById("filter-list")
var currentfilterlist = document.getElementById("current-filter-list")
var pokelist = document.getElementById("pokemon-list")
var pokeinfo = document.getElementById("pokemon-info")
var pokemons = []
var moves = []
var filters = []

function update(){
	var pokes = pokemons
	clearInterface()
	for(var i in filters){
		pokes = pokes.filter(filters[i])
	}
	for(var i in pokes){
		pokelist.appendChild(createPokemonListElement(pokes[i]))
	}
}

function clearInterface(){
	while (pokelist.firstChild)
		pokelist.removeChild(pokelist.firstChild)
	while (currentfilterlist.firstChild)
		currentfilterlist.removeChild(currentfilterlist.firstChild)
}

function addFilterEntry(label, filterFunction){
	var filterElement = newTag("li", filterlist)
	var labelElement = newTag("label", filterElement)
	labelElement.innerHTML = label
	var inputElement = newTag("input", filterElement)
	var addElement = newTag("button", filterElement)
	addElement.innerHTML = "Add"
	addElement.onclick = function(){
		addFilter(filterFunction, inputElement.value)
		update()
	}
}

function addFilter(filterFunction, input){
	var inputs = input.split(",")
	for(var i in inputs)
		inputs[i] = inputs[i].trim()
	filters.push(filterFunction(inputs))
}

function createPokemonListElement(pokemon) {
	var pokeElement = newTag("li")
	pokeElement.innerHTML = (pokemon.form == "Base" ? "" : pokemon.form + " " ) + pokemon.name
	pokeElement.onclick = function(){
		updatePokemonInfo(pokemon)
	}
	return pokeElement
}

function updatePokemonInfo(pokemon){
	pokeinfo.innerHTML = JSON.stringify(pokemon)
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

request("https://armienn.github.io/pokemon/static/moves.json", getMoves)
request("https://armienn.github.io/pokemon/static/pokemons-small.json", getPokemons)
addFilterEntry("Move filter:", hasMoveAmongFilter)
addFilterEntry("Ability filter:", hasAbilityAmongFilter)