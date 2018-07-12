import { Pokemon } from "./pokemon-data.js"

export class CollectionGroup {
	constructor(title) {
		this.title = title
		this.tabs = {}
	}

	addTab(title, pokemons) {
		this.tabs[title] = { pokemons: pokemons || [] }
	}

	saveToLocalStorage() {
		var tabs = {}
		for (var i in this.tabs) {
			tabs[i] = { title: i, pokemons: [] }
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
		for (var i in tabs) {
			for (var n in tabs[i].pokemons)
				tabs[i].pokemons[n] = new Pokemon(tabs[i].pokemons[n])
			this.addTab(tabs[i].title, tabs[i].pokemons)
		}
	}
}