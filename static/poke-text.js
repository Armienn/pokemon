"use strict";

class PokeText {

	static formName(pokemon) {
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

	static spriteName(pokemon) {
		var name = pokemon.name.toLowerCase().replace(" ", "-").replace("♀", "-f").replace("♂", "-m").replace("'", "").replace(".", "").replace("ébé", "ebe").replace(":", "")
		if (pokemon.forms && pokemon.form && !textContains(pokemon.form, pokemon.forms[0])) {
			var formname
			if (textContains(pokemon.form, "alola"))
				formname = "alola"
			else if (textContains(pokemon.form, "10%"))
				formname = "10-percent"
			else if (pokemon.form.toLowerCase() == "core form")
				formname = "core-red"
			else if (pokemon.form.toLowerCase() == "female")
				formname = false
			else if (textContains(pokemon.form, "size"))
				formname = false
			else if (textContains(pokemon.form, "mega"))
				formname = pokemon.form.replace(" ", "-")
			else if (textContains(pokemon.form, "core"))
				formname = pokemon.form.replace(" ", "-")
			else if (pokemon.form == "Ash-Greninja")
				formname = "ash"
			else if (!textContains(pokemon.form, "base"))
				formname = pokemon.form
			if (formname && pokemon.name != "Vivillon")
				formname = formname.split(" ")[0]
			if (formname)
				name += "-" + formname.toLowerCase().replace(" ", "-").replace("'", "-").replace("é", "e-").replace("!", "exclamation").replace("?", "question")
		}
		if (!formname && pokemon.forms && pokemon.forms[0] == "Male" && (pokemon.form.toLowerCase() == "female" || pokemon.gender == "♀"))
			name = "female/" + name
		return "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/" +
			(pokemon.shiny ? "shiny" : "regular") +
			"/" + name + ".png"
	}

	static imageName(pokemon) {
		var form = ""
		if (pokemon.form && pokemon.form != "Base" &&
			pokemon.name != "Vivillon" &&
			pokemon.name != "Flabébé" &&
			pokemon.name != "Floette" &&
			pokemon.name != "Florges" &&
			pokemon.name != "Minior" &&
			pokemon.name != "Unown" &&
			pokemon.forms && !textContains(pokemon.form, pokemon.forms[0])) {
			for (var i in pokemon.forms) {
				var temp = pokemon.forms[i]
				if (textContains(pokemon.form, temp)) {
					form = "_f" + (+i + (pokemon.name == "Zygarde" ? 2 : 1))
					break
				}
			}
		}
		if (pokemon.form.indexOf("Core") > -1)
			form = "_f2"
		return "http://assets.pokemon.com/assets/cms2/img/pokedex/full/" + prependZeroes(pokemon.id, 3) + form + ".png"
	}

	static defense(defense) {
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

	static type(type) {
		return "<span style='color:" + stuff.data.typeColors[type] + ";'>" + type + "</span>"
	}

	static types(pokemon) {
		return PokeText.type(pokemon.types[0]) + (pokemon.types[1] ? " · " + PokeText.type(pokemon.types[1]) : "")
	}

	static move(move, eggMove) {
		return "<span" + (eggMove ? " style='font-style: italic;'" : "") + ">" + move + "</span>"
	}

	static ability(ability, hidden, link) {
		return "<span" + (hidden ? " style='font-style: italic;'" : "") + (stuff.data.abilities[ability.split("(")[0].trim()] ? " title='" + stuff.data.abilities[ability.split("(")[0].trim()].summary.replace("'", "&#39;").replace("\"", "&#34;") + "'" : "") + ">" + (link ? PokeText.abilityLink(ability) : ability) + "</span>"
	}

	static abilities(pokemon, link) {
		var text = PokeText.ability(pokemon.abilities[0], false, link)
		if (pokemon.abilities[1])
			text += " · " + PokeText.ability(pokemon.abilities[1], false, link)
		if (pokemon.abilities[2])
			text += " · " + PokeText.ability(pokemon.abilities[2], true, link)
		return text
	}

	static abilityLink(ability) {
		ability = ability.split("(")[0].trim()
		var name = ability.toLowerCase().replace(" ", "")
		var url = "http://www.serebii.net/abilitydex/" + name + ".shtml"
		return "<a href='" + url + "'>" + ability + "</a>"
	}

	static eggGroup(eggGroup) {
		return "<span>" + eggGroup + "</span>"
	}

	static eggGroups(pokemon) {
		if (!pokemon.eggGroups) return "—"
		var text = PokeText.eggGroup(pokemon.eggGroups[0])
		if (pokemon.eggGroups[1])
			text += " · " + PokeText.eggGroup(pokemon.eggGroups[1])
		return text
	}

	static gender(pokemon) {
		if (pokemon.gender) {
			if (pokemon.gender == "♂" || pokemon.gender.toLowerCase() == "m" || pokemon.gender.toLowerCase() == "male")
				return "<span style='color: #34d1ba;'>♂</span>"
			if (pokemon.gender == "♀" || pokemon.gender.toLowerCase() == "f" || pokemon.gender.toLowerCase() == "female")
				return "<span style='color: #f97272;'>♀</span>"
			if ((pokemon.ratio || pokemon.ratio == "—") && pokemon.gender == "—" || pokemon.gender.toLowerCase() == "-" || pokemon.gender.toLowerCase() == "none")
				return "—"
		}
		if (!pokemon.ratio || pokemon.ratio == "—") return "—"
		var things = pokemon.ratio.split(":")
		return "<span style='color: #34d1ba;'>" + things[0] + "♂</span>:<span style='color: #f97272;'>" + things[1] + "♀</span>"
	}

	static weightHeight(pokemon) {
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

	static balls(pokemon) {
		var text = ""
		for (var i in pokemon.balls) {
			var ball = pokemon.balls[i].split(" ")[0].toLowerCase()
			ball = ball.split("ball")[0].replace("é", "e")
			var url = "https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokeball/" + ball + ".png"
			text += "<img src='" + url + "' title='" + pokemon.balls[i] + "'></img>"
		}
		return text
	}

	static stat(stat) {
		return "<span style='color:" + PokeText.statColor(stat) + "; text-shadow: 1px 1px #333;'>" + stat + "</span>"
	}

	static statColor(stat) {
		return "rgb(" + HSVtoRGB(0.6 * stat / 255, 1, 1) + ")"
	}

	static amountShiny(pokemon) {
		return " " + (pokemon.shiny ? "<span style='color:#f11;'>★</span>" : "") + (pokemon.amount ? " (" + pokemon.amount + ")" : "")
	}

	static IV(iv, pokemon) {
		var cssClass = PokeText.natureCssClass(iv, pokemon)
		return "<span class='" + cssClass + "'>" + (pokemon.ivs ? pokemon.ivs[iv] : "x") + "</span>"
	}

	static EV(ev, pokemon) {
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
		return " <span class='" + cssClass + "' style=\"font-size:0.7rem;display: block;\">" + (pokemon.evs[ev] > 0 ? pokemon.evs[ev] : "—") + "</span>"
	}

	static IVEV(stat, pokemon) {
		return " <span style=\"max-width: 2rem;display: inline-block;\">" + PokeText.IV(stat, pokemon) + PokeText.EV(stat, pokemon) + "</span>"
	}

	static natureCssClass(stat, pokemon) {
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
}
