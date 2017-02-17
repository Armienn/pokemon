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
			return entry["gsx$"+values[i]].$t.trim()
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
			if(i=="0")
				requestJSON(getWorksheetUrl(spreadsheetId, 1), parseConfig)
			continue
		}
		addNewTab(title, i)
	}
	if(pokemonLookingFor.length || pokemonInventories.length){
		navMine.style.display = ""
		navAllMine.onclick = function(){
			deselectTabs()
			navAllMine.className = "active"
			selectedTab = "mine"
			infoMove()
			update()
		}
		navBreedables.onclick = function(){
			deselectTabs()
			navBreedables.className = "active"
			selectedTab = "breedables"
			infoMove()
			update()
		}
	}
	updateExternalInventoryLoadedness()
	tryLoad()
}

function updateExternalInventoryLoadedness(){
	if(externalInventory.tabsToLoad)
		for(var i in externalInventory.tabsToLoad)
			if(!externalInventory.tabsToLoad[i])
				return
	externalInventory.loaded = true
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
		infoMove()
		selectTab(tab)
	}
	if(!externalInventory.tabsLoaded)
		externalInventory.tabsLoaded = []
	externalInventory.tabsLoaded[tab.id] = false
	requestJSON(getWorksheetUrl(spreadsheetId, tab.id), parseSheet(tab))
}

function selectTab(tab){
	deselectTabs()
	tab.navEntry.className = "active"
	selectedTab = tab
	window.location.hash = tab.id
	update()
}

function deselectTabs(){
	for(var i=0; i<navLookingFor.children.length; i++)
		navLookingFor.children[i].className = "inactive"
	for(var i=0; i<navInventory.children.length; i++)
		navInventory.children[i].className = "inactive"
	navAll.className = "inactive"
	navCustom.className = "inactive"
	navAllMine.className = "inactive"
	navBreedables.className = "inactive"
	document.getElementById("custom-pokemon-section").style.display = "none"
	selectedTab = undefined
}

function parseConfig(response){
	var entry = response.feed.entry[0]
	var name = tryValues(["ingamename"],entry)
	var friendcode = tryValues(["friendcode"],entry)
	var contactUrl = tryValues(["contacturl"],entry)
	var showBreedables = tryValues(["showbreedables"],entry)
	var colorScheme = tryValues(["colorscheme"],entry)
	var backgroundColor = tryValues(["custombackgroundcolor","backgroundcolor"],entry)
	var textColor = tryValues(["customtextcolor","textcolor"],entry)
	var headerColor = tryValues(["customheadercolor","headercolor"],entry)
	if(contactUrl && name)
		document.getElementById("main-title").innerHTML = "<a href=\"" + contactUrl + "\">" + name + "</a>'s <a href=\"https://docs.google.com/spreadsheets/d/" + spreadsheetId + "\">Pokémon</a> <a href=\"https://armienn.github.io/pokemon/\">Stuff</a>"
	else if(name)
		document.getElementById("main-title").innerHTML = name + "'s Pokémon <a href=\"https://armienn.github.io/pokemon/\">Stuff</a>"
	if(name){
		document.getElementById("nav-all-mine").innerHTML = name + "'s Pokémon"
		document.title = name + "'s Pokémon Stuff"
	}
	if(friendcode){
		document.getElementById("sub-title").innerHTML = "FC: " + friendcode
		document.getElementById("sub-title").style.display = ""
	}
	if(!showBreedables || showBreedables.toLowerCase().trim() == "no" || showBreedables.toLowerCase().trim() == "false")
		document.getElementById("nav-breedables").style.display = "none"
		
	if(colorScheme.toLowerCase().trim() == "night")
		setColors(...colors.night)
	else if(colorScheme.toLowerCase().trim() == "day")
		setColors(...colors.day)
	else if(colorScheme.toLowerCase().trim() == "custom")
		setColors(backgroundColor, textColor, headerColor)
}

