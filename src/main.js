import { SearchSite } from "../../archive/search/search-site.js"
import { update, setRenderFunction, l } from "../../archive/arf/arf.js"
import { NavGroup, NavEntry } from "../../archive/search/section-navigation.js"
import { CollectionSetup } from "../../archive/search/collection-setup.js"
import { ExportView } from "../../archive/search/export-view.js"
import { ImportView } from "../../archive/search/import-view.js"
import { PokemonData, Pokemon } from "./pokemon-data.js"
import { State } from "./state.js"
import { formName, sprite, typesText, abilitiesText, statText, eggGroupsText, typeText, learnMethodText, IVEVText, ballSprites, movesText, extendedName } from "./pokemon-display.js"
import { CollectionGroup } from "./local-collection.js"
import { PokemonView } from "./pokemon-view.js"
import { getSpreadsheetUrl, loadSheetsFrom } from "./spreadsheet-parser.js"

window.onload = function () {
	var site = new SearchSite()
	window.site = site
	var stuff = new PokemonStuff(site)
	window.stuff = stuff
	site.header = "Pokémon Stuff"
	site.sections.header.url = "https://armienn.github.com/pokemon"
	//site.sections.navigation.navigationEntries = () => stuff.navThing()
	site.sections.navigation.navigationSetup = () => stuff.navThing()
	setRenderFunction(() => site.render())
	update()
}

function pokemonCollectionSetup() {
	const setup = new CollectionSetup()
	setup.allowAnythingFilter = false
	setup.defaultFilter = "name"
	setup.add("sprite", "Sprite", { value: p => sprite(p) }, false, "id")
	setup.add("id", "ID")
	setup.add("name", "Name")
	setup.add("form", "Form", {}, { options: ["Base", "Alola", "Mega"] })
	setup.add("name+form", "Pokémon", { value: formName }, false, "name")
	setup.add("types", "Types", { value: typesText }, { options: stuff.data.typeNames, restricted: true })
	setup.add("abilities", "Abilities", { value: abilitiesText }, { options: Object.keys(stuff.data.abilities) })
	setup.add("hp", "HP", { value: p => statText(p.stats.hp), data: p => p.stats.hp })
	setup.add("atk", "Atk", { value: p => statText(p.stats.atk), data: p => p.stats.atk })
	setup.add("def", "Def", { value: p => statText(p.stats.def), data: p => p.stats.def })
	setup.add("spa", "SpA", { value: p => statText(p.stats.spa), data: p => p.stats.spa })
	setup.add("spd", "SpD", { value: p => statText(p.stats.spd), data: p => p.stats.spd })
	setup.add("spe", "Spe", { value: p => statText(p.stats.spe), data: p => p.stats.spe })
	setup.add("total", "Total", { value: p => sumStats(p) + "" })
	setup.add("eggGroups", "Egg Groups", { value: eggGroupsText }, { options: stuff.data.eggGroups, restricted: true })
	setup.showTableEntries(["sprite", "name+form", "types", "abilities", "hp", "atk", "def", "spa", "spd", "spe", "total", "eggGroups"])
	setup.showGridEntries(["sprite"])
	setup.gridSetup.compact = true
	const view = new PokemonView()
	setup.view = (pokemon, collection) => view.withPokemon(pokemon, collection)
	var setupIndividual = new CollectionSetup()
	setupIndividual.add("name+form", "Pokémon", { value: extendedName }, false, "name")
	setupIndividual.add("nickname", "Nickname")
	setupIndividual.add("ability", "Ability", { value: p => abilitiesText(p, true) }, { options: Object.keys(stuff.data.abilities) })
	setupIndividual.add("nature", "Nature", { options: Object.keys(stuff.data.natures) })
	setupIndividual.copyFrom(setup, "name+form")
	setupIndividual.add("hpivev", "HP IV/EV", { value: p => new IVEVText("hp", p), data: p => p.ivs.hp })
	setupIndividual.add("atkivev", "Atk IV/EV", { value: p => new IVEVText("atk", p), data: p => p.ivs.atk })
	setupIndividual.add("defivev", "Def IV/EV", { value: p => new IVEVText("def", p), data: p => p.ivs.def })
	setupIndividual.add("spaivev", "SpA IV/EV", { value: p => new IVEVText("spa", p), data: p => p.ivs.spa })
	setupIndividual.add("spdivev", "SpD IV/EV", { value: p => new IVEVText("spd", p), data: p => p.ivs.spd })
	setupIndividual.add("speivev", "Spe IV/EV", { value: p => new IVEVText("spe", p), data: p => p.ivs.spe })
	setupIndividual.add("learntMoves", "Moves", { value: movesText })
	setupIndividual.add("balls", "Balls", { value: ballSprites })
	setupIndividual.add("count", "Count")
	setupIndividual.showTableEntries(["sprite", "name+form", "types", "ability", "nature", "hpivev", "atkivev", "defivev", "spaivev", "spdivev", "speivev", "learntMoves", "balls"])
	setupIndividual.showGridEntries(["sprite"])
	const viewIndividual = new PokemonView()
	viewIndividual.onSave = () => stuff.localCollectionGroup.saveToLocalStorage()
	setupIndividual.view = (pokemon, collection) => viewIndividual.withPokemon(pokemon, collection)
	return [setup, setupIndividual]
}

