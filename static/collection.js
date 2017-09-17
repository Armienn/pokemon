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
		var tab = this.newTab(title, pokemons, id)
		if (!id)
			tab.id = this.pokemons.length ? this.pokemons[this.pokemons.length - 1].id + 1 : 1
		this.pokemons.push(tab)
		return tab
	}

	addLookingForTab(title, pokemons, id) {
		var tab = this.newTab(title, pokemons, id)
		if (!id)
			tab.id = this.lookingFor.length ? this.lookingFor[this.lookingFor.length - 1].id + 1 : 1
		this.lookingFor.push(tab)
		return tab
	}

	addLocalTab(title, pokemons, skipSave) {
		var tab = this.newTab(title, pokemons, title)
		var added = false
		for (var i in this.local) {
			if (this.local[i].title == title) {
				this.local[i] = tab
				added = true
				break
			}
		}
		if (!added)
			this.local.push(tab)
		if(!skipSave)
			this.saveLocalTabs()
		return tab
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
		return tab
	}

	saveLocalTabs() {
		var tabs = []
		for(var i in this.local){
			tabs[i] = {title:this.local[i].title, pokemons: []}
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
		if(!(localStorage && localStorage.tabs))
			return
		var tabs = JSON.parse(localStorage.tabs)
		for (var i in tabs){
			for(var n in tabs[i].pokemons)
				tabs[i].pokemons[n] = new Pokemon(tabs[i].pokemons[n])
			this.addLocalTab(tabs[i].title, tabs[i].pokemons, true)
		}
	}
}