function parseSheet(tab){
	return function(response){
		for(var i in response.feed.entry){
			loadPokemon(response.feed.entry[i], tab)
		}
		if(tab.id == destination)
			selectTab(tab)
		externalInventory.tabsLoaded[tab.id] = true
		updateExternalInventoryLoadedness()
		tryLoad()
	}
}

function loadPokemon(entry, tab){
	var id = Number(tryValues(["dexno", "no", "number", "id"], entry))
	var name = tryValues(["pokemon", "name"], entry)
	var form = tryValues(["form"], entry)
	if(name){
		var splitName = name.split("(")
		if(1 < splitName.length){
			name = splitName[0].trim()
			if(!form)
				form = splitName[1].split(")")[0].trim()
		}
	}
	var pokemon = getPokemonFrom({name:name, id:id, form:form})
	if(!pokemon)
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
	pokemon.learntMoves = [
		tryValues(["move1", "eggmove1", "moveslot1"], entry),
		tryValues(["move2", "eggmove2", "moveslot2"], entry),
		tryValues(["move3", "eggmove3", "moveslot3"], entry),
		tryValues(["move4", "eggmove4", "moveslot4"], entry)
		].filter(e => e)
	pokemon.gender = tryValues(["gender", "sex", "mf", "fm"], entry)
	switch (pokemon.base.ratio) {
	case "1:0":
		pokemon.gender = '♂'
		break;
	case "0:1":
		pokemon.gender = '♀'
		break;
	case "—":
		pokemon.gender = '—'
		break;
	}
	if(pokemon.gender){
		if(pokemon.gender.indexOf("♂")>-1 || pokemon.gender.toLowerCase() == "m" || pokemon.gender.toLowerCase() == "male")
			pokemon.gender = "♂"
		if(pokemon.gender.indexOf("♀")>-1 || pokemon.gender.toLowerCase() == "f" || pokemon.gender.toLowerCase() == "female")
			pokemon.gender = "♀"
		if(pokemon.gender.toLowerCase() == "-" || pokemon.gender.toLowerCase() == "none")
			pokemon.gender = '—'
	}

	pokemon.amount = tryValues(["amount", "count"], entry)
	pokemon.shiny = tryValues(["shiny"], entry)
	pokemon.nickname = tryValues(["nickname"], entry)
	pokemon.ot = tryValues(["ot"], entry)
	pokemon.tid = tryValues(["tid"], entry)
	pokemon.level = tryValues(["level","lvl","lv"], entry)
	pokemon.language = tryValues(["language","lang"], entry)
	pokemon.notes = tryValues(["notes","note","comments","comment"], entry)
	pokemon.balls = [tryValues(["pokeball","ball"], entry)].filter(e=>e)
	if(pokemon.balls.length == 0){
		if (getValue(entry.gsx$poke)) pokemon.balls.push("Poké Ball")
		if (getValue(entry.gsx$great)) pokemon.balls.push("Great Ball")
		if (getValue(entry.gsx$ultra)) pokemon.balls.push("Ultra Ball")
		if (getValue(entry.gsx$master)) pokemon.balls.push("Master Ball")
		if (getValue(entry.gsx$safari)) pokemon.balls.push("Safari Ball")
		if (getValue(entry.gsx$level)) pokemon.balls.push("Level Ball")
		if (getValue(entry.gsx$lure)) pokemon.balls.push("Lure Ball")
		if (getValue(entry.gsx$moon)) pokemon.balls.push("Moon Ball")
		if (getValue(entry.gsx$friend)) pokemon.balls.push("Friend Ball")
		if (getValue(entry.gsx$love)) pokemon.balls.push("Love Ball")
		if (getValue(entry.gsx$heavy)) pokemon.balls.push("Heavy Ball")
		if (getValue(entry.gsx$fast)) pokemon.balls.push("Fast Ball")
		if (getValue(entry.gsx$sport)) pokemon.balls.push("Sport Ball")
		if (getValue(entry.gsx$premier)) pokemon.balls.push("Premier Ball")
		if (getValue(entry.gsx$repeat)) pokemon.balls.push("Repeat Ball")
		if (getValue(entry.gsx$timer)) pokemon.balls.push("Timer Ball")
		if (getValue(entry.gsx$nest)) pokemon.balls.push("Nest Ball")
		if (getValue(entry.gsx$net)) pokemon.balls.push("Net Ball")
		if (getValue(entry.gsx$dive)) pokemon.balls.push("Dive Ball")
		if (getValue(entry.gsx$luxury)) pokemon.balls.push("Luxury Ball")
		if (getValue(entry.gsx$heal)) pokemon.balls.push("Heal Ball")
		if (getValue(entry.gsx$quick)) pokemon.balls.push("Quick Ball")
		if (getValue(entry.gsx$dusk)) pokemon.balls.push("Dusk Ball")
		if (getValue(entry.gsx$cherish)) pokemon.balls.push("Cherish Ball")
		if (getValue(entry.gsx$dream)) pokemon.balls.push("Dream Ball")
		if (getValue(entry.gsx$beast)) pokemon.balls.push("Beast Ball")
	}
	if(pokemon.balls.length == 0) { // compatibility with richi3f's sheet
		if (entry.gsx$_dcgjs) pokemon.balls.push("Poké Ball")
		if (entry.gsx$_ddv49) pokemon.balls.push("Great Ball")
		if (entry.gsx$_d415a) pokemon.balls.push("Ultra Ball")
		if (entry.gsx$_d5fpr) pokemon.balls.push("Master Ball")
		if (entry.gsx$_d6ua4) pokemon.balls.push("Safari Ball")
		if (entry.gsx$_d88ul) pokemon.balls.push("Level Ball")
		if (entry.gsx$_dkvya) pokemon.balls.push("Lure Ball")
		if (entry.gsx$_dmair) pokemon.balls.push("Moon Ball")
		if (entry.gsx$_dnp34) pokemon.balls.push("Friend Ball")
		if (entry.gsx$_dp3nl) pokemon.balls.push("Love Ball")
		if (entry.gsx$_df9om) pokemon.balls.push("Heavy Ball")
		if (entry.gsx$_dgo93) pokemon.balls.push("Fast Ball")
		if (entry.gsx$_di2tg) pokemon.balls.push("Sport Ball")
		if (entry.gsx$_djhdx) pokemon.balls.push("Premier Ball")
		if (entry.gsx$_dw4je) pokemon.balls.push("Repeat Ball")
		if (entry.gsx$_dxj3v) pokemon.balls.push("Timer Ball")
		if (entry.gsx$_dyxo8) pokemon.balls.push("Nest Ball")
		if (entry.gsx$_e0c8p) pokemon.balls.push("Net Ball")
		if (entry.gsx$_dqi9q) pokemon.balls.push("Dive Ball")
		if (entry.gsx$_drwu7) pokemon.balls.push("Luxury Ball")
		if (entry.gsx$_dtbek) pokemon.balls.push("Heal Ball")
		if (entry.gsx$_dupz1) pokemon.balls.push("Quick Ball")
		if (entry.gsx$_e7d2q) pokemon.balls.push("Dusk Ball")
		if (entry.gsx$_e8rn7) pokemon.balls.push("Cherish Ball")
		if (entry.gsx$_ea67k) pokemon.balls.push("Dream Ball")
		if (entry.gsx$_ebks1) pokemon.balls.push("Beast Ball")
	}
	tab.pokemons.push(pokemon)
}

function identifyPokemon(entry){
	var id = Number(getValue(entry.gsx$dexno) || getValue(entry.gsx$no) || getValue(entry.gsx$number) || getValue(entry.gsx$id))
	var name = getValue(entry.gsx$name) || getValue(entry.gsx$pokemon)
	var form = getValue(entry.gsx$form)
	if(!id && !name)
		return false
	if(!id){
		var possiblePokes = pokemons.filter(e => name.toLowerCase() == e.name.toLowerCase())
		if(possiblePokes.length)
			id = possiblePokes[0].id
		else
			return false
	}
	return findPokemon(id, form)
}
