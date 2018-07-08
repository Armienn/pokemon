import { SearchSite } from "../../archive/search/search-site.js"
import { update, setRenderFunction, l } from "../../archive/arf/arf.js"
import { NavGroup, NavEntry } from "../../archive/search/section-navigation.js"
import { CollectionSetup } from "../../archive/search/collection-setup.js"
import { ExportView } from "../../archive/search/export-view.js"
import { ImportView } from "../../archive/search/import-view.js"
import { PokemonData } from "./pokemon-data.js"
import { State } from "./state.js"
import { formName, spriteName, typesText, abilitiesText, statText, eggGroupsText } from "./pokemon-display.js"

window.onload = function () {
	var site = new SearchSite()
	window.site = site
	var stuff = new PokemonStuff(site)
	window.stuff = stuff
	site.header = "Stuff"
	site.saveFunction = () => { stuff.save() }
	site.sections.navigation.navigationEntries = () => stuff.navThing()
	setRenderFunction(() => site.render())
	update()
}

function pokemonCollectionSetup() {
	const setup = new CollectionSetup()
	var key = ""
	setupFor(setup, "sprite", "Sprite", { value: p => l("img", { src: spriteName(p) }) }, false, "id")
	setupFor(setup, "id", "ID")
	setupFor(setup, "name", "Name")
	setupFor(setup, "form", "Form", {}, { options: ["Base", "Alola", "Mega"] })
	setupFor(setup, "name+form", "Name & Form", { value: formName }, false, "name")
	setupFor(setup, "types", "Types", { value: typesText }, { options: stuff.data.typeNames, restricted: true })
	setupFor(setup, "abilities", "Abilities", { value: abilitiesText }, { options: Object.keys(stuff.data.abilities) })
	setupFor(setup, "hp", "HP", { value: p => statText(p.stats.hp), data: p => p.stats.hp })
	setupFor(setup, "atk", "Atk", { value: p => statText(p.stats.atk), data: p => p.stats.atk })
	setupFor(setup, "def", "Def", { value: p => statText(p.stats.def), data: p => p.stats.def })
	setupFor(setup, "spa", "SpA", { value: p => statText(p.stats.spa), data: p => p.stats.spa })
	setupFor(setup, "spd", "SpD", { value: p => statText(p.stats.spd), data: p => p.stats.spd })
	setupFor(setup, "spe", "Spe", { value: p => statText(p.stats.spe), data: p => p.stats.spe })
	setupFor(setup, "eggGroups", "Egg Groups", { value: eggGroupsText }, { options: stuff.data.eggGroups, restricted: true })
	setup.tableSetup.entries = Object.keys(setup.entryModel).map(k => { return { key: k, shown: true } })
	setup.gridSetup.entries = Object.keys(setup.entryModel).map(k => { return { key: k, shown: false } })
	setup.gridSetup.entries.find(e => e.key == "sprite").shown = true
	setup.gridSetup.compact = true
	/*for (let key in source) {
		setup.titles[key] = autoCapitalise ? capitalise(key) : key
		setup.entryModel[key] = null
		setup.filterModel[key] = {}
		setup.sortingModel[key] = {}
		setup.tableSetup.entries.push({ key: key, shown: true })
		setup.gridSetup.entries.push({ key: key, shown: true })
	}*/
	return setup
}

function setupFor(setup, key, title, entryModel = {}, filterModel = {}, sortingModel = null) {
	setup.titles[key] = title
	setup.entryModel[key] = entryModel
	if (filterModel)
		setup.filterModel[key] = filterModel
	if (sortingModel !== false)
		setup.sortingModel[key] = sortingModel
}

function compareStatsFunction(stat) {
	return (a, b) => b.stats[stat] - a.stats[stat]
}

function statFilter(stat) {
	return { filter: (m, q) => 1 }
}

class PokemonStuff {
	constructor(site) {
		this.site = site
		this.data = new PokemonData()
		this.state = new State()
		this.collections = []
		this.load()
	}

	/*load() {
		if (!(localStorage && localStorage.generalCollections))
			return this.collections = []
		this.collections = JSON.parse(localStorage.generalCollections)
		for (var col of this.collections)
			col.setup = new CollectionSetup(col.setup)
		if (this.collections.length) {
			this.currentSetup = this.collections[0]
			this.site.setCollection(this.currentSetup.collection, this.currentSetup.setup)
		}
	}*/

	save() {
		if (!localStorage)
			return
		//localStorage.generalCollections = JSON.stringify(this.collections)
	}

	showView(component) {
		this.view = component
		this.site.show(() => {
			return this.view
		})
		update()
	}

	navThing() {
		return [
			new NavGroup("Collections",
				...this.collections.map(e => {
					return new NavEntry(e.title, () => {
						this.site.setCollection(e.collection, e.setup)
						this.currentSetup = e
						update()
					}, () => this.site.sections.collection.engine.collection == e.collection)
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
		this.loadDestination()
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

	loadDestination() {
		if (window.location.hash)
			this.state.destination = window.location.hash.substring(1)
	}

	tryLoad() {
		if (!this.state.thingsAreLoaded)
			return
		//dfs
		site.addCollectionSetup("pokemon", pokemonCollectionSetup())
		this.collections.push({
			collection: this.data.pokemons.slice(0, 151),
			setup: this.site.collectionSetups["pokemon"],
			title: "Pokémon"
		})
		this.site.setCollection(this.collections[0].collection, this.collections[0].setup)
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