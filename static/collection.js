"use strict";

class Collection {
	constructor() {
		this.collectorName
		this.collectorUrl
		this.collectorFriendCode
		this.spreadsheetId
		this.pokemons = []
		this.lookingFor = []
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

	newTab(title, pokemons, id) {
		var tab = {}
		tab.title = title
		tab.id = id
		tab.pokemons = pokemons
		tab.click = () => {
			stuff.state.selectTab(tab)
		}
		tab.active = () => stuff.state.currentTab == tab
		return tab
	}
}