
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

function tryLoad(){
	if(!isBasicLoaded())
		return
	if(externalInventory.shouldLoad && !externalInventory.loaded){
		if(scriptUrl){
			request("https://" + scriptUrl, function(script){
				addScriptTab(script)
				externalInventory.loaded = true
				tryLoad()
			})
		}
		return
	}
	if(loaded)
		return
	loaded = true
	
	navAll.onclick = function(){
		deselectTabs()
		navAll.className = "active"
		infoMove()
		update()
	}
	navCustom.onclick = function(){
		deselectTabs()
		navCustom.className = "active"
		document.getElementById("custom-pokemon-section").style.display = ""
		selectedTab = "custom"
		infoMove()
		update()
	}
	document.getElementById("custom-pokemon").value = `var list = []
var pokemon = getPokemonFrom({name:"Beedrill",form:"Mega"})
pokemon.ivs = {hp:31,atk:31,def:31,spa:31,spd:31,spe:31}
pokemon.evs = {hp:0,atk:0,def:0,spa:0,spd:0,spe:252}
pokemon.nature = "Jolly"
pokemon.got = true
list.push(pokemon)
for(var n in pokemons){
    pokemon = new PokemonData(pokemons[n])
    pokemon.ivs = {hp:31,atk:31,def:31,spa:31,spd:31,spe:31}
    pokemon.evs = {hp:0,atk:0,def:0,spa:0,spd:0,spe:252}
    pokemon.nature = "Jolly"
    list.push(pokemon)
}
return list`
	document.getElementById("custom-pokemon-update").onclick = function(){
		customPokemon = new Function(document.getElementById("custom-pokemon").value)
		update()
	}
	addFilterEntry("Type", hasItemInFilter("types"), typeNames)
	addFilterEntry("Ability", hasItemInFilter("ability","abilities"), Object.keys(abilities))
	addFilterEntry("Move", hasItemInFilter("moves"), Object.keys(moves))
	addFilterEntry("Egg group", hasItemInFilter("eggGroups"), eggGroupNames)
	addFilterMultiSelectEntry("Gender ratios", hasItemInFilter("ratio"), ["7:1","3:1","1:1","1:3","1:7","—"])
	addFilterMultiSelectEntry("Generation", generationFilter, ["1","2","3","4","5","6","7"])
	addFilterSelectEntry("Legendary", legendaryFilter, ["Show only","Don't show"])
	if(spreadsheetId){
		addFilterEntry("Nature", hasItemInFilter("nature"), Object.keys(natures))
		addFilterEntry("Learnt moves", hasItemInFilter("learntMoves"), Object.keys(moves))
		addFilterMultiSelectEntry("Gender", hasItemInFilter("gender"), ["♂","♀","—","Undefined"])
		addFilterSelectEntry("Shiny", shinyFilter, ["Show only","Don't show"])
		addFilterSelectEntry("Hidden ability", hiddenAbilityFilter, ["Show only","Don't show"])
	}
	addSortMethod("ID", function(a,b){return a.id - b.id})
	addSortMethod("HP", function(a,b){return b.stats.hp - a.stats.hp})
	addSortMethod("Attack", function(a,b){return b.stats.atk - a.stats.atk})
	addSortMethod("Defense", function(a,b){return b.stats.def - a.stats.def})
	addSortMethod("Sp. Attack", function(a,b){return b.stats.spa - a.stats.spa})
	addSortMethod("Sp. Defense", function(a,b){return b.stats.spd - a.stats.spd})
	addSortMethod("Speed", function(a,b){return b.stats.spe - a.stats.spe})
	addSortMethod("Total base stats", function(a,b){return getTotalBaseStat(b) - getTotalBaseStat(a)})
	addSortMethod("Custom sort", function(a,b){return b.stats.hp - a.stats.hp})
	addCustomFilterEntry("Custom filter")
	addFilterChooser("Add filter:")
	addSortingChooser("Sort by:")
	addSearch("Search")
	if(externalInventory.shouldLoad)
		addCompletionModeSwitcher()
		
	document.getElementById("copy").onclick = function(){
		document.getElementById("copy").style.display = "none"
	}
	document.getElementById("pokemon-copy-table").onclick = function(e){
		e.stopPropagation()
	}
	setTimeout(function(){fade(document.getElementById("loading"))},500)
	update()
	if(!externalInventory.shouldLoad && destination)
		selectPokemonBasedOn(destination)
	setInterval(loadMoreWhenScrolledDown,500)
}

