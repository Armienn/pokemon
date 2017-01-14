var nameHeader = document.getElementById("name-header")
var imageSection = document.getElementById("image-section")
var infoSection = document.getElementById("info-section")
var infoSectionTable = document.getElementById("info-section").children[0].children[1]
var statSection = document.getElementById("stat-section")
var statSectionTable = document.getElementById("stat-section").children[0].children[1]
var movesHeader = document.getElementById("moves-header")
var movesSection = document.getElementById("moves-section")
var movesLevelTable = document.getElementById("moves-level")
var movesEvolutionTable = document.getElementById("moves-evolution")
var movesEggTable = document.getElementById("moves-egg")
var movesTmTable = document.getElementById("moves-tm")
var movesTutorTable = document.getElementById("moves-tutor")
var closeElement = document.getElementById("close-header")

var typeColors = {
	Bug: "#A8B820",
	Dark: "#705848",
	Dragon: "#7038F8",
	Electric: "#F8D030",
	Fairy: "#EE99AC",
	Fighting: "#C03028",
	Fire: "#F08030",
	Flying: "#A890F0",
	Ghost: "#705898",
	Grass: "#78C850",
	Ground: "#E0C068",
	Ice: "#98D8D8",
	Normal: "#A8A878",
	Poison: "#A040A0",
	Psychic: "#F85888",
	Rock: "#B8A038",
	Steel: "#B8B8D0",
	Water: "#6890F0"
}
var typeNames = [
	"Bug",
	"Dark",
	"Dragon",
	"Electric",
	"Fairy",
	"Fighting",
	"Fire",
	"Flying",
	"Ghost",
	"Grass",
	"Ground",
	"Ice",
	"Normal",
	"Poison",
	"Psychic",
	"Rock",
	"Steel",
	"Water"
]
var eggGroupNames = [
	"Monster",
	"Water 1",
	"Water 2",
	"Water 3",
	"Human-Like",
	"Bug",
	"Mineral",
	"Flying",
	"Amorphous",
	"Field",
	"Fairy",
	"Ditto",
	"Grass",
	"Dragon",
	"Undiscovered"
]

var currentPokemon
var showMoves = false

function updatePokemonInfo(pokemon){
	if(currentPokemon){
		deselectPokemon()
		setTimeout(function(){
			updatePokemonInfo(pokemon)
		},500)
		return
	}
	currentPokemon = pokemon
	showPokemonInfo(currentPokemon)
	pokemonInfo.className = "shown-info"
	setTimeout(function(){
		pokemonInfo.style.maxHeight = "none"
	},500)
}
function deselectPokemon(){
		currentPokemon = null
		pokemonInfo.style.maxHeight = ""
		setTimeout(function(){
			pokemonInfo.className = "hidden-info"
		},0)
		if(showMoves)
			toggleShowMoves()
		main.scrollTop = 0
}
closeElement.onclick = deselectPokemon

function showPokemonInfo(pokemon){
	clearPokemonInfo()
	showNameHeader(pokemon)
	showImageSection(pokemon)
	showInfoSection(pokemon)
	showStatSection(pokemon)
	showMovesSection(pokemon)
}

function showNameHeader(pokemon){
	if(pokemon.base)
		nameHeader.innerHTML =  pokemon.name + getAmountShinyText(pokemon)
	else
		nameHeader.innerHTML = "#" + pokemon.id + " - " + pokemon.name
	if(pokemon.form && pokemon.form != "Base")
		nameHeader.innerHTML += " (" + pokemon.form + ")"
	var colorA = typeColors[pokemon.types[0]]
	var colorB = pokemon.types[1] ? typeColors[pokemon.types[1]] : typeColors[pokemon.types[0]]
	nameHeader.style.background = "linear-gradient(to right, " + colorA + ", " + colorB + ")"
}

function showImageSection(pokemon){
	imageSection.innerHTML = "<img src='"+getPokemonImageName(pokemon)+"' style='height: 13rem;'/>"
}

function showInfoSection(pokemon){
	addInfoElement(pokemon, "Types |", getTypesText(pokemon))
	if(pokemon.nickname)
		addInfoElement(pokemon, "Nickname |", pokemon.nickname)
	else
		addInfoElement(pokemon, "Classification |", pokemon.classification)
	if(pokemon.ability)
		addInfoElement(pokemon, "Ability |", getAbilityText(pokemon.ability, pokemon.abilities[2].toLowerCase() == pokemon.ability.toLowerCase()))
	else
		addInfoElement(pokemon, "Abilities |", getAbilitiesText(pokemon))
	if(pokemon.nature)
		addInfoElement(pokemon, "Nature |", pokemon.nature)
	else
		addInfoElement(pokemon, "Egg groups |", getEggGroupsText(pokemon))
	if(pokemon.gender)
		addInfoElement(pokemon, "Gender |", getGenderText(pokemon))
	else
		addInfoElement(pokemon, "Gender ratio |", getGenderText(pokemon))
	if(pokemon.hiddenPower)
		addInfoElement(pokemon, "Hidden power |", getTypeText(pokemon.hiddenPower))
	else
		addInfoElement(pokemon, "Weight/height |", getWeightHeightText(pokemon))
}

