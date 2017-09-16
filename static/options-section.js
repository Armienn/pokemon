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
			"Script": { method: (input) => (new Function(input))(), default: "return [stuff.newPokemon('pikachu'), stuff.newPokemon({name:'Charizard', form: 'Mega X'}), stuff.newPokemon(151)]" }
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
		var topbar = newTag("div", this.optionsSubElement, { text: "Coming soon, to a site near YOU!" })
	}

	showAddMenu() {
		var topbar = newTag("div", this.optionsSubElement, { text: "Coming soon, to a site near YOU!" })
	}

	showDeleteMenu() {
		var topbar = newTag("div", this.optionsSubElement, { text: "Coming soon, to a site near YOU!" })
		/*
				newTag("li", topbar, { text: "to tab" })
				var tabSelect = newTag("select", topbar)
				var allTabs = this.getAllTabs()
				for (var i in allTabs) {
					var option = newTag("option", tabSelect, { text: allTabs[i].title })
					option.value = i
				}
				*/
	}

	getAllTabs() {
		var list = []
		list = list.concat(stuff.collection.local)
		list = list.concat(stuff.collection.pokemons)
		list = list.concat(stuff.collection.lookingFor)
		return list
	}
}