function movesCollectionSetup() {
	const setup = new CollectionSetup()
	setup.allowAnythingFilter = false
	setup.defaultFilter = "name"
	setup.add("name", "Name")
	setup.add("type", "Type", { value: m => typeText(m.type) }, { options: stuff.data.typeNames, restricted: true })
	setup.add("category", "Category", {}, { options: ["Physical", "Special", "Status"], restricted: true })
	setup.add("power", "Power")
	setup.add("accuracy", "Accuracy")
	setup.add("pp", "PP")
	setup.add("priority", "Priority")
	setup.add("target", "Target")
	setup.add("gameDescription", "Game Description")
	setup.showTableEntries(["name", "type", "category", "power", "accuracy", "gameDescription"])
	setup.showGridEntries(["name", "type", "category", "power", "accuracy"])
	var setupPokemonMoves = new CollectionSetup()
	setupPokemonMoves.add("method", "Learned By", { value: learnMethodText },
		{ options: ["Level", "TM", "Egg", "Tutor"], specialQueries: { "level": (m) => m > 0 }, restricted: true })
	setupPokemonMoves.copyFrom(setup)
	setupPokemonMoves.showTableEntries(["method", "name", "type", "category", "power", "accuracy", "gameDescription"])
	setupPokemonMoves.showGridEntries(["method", "name", "type", "category", "power", "accuracy"])
	return [setup, setupPokemonMoves]
}

function sumStats(p) {
	var sum = 0
	for (var i in p.stats)
		sum += p.stats[i]
	return sum
}

class PokemonStuff {
	constructor(site) {
		this.site = site
		this.data = new PokemonData()
		this.state = new State()
		this.localCollectionGroup = new CollectionGroup("Local")
		this.collectorInfo = {}
		this.externalCollectionGroup = new CollectionGroup("Loaded")
		this.location = { tab: "game-pokemon", type: "", path: "" }
		this.loadBaseData()
		this.loadCollectionData()
	}

