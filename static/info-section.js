"use strict";

class InfoSection {
	constructor() {
		this.sections = [
			this.Section(
				(pokemon) => {
					var rows = []
					this.simpleRow(rows, "Types |", PokeText.types(pokemon))
					if (pokemon.nickname)
						this.simpleRow(rows, "Nickname |", pokemon.nickname)
					else
						this.simpleRow(rows, "Classification |", pokemon.classification)
					if (pokemon.ability)
						this.simpleRow(rows, "Ability |", PokeText.ability(pokemon.ability, pokemon.abilities[2] ?
							pokemon.abilities[2].toLowerCase() == pokemon.ability.split("(")[0].trim().toLowerCase() : false, true))
					else
						this.simpleRow(rows, "Abilities |", PokeText.abilities(pokemon, true))
					if (pokemon.nature)
						this.simpleRow(rows, "Nature |", pokemon.nature)
					else
						this.simpleRow(rows, "Egg groups |", PokeText.eggGroups(pokemon))
					if (pokemon.gender)
						this.simpleRow(rows, "Gender |", PokeText.gender(pokemon))
					else
						this.simpleRow(rows, "Gender ratio |", PokeText.gender(pokemon))
					if (pokemon.hiddenPower)
						this.simpleRow(rows, "Hidden power |", PokeText.type(pokemon.hiddenPower))
					else
						this.simpleRow(rows, "Weight/height |", PokeText.weightHeight(pokemon))
					return rows
				}),
			this.Section(
				(pokemon) => {
					if (!pokemon.base) return []
					var rows = []
					if (pokemon.ot || pokemon.tid)
						this.simpleRow(rows, "OT |", pokemon.ot + (pokemon.tid ? " (" + prependZeroes(pokemon.tid, 6) + ")" : ""))
					for (var i in pokemon.learntMoves)
						this.simpleRow(rows, "Move |", PokeText.move(pokemon.learntMoves[i]))
					if (pokemon.balls && pokemon.balls.length)
						this.simpleRow(rows, "Ball |", PokeText.balls(pokemon))
					return rows
				}),
			this.Section(
				(pokemon) => {
					var rows = []
					var typeNames = Object.keys(stuff.data.types)
					for (var i = 0; i < typeNames.length / 2; i++)
						rows.push([
							this.Title(PokeText.type(typeNames[i]) + " |"),
							this.Content(PokeText.defense(stuff.data.tallyDefense(typeNames[i], pokemon)),
								{ textAlign: "center", paddingBottom: "0.05rem", paddingTop: "0.18rem" }),
							this.Content(PokeText.defense(stuff.data.tallyDefense(typeNames[i + 9], pokemon)),
								{ textAlign: "center", paddingBottom: "0.05rem", paddingTop: "0.18rem" }),
							this.Title("| " + PokeText.type(typeNames[i + 9]), "left")
						])
					return rows
				}, {
					rowStyle: { height: "1.33rem" }
				}),
			this.Section(
				(pokemon) => {
					var rows = []
					this.statRow(rows, pokemon, "HP |", "hp")
					this.statRow(rows, pokemon, "Attack |", "atk")
					this.statRow(rows, pokemon, "Defense |", "def")
					this.statRow(rows, pokemon, "Sp. Atk |", "spa")
					this.statRow(rows, pokemon, "Sp. Def |", "spd")
					this.statRow(rows, pokemon, "Speed |", "spe")
					return rows
				}, {
					title: (pokemon) => "Base stat total: " + this.getTotalBaseStat(pokemon)
				}),
			this.Section(
				(pokemon) => {
					var rows = []
					var things = (pokemon.evolvesTo ? pokemon.evolvesTo.length : 0) + (pokemon.eggs ? pokemon.eggs.length : 0) + (pokemon.evolvesFrom ? 1 : 0)
					var compact = things > 6
					for (var i in pokemon.eggs)
						this.familyRow(rows, "Egg |", pokemon.eggs[i], compact)
					if (pokemon.evolvesFrom)
						this.familyRow(rows, "Evolves from |", pokemon.evolvesFrom, compact)
					for (var i in pokemon.evolvesTo)
						this.familyRow(rows, "Evolves to |", pokemon.evolvesTo[i], compact)
					return rows
				}),
		]

		this.infoElement = document.getElementById("pokemon-info")
		this.infoRowElement = document.getElementById("pokemon-info-row")
		this.infoBaseElement = document.getElementById("pokemon-info-base")
		this.nameElement = document.getElementById("name-header")
		this.descriptionElement = document.getElementById("description-header")
		this.imageElement = document.getElementById("image-section")
		this.sectionsElement = document.getElementById("info-sections")
		this.movesElement = document.getElementById("moves-section")
		this.movesHeader = document.getElementById("moves-header")
		this.movesHeader.onclick = () => { this.toggleShowMoves() }
		document.getElementById("close-header").onclick = () => { stuff.selectPokemon() }
	}

