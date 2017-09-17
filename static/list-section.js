"use strict";

class PokemonColumn {
	constructor(columnHeader, column, options = {}) {
		this.columnHeader = columnHeader
		this.column = column
		for (var i in options)
			this[i] = options[i]
	}
}

class ListSection {
	constructor() {
		this.nextPoke = 0
		this.nextLimit = 50
		this.adding = false

		this.basePokemonColumns = [
			new PokemonColumn("", (pokemon) => "<img src='" + PokeText.spriteName(pokemon) + "'  style='height: 2rem;'/>",
			{
				headerOnClick: () => stuff.headerSection.setSortingMethod("ID")
			}),
			new PokemonColumn("Pokemon", (pokemon) => PokeText.formName(pokemon) + (pokemon.nickname ? " [" + pokemon.nickname + "]" : "")),
			new PokemonColumn("Types", (pokemon) => PokeText.types(pokemon)),
			new PokemonColumn("Abilities", (pokemon) => PokeText.abilities(pokemon)),
			new PokemonColumn("HP", (pokemon) => PokeText.stat(pokemon.stats.hp),
				{
					title: (pokemon) => "Total base stat: " + stuff.data.getTotalBaseStat(pokemon),
					headerOnClick: () => stuff.headerSection.setSortingMethod("HP")
				}),
			new PokemonColumn("Atk", (pokemon) => PokeText.stat(pokemon.stats.atk),
			{
				title: (pokemon) => "Total base stat: " + stuff.data.getTotalBaseStat(pokemon),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Attack")
			}),
			new PokemonColumn("Def", (pokemon) => PokeText.stat(pokemon.stats.def),
			{
				title: (pokemon) => "Total base stat: " + stuff.data.getTotalBaseStat(pokemon),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Defense")
			}),
			new PokemonColumn("SpA", (pokemon) => PokeText.stat(pokemon.stats.spa),
			{
				title: (pokemon) => "Total base stat: " + stuff.data.getTotalBaseStat(pokemon),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Sp. Attack")
			}),
			new PokemonColumn("SpD", (pokemon) => PokeText.stat(pokemon.stats.spd),
			{
				title: (pokemon) => "Total base stat: " + stuff.data.getTotalBaseStat(pokemon),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Sp. Defense")
			}),
			new PokemonColumn("Spe", (pokemon) => PokeText.stat(pokemon.stats.spe),
			{
				title: (pokemon) => "Total base stat: " + stuff.data.getTotalBaseStat(pokemon),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Speed")
			}),
			new PokemonColumn("Egg groups", (pokemon) => PokeText.eggGroups(pokemon))
		]

		this.tabPokemonColumns = [
			new PokemonColumn("", (pokemon) => "<img src='" + PokeText.spriteName(pokemon) + "' style='height: 2rem;'/>",
			{
				headerOnClick: () => stuff.headerSection.setSortingMethod("ID")
			}),
			new PokemonColumn("Pokemon", (pokemon) =>
				PokeText.formName(pokemon) +
				(pokemon.gender && pokemon.gender != "—" ? " " + PokeText.gender(pokemon) : "") +
				PokeText.amountShiny(pokemon) +
				(pokemon.nickname ? " [" + pokemon.nickname + "]" : "")
			),
			new PokemonColumn("Types", (pokemon) => PokeText.types(pokemon)),
			new PokemonColumn("Abilities", (pokemon) => {
				if (pokemon.ability)
					return PokeText.ability(pokemon.ability, pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.split("(")[0].trim().toLowerCase() : false)
				return PokeText.abilities(pokemon)
			}),
			new PokemonColumn("Nature", (pokemon) => pokemon.nature ? pokemon.nature : ""),
			new PokemonColumn("HP", (pokemon) => PokeText.IVEV("hp", pokemon),
			{
				title: (pokemon) => "Stat at lvl 50: " + stuff.data.getStatAtLevel(pokemon, "hp", 50),
				headerOnClick: () => stuff.headerSection.setSortingMethod("HP")
			}),
			new PokemonColumn("Atk", (pokemon) => PokeText.IVEV("atk", pokemon),
			{
				title: (pokemon) => "Stat at lvl 50: " + stuff.data.getStatAtLevel(pokemon, "atk", 50),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Attack")
			}),
			new PokemonColumn("Def", (pokemon) => PokeText.IVEV("def", pokemon),
			{
				title: (pokemon) => "Stat at lvl 50: " + stuff.data.getStatAtLevel(pokemon, "def", 50),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Defense")
			}),
			new PokemonColumn("SpA", (pokemon) => PokeText.IVEV("spa", pokemon),
			{
				title: (pokemon) => "Stat at lvl 50: " + stuff.data.getStatAtLevel(pokemon, "spa", 50),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Sp. Attack")
			}),
			new PokemonColumn("SpD", (pokemon) => PokeText.IVEV("spd", pokemon),
			{
				title: (pokemon) => "Stat at lvl 50: " + stuff.data.getStatAtLevel(pokemon, "spd", 50),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Sp. Defense")
			}),
			new PokemonColumn("Spe", (pokemon) => PokeText.IVEV("spe", pokemon),
			{
				title: (pokemon) => "Stat at lvl 50: " + stuff.data.getStatAtLevel(pokemon, "spe", 50),
				headerOnClick: () => stuff.headerSection.setSortingMethod("Speed")
			}),
			new PokemonColumn("Moves", (pokemon) => pokemon.learntMoves ? pokemon.learntMoves.join(", ") : ""),
			new PokemonColumn("Ball", (pokemon) => PokeText.balls(pokemon))
		]

		this.listElement = document.getElementById("pokemon-list")
		this.gridElement = document.getElementById("pokemon-grid")
	}

