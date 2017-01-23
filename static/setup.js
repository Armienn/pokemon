
var colors = {
	night: ["#222", "#eee", "#c00"],
	day: ["whitesmoke", "black", "rgb(239, 85, 67)"]
}
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
var types = {
	Normal: { strengths: [], weaknesses: ["Fighting"], immunities: ["Ghost"] },
	Fire: { strengths: ["Bug","Fairy","Fire","Grass","Ice","Steel"], weaknesses: ["Ground","Rock","Water"], immunities: [] },
	Water: { strengths: ["Fire","Ice","Steel","Water"], weaknesses: ["Electric","Grass"], immunities: [] },
	Electric: { strengths: ["Electric","Flying","Steel"], weaknesses: ["Ground"], immunities: [] },
	Grass: { strengths: ["Electric","Grass","Water","Ground"], weaknesses: ["Bug","Fire","Flying","Ice","Poison"], immunities: [] },
	Ice: { strengths: ["Ice"], weaknesses: ["Fighting","Fire","Rock","Steel"], immunities: [] },
	Fighting: { strengths: ["Bug","Dark","Rock"], weaknesses: ["Fairy","Flying","Psychic"], immunities: [] },
	Poison: { strengths: ["Bug","Fairy","Fighting","Grass","Poison"], weaknesses: ["Ground","Psychic"], immunities: [] },
	Ground: { strengths: ["Poison","Rock"], weaknesses: ["Grass","Ice","Water"], immunities: ["Electric"] },
	Flying: { strengths: ["Bug","Fighting","Grass"], weaknesses: ["Electric","Ice","Rock"], immunities: ["Ground"] },
	Psychic: { strengths: ["Fighting","Psychic"], weaknesses: ["Bug","Dark","Ghost"], immunities: [] },
	Bug: { strengths: ["Fighting","Grass","Ground"], weaknesses: ["Fire","Flying","Rock"], immunities: [] },
	Rock: { strengths: ["Fire","Flying","Normal","Poison"], weaknesses: ["Fighting","Grass","Ground","Steel","Water"], immunities: [] },
	Ghost: { strengths: ["Bug","Poison"], weaknesses: ["Dark","Ghost"], immunities: ["Fighting","Normal"] },
	Dragon: { strengths: ["Electric","Fire","Grass","Water"], weaknesses: ["Dragon","Fairy","Ice"], immunities: [] },
	Dark: { strengths: ["Dark","Ghost"], weaknesses: ["Bug","Fairy","Fighting"], immunities: ["Psychic"] },
	Steel: { strengths: ["Bug","Dragon","Fairy","Flying","Grass","Ice","Normal","Psychic","Rock","Steel"], weaknesses: ["Fighting","Fire","Ground"], immunities: ["Poison"] },
	Fairy: { strengths: ["Bug","Dark","Fighting"], weaknesses: ["Poison","Steel"], immunities: ["Dragon"] }
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
var natures = {
	"Adamant":{"positive":"Attack","negative":"Sp. Atk"},
	"Bashful":{"positive":"Sp. Atk","negative":"Sp. Atk"},
	"Bold":{"positive":"Defense","negative":"Attack"},
	"Brave":{"positive":"Attack","negative":"Speed"},
	"Calm":{"positive":"Sp. Def","negative":"Attack"},
	"Careful":{"positive":"Sp. Def","negative":"Sp. Atk"},
	"Docile":{"positive":"Defense","negative":"Defense"},
	"Gentle":{"positive":"Sp. Def","negative":"Defense"},
	"Hardy":{"positive":"Attack","negative":"Attack"},
	"Hasty":{"positive":"Speed","negative":"Defense"},
	"Impish":{"positive":"Defense","negative":"Sp. Atk"},
	"Jolly":{"positive":"Speed","negative":"Sp. Atk"},
	"Lax":{"positive":"Defense","negative":"Sp. Def"},
	"Lonely":{"positive":"Attack","negative":"Defense"},
	"Mild":{"positive":"Sp. Atk","negative":"Defense"},
	"Modest":{"positive":"Sp. Atk","negative":"Attack"},
	"Naive":{"positive":"Speed","negative":"Sp. Def"},
	"Naughty":{"positive":"Attack","negative":"Sp. Def"},
	"Quiet":{"positive":"Sp. Atk","negative":"Speed"},
	"Quirky":{"positive":"Sp. Def","negative":"Sp. Def"},
	"Rash":{"positive":"Sp. Atk","negative":"Sp. Def"},
	"Relaxed":{"positive":"Defense","negative":"Speed"},
	"Sassy":{"positive":"Sp. Def","negative":"Speed"},
	"Serious":{"positive":"Speed","negative":"Speed"},
	"Timid":{"positive":"Speed","negative":"Attack"}
}

var currentPokemon
var showMoves = false

var mode = "table"
var completionMode = "normal"
var loaded = false

var pokemons = []
var moves = {}
var abilities = {}
var filters = {}
var sorts = {}
var sorting
var searchFilter

var onload

var pokes = []
var nextPoke = 0
var nextLimit = 25

var groupsStuff = []
var nextMoveGroup = 0

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

var nameHeader = document.getElementById("name-header")
var descriptionHeader = document.getElementById("description-header")
var imageSection = document.getElementById("image-section")
var infoSection = document.getElementById("info-section")
var infoSectionTable = document.getElementById("info-section").children[0].children[1]
var infoBSectionTable = document.getElementById("info-b-section").children[0].children[1]
var defensesSectionTable = document.getElementById("defenses-section")
var statSection = document.getElementById("stat-section")
var statSectionTable = document.getElementById("stat-section").children[0].children[1]
var familySectionTable = document.getElementById("family-section")
var movesHeader = document.getElementById("moves-header")
var movesSection = document.getElementById("moves-section")
var movesLevelTable = document.getElementById("moves-level")
var movesEvolutionTable = document.getElementById("moves-evolution")
var movesEggTable = document.getElementById("moves-egg")
var movesTmTable = document.getElementById("moves-tm")
var movesTutorTable = document.getElementById("moves-tutor")
var closeElement = document.getElementById("close-header")
var pokeInfoRow = document.getElementById("pokemon-info-row")

var navAll = document.getElementById("nav-all")
var navCustom = document.getElementById("nav-custom")
var navMine = document.getElementById("nav-mine")
var navAllMine = document.getElementById("nav-all-mine")
var navBreedables = document.getElementById("nav-breedables")
var navInventory = document.getElementById("nav-inventory")
var navLookingFor = document.getElementById("nav-looking-for")

var loadedThings = {
	pokemons: false,
	moves: false,
	abilities: false
}
var externalInventory = {shouldLoad: false, loaded: false}

var spreadsheetId
var scriptUrl
if(window.location.search){
	var argument = window.location.search.substring(1)
	if(argument.startsWith("script:")){
		externalInventory.shouldLoad = true
		scriptUrl = argument.substring(7)
	} else {
		externalInventory.shouldLoad = true
		spreadsheetId = argument
	}
}
var destination = false
if(window.location.hash)
	destination = window.location.hash.substring(1)
var pokemonInventories = []
var pokemonLookingFor = []

var selectedTab
var customPokemon = function(){ 
	var list = []
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
	return list
}

setColors(...colors.night)
setupDayNightButtons()
setupTableGridButtons()
closeElement.onclick = ()=>{selectPokemon()}
movesHeader.onclick = toggleShowMoves

requestJSON("https://armienn.github.io/pokemon/static/moves.json", getMoves)
requestJSON("https://armienn.github.io/pokemon/static/pokemons.json", getPokemons)
requestJSON("https://armienn.github.io/pokemon/static/abilities.json", getAbilities)

if(spreadsheetId)
	requestJSON(getSpreadsheetUrl(spreadsheetId), parseSpreadsheet)

function addScriptTab(script){
	var tab = {}
	tab.title = "Pokémon list"
	tab.id = 1
	tab.pokemons = new Function(script)()
	pokemonInventories.push(tab)
	tab.navEntry = newTag("li", navInventory)
	navInventory.style.display = ""
	tab.navEntry.innerHTML = tab.title
	tab.navEntry.className = "inactive"
	tab.navEntry.onclick = function(){
		infoMove()
		selectTab(tab)
	}
	selectTab(tab)
}