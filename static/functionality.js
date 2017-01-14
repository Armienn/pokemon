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

function getPokemonSpriteName(pokemon){
	var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀","-f").replace("♂","-m").replace("'","").replace(".","").replace("ébé","ebe").replace(":","")
	var formname
	if(pokemon.form == "Alolan")
		formname = "alola"
	else if(pokemon.form == "10% Forme")
		formname = "10-percent"
	else if(pokemon.form == "Core Form")
		formname = "core-yellow"
	else if([
		"Altered Forme",
		"Land Forme",
		"Red-Striped",
		"Standard Mode",
		"Incarnate Forme",
		"Ordinary Forme",
		"Aria Forme",
		"Shield Forme",
		"50% Forme",
		"Normal Forme",
		"Solo Form",
		"Midday Form",
		"Meteor Form",
		"Plant Cloak",
		"Baile Style",
		"Confined",
		"Male",
		"Female"].indexOf(pokemon.form) > -1)
		formname = false
	else if(pokemon.form.indexOf("Forme") > -1)
		formname = pokemon.form.split(" Forme")[0].toLowerCase()
	else if(pokemon.form.indexOf("Cloak") > -1)
		formname = pokemon.form.split(" Cloak")[0].toLowerCase()
	else if(pokemon.form.indexOf("Style") > -1)
		formname = pokemon.form.split(" Style")[0].toLowerCase()
	else if(pokemon.form.indexOf("Form") > -1)
		formname = pokemon.form.split(" Form")[0].toLowerCase()
	else if(pokemon.form == "Zen Mode")
		formname = "zen"
	else if(pokemon.form == "Ash-Greninja")
		formname = "ash"
	else if(pokemon.form.indexOf("Size") > -1)
		formname = false
	else if(pokemon.form != "Base")
		formname = pokemon.form
	if(formname)
		name += "-" + formname.toLowerCase().replace(" ", "-").replace("'", "-")
	if(name == "meowstic" && pokemon.form == "Female")
		name = "female/" + name
	return "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/" +
	 (pokemon.shiny ? "shiny":"regular") +
	  "/" + name + ".png"
}

function getPokemonImageName(pokemon){
	var zeroes = ""
	if(pokemon.id < 10)
		zeroes = "00"
	else if(pokemon.id < 100)
		zeroes = "0"
	var form = ""
	if(pokemon.form && pokemon.form != "Base"){
		var allforms = pokemons.filter(e=>e.id == pokemon.id)
		var index = allforms.indexOf(pokemon)
		if(index == -1 || index == 0)
			form = ""
		else
		form = "_f" + (index + 1)
	}
	return "http://assets.pokemon.com/assets/cms2/img/pokedex/full/" + zeroes + pokemon.id + form + ".png"
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

function requestJSON(url, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(JSON.parse(xmlHttp.responseText))
	}
	xmlHttp.open("GET", url, true)
	xmlHttp.send()
}

function getMoves(response){
	moves = response
	tryLoad()
}

function getPokemons(response){
	pokemons = response
	tryLoad()
}

function isEverythingLoaded(){
	return moves && Object.keys(moves).length &&
		pokemons && pokemons.length &&
		(spreadsheetId ? pokemonInventories.length : true)
}

requestJSON("https://armienn.github.io/pokemon/static/moves.json", getMoves)
requestJSON("https://armienn.github.io/pokemon/static/pokemons-small.json", getPokemons)