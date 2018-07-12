import { l, Component, update } from "../../archive/arf/arf.js"
import { SelectionView } from "../../archive/search/selection-view.js"
import { shinyText, amountText, imageName, typesText, abilitiesText, eggGroupsText, genderText, weightHeightText, abilityText, typeText, moveText, ballSprites, sprite, formName, natureCssClass, statColor, defenseText, standardBallName } from "./pokemon-display.js"
import { CollectionView } from "../../archive/search/collection-view.js"
import { Styling } from "../../archive/search/styling.js"
import { Pokemon } from "./pokemon-data.js"

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
					pokemon.level ? l("span", { style: { fontSize: "1rem" } }, " - Lv." + pokemon.level) : "",
					pokemon.language ? l("span", { style: { fontSize: "1rem" } }, " - " + pokemon.language) : ""
				],
				colors: (pokemon) => pokemon.types.map(e => stuff.data.typeColors[e])
			},
			upperContent: (pokemon) => [l("div", { style: { padding: "0.5rem" } }, pokemon.notes || pokemon.description)],
			gridContent: (pokemon) => [
				l("img", {
					style: { gridArea: "span 7", height: "13rem", margin: "0.5rem", justifySelf: "center" },
					src: imageName(pokemon)
				}), ,
				...SelectionView.entries({ span: 7 }, ...mainInfoEntries(pokemon)),
				...SelectionView.entries({ span: 7, columns: "auto min-content auto" },
					"HP", new StatNumber(pokemon, "hp"), new StatBar(pokemon, "hp"),
					"Attack", new StatNumber(pokemon, "atk"), new StatBar(pokemon, "atk"),
					"Defense", new StatNumber(pokemon, "def"), new StatBar(pokemon, "def"),
					"Sp. Atk", new StatNumber(pokemon, "spa"), new StatBar(pokemon, "spa"),
					"Sp. Def", new StatNumber(pokemon, "spd"), new StatBar(pokemon, "spd"),
					"Speed", new StatNumber(pokemon, "spe"), new StatBar(pokemon, "spe"),
					"Total", totalStats(pokemon)
				),
				...SelectionView.entries(
					{ span: 7, columns: "auto min-content min-content auto", rowHeight: "1.5rem", rows: 9 },
					...typeEntries(pokemon)),
				...SelectionView.entries({ span: 7 }, ...extraInfoEntries(pokemon))
			],
			lowerContent: (pokemon) => [l("header", { style: { background: "rgba(" + Styling.styling.tableColor + ",0.3)" } }, "Moves"), this.collectionView]
		}, {
				editable: (pokemon) => !!pokemon.base,
				onAccept: (pokemon, newPokemon) => {
					for (var key in newPokemon)
						if (key !== "base")
							pokemon[key] = newPokemon[key]
					pokemon.learntMoves = Object.keys(pokemon.learntMoves).map(k => pokemon.learntMoves[k]).filter(e => e)
					pokemon.base = new Pokemon(newPokemon).base
					site.sections.collection.collectionComponent.hasChanged = true
					site.sections.collection.collectionComponent.cachedEntries.delete(pokemon)
					site.engine.updateFilteredCollection()
				},
				onDelete: (pokemon) => {
					site.clearSelection()
					this.collection.splice(this.collection.indexOf(pokemon), 1)
					site.engine.changed(true)
				},
				upperContent: (pokemon) => [l("input", {
					style: { padding: "0.5rem", width: "40rem", maxWidth: "calc(100% - 1rem)" },
					placeholder: "notes",
					onChange: (event) => {
						pokemon.notes = event.target.value
					},
					value: pokemon.notes
				})],
				gridContent: (pokemon) => {
					var poke = new Pokemon(pokemon)
					return [
						l("img", {
							style: { gridArea: "span 7", height: "13rem", margin: "0.5rem", justifySelf: "center" },
							src: imageName(pokemon)
						}),
						...SelectionView.editEntries(pokemon, { span: 7 },
							"Form", { key: "form", options: poke.forms, restricted: true },
							"Nickname", { key: "nickname" },
							"Ability", { key: "ability", options: ["", ...poke.abilities.filter(e => e)], restricted: true },
							"Nature", { key: "nature", options: Object.keys(stuff.data.natures) },
							"Gender", { key: "gender", options: ["", "♂", "♀", "—"], restricted: true },
							"Shiny", { key: "shiny", options: ["", "yes", "no"], restricted: true },
							"Language", { key: "language" },
							"Level", { key: "level", type: "number" },
							"Move", { value: nested(pokemon, "learntMoves", "0"), set: setNested(pokemon, "learntMoves", "0") },
							"Move", { value: nested(pokemon, "learntMoves", "1"), set: setNested(pokemon, "learntMoves", "1") },
							"Move", { value: nested(pokemon, "learntMoves", "2"), set: setNested(pokemon, "learntMoves", "2") },
							"Move", { value: nested(pokemon, "learntMoves", "3"), set: setNested(pokemon, "learntMoves", "3") },
							"Item", { key: "item" },
							"Count", { key: "count" },
							"OT", { key: "ot", short: true },
							"HP IV", { value: nested(pokemon, "ivs", "hp"), set: setNested(pokemon, "ivs", "hp"), short: true },
							"Attack IV", { value: nested(pokemon, "ivs", "atk"), set: setNested(pokemon, "ivs", "atk"), short: true },
							"Defense IV", { value: nested(pokemon, "ivs", "def"), set: setNested(pokemon, "ivs", "def"), short: true },
							"Sp. Atk IV", { value: nested(pokemon, "ivs", "spa"), set: setNested(pokemon, "ivs", "spa"), short: true },
							"Sp. Def IV", { value: nested(pokemon, "ivs", "spd"), set: setNested(pokemon, "ivs", "spd"), short: true },
							"Speed IV", { value: nested(pokemon, "ivs", "spe"), set: setNested(pokemon, "ivs", "spe"), short: true },
							"TID", { key: "tid", short: true },
							"HP EV", { value: nested(pokemon, "evs", "hp"), set: setNested(pokemon, "evs", "hp"), short: true },
							"Attack EV", { value: nested(pokemon, "evs", "atk"), set: setNested(pokemon, "evs", "atk"), short: true },
							"Defense EV", { value: nested(pokemon, "evs", "def"), set: setNested(pokemon, "evs", "def"), short: true },
							"Sp. Atk EV", { value: nested(pokemon, "evs", "spa"), set: setNested(pokemon, "evs", "spa"), short: true },
							"Sp. Def EV", { value: nested(pokemon, "evs", "spd"), set: setNested(pokemon, "evs", "spd"), short: true },
							"Speed EV", { value: nested(pokemon, "evs", "spe"), set: setNested(pokemon, "evs", "spe"), short: true }
						),
						pokeballEditSection(pokemon)
					]
				}
			}
		)
	}

	withPokemon(pokemon, collection) {
		if (this.view.model != pokemon) {
			this.view.model = pokemon
			this.collection = collection
			this.collectionView.collection = pokemon.moves.map(m => copyMove(stuff.data.moves[m.name], m.method))
		}
		return this.view
	}
}

