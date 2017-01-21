var PokemonData = function(pokemon){
	var poke = {
		get forms() {return this.base.forms },
		get stats() {return this.base.stats },
		get abilities() {return this.base.abilities },
		get classification() {return this.base.classification },
		get description() {return this.base.description },
		get locations() {return this.base.locations },
		get eggGroups() {return this.base.eggGroups },
		get eggs() {return this.base.eggs },
		get evolvesFrom() {return this.base.evolvesFrom },
		get evolvesTo() {return this.base.evolvesTo },
		get height() {return this.base.height },
		get weight() {return this.base.weight },
		get moves() {return this.base.moves },
		get ratio() {return this.base.ratio },
		get types() {return this.base.types }
	}
	if(pokemon) {
		poke.base = pokemon
		poke.id = pokemon.id
		poke.name = pokemon.name
		poke.form = pokemon.form
	}
	return poke
}

function findPokemon(id, form){
	var pokemon = new PokemonData()
	pokemon.id = id
	var possiblePokes = pokemons.filter(e => id == e.id)
	if(possiblePokes.length == 0)
	 	return null
	pokemon.base = possiblePokes[0]
	if(possiblePokes[0].forms)
		pokemon.form = findBestFormFit(possiblePokes[0].forms, form)
	else
		pokemon.form = "Base"
	if (possiblePokes.length > 1) {
		var possibleForms = possiblePokes.filter(e => e.form == pokemon.form)
		if(possibleForms.length == 1)
			pokemon.base = possibleForms[0]
	}
	pokemon.name = pokemon.base.name
	return pokemon
}

function findBestFormFit(forms, form){
	if(!form)
		return forms[0]
	var fits = forms.filter(e=>e.toLowerCase()==form.toLowerCase())
	if(fits.length)
		return fits[0]
	fits = []
	var words = form.split(" ")
	var highestCount = 0
	for(var i in forms){
		var count = 0
		for(var j in words)
			if(forms[i].toLowerCase().indexOf(words[j].toLowerCase()) > -1)
				count++
		if (count > highestCount){
			fits = [forms[i]]
			highestCount = count
		} else if (count == highestCount)
			fits.push(forms[i])
	}
	if(fits.length)
		return fits[0]
	return forms[0]
}

function getPokemonFrom(idformthing){
	if(!idformthing.id && idformthing.name){
		var possiblePokes = pokemons.filter(e => idformthing.name.toLowerCase() == e.name.toLowerCase())
		if(possiblePokes.length)
			idformthing.id = possiblePokes[0].id
		else
			return false
	}
	return findPokemon(idformthing.id, idformthing.form)
}

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
	} else if(selectedTab == "custom"){
		pokes = customPokemon()
	} else if(selectedTab)
		pokes = selectedTab.pokemons
	
	pokes = getCompletionModePokemon(pokes)

	for(var i in filters)
		pokes = pokes.filter(filters[i])
	if(searchFilter)
		pokes = pokes.filter(searchFilter)
	if(sorting)
		pokes.sort(sorting.method)
	return pokes
}

function getCompletionModePokemon(pokes){
	if(completionMode == "normal") return pokes
	var basePokes = []
	if(completionMode == "families"){
		for(var n in pokemons){
			var pokemon = pokemons[n]
			if(!pokemon.evolvesFrom && basePokes.filter(e=>e.id == pokemon.id).length == 0){
				var newPoke = new PokemonData(pokemon)
				basePokes.push(newPoke)
				var lineIds = getPokemonFamilyIds(pokemon)
				if(pokes.filter(e=>lineIds.indexOf(e.id) > -1).length)
					newPoke.got = true
			}
		}
	} else if (completionMode == "pokemons"){
		for(var n in pokemons){
			var pokemon = pokemons[n]
			if(!basePokes[pokemon.id-1]){
				basePokes[pokemon.id-1] = new PokemonData(pokemon)
				if(pokes.filter(e=>e.id == pokemon.id).length)
					basePokes[pokemon.id-1].got = true
			}
		}
	} else if (completionMode == "forms"){
		var allForms = getAllForms()
		for(var i in allForms){
			for(var j in allForms[i]){
				var newPoke = getPokemonFrom(allForms[i][j])
				if(newPoke.form.startsWith("Mega") ||
					newPoke.form == "Primal" ||
					newPoke.form == "Meteor Form" ||
					newPoke.name == "Castform" && newPoke.form != "Base" ||
					newPoke.name == "Rotom" && newPoke.form != "Base" ||
					newPoke.name == "Meloetta" && newPoke.form != "Aria Forme" ||
					newPoke.name == "Aegislash" && newPoke.form != "Shield Forme" ||
					newPoke.name == "Wishiwashi" && newPoke.form != "Solo Form" ||
					newPoke.name == "Minior" && newPoke.form == "Meteor Form"
				) continue
				basePokes.push(newPoke)
				if(pokes.filter(e=>e.id == newPoke.id && e.form == newPoke.form).length)
					newPoke.got = true
			}
		}
	}
	return basePokes
}

