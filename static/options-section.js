"use strict";

class OptionsSection {
	constructor() {

		var defaultScript = "return [new Pokemon('pikachu'), new Pokemon({name:'Charizard', form: 'Mega X'}), new Pokemon(151)]"
		var defaultJSON = '[{"id":6, "form":"Mega X", "nickname":"Burninator"}]'
		var defaultSmogon = `Togekiss @ Leftovers
Ability: Serene Grace
EVs: 252 HP / 80 Def / 176 Spe
Timid Nature
- Nasty Plot
- Air Slash
- Heal Bell
- Roost

Dragalge @ Draco Plate
Ability: Adaptability
EVs: 228 HP / 252 SpA / 28 Spe
Modest Nature
- Draco Meteor
- Sludge Wave
- Focus Blast
- Toxic Spikes`
		var defaultCSV = `Pokemon,Form,Nature,Ball
Duosion,Base,Jolly,Great Ball
Charizard,Mega X,Adamant,Lure Ball`
		var defaultTSV = `Pokemon	Form	Nature	Ball
Duosion	Base	Jolly	Great Ball
Charizard	Mega X	Adamant	Lure Ball`
		var defaultMarkdown = `|Pokemon|Ball|Nature|Ability|Egg Moves|Quantity|
|:---:|-|-|-|-|-|-|
|Buizel|[](/safariball)|Jolly|Swift Swim|Aqua Ring, Soak, Double Slap, Switcheroo| 1|
|Larvitar|[](/safariball)|Adamant|Guts|Dragon Dance, Pursuit, Stealth Rock, Ancient Power|6|
|Psyduck|[](/safariball)|Modest|Swift Swim|Encore, Hypnosis, Clear Smog, Cross Chop|2|`

		this.options = {
			"Import": () => this.showImportMenu(),
			"Export": () => this.showExportMenu(),
			"Add pokémon": () => this.showAddMenu(),
			"Add tab": () => this.showAddTabMenu(),
			"Delete tab": () => this.showDeleteMenu()
		}

		this.importMethods = {
			"Script": { method: (input) => (new Function(input))(), default: defaultScript },
			"JSON": { method: (input) => Porting.importJSON(input), default: defaultJSON },
			"Smogon": { method: (input) => Porting.importSmogon(input), default: defaultSmogon },
			"CSV": { method: (input) => Porting.importTable(input, ","), default: defaultCSV },
			"TSV": { method: (input) => Porting.importTable(input, "\t"), default: defaultTSV },
			"Reddit Markdown": { method: (input) => Porting.importTable(input, "|"), default: defaultMarkdown }
		}

		this.exportMethods = {
			"JSON": { method: (pokemons) => Porting.exportJSON(pokemons) },
			"CSV": { method: (pokemons) => Porting.exportTable(pokemons, ","), table: true },
			"TSV": { method: (pokemons) => Porting.exportTable(pokemons, "\t"), table: true },
			"Reddit Markdown": { method: (pokemons) => Porting.exportMarkdownTable(pokemons), table: true }
		}

		this.optionsElement = document.getElementById("options-section")
		this.optionsSubElement = document.getElementById("options-sub-section")
	}

	updateOptions() {
		this.optionsElement.innerHTML = ""
		for (let i in this.options) {
			var element = newTag("li", this.optionsElement, { text: i })
			element.className = "button"
			element.onclick = () => {
				this.optionsSubElement.innerHTML = ""
				this.options[i]()
				this.optionsSubElement.className = "shown-options"
			}
		}
	}

	toggle() {
		if (this.optionsElement.className == "hidden-options")
			this.optionsElement.className = "shown-options"
		else
			this.optionsElement.className = "hidden-options"
		this.optionsSubElement.className = "hidden-options"
	}

