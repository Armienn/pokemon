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
					title: (pokemon) => "Base stat total: " + stuff.data.getTotalBaseStat(pokemon)
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
				})
		]
		this.editSections = [
			this.Section(
				(pokemon) => {
					var rows = []
					if (pokemon.forms)
						this.formEditRow(rows, pokemon, "Form |")
					else
						this.simpleRow(rows, "Form |", "<span style='margin-left:1rem'>" + pokemon.form + "</span>")
					this.simpleEditRow(rows, pokemon, "Nickname |", "nickname")
					this.selectEditRow(rows, pokemon, "Ability |", "ability", pokemon.abilities.filter((e) => e))
					this.simpleEditRow(rows, pokemon, "Nature |", "nature", Object.keys(stuff.data.natures))
					this.genderShinyEditRow(rows, pokemon, "Sex / Shiny / Count |")
					this.simpleEditRow(rows, pokemon, "Level |", "level")
					return rows
				}),
			this.Section(
				(pokemon) => {
					var rows = []
					var moves = []
					for (var i in pokemon.moves)
						moves.push(pokemon.moves[i].name)
					this.doubleEditRow(rows, pokemon, "OT / TID |", "ot", "tid")
					this.simpleEditRow(rows, pokemon, "Language |", "language")
					this.simpleEditRow(rows, pokemon, "Move |", ["learntMoves", 0], moves)
					this.simpleEditRow(rows, pokemon, "Move |", ["learntMoves", 1], moves)
					this.simpleEditRow(rows, pokemon, "Move |", ["learntMoves", 2], moves)
					this.simpleEditRow(rows, pokemon, "Move |", ["learntMoves", 3], moves)
					return rows
				}),
			this.Section(
				(pokemon) => {
					var rows = []
					this.statEditRow(rows, pokemon, "HP IV |", "ivs", "hp")
					this.statEditRow(rows, pokemon, "Attack IV |", "ivs", "atk")
					this.statEditRow(rows, pokemon, "Defense IV |", "ivs", "def")
					this.statEditRow(rows, pokemon, "Sp. Atk IV |", "ivs", "spa")
					this.statEditRow(rows, pokemon, "Sp. Def IV |", "ivs", "spd")
					this.statEditRow(rows, pokemon, "Speed IV |", "ivs", "spe")
					return rows
				}),
			this.Section(
				(pokemon) => {
					var rows = []
					this.statEditRow(rows, pokemon, "HP EV |", "evs", "hp")
					this.statEditRow(rows, pokemon, "Attack EV |", "evs", "atk")
					this.statEditRow(rows, pokemon, "Defense EV |", "evs", "def")
					this.statEditRow(rows, pokemon, "Sp. Atk EV |", "evs", "spa")
					this.statEditRow(rows, pokemon, "Sp. Def EV |", "evs", "spd")
					this.statEditRow(rows, pokemon, "Speed EV |", "evs", "spe")
					return rows
				}),
			this.Section(
				(pokemon) => {
					var thing = [[this.Title("Balls")]]
					var selected = {}
					for (var i in stuff.data.pokeballs) {
						var exists = false
						for (var j in pokemon.balls) {
							exists = PokeText.ballUrl(pokemon.balls[j]) == PokeText.ballUrl(stuff.data.pokeballs[i])
							if (exists)
								break
						}
						selected[i] = exists
					}
					for (let i in stuff.data.pokeballs) {
						thing[0].push(this.Content((cell) => {
							var img = newTag("img", cell)
							cell.style.width = "1rem"
							cell.style.float = "left"
							img.style.filter = selected[i] ? "drop-shadow(0px 0px 2px white)" : "grayscale(1)"
							img.src = PokeText.ballUrl(stuff.data.pokeballs[i])
							img.title = stuff.data.pokeballs[i]
							img.style.cursor = "pointer"
							img.onclick = () => {
								selected[i] = !selected[i]
								img.style.filter = selected[i] ? "drop-shadow(0px 0px 2px white)" : "grayscale(1)"
							}
						}))
					}
					this.edits.push((pokemon) => {
						pokemon.balls = []
						for (var i in selected)
							if (selected[i])
								pokemon.balls.push(stuff.data.pokeballs[i] + " Ball")
						if (!pokemon.balls.length)
							delete pokemon.balls
					})
					return thing
				}, {
					rowStyle: { width: "8rem", display: "block" }
				})
		]

		this.editMode = false
		this.edits = []

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
		this.editMode = false
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
		this.infoRowElement.scrollIntoView()
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
		if (this.editMode)
			return this.showPokemonEdit()
		this.showHeader(stuff.state.currentPokemon)
		this.showDescription(stuff.state.currentPokemon)
		this.showImage(stuff.state.currentPokemon)
		this.sectionsElement.removeChild(this.imageElement)
		this.sectionsElement.innerHTML = ""
		this.sectionsElement.appendChild(this.imageElement)
		for (var i in this.sections)
			this.showSection(this.sections[i])
		this.showMoves(stuff.state.currentPokemon)
	}

	showHeader(pokemon) {
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
		if (typeof stuff.state.currentTab != "string" && stuff.state.currentPokemon.base) {
			var edit = newTag("span", this.nameElement, { text: "⚙" })
			edit.className = "edit"
			edit.onclick = () => {
				this.editMode = true
				this.showPokemonEdit()
			}
		}
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
			if (typeof cells[i].content == "string")
				cell.innerHTML = cells[i].content
			else
				cells[i].content(cell)
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
		if (!ivText && ivText != 0)
			ivText = "x"
		var evBase = pokemon.evs ? pokemon.evs[stat] : 0
		if (!ivText && ivText != 0)
			ivText = ""
		var className = pokemon.nature ? PokeText.natureCssClass(stat, pokemon) : ""
		var blub = pokemon.stats[stat]
		if (pokemon.ivs || pokemon.evs)
			blub += " · " + ivText + " · " + evBase
		return "<span class=\"" + className + "\">" + blub + "</span>"
	}

	statBar(pokemon, stat) {
		var statBase = pokemon.stats[stat]
		var ivText = pokemon.ivs ? pokemon.ivs[stat] : 0
		if (!ivText && ivText != 0)
			ivText = "x"
		var evBase = pokemon.evs ? pokemon.evs[stat] : 0
		if (!ivText && ivText != 0)
			ivText = ""
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

	// edit mode stuff

	showPokemonEdit() {
		this.edits = []
		this.showEditHeader(stuff.state.currentPokemon)
		this.showEditNote(stuff.state.currentPokemon)
		this.showImage(stuff.state.currentPokemon)
		this.sectionsElement.removeChild(this.imageElement)
		this.sectionsElement.innerHTML = ""
		this.sectionsElement.appendChild(this.imageElement)
		for (var i in this.editSections)
			this.showSection(this.editSections[i])
		this.showButtons(stuff.state.currentPokemon)
		this.showMoves(stuff.state.currentPokemon)
	}

	showEditHeader(pokemon) {
		this.nameElement.innerHTML = "#" + pokemon.id + " - "
		this.nameElement.innerHTML += pokemon.name
	}

	showButtons(pokemon) {
		var div = newTag("div", this.sectionsElement)
		div.style.backgroundColor = "rgba(128,128,128,0.5)"
		div.style.display = "table"
		div.style.width = "10rem"
		var button = newTag("ul", div, { text: "Save changes" })
		button.className = "button"
		button.onclick = () => {
			for (var i in this.edits)
				this.edits[i](pokemon)
			this.editMode = false
			stuff.collection.saveLocalTabs()
			this.showPokemonInfo()
			stuff.update()
		}
		var cancel = newTag("ul", div, { text: "Cancel" })
		cancel.className = "button"
		cancel.style.marginTop = "0.5rem"
		cancel.onclick = () => {
			this.editMode = false
			this.showPokemonInfo()
		}
		var deleteButton = newTag("ul", div, { text: "Delete" })
		deleteButton.className = "button"
		deleteButton.style.marginTop = "0.5rem"
		deleteButton.onclick = () => {
			this.editMode = false
			var currentTab = stuff.state.currentTab
			if (typeof currentTab != "string") {
				var index = currentTab.pokemons.indexOf(pokemon)
				if (index > -1)
					currentTab.pokemons.splice(index, 1)
			}
			stuff.collection.saveLocalTabs()
			stuff.selectPokemon()
			stuff.update()
		}
	}

	showEditNote(pokemon) {
		this.descriptionElement.innerHTML = ""
		var input = newTag("input", this.descriptionElement)
		input.style.width = "30rem"
		input.placeholder = "Notes"
		if (pokemon.notes)
			input.value = pokemon.notes
		this.edits.push((pokemon) => {
			var value = input.value
			if (!value)
				return
			pokemon.notes = value
		})
	}

	simpleEditRow(rows, pokemon, title, key, options) {
		var deep = typeof key != "string"
		rows.push([
			this.Title(title),
			this.Content((cell) => {
				var input = newTag("input", cell)
				input.style.width = "10rem"
				input.style.boxSizing = "border-box"
				if (!deep) {
					if (pokemon[key])
						input.value = pokemon[key]
				} else {
					if (pokemon[key[0]] && pokemon[key[0]][key[1]])
						input.value = pokemon[key[0]][key[1]]
				}
				if (options) {
					var datalist = newTag("datalist", cell)
					datalist.id = "edit-list-" + (deep ? key[0] + key[1] : key)
					input.setAttribute("list", datalist.id)
					for (var i in options)
						newTag("option", datalist, { text: options[i] }).value = options[i]
				}
				this.edits.push((pokemon) => {
					var value = input.value
					if (!value) {
						if (key == "id" || key == "form" || key == "name")
							return
						if (!deep) {
							delete pokemon[key]
							return
						}
						if (pokemon[key[0]])
							delete pokemon[key[0]][key[1]]
						delete pokemon[key[0]]
						return
					}
					if (!deep)
						return pokemon[key] = value
					if (!pokemon[key[0]])
						pokemon[key[0]] = key[1] > -1 ? [] : {}
					pokemon[key[0]][key[1]] = value
				})
			})
		])
	}

	doubleEditRow(rows, pokemon, title, key, key2) {
		rows.push([
			this.Title(title),
			this.Content((cell) => {
				var input = newTag("input", cell)
				input.style.width = "4.5rem"
				input.style.marginRight = "0"
				input.style.boxSizing = "border-box"
				if (pokemon[key])
					input.value = pokemon[key]
				var input2 = newTag("input", cell)
				input2.style.width = "4.5rem"
				input2.style.marginLeft = "1rem"
				input2.style.boxSizing = "border-box"
				if (pokemon[key2])
					input2.value = pokemon[key2]
				this.edits.push((pokemon) => {
					var value = input.value
					if (!value) {
						if (key == "id" || key == "form" || key == "name")
							return
						delete pokemon[key]
						return
					}
					return pokemon[key] = value
				})
				this.edits.push((pokemon) => {
					var value = input2.value
					if (!value) {
						if (key == "id" || key == "form" || key == "name")
							return
						delete pokemon[key]
						return
					}
					return pokemon[key2] = value
				})
			})
		])
	}

	selectEditRow(rows, pokemon, title, key, options) {
		rows.push([
			this.Title(title),
			this.Content((cell) => {
				var select = newTag("select", cell)
				select.style.width = "10rem"
				newTag("option", select)
				for (var i in options)
					newTag("option", select, { text: options[i] }).value = options[i]
				if (pokemon[key])
					select.value = pokemon[key]
				this.edits.push((pokemon) => {
					var value = select.value
					if (!value) {
						if (key == "id" || key == "form" || key == "name")
							return
						delete pokemon[key]
						return
					}
					pokemon[key] = value
				})
			})
		])
	}

	formEditRow(rows, pokemon, title) {
		rows.push([
			this.Title(title),
			this.Content((cell) => {
				var select = newTag("select", cell)
				select.style.width = "10rem"
				for (var i in pokemon.forms)
					newTag("option", select, { text: pokemon.forms[i] }).value = pokemon.forms[i]
				if (pokemon.form)
					select.value = pokemon.form
				this.edits.push((pokemon) => {
					var value = select.value
					if (!value)
						return
					pokemon.form = value
					pokemon.base = new Pokemon({ id: pokemon.id, form: pokemon.form }).base
				})
			})
		])
	}

	statEditRow(rows, pokemon, title, key, stat) {
		rows.push([
			this.Title(title),
			this.Content((cell) => {
				var input = newTag("input", cell)
				input.style.width = "3rem"
				if (pokemon[key] && pokemon[key][stat])
					input.value = pokemon[key][stat]
				this.edits.push((pokemon) => {
					var value = input.value
					if (!value) {
						if (pokemon[key])
							delete pokemon[key][stat]
						return
					}
					if (!pokemon[key])
						pokemon[key] = {}
					pokemon[key][stat] = value
				})
			})
		])
	}

	genderShinyEditRow(rows, pokemon, title) {
		rows.push([
			this.Title(title),
			this.Content((cell) => {
				var genders = ["-", "m", "f"]
				var gender = 0
				if (pokemon.gender && (pokemon.gender == "♂" || pokemon.gender.toLowerCase() == "m" || pokemon.gender.toLowerCase() == "male"))
					gender = 1
				if (pokemon.gender && (pokemon.gender == "♀" || pokemon.gender.toLowerCase() == "f" || pokemon.gender.toLowerCase() == "female"))
					gender = 2
				var genderThing = newTag("span", cell)
				genderThing.innerHTML = PokeText.gender({ gender: genders[gender] })
				genderThing.style.marginLeft = "0.5rem"
				genderThing.onclick = () => {
					gender++
					if (gender > 2)
						gender = 0
					genderThing.innerHTML = PokeText.gender({ gender: genders[gender] })
				}
				newTag("span", cell, { text: " /" }).style.color = "#888"
				var shiny = pokemon.shiny
				var shinyThing = newTag("span", cell)
				shinyThing.innerHTML = "<span style='color:" + (shiny ? "#f11" : "#888") + "; margin-left:0.5rem;'>★</span>"
				shinyThing.onclick = () => {
					shiny = !shiny
					shinyThing.innerHTML = "<span style='color:" + (shiny ? "#f11" : "#888") + "; margin-left:0.5rem;'>★</span>"
				}
				newTag("span", cell, { text: " /" }).style.color = "#888"
				var amountThing = newTag("input", cell)
				amountThing.placeholder = "1"
				amountThing.value = pokemon.amount != undefined ? pokemon.amount : ""
				amountThing.style.width = "1rem"
				this.edits.push((pokemon) => {
					var value = genders[gender]
					if (pokemon.ratio == "—")
						delete pokemon.gender
					else if (value != "-")
						pokemon.gender = value
					else
						delete pokemon.gender
					if (shiny)
						pokemon.shiny = true
					else
						delete pokemon.shiny
					if (amountThing.value != "" && amountThing.value != undefined)
						pokemon.amount = amountThing.value
					else
						delete pokemon.amount
				})
			})
		])
	}
}