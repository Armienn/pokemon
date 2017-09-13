"use strict";

class PokemonStuff {

	constructor() {
		this.headerSection = new HeaderSection()
		this.listSection = new ListSection()
		this.gridSection = new GridSection()
		this.infoSection = new InfoSection()
		this.state = new State()
		this.data = new PokemonData()
		this.collection = new CollectionData()
	}

	tryLoad() {
		if (!this.state.thingsAreLoaded)
			return
		if (this.state.loadExternalInventory) {
			if (this.state.script)
				addScriptTab(this.state.script)
			else if (this.state.spreadsheet)
				parseSpreadsheet(this.state.spreadsheet)
			else return
		}
		
	}

	show() {
		this.headerSection.show()
		this.updateColors()
		document.getElementById("loading").hidden = true
	}

	loadData() {
		this.loadBaseData()
		this.loadCollectionData()
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
		this.state.loadExternalInventory = true
		if (argument.startsWith("script:"))
			request("https://" + argument.substring(7), (response) => {
				this.state.script = response
				this.tryLoad()
			})
		else
			requestJSON(getSpreadsheetUrl(argument), (response) => {
				this.state.spreadsheet = response
				this.tryLoad()
			})
	}

	loadScript() {

	}

	loadSpreadsheet() {

	}

	updateColors() {
		document.getElementsByTagName("body")[0].style.backgroundColor = this.state.colors.backgroundColor
		document.getElementsByTagName("body")[0].style.color = this.state.colors.textColor
		document.getElementsByTagName("section")[0].style.backgroundColor = this.state.colors.headerColor
		document.getElementsByTagName("header")[0].style.backgroundColor = this.state.colors.headerColor
	}
}

class ListSection {

}

class GridSection {

}

class InfoSection {
}

class CollectionData {

}

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

var stuff = new PokemonStuff()
stuff.loadData()
stuff.show()
