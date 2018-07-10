import { SearchSite } from "../../archive/search/search-site.js"
import { update, setRenderFunction, l } from "../../archive/arf/arf.js"
import { NavGroup, NavEntry } from "../../archive/search/section-navigation.js"
import { CollectionSetup } from "../../archive/search/collection-setup.js"
import { SelectionView } from "../../archive/search/selection-view.js"
import { ExportView } from "../../archive/search/export-view.js"
import { ImportView } from "../../archive/search/import-view.js"
import { PokemonData } from "./pokemon-data.js"
import { State } from "./state.js"
import { formName, sprite, typesText, abilitiesText, statText, eggGroupsText, typeText } from "./pokemon-display.js"
import { CollectionGroup } from "./local-collection.js"
import { pokemonViewSetup } from "./pokemon-view-setup.js"

window.onload = function () {
	var site = new SearchSite()
	window.site = site
	var stuff = new PokemonStuff(site)
	window.stuff = stuff
	site.header = "Stuff"
	site.sections.navigation.navigationEntries = () => stuff.navThing()
	setRenderFunction(() => site.render())
	update()
}

function pokemonCollectionSetup() {
	const setup = new CollectionSetup()
	setup.add("sprite", "Sprite", { value: p => sprite(p) }, false, "id")
	setup.add("id", "ID")
	setup.add("name", "Name")
	setup.add("form", "Form", {}, { options: ["Base", "Alola", "Mega"] })
	setup.add("name+form", "Name & Form", { value: formName }, false, "name")
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
	let options = pokemonViewSetup()
	setup.view = (pokemon) => new SelectionView(pokemon, options)
	return setup
}

