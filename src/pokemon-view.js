import { l, Component } from "../../archive/arf/arf.js"
import { SelectionView } from "../../archive/search/selection-view.js"
import { shinyText, amountText, imageName, typesText, abilitiesText, eggGroupsText, genderText, weightHeightText, abilityText, typeText, moveText, ballSprites, sprite, formName, natureCssClass, statColor } from "./pokemon-display.js"
import { CollectionView } from "../../archive/search/collection-view.js"
import { Styling } from "../../archive/search/styling.js"

export class PokemonView {
	constructor() {
		this.collectionView = new CollectionView()
		this.collectionView.setCollectionSetup(site.collectionSetups["pokemonMoves"])
		this.collectionView.engine.sorting = "method"
		this.view = new SelectionView({}, {
			header: {
				content: (pokemon) => [
					"#" + pokemon.id + " " + pokemon.name,
					shinyText(pokemon),
					amountText(pokemon),
					pokemon.form && pokemon.form != "Base" ? " (" + pokemon.form + ") " : "",
					pokemon.level ? l("span", { style: { fontSize: "1rem" } }, "- Lv." + pokemon.level) : "",
					pokemon.language ? l("span", { style: { fontSize: "1rem" } }, "- " + pokemon.language) : ""
				],
				colors: (pokemon) => pokemon.types.map(e => stuff.data.typeColors[e])
			},
			upperContent: (pokemon) => [l("div", { style: { padding: "0.5rem" } }, pokemon.description)],
			gridContent: (pokemon) => [
				l("img", {
					style: { gridArea: "span 6", height: "11rem", margin: "0.5rem", justifySelf: "center" },
					src: imageName(pokemon)
				}),
				...SelectionView.entries([6, 3],
					"HP", new StatNumber(pokemon, "hp"), new StatBar(pokemon, "hp"),
					"Attack", new StatNumber(pokemon, "atk"), new StatBar(pokemon, "atk"),
					"Defense", new StatNumber(pokemon, "def"), new StatBar(pokemon, "def"),
					"Sp. Atk", new StatNumber(pokemon, "spa"), new StatBar(pokemon, "spa"),
					"Sp. Def", new StatNumber(pokemon, "spd"), new StatBar(pokemon, "spd"),
					"Speed", new StatNumber(pokemon, "spe"), new StatBar(pokemon, "spe")
				),
				...SelectionView.entries(6, ...pokemonEntries(pokemon))
			],
			lowerContent: (pokemon) => [l("header", { style: { background: "rgba(" + Styling.styling.tableColor + ",0.3)" } }, "Moves"), this.collectionView]
		})
	}

	withPokemon(pokemon) {
		if (this.view.model != pokemon) {
			this.view.model = pokemon
			this.collectionView.collection = pokemon.moves.map(m => copyMove(stuff.data.moves[m.name], m.method))
		}
		return this.view
	}
}

class StatNumber extends Component {
	constructor(pokemon, stat) {
		super()
		this.pokemon = pokemon
		this.stat = stat
	}

	renderHasChanged() {
		return false
	}

	renderThis() {
		const pokemon = this.pokemon
		var ivText = pokemon.ivs ? pokemon.ivs[this.stat] : 0
		if (!ivText && ivText != 0)
			ivText = "x"
		var evBase = pokemon.evs ? pokemon.evs[this.stat] : 0
		if (!ivText && ivText != 0)
			ivText = ""
		var blub = pokemon.stats[this.stat]
		if (pokemon.ivs || pokemon.evs)
			blub += " · " + ivText + " · " + evBase
		return l("span" + (pokemon.nature ? natureCssClass(this.stat, pokemon) : ""), "" + blub)
	}

	static styleThis() {
		return {
			".negative-nature": {
				color: "#2ab9b9"
			},
			".positive-nature": {
				color: "#d66"
			}
		}
	}
}

class StatBar extends Component {
	constructor(pokemon, stat) {
		super()
		this.pokemon = pokemon
		this.stat = stat
	}

	renderHasChanged() {
		return false
	}

