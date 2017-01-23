function selectPokemon(pokemon, element){
	if(!pokemon || currentPokemon == pokemon){
		currentPokemon = null
		infoSlideAway(function(){ infoMove() })
		return
	}
	if(currentPokemon){
		currentPokemon = null
		infoSlideAway(function(){ selectPokemon(pokemon, element) })
		return
	}
	currentPokemon = pokemon
	infoMove(element)
	showPokemonInfo(currentPokemon)
	infoSlideIn()
}

function selectPokemonBasedOn(destination){
	for(var n in pokemons){
		var pokemon = pokemons[n]
		var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀","-f").replace("♂","-m").replace("'","").replace(".","").replace("ébé","ebe").replace(":","")
		if(pokemon.id == destination || name == destination.toLowerCase()){
			selectPokemon(pokemon)
			return
		}
	}
}

function infoSlideAway(onDone){
	pokemonInfo.style.maxHeight = ""
	setTimeout(function(){
		pokemonInfo.className = "hidden-info"
	},50)
	if(showMoves)
		toggleShowMoves()
	setTimeout(function(){
		pokeInfoRow.style.display = "none"
		infoMove()
		if(onDone)
			onDone()
	},500)
}

function infoSlideIn(){
	pokeInfoRow.style.display = ""
	setTimeout(function(){
		pokemonInfo.className = "shown-info"
	},50)
	setTimeout(function(){
		pokemonInfo.style.maxHeight = "none"
	},500)
}

function infoMove(element){
	if(pokeInfoRow.parentNode)
		pokeInfoRow.parentNode.removeChild(pokeInfoRow)
	if(element && element.parentNode){
		element.parentNode.insertBefore(pokeInfoRow, element.nextSibling)
		pokeInfoRow.children[0].colSpan = element.children.length
		pokemonInfo.style.width = "100%"
		return
	}
	pokemonInfo.style.width = ""
	document.getElementById("pokemon-info-base").appendChild(pokeInfoRow)
}

function showPokemonInfo(pokemon){
	clearPokemonInfo()
	showNameHeader(pokemon)
	showDescriptionHeader(pokemon)
	showImageSection(pokemon)
	showInfoSection(pokemon)
	showInfoBSection(pokemon)
	showDefensesSection(pokemon)
	showStatSection(pokemon)
	showFamilySection(pokemon)
	showMovesSection(pokemon)
}

function showNameHeader(pokemon){
	nameHeader.innerHTML = ""
	if(!pokemon.base)
		nameHeader.innerHTML = "#" + pokemon.id + " - "
	nameHeader.innerHTML += pokemon.name
	if(pokemon.base)
		nameHeader.innerHTML += getAmountShinyText(pokemon)
	if(pokemon.form && pokemon.form != "Base")
		nameHeader.innerHTML += " (" + pokemon.form + ")"
	if(pokemon.level)
		nameHeader.innerHTML += " <span style='font-size:1rem;'>- Lv."+ pokemon.level + "</span>"
	if(pokemon.language)
		nameHeader.innerHTML += " <span style='font-size:1rem;'>- "+ pokemon.language + "</span>"
	var colorA = typeColors[pokemon.types[0]]
	var colorB = pokemon.types[1] ? typeColors[pokemon.types[1]] : typeColors[pokemon.types[0]]
	nameHeader.style.background = "linear-gradient(to right, " + colorA + ", " + colorB + ")"
}

function showDescriptionHeader(pokemon){
	descriptionHeader.innerHTML = pokemon.description
	if(pokemon.locations)
		descriptionHeader.title = pokemon.locations
	if(pokemon.notes)
		descriptionHeader.innerHTML = pokemon.notes
}

function showImageSection(pokemon){
	var url = "http://bulbapedia.bulbagarden.net/wiki/"+pokemon.name+"_(Pok%C3%A9mon)"
	imageSection.innerHTML = "<a href='" + url + "'><img src='"+getPokemonImageName(pokemon)+"' style='height: 13rem;'/></a>"
}