function nested(model, field, innerField) {
	return model[field] ? model[field][innerField] : ""
}

function setNested(model, field, innerField) {
	return value => {
		if (!model[field])
			model[field] = {}
		model[field][innerField] = value
	}
}

function totalStats(pokemon) {
	var sum = 0
	for (var stat in pokemon.stats)
		sum += pokemon.stats[stat]
	return sum
}

function typeEntries(pokemon) {
	const entries = []
	var typeNames = Object.keys(stuff.data.types)
	for (var i = 0; i < typeNames.length / 2; i++)
		entries.push(
			typeText(typeNames[i]),
			defenseText(stuff.data.tallyDefense(typeNames[i], pokemon)),
			defenseText(stuff.data.tallyDefense(typeNames[i + 9], pokemon)),
			l("span", { style: { color: "#888", marginLeft: "0.5rem" } }, "| ", typeText(typeNames[i + 9]))
		)
	return entries
}

function mainInfoEntries(pokemon) {
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
	if (pokemon.item)
		entries.push("Held item", pokemon.item)
	else
		entries.push("Catch rate", "" + (pokemon.catchRate || "—"))
	return entries
}

function extraInfoEntries(pokemon) {
	const entries = []
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

function pokeballEditSection(pokemon) {
	var elements = stuff.data.pokeballs.map(b => ballElement(b, pokemon))
	return l("div", {
		style: { gridArea: "span 7", height: "13rem", margin: "0.5rem", justifySelf: "center" }
	},
		l("div", { style: { color: "#888", textAlign: "center" } }, "Balls"),
		elements
	)
}

function ballElement(ball, pokemon) {
	ball = standardBallName(ball)
	const index = pokemon.balls.findIndex(b => standardBallName(b) === ball)
	const exists = index > -1
	const icon = PkSpr.decorate({ slug: ball, type: "pokeball" })
	return l("span", {
		style: {
			background: "url('static/pokesprite.png')",
			backgroundPosition: "-" + icon.data.coords.x + "px -" + icon.data.coords.y + "px",
			width: "32px",
			height: "32px",
			imageRendering: "pixelated",
			display: "inline-block",
			filter: exists ? "drop-shadow(0px 0px 2px white)" : "grayscale(1)"
		},
		onclick: () => {
			if (exists)
				pokemon.balls.splice(index, 1)
			else
				pokemon.balls.push(ball)
			update()
		},
		title: ball + " ball"
	})
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
		return l("span" + (pokemon.nature ? natureCssClass(this.stat, pokemon) : ""), blub)
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
