
function switchModeTo(newMode){
	mode = newMode
	update()
}

var basePokemonColumns = [
	{ getColumnHeader: function(){ return "" },
		getColumn: function(pokemon){
			return "<img src='" + getPokemonSpriteName(pokemon) + "'/>"
		}
	},
	{ getColumnHeader: function(){ return "Pokemon" },
		getColumn: function(pokemon){
			return pokemonFormName(pokemon) + (pokemon.nickname ? " ["+pokemon.nickname+"]" : "")
		}
	},
	{ getColumnHeader: function(){ return "Types" },
		getColumn: function(pokemon){
			return getTypesText(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "Abilities" },
		getColumn: function(pokemon){
			return getAbilitiesText(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "HP" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.hp) }
	},
	{ getColumnHeader: function(){ return "Atk" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.atk) }
	},
	{ getColumnHeader: function(){ return "Def" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.def) }
	},
	{ getColumnHeader: function(){ return "SpA" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.spa) }
	},
	{ getColumnHeader: function(){ return "SpD" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.spd) }
	},
	{ getColumnHeader: function(){ return "Spe" },
		getColumn: function(pokemon){ return getStatText(pokemon.stats.spe) }
	},
	{ getColumnHeader: function(){ return "Egg groups" },
		getColumn: function(pokemon){
			return getEggGroupsText(pokemon)
		}
	}
]

