var filterAdder = document.getElementById("filter-adder")
var filterList = document.getElementById("filter-list")
var currentFilterList = document.getElementById("current-filter-list")
var pokemonList = document.getElementById("pokemon-list")
var pokemonGrid = document.getElementById("pokemon-grid")
var pokemonInfo = document.getElementById("pokemon-info")
var modeTable = document.getElementById("mode-table")
var modeGrid = document.getElementById("mode-grid")
var modeNight = document.getElementById("mode-night")
var modeDay = document.getElementById("mode-day")

var colors = {
	night: ["#222", "#eee", "red", "rgba(50, 50, 50,0.5)"],
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

var pokemonColumns = [
	{ getColumnHeader: function(){ return "" },
		getColumn: function(pokemon){
			return "<img src='https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/" + pokemonSimpleName(pokemon) + ".png'/>"
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

onload = ()=>{
	update()
	setInterval(loadMoreWhenScrolledDown,500)
}

var pokes = []
var nextPoke = 0
var nextLimit = 50

function addNextPokemonEntry(){
	if(!pokes[nextPoke]){
		nextPoke = 0
		return
	}
	if(nextPoke > nextLimit){
		nextLimit += 50
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
	for(var i in pokemonColumns){
		var element = newTag("th", tableHeader)
		element.innerHTML = pokemonColumns[i].getColumnHeader()
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
	for(var i in pokemonColumns){
		var element = newTag("th", pokeElement)
		element.innerHTML = pokemonColumns[i].getColumn(pokemon)
	}
	pokeElement.onclick = function(){
		updatePokemonInfo(pokemon)
	}
	var color = nextPoke%2?"80":"180"
	pokeElement.style.backgroundColor = "rgba("+color+","+color+","+color+",0.2)"
}

function addPokemonGridElement(pokemon) {
	var pokeElement = newTag("li", pokemonGrid)
	pokeElement.innerHTML = "<img src='https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/" + pokemonSimpleName(pokemon) + ".png'/>"
	pokeElement.onclick = function(){
		updatePokemonInfo(pokemon)
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
	var labelElement = newTag("label", filterElement)
	labelElement.innerHTML = label
	var selectElement = newTag("select", filterElement)
	newTag("option", selectElement)
	for(var i=0;i<filterList.children.length;i++){
		var child = filterList.children[i]
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
	if(selected)
		selected.style.display = "inline-block"
}

function addFilterEntry(label, filterFunction){
	var filterElement = newTag("li", filterList)
	filterElement.style.display = "none"
	var labelElement = newTag("label", filterElement)
	labelElement.innerHTML = label
	var inputElement = newTag("input", filterElement)
	var addElement = newTag("button", filterElement)
	addElement.innerHTML = "Add"
	addElement.onclick = function(){
		addFilter(label, inputElement.value, filterFunction)
		inputElement.value = ""
		update()
	}
}

function addFilter(label, input, filterFunction){
	var title = label + " - " + input
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
	pokemonInfo.innerHTML = JSON.stringify(pokemon)
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
addFilterEntry("Type", hasItemInFilter("types"))
addFilterEntry("Ability", hasItemInFilter("abilities"))
addFilterEntry("Move", hasItemInFilter("moves"))
addFilterEntry("Egg group", hasItemInFilter("eggGroups"))
addFilterChooser("Add filter:")
addSearch("Search")