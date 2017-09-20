# Pokémon Stuff

A site for browsing Pokémon (all base Pokémon, as well as Pokémon loaded from Google Sheets collections or other resources) with powerful searching, filtering and sorting features

## Features

* Browse the list of all Pokémon and find just the Pokémon you want using a plethora of filters
* Make your own custom filter or sorting function if you know javascript
* Import Pokémon from various formats: JSON / CSV / TSV / Smogon / Reddit Markdown Table
* Or even import using javascript, and make use of all the extra possibilities that entails
* Export Pokémon to most of those same formats
* Browse all your Pokémon, or just those in specific tabs
* Edit Pokémon and Pokémon collections
* Pokémons not loaded from external sources are stored in your browser, and will be there when you open up the site again
* Simple display of how complete your collection is
* Automatically calculates breedables based on your Pokémon (although this feature is in need of some love still)
* Link to [a](https://armienn.github.io/pokemon/#Magearna) [specific](https://armienn.github.io/pokemon/#123) [Pokémon](https://armienn.github.io/pokemon/#nidoran-m)
* Link to your collection [in a spreadsheet](https://armienn.github.io/pokemon/?1FOnsr7np65g0RhTETo1gMS298alHhTNwngT_8oYrZvI#2), [a json file](https://armienn.github.io/pokemon/?json:gist.githubusercontent.com/Armienn/dbcc734e78c27eee1c6590f1cd11fd17/raw/e30d8b5a6330d5affbcb3512cd2399ed5603aaee/test-json-pokemons.json), [a script](https://armienn.github.io/pokemon/?script:gist.githubusercontent.com/Armienn/27b4759d86c33542656f255efd1e50af/raw/47e287512645df0a4f75a515d48f9268a7340604/test-pokemons.js) et cetera
* Faster loading than sharing a Google Sheets document

## How to Use with Spreadsheets

1. Have a Google Spreadsheet with Pokémon in it
2. Publish it (`File > Publish to the web…`)
3. Add your spreadsheet id to the end of this link: `https://armienn.github.io/pokemon/?spreadsheet-id`

Example: [`https://armienn.github.io/pokemon/?1FOnsr7np65g0RhTETo1gMS298alHhTNwngT_8oYrZvI`](https://armienn.github.io/pokemon/?1FOnsr7np65g0RhTETo1gMS298alHhTNwngT_8oYrZvI)

Don't have a sheet? Copy [this template spreadsheet](https://docs.google.com/spreadsheets/d/1mhDDWpfizdO1AitOMzAxODRQYNlHQAkpRRqBauzn4cI/edit?usp=sharing) and start filling in your data.

For the best experience your spreadsheets first tab should look somewhat like in [the template spreadsheet](https://docs.google.com/spreadsheets/d/1mhDDWpfizdO1AitOMzAxODRQYNlHQAkpRRqBauzn4cI/edit?usp=sharing). This spreadsheet also contains a template worksheet with all the supported columns.

The script tries a few different column names for every piece of Pokémon information, so the columns don't need to have the same exact headers. E.g. both "ATK IV" and "IV Attack" will work for the Pokémon's attack IV. Pokéballs in particular can both be defined in a column called "Pokéball" where the name of the ball is written, or in a series of columns each named with the name of a Pokéball (See the difference between the TEMPLATE and EXAMPLE worksheets in the template sheet (the Pokéball columns are hidden to the far right in the EXAMPLE sheet)).

Most columns can be deleted. Even a sheet as simple as [this](https://docs.google.com/spreadsheets/d/1Co8N7zAWXhPnKHTUOdPbLunalSDoGyDVoftpvV0IxDY/edit?usp=sharing) will work: [See?](https://armienn.github.io/pokemon/?1Co8N7zAWXhPnKHTUOdPbLunalSDoGyDVoftpvV0IxDY#1)

Worksheets named "db" or whose name contains "template", "item", "config", "resource" or "database" won't be shown, and sheets whose name start with "lf" or "looking for" will appear on their own in the list of tabs and the Pokémon in them won't be added to the list of all your Pokémon.

## How to Use with a Javascript Script and other text resources

1. Have a online text file with Pokémon in it in some format
2. Make sure it is loadable from other sites
3. Add the url (without the protocol, i.e. "http://") and the format onto the end of this: `https://armienn.github.io/pokemon/?format:url`

Example (json): [`https://armienn.github.io/pokemon/?json:gist.githubusercontent.com/Armienn/dbcc734e78c27eee1c6590f1cd11fd17/raw/e30d8b5a6330d5affbcb3512cd2399ed5603aaee/test-json-pokemons.json`](https://armienn.github.io/pokemon/?script:gist.githubusercontent.com/Armienn/dbcc734e78c27eee1c6590f1cd11fd17/raw/e30d8b5a6330d5affbcb3512cd2399ed5603aaee/test-json-pokemons.json)

Example (javascript): [`https://armienn.github.io/pokemon/?script:gist.githubusercontent.com/Armienn/27b4759d86c33542656f255efd1e50af/raw/3ad081a42ab88216d8d237adb4c91e36ca0b9d6d/test-pokemons.js`](https://armienn.github.io/pokemon/?script:gist.githubusercontent.com/Armienn/27b4759d86c33542656f255efd1e50af/raw/3ad081a42ab88216d8d237adb4c91e36ca0b9d6d/test-pokemons.js)

The latter example will load [this javascript file](https://gist.githubusercontent.com/Armienn/27b4759d86c33542656f255efd1e50af/raw/3ad081a42ab88216d8d237adb4c91e36ca0b9d6d/test-pokemons.js) and run it to get the collection of Pokémon to show. Loading scripts like this opens up a lot of possibilities, so I look forward to seeing what people do with it.

## Import and Export

Currently the following formats can be imported from or exported to:

* Script: import, and kinda export
* JSON: import and export
* CSV: import and export
* TSV: import and export
* Reddit Markdown Table (the kind used on r/pokemontrades): import and export
* Smogon: import

Import and export can be done through the options menu. In addition, as mentioned in the previous section, you can also import via url.

## Settings

By having settings in your spreadsheet as seen in the template spreadsheet, it is possible enable the auto breedables list, and to choose the colour scheme to use (either Night, Day or Custom).

## Other notes

For developers interested in the code: I cleaned up the code at one point, but then I started spitting out features again. It's so so. However, here are some parts that might be of interest:

* `stuff.data` contains information about pokemons, moves, types, eggGroups etc.
* `new Pokemon(args)` will create a new Pokémon object. `args` can be the name of a Pokémon, or an object containing at least `name` or `id` and optionally `form`.
* `stuff.collection` houses `pokemons`, `lookingFor` and `local`. These are all lists of tabs (`{title:string, id:string, pokemons:Pokemon[]}`). The first two are filled when loading from a spreadsheet, and the last one contain the Pokémons which are stored using the Web Storage API. Add tabs with `AddTab()`, `AddLookingForTab()` and `AddLocalTab()`, and save the current state of the local tabs with `SaveLocalTabs()`
* `stuff.optionsSection` has `importMethods` and `exportMethods`
* `stuff.headerSection` has `filters` and `sorts`
* `stuff.listSection` has `basePokemonColumns` and `tabPokemonColumns`, which are used to set up the main list of Pokémon
* `stuff.settings` has `colorSchemes`

This project also provides various Pokémon data in json format, found in data-sumo/pokemons.json, data-sumo/moves.json, data-sumo/abilities.json, data-sumo/natures.json, data-sumo/types.json and data-sumo/egg-groups.json. There's no guarantee about correctness or updatedness, and no documentation, but it's there for those who want it.

Thanks to [richi3f](https://github.com/richi3f) for the inspiration for this site, and for the initial template spreadsheet.

Pokémon &copy; Nintendo / Game Freak, 1995-2017.
