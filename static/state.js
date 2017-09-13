"use strict";

class State {
	constructor() {
		this.mode = "table"
		this.completionMode = "normal"
		this.currentPokemon
		this.showMoves = false
		this.loaded = false
		this.thingsLoaded = {
			pokemons: false,
			moves: false,
			abilities: false
		}
		this.loadExternalInventory = false
		this.script
		this.spreadsheet

		this.colorSets = {
			night: ["#222", "#eee", "#c00"],
			day: ["whitesmoke", "black", "rgb(239, 85, 67)"],
			custom: ["#222", "#eee", "#c00"]
		}
		this.colorSet = "night"
	}

	get colors() {
		return {
			backgroundColor: this.colorSets[this.colorSet][0],
			textColor: this.colorSets[this.colorSet][1],
			headerColor: this.colorSets[this.colorSet][2]
		}
	}

	get thingsAreLoaded(){
		for(var i in this.thingsLoaded)
			if(!this.thingsLoaded[i])
				return false
		return true
	}
}