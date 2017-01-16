var filterAdder = document.getElementById("filter-adder")
var filterList = document.getElementById("filter-list")
var filterIndividualList = document.getElementById("filter-individual-list")
var currentFilterList = document.getElementById("current-filter-list")
var pokemonList = document.getElementById("pokemon-list")
var pokemonGrid = document.getElementById("pokemon-grid")
var pokemonInfo = document.getElementById("pokemon-info")
var modeTable = document.getElementById("mode-table")
var modeGrid = document.getElementById("mode-grid")
var modeNight = document.getElementById("mode-night")
var modeDay = document.getElementById("mode-day")

var colors = {
	night: ["#222", "#eee", "#cf0000", "rgba(50, 50, 50,0.5)"],
	day: ["whitesmoke", "black", "#ff3a23", "rgba(50, 50, 50,0.5)"]
}

var mode = "table"
setColors(...colors.night)

function setupDayNightButtons(){
	modeNight.onclick = function(){
		setColors(...colors.night)
		modeNight.className = "active"
		modeDay.className = "inactive"
	}
	modeDay.onclick = function(){
		setColors(...colors.day)
		modeNight.className = "inactive"
		modeDay.className = "active"
	}
}
setupDayNightButtons()

function setupTableGridButtons(){
	modeTable.onclick = function(){
		switchModeTo("table")
		modeTable.className = "active"
		modeGrid.className = "inactive"
	}
	modeGrid.onclick = function(){
		switchModeTo("grid")
		modeTable.className = "inactive"
		modeGrid.className = "active"
	}
}
setupTableGridButtons()

function switchModeTo(newMode){
	mode = newMode
	update()
}

var basePokemonColumns = [
	{ getColumnHeader: function(){ return "" },
		getColumn: function(pokemon){
			return "<img src='" + getPokemonSpriteName(pokemon) + "'/>"
		}
	},
	{ getColumnHeader: function(){ return "Pokemon" },
		getColumn: function(pokemon){
			return pokemonFormName(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "Types" },
		getColumn: function(pokemon){
			return getTypesText(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "Abilities" },
		getColumn: function(pokemon){
			return getAbilitiesText(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "HP" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.hp) }
	},
	{ getColumnHeader: function(){ return "Atk" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.atk) }
	},
	{ getColumnHeader: function(){ return "Def" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.def) }
	},
	{ getColumnHeader: function(){ return "SpA" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.spa) }
	},
	{ getColumnHeader: function(){ return "SpD" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.spd) }
	},
	{ getColumnHeader: function(){ return "Spe" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.spe) }
	},
	{ getColumnHeader: function(){ return "Egg groups" },
		getColumn: function(pokemon){
			return getEggGroupsText(pokemon)
		}
	}
]