function getPokemonFamilyIds(pokemon, recursion){
	if(recursion === undefined)
		recursion = 0
	else
		recursion++
	if(!pokemon || recursion > 3) {
		console.log("error with " + JSON.stringify(pokemon))
		return []
	}
	var ids = [pokemon.id]
	for(var i in pokemon.evolvesTo)
		ids = ids.concat(getPokemonFamilyIds(getPokemonFrom(pokemon.evolvesTo[i]),recursion))
	return ids
}

function getAllForms(){
	var forms = []
	for(var n in pokemons){
		var pokemon = pokemons[n]
		if(!forms[pokemon.id-1]){
			if(!pokemon.forms){
				forms[pokemon.id-1] = [{id: pokemon.id, form: pokemon.form}]
				continue
			}
			forms[pokemon.id-1] = []
			for(var i in pokemon.forms){
				forms[pokemon.id-1].push({id: pokemon.id, form: pokemon.forms[i]})
			}
		}
	}
	return forms
}

function getBreedables(parentPokemons){
	var breedables = []
	for(var n in parentPokemons){
		var pokemon = parentPokemons[n]
		if(!pokemon.eggs)
			continue
		for(var i in pokemon.eggs){
			//TODO: minior...
			var egg = pokemon.eggs[i]
			var baby = getPokemonFrom(egg)
			baby.ivs = pokemon.ivs
			if(nearPerfectIvCount(baby.ivs)<4)
				continue
			baby.nature = pokemon.nature
			var hidden = pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.toLowerCase() : false
			if(hidden)
				baby.ability = baby.abilities[2]
			else
				baby.ability = pokemon.abilities[0] + (pokemon.abilities[1] ? " · " + pokemon.abilities[1] : "")
			baby.learntMoves = pokemon.learntMoves.filter(e=>baby.moves.filter(o=>e == o.name && o.method == "egg").length)
			baby.balls = pokemon.balls.filter(e=>e)
			var existing = breedables.filter(e=>e.id == baby.id && e.form == baby.form && e.ability == baby.ability && e.nature == baby.nature)[0]
			if(existing){
				existing.balls = uniqueBy(existing.balls.concat(baby.balls),e=>e)
				existing.learntMoves = uniqueBy(existing.learntMoves.concat(baby.learntMoves),e=>e)
			}
			else
				breedables.push(baby)
		}
	}
	return breedables
}

function uniqueBy(list, key) {
	var seen = {};
	return list.filter(function(item) {
		var k = key(item);
		return seen.hasOwnProperty(k) ? false : (seen[k] = true);
	})
}

function nearPerfectIvCount(ivs){
	var count = 0
	for(var i in ivs)
		if(ivs[i] >= 30)
			count++
	return count
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
			formname = "core-red"
		else if(pokemon.form.toLowerCase() == "female")
			formname = false
		else if(textContains(pokemon.form, "size"))
			formname = false
		else if(textContains(pokemon.form, "mega"))
			formname = pokemon.form.replace(" ", "-")
		else if(textContains(pokemon.form, "core"))
			formname = pokemon.form.replace(" ", "-")
		else if(pokemon.form == "Ash-Greninja")
			formname = "ash"
		else if(!textContains(pokemon.form, "base"))
			formname = pokemon.form
		if(formname && pokemon.name != "Vivillon")
			formname = formname.split(" ")[0]
		if(formname)
			name += "-" + formname.toLowerCase().replace(" ", "-").replace("'", "-").replace("é", "e-").replace("!","exclamation").replace("?","question")
	}
	if(!formname && pokemon.forms && pokemon.forms[0] == "Male" && (pokemon.form.toLowerCase() == "female" || pokemon.gender == "♀"))
		name = "female/" + name
	return "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/" +
	 (pokemon.shiny ? "shiny":"regular") +
	  "/" + name + ".png"
}

