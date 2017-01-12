var filterlist = document.getElementById("filter-list")
var currentfilterlist = document.getElementById("current-filter-list")
var pokelist = document.getElementById("pokemon-list")
var pokeinfo = document.getElementById("pokemon-info")
var pokemons = []
var moves = []
var filters = {}
var searchFilter

function update(){
	var pokes = pokemons
	clearInterface()
	for(var i in filters){
		pokes = pokes.filter(filters[i])
		currentfilterlist.appendChild(createFilterListElement(i))
	}
	if(searchFilter)
		pokes = pokes.filter(searchFilter)
	for(var i in pokes){
		pokelist.children[1].appendChild(createPokemonListElement(pokes[i]))
	}
}

function clearInterface(){
	while (pokelist.children[0].firstChild)
		pokelist.children[0].removeChild(pokelist.children[0].firstChild)
	while (pokelist.children[0].firstChild)
		pokelist.children[1].removeChild(pokelist.children[1].firstChild)
	while (currentfilterlist.firstChild)
		currentfilterlist.removeChild(currentfilterlist.firstChild)
}

function addSearch(label){
	var filterElement = newTag("li", filterlist)
	var labelElement = newTag("label", filterElement)
	labelElement.innerHTML = label
	var inputElement = newTag("input", filterElement)
	inputElement.oninput = function(){
		searchFilter = function(pokemon) {
			var query = inputElement.value.trim().toLowerCase()
			return pokemonFormName(pokemon).toLowerCase().indexOf(query) > -1
		}
		update()
	}
}

function addFilterEntry(label, filterFunction){
	var filterElement = newTag("li", filterlist)
	var labelElement = newTag("label", filterElement)
	labelElement.innerHTML = label
	var inputElement = newTag("input", filterElement)
	var addElement = newTag("button", filterElement)
	addElement.innerHTML = "Add"
	addElement.onclick = function(){
		addFilter(label, inputElement.value, filterFunction)
		update()
	}
}

function addFilter(label, input, filterFunction){
	var title = label + input
	var inputs = input.split(",")
	for(var i in inputs)
		inputs[i] = inputs[i].trim()
	filters[title] = filterFunction(...inputs)
}

function createFilterListElement(filterKey) {
	var filterElement = newTag("li")
	filterElement.innerHTML = filterKey
	filterElement.onclick = function(){
		delete filters[filterKey]
		update()
	}
	return filterElement
}

function createPokemonListElement(pokemon) {
	var pokeElement = newTag("tr")
	pokeElement.innerHTML = pokemonFormName(pokemon)
	pokeElement.onclick = function(){
		updatePokemonInfo(pokemon)
	}
	return pokeElement
}

function updatePokemonInfo(pokemon){
	pokeinfo.innerHTML = JSON.stringify(pokemon)
}

function pokemonFormName(pokemon){
	switch(pokemon.form){
	case "Base":
		return pokemon.name
	case "Mega X":
		return "Mega " + pokemon.name + " X"
	case "Mega Y":
		return "Mega " + pokemon.name + " Y"
	default:
		return pokemon.form + " " + pokemon.name
	}
}

function textifyPokemons(pokemons){
	var result = ""
	for(var i in pokemons){
		result += (pokemons[i].form == "Base" ? "" : pokemons[i].form + " " ) + pokemons[i].name + "<br>"
		//result += JSON.stringify(pokemons[i]) + "<br>"
	}
	return result
}

function hasItemInFilter(listKey) {
    return function (...items){
        return function(pokemon) {
            for(var i in items){
                if(!pokemon[listKey]) {
                    console.log("Pokemon missing " + listKey + ": " + pokemonFormName(pokemon))
                    return false
                }
                if(pokemon[listKey].filter(e => e ? (e.toLowerCase ? e.toLowerCase() : e.name.toLowerCase()) == items[i].toLowerCase() : false).length)
                    return true
            }
            return false
        }
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
addSearch("Search:")
addFilterEntry("Type filter:", hasItemInFilter("types"))
addFilterEntry("Ability filter:", hasItemInFilter("abilities"))
addFilterEntry("Move filter:", hasItemInFilter("moves"))
addFilterEntry("Egg group filter:", hasItemInFilter("eggGroups"))