function showInfoSection(pokemon){
	addInfoElement(infoSectionTable, "Types |", getTypesText(pokemon))
	if(pokemon.nickname)
		addInfoElement(infoSectionTable, "Nickname |", pokemon.nickname)
	else
		addInfoElement(infoSectionTable, "Classification |", pokemon.classification)
	if(pokemon.ability)
		addInfoElement(infoSectionTable, "Ability |", getAbilityText(pokemon.ability, pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.toLowerCase() : false))
	else
		addInfoElement(infoSectionTable, "Abilities |", getAbilitiesText(pokemon, true))
	if(pokemon.nature)
		addInfoElement(infoSectionTable, "Nature |", pokemon.nature)
	else
		addInfoElement(infoSectionTable, "Egg groups |", getEggGroupsText(pokemon))
	if(pokemon.gender)
		addInfoElement(infoSectionTable, "Gender |", getGenderText(pokemon))
	else
		addInfoElement(infoSectionTable, "Gender ratio |", getGenderText(pokemon))
	if(pokemon.hiddenPower)
		addInfoElement(infoSectionTable, "Hidden power |", getTypeText(pokemon.hiddenPower))
	else
		addInfoElement(infoSectionTable, "Weight/height |", getWeightHeightText(pokemon))
}

function showInfoBSection(pokemon){
	if(!pokemon.base) return
	if(pokemon.ot || pokemon.tid)
		addInfoElement(infoBSectionTable, "OT |", pokemon.ot + (pokemon.tid ? " (" + prependZeroes(pokemon.tid, 6) + ")" : "" ) )
	for(var i in pokemon.learntMoves)
		addInfoElement(infoBSectionTable, "Move |", pokemon.learntMoves[i])
	if(pokemon.balls && pokemon.balls.length)
		addInfoElement(infoBSectionTable, "Ball |", getBallsText(pokemon)).style.padding = "0"
}

function showDefensesSection(pokemon){
	var typeNames = Object.keys(types)
	for(var i=0; i<typeNames.length/2; i++){
		addDefenseElement(defensesSectionTable, typeNames[i], getDefenseText(tallyDefense(typeNames[i], pokemon)), typeNames[i+9], getDefenseText(tallyDefense(typeNames[i+9], pokemon)))
	}
}

function tallyDefense(attackType, pokemon){
	var defense = 1
	defense *= getTypeDefense(attackType, pokemon.types[0])
	if(pokemon.types[1])
		defense *= getTypeDefense(attackType, pokemon.types[1])
	return defense
}

function getTypeDefense(attackType, defenseType){
	if(types[defenseType].weaknesses.indexOf(attackType) > -1)
		return 2
	else if(types[defenseType].strengths.indexOf(attackType) > -1)
		return 0.5
	else if(types[defenseType].immunities.indexOf(attackType) > -1)
		return 0
	return 1
}

function addDefenseElement(table, typeA, defenseA, typeB, defenseB){
	var row = newTag("tr", table)
	newTag("th", row).innerHTML = getTypeText(typeA) + " |"
	newTag("td", row).innerHTML = defenseA
	newTag("td", row).innerHTML = defenseB
	var endHeader = newTag("th", row)
	endHeader.innerHTML = "| " + getTypeText(typeB)
	endHeader.style.textAlign = "left"
}

function getDefenseText(defense){
	if(defense == 4)
		return "<span style='color:#10c210;'>4</span>"
	if(defense == 2)
		return "<span style='color:green;'>2</span>"
	if(defense == 1)
		return defense
	if(defense == 0.5)
		return "<span style='color:#ba2323;'>½</span>"
	if(defense == 0.25)
		return "<span style='color:#8c0101;'>¼</span>"
	if(defense == 0)
		return "<span style='color:#888888;'>0</span>"
}

