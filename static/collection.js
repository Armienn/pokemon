"use strict";

class Collection {
	constructor() {
		this.collectorName
		this.collectorUrl
		this.collectorFriendCode
		this.spreadsheetId
		this.pokemons = []
		this.lookingFor = []
		this.local = []
	}

	addTab(title, pokemons, id) {
		if (!id)
			id = this.nextId()
		var tab = this.newTab(title, pokemons, id)
		this.pokemons.push(tab)
		return tab
	}

	addLookingForTab(title, pokemons, id) {
		if (!id)
			id = this.nextId()
		var tab = this.newTab(title, pokemons, id)
		this.lookingFor.push(tab)
		return tab
	}

	addLocalTab(title, pokemons, skipSave) {
		if (!pokemons)
			pokemons = []
		var tab = this.getLocalTab(title)
		if (!tab) {
			tab = this.newTab(title, [], title)
			this.local.push(tab)
		}
		tab.pokemons = tab.pokemons.concat(pokemons)
		if (!skipSave)
			this.saveLocalTabs()
		return tab
	}

	getLocalTab(title) {
		for (var i in this.local)
			if (this.local[i].title == title)
				return this.local[i]
		return false
	}

	newTab(title, pokemons, id) {
		var tab = {}
		tab.title = title
		tab.id = id
		tab.pokemons = pokemons ? pokemons : []
		tab.click = () => {
			stuff.selectTab(tab)
		}
		tab.active = () => stuff.state.currentTab == tab
		if (!stuff.state.loaded && tab.id == stuff.state.destination)
			stuff.selectTab(tab)
		return tab
	}

	nextId() {
		var id = 1
		for (var i in this.pokemons)
			if ((+this.pokemons[i].id) && id <= this.pokemons[i].id)
				id = this.pokemons[i].id + 1
		for (var i in this.lookingFor)
			if ((+this.lookingFor[i].id) && id <= this.lookingFor[i].id)
				id = this.lookingFor[i].id + 1
		return id
	}

	saveLocalTabs() {
		var tabs = []
		for (var i in this.local) {
			tabs[i] = { title: this.local[i].title, pokemons: [] }
			var pokemons = this.local[i].pokemons
			for (var n in pokemons) {
				var pokemon = pokemons[n]
				var base = pokemon.base
				delete pokemon.base
				tabs[i].pokemons.push(JSON.parse(JSON.stringify(pokemon)))
				pokemon.base = base
			}
		}
		localStorage.tabs = JSON.stringify(tabs)
	}

	loadLocalTabs() {
		if (!(localStorage && localStorage.tabs))
			return
		var tabs = JSON.parse(localStorage.tabs)
		for (var i in tabs) {
			for (var n in tabs[i].pokemons)
				tabs[i].pokemons[n] = new Pokemon(tabs[i].pokemons[n])
			this.addLocalTab(tabs[i].title, tabs[i].pokemons, true)
		}
	}
}