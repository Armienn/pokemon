var pokemons = []
var moves = []
var filters = {}
var searchFilter

var onload

function getFilteredPokemons(){
	var pokes = pokemons
	if(selectedTab == "mine"){
		pokes = []
		for(var i in pokemonInventories)
			pokes = pokes.concat(pokemonInventories[i].pokemons)
	} else if(selectedTab == "breedables"){
		pokes = []
		for(var i in pokemonInventories)
			pokes = pokes.concat(pokemonInventories[i].pokemons)
		pokes = getBreedables(pokes)
	} else if(selectedTab)
		pokes = selectedTab.pokemons
	for(var i in filters)
		pokes = pokes.filter(filters[i])
	if(searchFilter)
		pokes = pokes.filter(searchFilter)
	return pokes
}

function getBreedables(parentPokemons){
	var breedables = []
	for(var n in parentPokemons){
		var pokemon = parentPokemons[n]
		if(!pokemon.eggs)
			continue
		for(var i in pokemon.eggs){
			var babies = pokemons.filter(e=> (e.id == pokemon.eggs[i].id && e.form.toLowerCase().indexOf("mega") == -1))
			if(pokemon.eggs[i].forms == "same"){
				var filtered = babies.filter(e=>e.form == pokemon.form)
				if(filtered.length == 0)
					filtered = [babies[0]]
				babies = filtered
			}
			for(var j in babies){
				var baby = {
					get forms() {return this.base.forms },
					get stats() {return this.base.stats },
					get abilities() {return this.base.abilities },
					get classification() {return this.base.classification },
					get eggGroups() {return this.base.eggGroups },
					get height() {return this.base.height },
					get weight() {return this.base.weight },
					get moves() {return this.base.moves },
					get ratio() {return this.base.ratio },
					get types() {return this.base.types }
				}
				baby.base = babies[j]
				baby.id = babies[j].id
				baby.name = babies[j].name
				baby.form = babies[j].form
				baby.ivs = pokemon.ivs
				baby.nature = pokemon.nature
				baby.ability = pokemon.ability
				baby.learntMoves = []
				baby.balls = []
				breedables.push(baby)
			}
		}
	}
	breedables = uniqueBy(breedables, e => e.id + e.form)
	return breedables
}

function uniqueBy(list, key) {
	var seen = {};
	return list.filter(function(item) {
		var k = key(item);
		return seen.hasOwnProperty(k) ? false : (seen[k] = true);
	})
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

function textContains(text, substring){
	return text.toLowerCase().indexOf(substring.toLowerCase()) > -1
}

function getPokemonSpriteName(pokemon){
	var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀","-f").replace("♂","-m").replace("'","").replace(".","").replace("ébé","ebe").replace(":","")
	if(pokemon.forms && pokemon.form && !textContains(pokemon.form, pokemon.forms[0])){
		var formname
		if(textContains(pokemon.form, "alola"))
			formname = "alola"
		else if(textContains(pokemon.form, "10%"))
			formname = "10-percent"
		else if(pokemon.form.toLowerCase() == "core form")
			formname = "core-yellow"
		else if(pokemon.form.toLowerCase() == "female")
			formname = false
		else if(textContains(pokemon.form, "size"))
			formname = false
		else if(textContains(pokemon.form, "mega"))
			formname = pokemon.form.replace(" ", "-")
		else if(textContains(pokemon.form, "core"))
			formname = "core-"+pokemon.form.replace(" ", "").toLowerCase().split("core")[0]
		else if(pokemon.form == "Ash-Greninja")
			formname = "ash"
		else if(!textContains(pokemon.form, "base"))
			formname = pokemon.form
		if(formname)
			name += "-" + formname.split(" ")[0].toLowerCase().replace(" ", "-").replace("'", "-")
	}
	if(!formname && pokemon.forms && pokemon.forms[0] == "Male" && (pokemon.form.toLowerCase() == "female" || pokemon.gender == "♀"))
		name = "female/" + name
	return "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/" +
	 (pokemon.shiny ? "shiny":"regular") +
	  "/" + name + ".png"
}

function getPokemonImageName(pokemon){
	var form = ""
	if(pokemon.form && pokemon.form != "Base" && pokemon.forms && !textContains(pokemon.form, pokemon.forms[0])){
		for(var i in pokemon.forms){
			var temp = pokemon.forms[i]
			if(pokemon.name == "Minior" && pokemon.forms[i] != "Meteor Form")
				temp = "Core"
			if(textContains(pokemon.form, temp)){
				form = "_f" + (+i + (pokemon.name == "Zygarde" ? 2 : 1) )
				break
			}
		}
	}
	if(pokemon.form == "Core Form")
		form = "_f2"
	return "http://assets.pokemon.com/assets/cms2/img/pokedex/full/" + prependZeroes(pokemon.id, 3) + form + ".png"
}

function hasItemInFilter(listKey) {
	return function (...items){
		return function(pokemon) {
			for(var i in items){
				if(!pokemon[listKey]) {
					console.log("Pokemon missing " + listKey + ": " + pokemonFormName(pokemon))
					return false
				}
				if(typeof pokemon[listKey] == "string"){
					if(pokemon[listKey] == items[i])
						return true
				} else if(pokemon[listKey].filter(e => e ? (e.toLowerCase ? e.toLowerCase() : e.name.toLowerCase()) == items[i].toLowerCase() : false).length)
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

function prependZeroes(number, characters){
	number = number.toString()
	while(number.length < characters){
		number = "0" + number
	}
	return number
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
requestJSON("https://armienn.github.io/pokemon/static/pokemons.json", getPokemons)