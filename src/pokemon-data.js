import { DataStore } from "../../archive/search/data-store.js"

export class Pokemon {
	constructor(pokemon) {
		if (!pokemon)
			return
		// if pokemon is a base pokemon
		if (typeof pokemon !== "Pokemon" && !pokemon.base && pokemon.abilities) {
			this.base = pokemon
			this.id = pokemon.id
			this.name = pokemon.name
			this.form = pokemon.form
			return
		}
		var poke = stuff.data.getPokemonFrom(pokemon)
		if (!poke)
			return
		this.base = poke.base
		if (typeof pokemon != "string")
			for (var i in pokemon)
				this[i] = pokemon[i]
		this.id = poke.base.id
		this.name = poke.base.name
		this.form = poke.base.form
	}

	get forms() { return this.base.forms }
	get stats() { return this.base.stats }
	get abilities() { return this.base.abilities }
	get classification() { return this.base.classification }
	get description() { return this.base.description }
	get locations() { return this.base.locations }
	get eggGroups() { return this.base.eggGroups }
	get eggs() { return this.base.eggs }
	get evolvesFrom() { return this.base.evolvesFrom }
	get evolvesTo() { return this.base.evolvesTo }
	get height() { return this.base.height }
	get weight() { return this.base.weight }
	get moves() { return this.base.moves }
	get ratio() { return this.base.ratio }
	get types() { return this.base.types }
}

export class PokemonData extends DataStore {
	constructor() {
		super()
		this.pokemons = []
		this.moves = {}
		this.abilities = {}
		this.natures = {}
		this.eggGroups = []
		this.types = {}
		this.typeNames = []
		this.typeColors = {
			Bug: "#A8B820",
			Dark: "#705848",
			Dragon: "#7038F8",
			Electric: "#F8D030",
			Fairy: "#EE99AC",
			Fighting: "#C03028",
			Fire: "#F08030",
			Flying: "#A890F0",
			Ghost: "#705898",
			Grass: "#78C850",
			Ground: "#E0C068",
			Ice: "#98D8D8",
			Normal: "#A8A878",
			Poison: "#A040A0",
			Psychic: "#F85888",
			Rock: "#B8A038",
			Steel: "#B8B8D0",
			Water: "#6890F0"
		}
		this.pokeballs = [
			"Poké",
			"Great",
			"Ultra",
			"Master",
			"Safari",
			"Level",
			"Lure",
			"Moon",
			"Friend",
			"Love",
			"Heavy",
			"Fast",
			"Sport",
			"Premier",
			"Repeat",
			"Timer",
			"Nest",
			"Net",
			"Dive",
			"Luxury",
			"Heal",
			"Quick",
			"Dusk",
			"Cherish",
			"Dream",
			"Beast"
		]
	}

	findPokemon(id, form) {
		var pokemon = new Pokemon()
		pokemon.id = id
		var possiblePokes = this.pokemons.filter(e => id == e.id)
		if (possiblePokes.length == 0)
			return null
		pokemon.base = possiblePokes[0]
		if (possiblePokes[0].forms)
			pokemon.form = this.findBestFormFit(possiblePokes[0].forms, form)
		else
			pokemon.form = "Base"
		if (possiblePokes.length > 1) {
			var possibleForms = possiblePokes.filter(e => e.form == pokemon.form)
			if (possibleForms.length == 1)
				pokemon.base = possibleForms[0]
		}
		pokemon.name = pokemon.base.name
		return pokemon
	}

	findBestFormFit(forms, form) {
		if (!form)
			return forms[0]
		var fits = forms.filter(e => e.toLowerCase() == form.toLowerCase())
		if (fits.length)
			return fits[0]
		fits = []
		var words = form.split(" ")
		var highestCount = 0
		for (var i in forms) {
			var count = 0
			for (var j in words)
				if (forms[i].toLowerCase().indexOf(words[j].toLowerCase()) > -1)
					count++
			if (count > highestCount) {
				fits = [forms[i]]
				highestCount = count
			} else if (count == highestCount)
				fits.push(forms[i])
		}
		if (fits.length)
			return fits[0]
		return forms[0]
	}

	getPokemonFrom(idformthing) {
		if (idformthing > 0)
			return this.findPokemon(+idformthing)
		if (typeof idformthing == "string")
			idformthing = { name: idformthing }
		if (!idformthing.id && idformthing.name) {
			var possiblePokes = this.pokemons.filter(e => idformthing.name.toLowerCase() == e.name.toLowerCase())
			if (possiblePokes.length)
				idformthing.id = possiblePokes[0].id
			else
				return false
		}
		return this.findPokemon(idformthing.id, idformthing.form)
	}

	uniqueBy(list, key) {
		var seen = {};
		return list.filter(function (item) {
			var k = key(item);
			return seen.hasOwnProperty(k) ? false : (seen[k] = true);
		})
	}

	tallyDefense(attackType, pokemon) {
		var defense = 1
		defense *= this.getTypeDefense(attackType, pokemon.types[0])
		if (pokemon.types[1])
			defense *= this.getTypeDefense(attackType, pokemon.types[1])
		return defense
	}

	getTypeDefense(attackType, defenseType) {
		if (this.types[defenseType].weaknesses.indexOf(attackType) > -1)
			return 2
		else if (this.types[defenseType].strengths.indexOf(attackType) > -1)
			return 0.5
		else if (this.types[defenseType].immunities.indexOf(attackType) > -1)
			return 0
		return 1
	}

	getGeneration(pokemon) {
		if (pokemon.id <= 151)
			return 1
		if (pokemon.id <= 251)
			return 2
		if (pokemon.id <= 386)
			return 3
		if (pokemon.id <= 493)
			return 4
		if (pokemon.id <= 649)
			return 5
		if (pokemon.id <= 721)
			return 6
		if (pokemon.id <= 802)
			return 7
		return 8
	}

	getTotalBaseStat(pokemon) {
		var count = 0
		for (var i in pokemon.stats)
			count += pokemon.stats[i]
		return count
	}

	getStatAtLevel(pokemon, stat, level) {
		if (pokemon.id == 292 && stat == "hp")
			return 1
		var base = +pokemon.stats[stat]
		var iv = pokemon.ivs ? +pokemon.ivs[stat] : 0
		iv = iv ? iv : 0
		var ev = pokemon.evs ? +pokemon.evs[stat] : 0
		ev = ev ? ev : 0
		if (stat == "hp")
			return Math.floor((2 * base + iv + ev / 4) * level / 100) + 10 + level
		var nature = PokeText.natureCssClass(stat, pokemon)
		switch (nature) {
			case "positive-nature": nature = 1.1; break;
			case "negative-nature": nature = 0.9; break;
			default: nature = 1; break;
		}
		return Math.floor((Math.floor((2 * base + iv + ev / 4) * level / 100) + 5) * nature)
	}
}
