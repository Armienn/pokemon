"use strict";

class HeaderSection {
	constructor() {
		this.title = "Pokémon Stuff"
		this.titleLink = "https://github.com/Armienn/pokemon#pok%C3%A9mon-stuff"
		this.subtitle = ""

		this.navGroups = {
			pokemons: {
				all: {
					text: "⊖",
					click: () => stuff.state.mode = "table",
					active: () => stuff.state.mode == "table",
					style: { fontSize: "1.5rem", paddingBottom: "0.2rem" }
				},
				custom: {
					text: "☷",
					click: () => stuff.state.mode = "grid",
					active: () => stuff.state.mode == "grid",
					style: { fontSize: "1.3rem" }
				}
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
					click: () => { stuff.state.colorSet = "day"; stuff.updateColors() },
					active: () => stuff.state.colorSet == "day",
					style: { fontSize: "1.2rem" }
				},
				night: {
					text: "☽",
					click: () => { stuff.state.colorSet = "night"; stuff.updateColors() },
					active: () => stuff.state.colorSet == "night",
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
		element.innerHTML = ""
		if (this.titleLink) {
			element = newTag("a", this.titleElement)
			element.href = this.titleLink
		}
		element.innerText = this.title
	}

	showSubtitle() {
		this.subtitleElement.innerText = this.subtitle
		if (this.subtitle)
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
}
