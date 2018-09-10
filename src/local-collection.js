import { Pokemon } from "./pokemon-data.js"

export class CollectionGroup {
	constructor(title) {
		this.title = title
		this.tabs = []
	}

	addTab(title, pokemons) {
		const tab = { pokemons: pokemons || [], title: title }
		this.tabs.push(tab)
		return tab
	}

	remove(tab) {
		this.tabs.splice(this.tabs.indexOf(tab), 1)
	}

	groupings() {
		const groupings = { "Collection": {} }
		for (var tab of this.tabs) {
			const parts = tab.title.split(":")
			if (parts.length > 1) {
				if (!groupings[parts[0]])
					groupings[parts[0]] = {}
				groupings[parts[0]][parts[1]] = tab
			}
			else {
				groupings["Collection"][parts[0]] = tab
			}
		}
		if (!Object.keys(groupings.Collection).length)
			delete groupings.Collection
		return groupings
	}

	saveToLocalStorage() {
		var tabs = {}
		for (var i in this.tabs) {
			tabs[i] = { title: this.tabs[i].title, pokemons: [] }
			var pokemons = this.tabs[i].pokemons
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

	loadFromLocalStorage() {
		if (!(localStorage && localStorage.tabs))
			return
		var tabs = JSON.parse(localStorage.tabs)
		this.tabs = []
		for (var i in tabs) {
			for (var n in tabs[i].pokemons)
				tabs[i].pokemons[n] = new Pokemon(tabs[i].pokemons[n])
			this.addTab(tabs[i].title, tabs[i].pokemons)
		}
	}
}