var tabPokemonColumns = [
	{ getColumnHeader: function(){ return "" },
		getColumn: function(pokemon){
			return "<img src='" + getPokemonSpriteName(pokemon) + "'/>"
		}
	},
	{ getColumnHeader: function(){ return "Pokemon" },
		getColumn: function(pokemon){
			return pokemonFormName(pokemon) + getAmountShinyText(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "Types" },
		getColumn: function(pokemon){
			return getTypesText(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "Ability" },
		getColumn: function(pokemon){
			return getAbilityText(pokemon.ability, pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.toLowerCase() : false)
		}
	},
	{ getColumnHeader: function(){ return "Nature" },
		getColumn: function(pokemon){
			return pokemon.nature
		}
	},
	{ getColumnHeader: function(){ return "HP" },
		getColumn: function(pokemon){ return getIVText("hp", pokemon) }
	},
	{ getColumnHeader: function(){ return "Atk" },
		getColumn: function(pokemon){ return getIVText("atk", pokemon) }
	},
	{ getColumnHeader: function(){ return "Def" },
		getColumn: function(pokemon){ return getIVText("def", pokemon) }
	},
	{ getColumnHeader: function(){ return "SpA" },
		getColumn: function(pokemon){ return getIVText("spa", pokemon) }
	},
	{ getColumnHeader: function(){ return "SpD" },
		getColumn: function(pokemon){ return getIVText("spd", pokemon) }
	},
	{ getColumnHeader: function(){ return "Spe" },
		getColumn: function(pokemon){ return getIVText("spe", pokemon) }
	},
	{ getColumnHeader: function(){ return "Moves" },
		getColumn: function(pokemon){
			return pokemon.learntMoves.join(", ")
		}
	},
	{ getColumnHeader: function(){ return "Ball" },
		getColumn: function(pokemon){
			return getBallsText(pokemon)
		}
	}
]

function update(){
	nextPoke = 0
	nextLimit = 50
	pokes = getFilteredPokemons()
	clearInterface()
	if(mode == "table"){
		pokemonList.style.display = "table"
		pokemonGrid.style.display = "none"
		setUpTableHeader()
	} else {
		pokemonList.style.display = "none"
		pokemonGrid.style.display = "initial"
	}
	for(var i in filters)
		currentFilterList.appendChild(createFilterListElement(i))
	addNextPokemonEntry()
}

var loaded = false
function tryLoad(){
	if(!isEverythingLoaded())
		return
	if(loaded)
		return
	loaded = true
	addFilterEntry(filterList, "Type", hasItemInFilter("types"), typeNames)
	addFilterEntry(filterList, "Ability", hasItemInFilter("ability","abilities"))
	addFilterEntry(filterList, "Move", hasItemInFilter("moves"), Object.keys(moves))
	addFilterEntry(filterList, "Egg group", hasItemInFilter("eggGroups"), eggGroupNames)
	addFilterMultiSelectEntry(filterList, "Gender ratios", hasItemInFilter("ratio"), ["7:1","3:1","1:1","1:3","1:7","—"])
	addFilterMultiSelectEntry(filterList, "Generation", generationFilter, ["1","2","3","4","5","6","7"])
	addFilterEntry(filterIndividualList, "Nature", hasItemInFilter("nature"), Object.keys(natures))
	addFilterEntry(filterIndividualList, "Learnt moves", hasItemInFilter("learntMoves"), Object.keys(moves))
	addFilterMultiSelectEntry(filterIndividualList, "Gender", hasItemInFilter("gender"), ["♂","♀","—","Undefined"])
	addFilterChooser("Add filter:")
	addSearch("Search")
	update()
	setInterval(loadMoreWhenScrolledDown,500)
}

var pokes = []
var nextPoke = 0
var nextLimit = 25

function addNextPokemonEntry(){
	if(!pokes[nextPoke]){
		nextPoke = 0
		return
	}
	if(nextPoke > nextLimit){
		nextLimit += 25
		return
	}
	if(mode == "table")
		addPokemonListElement(pokes[nextPoke])
	else
		addPokemonGridElement(pokes[nextPoke])
	nextPoke++
	setTimeout(addNextPokemonEntry(),0)
}

function setColors(backgroundColor, textColor, headerColor, tableHeaderColor){
	document.getElementsByTagName("body")[0].style.backgroundColor = backgroundColor
	document.getElementsByTagName("body")[0].style.color = textColor
	document.getElementsByTagName("section")[0].style.backgroundColor = headerColor
	document.getElementsByTagName("header")[0].style.backgroundColor = headerColor
	document.getElementsByTagName("thead")[0].style.backgroundColor = tableHeaderColor
}

function setUpTableHeader(){
	var tableHeader = newTag("tr", pokemonList.children[0])
	var columns = basePokemonColumns
	if(selectedTab)
		columns = tabPokemonColumns
	for(var i in columns){
		var element = newTag("th", tableHeader)
		element.innerHTML = columns[i].getColumnHeader()
	}
}

function loadMoreWhenScrolledDown(){
	var main = document.getElementById("main")
	if(main.scrollTop > main.scrollHeight-main.clientHeight-200){
		if(nextPoke)
			addNextPokemonEntry()
	}
}

function clearInterface(){
	while (pokemonList.children[0].firstChild)
		pokemonList.children[0].removeChild(pokemonList.children[0].firstChild)
	while (pokemonList.children[1].firstChild)
		pokemonList.children[1].removeChild(pokemonList.children[1].firstChild)
	while (pokemonGrid.firstChild)
		pokemonGrid.removeChild(pokemonGrid.firstChild)
	while (currentFilterList.firstChild)
		currentFilterList.removeChild(currentFilterList.firstChild)
}

function addPokemonListElement(pokemon) {
	var pokeElement = newTag("tr", pokemonList.children[1])
	var columns = basePokemonColumns
	if(selectedTab)
		columns = tabPokemonColumns
	for(var i in columns){
		var element = newTag("th", pokeElement)
		element.innerHTML = columns[i].getColumn(pokemon)
	}
	pokeElement.onclick = function(){
		selectPokemon(pokemon, pokeElement)
	}
	pokeElement.className = nextPoke%2?"odd":"even"
}

function addPokemonGridElement(pokemon) {
	var pokeElement = newTag("li", pokemonGrid)
	pokeElement.innerHTML = "<img src='" + getPokemonSpriteName(pokemon) + "'/>"
	pokeElement.onclick = function(){
		selectPokemon(pokemon)
	}
}

function addSearch(label){
	var filterElement = newTag("li", filterAdder, true)
	var inputElement = newTag("input", filterElement)
	inputElement.placeholder = label
	inputElement.style.width = "15rem"
	inputElement.oninput = function(){
		searchFilter = getSearchFilter(inputElement.value)
		update()
	}
}

function addFilterChooser(label){
	var filterElement = newTag("li", filterAdder, true)
	filterElement.title = "Filters remove pokemons that do not fit the filter"
	newTag("label", filterElement).innerHTML = label
	var selectElement = newTag("select", filterElement)
	newTag("option", selectElement)
	for(var i=0;i<filterList.children.length;i++){
		var child = filterList.children[i]
		var optionElement = newTag("option", selectElement)
		optionElement.value = child.children[0].innerHTML
		optionElement.innerHTML = child.children[0].innerHTML
	}
	for(var i=0;i<filterIndividualList.children.length;i++){
		var child = filterIndividualList.children[i]
		var optionElement = newTag("option", selectElement)
		optionElement.value = child.children[0].innerHTML
		optionElement.innerHTML = child.children[0].innerHTML
	}
	selectElement.onchange = selectFilter
}

function selectFilter(){
	var selected
	for(var i=0;i<filterList.children.length;i++){
		var child = filterList.children[i]
		child.style.display = "none"
		if(child.children[0].innerHTML == this.value)
			selected = child
	}
	for(var i=0;i<filterIndividualList.children.length;i++){
		var child = filterIndividualList.children[i]
		child.style.display = "none"
		if(child.children[0].innerHTML == this.value)
			selected = child
	}
	if(selected)
		selected.style.display = "inline-block"
}

function addFilterEntry(filterList, label, filterFunction, datalist){
	var filterElement = newTag("li", filterList)
	filterElement.style.display = "none"
	filterElement.title = "A comma-separated list of acceptable values"
	newTag("label", filterElement).innerHTML = label
	var inputElement = newTag("input", filterElement)
	inputElement.type = "text"
	var addElement = newTag("button", filterElement)
	addElement.innerHTML = "Add"
	addElement.onclick = function(){
		addFilter(label, inputElement.value, filterFunction)
		inputElement.value = ""
		update()
	}
	if(datalist){
		var datalistElement = newTag("datalist", filterElement)
		datalistElement.id = "datalist" + label.replace(" ","-")
		inputElement.setAttribute("list", "datalist" + label.replace(" ","-"))
		for(var i in datalist){
			newTag("option", datalistElement).value = datalist[i]
		}
	}
}

function addFilterMultiSelectEntry(filterList, label, filterFunction, options){
	var filterElement = newTag("li", filterList)
	filterElement.style.display = "none"
	newTag("label", filterElement).innerHTML = label
	var chosenOptions = []
	for(var i in options)
		addMultiSelectOption(filterElement, chosenOptions, options[i])
	var addElement = newTag("button", filterElement)
	addElement.innerHTML = "Add"
	addElement.onclick = function(){
		addFilter(label, chosenOptions, filterFunction)
		update()
	}
}

function addMultiSelectOption(filterElement, chosenOptions, option){
	var element = newTag("li", filterElement)
	element.className = "inactive"
	element.style.cursor = "pointer"
	element.style.fontWeight = "bold"
	element.innerHTML = option
	element.onclick = function(){
		if(element.className == "active"){
			element.className = "inactive"
			var index = chosenOptions.indexOf(option)
			if (index > -1)
    		chosenOptions.splice(index, 1)
		} else {
			element.className = "active"
			chosenOptions.push(option)
		}
	}
}

function addFilter(label, input, filterFunction){
	var title = label + ": "
	var inputs = []
	if(typeof input == "string")
		inputs = input.split(",")
	else
		inputs = input
	if(label == "Type")
		for(var i in inputs)
			title += getTypeText(inputs[i].trim()) + (i<inputs.length - 1? ", " : "")
	else
		title += input
	title += " <span class='close-mark'>❌</span>"
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

function newTag(tag, parentElement, first){
	var newElement = document.createElement(tag)
	if(parentElement){
		if(first)
			parentElement.insertBefore(newElement, parentElement.firstChild)
		else
			parentElement.appendChild(newElement)
	}
	return newElement
}