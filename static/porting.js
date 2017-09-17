"use strict";

class Porting {
	static exportJSON(pokemons) {
		var list = []
		for (var n in pokemons) {
			var pokemon = pokemons[n]
			var base = pokemon.base
			delete pokemon.base
			list.push(JSON.parse(JSON.stringify(pokemon)))
			pokemon.base = base
		}
		return JSON.stringify(list)
	}

	static importJSON(input) {
		var pokemons = []
		var list = JSON.parse(input)
		for (var n in list)
			pokemons.push(new Pokemon(list[n]))
		return pokemons
	}
	
	static importSmogon(input) {
		var pokemons = []
		var list = input.trim().split("\n\n")
		for (var n in list)
			if(list[n].trim().length)
				pokemons.push(Porting.parseSmogonPokemon(list[n]))
		return pokemons
	}
	
	static parseSmogonPokemon(input) {
		var parts = input.trim().split("\n")
		var pokemon = new Pokemon({name:parts[0].split("@")[0].trim()})
		pokemon.ability = parts[1].split(":")[1].trim()
		var evParts = parts[2].split(":")[1].split("/")
		pokemon.ivs = {hp:"31",atk:"31",def:"31",spa:"31",spd:"31",spe:"31"}
		pokemon.evs = {hp:"0",atk:"0",def:"0",spa:"0",spd:"0",spe:"0"}
		for(var i in evParts){
				var ev = evParts[i].trim().split(" ")
				pokemon.evs[ev[1].toLowerCase()] = ev[0]
		}
		pokemon.nature = parts[3].trim().split(" ")[0]
		pokemon.learntMoves = []
		for(var i=4;i<parts.length && i<8;i++)
				pokemon.learntMoves.push(parts[i].split("-")[1].trim())
		return pokemon
	}

	static exportMarkdown(pokemons) {
		var table = `Pokemon| Ability| Nature| IVs| Moves| Pokeball
---|---|----|----|----|----
`
		for (var n in pokemons) {
			var pokemon = pokemons[n]
			table += (pokemon.shiny ? "★ " : "") +
				PokeText.formName(pokemon) +
				(pokemon.gender ? " " + pokemon.gender : "") +
				(pokemon.amount ? " (" + pokemon.amount + ")" : "") + "| "
			if (pokemon.ability)
				table += pokemon.ability
			table += "| "
			if (pokemon.nature)
				table += pokemon.nature
			table += "| "
			if (pokemon.ivs)
				table += pokemon.ivs.hp + "/" + pokemon.ivs.atk + "/" + pokemon.ivs.def + "/" +
					pokemon.ivs.spa + "/" + pokemon.ivs.spd + "/" + pokemon.ivs.spe
			table += "| "
			if (pokemon.learntMoves)
				table += pokemon.learntMoves.join(", ")
			table += "| "
			for (var i in pokemon.balls)
				table += "[](/" + pokemon.balls[i].replace(" ", "").replace("é", "e").toLowerCase() + ") "
			table += "\n"
		}
		return table
	}
}
