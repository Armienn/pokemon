"use strict";

class State {
	constructor() {
		// modes and tabs
		this.mode = "table"
		this.completionMode = "normal"
		this.currentTab = "all"
		this.showMoves = false

		// actual pokemon
		this.currentPokemon
		this.currentPokemons = []

		// filters and search
		this.query
		this.filters = {}
		this.searchFilter
		this.sorting

		// Loading stuff
		this.loaded = false
		this.thingsLoaded = {
			pokemons: false,
			moves: false,
			abilities: false,
			types: false,
			natures: false,
			eggGroups: false
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
}