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
		this.tableSetup = this.defaultTableSetup()
	}

	get colors() {
		return {
			backgroundColor: this.colorSchemes[this.colorScheme][0],
			textColor: this.colorSchemes[this.colorScheme][1],
			headerColor: this.colorSchemes[this.colorScheme][2]
		}
	}

	setColorScheme(scheme) {
		this.colorScheme = scheme
		localStorage.colorScheme = scheme
	}

	load() {
		if (localStorage) {
			var scheme = localStorage.colorScheme
			if (scheme)
				this.colorScheme = scheme
			var tableSetup
			try {
				tableSetup = JSON.parse(localStorage.tableSetup)
			}
			catch (e) { }
			for (var i in tableSetup)
				this.tableSetup[i] = tableSetup[i]
		}
	}

	defaultTableSetup() {
		var info = Porting.tableSetup
		var setup = []
		for (var i in info)
			setup.push({ thing: i, state: info[i].states ? info[i].states[0] : true })
		return setup
	}

	saveTableSetup() {
		localStorage.tableSetup = JSON.stringify(this.tableSetup)
	}
}