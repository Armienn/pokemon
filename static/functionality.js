var pokemons = []
var moves = []
var filters = {}
var searchFilter

var onload

function getFilteredPokemons(){
	var pokes = pokemons
	for(var i in filters)
		pokes = pokes.filter(filters[i])
	if(searchFilter)
		pokes = pokes.filter(searchFilter)
	return pokes
}

function getSearchFilter(query) {
	return function(pokemon) {
		query = query.trim().toLowerCase()
		return pokemonFormName(pokemon).toLowerCase().indexOf(query) > -1
	}
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
		onload()
}

function getPokemons(response){
	pokemons = JSON.parse(response)
	if(moves && pokemons)
		onload()
}

request("https://armienn.github.io/pokemon/static/moves.json", getMoves)
request("https://armienn.github.io/pokemon/static/pokemons-small.json", getPokemons)