"use strict";

class OptionsSection {
	constructor() {

		this.options = {
			"Import": () => this.showImportMenu(),
			"Export": () => this.showExportMenu(),
			"Add pokémon": () => this.showAddMenu(),
			"Delete tab": () => this.showDeleteMenu()
		}

		this.importMethods = {
			"Script": { method: (input) => (new Function(input))(), default: "return [new Pokemon('pikachu'), new Pokemon({name:'Charizard', form: 'Mega X'}), new Pokemon(151)]" },
			"JSON": { method: (input) => Porting.importJSON(input), default: '[{"id":6, "form":"Mega X", "nickname":"Burninator"}]' },
			"Smogon": {
				method: (input) => Porting.importSmogon(input), default: `Togekiss @ Leftovers
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
- Toxic Spikes` }
		}

		this.exportMethods = {
			"JSON": (pokemons) => Porting.exportJSON(pokemons),
			"Reddit Markdown": (pokemons) => Porting.exportMarkdown(pokemons)
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
		newTag("li", topbar, { text: "as tab" })
		var tabInput = newTag("input", topbar)
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
			var title = tabInput.value ? tabInput.value : "My tab"
			var importMethod = this.importMethods[importSelect.value]
			var pokemons, tab
			try {
				pokemons = importMethod.method(textarea.value)
				if (pokemons)
					tab = stuff.collection.addLocalTab(title, pokemons)
			}
			catch (e) {
				console.error(e)
			}
			stuff.headerSection.showLocal = true
			stuff.headerSection.updateNavPokemonTabs()
			if (tab)
				stuff.selectTab(tab)
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
			if (exportMethod) {
				bottombar.style.display = ""
				textarea.value = exportMethod(stuff.state.currentPokemons)
			} else {
				bottombar.style.display = "none"
			}
		}
		var bottombar = newTag("div", this.optionsSubElement)
		bottombar.style.display = "none"
		newTag("p", bottombar, { text: "Ctrl+A to select everything, Ctrl+C to copy" })
		var textarea = newTag("textarea", bottombar)
		textarea.style.width = "30rem"
		textarea.style.height = "8rem"
	}

	showAddMenu() {
		var topbar = newTag("div", this.optionsSubElement, { text: "Coming soon, to a site near YOU!" })
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
