"use strict";

class SpreadsheetParser {
	parse(spreadsheet) {
		stuff.collection.spreadsheetId = spreadsheet.id
		stuff.collection.collectorName = "Unknown"
		for (var i in spreadsheet.spreadsheet.feed.entry) {
			var entry = spreadsheet.spreadsheet.feed.entry[i]
			var title = this.getValue(entry.title).trim()
			if (title.toLowerCase().indexOf("[hide]") > -1 ||
				title.toLowerCase().indexOf("item") > -1 ||
				title.toLowerCase().indexOf("template") > -1 ||
				title.toLowerCase().indexOf("config") > -1 ||
				title.toLowerCase().indexOf("database") > -1 ||
				title.toLowerCase().indexOf("resource") > -1 ||
				title.toLowerCase() == "db"
			) {
				if (i == "0") {
					stuff.state.externalInventory.tabsLoaded["config"] = false
					requestJSON(this.getWorksheetUrl(spreadsheet.id, 1), (r) => { this.parseConfig(r) })
				}
				continue
			}
			this.addNewTab(title, i)
		}
		this.updateExternalInventoryLoadedness()
	}

	getWorksheetUrl(spreadsheetId, worksheetId) {
		return "https://spreadsheets.google.com/feeds/list/" + spreadsheetId + "/" + worksheetId + "/public/values?alt=json";
	}

	getSpreadsheetUrl(spreadsheetId) {
		return "https://spreadsheets.google.com/feeds/worksheets/" + spreadsheetId + "/public/basic?alt=json";
	}

	getValue(field) {
		if (field) return field.$t
		return undefined
	}

	tryValues(values, entry) {
		for (var i in values)
			if (entry["gsx$" + values[i]] && entry["gsx$" + values[i]].$t)
				return entry["gsx$" + values[i]].$t.trim()
		return undefined
	}

	addNewTab(title, index) {
		var tab
		if (title.toLowerCase().startsWith("lf") || title.toLowerCase().startsWith("looking for"))
			tab = stuff.collection.addLookingForTab(title, [], (+index) + 1)
		else
			tab = stuff.collection.addTab(title, [], (+index) + 1)
		stuff.state.externalInventory.tabsLoaded[tab.id] = false
		requestJSON(this.getWorksheetUrl(stuff.collection.spreadsheetId, tab.id), this.parseSheet(tab))
	}

	parseSheet(tab) {
		return (response) => {
			for (var i in response.feed.entry)
				this.loadPokemon(response.feed.entry[i], tab)
			if (tab.id == stuff.state.destination)
				stuff.selectTab(tab)
			stuff.state.externalInventory.tabsLoaded[tab.id] = true
			this.updateExternalInventoryLoadedness()
			stuff.tryLoad()
		}
	}

	updateExternalInventoryLoadedness() {
		if (stuff.state.externalInventory.tabsLoaded)
			for (var i in stuff.state.externalInventory.tabsLoaded)
				if (!stuff.state.externalInventory.tabsLoaded[i])
					return
		stuff.state.externalInventory.isLoaded = true
	}

	parseConfig(response) {
		var entry = response.feed.entry[0]
		stuff.collection.collectorName = this.tryValues(["ingamename"], entry)
		stuff.collection.collectorFriendCode = this.tryValues(["friendcode"], entry)
		stuff.collection.collectorUrl = this.tryValues(["contacturl"], entry)
		var showBreedables = this.tryValues(["showbreedables"], entry)
		stuff.settings.showBreedables = !!showBreedables && showBreedables.toLowerCase().trim() !== "no" && showBreedables.toLowerCase().trim() !== "false"
		var colorScheme = this.tryValues(["colorscheme"], entry).toLowerCase()
		if (colorScheme == "custom"){
			stuff.settings.colorScheme = colorScheme
			stuff.headerSection.navGroups.colours.custom = {
				text: "●",
				click: () => { stuff.settings.colorScheme = "custom"; stuff.updateColors() },
				active: () => stuff.settings.colorScheme == "custom",
				style: { fontSize: "1.2rem" }
			}
		}
		if ((colorScheme == "night" || colorScheme == "day") && !(localStorage && localStorage.colorScheme))
			stuff.settings.colorScheme = colorScheme
		stuff.settings.colorSchemes.custom[0] = this.tryValues(["custombackgroundcolor", "backgroundcolor"], entry)
		stuff.settings.colorSchemes.custom[1] = this.tryValues(["customtextcolor", "textcolor"], entry)
		stuff.settings.colorSchemes.custom[2] = this.tryValues(["customheadercolor", "headercolor"], entry)
		stuff.state.externalInventory.tabsLoaded["config"] = true
		this.updateExternalInventoryLoadedness()
		stuff.tryLoad()
	}

