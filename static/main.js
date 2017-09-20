"use strict";

class PokemonStuff {

	constructor() {
		this.headerSection = new HeaderSection()
		this.infoSection = new InfoSection()
		this.listSection = new ListSection()
		this.optionsSection = new OptionsSection()
		this.state = new State()
		this.settings = new Settings()
		this.data = new PokemonData()
		this.collection = new Collection()
		this.spreadsheetParser = new SpreadsheetParser()
	}

	update() {
		this.optionsSection.updateOptions()
		this.headerSection.updateNavPokemonTabs()
		this.updatePokemons()
		this.show()
	}

	updatePokemons() {
		if (!this.state.loaded)
			return
		this.state.currentPokemons = this.data.getFilteredPokemons()
		this.listSection.show()
		this.headerSection.updateFilterTabs()
	}

	selectPokemon(pokemon, element) {
		if (!pokemon || this.state.currentPokemon == pokemon) {
			this.infoSection.closeInfo()
			return
		}
		this.infoSection.closeInfo(() => {
			this.infoSection.showInfo(pokemon, element)
		})
	}

	selectTab(tab) {
		window.location.hash = ""
		if (stuff.collection.pokemons.includes(tab) || stuff.collection.lookingFor.includes(tab))
			window.location.hash = tab.id
		this.state.currentTab = tab
		this.updatePokemons()
	}

	load() {
		this.loadBaseData()
		this.loadCollectionData()
		this.loadDestination()
		this.settings.load()
	}

	loadBaseData() {
		this.loadJSONData("pokemons")
		this.loadJSONData("moves")
		this.loadJSONData("abilities")
		this.loadJSONData("natures")
		this.loadJSONData("eggGroups", "egg-groups")
		requestJSON("https://armienn.github.io/pokemon/data-sumo/types.json", (types) => {
			this.data.types = types
			this.data.typeNames = Object.keys(types)
			this.state.thingsLoaded.types = true
			this.tryLoad()
		})
	}

	loadJSONData(thing, file) {
		if (!file)
			file = thing
		requestJSON("https://armienn.github.io/pokemon/data-sumo/" + file + ".json", (data) => {
			this.data[thing] = data
			this.state.thingsLoaded[thing] = true
			this.tryLoad()
		})
	}

	loadCollectionData() {
		if (!window.location.search)
			return
		var argument = window.location.search.substring(1)
		this.state.externalInventory.load = true
		var args = argument.split(":")
		if (args[0] == "script" || args[0] == "json" || args[0] == "smogon")
			request("https://" + args[1], (response) => {
				this.state.script = { type: args[0], content: response }
				this.tryLoad()
			})
		else
			requestJSON(this.spreadsheetParser.getSpreadsheetUrl(argument), (response) => {
				this.state.spreadsheet = { id: argument, spreadsheet: response }
				this.tryLoad()
			})
	}

	loadDestination() {
		if (window.location.hash)
			this.state.destination = window.location.hash.substring(1)
	}

	tryLoad() {
		if (!this.state.thingsAreLoaded)
			return
		if (this.state.externalInventory.load) {
			this.headerSection.showLocal = false
			if (this.state.script)
				switch (this.state.script.type) {
					case "script": this.loadScript((content) => new Function(content)()); break;
					case "json": this.loadScript((content) => Porting.importJSON(content)); break;
					case "smogon": this.loadScript((content) => Porting.importSmogon(content)); break;
				}
			else if (this.state.spreadsheet)
				this.loadSpreadsheet()
			if (!this.state.externalInventory.isLoaded)
				return
		}
		this.state.loaded = true
		this.headerSection.setup()
		this.collection.loadLocalTabs()
		this.update()
		if (!this.collection.pokemons.length && this.state.destination)
			this.selectPokemonBasedOn(this.state.destination)
		setInterval(() => { this.listSection.loadMoreWhenScrolledDown() }, 500)
	}

	selectPokemonBasedOn(destination) {
		for (var n in this.data.pokemons) {
			var pokemon = this.data.pokemons[n]
			var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀", "-f").replace("♂", "-m").replace("'", "").replace(".", "").replace("ébé", "ebe").replace(":", "")
			if (pokemon.id == destination || name == destination.toLowerCase()) {
				this.selectPokemon(pokemon)
				return
			}
		}
	}

	loadScript(parser) {
		var pokemons
		try {
			pokemons = parser(this.state.script.content)
		}
		catch (e) {
			document.getElementById("loading").innerHTML = "Failed to load external collection: " + e.message
			document.getElementById("loading").onclick = () => {
				this.state.externalInventory.load = false
				this.tryLoad()
			}
			return
		}
		this.state.script = undefined
		if (!pokemons)
			return
		var tab = this.collection.addTab("Pokémon list", pokemons)
		this.selectTab(tab)
		this.state.externalInventory.isLoaded = true
	}

	loadSpreadsheet() {
		this.spreadsheetParser.parse(this.state.spreadsheet)
		this.state.spreadsheet = undefined
	}

	show() {
		this.headerSection.show()
		this.updateColors()
		setTimeout(function () { fade(document.getElementById("loading")) }, 500)
	}

	updateColors() {
		document.getElementsByTagName("body")[0].style.backgroundColor = this.settings.colors.backgroundColor
		document.getElementsByTagName("body")[0].style.color = this.settings.colors.textColor
		document.getElementsByTagName("section")[0].style.backgroundColor = this.settings.colors.headerColor
		document.getElementsByTagName("header")[0].style.backgroundColor = this.settings.colors.headerColor
	}
}

// some utility functions

function requestJSON(url, callback) {
	request(url, function (response) {
		callback(JSON.parse(response))
	})
}

function request(url, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(xmlHttp.responseText)
	}
	xmlHttp.open("GET", url, true)
	xmlHttp.send()
}

function newTag(tag, parentElement, options = {}) {
	var newElement = document.createElement(tag)
	if (parentElement) {
		if (options.first)
			parentElement.insertBefore(newElement, parentElement.firstChild)
		else
			parentElement.appendChild(newElement)
	}
	for (var style in options.style)
		newElement.style[style] = options.style[style]
	if (options.text)
		newElement.innerHTML = options.text
	return newElement
}

function fade(element) {
	var opacity = 1;
	var timer = setInterval(function () {
		if (opacity <= 0.01) {
			clearInterval(timer)
			element.style.display = 'none'
		}
		element.style.opacity = opacity
		element.style.filter = 'alpha(opacity=' + opacity * 100 + ")"
		opacity -= 0.15
	}, 50)
}

function textContains(text, substring) {
	return text.toLowerCase().indexOf(substring.toLowerCase()) > -1
}

function prependZeroes(number, characters) {
	number = number.toString()
	while (number.length < characters) {
		number = "0" + number
	}
	return number
}

function parseStatType(text) {
	if (["hp", "health"].indexOf(text.trim().toLowerCase()) > -1)
		return "hp"
	if (["atk", "attack"].indexOf(text.trim().toLowerCase()) > -1)
		return "atk"
	if (["def", "defense"].indexOf(text.trim().toLowerCase()) > -1)
		return "def"
	if (["spa", "sp. atk", "sp. attack", "special attack"].indexOf(text.trim().toLowerCase()) > -1)
		return "spa"
	if (["spd", "sp. def", "sp. defense", "special defense"].indexOf(text.trim().toLowerCase()) > -1)
		return "spd"
	if (["spe", "speed"].indexOf(text.trim().toLowerCase()))
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

var stuff = new PokemonStuff()
stuff.load()
