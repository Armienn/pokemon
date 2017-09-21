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

	static get tableSetup() {
		return {
			pokemon: {
				states: ["Pokémon", "Pokémon + form"],
				header: "Pokémon", entry: (p, s) => {
					if (s != "Pokémon + form" || p.form == "Base")
						return p.name
					return p.name + " (" + p.form + ")"
				}
			},
			id: { header: "ID" },
			form: { header: "Form" },
			nature: { header: "Nature" },
			ability: { header: "Ability" },
			ivs: {
				states: ["IVs - Combined", "IVs - Individual"],
				header: (s) => s == "IVs - Combined" ?
					"IVs" :
					["HP IV", "Atk IV", "Def IV", "SpA IV", "SpD IV", "Spe IV"],
				entry: (p, s) => {
					if (!p.ivs)
						return s == "IVs - Combined" ? "" : ["", "", "", "", "", ""]
					return s == "IVs - Combined" ?
						p.ivs.hp + "/" + p.ivs.atk + "/" + p.ivs.def + "/" + p.ivs.spa + "/" + p.ivs.spd + "/" + p.ivs.spe :
						[p.ivs.hp, p.ivs.atk, p.ivs.def, p.ivs.spa, p.ivs.spd, p.ivs.spe]
				}
			},
			evs: {
				states: ["EVs - Combined", "EVs - Individual"],
				header: (s) => s == "EVs - Combined" ?
					"EVs" :
					["HP EV", "Atk EV", "Def EV", "SpA EV", "SpD EV", "Spe EV"],
				entry: (p, s) => {
					if (!p.evs)
						return s == "EVs - Combined" ? "" : ["", "", "", "", "", ""]
					return s == "EVs - Combined" ?
						p.evs.hp + "/" + p.evs.atk + "/" + p.evs.def + "/" + p.evs.spa + "/" + p.evs.spd + "/" + p.evs.spe :
						[p.evs.hp, p.evs.atk, p.evs.def, p.evs.spa, p.evs.spd, p.evs.spe]
				}
			},
			hiddenPower: { header: "Hidden Power" },
			learntMoves: {
				states: ["Moves - Combined", "Moves - Individual"],
				header: (s) => s == "Moves - Combined" ?
					"Moves" :
					["Move 1", "Move 2", "Move 3", "Move 4"],
				entry: (p, s) => {
					if (!p.learntMoves)
						return s == "Moves - Combined" ? "" : ["", "", "", ""]
					return s == "Moves - Combined" ?
						p.learntMoves.join(" / ") :
						[p.learntMoves[0], p.learntMoves[1], p.learntMoves[2], p.learntMoves[3]]
				}
			},
			gender: { header: "Gender" },
			amount: { header: "Quantity" },
			shiny: { header: "Shiny", entry: (p) => p.shiny ? "★" : "" },
			nickname: { header: "Nickname" },
			ot: { header: "OT" },
			tid: { header: "TID" },
			level: { header: "Level" },
			language: { header: "Language" },
			notes: { header: "Notes" },
			balls: {
				states: ["Balls - Combined", "Balls - Individual"],
				header: (s) => s == "Balls - Combined" ?
					"Balls" :
					stuff.data.pokeballs,
				entry: (p, s) => Porting.ballEntry(p, s)
			}
		}
	}

	static ballEntry(p, s) {
		if (s == "Balls - Combined") {
			if (!p.balls)
				return ""
			return p.balls.join(" / ")
		}
		var list = []
		list[stuff.data.pokeballs.length - 1] = ""
		if (!p.balls)
			return list
		for (var i in stuff.data.pokeballs) {
			var fit = p.balls.filter((e) => e.toLowerCase().replace("é", "e").indexOf(stuff.data.pokeballs[i].toLowerCase().replace("é", "e")) > -1)
			list[i] = ""
			if (fit.length)
				list[i] = "x"
		}
		return list
	}

	static exportMarkdownTable(pokemons) {
		var separator = "|"
		var table = Porting.createTable(pokemons, {
			ability: {
				header: "Ability", entry: (p) => {
					if (!p.ability)
						return
					var hidden = p.abilities[2] ? p.abilities[2].toLowerCase() == p.ability.split("(")[0].trim().toLowerCase() : false
					if (hidden)
						return "*" + p.ability + "*"
					return p.ability
				}
			},
			balls: {
				states: ["Balls - Combined", "Balls - Individual"],
				header: (s) => s == "Balls - Combined" ?
					"Balls" :
					stuff.data.pokeballs,
				entry: (p, s) => {
					var balls = []
					for (var i in p.balls)
						balls[i] = " [](/" + p.balls[i].replace(" ", "").replace("é", "e").toLowerCase() + ") "
					return Porting.ballEntry({ balls: balls }, s)
				}
			}
		})
		var sub = []
		for (var i in table[0])
			sub[i] = "-".repeat(table[0][i].length)
		table.splice(1, 0, sub)
		for (var i in table) {
			for (var j in table[i]) {
				var val = table[i][j]
				if (!val)
					val = ""
				table[i][j] = ("" + val).replace(new RegExp(separator, "g"), "")
			}
			table[i] = table[i].join(separator)
		}
		table = table.join("\n")
		return table
	}

	static exportTable(pokemons, separator) {
		var table = Porting.createTable(pokemons)
		for (var i in table) {
			for (var j in table[i]) {
				var val = table[i][j]
				if (!val)
					val = ""
				table[i][j] = ("" + val).replace(new RegExp(separator, "g"), "")
			}
			table[i] = table[i].join(separator)
		}
		table = table.join("\n")
		return table
	}

	static createTable(pokemons, alternateSetup) {
		var setup = Porting.tableSetup
		for (var i in alternateSetup)
			setup[i] = alternateSetup[i]
		var table = [Porting.createTableHeader(setup)]
		for (var i in pokemons)
			table.push(Porting.createTableEntry(pokemons[i], setup))
		return table
	}

	static createTableHeader(setup) {
		var header = []
		for (var i in stuff.settings.tableSetup) {
			var column = stuff.settings.tableSetup[i]
			if (!column.state)
				continue
			var head = setup[column.thing].header
			if (typeof head != "string")
				head = head(column.state)
			if (typeof head == "string") {
				header.push(head)
				continue
			}
			for (var j in head)
				header.push(head[j])
		}
		return header
	}

	static createTableEntry(pokemon, setup) {
		var entry = []
		for (var i in stuff.settings.tableSetup) {
			var column = stuff.settings.tableSetup[i]
			if (!column.state)
				continue
			if (!setup[column.thing].entry) {
				entry.push(pokemon[column.thing])
				continue
			}
			var text = setup[column.thing].entry(pokemon, column.state)
			if (typeof text == "string") {
				entry.push(text)
				continue
			}
			for (var j in text)
				entry.push(text[j])
		}
		return entry
	}

	static importTable(input, separator) {
		var rows = input.trim().split("\n")
		var table = []
		for (var i in rows)
			table.push(rows[i].split(separator))
		for (var i in table[0])
			table[0][i] = table[0][i].toLowerCase().replace(/\s+/g, "") // strip whitespace
		return Porting.parseTable(table)
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

	static findExisting(value, possibilities) {
		if (!value)
			return value
		for (var i in possibilities)
			if (value.toLowerCase().trim().indexOf(possibilities[i].toLowerCase()) > -1)
				return possibilities[i]
		return value
	}

	static parsePokemonTableEntry(entry, headers) {
		var id = Number(Porting.find(entry, headers, ["dexno", "no", "number", "id"]))
		var name = Porting.find(entry, headers, ["pokemon", "pokémon", "name"])
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
		pokemon.nature = Porting.findExisting(pokemon.nature, Object.keys(stuff.data.natures))
		pokemon.ability = Porting.find(entry, headers, ["ability"])
		pokemon.ability = Porting.findExisting(pokemon.ability, pokemon.abilities.filter((e) => e))
		pokemon.ivs = {}
		var ivs = Porting.find(entry, headers, ["ivs", "iv"])
		if (ivs) {
			var split = ivs.split("/")
			if (split.length < 2)
				split = ivs.split(",")
			pokemon.ivs = { hp: split[0], atk: split[1], def: split[2], spa: split[3], spd: split[4], spe: split[5] }
		}
		pokemon.ivs.hp = Porting.find(entry, headers, ["hpiv", "ivhp", "hp"]) || pokemon.ivs.hp || "x"
		pokemon.ivs.atk = Porting.find(entry, headers, ["atkiv", "attackiv", "attack", "ivattack", "ivatk", "atk"]) || pokemon.ivs.atk || "x"
		pokemon.ivs.def = Porting.find(entry, headers, ["defiv", "defenseiv", "defense", "ivdefense", "ivdef", "def"]) || pokemon.ivs.def || "x"
		pokemon.ivs.spa = Porting.find(entry, headers, ["spaiv", "spatkiv", "spatk", "ivspatk", "ivspa", "spa"]) || pokemon.ivs.spa || "x"
		pokemon.ivs.spd = Porting.find(entry, headers, ["spdiv", "spdefiv", "spdef", "ivspdef", "ivspd", "spd"]) || pokemon.ivs.spd || "x"
		pokemon.ivs.spe = Porting.find(entry, headers, ["speiv", "speediv", "speed", "ivspeed", "ivspe", "spe"]) || pokemon.ivs.spe || "x"
		pokemon.evs = {}
		var evs = Porting.find(entry, headers, ["evs", "ev"])
		if (evs) {
			var split = evs.split("/")
			if (split.length < 2)
				split = evs.split(",")
			pokemon.evs = { hp: split[0], atk: split[1], def: split[2], spa: split[3], spd: split[4], spe: split[5] }
		}
		pokemon.evs.hp = Porting.find(entry, headers, ["hpev", "evhp"]) || pokemon.evs.hp || "x"
		pokemon.evs.atk = Porting.find(entry, headers, ["atkev", "attackev", "evattack", "evatk"]) || pokemon.evs.atk || "x"
		pokemon.evs.def = Porting.find(entry, headers, ["defev", "defenseev", "evdefense", "evdef"]) || pokemon.evs.def || "x"
		pokemon.evs.spa = Porting.find(entry, headers, ["spaev", "spatkev", "evspatk", "evspa"]) || pokemon.evs.spa || "x"
		pokemon.evs.spd = Porting.find(entry, headers, ["spdev", "spdefev", "evspdef", "evspd"]) || pokemon.evs.spd || "x"
		pokemon.evs.spe = Porting.find(entry, headers, ["speev", "speedev", "evspeed", "evspe"]) || pokemon.evs.spe || "x"
		pokemon.hiddenPower = Porting.find(entry, headers, ["hiddenpower", "hidden"])
		pokemon.learntMoves = []
		var moves = Porting.find(entry, headers, ["moves", "eggmoves"])
		if (moves) {
			var split = moves.split(", ")
			if (split.length < 2)
				split = moves.split("/")
			moves = split
			for (var i in moves)
				moves[i] = moves[i].trim()
			pokemon.learntMoves = moves.filter(e => e)
		}
		if (!pokemon.learntMoves.length) {
			pokemon.learntMoves = [
				Porting.find(entry, headers, ["move1", "eggmove1", "moveslot1"]),
				Porting.find(entry, headers, ["move2", "eggmove2", "moveslot2"]),
				Porting.find(entry, headers, ["move3", "eggmove3", "moveslot3"]),
				Porting.find(entry, headers, ["move4", "eggmove4", "moveslot4"])
			].filter(e => e)
		}
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

		pokemon.amount = Porting.find(entry, headers, ["amount", "count", "quantity"])
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
			var split = balls.split(",")
			if (split.length < 2)
				split = balls.split("[](/")
			if (split.length < 2)
				split = balls.split("/")
			balls = split
			for (var i in balls)
				balls[i] = balls[i].trim()
			pokemon.balls = balls.filter(e => e)
		}
		if (pokemon.balls.length == 0) {
			for (var i in stuff.data.pokeballs) {
				var ball = Porting.find(entry, headers, [stuff.data.pokeballs[i].toLowerCase()])
				if (ball) pokemon.balls.push(stuff.data.pokeballs[i])
			}
			if (Porting.find(entry, headers, ["poke"])) pokemon.balls.push("Poké Ball")
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
		for (var i in pokemon.balls) {
			pokemon.balls[i] = Porting.findExisting(pokemon.balls[i].trim(), ["poke"].concat(stuff.data.pokeballs))
			if (!pokemon.balls[i].endsWith("all"))
				pokemon.balls[i] += " Ball"
		}
		return pokemon
	}

	static fullBackupScript() {
		var output = "var tabs = {"
		for (var i in stuff.collection.local) {
			var tab = stuff.collection.local[i]
			output += "\n  \"" + tab.title + "\":" + stuff.optionsSection.exportMethods["JSON"].method(tab.pokemons) + ",\n"
		}
		output += `}
for(var i in tabs){
  var tab = stuff.collection.getLocalTab(i)
  if(tab)
    tab.pokemons = []
  else
    tab = stuff.collection.addLocalTab(i)
  for(var j in tabs[i])
    tab.pokemons.push(new Pokemon(tabs[i][j]))
}
stuff.collection.saveLocalTabs()`
		return output
	}

	static fullExportScript() {
		var output = `stuff.headerSection.title = "Unknown's Pokémon Stuff"
stuff.headerSection.titleLink = "https://armienn.github.io/pokemon"
stuff.headerSection.subtitle = "FC: ?"
var tabs = {`
		for (var i in stuff.collection.local) {
			var tab = stuff.collection.local[i]
			output += "\n  \"" + tab.title + "\":" + stuff.optionsSection.exportMethods["JSON"].method(tab.pokemons) + ",\n"
		}
		output += `}
for(var i in tabs){
	var tab = stuff.collection.addTab(i)
	for(var j in tabs[i])
		tab.pokemons.push(new Pokemon(tabs[i][j]))
}`
		return output
	}
}
