"use strict";

class Settings {
	constructor() {
		this.colorSchemes = {
			night: ["#222", "#eee", "#c00"],
			day: ["whitesmoke", "black", "rgb(224, 54, 34)"],
			custom: ["#222", "#eee", "#c00"]
		}
		this.colorScheme = "night"
		this.showBreedables = false
		this.tableSetup = {
			pokemon: { index: 0, state: true },
			id: { index: 1, state: true },
			base: { index: 2, state: true },
			ability: { index: 3, state: true },
			nature: { index: 4, state: true },
		}
	}

	get colors() {
		return {
			backgroundColor: this.colorSchemes[this.colorScheme][0],
			textColor: this.colorSchemes[this.colorScheme][1],
			headerColor: this.colorSchemes[this.colorScheme][2]
		}
	}

	setColorScheme(scheme){
		this.colorScheme = scheme
		localStorage.colorScheme = scheme
	}

	load(){
		if(localStorage){
			var scheme = localStorage.colorScheme
			if(scheme)
				this.colorScheme = scheme
		}
	}
}