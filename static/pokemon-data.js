"use strict";

class Pokemon {
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

class PokemonData {
	constructor() {
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

	getFilteredPokemons() {
		var pokes = []
		for (var i in this.pokemons)
			pokes[i] = this.pokemons[i]
		if (stuff.state.currentTab == "mine") {
			pokes = []
			for (var i in stuff.collection.pokemons)
				pokes = pokes.concat(stuff.collection.pokemons[i].pokemons)
		} else if (stuff.state.currentTab == "breedables") {
			pokes = []
			for (var i in stuff.collection.pokemons)
				pokes = pokes.concat(stuff.collection.pokemons[i].pokemons)
			pokes = this.getBreedables(pokes)
		} else if (stuff.state.currentTab == "all") {
			pokes = pokes
		} else if (stuff.state.currentTab)
			pokes = stuff.state.currentTab.pokemons

		pokes = this.getCompletionModePokemon(pokes)

		for (var i in stuff.state.filters)
			pokes = pokes.filter(stuff.state.filters[i])
		if (stuff.state.searchQuery)
			pokes = pokes.filter((pokemon) => {
				var query = stuff.state.searchQuery.trim().toLowerCase()
				return PokeText.formName(pokemon).toLowerCase().indexOf(query) > -1
			})
		if (stuff.state.sorting) {
			pokes.sort(stuff.state.sorting)
			if (stuff.state.reverseSort)
				pokes.reverse()
		}
		return pokes
	}

	getCompletionModePokemon(pokes) {
		if (stuff.state.completionMode == "normal") return pokes
		var basePokes = []
		if (stuff.state.completionMode == "families") {
			for (var n in this.pokemons) {
				var pokemon = this.pokemons[n]
				if (!pokemon.evolvesFrom && basePokes.filter(e => e.id == pokemon.id).length == 0) {
					var newPoke = new Pokemon(pokemon)
					basePokes.push(newPoke)
					var lineIds = this.getPokemonFamilyIds(pokemon)
					if (pokes.filter(e => lineIds.indexOf(e.id) > -1).length)
						newPoke.got = true
				}
			}
		} else if (stuff.state.completionMode == "pokemons") {
			for (var n in this.pokemons) {
				var pokemon = this.pokemons[n]
				if (!basePokes[pokemon.id - 1]) {
					basePokes[pokemon.id - 1] = new Pokemon(pokemon)
					if (pokes.filter(e => e.id == pokemon.id).length)
						basePokes[pokemon.id - 1].got = true
				}
			}
		} else if (stuff.state.completionMode == "forms") {
			var allForms = this.getAllForms()
			for (var i in allForms) {
				for (var j in allForms[i]) {
					var newPoke = this.getPokemonFrom(allForms[i][j])
					if (newPoke.form.startsWith("Mega") ||
						newPoke.form == "Primal" ||
						newPoke.form == "Meteor Form" ||
						newPoke.name == "Castform" && newPoke.form != "Base" ||
						newPoke.name == "Rotom" && newPoke.form != "Base" ||
						newPoke.name == "Meloetta" && newPoke.form != "Aria Forme" ||
						newPoke.name == "Aegislash" && newPoke.form != "Shield Forme" ||
						newPoke.name == "Wishiwashi" && newPoke.form != "Solo Form" ||
						newPoke.name == "Minior" && newPoke.form == "Meteor Form"
					) continue
					basePokes.push(newPoke)
					if (pokes.filter(e => e.id == newPoke.id && e.form == newPoke.form).length)
						newPoke.got = true
				}
			}
		}
		return basePokes
	}

	getPokemonFamilyIds(pokemon, recursion) {
		if (recursion === undefined)
			recursion = 0
		else
			recursion++
		if (!pokemon || recursion > 3) {
			console.log("error with " + JSON.stringify(pokemon))
			return []
		}
		var ids = [pokemon.id]
		for (var i in pokemon.evolvesTo)
			ids = ids.concat(this.getPokemonFamilyIds(this.getPokemonFrom(pokemon.evolvesTo[i]), recursion))
		return ids
	}

	getAllForms() {
		var forms = []
		for (var n in this.pokemons) {
			var pokemon = this.pokemons[n]
			if (!forms[pokemon.id - 1]) {
				if (!pokemon.forms) {
					forms[pokemon.id - 1] = [{ id: pokemon.id, form: pokemon.form }]
					continue
				}
				forms[pokemon.id - 1] = []
				for (var i in pokemon.forms) {
					forms[pokemon.id - 1].push({ id: pokemon.id, form: pokemon.forms[i] })
				}
			}
		}
		return forms
	}

	getBreedables(parentPokemons) {
		var breedables = []
		for (var n in parentPokemons) {
			var pokemon = parentPokemons[n]
			if (!pokemon.eggs)
				continue
			for (var i in pokemon.eggs) {
				//TODO: minior...
				var egg = pokemon.eggs[i]
				var baby = this.getPokemonFrom(egg)
				baby.ivs = pokemon.ivs
				if (this.nearPerfectIvCount(baby.ivs) < 4)
					continue
				baby.nature = pokemon.nature
				var hidden = pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.split("(")[0].trim().toLowerCase() : false
				if (hidden)
					baby.ability = baby.abilities[2]
				else
					baby.ability = pokemon.abilities[0] + (pokemon.abilities[1] ? " · " + pokemon.abilities[1] : "")
				baby.learntMoves = pokemon.learntMoves.filter(e => baby.moves.filter(o => e.split("(")[0].trim() == o.name && o.method == "egg").length)
				baby.balls = pokemon.balls.filter(e => e)
				var existing = breedables.filter(e => e.id == baby.id && e.form == baby.form && e.ability == baby.ability && e.nature == baby.nature)[0]
				if (existing) {
					existing.balls = this.uniqueBy(existing.balls.concat(baby.balls), e => e)
					existing.learntMoves = this.uniqueBy(existing.learntMoves.concat(baby.learntMoves), e => e)
				}
				else
					breedables.push(baby)
			}
		}
		return breedables
	}

	uniqueBy(list, key) {
		var seen = {};
		return list.filter(function (item) {
			var k = key(item);
			return seen.hasOwnProperty(k) ? false : (seen[k] = true);
		})
	}

	nearPerfectIvCount(ivs) {
		var count = 0
		for (var i in ivs)
			if (ivs[i] >= 30)
				count++
		return count
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