	closeInfo(onDone) {
		if (!stuff.state.currentPokemon) {
			if (onDone)
				onDone()
			return
		}
		stuff.state.currentPokemon = undefined
		this.slideAway(() => {
			if (onDone)
				onDone()
		})
	}

	showInfo(pokemon, element) {
		if (element)
			this.moveTo(element)
		stuff.state.currentPokemon = pokemon
		this.showPokemonInfo()
		this.slideIn()
	}

	slideIn() {
		this.infoRowElement.style.display = ""
		setTimeout(() => {
			this.infoElement.className = "shown-info"
		}, 50)
		setTimeout(() => {
			this.infoElement.style.maxHeight = "none"
		}, 500)
	}

	slideAway(onDone) {
		this.infoElement.style.maxHeight = ""
		setTimeout(() => {
			this.infoElement.className = "hidden-info"
		}, 50)
		if (stuff.state.showMoves)
			this.toggleShowMoves()
		setTimeout(() => {
			this.infoRowElement.style.display = "none"
			this.moveAway()
			if (onDone)
				onDone()
		}, 500)
	}

	moveTo(element) {
		if (this.infoRowElement.parentNode)
			this.infoRowElement.parentNode.removeChild(this.infoRowElement)
		element.parentNode.insertBefore(this.infoRowElement, element.nextSibling)
		this.infoRowElement.children[0].colSpan = element.children.length
		this.infoElement.style.width = "100%"
	}

	moveAway() {
		if (this.infoRowElement.parentNode)
			this.infoRowElement.parentNode.removeChild(this.infoRowElement)
		this.infoElement.style.width = ""
		this.infoBaseElement.appendChild(this.infoRowElement)
	}

	showPokemonInfo() {
		this.showName(stuff.state.currentPokemon)
		this.showDescription(stuff.state.currentPokemon)
		this.showImage(stuff.state.currentPokemon)
		this.sectionsElement.removeChild(this.imageElement)
		this.sectionsElement.innerHTML = ""
		this.sectionsElement.appendChild(this.imageElement)
		for (var i in this.sections)
			this.showSection(this.sections[i])
		this.showMoves(stuff.state.currentPokemon)
	}

	showName(pokemon) {
		this.nameElement.innerHTML = ""
		if (!pokemon.base)
			this.nameElement.innerHTML = "#" + pokemon.id + " - "
		this.nameElement.innerHTML += pokemon.name
		if (pokemon.base)
			this.nameElement.innerHTML += PokeText.amountShiny(pokemon)
		if (pokemon.form && pokemon.form != "Base")
			this.nameElement.innerHTML += " (" + pokemon.form + ")"
		if (pokemon.level)
			this.nameElement.innerHTML += " <span style='font-size:1rem;'>- Lv." + pokemon.level + "</span>"
		if (pokemon.language)
			this.nameElement.innerHTML += " <span style='font-size:1rem;'>- " + pokemon.language + "</span>"
		var colorA = stuff.data.typeColors[pokemon.types[0]]
		var colorB = pokemon.types[1] ? stuff.data.typeColors[pokemon.types[1]] : stuff.data.typeColors[pokemon.types[0]]
		this.nameElement.style.background = "linear-gradient(to right, " + colorA + ", " + colorB + ")"
	}

	showDescription(pokemon) {
		this.descriptionElement.innerHTML = pokemon.description
		if (pokemon.locations)
			this.descriptionElement.title = pokemon.locations
		if (pokemon.notes)
			this.descriptionElement.innerHTML = pokemon.notes
	}