function movesCollectionSetup() {
	const setup = new CollectionSetup()
	setup.add("name", "Name")
	setup.add("type", "Type", { value: m => typeText(m.type) }, { options: stuff.data.typeNames, restricted: true })
	setup.add("category", "Category", {}, { options: ["Physical", "Special", "Status"], restricted: true })
	setup.add("power", "Power")
	setup.add("accuracy", "Accuracy")
	setup.add("pp", "PP")
	setup.add("priority", "Priority")
	setup.add("target", "Target")
	//setup.add("effects", "Effects")
	setup.add("gameDescription", "Game Description")
	setup.showTableEntries(["name", "type", "category", "power", "accuracy", "pp", "priority", "target", "gameDescription"])
	setup.showGridEntries(["name", "type", "category", "power", "accuracy", "pp", "priority", "target", "gameDescription"])
	return setup
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
		this.collectionGroups = []
		this.load()
	}

	navThing() {
		return [
			new NavGroup("Game data",
				new NavEntry("Pokémon", () => {
					this.site.setCollection(this.data.pokemons, "pokemon")
					update()
				}, () => this.site.sections.collection.collection == this.data.pokemons),
				new NavEntry("Moves", () => {
					this.site.setCollection(this.data.movesList, "moves")
					update()
				}, () => this.site.sections.collection.collection == this.data.movesList)
			),
			...this.collectionGroups.map(group => new NavGroup(group.title,
				...Object.keys(group.tabs).map(title => {
					return new NavEntry(title, () => {
						this.site.setCollection(group.tabs[title], "pokemon")
						update()
					}, () => this.site.sections.collection.collection == group.tabs[title])
				})
			)),
			new NavGroup(this.localCollectionGroup.title,
				...Object.keys(this.localCollectionGroup.tabs).map(title => {
					return new NavEntry(title, () => {
						this.site.setCollection(this.localCollectionGroup.tabs[title], "pokemon")
						update()
					}, () => this.site.sections.collection.collection == this.localCollectionGroup.tabs[title])
				})
			),
			new NavGroup("Actions",
				new NavEntry("Export", () => {
					this.site.show(new ExportView(this.site))
				}),
				new NavEntry("Import", () => {
					this.site.show(new ImportView(this.site, (collection) => {
						var setup = {
							collection: collection,
							setup: CollectionSetup.fromExample(collection[0]),
							title: "Imported"
						}
						var index = this.collections.findIndex(e => e.title == "Imported")
						if (index >= 0)
							this.collections.splice(index, 1)
						this.collections.push(setup)
						this.site.setCollection(setup.collection, setup.setup)
						this.currentSetup = setup
						this.site.clearSelection()
						this.save()
						update()
					}))
				})
			)
		].filter(e => e)
	}

	insertImported() {
		var index = this.collections.findIndex(e => e.title == "Imported")
		this.currentSetup.collection.push(...this.collections[index].collection)
		this.collections.splice(index, 1)
		this.site.engine.updateFilteredCollection()
		this.save()
		update()
	}

	load() {
		this.loadBaseData()
		this.loadCollectionData()
		//this.settings.load()
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
		var argument = window.location.search.substring(1)
		this.state.externalInventory.load = true
		/*var args = argument.split(":")
		for (var i in this.optionsSection.importMethods)
			if (i.toLowerCase() == args[0].toLowerCase()) {
				request("https://" + args[1], (response) => {
					this.state.script = { type: args[0].toLowerCase(), content: response }
					this.tryLoad()
				})
				return
			}*/
		/*requestJSON(this.spreadsheetParser.getSpreadsheetUrl(argument), (response) => {
			this.state.spreadsheet = { id: argument, spreadsheet: response }
			this.tryLoad()
		})*/
	}

	tryLoad() {
		if (!this.state.thingsAreLoaded)
			return
		//dfs
		this.data.movesList = Object.keys(this.data.moves).map(key => this.data.moves[key])
		site.addCollectionSetup("pokemon", pokemonCollectionSetup())
		site.addCollectionSetup("moves", movesCollectionSetup())
		this.site.setCollection(this.data.pokemons, "pokemon")
		this.localCollectionGroup.loadFromLocalStorage()
		/*if (this.state.externalInventory.load) {
			this.headerSection.showLocal = false
			if (this.state.script)
				for (var i in this.optionsSection.importMethods) {
					if (i.toLowerCase() == this.state.script.type){
						this.loadScript((content) => this.optionsSection.importMethods[i].method(content))
						break
					}
				}
			else if (this.state.spreadsheet)
				this.loadSpreadsheet()
			if (!this.state.externalInventory.isLoaded)
				return
		}*/
		this.state.loaded = true
		/*this.headerSection.setup()
		this.collection.loadLocalTabs()
		this.settings.loadLocalScript()*/
		update()
		/*if (!this.collection.pokemons.length && this.state.destination)
			this.selectPokemonBasedOn(this.state.destination)
		setInterval(() => { this.listSection.loadMoreWhenScrolledDown() }, 500)*/
	}

	selectPokemonBasedOn(destination) {
		for (var n in this.data.pokemons) {
			var pokemon = this.data.pokemons[n]
			var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀", "-f").replace("♂", "-m").replace("'", "").replace(".", "").replace("ébé", "ebe").replace(":", "")
			if (pokemon.id == destination || name == destination.toLowerCase()) {
				this.selectPokemon(pokemon)
				return
			}
		}
	}

	loadScript(parser) {
		var pokemons
		try {
			pokemons = parser(this.state.script.content)
		}
		catch (e) {
			document.getElementById("loading").innerHTML = "Failed to load external collection: " + e.message
			document.getElementById("loading").onclick = () => {
				this.state.externalInventory.load = false
				this.tryLoad()
			}
			return
		}
		this.state.script = undefined
		this.state.externalInventory.isLoaded = true
		if (!pokemons)
			return
		var tab = this.collection.addTab("Pokémon list", pokemons)
		this.selectTab(tab)
	}

	loadSpreadsheet() {
		this.spreadsheetParser.parse(this.state.spreadsheet)
		this.state.spreadsheet = undefined
	}
}


function requestJSON(url, callback) {
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