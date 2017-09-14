"use strict";

class Settings {
	constructor() {
		this.colorSchemes = {
			night: ["#222", "#eee", "#c00"],
			day: ["whitesmoke", "black", "rgb(239, 85, 67)"],
			custom: ["#222", "#eee", "#c00"]
		}
		this.colorScheme = "night"
		this.showBreedables = false
	}

	get colors() {
		return {
			backgroundColor: this.colorSchemes[this.colorScheme][0],
			textColor: this.colorSchemes[this.colorScheme][1],
			headerColor: this.colorSchemes[this.colorScheme][2]
		}
	}
}