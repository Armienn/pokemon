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
			abilities: false
		}
		this.externalInventory = { load: false, tabsLoaded: [] }
		this.script
		this.spreadsheet
		this.destination

		// other stuff
		this.customPokemon = function(){ 
			var list = []
			var pokemon = stuff.data.getPokemonFrom({name:"Beedrill",form:"Mega"})
			pokemon.ivs = {hp:31,atk:31,def:31,spa:31,spd:31,spe:31}
			pokemon.evs = {hp:0,atk:0,def:0,spa:0,spd:0,spe:252}
			pokemon.nature = "Jolly"
			pokemon.got = true
			list.push(pokemon)
			for(var n in stuff.data.pokemons){
				pokemon = new Pokemon(stuff.data.pokemons[n])
				pokemon.ivs = {hp:31,atk:31,def:31,spa:31,spd:31,spe:31}
				pokemon.evs = {hp:0,atk:0,def:0,spa:0,spd:0,spe:252}
				pokemon.nature = "Jolly"
				list.push(pokemon)
			}
			return list
		}
	}

	get thingsAreLoaded(){
		for(var i in this.thingsLoaded)
			if(!this.thingsLoaded[i])
				return false
		return true
	}

	selectTab(tab) {
		window.location.hash = ""
		if(typeof tab !== "string")
			window.location.hash = tab.id
		this.currentTab = tab
		stuff.updatePokemons()
	}
}