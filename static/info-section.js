"use strict";

class InfoSection {
	constructor() {
		this.sections = [
			[
				[this.Title("Types |"), this.Content((pokemon) => PokeText.types(pokemon))],
				[this.Title((pokemon) => pokemon.nickname ? "Nickname |" : "Classification |"),
				this.Content((pokemon) => pokemon.nickname ? pokemon.nickname : pokemon.classification)],
				[this.Title((pokemon) => pokemon.ability ? "Ability |" : "Abilities |"),
				this.Content((pokemon) => pokemon.ability ?
					PokeText.ability(pokemon.ability, pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.split("(")[0].trim().toLowerCase() : false, true) :
					PokeText.abilities(pokemon, true))],
				[this.Title((pokemon) => pokemon.nature ? "Nature |" : "Egg groups |"),
				this.Content((pokemon) => pokemon.nature ? pokemon.nature : PokeText.eggGroups(pokemon))],
				[this.Title((pokemon) => pokemon.gender ? "Gender |" : "Gender ratio |"),
				this.Content((pokemon) => PokeText.gender(pokemon))],
				[this.Title((pokemon) => pokemon.hiddenPower ? "Hidden power |" : "Weight/height |"),
				this.Content((pokemon) => pokemon.hiddenPower ? PokeText.type(pokemon.hiddenPower) : PokeText.weightHeight(pokemon))]
			]
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
		for(var i in this.sections)
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

	showSection(section){
		var table = newTag("table", this.sectionsElement)
		table.cellspacing = "0"
		table.cellpadding = "0"
		newTag("thead", table)
		var body = newTag("tbody", table)
		for(var i in section){
			var row = newTag("tr", body)
			this.showRow(row, section[i])
		}
	}

	showRow(row, setup){
		for(var i in setup){
			var cell = newTag(setup[i].tag, row)
			cell.innerHTML = typeof setup[i].content == "string" ? setup[i].content : setup[i].content(stuff.state.currentPokemon)
			cell.style.textAlign = setup[i].textAlign
		}
	}

	Title(content, textAlign = "right") {
		return {tag: "th", textAlign: textAlign, content: content}
	}

	Content(content, textAlign = "left") {
		return {tag: "td", textAlign: textAlign, content: content}
	}
}