	renderThis() {
		const pokemon = this.pokemon
		var statBase = pokemon.stats[this.stat]
		var ivText = pokemon.ivs ? pokemon.ivs[this.stat] : 0
		if (!ivText && ivText != 0)
			ivText = "x"
		var evBase = pokemon.evs ? pokemon.evs[this.stat] : 0
		if (!ivText && ivText != 0)
			ivText = ""
		var ivBase = ivText.toString().endsWith("*") ? 31 : ivText
		ivBase = isNaN(+ivBase) ? ivBase.replace(/(^\d+)(.+$)/i, '$1') : +ivBase
		var content = [l("div.stat-bar.base-bar", {
			style: { width: statBase + "px", background: "linear-gradient(to right, red, " + statColor(statBase) + ")" }
		})]
		if (pokemon.ivs || pokemon.evs) {
			content.push(l("div.stat-bar.iv-bar", { style: { width: ivBase / 2 + "px" } }))
			content.push(l("div.stat-bar.ev-bar", { style: { width: evBase / 8 + "px" } }))
		}
		return l("div.container", ...content)
	}

	static styleThis() {
		return {
			".container": {
				display: "flex"
			},
			".stat-bar": {
				float: "left",
				height: "1rem",
				marginTop: "0.5rem"
			},
			".base-bar": {
				backgroundColor: "#00ae00",
				marginLeft: "0.5rem"
			},
			".iv-bar": {
				backgroundColor: "yellow",
				borderLeft: "1px solid black"
			},
			".ev-bar": {
				backgroundColor: "orange",
				borderLeft: "1px solid black"
			}
		}
	}
}

function pokemonEntries(pokemon) {
	const entries = []
	entries.push("Types", typesText(pokemon))
	if (pokemon.nickname)
		entries.push("Nickname", pokemon.nickname)
	else
		entries.push("Classification", pokemon.classification)
	if (pokemon.ability)
		entries.push("Ability", abilityText(pokemon.ability, pokemon.abilities))
	else
		entries.push("Abilities", abilitiesText(pokemon))
	if (pokemon.nature)
		entries.push("Nature", pokemon.nature)
	else
		entries.push("Egg groups", eggGroupsText(pokemon))
	if (pokemon.gender)
		entries.push("Gender", genderText(pokemon))
	else
		entries.push("Gender ratio", genderText(pokemon))
	if (pokemon.hiddenPower)
		entries.push("Hidden power", typeText(pokemon.hiddenPower))
	else
		entries.push("Weight/height", weightHeightText(pokemon))
	if (pokemon.base) {
		if (pokemon.ot || pokemon.tid)
			entries.push("OT", pokemon.ot + (pokemon.tid ? " (" + prependZeroes(pokemon.tid, 6) + ")" : ""))
		for (var i in pokemon.learntMoves)
			entries.push("Move", moveText(pokemon.learntMoves[i]))
		if (pokemon.balls && pokemon.balls.length)
			entries.push("Ball", ballSprites(pokemon))
	}
	else {
		for (var i in pokemon.eggs)
			entries.push("Egg", evolutionText(pokemon, pokemon.eggs[i]))
		if (pokemon.evolvesFrom)
			entries.push("Evolves from", evolutionText(pokemon, pokemon.evolvesFrom))
		for (var i in pokemon.evolvesTo)
			entries.push("Evolves to", evolutionText(pokemon, pokemon.evolvesTo[i]))
	}
	return entries
}

function evolutionText(basePoke, evoInfo) {
	var info = JSON.parse(JSON.stringify(evoInfo))
	if (info.form == "same")
		info.form = basePoke.form
	var pokemon = stuff.data.getPokemonFrom(info)
	return l("div", { style: { display: "flex", height: "2rem" } },
		sprite(pokemon),
		l("div", { style: { height: "2rem", lineHeight: "2rem" } }, formName(pokemon) + (info.method == "Normal" ? "" : " (" + info.method + ")"))
	)
}

function copyMove(move, method) {
	const newMove = {}
	for (var key in move)
		newMove[key] = move[key]
	newMove.method = method
	return newMove
}

function prependZeroes(number, characters) {
	number = number.toString()
	while (number.length < characters) {
		number = "0" + number
	}
	return number
}