function getPokemonImageName(pokemon){
	var form = ""
	if(pokemon.form && pokemon.form != "Base" &&
	   pokemon.name != "Vivillon" &&
		 pokemon.name != "Flabébé" &&
		 pokemon.name != "Floette" &&
		 pokemon.name != "Florges" &&
		 pokemon.name != "Minior" &&
		 pokemon.name != "Unown" &&
	   pokemon.forms && !textContains(pokemon.form, pokemon.forms[0])){
		for(var i in pokemon.forms){
			var temp = pokemon.forms[i]
			if(textContains(pokemon.form, temp)){
				form = "_f" + (+i + (pokemon.name == "Zygarde" ? 2 : 1) )
				break
			}
		}
	}
	if(pokemon.form.indexOf("Core") > -1)
		form = "_f2"
	return "http://assets.pokemon.com/assets/cms2/img/pokedex/full/" + prependZeroes(pokemon.id, 3) + form + ".png"
}

function hasItemInFilter(key, fallbackKey) {
	return function (...items){
		return function(pokemon) {
			var item = pokemon[key]
			if(!item)
				item = pokemon[fallbackKey]
			for(var i in items){
				if(!item && items[i]=="Undefined")
					return true
				else if(!item)
					continue
				if(typeof item == "string"){
					if(item.toLowerCase() == items[i].toLowerCase())
						return true
				} else if(item.filter(e => e ? (e.toLowerCase ? e.toLowerCase() : e.name.toLowerCase()) == items[i].toLowerCase() : false).length)
					return true
			}
			return false
		}
	}
}

function shinyFilter(mode) {
	var show = mode == "Show only"
	return function(pokemon) {
		if(pokemon.shiny)
			return show
		return !show
	}
}

function hiddenAbilityFilter(mode) {
	var show = mode == "Show only"
	return function(pokemon) {
		if(pokemon.ability && (pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.toLowerCase() : false))
			return show
		return !show
	}
}

function legendaryFilter(mode) {
	var show = mode == "Show only"
	return function(pokemon) {
		if(pokemon.name == "Unown")
			return !show
		if(pokemon.eggGroups.indexOf("Undiscovered") > -1 && !(pokemon.evolvesTo || pokemon.evolvesFrom))
			return show
		if(pokemon.name == "Phione" ||
		   pokemon.name == "Manaphy" ||
		   pokemon.name == "Cosmog" ||
		   pokemon.name == "Cosmoem" ||
		   pokemon.name == "Solgaleo" ||
			 pokemon.name == "Lunala")
			return show
		return !show
	}
}

function generationFilter(...items) {
	return function(pokemon) {
		var generation = getGeneration(pokemon)
		for(var i in items)
			if(+items[i] == generation)
				return true
		return false
	}
}

function getGeneration(pokemon){
	if(pokemon.id<=151)
		return 1
	if(pokemon.id<=251)
		return 2
	if(pokemon.id<=386)
		return 3
	if(pokemon.id<=493)
		return 4
	if(pokemon.id<=649)
		return 5
	if(pokemon.id<=721)
		return 6
	if(pokemon.id<=802)
		return 7
	return 8
}

function requestJSON(url, callback) {
	request(url, function(response){
		callback(JSON.parse(response))
	})
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

function prependZeroes(number, characters){
	number = number.toString()
	while(number.length < characters){
		number = "0" + number
	}
	return number
}

function getMoves(response){
	moves = response
	loadedThings.moves = true
	tryLoad()
}

function getPokemons(response){
	pokemons = response
	loadedThings.pokemons = true
	tryLoad()
}

function getAbilities(response){
	abilities = response
	loadedThings.abilities = true
	tryLoad()
}

function isBasicLoaded(){
	for(var i in loadedThings)
		if(!loadedThings[i])
			return false
	return true
}