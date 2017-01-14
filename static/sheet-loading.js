var navAll = document.getElementById("nav-all")
var navInventory = document.getElementById("nav-inventory")
var navLookingFor = document.getElementById("nav-looking-for")
var spreadsheetId = 0
if(window.location.search)
	spreadsheetId = window.location.search.substring(1)
var pokemonInventories = []
var pokemonLookingFor = []

function getWorksheetUrl(spreadsheetId, worksheetId) {
    return "https://spreadsheets.google.com/feeds/list/" + spreadsheetId + "/" + worksheetId + "/public/values?alt=json";
}
function getSpreadsheetUrl(spreadsheetId) {
    return "https://spreadsheets.google.com/feeds/worksheets/" + spreadsheetId + "/public/basic?alt=json";
}
function getValue(field) {
    if (field) return field.$t;
    return undefined;
}
function tryValues(values, entry){
	for(var i in values)
		if(entry["gsx$"+values[i]] && entry["gsx$"+values[i]].$t)
			return entry["gsx$"+values[i]].$t
	return undefined
}

function parseSpreadsheet(response){
	for(var i in response.feed.entry){
		var entry = response.feed.entry[i]
		var title = getValue(entry.title).trim()
		if(title.toLowerCase().indexOf("item") > -1 ||
			title.toLowerCase().indexOf("template") > -1 ||
			title.toLowerCase().indexOf("config") > -1 ||
			title.toLowerCase().indexOf("database") > -1 ||
			title.toLowerCase().indexOf("resource") > -1 ||
			title.toLowerCase() == "db"
		){
			continue
		}
		addNewTab(title, i)
	}
	if(pokemonLookingFor.length || pokemonInventories.length){
		navAll.style.display = ""
		navAll.onclick = function(){
			for(var i=0; i<navLookingFor.children.length; i++)
				navLookingFor.children[i].className = "inactive"
			for(var i=0; i<navInventory.children.length; i++)
				navInventory.children[i].className = "inactive"
			navAll.className = "active"
		}
	}
	tryLoad()
}

function addNewTab(title, index){
	var tab = {}
	tab.title = title
	tab.id = (+index) + 1
	tab.pokemons = []
	if(title.toLowerCase().startsWith("lf") ||
		title.toLowerCase().startsWith("looking for")
	){
		pokemonLookingFor.push(tab)
		tab.navEntry = newTag("li", navLookingFor)
		navLookingFor.style.display = ""
	} else {
		pokemonInventories.push(tab)
		tab.navEntry = newTag("li", navInventory)
		navInventory.style.display = ""
	}
	tab.navEntry.innerHTML = tab.title
	tab.navEntry.className = "inactive"
	tab.navEntry.onclick = function(){
		selectTab(tab)
	}
	requestJSON(getWorksheetUrl(spreadsheetId, tab.id), parseSheet(tab))
}

function selectTab(tab){
	for(var i=0; i<navLookingFor.children.length; i++)
		navLookingFor.children[i].className = "inactive"
	for(var i=0; i<navInventory.children.length; i++)
		navInventory.children[i].className = "inactive"
	navAll.className = "inactive"
	tab.navEntry.className = "active"
}

function parseSheet(tab){
	return function(response){
		for(var i in response.feed.entry){
			loadPokemon(response.feed.entry[i], tab)
		}
	}
}