	navThing() {
		const setup = {}
		if (Object.keys(this.externalCollectionGroup.tabs).length) {
			const groupings = this.externalCollectionGroup.groupings()
			const section = {}
			setup[this.collectorInfo.name || this.externalCollectionGroup.title] = section
			section[""] = {}
			if (this.collectorInfo.friendCode)
				section[""][this.collectorInfo.friendCode] = {}
			if (this.collectorInfo.spreadsheetId)
				section[""]["Spreadsheet"] = { action: "https://docs.google.com/spreadsheets/d/" + this.collectorInfo.spreadsheetId }
			if (this.collectorInfo.url)
				section[""]["Link"] = { action: this.collectorInfo.url }
			for (let groupTitle in groupings) {
				section[groupTitle] = {}
				for (let key in groupings[groupTitle]) {
					section[groupTitle][key] = {
						action: () => {
							this.site.setCollection(groupings[groupTitle][key].pokemons, "pokemonIndividuals")
							for (var title in this.externalCollectionGroup.tabs)
								if (this.externalCollectionGroup.tabs[title] == groupings[groupTitle][key])
									this.setLocation(title)
							update()
						},
						selected: this.site.sections.collection.collection == groupings[groupTitle][key].pokemons
					}
				}
			}
		}
		setup["Game Data"] = {}
		setup["Game Data"][""] = {}
		setup["Game Data"][""]["Pokémon"] = {
			action: () => {
				this.site.setCollection(this.data.pokemons, "pokemon")
				this.setLocation("game-pokemon")
				update()
			},
			selected: this.site.sections.collection.collection == this.data.pokemons
		}
		setup["Game Data"][""]["Moves"] = {
			action: () => {
				this.site.setCollection(this.data.movesList, "moves")
				this.setLocation("game-moves")
				update()
			},
			selected: this.site.sections.collection.collection == this.data.movesList
		}
		setup["Game Data"]["Local"] = {}
		for (let key in this.localCollectionGroup.tabs) {
			setup["Game Data"]["Local"][key] = {
				action: () => {
					this.site.setCollection(this.localCollectionGroup.tabs[key].pokemons, "pokemonIndividuals")
					update()
				},
				selected: this.site.sections.collection.collection == this.localCollectionGroup.tabs[key].pokemons
			}
		}
		setup["Game Data"]["Options"] = {}
		setup["Game Data"]["Options"]["Import"] = {
			action: () => {
				this.site.show(new ImportView(this.site, (collection) => {
					this.localCollectionGroup.addTab("Imported", collection.map(e => new Pokemon(e)))
					this.site.setCollection(this.localCollectionGroup.tabs["Imported"].pokemons, "pokemonIndividuals")
					this.site.clearSelection()
					this.localCollectionGroup.saveToLocalStorage()
					update()
				}))
			}
		}
		setup["Game Data"]["Options"]["Export"] = {
			action: () => {
				this.site.show(new ExportView(this.site))
			}
		}
		return setup
	}

	insertImported() {
		var index = this.collections.findIndex(e => e.title == "Imported")
		this.currentSetup.collection.push(...this.collections[index].collection)
		this.collections.splice(index, 1)
		this.site.engine.updateFilteredCollection()
		this.save()
		update()
	}

	loadBaseData() {
		this.loadJSONData("pokemons")
		this.loadJSONData("moves")
		this.loadJSONData("abilities")
		this.loadJSONData("natures")
		this.loadJSONData("eggGroups", "egg-groups")
		requestJSON("./data-usum/types.json", (types) => {
			this.data.types = types
			this.data.typeNames = Object.keys(types)
			this.state.thingsLoaded.types = true
			this.tryLoad()
		})
	}

	loadJSONData(thing, file) {
		if (!file)
			file = thing
		requestJSON("./data-usum/" + file + ".json", (data) => {
			this.data[thing] = data
			this.state.thingsLoaded[thing] = true
			this.tryLoad()
		})
	}

	loadCollectionData() {
		if (!window.location.search)
			return
		this.parseLocation()
		this.state.externalInventory.load = true
		for (let i in this.site.importMethods)
			if (i.toLowerCase() == this.location.type.toLowerCase()) {
				request("https://" + this.location.path, (response) => {
					this.loadData = () => this.loadFromImport(this.location.tab, this.site.importMethods[i](response).map(e => new Pokemon(e)))
					this.tryLoad()
				})
				return
			}
		if (this.location.type === "sheet")
			requestJSON(getSpreadsheetUrl(this.location.path), (response) => {
				this.loadData = () => loadSheetsFrom({ id: this.location.path, spreadsheet: response })
				this.tryLoad()
			})
	}