function addInfoElement(table, headerText, content){
	var row = newTag("tr", table)
	newTag("th", row).innerHTML = headerText
	newTag("td", row).innerHTML = content
	return row
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
	row.title = "Base stat total: " + getTotalBaseStat(pokemon)
	var header = newTag("th", row)
	var text = newTag("td", row)
	var barElement = newTag("td", row)
	header.innerHTML = headerText
	var statBase = pokemon.stats[stat]
	var ivText = pokemon.ivs ? pokemon.ivs[stat] : 0
	var evBase = pokemon.evs ? pokemon.evs[stat] : 0
	var ivBase = ivText.toString().endsWith("*") ? 31 : ivText
	ivBase = isNaN(+ivBase) ? ivBase.replace(/(^\d+)(.+$)/i,'$1') : +ivBase
	text.innerHTML = statBase
	text.className = pokemon.nature ? getNatureCssClass(stat,pokemon) : ""
	var bar = newTag("div", barElement)
	bar.className = "stat-bar base-bar"
	bar.style.width = statBase*2 + "px"
	bar.style.background = "linear-gradient(to right, red, "+getStatColor(statBase)+")"
	if(pokemon.ivs || pokemon.evs){
		text.innerHTML += " · " + ivText + " · " + evBase
		bar = newTag("div", barElement)
		bar.className = "stat-bar iv-bar"
		bar.style.width = ivBase + "px"
		bar = newTag("div", barElement)
		bar.className = "stat-bar ev-bar"
		bar.style.width = evBase/4 + "px"
	}
}

function getTotalBaseStat(pokemon){
	var count = 0
	for(var i in pokemon.stats)
		count += pokemon.stats[i]
	return count
}

function showFamilySection(pokemon){
	var things = (pokemon.evolvesTo ? pokemon.evolvesTo.length : 0) + (pokemon.eggs ? pokemon.eggs.length : 0) + (pokemon.evolvesFrom ? 1 : 0)
	for(var i in pokemon.eggs)
		addFamilyElement(familySectionTable, "Egg |", pokemon.eggs[i], things > 6)
	if(pokemon.evolvesFrom)
		addFamilyElement(familySectionTable, "Evolves from |", pokemon.evolvesFrom, things > 6)
	for(var i in pokemon.evolvesTo)
		addFamilyElement(familySectionTable, "Evolves to |", pokemon.evolvesTo[i], things > 6)
	if(things == 0)
		familySectionTable.parentNode.parentNode.style.display = "none"
	else
		familySectionTable.parentNode.parentNode.style.display = ""
}