function loadPokemon(entry, tab){
	var pokemon = {}
	if(!identifyPokemon(entry, pokemon))
		return
	pokemon.nature = getValue(entry.gsx$nature)
	pokemon.ability = getValue(entry.gsx$ability)
	pokemon.ivs = {}
	pokemon.ivs.hp = tryValues(["hpiv", "ivhp", "hp"], entry) || "x"
	pokemon.ivs.atk = tryValues(["atkiv", "attackiv", "attack", "ivattack", "ivatk", "atk"], entry) || "x"
	pokemon.ivs.def = tryValues(["defiv", "defenseiv", "defense", "ivdefense", "ivdef", "def"], entry) || "x"
	pokemon.ivs.spa = tryValues(["spaiv", "spatkiv", "spatk", "ivspatk", "ivspa", "spa"], entry) || "x"
	pokemon.ivs.spd = tryValues(["spdiv", "spdefiv", "spdef", "ivspdef", "ivspd", "spd"], entry) || "x"
	pokemon.ivs.spe = tryValues(["speiv", "speediv", "speed", "ivspeed", "ivspe", "spe"], entry) || "x"
	pokemon.evs = {}
	pokemon.evs.hp = tryValues(["hpev", "evhp"], entry) || "x"
	pokemon.evs.atk = tryValues(["atkev", "attackev", "evattack", "evatk"], entry) || "x"
	pokemon.evs.def = tryValues(["defev", "defenseev", "evdefense", "evdef"], entry) || "x"
	pokemon.evs.spa = tryValues(["spaev", "spatkev", "evspatk", "evspa"], entry) || "x"
	pokemon.evs.spd = tryValues(["spdev", "spdefev", "evspdef", "evspd"], entry) || "x"
	pokemon.evs.spe = tryValues(["speev", "speedev", "evspeed", "evspe"], entry) || "x"
	pokemon.hiddenPower = tryValues(["hiddenpower", "hidden"], entry)
	pokemon.moves = [
		tryValues(["move1", "eggmove1"], entry),
		tryValues(["move2", "eggmove2"], entry),
		tryValues(["move3", "eggmove3"], entry),
		tryValues(["move4", "eggmove4"], entry)
		].filter(e => e)
	pokemon.gender = tryValues(["gender", "sex"], entry)
	switch (pokemon.base.ratio) {
	case "1:0":
		pokemon.gender = '♀'
		break;
	case "0:1":
		pokemon.gender = '♂'
		break;
	case "—":
		pokemon.gender = '—'
		break;
	}
	pokemon.amount = tryValues(["amount", "count"], entry)
	pokemon.shiny = tryValues(["shiny"], entry)
	pokemon.nickname = tryValues(["nickname"], entry)
	pokemon.ot = tryValues(["ot"], entry)
	pokemon.tid = tryValues(["tid"], entry)
	pokemon.level = tryValues(["level","lvl","lv"], entry)
	pokemon.ball = tryValues(["pokeball","ball"], entry)
	if(!pokemon.ball){
		if (getValue(this.gsx$poke)) pokemon.ball = "Poké Ball"
		if (getValue(this.gsx$great)) pokemon.ball = "Great Ball"
		if (getValue(this.gsx$Ultra)) pokemon.ball = "Ultra Ball"
		if (getValue(this.gsx$master)) pokemon.ball = "Master Ball"
		if (getValue(this.gsx$safari)) pokemon.ball = "Safari Ball"
		if (getValue(this.gsx$level)) pokemon.ball = "Level Ball"
		if (getValue(this.gsx$lure)) pokemon.ball = "Lure Ball"
		if (getValue(this.gsx$moon)) pokemon.ball = "Moon Ball"
		if (getValue(this.gsx$friend)) pokemon.ball = "Friend Ball"
		if (getValue(this.gsx$love)) pokemon.ball = "Love Ball"
		if (getValue(this.gsx$heavy)) pokemon.ball = "Heavy Ball"
		if (getValue(this.gsx$fast)) pokemon.ball = "Fast Ball"
		if (getValue(this.gsx$sport)) pokemon.ball = "Sport Ball"
		if (getValue(this.gsx$premier)) pokemon.ball = "Premier Ball"
		if (getValue(this.gsx$repeat)) pokemon.ball = "Repeat Ball"
		if (getValue(this.gsx$timer)) pokemon.ball = "Timer Ball"
		if (getValue(this.gsx$nest)) pokemon.ball = "Nest Ball"
		if (getValue(this.gsx$net)) pokemon.ball = "Net Ball"
		if (getValue(this.gsx$dive)) pokemon.ball = "Dive Ball"
		if (getValue(this.gsx$luxury)) pokemon.ball = "Luxury Ball"
		if (getValue(this.gsx$heal)) pokemon.ball = "Heal Ball"
		if (getValue(this.gsx$quick)) pokemon.ball = "Quick Ball"
		if (getValue(this.gsx$dusk)) pokemon.ball = "Dusk Ball"
		if (getValue(this.gsx$cherish)) pokemon.ball = "Cherish Ball"
		if (getValue(this.gsx$dream)) pokemon.ball = "Dream Ball"
		if (getValue(this.gsx$beast)) pokemon.ball = "Beast Ball"
	}
	tab.pokemons.push(pokemon)
}

function identifyPokemon(entry, pokemon){
	pokemon.id = Number(getValue(entry.gsx$dexno) || getValue(entry.gsx$no) || getValue(entry.gsx$number) || getValue(entry.gsx$id))
	pokemon.name = getValue(entry.gsx$name) || getValue(entry.gsx$pokemon)
	pokemon.form = getValue(entry.gsx$form)
	if(!pokemon.id && !pokemon.name)
		return false
	var possiblePokes = pokemons.filter(e => pokemon.id == e.id || pokemon.name.toLowerCase() == e.name.toLowerCase())
	if(possiblePokes.length == 1){
		pokemon.base = possiblePokes[0]
	} else if (possiblePokes.length > 0) {
		var possibleForms = possiblePokes.filter(e => e.form.toLowerCase().indexOf(pokemon.form.toLowerCase()) > -1)
		if(possibleForms.length == 1)
			pokemon.base = possibleForms[0]
		else
			pokemon.base = possiblePokes[0]
	} else return false
	return true
}

if(spreadsheetId)
	requestJSON(getSpreadsheetUrl(spreadsheetId), parseSpreadsheet)