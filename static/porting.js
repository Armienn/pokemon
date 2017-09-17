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
