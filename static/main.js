"use strict";

class PokemonStuff {

	constructor() {
		this.headerSection = new HeaderSection()
		this.infoSection = new InfoSection()
		this.listSection = new ListSection()
		this.state = new State()
		this.settings = new Settings()
		this.data = new PokemonData()
		this.collection = new Collection()
		this.spreadsheetParser = new SpreadsheetParser()
	}

	updatePokemons() {
		if(!this.state.loaded)
			return
		this.state.currentPokemons = this.data.getFilteredPokemons()
		this.listSection.show()
		// ?
	}

	selectPokemon(pokemon, element){
		if(!pokemon || this.state.currentPokemon == pokemon){
			this.infoSection.closeInfo()
			return
		}
		this.infoSection.closeInfo(()=>{
			this.infoSection.showInfo(pokemon, element)
		})
	}

	tryLoad() {
		if (!this.state.thingsAreLoaded)
			return
		if (this.state.externalInventory.load) {
			if (this.state.script)
				this.loadScript()
			else if (this.state.spreadsheet)
				this.loadSpreadsheet()
			if (!this.state.externalInventory.isLoaded)
				return
		}
		this.state.loaded = true
		this.headerSection.updateNavPokemonTabs()
		this.updatePokemons()
		this.show()
		setInterval(() => { this.listSection.loadMoreWhenScrolledDown() }, 500)
	}

	load() {
		this.loadBaseData()
		this.loadCollectionData()
		this.loadDestination()
		this.loadCookieSettings()
	}

	loadBaseData() {
		requestJSON("https://armienn.github.io/pokemon/static/moves.json", (moves) => {
			this.data.moves = moves
			this.state.thingsLoaded.moves = true
			this.tryLoad()
		})
		requestJSON("https://armienn.github.io/pokemon/static/pokemons.json", (pokemons) => {
			this.data.pokemons = pokemons
			this.state.thingsLoaded.pokemons = true
			this.tryLoad()
		})
		requestJSON("https://armienn.github.io/pokemon/static/abilities.json", (abilities) => {
			this.data.abilities = abilities
			this.state.thingsLoaded.abilities = true
			this.tryLoad()
		})
	}

	loadCollectionData() {
		if (!window.location.search)
			return
		var argument = window.location.search.substring(1)
		this.state.externalInventory.load = true
		if (argument.startsWith("script:"))
			request("https://" + argument.substring(7), (response) => {
				this.state.script = response
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

	loadCookieSettings() {

	}

	loadScript() {
		var pokemons = new Function(this.state.script)()
		this.state.script = undefined
		if (!pokemons)
			return
		var tab = this.collection.addTab("Pokémon list", pokemons)
		this.state.selectTab(tab)
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

function prependZeroes(number, characters){
	number = number.toString()
	while(number.length < characters){
		number = "0" + number
	}
	return number
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

var stuff = new PokemonStuff()
stuff.load()
