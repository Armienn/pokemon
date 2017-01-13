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
	Normal: "#A8A878",
	Poison: "#A040A0",
	Psychic: "#F85888",
	Rock: "#B8A038",
	Steel: "#B8B8D0",
	Water: "#6890F0"
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
	nameHeader.innerHTML = "#" + pokemon.id + " - " + pokemon.name
	if(pokemon.form && pokemon.form != "Base")
		nameHeader.innerHTML += " (" + pokemon.form + ")"
	var colorA = typeColors[pokemon.types[0]]
	var colorB = pokemon.types[1] ? typeColors[pokemon.types[1]] : typeColors[pokemon.types[0]]
	nameHeader.style.background = "linear-gradient(to left, " + colorA + ", " + colorB + ")"
	imageSection.innerHTML = "<img src='https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/" + pokemonSimpleName(pokemon) + ".png'/>"
	infoSection.innerHTML = pokemon.types[0] + (pokemon.types[1] ? " / " + pokemon.types[1] : "")
	statSection.innerHTML = JSON.stringify(pokemon.stats)
}