var tabPokemonColumns = [
	{ getColumnHeader: function(){ return "" },
		getColumn: function(pokemon){
			return "<img src='" + getPokemonSpriteName(pokemon) + "'/>"
		}
	},
	{ getColumnHeader: function(){ return "Pokemon" },
		getColumn: function(pokemon){
			return pokemonFormName(pokemon) + (pokemon.gender && pokemon.gender != "—" ? " " + getGenderText(pokemon) : "") + getAmountShinyText(pokemon) + (pokemon.nickname ? " ["+pokemon.nickname+"]" : "")
		}
	},
	{ getColumnHeader: function(){ return "Types" },
		getColumn: function(pokemon){
			return getTypesText(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "Ability" },
		getColumn: function(pokemon){
			if(pokemon.ability)
				return getAbilityText(pokemon.ability, pokemon.abilities[2] ? pokemon.abilities[2].toLowerCase() == pokemon.ability.toLowerCase() : false)
			return getAbilitiesText(pokemon)
		}
	},
	{ getColumnHeader: function(){ return "Nature" },
		getColumn: function(pokemon){
			return pokemon.nature ? pokemon.nature : ""
		}
	},
	{ getColumnHeader: function(){ return "HP" },
		getColumn: function(pokemon){ return getIVEVText("hp", pokemon) }
	},
	{ getColumnHeader: function(){ return "Atk" },
		getColumn: function(pokemon){ return getIVEVText("atk", pokemon) }
	},
	{ getColumnHeader: function(){ return "Def" },
		getColumn: function(pokemon){ return getIVEVText("def", pokemon) }
	},
	{ getColumnHeader: function(){ return "SpA" },
		getColumn: function(pokemon){ return getIVEVText("spa", pokemon) }
	},
	{ getColumnHeader: function(){ return "SpD" },
		getColumn: function(pokemon){ return getIVEVText("spd", pokemon) }
	},
	{ getColumnHeader: function(){ return "Spe" },
		getColumn: function(pokemon){ return getIVEVText("spe", pokemon) }
	},
	{ getColumnHeader: function(){ return "Moves" },
		getColumn: function(pokemon){
			return pokemon.learntMoves ? pokemon.learntMoves.join(", ") : ""
		}
	},
	{ getColumnHeader: function(){ return "Ball" },
		getColumn: function(pokemon){
			return getBallsText(pokemon)
		}
	}
]

function getIVEVText(stat, pokemon){
	return " <span style=\"max-width: 2rem;display: inline-block;\">" + getIVText(stat, pokemon) + getEVText(stat, pokemon) + "</span>"
}

function addNextPokemonEntry(){
	if(!pokes[nextPoke]){
		nextPoke = 0
		return
	}
	if(nextPoke > nextLimit){
		nextLimit += mode == "grid" ? 50 : 25
		return
	}
	if(mode == "table")
		addPokemonListElement(pokes[nextPoke])
	else
		addPokemonGridElement(pokes[nextPoke])
	nextPoke++
	setTimeout(addNextPokemonEntry(),0)
}

function setUpTableHeader(){
	var tableHeader = newTag("tr", pokemonList.children[0])
	tableHeader.onclick = showMarkdownTable
	var columns = basePokemonColumns
	if(selectedTab && completionMode == "normal")
		columns = tabPokemonColumns
	for(var i in columns){
		var element = newTag("th", tableHeader)
		element.innerHTML = columns[i].getColumnHeader()
	}
}

function loadMoreWhenScrolledDown(){
	var main = document.getElementById("main")
	if(main.scrollTop > main.scrollHeight-main.clientHeight-200){
		if(nextPoke)
			addNextPokemonEntry()
	}
}

function clearInterface(){
	while (pokemonList.children[0].firstChild)
		pokemonList.children[0].removeChild(pokemonList.children[0].firstChild)
	while (pokemonList.children[1].firstChild)
		pokemonList.children[1].removeChild(pokemonList.children[1].firstChild)
	while (pokemonGrid.firstChild)
		pokemonGrid.removeChild(pokemonGrid.firstChild)
	while (currentFilterList.firstChild)
		currentFilterList.removeChild(currentFilterList.firstChild)
}

function addPokemonListElement(pokemon) {
	var pokeElement = newTag("tr", pokemonList.children[1])
	var columns = basePokemonColumns
	if(selectedTab && completionMode == "normal")
		columns = tabPokemonColumns
	for(var i in columns){
		var element = newTag("th", pokeElement)
		element.innerHTML = columns[i].getColumn(pokemon)
	}
	pokeElement.onclick = function(){
		selectPokemon(pokemon, pokeElement)
	}
	if(nextPoke % 2)
		pokeElement.className = pokemon.got ? "got-odd" : "odd"
	else
		pokeElement.className = pokemon.got ? "got-even" : "even"
}

function addPokemonGridElement(pokemon) {
	var pokeElement = newTag("li", pokemonGrid)
	if(pokemon.got)
		pokeElement.className = "got"
	pokeElement.innerHTML = "<img src='" + getPokemonSpriteName(pokemon) + "'/>"
	pokeElement.onclick = function(){
		selectPokemon(pokemon)
	}
}

function showMarkdownTable(){
	document.getElementById("copy").style.display = ""
	document.getElementById("pokemon-copy-table").value = getMarkdownTable()
}

function getMarkdownTable(){
	var table = `Pokemon| Ability| Nature| IVs| Moves| Pokeball
---|---|----|----|----|----
`
	for(var n in pokes){
		var pokemon = pokes[n]
		table += (pokemon.shiny ? "★ " : "") + 
			pokemonFormName(pokemon) +
		  (pokemon.gender ? " " + pokemon.gender : "") +
		  (pokemon.amount ? " (" + pokemon.amount + ")" : "") + "| "
		if(pokemon.ability)
		  table += pokemon.ability
		table += "| "
		if(pokemon.nature)
		  table += pokemon.nature
		table += "| "
		if(pokemon.ivs)
		  table += pokemon.ivs.hp + "/" + pokemon.ivs.atk + "/" + pokemon.ivs.def + "/" + 
			  pokemon.ivs.spa + "/" + pokemon.ivs.spd + "/" + pokemon.ivs.spe
		table += "| "
		if(pokemon.learntMoves)
			table += pokemon.learntMoves.join(", ")
		table += "| "
		for(var i in pokemon.balls)
			table += "[](/" + pokemon.balls[i].replace(" ","").replace("é","e").toLowerCase() + ") "
		table += "\n"
	}
	return table
}