	show() {
		this.nextPoke = 0
		this.nextLimit = 50
		stuff.infoSection.moveAway()
		while (this.listElement.children[0].firstChild)
			this.listElement.children[0].removeChild(this.listElement.children[0].firstChild)
		while (this.listElement.children[1].firstChild)
			this.listElement.children[1].removeChild(this.listElement.children[1].firstChild)
		while (this.gridElement.firstChild)
			this.gridElement.removeChild(this.gridElement.firstChild)
		if (stuff.state.mode == "table") {
			this.listElement.style.display = "table"
			this.gridElement.style.display = "none"
			this.setUpTableHeader()
		} else {
			this.listElement.style.display = "none"
			this.gridElement.style.display = "initial"
		}
		this.addNextPokemonEntry()
	}

	addNextPokemonEntry() {
		this.adding = true
		if (!stuff.state.currentPokemons[this.nextPoke]) {
			this.nextPoke = 0
			this.adding = false
			return
		}
		if (this.nextPoke > this.nextLimit) {
			this.nextLimit += stuff.state.mode == "grid" ? 50 : 25
			this.adding = false
			return
		}
		if (stuff.state.mode == "table")
			this.addPokemonListElement(stuff.state.currentPokemons[this.nextPoke])
		else
			this.addPokemonGridElement(stuff.state.currentPokemons[this.nextPoke])
		this.nextPoke++
		setTimeout(() => { this.addNextPokemonEntry() }, 0)
	}

	setUpTableHeader() {
		var tableHeader = newTag("tr", this.listElement.children[0])
		var columns = this.basePokemonColumns
		if (stuff.state.currentPokemons[0] && stuff.state.currentPokemons[0].base && stuff.state.completionMode == "normal")
			columns = this.tabPokemonColumns
		for (var i in columns) {
			var element = newTag("th", tableHeader)
			element.innerHTML = columns[i].columnHeader
			if(columns[i].headerOnClick)
				element.onclick = columns[i].headerOnClick
		}
	}

	loadMoreWhenScrolledDown() {
		if (this.adding)
			return
		var main = document.getElementById("main")
		if (main.scrollTop > main.scrollHeight - main.clientHeight - 200) {
			if (this.nextPoke)
				this.addNextPokemonEntry()
		}
	}

	addPokemonListElement(pokemon) {
		var pokeElement = newTag("tr", this.listElement.children[1])
		var columns = this.basePokemonColumns
		if (stuff.state.currentPokemons[0] && stuff.state.currentPokemons[0].base && stuff.state.completionMode == "normal")
			columns = this.tabPokemonColumns
		for (var i in columns) {
			var element = newTag("th", pokeElement)
			if (pokemon.notes)
				element.title = pokemon.notes
			element.innerHTML = columns[i].column(pokemon)
			if (columns[i].title)
				element.title = columns[i].title(pokemon)
		}
		pokeElement.onclick = function () {
			stuff.selectPokemon(pokemon, pokeElement)
		}
		if (this.nextPoke % 2)
			pokeElement.className = pokemon.got ? "got-odd" : "odd"
		else
			pokeElement.className = pokemon.got ? "got-even" : "even"
	}

	addPokemonGridElement(pokemon) {
		var pokeElement = newTag("li", this.gridElement)
		if (pokemon.got)
			pokeElement.className = "got"
		pokeElement.innerHTML = "<img src='" + PokeText.spriteName(pokemon) + "'/>"
		pokeElement.onclick = function () {
			stuff.selectPokemon(pokemon)
		}
	}
}