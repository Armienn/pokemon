"use strict";

class HeaderSection {
	constructor() {
		this.title = "Pokémon Stuff"
		this.titleLink = "https://github.com/Armienn/pokemon#pok%C3%A9mon-stuff"
		this.subtitle = ""

		this.navGroups = {
			base: {
				all: {
					text: "⊖",
					click: () => stuff.state.selectTab("all"),
					active: () => stuff.state.currentTab == "all",
					style: { fontSize: "1.5rem", paddingBottom: "0.2rem" }
				},
				custom: {
					text: "☷",
					click: () => stuff.state.selectTab("custom"),
					active: () => stuff.state.currentTab == "custom",
					style: { fontSize: "1.3rem" }
				}
			},
			pokemons: {
			},
			modes: {
				table: {
					text: "▤",
					click: () => { stuff.state.mode = "table"; stuff.updatePokemons() },
					active: () => stuff.state.mode == "table",
					style: { fontSize: "2rem", fontWeight: "initial" }
				},
				grid: {
					text: "▦",
					click: () => { stuff.state.mode = "grid"; stuff.updatePokemons() },
					active: () => stuff.state.mode == "grid",
					style: { fontSize: "2rem", fontWeight: "initial" }
				}
			},
			colours: {
				day: {
					text: "☀",
					click: () => { stuff.settings.colorScheme = "day"; stuff.updateColors() },
					active: () => stuff.settings.colorScheme == "day",
					style: { fontSize: "1.2rem" }
				},
				night: {
					text: "☽",
					click: () => { stuff.settings.colorScheme = "night"; stuff.updateColors() },
					active: () => stuff.settings.colorScheme == "night",
					style: { fontSize: "1.2rem" }
				}
			}
		}

		this.titleElement = document.getElementById("main-title")
		this.subtitleElement = document.getElementById("sub-title")
		this.navListElement = document.getElementById("nav-list")
	}

	show() {
		this.showTitle()
		this.showSubtitle()
		this.showNavList()
	}

	showTitle() {
		var element = this.titleElement
		if (stuff.collection.spreadsheetId) {
			var title = stuff.collection.collectorUrl ? "<a href=\"" + stuff.collection.collectorUrl + "\">" + stuff.collection.collectorName + "</a>'s " : stuff.collection.collectorName + "'s "
			title += stuff.collection.spreadsheetId ? "<a href=\"https://docs.google.com/spreadsheets/d/" + stuff.collection.spreadsheetId + "\">Pokémon</a> " : "Pokémon "
			title += "<a href=\"https://armienn.github.io/pokemon/\">Stuff</a>"
			element.innerHTML = title
		}
		else {
			element.innerHTML = ""
			if (this.titleLink) {
				element = newTag("a", this.titleElement)
				element.href = this.titleLink
			}
			element.innerHTML = this.title
		}
		document.title = element.textContent
	}

	showSubtitle() {
		if (stuff.collection.collectorFriendCode)
			this.subtitleElement.innerText = "FC: " + stuff.collection.collectorFriendCode
		else
			this.subtitleElement.innerText = this.subtitle
		if (this.subtitleElement.innerText)
			this.subtitleElement.style.display = ""
		else
			this.subtitleElement.style.display = "none"
	}

	showNavList() {
		this.navListElement.innerHTML = ""
		for (var group in this.navGroups) {
			var groupElement = newTag("li", this.navListElement)
			for (var entry in this.navGroups[group]) {
				var element = this.navGroups[group][entry]
				if (typeof element === "string")
					newTag("span", groupElement, { text: element })
				else
					this.setupNavListElement(element, groupElement)
			}
		}
	}

	setupNavListElement(entry, groupElement) {
		let element = newTag("li", groupElement, entry)
		element.className = entry.active() ? "active" : "inactive"
		element.onclick = () => {
			entry.click()
			this.showNavList()
		}
	}

	updateNavPokemonTabs() {
		this.navGroups.pokemons = {}
		var index = 0
		this.navGroups.pokemons[index] = "|"
		index++
		if (stuff.collection.collectorName) {
			this.navGroups.pokemons[index] = {
				text: stuff.collection.collectorName + "'s Pokémon",
				click: () => stuff.state.selectTab("mine"),
				active: () => stuff.state.currentTab == "mine"
			}
			index++
		}
		if (stuff.settings.showBreedables) {
			this.navGroups.pokemons[index] = {
				text: "Breedables",
				click: () => stuff.state.selectTab("breedables"),
				active: () => stuff.state.currentTab == "breedables"
			}
			index++
		}
		if (stuff.collection.collectorName || stuff.settings.showBreedables) {
			this.navGroups.pokemons[index] = "|"
			index++
		}
		for (var i in stuff.collection.pokemons) {
			var tab = stuff.collection.pokemons[i]
			this.navGroups.pokemons[index] = {
				text: tab.title,
				click: tab.click,
				active: tab.active
			}
			index++
		}
		this.navGroups.pokemons[index] = "|"
		index++
		for (var i in stuff.collection.lookingFor) {
			var tab = stuff.collection.lookingFor[i]
			this.navGroups.pokemons[index] = {
				text: tab.title,
				click: tab.click,
				active: tab.active
			}
			index++
		}
	}


}

// filter things



function getSearchFilter(query) {
	return function (pokemon) {
		query = query.trim().toLowerCase()
		return pokemonFormName(pokemon).toLowerCase().indexOf(query) > -1
	}
}

function hasItemInFilter(key, fallbackKey) {
	return function (...items) {
		return function (pokemon) {
			var item = pokemon[key]
			if (!item)
				item = pokemon[fallbackKey]
			for (var i in items) {
				if (!item && items[i] == "Undefined")
					return true
				else if (!item)
					continue
				if (typeof item == "string") {
					if (item.toLowerCase() == items[i].toLowerCase())
						return true
				} else if (item.filter(e => e ? (e.toLowerCase ? e.toLowerCase() : e.name.toLowerCase()) == items[i].toLowerCase() : false).length)
					return true
			}
			return false
		}
	}
}

function shinyFilter(mode) {
	var show = mode == "Show only"
	return function (pokemon) {
		if (pokemon.shiny)
			return show
		return !show
	}
}

function hiddenAbilityFilter(mode) {
	var show = mode == "Show only"
	return function (pokemon) {
		if (pokemon.ability && (pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.toLowerCase() : false))
			return show
		return !show
	}
}

function legendaryFilter(mode) {
	var show = mode == "Show only"
	return function (pokemon) {
		if (pokemon.name == "Unown")
			return !show
		if (pokemon.eggGroups.indexOf("Undiscovered") > -1 && !(pokemon.evolvesTo || pokemon.evolvesFrom))
			return show
		if (pokemon.name == "Phione" ||
			pokemon.name == "Manaphy" ||
			pokemon.name == "Cosmog" ||
			pokemon.name == "Cosmoem" ||
			pokemon.name == "Solgaleo" ||
			pokemon.name == "Lunala")
			return show
		return !show
	}
}

function generationFilter(...items) {
	return function (pokemon) {
		var generation = getGeneration(pokemon)
		for (var i in items)
			if (+items[i] == generation)
				return true
		return false
	}
}

function getGeneration(pokemon) {
	if (pokemon.id <= 151)
		return 1
	if (pokemon.id <= 251)
		return 2
	if (pokemon.id <= 386)
		return 3
	if (pokemon.id <= 493)
		return 4
	if (pokemon.id <= 649)
		return 5
	if (pokemon.id <= 721)
		return 6
	if (pokemon.id <= 802)
		return 7
	return 8
}