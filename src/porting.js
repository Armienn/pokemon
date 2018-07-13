export function importSmogon(input) {
	var pokemons = []
	var list = input.trim().split("\n\n")
	for (var n in list)
		if (list[n].trim().length)
			pokemons.push(parseSmogonPokemon(list[n]))
	return pokemons
}

export function parseSmogonPokemon(input) {
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

function find(object, keys) {
	for (var key of keys)
		if (key in object)
			return typeof object[key] === "string" ? object[key].trim() : object[key]
}

function findExisting(value, possibilities) {
	if (!value)
		return value
	for (var i in possibilities)
		if (value.toLowerCase().indexOf(possibilities[i].toLowerCase()) > -1)
			return possibilities[i]
	return value
}

export function pokemonFromUnsanitised(object) {
	var id = Number(find(object, ["dexno", "no", "number", "id"]))
	var name = find(object, ["pokemon", "pokémon", "name"])
	var form = find(object, ["form"])
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
	pokemon.nature = find(object, ["nature"])
	pokemon.nature = findExisting(pokemon.nature, Object.keys(stuff.data.natures))
	pokemon.ability = find(object, ["ability"])
	pokemon.ability = findExisting(pokemon.ability, pokemon.abilities.filter((e) => e))
	pokemon.ivs = {}
	var ivs = find(object, ["ivs", "iv"])
	if (ivs) {
		var split = ivs.split("/")
		if (split.length < 2)
			split = ivs.split(",")
		pokemon.ivs = { hp: split[0], atk: split[1], def: split[2], spa: split[3], spd: split[4], spe: split[5] }
	}
	pokemon.ivs.hp = find(object, ["hpiv", "ivhp", "hp"]) || pokemon.ivs.hp || "x"
	pokemon.ivs.atk = find(object, ["atkiv", "attackiv", "attack", "ivattack", "ivatk", "atk"]) || pokemon.ivs.atk || "x"
	pokemon.ivs.def = find(object, ["defiv", "defenseiv", "defense", "ivdefense", "ivdef", "def"]) || pokemon.ivs.def || "x"
	pokemon.ivs.spa = find(object, ["spaiv", "spatkiv", "spatk", "ivspatk", "ivspa", "spa"]) || pokemon.ivs.spa || "x"
	pokemon.ivs.spd = find(object, ["spdiv", "spdefiv", "spdef", "ivspdef", "ivspd", "spd"]) || pokemon.ivs.spd || "x"
	pokemon.ivs.spe = find(object, ["speiv", "speediv", "speed", "ivspeed", "ivspe", "spe"]) || pokemon.ivs.spe || "x"
	pokemon.evs = {}
	var evs = find(object, ["evs", "ev"])
	if (evs) {
		var split = evs.split("/")
		if (split.length < 2)
			split = evs.split(",")
		pokemon.evs = { hp: split[0], atk: split[1], def: split[2], spa: split[3], spd: split[4], spe: split[5] }
	}
	pokemon.evs.hp = find(object, ["hpev", "evhp"]) || pokemon.evs.hp || "x"
	pokemon.evs.atk = find(object, ["atkev", "attackev", "evattack", "evatk"]) || pokemon.evs.atk || "x"
	pokemon.evs.def = find(object, ["defev", "defenseev", "evdefense", "evdef"]) || pokemon.evs.def || "x"
	pokemon.evs.spa = find(object, ["spaev", "spatkev", "evspatk", "evspa"]) || pokemon.evs.spa || "x"
	pokemon.evs.spd = find(object, ["spdev", "spdefev", "evspdef", "evspd"]) || pokemon.evs.spd || "x"
	pokemon.evs.spe = find(object, ["speev", "speedev", "evspeed", "evspe"]) || pokemon.evs.spe || "x"
	pokemon.hiddenPower = find(object, ["hiddenpower", "hidden"])
	pokemon.learntMoves = []
	var moves = find(object, ["moves", "eggmoves"])
	if (moves) {
		var split = moves.split(", ")
		if (split.length < 2)
			split = moves.split("/")
		moves = split
		pokemon.learntMoves = moves.map(e => e.trim()).filter(e => e)
	}
	if (!pokemon.learntMoves.length) {
		pokemon.learntMoves = [
			find(object, ["move1", "eggmove1", "moveslot1"]),
			find(object, ["move2", "eggmove2", "moveslot2"]),
			find(object, ["move3", "eggmove3", "moveslot3"]),
			find(object, ["move4", "eggmove4", "moveslot4"])
		].filter(e => e)
	}
	pokemon.gender = find(object, ["gender", "sex", "mf", "fm"])
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

	pokemon.amount = find(object, ["amount", "count", "quantity"])
	pokemon.shiny = find(object, ["shiny"])
	pokemon.nickname = find(object, ["nickname"])
	pokemon.ot = find(object, ["ot"])
	pokemon.tid = find(object, ["tid"])
	pokemon.level = find(object, ["level", "lvl", "lv"])
	pokemon.language = find(object, ["language", "lang"])
	pokemon.notes = find(object, ["notes", "note", "comments", "comment"])
	pokemon.balls = []
	var balls = find(object, ["pokeball", "ball", "pokeballs", "balls"])
	if (balls) {
		var split = balls.split(",")
		if (split.length < 2)
			split = balls.split("[](/")
		if (split.length < 2)
			split = balls.split("/")
		balls = split
		pokemon.balls = balls.map(e => e.trim()).filter(e => e)
	}
	if (pokemon.balls.length == 0) {
		for (var i in stuff.data.pokeballs) {
			var ball = find(object, [stuff.data.pokeballs[i].toLowerCase()])
			if (ball) pokemon.balls.push(stuff.data.pokeballs[i])
		}
		if (find(object, ["poke"])) pokemon.balls.push("Poké Ball")
	}
	if (pokemon.balls.length == 0) { // compatibility with richi3f's sheet 
		if (find(object, ["_dcgjs"])) pokemon.balls.push("Poké Ball")
		if (find(object, ["_ddv49"])) pokemon.balls.push("Great Ball")
		if (find(object, ["_d415a"])) pokemon.balls.push("Ultra Ball")
		if (find(object, ["_d5fpr"])) pokemon.balls.push("Master Ball")
		if (find(object, ["_d6ua4"])) pokemon.balls.push("Safari Ball")
		if (find(object, ["_d88ul"])) pokemon.balls.push("Level Ball")
		if (find(object, ["_dkvya"])) pokemon.balls.push("Lure Ball")
		if (find(object, ["_dmair"])) pokemon.balls.push("Moon Ball")
		if (find(object, ["_dnp34"])) pokemon.balls.push("Friend Ball")
		if (find(object, ["_dp3nl"])) pokemon.balls.push("Love Ball")
		if (find(object, ["_df9om"])) pokemon.balls.push("Heavy Ball")
		if (find(object, ["_dgo93"])) pokemon.balls.push("Fast Ball")
		if (find(object, ["_di2tg"])) pokemon.balls.push("Sport Ball")
		if (find(object, ["_djhdx"])) pokemon.balls.push("Premier Ball")
		if (find(object, ["_dw4je"])) pokemon.balls.push("Repeat Ball")
		if (find(object, ["_dxj3v"])) pokemon.balls.push("Timer Ball")
		if (find(object, ["_dyxo8"])) pokemon.balls.push("Nest Ball")
		if (find(object, ["_e0c8p"])) pokemon.balls.push("Net Ball")
		if (find(object, ["_dqi9q"])) pokemon.balls.push("Dive Ball")
		if (find(object, ["_drwu7"])) pokemon.balls.push("Luxury Ball")
		if (find(object, ["_dtbek"])) pokemon.balls.push("Heal Ball")
		if (find(object, ["_dupz1"])) pokemon.balls.push("Quick Ball")
		if (find(object, ["_e7d2q"])) pokemon.balls.push("Dusk Ball")
		if (find(object, ["_e8rn7"])) pokemon.balls.push("Cherish Ball")
		if (find(object, ["_ea67k"])) pokemon.balls.push("Dream Ball")
		if (find(object, ["_ebks1"])) pokemon.balls.push("Beast Ball")
	}
	for (var i in pokemon.balls) {
		pokemon.balls[i] = findExisting(pokemon.balls[i].trim(), ["poke"].concat(stuff.data.pokeballs))
		if (!pokemon.balls[i].endsWith("all"))
			pokemon.balls[i] += " Ball"
	}
	return pokemon
}