	showImage(pokemon) {
		var url = "http://bulbapedia.bulbagarden.net/wiki/" + pokemon.name + "_(Pok%C3%A9mon)"
		this.imageElement.innerHTML = "<a href='" + url + "'><img src='" + PokeText.imageName(pokemon) + "' style='height: 13rem;'/></a>"
	}

	showSection(section) {
		var rows = section.getRows(stuff.state.currentPokemon)
		if (!rows.length)
			return
		var sec = newTag("section", this.sectionsElement)
		if (section.title)
			sec.title = section.title(stuff.state.currentPokemon)
		var table = newTag("table", sec)
		table.cellSpacing = "0"
		table.cellPadding = "0"
		newTag("thead", table)
		var body = newTag("tbody", table)
		for (var i in rows) {
			var row = newTag("tr", body)
			for (var j in section.rowStyle)
				row.style[j] = section.rowStyle[j]
			this.showRow(row, rows[i])
		}
	}

	showRow(row, cells) {
		for (var i in cells.style)
			row.style[i] = cells.style[i]
		delete cells.style
		for (var i in cells.options)
			row[i] = cells.options[i]
		delete cells.options
		for (var i in cells) {
			var cell = newTag(cells[i].tag, row)
			cell.innerHTML = typeof cells[i].content == "string" ? cells[i].content : cells[i].content(stuff.state.currentPokemon)
			for (var j in cells[i].style)
				cell.style[j] = cells[i].style[j]
		}
	}

	Section(getRows, options = {}) {
		return { getRows: getRows, ...options }
	}

	Title(content, style = "right", options = {}) {
		if (typeof style == "string")
			return { tag: "th", style: { textAlign: style }, content: content, ...options }
		return { tag: "th", style: style, content: content, ...options }
	}

	Content(content, style = "left", options = {}) {
		if (typeof style == "string")
			return { tag: "td", style: { textAlign: style }, content: content, ...options }
		return { tag: "td", style: style, content: content, ...options }
	}

	showMoves(pokemon) {
		var moveGroups = {}
		for (var i in pokemon.moves) {
			var method = pokemon.moves[i].method
			var level = +method
			if (level)
				method = "level"
			if (!moveGroups[method])
				moveGroups[method] = []
			moveGroups[method].push({ move: stuff.data.moves[pokemon.moves[i].name], level: level })
		}
		this.movesElement.innerHTML = ""
		if (moveGroups["level"])
			this.addMoveGroup(moveGroups["level"], "level")
		delete moveGroups["level"]
		if (moveGroups["evolution"])
			this.addMoveGroup(moveGroups["evolution"], "evolution")
		delete moveGroups["evolution"]
		if (moveGroups["egg"])
			this.addMoveGroup(moveGroups["egg"], "egg")
		delete moveGroups["egg"]
		if (moveGroups["tm"])
			this.addMoveGroup(moveGroups["tm"], "tm")
		delete moveGroups["tm"]
		if (moveGroups["tutor"])
			this.addMoveGroup(moveGroups["tutor"], "tutor")
		delete moveGroups["tutor"]
		for (var key in moveGroups)
			this.addMoveGroup(moveGroups[key], key)
	}

	addMoveGroup(moveGroup, method) {
		var table = newTag("table", this.movesElement)
		table.cellSpacing = "0"
		table.cellPadding = "0"
		newTag("thead", table)
		newTag("tbody", table)
		setTimeout(() => { this.fillMoveTable(table, moveGroup, method) }, 0)
	}

	fillMoveTable(table, moveGroup, method) {
		this.addMoveHeader(table.children[0], moveGroup, method)
		for (var i in moveGroup) {
			this.addMoveRow(table.children[1], moveGroup[i].move, moveGroup[i].level, i, method)
		}
	}

