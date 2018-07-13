import { l, Component } from "../../archive/arf/arf.js"

export function formName(pokemon) {
	switch (pokemon.form) {
		case "Base":
			return pokemon.name
		case "Mega X":
			return "Mega " + pokemon.name + " X"
		case "Mega Y":
			return "Mega " + pokemon.name + " Y"
		default:
			return pokemon.form + " " + pokemon.name
	}
}

export function extendedName(pokemon) {
	return l("span",
		formName(pokemon), " ",
		pokemon.gender && pokemon.gender != "—" ? genderText(pokemon) : "", " ",
		amountText(pokemon), " ",
		shinyText(pokemon), " ",
		pokemon.nickname ? " [" + pokemon.nickname + "]" : ""
	)
}

export function sprite(pokemon) {
	var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀", "-f").replace("♂", "-m").replace("'", "").replace(".", "").replace("ébé", "ebe").replace(":", "")
	const form = (pokemon.form || "").toLowerCase()
	if (pokemon.forms && pokemon.form && !form.includes(pokemon.forms[0].toLowerCase())) {
		var formname
		if (form.includes("alola"))
			formname = "alola"
		else if (form.includes("10%"))
			formname = "10-percent"
		else if (form == "core form")
			formname = "core-red"
		else if (form == "female")
			formname = false
		else if (form.includes("size"))
			formname = pokemon.form.split("-")[0]
		else if (form.includes("mega"))
			formname = pokemon.form.replace(" ", "-")
		else if (name.includes("necrozma"))
			formname = pokemon.form.replace(" ", "-")
		else if (form.includes("core"))
			formname = pokemon.form.replace(" ", "-")
		else if (form == "ash-greninja")
			formname = "ash"
		else if (!form.includes("base"))
			formname = pokemon.form
		if (formname && pokemon.name != "Vivillon")
			formname = formname.split(" ")[0]
		if (formname)
			formname = formname.toLowerCase().replace(" ", "-").replace("'", "-").replace("é", "e-").replace("!", "exclamation").replace("?", "question")
	}

	var icon = PkSpr.decorate({
		slug: name,
		form: formname,
		color: pokemon.shiny ? "shiny" : "regular",
		gender: (!formname && pokemon.forms && pokemon.forms[0] == "Male" && (pokemon.form.toLowerCase() == "female" || pokemon.gender == "♀" || pokemon.gender == "f")) ? "female" : "male"
	})
	return l("span", {
		style: {
			background: "url('static/pokesprite.png')",
			backgroundPosition: "-" + icon.data.coords.x + "px -" + icon.data.coords.y + "px",
			width: "40px",
			height: "30px",
			imageRendering: "pixelated",
			display: "inline-block"
		}
	})
}

export function imageName(pokemon) {
	var form = ""
	if (pokemon.form && pokemon.form != "Base" && pokemon.name != "Pumpkaboo" && pokemon.name != "Gourgeist") {
		form = pokemon.form.toLowerCase().replace("'", "").replace("%", "p").split(" ")//.join("-")
		if (form.length > 1 && form[0] !== "mega")
			form = form.splice(0, form.length - 1).join("-")
		else
			form = form.join("-")
		form = "-" + form
	}
	var gender = ""
	if (pokemon.gender == "♀" || pokemon.gender == "f")
		switch (pokemon.id) {
			case 521:
			case 592:
			case 593:
			case 668:
			case 678:
				gender = "female/"
		}
	return "./static/sugimori/" + gender + pokemon.id + form + ".png"
}

export function defenseText(defense) {
	const span = (factor, color) => l("div", {
		style: {
			height: "1.5rem",
			width: "1.5rem",
			background: color,
			color: "white",
			fontWeight: "bold",
			textAlign: "center"
		}
	}, factor)
	if (defense == 4)
		return span("4", "#10c210")
	if (defense == 2)
		return span("2", "green")
	if (defense == 1)
		return span("1", "rgba(120,120,120,0.5)")
	if (defense == 0.5)
		return span("½", "#b22")
	if (defense == 0.25)
		return span("¼", "#800")
	if (defense == 0)
		return span("0", "#333")
}

export function typeText(type) {
	return l("span", { style: { color: stuff.data.typeColors[type] } }, type)
}

export function typesText(pokemon) {
	return l("span",
		typeText(pokemon.types[0]),
		...(pokemon.types[1] ? [" · ", typeText(pokemon.types[1])] : [])
	)
}

export function moveText(move, eggMove) {
	return l("span", eggMove ? { style: { fontStyle: "italic" } } : {}, move)
}

export function movesText(pokemon) {
	const elements = []
	for (var move of (pokemon.learntMoves || []))
		elements.push(moveText(move, !!pokemon.moves.filter(m => m.method == "egg").find(m => m == move)), " · ")
	elements.splice(elements.length - 1, 1)
	return l("span", elements)
}

export function abilityText(ability, abilities) {
	const abilityEntry = stuff.data.abilities[ability.split("(")[0].trim()]
	return l("span", {
		style: abilities[2] == ability ? { fontStyle: "italic" } : {},
		title: abilityEntry ? abilityEntry.summary : ""
	}, ability)
}

export function abilitiesText(pokemon, showAbilityIfExists) {
	if (showAbilityIfExists && pokemon.ability)
		return l("span", abilityText(pokemon.ability, pokemon.abilities))
	return l("span",
		abilityText(pokemon.abilities[0], pokemon.abilities),
		...(pokemon.abilities[1] ? [" · ", abilityText(pokemon.abilities[1], pokemon.abilities)] : []),
		...(pokemon.abilities[2] ? [" · ", abilityText(pokemon.abilities[2], pokemon.abilities)] : [])
	)
}