function addFamilyElement(table, headerText, pokeInfo, compact){
	var row = newTag("tr", table)
	newTag("th", row).innerHTML = headerText
	var pokemon = getPokemonFrom(pokeInfo)
	var text = pokemonFormName(pokemon) + (pokeInfo.method == "Normal" ? "" : " ("+pokeInfo.method + ")")
	var thing = newTag("td", row)
	thing.innerHTML = text
	row.style.cursor = "pointer"
	row.onclick = function(){
		selectPokemon(pokemon.base)
	}
	if(compact){
		thing.style.paddingBottom = "0.05rem"
		thing.style.paddingTop = "0.18rem"
		row.style.height = "1.33rem"
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
		groupsStuff.push({key:key, group: moveGroups[key]})
	setTimeout(addMoveGroup, 0)
}

function addMoveGroup(){
	if(!groupsStuff[nextMoveGroup]) return
	var moveThing = groupsStuff[nextMoveGroup]
	fillMoveTable(document.getElementById("moves-" + moveThing.key), moveThing.group, moveThing.key)
	nextMoveGroup++
	setTimeout(addMoveGroup, 0)
}

function fillMoveTable(table, moveGroup, method){
	addMoveHeader(table.children[0], moveGroup, method)
	for(var i in moveGroup){
		addMoveRow(table.children[1], moveGroup[i].move, moveGroup[i].level, i, method)
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
	if(method == "level")
		newTag("td", row).innerHTML = "Level"
	if(method == "tm")
		newTag("td", row).innerHTML = "TM"
	newTag("td", row).innerHTML = "Type"
	newTag("td", row).innerHTML = "Category"
	newTag("td", row).innerHTML = "Power"
	newTag("td", row).innerHTML = "Accuracy"
	newTag("td", row).innerHTML = "Priority"
	newTag("td", row).innerHTML = "PP"
	newTag("td", row).innerHTML = "Summary"
}

function addMoveRow(table, move, level, i, method){
	var row = newTag("tr", table)
	var head = newTag("td", row)
	var url = "http://pokemondb.net/move/" + move.name.toLowerCase().replace(" ","-").replace("'","")
	head.innerHTML = "<a href='" + url + "'>" + move.name + "</a>"
	head.style.fontWeight = "bold"
	if(method == "level")
		newTag("td", row).innerHTML = level
	if(method == "tm")
		newTag("td", row).innerHTML = move.tm
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
		pokemonInfo.style.maxHeight = "none"
	}
}

function clearPokemonInfo(){
	while (statSectionTable.firstChild)
		statSectionTable.removeChild(statSectionTable.firstChild)
	while (infoSectionTable.firstChild)
		infoSectionTable.removeChild(infoSectionTable.firstChild)
	while (infoBSectionTable.firstChild)
		infoBSectionTable.removeChild(infoBSectionTable.firstChild)
	while (defensesSectionTable.firstChild)
		defensesSectionTable.removeChild(defensesSectionTable.firstChild)
	while (familySectionTable.firstChild)
		familySectionTable.removeChild(familySectionTable.firstChild)
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

function getAbilityText(ability, hidden, link){
	return "<span" + (hidden ? " style='font-style: italic;'" : "") + (abilities[ability] ? " title='"+abilities[ability].summary.replace("'","&#39;").replace("\"","&#34;")+"'" : "") + ">"+ (link ? getAbilityLink(ability) : ability ) + "</span>"
}

function getAbilitiesText(pokemon, link){
	var text = getAbilityText(pokemon.abilities[0], false, link)
	if(pokemon.abilities[1])
		text += " · " + getAbilityText(pokemon.abilities[1], false, link)
	if(pokemon.abilities[2])
		text += " · " + getAbilityText(pokemon.abilities[2], true, link)
	return text
}

function getAbilityLink(ability){
	var name = ability.toLowerCase().replace(" ","")
	var url = "http://www.serebii.net/abilitydex/"+name+".shtml"
	return "<a href='" + url + "'>" + ability + "</a>"
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

function getBallsText(pokemon){
	var text = ""
	for(var i in pokemon.balls){
		var ball = pokemon.balls[i].split(" ")[0].toLowerCase()
		ball = ball.split("ball")[0].replace("é","e")
		var url = "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokeball/"+ball+".png"
		text += "<img src='"+url+"' title='" + pokemon.balls[i] + "'></img>"
	}
	return text
}

function getStatText(stat){
	return "<span style='color:"+getStatColor(stat)+"; text-shadow: 1px 1px #333;'>" + stat + "</span>"
}

function getStatColor(stat){
	return "rgb("+HSVtoRGB(0.6*stat/255, 1, 1)+")"
}

function getAmountShinyText(pokemon){
	return " " + (pokemon.shiny ? "<span style='color:#f11;'>★</span>" : "") + (pokemon.amount ? " (" + pokemon.amount + ")" : "")
}

function getIVText(iv, pokemon) {
	var cssClass = getNatureCssClass(iv,pokemon)
	return "<span class='"+cssClass+"'>" + (pokemon.ivs ? pokemon.ivs[iv] : "x") + "</span>"
}

function getEVText(ev, pokemon) {
	var hasEvs = false
	for(var i in pokemon.evs){
		if(pokemon.evs[i]>0){
			hasEvs = true
			break
		}
	}
	if(!hasEvs)
		return ""
	var cssClass = getNatureCssClass(ev,pokemon)
	return " <span class='"+cssClass+"' style=\"font-size:0.7rem;display: block;\">" + (pokemon.evs[ev] > 0 ? pokemon.evs[ev] : "—") + "</span>"
}

function getNatureCssClass(stat,pokemon){
	var nature = natures[pokemon.nature]
	if(!nature)
		return ""
	if(nature.positive == nature.negative)
		return ""
	else if(stat == parseStatType(nature.positive))
		return "positive-nature"
	else if(stat == parseStatType(nature.negative))
		return "negative-nature"
}

function parseStatType(text){
	if(["hp","health"].indexOf(text.trim().toLowerCase())>-1)
		return "hp"
	if(["atk","attack"].indexOf(text.trim().toLowerCase())>-1)
		return "atk"
	if(["def","defense"].indexOf(text.trim().toLowerCase())>-1)
		return "def"
	if(["spa","sp. atk","sp. attack","special attack"].indexOf(text.trim().toLowerCase())>-1)
		return "spa"
	if(["spd","sp. def","sp. defense","special defense"].indexOf(text.trim().toLowerCase())>-1)
		return "spd"
	if(["spe","speed"].indexOf(text.trim().toLowerCase()))
		return "spe"
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