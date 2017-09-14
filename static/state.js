"use strict";

class State {
	constructor() {
		this.mode = "table"
		this.completionMode = "normal"
		this.currentPokemon
		this.currentTab
		this.showMoves = false
		this.loaded = false
		this.thingsLoaded = {
			pokemons: false,
			moves: false,
			abilities: false
		}
		this.externalInventory = { load: false, tabsLoaded: [] }
		this.script
		this.spreadsheet
		this.destination
	}

	get thingsAreLoaded(){
		for(var i in this.thingsLoaded)
			if(!this.thingsLoaded[i])
				return false
		return true
	}

	selectTab(tab) {
		this.currentTab = tab
		window.location.hash = tab.id
		stuff.update()
	}
}