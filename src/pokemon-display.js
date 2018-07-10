import { l } from "../../archive/arf/arf.js"

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

export function defense(defense) {
	if (defense == 4)
		return "<span style='color:#10c210;'>4</span>"
	if (defense == 2)
		return "<span style='color:green;'>2</span>"
	if (defense == 1)
		return "1"
	if (defense == 0.5)
		return "<span style='color:#ba2323;'>½</span>"
	if (defense == 0.25)
		return "<span style='color:#8c0101;'>¼</span>"
	if (defense == 0)
		return "<span style='color:#888888;'>0</span>"
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
	return "<span" + (eggMove ? " style='font-style: italic;'" : "") + ">" + move + "</span>"
}

export function abilityText(ability, hidden, link) {
	const abilityEntry = stuff.data.abilities[ability.split("(")[0].trim()]
	return l("span", {
		style: hidden ? { fontStyle: "italic" } : {},
		title: abilityEntry ? abilityEntry.summary : ""
	},
		(link ? abilityLink(ability) : ability)
	)
}

export function abilitiesText(pokemon, link) {
	return l("span",
		abilityText(pokemon.abilities[0], false, link),
		...(pokemon.abilities[1] ? [" · ", abilityText(pokemon.abilities[1], false, link)] : []),
		...(pokemon.abilities[2] ? [" · ", abilityText(pokemon.abilities[2], true, link)] : [])
	)
}

export function abilityLink(ability) {
	ability = ability.split("(")[0].trim()
	var name = ability.toLowerCase().replace(" ", "")
	var url = "http://www.serebii.net/abilitydex/" + name + ".shtml"
	return "<a href='" + url + "'>" + ability + "</a>"
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

export function balls(pokemon) {
	var text = ""
	for (var i in pokemon.balls)
		text += "<img src='" + PokeText.ballUrl(pokemon.balls[i]) + "' title='" + pokemon.balls[i] + "'></img>"
	return text
}

export function ballUrl(ball) {
	ball = ball.split(" ")[0].toLowerCase()
	ball = ball.split("ball")[0].replace("é", "e")
	return "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokeball/" + ball + ".png"
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

export function IV(iv, pokemon) {
	var cssClass = PokeText.natureCssClass(iv, pokemon)
	var iv = pokemon.ivs ? pokemon.ivs[iv] : undefined
	if (iv == undefined)
		iv = "x"
	return "<span class='" + cssClass + "'>" + iv + "</span>"
}

export function EV(ev, pokemon) {
	var hasEvs = false
	for (var i in pokemon.evs) {
		if (pokemon.evs[i] > 0) {
			hasEvs = true
			break
		}
	}
	if (!hasEvs)
		return ""
	var cssClass = PokeText.natureCssClass(ev, pokemon)
	var ev = pokemon.evs ? pokemon.evs[ev] : undefined
	if (ev == undefined)
		ev = "—"
	return " <span class='" + cssClass + "' style=\"font-size:0.7rem;display: block;\">" + ev + "</span>"
}

export function IVEV(stat, pokemon) {
	return " <span style=\"max-width: 2rem;display: inline-block;\">" + PokeText.IV(stat, pokemon) + PokeText.EV(stat, pokemon) + "</span>"
}

export function natureCssClass(stat, pokemon) {
	var nature = stuff.data.natures[pokemon.nature]
	if (!nature)
		return ""
	if (nature.positive == nature.negative)
		return ""
	else if (stat == parseStatType(nature.positive))
		return "positive-nature"
	else if (stat == parseStatType(nature.negative))
		return "negative-nature"
}

export function learnMethodText(move){
	if(move.method>0)
		return "Lvl " + move.method
	if(move.method == "tm")
		return "TM"
	if(move.method == "tutor")
		return "Tutor"
	if(move.method == "egg")
		return "Egg"
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