	loadPokemon(entry, tab) {
		var id = Number(this.tryValues(["dexno", "no", "number", "id"], entry))
		var name = this.tryValues(["pokemon", "name"], entry)
		var form = this.tryValues(["form"], entry)
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
		pokemon.nature = this.getValue(entry.gsx$nature)
		pokemon.ability = this.getValue(entry.gsx$ability)
		pokemon.ivs = {}
		pokemon.ivs.hp = this.tryValues(["hpiv", "ivhp", "hp"], entry) || "x"
		pokemon.ivs.atk = this.tryValues(["atkiv", "attackiv", "attack", "ivattack", "ivatk", "atk"], entry) || "x"
		pokemon.ivs.def = this.tryValues(["defiv", "defenseiv", "defense", "ivdefense", "ivdef", "def"], entry) || "x"
		pokemon.ivs.spa = this.tryValues(["spaiv", "spatkiv", "spatk", "ivspatk", "ivspa", "spa"], entry) || "x"
		pokemon.ivs.spd = this.tryValues(["spdiv", "spdefiv", "spdef", "ivspdef", "ivspd", "spd"], entry) || "x"
		pokemon.ivs.spe = this.tryValues(["speiv", "speediv", "speed", "ivspeed", "ivspe", "spe"], entry) || "x"
		pokemon.evs = {}
		pokemon.evs.hp = this.tryValues(["hpev", "evhp"], entry) || "x"
		pokemon.evs.atk = this.tryValues(["atkev", "attackev", "evattack", "evatk"], entry) || "x"
		pokemon.evs.def = this.tryValues(["defev", "defenseev", "evdefense", "evdef"], entry) || "x"
		pokemon.evs.spa = this.tryValues(["spaev", "spatkev", "evspatk", "evspa"], entry) || "x"
		pokemon.evs.spd = this.tryValues(["spdev", "spdefev", "evspdef", "evspd"], entry) || "x"
		pokemon.evs.spe = this.tryValues(["speev", "speedev", "evspeed", "evspe"], entry) || "x"
		pokemon.hiddenPower = this.tryValues(["hiddenpower", "hidden"], entry)
		pokemon.learntMoves = [
			this.tryValues(["move1", "eggmove1", "moveslot1"], entry),
			this.tryValues(["move2", "eggmove2", "moveslot2"], entry),
			this.tryValues(["move3", "eggmove3", "moveslot3"], entry),
			this.tryValues(["move4", "eggmove4", "moveslot4"], entry)
		].filter(e => e)
		pokemon.gender = this.tryValues(["gender", "sex", "mf", "fm"], entry)
		switch (pokemon.base.ratio) {
			case "1:0":
				pokemon.gender = '♂'
				break;
			case "0:1":
				pokemon.gender = '♀'
				break;
			case "—":
				pokemon.gender = '—'
				break;
		}
		if (pokemon.gender) {
			if (pokemon.gender.indexOf("♂") > -1 || pokemon.gender.toLowerCase() == "m" || pokemon.gender.toLowerCase() == "male")
				pokemon.gender = "♂"
			if (pokemon.gender.indexOf("♀") > -1 || pokemon.gender.toLowerCase() == "f" || pokemon.gender.toLowerCase() == "female")
				pokemon.gender = "♀"
			if (pokemon.gender.toLowerCase() == "-" || pokemon.gender.toLowerCase() == "none")
				pokemon.gender = '—'
		}

		pokemon.amount = this.tryValues(["amount", "count"], entry)
		pokemon.shiny = this.tryValues(["shiny"], entry)
		pokemon.nickname = this.tryValues(["nickname"], entry)
		pokemon.ot = this.tryValues(["ot"], entry)
		pokemon.tid = this.tryValues(["tid"], entry)
		pokemon.level = this.tryValues(["level", "lvl", "lv"], entry)
		pokemon.language = this.tryValues(["language", "lang"], entry)
		pokemon.notes = this.tryValues(["notes", "note", "comments", "comment"], entry)
		pokemon.balls = []
		var balls = this.tryValues(["pokeball", "ball", "pokeballs", "balls"], entry)
		if (balls) {
			balls = balls.split(",")
			for (var i in balls)
				balls[i] = balls[i].trim()
			pokemon.balls = balls.filter(e => e)
		}
		if (pokemon.balls.length == 0) {
			if (this.getValue(entry.gsx$poke)) pokemon.balls.push("Poké Ball")
			if (this.getValue(entry.gsx$great)) pokemon.balls.push("Great Ball")
			if (this.getValue(entry.gsx$ultra)) pokemon.balls.push("Ultra Ball")
			if (this.getValue(entry.gsx$master)) pokemon.balls.push("Master Ball")
			if (this.getValue(entry.gsx$safari)) pokemon.balls.push("Safari Ball")
			if (this.getValue(entry.gsx$level)) pokemon.balls.push("Level Ball")
			if (this.getValue(entry.gsx$lure)) pokemon.balls.push("Lure Ball")
			if (this.getValue(entry.gsx$moon)) pokemon.balls.push("Moon Ball")
			if (this.getValue(entry.gsx$friend)) pokemon.balls.push("Friend Ball")
			if (this.getValue(entry.gsx$love)) pokemon.balls.push("Love Ball")
			if (this.getValue(entry.gsx$heavy)) pokemon.balls.push("Heavy Ball")
			if (this.getValue(entry.gsx$fast)) pokemon.balls.push("Fast Ball")
			if (this.getValue(entry.gsx$sport)) pokemon.balls.push("Sport Ball")
			if (this.getValue(entry.gsx$premier)) pokemon.balls.push("Premier Ball")
			if (this.getValue(entry.gsx$repeat)) pokemon.balls.push("Repeat Ball")
			if (this.getValue(entry.gsx$timer)) pokemon.balls.push("Timer Ball")
			if (this.getValue(entry.gsx$nest)) pokemon.balls.push("Nest Ball")
			if (this.getValue(entry.gsx$net)) pokemon.balls.push("Net Ball")
			if (this.getValue(entry.gsx$dive)) pokemon.balls.push("Dive Ball")
			if (this.getValue(entry.gsx$luxury)) pokemon.balls.push("Luxury Ball")
			if (this.getValue(entry.gsx$heal)) pokemon.balls.push("Heal Ball")
			if (this.getValue(entry.gsx$quick)) pokemon.balls.push("Quick Ball")
			if (this.getValue(entry.gsx$dusk)) pokemon.balls.push("Dusk Ball")
			if (this.getValue(entry.gsx$cherish)) pokemon.balls.push("Cherish Ball")
			if (this.getValue(entry.gsx$dream)) pokemon.balls.push("Dream Ball")
			if (this.getValue(entry.gsx$beast)) pokemon.balls.push("Beast Ball")
		}
		if (pokemon.balls.length == 0) { // compatibility with richi3f's sheet
			if (entry.gsx$_dcgjs) pokemon.balls.push("Poké Ball")
			if (entry.gsx$_ddv49) pokemon.balls.push("Great Ball")
			if (entry.gsx$_d415a) pokemon.balls.push("Ultra Ball")
			if (entry.gsx$_d5fpr) pokemon.balls.push("Master Ball")
			if (entry.gsx$_d6ua4) pokemon.balls.push("Safari Ball")
			if (entry.gsx$_d88ul) pokemon.balls.push("Level Ball")
			if (entry.gsx$_dkvya) pokemon.balls.push("Lure Ball")
			if (entry.gsx$_dmair) pokemon.balls.push("Moon Ball")
			if (entry.gsx$_dnp34) pokemon.balls.push("Friend Ball")
			if (entry.gsx$_dp3nl) pokemon.balls.push("Love Ball")
			if (entry.gsx$_df9om) pokemon.balls.push("Heavy Ball")
			if (entry.gsx$_dgo93) pokemon.balls.push("Fast Ball")
			if (entry.gsx$_di2tg) pokemon.balls.push("Sport Ball")
			if (entry.gsx$_djhdx) pokemon.balls.push("Premier Ball")
			if (entry.gsx$_dw4je) pokemon.balls.push("Repeat Ball")
			if (entry.gsx$_dxj3v) pokemon.balls.push("Timer Ball")
			if (entry.gsx$_dyxo8) pokemon.balls.push("Nest Ball")
			if (entry.gsx$_e0c8p) pokemon.balls.push("Net Ball")
			if (entry.gsx$_dqi9q) pokemon.balls.push("Dive Ball")
			if (entry.gsx$_drwu7) pokemon.balls.push("Luxury Ball")
			if (entry.gsx$_dtbek) pokemon.balls.push("Heal Ball")
			if (entry.gsx$_dupz1) pokemon.balls.push("Quick Ball")
			if (entry.gsx$_e7d2q) pokemon.balls.push("Dusk Ball")
			if (entry.gsx$_e8rn7) pokemon.balls.push("Cherish Ball")
			if (entry.gsx$_ea67k) pokemon.balls.push("Dream Ball")
			if (entry.gsx$_ebks1) pokemon.balls.push("Beast Ball")
		}
		tab.pokemons.push(pokemon)
	}
}