export function eggGroupsText(pokemon) {
	if (!pokemon.eggGroups) return "—"
	var text = pokemon.eggGroups[0]
	if (pokemon.eggGroups[1])
		text += " · " + pokemon.eggGroups[1]
	return text
}

export function genderText(pokemon) {
	if (pokemon.gender) {
		if (pokemon.gender == "♂" || pokemon.gender.toLowerCase() == "m" || pokemon.gender.toLowerCase() == "male")
			return l("span", { style: { color: "#34d1ba" } }, "♂")
		if (pokemon.gender == "♀" || pokemon.gender.toLowerCase() == "f" || pokemon.gender.toLowerCase() == "female")
			return l("span", { style: { color: "#f97272" } }, "♀")
		if ((pokemon.ratio || pokemon.ratio == "—") && pokemon.gender == "—" || pokemon.gender.toLowerCase() == "-" || pokemon.gender.toLowerCase() == "none")
			return "—"
	}
	if (!pokemon.ratio || pokemon.ratio == "—") return "—"
	var things = pokemon.ratio.split(":")
	return l("span",
		l("span", { style: { color: "#34d1ba" } }, things[0] + "♂"),
		":",
		l("span", { style: { color: "#f97272" } }, things[1] + "♀")
	)
}

export function weightHeightText(pokemon) {
	var text = "-"
	if (pokemon.weight)
		text = pokemon.weight
	text += " / "
	if (pokemon.height)
		text += pokemon.height
	else
		text += "-"
	return text
}

export function standardBallName(ball) {
	ball = ball.split(" ")[0].toLowerCase()
	ball = ball.split("ball")[0].replace("é", "e")
	return ball
}

export function ballSprites(pokemon) {
	return l("span", ...(pokemon.balls || []).map(e => ballSprite(e)))
}

export function ballSprite(ball) {
	ball = standardBallName(ball)

	var icon = PkSpr.decorate({ slug: ball, type: "pokeball" })
	return l("span", {
		style: {
			background: "url('static/pokesprite.png')",
			backgroundPosition: "-" + icon.data.coords.x + "px -" + icon.data.coords.y + "px",
			width: "32px",
			height: "32px",
			imageRendering: "pixelated",
			display: "inline-block"
		},
		title: ball + " ball"
	})
}

export function statText(stat) {
	return l("span", { style: { color: statColor(stat), textShadow: "1px 1px #333" } }, stat)
}

export function statColor(stat) {
	return "rgb(" + HSVtoRGB(0.6 * stat / 255, 1, 1) + ")"
}

export function amountText(pokemon) {
	return pokemon.amount ? " (" + pokemon.amount + ") " : ""
}

export function shinyText(pokemon) {
	return l("span", { style: { color: "#f11" } }, pokemon.shiny ? " ★ " : "")
}

export class IVEVText extends Component {
	constructor(stat, pokemon) {
		super()
		this.stat = stat
		this.pokemon = pokemon
	}

	renderThis() {
		return IVEV(this.stat, this.pokemon)
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

export function IV(stat, pokemon) {
	var iv = pokemon.ivs ? pokemon.ivs[stat] : undefined
	if (iv == undefined)
		iv = "x"
	return l("span" + natureCssClass(stat, pokemon), iv)
}

export function EV(stat, pokemon) {
	var hasEvs = false
	for (var i in pokemon.evs) {
		if (pokemon.evs[i] > 0) {
			hasEvs = true
			break
		}
	}
	if (!hasEvs)
		return ""
	var ev = pokemon.evs ? pokemon.evs[stat] : undefined
	if (ev == undefined)
		ev = "—"
	return l("span" + natureCssClass(stat, pokemon), { style: { fontSize: "0.7rem", display: "block" } }, ev)
}

export function IVEV(stat, pokemon) {
	return l("span", { style: { maxWidth: "2rem", display: "inline-block" } },
		IV(stat, pokemon), EV(stat, pokemon))
}

export function natureCssClass(stat, pokemon) {
	var nature = stuff.data.natures[pokemon.nature]
	if (!nature)
		return ""
	if (nature.positive == nature.negative)
		return ""
	else if (stat == parseStatType(nature.positive))
		return ".positive-nature"
	else if (stat == parseStatType(nature.negative))
		return ".negative-nature"
}

function parseStatType(text) {
	if (["hp", "health"].indexOf(text.trim().toLowerCase()) > -1)
		return "hp"
	if (["atk", "attack"].indexOf(text.trim().toLowerCase()) > -1)
		return "atk"
	if (["def", "defense"].indexOf(text.trim().toLowerCase()) > -1)
		return "def"
	if (["spa", "sp. atk", "sp. attack", "special attack"].indexOf(text.trim().toLowerCase()) > -1)
		return "spa"
	if (["spd", "sp. def", "sp. defense", "special defense"].indexOf(text.trim().toLowerCase()) > -1)
		return "spd"
	if (["spe", "speed"].indexOf(text.trim().toLowerCase()))
		return "spe"
}

export function learnMethodText(move) {
	if (move.method > 0)
		return "Lvl " + move.method
	switch (move.method) {
		case "tm": return "TM"
		case "tutor": return "Tutor"
		case "egg": return "Egg"
		case "evolution": return "Evolution"
	}
	return move.method
}

function HSVtoRGB(h, s, v) {
	var r, g, b, i, f, p, q, t
	i = Math.floor(h * 6)
	f = h * 6 - i
	p = v * (1 - s)
	q = v * (1 - f * s)
	t = v * (1 - (1 - f) * s)
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255)
}
