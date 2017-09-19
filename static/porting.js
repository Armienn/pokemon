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
			if (list[n].trim().length)
				pokemons.push(Porting.parseSmogonPokemon(list[n]))
		return pokemons
	}

	static parseSmogonPokemon(input) {
		var parts = input.trim().split("\n")
		var pokemon = new Pokemon({ name: parts[0].split("@")[0].trim() })
		pokemon.ability = parts[1].split(":")[1].trim()
		var evParts = parts[2].split(":")[1].split("/")
		pokemon.ivs = { hp: "31", atk: "31", def: "31", spa: "31", spd: "31", spe: "31" }
		pokemon.evs = { hp: "0", atk: "0", def: "0", spa: "0", spd: "0", spe: "0" }
		for (var i in evParts) {
			var ev = evParts[i].trim().split(" ")
			pokemon.evs[ev[1].toLowerCase()] = ev[0]
		}
		pokemon.nature = parts[3].trim().split(" ")[0]
		pokemon.learntMoves = []
		for (var i = 4; i < parts.length && i < 8; i++)
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

	static parseTable(table) {
		var pokemons = []
		for (var i = 1; i < table.length; i++) {
			var pokemon = Porting.parsePokemonTableEntry(table[i], table[0])
			if (pokemon)
				pokemons.push(pokemon)
		}
		return pokemons
	}

	static find(entry, headers, values) {
		for (var i in values)
			for (var j in headers)
				if (headers[j] == values[i])
					return typeof entry[j] == "string" ? entry[j].trim() : entry[j]
	}

	static parsePokemonTableEntry(entry, headers) {
		var id = Number(Porting.find(entry, headers, ["dexno", "no", "number", "id"]))
		var name = Porting.find(entry, headers, ["pokemon", "name"])
		var form = Porting.find(entry, headers, ["form"])
		if (name) {
			var splitName = name.split("(")
			if (1 < splitName.length) {
				name = splitName[0].trim()
				if (!form)
					form = splitName[1].split(")")[0].trim()
			}
		}
		var pokemon = stuff.data.getPokemonFrom({ name: name, id: id, form: form })
		if (!pokemon)
			return
		pokemon.nature = Porting.find(entry, headers, ["nature"])
		pokemon.ability = Porting.find(entry, headers, ["ability"])
		pokemon.ivs = {}
		pokemon.ivs.hp = Porting.find(entry, headers, ["hpiv", "ivhp", "hp"]) || "x"
		pokemon.ivs.atk = Porting.find(entry, headers, ["atkiv", "attackiv", "attack", "ivattack", "ivatk", "atk"]) || "x"
		pokemon.ivs.def = Porting.find(entry, headers, ["defiv", "defenseiv", "defense", "ivdefense", "ivdef", "def"]) || "x"
		pokemon.ivs.spa = Porting.find(entry, headers, ["spaiv", "spatkiv", "spatk", "ivspatk", "ivspa", "spa"]) || "x"
		pokemon.ivs.spd = Porting.find(entry, headers, ["spdiv", "spdefiv", "spdef", "ivspdef", "ivspd", "spd"]) || "x"
		pokemon.ivs.spe = Porting.find(entry, headers, ["speiv", "speediv", "speed", "ivspeed", "ivspe", "spe"]) || "x"
		pokemon.evs = {}
		pokemon.evs.hp = Porting.find(entry, headers, ["hpev", "evhp"]) || "x"
		pokemon.evs.atk = Porting.find(entry, headers, ["atkev", "attackev", "evattack", "evatk"]) || "x"
		pokemon.evs.def = Porting.find(entry, headers, ["defev", "defenseev", "evdefense", "evdef"]) || "x"
		pokemon.evs.spa = Porting.find(entry, headers, ["spaev", "spatkev", "evspatk", "evspa"]) || "x"
		pokemon.evs.spd = Porting.find(entry, headers, ["spdev", "spdefev", "evspdef", "evspd"]) || "x"
		pokemon.evs.spe = Porting.find(entry, headers, ["speev", "speedev", "evspeed", "evspe"]) || "x"
		pokemon.hiddenPower = Porting.find(entry, headers, ["hiddenpower", "hidden"])
		pokemon.learntMoves = [
			Porting.find(entry, headers, ["move1", "eggmove1", "moveslot1"]),
			Porting.find(entry, headers, ["move2", "eggmove2", "moveslot2"]),
			Porting.find(entry, headers, ["move3", "eggmove3", "moveslot3"]),
			Porting.find(entry, headers, ["move4", "eggmove4", "moveslot4"])
		].filter(e => e)
		pokemon.gender = Porting.find(entry, headers, ["gender", "sex", "mf", "fm"])
		switch (pokemon.base.ratio) {
			case "1:0":
				pokemon.gender = '♂'
				break
			case "0:1":
				pokemon.gender = '♀'
				break
			case "—":
				pokemon.gender = '—'
				break
		}
		if (pokemon.gender) {
			if (pokemon.gender.indexOf("♂") > -1 || pokemon.gender.toLowerCase() == "m" || pokemon.gender.toLowerCase() == "male")
				pokemon.gender = "♂"
			if (pokemon.gender.indexOf("♀") > -1 || pokemon.gender.toLowerCase() == "f" || pokemon.gender.toLowerCase() == "female")
				pokemon.gender = "♀"
			if (pokemon.gender.toLowerCase() == "-" || pokemon.gender.toLowerCase() == "none")
				pokemon.gender = '—'
		}

		pokemon.amount = Porting.find(entry, headers, ["amount", "count"])
		pokemon.shiny = Porting.find(entry, headers, ["shiny"])
		pokemon.nickname = Porting.find(entry, headers, ["nickname"])
		pokemon.ot = Porting.find(entry, headers, ["ot"])
		pokemon.tid = Porting.find(entry, headers, ["tid"])
		pokemon.level = Porting.find(entry, headers, ["level", "lvl", "lv"])
		pokemon.language = Porting.find(entry, headers, ["language", "lang"])
		pokemon.notes = Porting.find(entry, headers, ["notes", "note", "comments", "comment"])
		pokemon.balls = []
		var balls = Porting.find(entry, headers, ["pokeball", "ball", "pokeballs", "balls"])
		if (balls) {
			balls = balls.split(",")
			for (var i in balls)
				balls[i] = balls[i].trim()
			pokemon.balls = balls.filter(e => e)
		}
		if (pokemon.balls.length == 0) {
			if (Porting.find(entry, headers, ["poke"])) pokemon.balls.push("Poké Ball")
			if (Porting.find(entry, headers, ["great"])) pokemon.balls.push("Great Ball")
			if (Porting.find(entry, headers, ["ultra"])) pokemon.balls.push("Ultra Ball")
			if (Porting.find(entry, headers, ["master"])) pokemon.balls.push("Master Ball")
			if (Porting.find(entry, headers, ["safari"])) pokemon.balls.push("Safari Ball")
			if (Porting.find(entry, headers, ["level"])) pokemon.balls.push("Level Ball")
			if (Porting.find(entry, headers, ["lure"])) pokemon.balls.push("Lure Ball")
			if (Porting.find(entry, headers, ["moon"])) pokemon.balls.push("Moon Ball")
			if (Porting.find(entry, headers, ["friend"])) pokemon.balls.push("Friend Ball")
			if (Porting.find(entry, headers, ["love"])) pokemon.balls.push("Love Ball")
			if (Porting.find(entry, headers, ["heavy"])) pokemon.balls.push("Heavy Ball")
			if (Porting.find(entry, headers, ["fast"])) pokemon.balls.push("Fast Ball")
			if (Porting.find(entry, headers, ["sport"])) pokemon.balls.push("Sport Ball")
			if (Porting.find(entry, headers, ["premier"])) pokemon.balls.push("Premier Ball")
			if (Porting.find(entry, headers, ["repeat"])) pokemon.balls.push("Repeat Ball")
			if (Porting.find(entry, headers, ["timer"])) pokemon.balls.push("Timer Ball")
			if (Porting.find(entry, headers, ["nest"])) pokemon.balls.push("Nest Ball")
			if (Porting.find(entry, headers, ["net"])) pokemon.balls.push("Net Ball")
			if (Porting.find(entry, headers, ["dive"])) pokemon.balls.push("Dive Ball")
			if (Porting.find(entry, headers, ["luxury"])) pokemon.balls.push("Luxury Ball")
			if (Porting.find(entry, headers, ["heal"])) pokemon.balls.push("Heal Ball")
			if (Porting.find(entry, headers, ["quick"])) pokemon.balls.push("Quick Ball")
			if (Porting.find(entry, headers, ["dusk"])) pokemon.balls.push("Dusk Ball")
			if (Porting.find(entry, headers, ["cherish"])) pokemon.balls.push("Cherish Ball")
			if (Porting.find(entry, headers, ["dream"])) pokemon.balls.push("Dream Ball")
			if (Porting.find(entry, headers, ["beast"])) pokemon.balls.push("Beast Ball")
		}
		if (pokemon.balls.length == 0) { // compatibility with richi3f's sheet
			if (Porting.find(entry, headers, ["_dcgjs"])) pokemon.balls.push("Poké Ball")
			if (Porting.find(entry, headers, ["_ddv49"])) pokemon.balls.push("Great Ball")
			if (Porting.find(entry, headers, ["_d415a"])) pokemon.balls.push("Ultra Ball")
			if (Porting.find(entry, headers, ["_d5fpr"])) pokemon.balls.push("Master Ball")
			if (Porting.find(entry, headers, ["_d6ua4"])) pokemon.balls.push("Safari Ball")
			if (Porting.find(entry, headers, ["_d88ul"])) pokemon.balls.push("Level Ball")
			if (Porting.find(entry, headers, ["_dkvya"])) pokemon.balls.push("Lure Ball")
			if (Porting.find(entry, headers, ["_dmair"])) pokemon.balls.push("Moon Ball")
			if (Porting.find(entry, headers, ["_dnp34"])) pokemon.balls.push("Friend Ball")
			if (Porting.find(entry, headers, ["_dp3nl"])) pokemon.balls.push("Love Ball")
			if (Porting.find(entry, headers, ["_df9om"])) pokemon.balls.push("Heavy Ball")
			if (Porting.find(entry, headers, ["_dgo93"])) pokemon.balls.push("Fast Ball")
			if (Porting.find(entry, headers, ["_di2tg"])) pokemon.balls.push("Sport Ball")
			if (Porting.find(entry, headers, ["_djhdx"])) pokemon.balls.push("Premier Ball")
			if (Porting.find(entry, headers, ["_dw4je"])) pokemon.balls.push("Repeat Ball")
			if (Porting.find(entry, headers, ["_dxj3v"])) pokemon.balls.push("Timer Ball")
			if (Porting.find(entry, headers, ["_dyxo8"])) pokemon.balls.push("Nest Ball")
			if (Porting.find(entry, headers, ["_e0c8p"])) pokemon.balls.push("Net Ball")
			if (Porting.find(entry, headers, ["_dqi9q"])) pokemon.balls.push("Dive Ball")
			if (Porting.find(entry, headers, ["_drwu7"])) pokemon.balls.push("Luxury Ball")
			if (Porting.find(entry, headers, ["_dtbek"])) pokemon.balls.push("Heal Ball")
			if (Porting.find(entry, headers, ["_dupz1"])) pokemon.balls.push("Quick Ball")
			if (Porting.find(entry, headers, ["_e7d2q"])) pokemon.balls.push("Dusk Ball")
			if (Porting.find(entry, headers, ["_e8rn7"])) pokemon.balls.push("Cherish Ball")
			if (Porting.find(entry, headers, ["_ea67k"])) pokemon.balls.push("Dream Ball")
			if (Porting.find(entry, headers, ["_ebks1"])) pokemon.balls.push("Beast Ball")
		}
		return pokemon
	}
}