	showImportMenu() {
		var topbar = newTag("div", this.optionsSubElement)
		newTag("li", topbar, { text: "Import from" })
		var importSelect = newTag("select", topbar)
		newTag("option", importSelect)
		for (var i in this.importMethods) {
			var option = newTag("option", importSelect, { text: i })
			option.value = i
		}
		importSelect.onchange = () => {
			var importMethod = this.importMethods[importSelect.value]
			if (importMethod) {
				middlebar.style.display = ""
				bottombar.style.display = ""
				textarea.value = importMethod.default
			} else {
				middlebar.style.display = "none"
				bottombar.style.display = "none"
			}
		}
		newTag("li", topbar, { text: "into current tab" })
		var middlebar = newTag("div", this.optionsSubElement)
		middlebar.style.display = "none"
		var textarea = newTag("textarea", middlebar)
		textarea.style.width = "30rem"
		textarea.style.height = "8rem"
		var bottombar = newTag("div", this.optionsSubElement)
		bottombar.style.display = "none"
		var importButton = newTag("li", bottombar, { text: "Import" })
		importButton.className = "button"
		importButton.onclick = () => {
			var importMethod = this.importMethods[importSelect.value]
			var pokemons
			try {
				pokemons = importMethod.method(textarea.value)
				if (pokemons) {
					var tab = stuff.state.currentTab
					if (typeof tab == "string")
						tab = stuff.collection.getLocalTab("My tab")
					if (!tab)
						tab = stuff.collection.addLocalTab("My tab", [], true)
					tab.pokemons = tab.pokemons.concat(pokemons)
					stuff.headerSection.updateNavPokemonTabs()
					stuff.selectTab(tab)
					stuff.collection.saveLocalTabs()
				}
			}
			catch (e) {
				console.error(e)
			}
			stuff.headerSection.showLocal = true
			stuff.headerSection.updateNavPokemonTabs()
			stuff.show()
		}
	}

	showExportMenu() {
		var topbar = newTag("div", this.optionsSubElement)
		newTag("li", topbar, { text: "Export current pokémons as" })
		var exportSelect = newTag("select", topbar)
		newTag("option", exportSelect)
		for (var i in this.exportMethods) {
			var option = newTag("option", exportSelect, { text: i })
			option.value = i
		}
		exportSelect.onchange = () => {
			var exportMethod = this.exportMethods[exportSelect.value]
			tableSetup.style.display = "none"
			updateButton.style.display = "none"
			if (exportMethod) {
				bottombar.style.display = ""
				updateButton.style.display = ""
				if (exportMethod.table)
					tableSetup.style.display = ""
				textarea.value = exportMethod.method(stuff.state.currentPokemons)
			} else {
				bottombar.style.display = "none"
			}
		}
		var updateButton = newTag("li", topbar, { text: "Update" })
		updateButton.className = "button"
		updateButton.style.display = "none"
		updateButton.onclick = () => {
			textarea.value = this.exportMethods[exportSelect.value].method(stuff.state.currentPokemons)
		}
		var bottombar = newTag("div", this.optionsSubElement)
		bottombar.style.display = "none"
		var tableSetup = this.showTableSetup(bottombar)
		newTag("p", bottombar, { text: "Ctrl+A to select everything, Ctrl+C to copy" })
		var textarea = newTag("textarea", bottombar)
		textarea.style.width = "30rem"
		textarea.style.height = "8rem"
	}

	showTableSetup(parent) {
		var div = newTag("div", parent)
		var elements = []
		var setups = Porting.tableSetup
		for (let i in stuff.settings.tableSetup) {
			let setup = stuff.settings.tableSetup[i]
			elements[i] = newTag("li", div)
			elements[i].innerHTML = this.getSetupTitle(setup, setups)
			elements[i].className = setup.state ? "active-toggle" : "inactive-toggle"
			elements[i].onclick = () => {
				setup.state = this.advanceState(setup.state, setups[setup.thing].states)
				elements[i].className = setup.state ? "active-toggle" : "inactive-toggle"
				elements[i].innerHTML = this.getSetupTitle(setup, setups)
				stuff.settings.saveTableSetup()
			}
		}
		div.style.display = "none"
		return div
	}

	advanceState(state, states) {
		if (states) {
			var index = states.indexOf(state)
			index++
			if (index > states.length)
				return false
			else
				return states[index]
		}
		return !state
	}

	getSetupTitle(setup, setups){
		if(setup.state && setups[setup.thing].states){
			return setup.state
		}
		else {
			if(typeof setups[setup.thing].header == "string"){
				return setups[setup.thing].header
			}
			else {
				return setups[setup.thing].header(setups[setup.thing].states[0])
			}
		}
	}

