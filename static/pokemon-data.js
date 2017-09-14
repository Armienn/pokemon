"use strict";

class Pokemon {
	constructor(pokemon) {
		if (pokemon) {
			this.base = pokemon
			this.id = pokemon.id
			this.name = pokemon.name
			this.form = pokemon.form
		}
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
		this.types = {
			Normal: { strengths: [], weaknesses: ["Fighting"], immunities: ["Ghost"] },
			Fire: { strengths: ["Bug", "Fairy", "Fire", "Grass", "Ice", "Steel"], weaknesses: ["Ground", "Rock", "Water"], immunities: [] },
			Water: { strengths: ["Fire", "Ice", "Steel", "Water"], weaknesses: ["Electric", "Grass"], immunities: [] },
			Electric: { strengths: ["Electric", "Flying", "Steel"], weaknesses: ["Ground"], immunities: [] },
			Grass: { strengths: ["Electric", "Grass", "Water", "Ground"], weaknesses: ["Bug", "Fire", "Flying", "Ice", "Poison"], immunities: [] },
			Ice: { strengths: ["Ice"], weaknesses: ["Fighting", "Fire", "Rock", "Steel"], immunities: [] },
			Fighting: { strengths: ["Bug", "Dark", "Rock"], weaknesses: ["Fairy", "Flying", "Psychic"], immunities: [] },
			Poison: { strengths: ["Bug", "Fairy", "Fighting", "Grass", "Poison"], weaknesses: ["Ground", "Psychic"], immunities: [] },
			Ground: { strengths: ["Poison", "Rock"], weaknesses: ["Grass", "Ice", "Water"], immunities: ["Electric"] },
			Flying: { strengths: ["Bug", "Fighting", "Grass"], weaknesses: ["Electric", "Ice", "Rock"], immunities: ["Ground"] },
			Psychic: { strengths: ["Fighting", "Psychic"], weaknesses: ["Bug", "Dark", "Ghost"], immunities: [] },
			Bug: { strengths: ["Fighting", "Grass", "Ground"], weaknesses: ["Fire", "Flying", "Rock"], immunities: [] },
			Rock: { strengths: ["Fire", "Flying", "Normal", "Poison"], weaknesses: ["Fighting", "Grass", "Ground", "Steel", "Water"], immunities: [] },
			Ghost: { strengths: ["Bug", "Poison"], weaknesses: ["Dark", "Ghost"], immunities: ["Fighting", "Normal"] },
			Dragon: { strengths: ["Electric", "Fire", "Grass", "Water"], weaknesses: ["Dragon", "Fairy", "Ice"], immunities: [] },
			Dark: { strengths: ["Dark", "Ghost"], weaknesses: ["Bug", "Fairy", "Fighting"], immunities: ["Psychic"] },
			Steel: { strengths: ["Bug", "Dragon", "Fairy", "Flying", "Grass", "Ice", "Normal", "Psychic", "Rock", "Steel"], weaknesses: ["Fighting", "Fire", "Ground"], immunities: ["Poison"] },
			Fairy: { strengths: ["Bug", "Dark", "Fighting"], weaknesses: ["Poison", "Steel"], immunities: ["Dragon"] }
		}
		this.typeNames = [
			"Bug",
			"Dark",
			"Dragon",
			"Electric",
			"Fairy",
			"Fighting",
			"Fire",
			"Flying",
			"Ghost",
			"Grass",
			"Ground",
			"Ice",
			"Normal",
			"Poison",
			"Psychic",
			"Rock",
			"Steel",
			"Water"
		]
		this.eggGroupNames = [
			"Monster",
			"Water 1",
			"Water 2",
			"Water 3",
			"Human-Like",
			"Bug",
			"Mineral",
			"Flying",
			"Amorphous",
			"Field",
			"Fairy",
			"Ditto",
			"Grass",
			"Dragon",
			"Undiscovered"
		]
		this.natures = {
			"Adamant": { "positive": "Attack", "negative": "Sp. Atk" },
			"Bashful": { "positive": "Sp. Atk", "negative": "Sp. Atk" },
			"Bold": { "positive": "Defense", "negative": "Attack" },
			"Brave": { "positive": "Attack", "negative": "Speed" },
			"Calm": { "positive": "Sp. Def", "negative": "Attack" },
			"Careful": { "positive": "Sp. Def", "negative": "Sp. Atk" },
			"Docile": { "positive": "Defense", "negative": "Defense" },
			"Gentle": { "positive": "Sp. Def", "negative": "Defense" },
			"Hardy": { "positive": "Attack", "negative": "Attack" },
			"Hasty": { "positive": "Speed", "negative": "Defense" },
			"Impish": { "positive": "Defense", "negative": "Sp. Atk" },
			"Jolly": { "positive": "Speed", "negative": "Sp. Atk" },
			"Lax": { "positive": "Defense", "negative": "Sp. Def" },
			"Lonely": { "positive": "Attack", "negative": "Defense" },
			"Mild": { "positive": "Sp. Atk", "negative": "Defense" },
			"Modest": { "positive": "Sp. Atk", "negative": "Attack" },
			"Naive": { "positive": "Speed", "negative": "Sp. Def" },
			"Naughty": { "positive": "Attack", "negative": "Sp. Def" },
			"Quiet": { "positive": "Sp. Atk", "negative": "Speed" },
			"Quirky": { "positive": "Sp. Def", "negative": "Sp. Def" },
			"Rash": { "positive": "Sp. Atk", "negative": "Sp. Def" },
			"Relaxed": { "positive": "Defense", "negative": "Speed" },
			"Sassy": { "positive": "Sp. Def", "negative": "Speed" },
			"Serious": { "positive": "Speed", "negative": "Speed" },
			"Timid": { "positive": "Speed", "negative": "Attack" }
		}
	}

	findPokemon(id, form){
		var pokemon = new Pokemon()
		pokemon.id = id
		var possiblePokes = this.pokemons.filter(e => id == e.id)
		if(possiblePokes.length == 0)
			 return null
		pokemon.base = possiblePokes[0]
		if(possiblePokes[0].forms)
			pokemon.form = this.findBestFormFit(possiblePokes[0].forms, form)
		else
			pokemon.form = "Base"
		if (possiblePokes.length > 1) {
			var possibleForms = possiblePokes.filter(e => e.form == pokemon.form)
			if(possibleForms.length == 1)
				pokemon.base = possibleForms[0]
		}
		pokemon.name = pokemon.base.name
		return pokemon
	}
	
	findBestFormFit(forms, form){
		if(!form)
			return forms[0]
		var fits = forms.filter(e=>e.toLowerCase()==form.toLowerCase())
		if(fits.length)
			return fits[0]
		fits = []
		var words = form.split(" ")
		var highestCount = 0
		for(var i in forms){
			var count = 0
			for(var j in words)
				if(forms[i].toLowerCase().indexOf(words[j].toLowerCase()) > -1)
					count++
			if (count > highestCount){
				fits = [forms[i]]
				highestCount = count
			} else if (count == highestCount)
				fits.push(forms[i])
		}
		if(fits.length)
			return fits[0]
		return forms[0]
	}
	
	getPokemonFrom(idformthing){
		if(!idformthing.id && idformthing.name){
			var possiblePokes = this.pokemons.filter(e => idformthing.name.toLowerCase() == e.name.toLowerCase())
			if(possiblePokes.length)
				idformthing.id = possiblePokes[0].id
			else
				return false
		}
		return this.findPokemon(idformthing.id, idformthing.form)
	}
}
