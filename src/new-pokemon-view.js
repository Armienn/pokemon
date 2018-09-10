import { Component, update, l } from "../../archive/arf/arf.js"
import iconButton, { acceptIcon, crossIcon } from "../../archive/search/icons.js"
import { Pokemon } from "./pokemon-data.js"
import { imageName } from "./pokemon-display.js";

export class NewPokemonView extends Component {
	constructor(tabTitle, onSave, onCancel) {
		super()
		this.tabTitle = tabTitle
		this.pokemon = ""
		this.pokemonData
		this.onSave = onSave
		this.onCancel = onCancel
	}

	renderThis() {
		return l("div",
			l("div",
				l("span", { style: { color: "#888", height: "2rem", lineHeight: "2rem" } }, "Add "),
				l("input", {
					placeholder: "Pokémon",
					onchange: (event) => {
						this.pokemon = event.target.value
						this.pokemonData = new Pokemon(this.pokemon)
						if (!this.pokemonData.base)
							this.pokemonData = undefined
						update()
					},
					value: this.pokemon,
					attributes: { list: "newpokemonchoice" }
				}),
				l("datalist#newpokemonchoice", ...stuff.data.pokemons.map(e => l("option", e.name))),
				l("span", { style: { color: "#888", height: "2rem", lineHeight: "2rem" } }, " to " + this.tabTitle)
			),
			l("div",
				iconButton(acceptIcon({ filter: "invert(1)" }), () => {
					this.pokemonData = new Pokemon(this.pokemon)
					if (!this.pokemonData.base)
						this.onSave()
					this.onSave(this.pokemonData)
				}),
				iconButton(crossIcon({ filter: "invert(1)" }), this.onCancel)
			),
			this.pokemonData ?
				l("img", {
					style: { height: "13rem", margin: "0.5rem", justifySelf: "center" },
					src: imageName(this.pokemonData)
				}) :
				undefined
		)
	}

	static styleThis() {
		return {
			"input, button": {
				margin: "0.25rem"
			},
			".close-button": {
				opacity: "0.5",
				transition: "0.3s ease"
			},
			".close-button:hover": {
				opacity: "1",
				transition: "0.3s ease"
			}
		}
	}
}