	addMoveHeader(table, moveGroup, method) {
		var row = newTag("tr", table)
		var title = "Learnt somehow"
		switch (method) {
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
		if (method == "level")
			newTag("td", row).innerHTML = "Level"
		if (method == "tm")
			newTag("td", row).innerHTML = "TM"
		newTag("td", row).innerHTML = "Type"
		newTag("td", row).innerHTML = "Category"
		newTag("td", row).innerHTML = "Power"
		newTag("td", row).innerHTML = "Accuracy"
		newTag("td", row).innerHTML = "Priority"
		newTag("td", row).innerHTML = "PP"
		newTag("td", row).innerHTML = "Summary"
	}

	addMoveRow(table, move, level, i, method) {
		var row = newTag("tr", table)
		var head = newTag("td", row)
		var url = "http://pokemondb.net/move/" + move.name.toLowerCase().replace(" ", "-").replace("'", "")
		head.innerHTML = "<a href='" + url + "'>" + move.name + "</a>"
		head.style.fontWeight = "bold"
		if (method == "level")
			newTag("td", row).innerHTML = level
		if (method == "tm")
			newTag("td", row).innerHTML = move.tm
		newTag("td", row).innerHTML = PokeText.type(move.type)
		newTag("td", row).innerHTML = move.category
		newTag("td", row).innerHTML = move.power
		newTag("td", row).innerHTML = move.accuracy
		newTag("td", row).innerHTML = move.priority
		newTag("td", row).innerHTML = move.pp.split(" ")[0]
		newTag("td", row).innerHTML = move.gameDescription
		row.className = i % 2 ? "odd" : "even"
	}

	toggleShowMoves() {
		stuff.state.showMoves = !stuff.state.showMoves
		if (stuff.state.showMoves) {
			this.movesHeader.innerHTML = "Moves ▼"
			this.movesElement.className = "shown-moves"
			this.infoElement.style.maxHeight = "1000rem"
		} else {
			this.movesHeader.innerHTML = "Moves ▶"
			this.movesElement.className = "hidden-moves"
			this.infoElement.style.maxHeight = "none"
		}
	}

	// general section stuff

	simpleRow(rows, title, content) {
		rows.push([
			this.Title(title),
			this.Content(content)])
	}

	// stat section stuff

	statRow(rows, pokemon, title, stat) {
		rows.push([
			this.Title(title),
			this.Content(this.statNumber(pokemon, stat)),
			this.Content(this.statBar(pokemon, stat), { padding: "0.3rem" })])
	}

	statNumber(pokemon, stat) {
		var ivText = pokemon.ivs ? pokemon.ivs[stat] : 0
		var evBase = pokemon.evs ? pokemon.evs[stat] : 0
		var className = pokemon.nature ? PokeText.natureCssClass(stat, pokemon) : ""
		var blub = pokemon.stats[stat]
		if (pokemon.ivs || pokemon.evs)
			blub += " · " + ivText + " · " + evBase
		return "<span class=\"" + className + "\">" + blub + "</span>"
	}

	statBar(pokemon, stat) {
		var statBase = pokemon.stats[stat]
		var ivText = pokemon.ivs ? pokemon.ivs[stat] : 0
		var evBase = pokemon.evs ? pokemon.evs[stat] : 0
		var ivBase = ivText.toString().endsWith("*") ? 31 : ivText
		ivBase = isNaN(+ivBase) ? ivBase.replace(/(^\d+)(.+$)/i, '$1') : +ivBase
		var content = this.statDivBar("stat-bar base-bar", statBase * 2 + "px", "linear-gradient(to right, red, " + PokeText.statColor(statBase) + ")")
		if (pokemon.ivs || pokemon.evs) {
			content += this.statDivBar("stat-bar iv-bar", ivBase + "px")
			content += this.statDivBar("stat-bar ev-bar", evBase / 4 + "px")
		}
		return content
	}

	statDivBar(className, width, background) {
		var div = "<div class='" + className + "' style='width:" + width + ";"
		if (background)
			div += "background:" + background + ";"
		div += "'></div>"
		return div
	}

	getTotalBaseStat(pokemon) {
		var count = 0
		for (var i in pokemon.stats)
			count += pokemon.stats[i]
		return count
	}

	// family section stuff
	familyRow(rows, title, pokeInfo, compact) {
		var pokemon = stuff.data.getPokemonFrom(pokeInfo)
		var text = PokeText.formName(pokemon) + (pokeInfo.method == "Normal" ? "" : " (" + pokeInfo.method + ")")
		var cells = [
			this.Title(title),
			this.Content(PokeText.formName(pokemon) + (pokeInfo.method == "Normal" ? "" : " (" + pokeInfo.method + ")"),
				compact ? { paddingBottom: "0.05rem", paddingTop: "0.18rem" } : "left")]
		cells.style = { cursor: "pointer", height: compact ? "1.33rem" : "" }
		cells.options = { onclick: () => { stuff.selectPokemon(pokemon.base) } }
		rows.push(cells)
	}
}