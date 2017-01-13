var nameHeader = document.getElementById("name-header")
var imageSection = document.getElementById("image-section")
var infoSection = document.getElementById("info-section")
var statSection = document.getElementById("stat-section")
var movesSection = document.getElementById("moves-section")

typeColors = {
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
typeDarkColors = {
	Bug: "#6D7815",
	Dark: "#49392F",
	Dragon: "#4924A1",
	Electric: "#A1871F",
	Fairy: "#9B6470",
	Fighting: "#7D1F1A",
	Fire: "#9C531F",
	Flying: "#6D5E9C",
	Ghost: "#493963",
	Grass: "#4E8234",
	Ground: "#927D44",
	Ice: "#638D8D",
	Normal: "#6D6D4E",
	Poison: "#682A68",
	Psychic: "#A13959",
	Rock: "#786824",
	Steel: "#787887",
	Water: "#445E9C"
}

var currentPokemon

function updatePokemonInfo(pokemon){
	if(currentPokemon){
		currentPokemon = null
		pokemonInfo.className = "hidden-info"
		setTimeout(function(){
			updatePokemonInfo(pokemon)
		},500)
		return
	}
	currentPokemon = pokemon
	showPokemonInfo(currentPokemon)
	pokemonInfo.className = "shown-info"
}

function showPokemonInfo(pokemon){
	clearPokemonInfo()
	showNameHeader(pokemon)
	showImageSection(pokemon)
	showInfoSection(pokemon)
	showStatSection(pokemon)
	showMovesSection(pokemon)
}

function showNameHeader(pokemon){
	nameHeader.innerHTML = "#" + pokemon.id + " - " + pokemon.name
	if(pokemon.form && pokemon.form != "Base")
		nameHeader.innerHTML += " (" + pokemon.form + ")"
	var colorA = typeColors[pokemon.types[0]]
	var colorB = pokemon.types[1] ? typeColors[pokemon.types[1]] : typeColors[pokemon.types[0]]
	nameHeader.style.background = "linear-gradient(to right, " + colorA + ", " + colorB + ")"
}

function showImageSection(pokemon){
	imageSection.innerHTML = "<img src='https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/" + pokemonSimpleName(pokemon) + ".png'/>"
}

function showInfoSection(pokemon){
	var element = newTag("li", infoSection)
	element.innerHTML = getTypesText(pokemon)
	element = newTag("li", infoSection)
	element.innerHTML = pokemon.classification
	element = newTag("li", infoSection)
	element.innerHTML = pokemon.ratio
	element = newTag("li", infoSection)
	element.innerHTML = pokemon.eggCycles
}

function showStatSection(pokemon){
	var element = statSection.children[0].children[1]
	element.appendChild(getStatElement(pokemon, "hp", "HP"))
	element.appendChild(getStatElement(pokemon, "atk", "Attack"))
	element.appendChild(getStatElement(pokemon, "def", "Defense"))
	element.appendChild(getStatElement(pokemon, "spa", "Sp. Atk"))
	element.appendChild(getStatElement(pokemon, "spd", "Sp. Def"))
	element.appendChild(getStatElement(pokemon, "spe", "Speed"))
}

function getStatElement(pokemon, stat, headerText){
	var row = newTag("tr")
	var header = newTag("th", row)
	var text = newTag("td", row)
	var barElement = newTag("td", row)
	header.innerHTML = headerText
	var statBase = pokemon.stats[stat]
	var ivBase = pokemon.ivs ? pokemon.ivs[stat] : 0
	var evBase = pokemon.evs ? pokemon.evs[stat] : 0
	text.innerHTML = statBase
	if(pokemon.ivs || pokemon.evs)
		text.innerHTML += " · " + ivBase + " · " + evBase
	var bar = newTag("div", barElement)
	bar.className = "stat-bar base-bar"
	bar.style.width = statBase*2 + "px"
	bar = newTag("div", barElement)
	bar.className = "stat-bar iv-bar"
	bar.style.width = ivBase*2 + "px"
	bar = newTag("div", barElement)
	bar.className = "stat-bar ev-bar"
	bar.style.width = evBase*2 + "px"
	return row
}

function showMovesSection(pokemon){
	
}

function clearPokemonInfo(){
	while (statSection.children[0].children[1].firstChild)
		statSection.children[0].children[1].removeChild(statSection.children[0].children[1].firstChild)
	while (infoSection.firstChild)
		infoSection.removeChild(infoSection.firstChild)
}

function getTypeText(type){
	return "<span style='color:" + typeColors[type] + ";'>"+ type + "</span>"
}

function getTypesText(pokemon){
	return getTypeText(pokemon.types[0]) + (pokemon.types[1] ? " / " + getTypeText(pokemon.types[1]) : "")
}