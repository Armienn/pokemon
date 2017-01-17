
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
	if(!isEverythingLoaded())
		return
	if(loaded)
		return
	loaded = true
	addFilterEntry("Type", hasItemInFilter("types"), typeNames)
	addFilterEntry("Ability", hasItemInFilter("ability","abilities"), Object.keys(abilities))
	addFilterEntry("Move", hasItemInFilter("moves"), Object.keys(moves))
	addFilterEntry("Egg group", hasItemInFilter("eggGroups"), eggGroupNames)
	addFilterMultiSelectEntry("Gender ratios", hasItemInFilter("ratio"), ["7:1","3:1","1:1","1:3","1:7","—"])
	addFilterMultiSelectEntry("Generation", generationFilter, ["1","2","3","4","5","6","7"])
	if(spreadsheetId){
		addFilterEntry("Nature", hasItemInFilter("nature"), Object.keys(natures))
		addFilterEntry("Learnt moves", hasItemInFilter("learntMoves"), Object.keys(moves))
		addFilterMultiSelectEntry("Gender", hasItemInFilter("gender"), ["♂","♀","—","Undefined"])
	}
	addCustomFilterEntry("Custom filter")
	addFilterChooser("Add filter:")
	addSearch("Search")
	update()
	if(!spreadsheetId && destination)
		selectPokemonBasedOn(destination)
	setInterval(loadMoreWhenScrolledDown,500)
}

function setColors(backgroundColor, textColor, headerColor, tableHeaderColor){
	document.getElementsByTagName("body")[0].style.backgroundColor = backgroundColor
	document.getElementsByTagName("body")[0].style.color = textColor
	document.getElementsByTagName("section")[0].style.backgroundColor = headerColor
	document.getElementsByTagName("header")[0].style.backgroundColor = headerColor
	document.getElementsByTagName("thead")[0].style.backgroundColor = tableHeaderColor
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
	inputElement.style.width = "16rem"
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