	parseLocation() {
		const args = window.location.search.substring(1).split(":")
		if (args.length == 1) {
			this.location.tab = ""
			this.location.type = "sheet"
			this.location.path = args[0]
		}
		else if (args.length == 2) {
			this.location.tab = ""
			this.location.type = args[0]
			this.location.path = args[1]
		}
		else if (args.length == 3) {
			this.location.tab = args[0]
			this.location.type = args[1]
			this.location.path = args[2]
		}
	}

	setLocation(tab) {
		this.location.tab = tab
		history.replaceState({}, "", "?" + tab.toLowerCase().replace(/[: ]/g, "") + ":" + this.location.type + ":" + this.location.path)
	}

	loadFromImport(title, collection) {
		const tab = this.externalCollectionGroup.addTab(title, collection)
		this.site.setCollection(tab, "pokemonIndividuals")
	}

	tryLoad() {
		if (!this.state.thingsAreLoaded)
			return
		this.data.movesList = Object.keys(this.data.moves).map(key => this.data.moves[key])
		var moveSetups = movesCollectionSetup()
		site.addCollectionSetup("moves", moveSetups[0])
		site.addCollectionSetup("pokemonMoves", moveSetups[1])
		var pokemonSetups = pokemonCollectionSetup()
		site.addCollectionSetup("pokemon", pokemonSetups[0])
		site.addCollectionSetup("pokemonIndividuals", pokemonSetups[1])
		this.site.setCollection(this.data.pokemons, "pokemon")
		this.localCollectionGroup.loadFromLocalStorage()
		this.state.loaded = true
		if (this.loadData) {
			//try {
			this.state.loaded = !this.loadData()
			//}
			//catch (e) {
			/*document.getElementById("loading").innerHTML = "Failed to load external collection: " + e.message
			document.getElementById("loading").onclick = () => {
				this.state.externalInventory.load = false
				this.tryLoad()
			}
			return*/
			//}
		}
		if (!this.state.loaded)
			return
		this.selectCollectionFrom(this.location.tab)
		update()
		//setInterval(() => { this.listSection.loadMoreWhenScrolledDown() }, 500)
	}

	tryLoadAgain() {
		if (!this.state.thingsAreLoaded)
			return
		this.state.loaded = true
		var tab = this.externalCollectionGroup.tabs[Object.keys(this.externalCollectionGroup.tabs)[0]]
		if (this.location)
			this.selectCollectionFrom(this.location.tab, tab)
		else if (tab)
			this.site.setCollection(tab.pokemons, "pokemonIndividuals")
		update()
	}

	selectCollectionFrom(destination, defaultTab) {
		if (destination === "game-pokemon")
			return this.site.setCollection(this.data.pokemons, "pokemon")
		if (destination === "game-moves")
			return this.site.setCollection(this.data.movesList, "moves")
		destination = destination.toLowerCase().replace(/[: ]/g, "")
		for (var key in this.externalCollectionGroup.tabs)
			if (key.toLowerCase().replace(/[: ]/g, "") === destination)
				return this.site.setCollection(this.externalCollectionGroup.tabs[key].pokemons, "pokemonIndividuals")
		if (defaultTab)
			this.site.setCollection(defaultTab.pokemons, "pokemonIndividuals")
	}
}


export function requestJSON(url, callback) {
	request(url, function (response) {
		callback(JSON.parse(response))
	})
}

function request(url, callback) {
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4) {
			if (xmlHttp.status == 200)
				callback(xmlHttp.responseText)
			else {
				document.getElementById("loading").innerHTML = "Failed to load external data"
				document.getElementById("loading").onclick = () => {
					stuff.state.externalInventory.load = false
					stuff.tryLoad()
				}
			}
		}
	}
	xmlHttp.onerror = function () {
		document.getElementById("loading").innerHTML = "Failed to load external data"
		document.getElementById("loading").onclick = () => {
			stuff.state.externalInventory.load = false
			stuff.tryLoad()
		}
	}
	xmlHttp.open("GET", url, true)
	xmlHttp.send()
}