function addInfoElement(pokemon, headerText, content){
	var row = newTag("tr", infoSectionTable)
	var header = newTag("th", row)
	var text = newTag("td", row)
	header.innerHTML = headerText
	text.innerHTML = content
}

function showStatSection(pokemon){
	addStatElement(pokemon, "HP |", "hp")
	addStatElement(pokemon, "Attack |", "atk")
	addStatElement(pokemon, "Defense |", "def")
	addStatElement(pokemon, "Sp. Atk |", "spa")
	addStatElement(pokemon, "Sp. Def |", "spd")
	addStatElement(pokemon, "Speed |", "spe")
}

function addStatElement(pokemon, headerText, stat){
	var row = newTag("tr", statSectionTable)
	var header = newTag("th", row)
	var text = newTag("td", row)
	var barElement = newTag("td", row)
	header.innerHTML = headerText
	var statBase = pokemon.stats[stat]
	var ivBase = pokemon.ivs ? pokemon.ivs[stat] : 0
	var evBase = pokemon.evs ? pokemon.evs[stat] : 0
	text.innerHTML = statBase
	var bar = newTag("div", barElement)
	bar.className = "stat-bar base-bar"
	bar.style.width = statBase*2 + "px"
	bar.style.background = "linear-gradient(to right, red, "+getStatColor(statBase)+")"
	if(pokemon.ivs || pokemon.evs){
		text.innerHTML += " · " + ivBase + " · " + evBase
		bar = newTag("div", barElement)
		bar.className = "stat-bar iv-bar"
		bar.style.width = ivBase + "px"
		bar = newTag("div", barElement)
		bar.className = "stat-bar ev-bar"
		bar.style.width = evBase/4 + "px"
	}
}

function showMovesSection(pokemon){
	var moveGroups = {}
	for(var i in pokemon.moves){
		var method = pokemon.moves[i].method
		var level = +method
		if(level)
			method = "level"
		if(!moveGroups[method])
			moveGroups[method] = []
		moveGroups[method].push({move: moves[pokemon.moves[i].name], level: level})
	}
	for(var key in moveGroups)
		fillMoveTable(document.getElementById("moves-" + key), moveGroups[key], key)
}

function fillMoveTable(table, moveGroup, method){
	addMoveHeader(table.children[0], moveGroup, method)
	for(var i in moveGroup){
		addMoveRow(table.children[1], moveGroup[i].move, moveGroup[i].level, i)
	}
}

function addMoveHeader(table, moveGroup, method){
	var row = newTag("tr", table)
	var title = "Learnt somehow"
	switch(method){
		case "level": title = "Learnt by level up:"; break;
		case "evolution": title = "Learnt by evolution:"; break;
		case "egg": title = "Learnt as egg move:"; break;
		case "tm": title = "Learnt by TM:"; break;
		case "tutor": title = "Learnt by tutor:"; break;
	}
	var titleRow = newTag("td", row)
	titleRow.innerHTML = title
	titleRow.colSpan = "8"
	titleRow.style.fontWeight = "bold"
	row = newTag("tr", table)
	newTag("td", row).innerHTML = "Move"
	newTag("td", row).innerHTML = "Type"
	newTag("td", row).innerHTML = "Category"
	newTag("td", row).innerHTML = "Power"
	newTag("td", row).innerHTML = "Accuracy"
	newTag("td", row).innerHTML = "Priority"
	newTag("td", row).innerHTML = "PP"
	newTag("td", row).innerHTML = "Summary"
}

function addMoveRow(table, move, level, i){
	var row = newTag("tr", table)
	var head = newTag("td", row)
	head.innerHTML = move.name
	head.style.fontWeight = "bold"
	newTag("td", row).innerHTML = getTypeText(move.type)
	newTag("td", row).innerHTML = move.category
	newTag("td", row).innerHTML = move.power
	newTag("td", row).innerHTML = move.accuracy
	newTag("td", row).innerHTML = move.priority
	newTag("td", row).innerHTML = move.pp.split(" ")[0]
	newTag("td", row).innerHTML = move.gameDescription
	row.className = i%2?"odd":"even"
}

