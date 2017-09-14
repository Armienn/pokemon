"use strict";

class HeaderSection {
	constructor() {
		this.title = "Pokémon Stuff"
		this.titleLink = "https://github.com/Armienn/pokemon#pok%C3%A9mon-stuff"
		this.subtitle = ""

		this.navGroups = {
			base: {
				all: {
					text: "⊖",
					click: () => stuff.state.currentTab = "all",
					active: () => stuff.state.currentTab == "all",
					style: { fontSize: "1.5rem", paddingBottom: "0.2rem" }
				},
				custom: {
					text: "☷",
					click: () => stuff.state.currentTab = "custom",
					active: () => stuff.state.currentTab == "custom",
					style: { fontSize: "1.3rem" }
				}
			},
			pokemons: {
			},
			modes: {
				table: {
					text: "▤",
					click: () => stuff.state.mode = "table",
					active: () => stuff.state.mode == "table",
					style: { fontSize: "2rem", fontWeight: "initial" }
				},
				grid: {
					text: "▦",
					click: () => stuff.state.mode = "grid",
					active: () => stuff.state.mode == "grid",
					style: { fontSize: "2rem", fontWeight: "initial" }
				}
			},
			colours: {
				day: {
					text: "☀",
					click: () => { stuff.settings.colorScheme = "day"; stuff.updateColors() },
					active: () => stuff.settings.colorScheme == "day",
					style: { fontSize: "1.2rem" }
				},
				night: {
					text: "☽",
					click: () => { stuff.settings.colorScheme = "night"; stuff.updateColors() },
					active: () => stuff.settings.colorScheme == "night",
					style: { fontSize: "1.2rem" }
				}
			}
		}

		this.titleElement = document.getElementById("main-title")
		this.subtitleElement = document.getElementById("sub-title")
		this.navListElement = document.getElementById("nav-list")
	}

	show() {
		this.showTitle()
		this.showSubtitle()
		this.showNavList()
	}

	showTitle() {
		var element = this.titleElement
		if (stuff.collection.spreadsheetId) {
			var title = stuff.collection.collectorUrl ? "<a href=\"" + stuff.collection.collectorUrl + "\">" + stuff.collection.collectorName + "</a>'s " : stuff.collection.collectorName + "'s "
			title += stuff.collection.spreadsheetId ? "<a href=\"https://docs.google.com/spreadsheets/d/" + stuff.collection.spreadsheetId + "\">Pokémon</a> " : "Pokémon "
			title += "<a href=\"https://armienn.github.io/pokemon/\">Stuff</a>"
			element.innerHTML = title
		}
		else {
			element.innerHTML = ""
			if (this.titleLink) {
				element = newTag("a", this.titleElement)
				element.href = this.titleLink
			}
			element.innerHTML = this.title
		}
		document.title = element.textContent
	}

	showSubtitle() {
		if (stuff.collection.collectorFriendCode)
			this.subtitleElement.innerText = "FC: " + stuff.collection.collectorFriendCode
		else
			this.subtitleElement.innerText = this.subtitle
		if (this.subtitleElement.innerText)
			this.subtitleElement.style.display = ""
		else
			this.subtitleElement.style.display = "none"
	}

	showNavList() {
		this.navListElement.innerHTML = ""
		for (var group in this.navGroups) {
			var groupElement = newTag("li", this.navListElement)
			for (var entry in this.navGroups[group]) {
				var element = this.navGroups[group][entry]
				if (typeof element === "string")
					newTag("span", groupElement, { text: element })
				else
					this.setupNavListElement(element, groupElement)
			}
		}
	}

	setupNavListElement(entry, groupElement) {
		let element = newTag("li", groupElement, entry)
		element.className = entry.active() ? "active" : "inactive"
		element.onclick = () => {
			entry.click()
			this.showNavList()
		}
	}

	updateNavPokemonTabs() {
		this.navGroups.pokemons = {}
		var index = 0
		this.navGroups.pokemons[index] = "|"
		index++
		if (stuff.collection.collectorName) {
			this.navGroups.pokemons[index] = {
				text: stuff.collection.collectorName + "'s Pokémon",
				click: () => stuff.state.selectTab("mine"),
				active: () => stuff.state.currentTab == "mine"
			}
			index++
		}
		if (stuff.settings.showBreedables) {
			this.navGroups.pokemons[index] = {
				text: "Breedables",
				click: () => stuff.state.selectTab("breedables"),
				active: () => stuff.state.currentTab == "breedables"
			}
			index++
		}
		if (stuff.collection.collectorName || stuff.settings.showBreedables) {
			this.navGroups.pokemons[index] = "|"
			index++
		}
		for (var i in stuff.collection.pokemons) {
			var tab = stuff.collection.pokemons[i]
			this.navGroups.pokemons[index] = {
				text: tab.title,
				click: tab.click,
				active: tab.active
			}
			index++
		}
		this.navGroups.pokemons[index] = "|"
		index++
		for (var i in stuff.collection.lookingFor) {
			var tab = stuff.collection.lookingFor[i]
			this.navGroups.pokemons[index] = {
				text: tab.title,
				click: tab.click,
				active: tab.active
			}
			index++
		}
	}
}
