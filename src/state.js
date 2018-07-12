export class State {
	constructor() {
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
