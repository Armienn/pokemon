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

		this.filters = { }

		this.titleElement = document.getElementById("main-title")
		this.subtitleElement = document.getElementById("sub-title")
		this.navListElement = document.getElementById("nav-list")
		this.filterAdderElement = document.getElementById("filter-adder")
	}

	setup(){
		this.filters = {
			"Type": { type: "basic", filter: this.hasItemInFilter("types"), options: stuff.data.typeNames },
			"Ability": { type: "basic", filter: this.hasItemInFilter("ability", "abilities"), options: Object.keys(stuff.data.abilities) },
			"Move": { type: "basic", filter: this.hasItemInFilter("moves"), options: Object.keys(stuff.data.moves) },
			"Egg group": { type: "basic", filter: this.hasItemInFilter("eggGroups"), options: stuff.data.eggGroupNames },
			"Gender ratios": { type: "multi", filter: this.hasItemInFilter("ratio"), options: ["7:1", "3:1", "1:1", "1:3", "1:7", "—"] },
			"Generation": { type: "multi", filter: this.generationFilter, options: ["1", "2", "3", "4", "5", "6", "7"] },
			"Legendary": { type: "select", filter: this.legendaryFilter, options: ["Show only", "Don't show"] },
			"Nature": { type: "basic", filter: this.hasItemInFilter("nature"), options: Object.keys(stuff.data.natures) },
			"Learnt moves": { type: "basic", filter: this.hasItemInFilter("learntMoves"), options: Object.keys(stuff.data.moves) },
			"Gender": { type: "multi", filter: this.hasItemInFilter("gender"), options: ["♂", "♀", "—", "Undefined"] },
			"Shiny": { type: "select", filter: this.shinyFilter, options: ["Show only", "Don't show"] },
			"Hidden ability": { type: "select", filter: this.hiddenAbilityFilter, options: ["Show only", "Don't show"] }
		}
		this.updateNavPokemonTabs()
	}

	show() {
		this.showTitle()
		this.showSubtitle()
		this.showNavList()
		this.showFiltering()
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

	showFiltering() {
		this.addFilterInputs()
		this.addFilterSelect()
	}
	
	addFilterSelect(){
		var filterElement = newTag("li", this.filterAdderElement, true)
		filterElement.title = "Filters remove pokemons that do not fit the filter"
		newTag("label", filterElement).innerHTML = "Add filter:"
		var selectElement = newTag("select", filterElement)
		newTag("option", selectElement)
		for(var i in this.filters){
			var optionElement = newTag("option", selectElement)
			optionElement.value = i
			optionElement.innerHTML = i
		}
		selectElement.onchange = (event)=>{
			// remove filterinput
			var filter = this.filters[event.target.value]
			if(!filter)
				return
			
		}
	}

	addFilterInputs(){
		for(var i in this.filters){
			// blub
		}
	}


	// ----- Filters ----------
	getSearchFilter(query) {
		return function (pokemon) {
			query = query.trim().toLowerCase()
			return PokeText.formName(pokemon).toLowerCase().indexOf(query) > -1
		}
	}
	
	hasItemInFilter(key, fallbackKey) {
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
	
	shinyFilter(mode) {
		var show = mode == "Show only"
		return function (pokemon) {
			if (pokemon.shiny)
				return show
			return !show
		}
	}
	
	hiddenAbilityFilter(mode) {
		var show = mode == "Show only"
		return function (pokemon) {
			if (pokemon.ability && (pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.toLowerCase() : false))
				return show
			return !show
		}
	}
	
	legendaryFilter(mode) {
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
	
	generationFilter(...items) {
		return (pokemon) => {
			var generation = this.getGeneration(pokemon)
			for (var i in items)
				if (+items[i] == generation)
					return true
			return false
		}
	}
	
	getGeneration(pokemon) {
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
}

// filter things



