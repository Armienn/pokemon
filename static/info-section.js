"use strict";

class InfoSection {
	constructor() {
		this.sections = [
			this.Section(
				(pokemon) => {
					var rows = []
					rows.push([this.Title("Types |"), this.Content(PokeText.types(pokemon))])
					if (pokemon.nickname)
						rows.push([this.Title("Nickname |"), this.Content(pokemon.nickname)])
					else
						rows.push([this.Title("Classification |"), this.Content(PokeText.types(pokemon))])
					if (pokemon.ability)
						rows.push([this.Title("Ability |"), this.Content(PokeText.ability(pokemon.ability, pokemon.abilities[2] ?
							pokemon.abilities[2].toLowerCase() == pokemon.ability.split("(")[0].trim().toLowerCase() : false, true))])
					else
						rows.push([this.Title("Abilities |"), this.Content(PokeText.abilities(pokemon, true))])
					if (pokemon.nature)
						rows.push([this.Title("Nature |"), this.Content(pokemon.nature)])
					else
						rows.push([this.Title("Egg groups |"), this.Content(PokeText.eggGroups(pokemon))])
					if (pokemon.gender)
						rows.push([this.Title("Gender |"), this.Content(PokeText.gender(pokemon))])
					else
						rows.push([this.Title("Gender ratio |"), this.Content(PokeText.gender(pokemon))])
					if (pokemon.hiddenPower)
						rows.push([this.Title("Hidden power |"), this.Content(PokeText.type(pokemon.hiddenPower))])
					else
						rows.push([this.Title("Weight/height |"), this.Content(PokeText.weightHeight(pokemon))])
					return rows
				}),
			this.Section(
				(pokemon) => {
					if (!pokemon.base) return []
					var rows = []
					if (pokemon.ot || pokemon.tid)
						rows.push([this.Title("OT |"), this.Content(pokemon.ot + (pokemon.tid ? " (" + prependZeroes(pokemon.tid, 6) + ")" : ""))])
					for (var i in pokemon.learntMoves)
						rows.push([this.Title("Move |"), this.Content(PokeText.move(pokemon.learntMoves[i]))])
					if (pokemon.balls && pokemon.balls.length)
						rows.push([this.Title("Ball |"), this.Content(PokeText.balls(pokemon))])
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
				})
		]
		this.moveSections = []

		this.infoElement = document.getElementById("pokemon-info")
		this.infoRowElement = document.getElementById("pokemon-info-row")
		this.infoBaseElement = document.getElementById("pokemon-info-base")
		this.nameElement = document.getElementById("name-header")
		this.descriptionElement = document.getElementById("description-header")
		this.imageElement = document.getElementById("image-section")
		this.sectionsElement = document.getElementById("info-sections")
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
			toggleShowMoves()
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
		this.sectionsElement.innerHTML = ""
		for (var i in this.sections)
			this.showSection(this.sections[i])
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
		if(section.title)
			sec.title = section.title(stuff.state.currentPokemon)
		var table = newTag("table", sec)
		table.cellspacing = "0"
		table.cellpadding = "0"
		newTag("thead", table)
		var body = newTag("tbody", table)
		for (var i in rows) {
			var row = newTag("tr", body)
			for (var j in section.rowStyle)
				row.style[j] = section.rowStyle[j]
			this.showRow(row, rows[i])
		}
	}

	showRow(row, setup) {
		for (var i in setup) {
			var cell = newTag(setup[i].tag, row)
			cell.innerHTML = typeof setup[i].content == "string" ? setup[i].content : setup[i].content(stuff.state.currentPokemon)
			for (var j in setup[i].style)
				cell.style[j] = setup[i].style[j]
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

	// stat bar stuff

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
}