function fade(element) {
	var opacity = 1;
	var timer = setInterval(function () {
		if (opacity <= 0.01){
			clearInterval(timer)
			element.style.display = 'none'
		}
		element.style.opacity = opacity
		element.style.filter = 'alpha(opacity=' + opacity * 100 + ")"
		opacity -= 0.15
	}, 50)
}

function setColors(backgroundColor, textColor, headerColor){
	document.getElementsByTagName("body")[0].style.backgroundColor = backgroundColor
	document.getElementsByTagName("body")[0].style.color = textColor
	document.getElementsByTagName("section")[0].style.backgroundColor = headerColor
	document.getElementsByTagName("header")[0].style.backgroundColor = headerColor
}

function addCompletionModeSwitcher(){
	var element = newTag("li", filterAdder, true)
	element.innerHTML = "Normal mode"
	element.style.cursor = "pointer"
	element.onclick = function(){
		switch(completionMode){
			case "normal":
				completionMode = "families"
				element.innerHTML = "Completion: Families"
			break
			case "families":
				completionMode = "pokemons"
				element.innerHTML = "Completion: Pokemons"
			break
			case "pokemons":
				completionMode = "forms"
				element.innerHTML = "Completion: Forms"
			break
			case "forms":
				completionMode = "normal"
				element.innerHTML = "Normal mode"
			break
		}
		update()
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

function addSortMethod(name, method){
	sorts[name] = {method: method}
}

function addSortingChooser(label){
	var filterElement = newTag("li", document.getElementById("custom-adder"), true)
	newTag("label", filterElement).innerHTML = label
	var selectElement = newTag("select", filterElement)
	for(var i in sorts){
		var optionElement = newTag("option", selectElement)
		optionElement.value = i
		optionElement.innerHTML = i
	}
	selectElement.onchange = function(){
		var customSortElement = document.getElementById("custom-sort")
		if(this.value == "Custom sort"){
			newTag("label", customSortElement).innerHTML = label
			var inputElement = newTag("textarea", customSortElement)
			inputElement.type = "text"
			inputElement.style.width = "20rem"
			inputElement.style.height = "1rem"
			inputElement.value = "return pokeB.stats.hp - pokeA.stats.hp"
			var addElement = newTag("button", customSortElement)
			addElement.innerHTML = "Update"
			addElement.onclick = function(){
				sorts["Custom sort"].method = addCustomSort(label, inputElement.value)
				update()
			}
			sorting = sorts["Custom sort"]
			update()
		}
		else {
			customSortElement.innerHTML = ""
			sorting = sorts[this.value]
			update()
		}
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

function addCustomFilterEntry(label){
	var filterElement = newTag("li", filterList)
	filterElement.style.display = "none"
	filterElement.title = "Return true for the pokemon you want to see"
	newTag("label", filterElement).innerHTML = label
	var inputElement = newTag("textarea", filterElement)
	inputElement.type = "text"
	inputElement.style.width = "20rem"
	inputElement.style.height = "1rem"
	inputElement.value = "return pokemon.form.startsWith('Mega')"
	var addElement = newTag("button", filterElement)
	addElement.innerHTML = "Add"
	addElement.onclick = function(){
		addCustomFilter(label, inputElement.value)
		update()
	}
}

function addCustomFilter(label, input, filterFunction){
	var title = label + " <span class='close-mark'>❌</span>"
	filters[title] = function(pokemon){return new Function("var pokemon = this;" + input).call(pokemon)}
}

function addCustomSort(label, input, filterFunction){
	return function(a,b){return new Function("var pokeA = this.a;var pokeB = this.b;" + input).call({a:a,b:b})}
}

function addFilterEntry(label, filterFunction, datalist){
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

function addFilterSelectEntry(label, filterFunction, options){
	var filterElement = newTag("li", filterList)
	filterElement.style.display = "none"
	newTag("label", filterElement).innerHTML = label
	var selectElement = newTag("select", filterElement)
	for(var i in options){
		option = newTag("option", selectElement)
		option.value = options[i]
		option.innerHTML = options[i]
	}
	var addElement = newTag("button", filterElement)
	addElement.innerHTML = "Add"
	addElement.onclick = function(){
		addFilter(label, selectElement.value, filterFunction)
		update()
	}
}

function addFilterMultiSelectEntry(label, filterFunction, options){
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