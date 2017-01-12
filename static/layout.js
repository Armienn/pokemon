var filterlist = document.getElementById("filter-list")
var currentfilterlist = document.getElementById("current-filter-list")
var pokelist = document.getElementById("pokemon-list")
var pokeinfo = document.getElementById("pokemon-info")

var pokemonColumns = [
	{ getColumnHeader: function(){ return "" },
		getColumn: function(pokemon){
			var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀","-f").replace("♂","-m").replace("'","").replace(".","").replace("ébé","ebe").replace(":","")
			var formname
			if(pokemon.form == "Alolan")
				formname = "alola"
			else if(pokemon.form == "10% Forme")
				formname = "10-percent"
			else if(["Altered Forme","Land Forme","Red-Striped","Standard Mode","Incarnate Forme","Ordinary Forme","Aria Forme","Shield Forme","50% Forme","Male","Female"].indexOf(pokemon.form) > -1)
				formname = false
			else if(pokemon.form.indexOf("Forme") > -1)
				formname = pokemon.form.split(" Forme")[0].toLowerCase()
			else if(pokemon.form == "Zen Mode")
				formname = "zen"
			else if(pokemon.form == "Ash-Greninja")
				formname = "ash"
			else if(pokemon.form.indexOf("Size") > -1)
				formname = false
			else if(pokemon.form.indexOf("Style") > -1)
				formname = false
			else if(pokemon.form.indexOf("Form") > -1)
				formname = false
			else if(pokemon.form != "Base")
				formname = pokemon.form.toLowerCase().replace(" ", "-")
			if(formname && name != "deoxys" && name != "wormadam" && name != "hoopa")
				name += "-" + formname
			else if(name == "meowstic" && pokemon.form == "Female")
				name = "female/" + name
			return "<img src='https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/" + name + ".png'/>"
		}
	},
	{ getColumnHeader: function(){ return "Pokemon" },
		getColumn: function(pokemon){
			return pokemonFormName(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "Types" },
		getColumn: function(pokemon){
			return pokemon.types[0] + (pokemon.types[1] ? " / " + pokemon.types[1] : "")
		}
	}
]

function setUpTableHeader(){
	var tableHeader = newTag("tr", pokelist.children[0])
	for(var i in pokemonColumns){
		var element = newTag("th", tableHeader)
		element.innerHTML = pokemonColumns[i].getColumnHeader()
	}
}

var pokes = []
var nextPoke = 0
var nextLimit = 50

function update(){
	nextPoke = 0
	nextLimit = 50
	pokes = getFilteredPokemons()
	clearInterface()
	setUpTableHeader()
	for(var i in filters)
		currentfilterlist.appendChild(createFilterListElement(i))
	addNextPokemonEntry()
}

function addNextPokemonEntry(){
	if(nextPoke > nextLimit){
		nextLimit += 50
		return
	}
	if(!pokes[nextPoke]){
		nextPoke = 0
		return
	}
	pokelist.children[1].appendChild(createPokemonListElement(pokes[nextPoke]))
	nextPoke++
	setTimeout(addNextPokemonEntry(),0)
}

function loadMoreWhenScrolledDown(){
	var main = document.getElementById("main")
	if(main.scrollTop > main.scrollHeight-main.clientHeight-200){
		if(nextPoke)
			addNextPokemonEntry()
	}
}

onload = ()=>{
	update()
	setInterval(loadMoreWhenScrolledDown,500)
}

function clearInterface(){
	while (pokelist.children[0].firstChild)
		pokelist.children[0].removeChild(pokelist.children[0].firstChild)
	while (pokelist.children[1].firstChild)
		pokelist.children[1].removeChild(pokelist.children[1].firstChild)
	while (currentfilterlist.firstChild)
		currentfilterlist.removeChild(currentfilterlist.firstChild)
}

function createPokemonListElement(pokemon) {
	var pokeElement = newTag("tr")
	for(var i in pokemonColumns){
		var element = newTag("th", pokeElement)
		element.innerHTML = pokemonColumns[i].getColumn(pokemon)
	}
	pokeElement.onclick = function(){
		updatePokemonInfo(pokemon)
	}
	return pokeElement
}

function addSearch(label){
	var filterElement = newTag("li", filterlist)
	var labelElement = newTag("label", filterElement)
	labelElement.innerHTML = label
	var inputElement = newTag("input", filterElement)
	inputElement.oninput = function(){
		searchFilter = getSearchFilter(inputElement.value)
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

function updatePokemonInfo(pokemon){
	pokeinfo.innerHTML = JSON.stringify(pokemon)
}

function newTag(tag, parentElement){
	var newElement = document.createElement(tag)
	if(parentElement)
		parentElement.appendChild(newElement)
	return newElement
}

addSearch("Search:")
addFilterEntry("Type filter:", hasItemInFilter("types"))
addFilterEntry("Ability filter:", hasItemInFilter("abilities"))
addFilterEntry("Move filter:", hasItemInFilter("moves"))
addFilterEntry("Egg group filter:", hasItemInFilter("eggGroups"))