	showAddMenu() {
		var topbar = newTag("div", this.optionsSubElement)
		newTag("li", topbar, { text: "Pokemon" })
		var pokemonInput = newTag("input", topbar)
		var datalistElement = newTag("datalist", topbar)
		datalistElement.id = "datalistpokes"
		pokemonInput.setAttribute("list", "datalistpokes")
		var last = ""
		pokemonInput.oninput = () => { // this is ugly as sin
			datalistElement.innerHTML = ""
			if (pokemonInput.value == last)
				return
			last = pokemonInput.value
			if (last.length < 2)
				return
			var count = 0
			var fit = ""
			for (var i in stuff.data.pokemons) {
				var pokemon = stuff.data.pokemons[i]
				var name = pokemon.name + (pokemon.form == "Base" ? "" : " " + pokemon.form)
				if (name.toLocaleLowerCase().indexOf(pokemonInput.value.toLocaleLowerCase()) > -1) {
					newTag("option", datalistElement).value = name
					fit = name
					count++
					if (count > 10)
						break
				}
			}
			if (count == 1) {
				addButton.style.display = ""
				pokemonInput.value = fit
				pokemonInput.blur()
			}
			else
				addButton.style.display = "none"
		}
		var addButton = newTag("li", topbar, { text: "Add to current tab" })
		addButton.className = "button"
		addButton.style.display = "none"
		addButton.onclick = () => {
			var things = pokemonInput.value.replace(" ", "|").split("|")
			var tab = stuff.state.currentTab
			if (typeof stuff.state.currentTab == "string") {
				tab = stuff.collection.getLocalTab("My tab")
				if (!tab)
					tab = stuff.collection.addLocalTab("My tab")
				stuff.state.currentTab = tab
				stuff.headerSection.showLocal = true
			}
			var pokemon = new Pokemon({ name: things[0], form: things[1] })
			tab.pokemons.push(pokemon)
			stuff.collection.saveLocalTabs()
			stuff.selectPokemon(pokemon)
			stuff.update()
		}
	}

	showAddTabMenu() {
		var topbar = newTag("div", this.optionsSubElement)
		var tabInput = newTag("input", topbar)
		tabInput.placeholder = "My tab"
		var addButton = newTag("li", topbar, { text: "Add" })
		addButton.className = "button"
		addButton.onclick = () => {
			var title = tabInput.value ? tabInput.value : "My tab"
			var tab = stuff.collection.addLocalTab(title, [])
			stuff.headerSection.updateNavPokemonTabs()
			stuff.show()
		}
	}

	showDeleteMenu() {
		var topbar = newTag("div", this.optionsSubElement)
		if (!stuff.collection.local.length) {
			newTag("li", topbar, { text: "No local tabs to delete!" })
			return
		}
		newTag("li", topbar, { text: "Delete" })
		var tabSelect = newTag("select", topbar)
		newTag("option", tabSelect)
		for (var i in stuff.collection.local) {
			var option = newTag("option", tabSelect, { text: stuff.collection.local[i].title })
			option.value = i
		}
		tabSelect.onchange = () => {
			if (tabSelect.value > -1)
				bottombar.style.display = ""
			else
				bottombar.style.display = "none"
		}
		var bottombar = newTag("div", this.optionsSubElement)
		bottombar.style.display = "none"
		newTag("li", bottombar, { text: "Deletion cannot be undone" })
		var deleteButton = newTag("li", bottombar, { text: "Delete" })
		deleteButton.className = "button"
		deleteButton.onclick = () => {
			var deleted = stuff.collection.local.splice(tabSelect.value, 1)[0]
			stuff.collection.saveLocalTabs()
			tabSelect.innerHTML = ""
			newTag("option", tabSelect)
			for (var i in stuff.collection.local) {
				var option = newTag("option", tabSelect, { text: stuff.collection.local[i].title })
				option.value = i
			}
			stuff.headerSection.updateNavPokemonTabs()
			if (deleted == stuff.state.currentTab)
				stuff.selectTab("all")
			stuff.show()
		}
	}
}