function toggleShowMoves(){
	showMoves = !showMoves
	if(showMoves){
		movesHeader.innerHTML = "Moves ▼"
		movesSection.className = "shown-moves"
		pokemonInfo.style.maxHeight = "1000rem"
	} else {
		movesHeader.innerHTML = "Moves ▶"
		movesSection.className = "hidden-moves"
		pokemonInfo.style.maxHeight = ""
	}
}
movesHeader.onclick = toggleShowMoves

function clearPokemonInfo(){
	while (statSectionTable.firstChild)
		statSectionTable.removeChild(statSectionTable.firstChild)
	while (infoSectionTable.firstChild)
		infoSectionTable.removeChild(infoSectionTable.firstChild)
	for(var i=0;i<2;i++){
	while (movesLevelTable.children[i].firstChild)
		movesLevelTable.children[i].removeChild(movesLevelTable.children[i].firstChild)
	while (movesEvolutionTable.children[i].firstChild)
		movesEvolutionTable.children[i].removeChild(movesEvolutionTable.children[i].firstChild)
	while (movesEggTable.children[i].firstChild)
		movesEggTable.children[i].removeChild(movesEggTable.children[i].firstChild)
	while (movesTmTable.children[i].firstChild)
		movesTmTable.children[i].removeChild(movesTmTable.children[i].firstChild)
	while (movesTutorTable.children[i].firstChild)
		movesTutorTable.children[i].removeChild(movesTutorTable.children[i].firstChild)
	}
}

function getTypeText(type){
	return "<span style='color:" + typeColors[type] + ";'>"+ type + "</span>"
}

function getTypesText(pokemon){
	return getTypeText(pokemon.types[0]) + (pokemon.types[1] ? " · " + getTypeText(pokemon.types[1]) : "")
}

function getAbilityText(ability, hidden){
	return "<span" + (hidden ? " style='font-style: italic;'" : "") + ">"+ ability + "</span>"
}

function getAbilitiesText(pokemon){
	var text = getAbilityText(pokemon.abilities[0])
	if(pokemon.abilities[1])
		text += " · " + getAbilityText(pokemon.abilities[1])
	if(pokemon.abilities[2])
		text += " · " + getAbilityText(pokemon.abilities[2], true)
	return text
}

function getEggGroupText(eggGroup){
	return "<span>"+ eggGroup + "</span>"
}

function getEggGroupsText(pokemon){
	if(!pokemon.eggGroups) return "—"
	var text = getEggGroupText(pokemon.eggGroups[0])
	if(pokemon.eggGroups[1])
		text += " · " + getEggGroupText(pokemon.eggGroups[1])
	return text
}

function getGenderText(pokemon){
	if(pokemon.gender){
		if(pokemon.gender == "♂" || pokemon.gender.toLowerCase() == "m" || pokemon.gender.toLowerCase() == "male")
			return "<span style='color: #34d1ba;'>♂</span>"
		if(pokemon.gender == "♀" || pokemon.gender.toLowerCase() == "f" || pokemon.gender.toLowerCase() == "female")
			return "<span style='color: #f97272;'>♀</span>"
		if((pokemon.ratio || pokemon.ratio == "—") && pokemon.gender == "—" || pokemon.gender.toLowerCase() == "-" || pokemon.gender.toLowerCase() == "none")
			return "—"
	}
	if(!pokemon.ratio || pokemon.ratio == "—") return "—"
	var things = pokemon.ratio.split(":")
	return "<span style='color: #34d1ba;'>"+ things[0] + "♂</span>:<span style='color: #f97272;'>"+ things[1] + "♀</span>"
}

function getWeightHeightText(pokemon){
	var text = "-"
	if(pokemon.weight)
		text = pokemon.weight
	text += " / "
	if(pokemon.height)
		text += pokemon.height
	else
		text += "-"
	return text
}

function getStatText(stat){
	return "<span style='color:"+getStatColor(stat)+"'>" + stat + "</span>"
}

function getStatColor(stat){
	return "rgb("+HSVtoRGB(0.6*stat/255, 1, 1)+")"
}

function getAmountShinyText(pokemon){
	return " " + (pokemon.shiny ? "<span style='color:#f11;'>★</span>" : "") + (pokemon.amount ? " (" + pokemon.amount + ")" : "")
}

function getIVText(iv, pokemon) {
	return pokemon.ivs[iv]
}

function HSVtoRGB(h, s, v) {
		var r, g, b, i, f, p, q, t
		i = Math.floor(h * 6)
		f = h * 6 - i
		p = v * (1 - s)
		q = v * (1 - f * s)
		t = v * (1 - (1 - f) * s)
		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		return Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255)
	}