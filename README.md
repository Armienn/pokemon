# Pokémon Stuff

A site for browsing Pokémon (either all Pokémon, Pokémon stored in Google Sheets, or Pokémon loaded via custom javascript) featuring easy-to-use advanced filtering and searching

## Features

* Browse the list of all Pokémon and find just the Pokémon you want using a plethora of filters
* Make your own custom filter or sorting function if you know javascript
* Or even define a collection of Pokémon with your own custom javascript function
* Browse all your Pokémon, or just those in specific tabs
* Simple display of how complete your collection is
* Automatically calculates breedables based on your Pokémon (although this feature is in need of some love still)
* Faster loading than sharing a Google Sheets document
* Generate a Reddit Markdown table to share your current selection of Pokémon
* Link to [a](https://armienn.github.io/pokemon/#Magearna) [specific](https://armienn.github.io/pokemon/#123) [Pokémon](https://armienn.github.io/pokemon/#nidoran-m)

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

## How to Use with a Javascript Script

As a new feature it is now possible to load javascript from somewhere else on the web and set up a collection by running that. 

To do so, just add the url (without the protocol) onto the end of this: `https://armienn.github.io/pokemon/?script:script-url`

Example: [`https://armienn.github.io/pokemon/?script:gist.githubusercontent.com/Armienn/27b4759d86c33542656f255efd1e50af/raw/3ad081a42ab88216d8d237adb4c91e36ca0b9d6d/test-pokemons.js`](https://armienn.github.io/pokemon/?script:gist.githubusercontent.com/Armienn/27b4759d86c33542656f255efd1e50af/raw/3ad081a42ab88216d8d237adb4c91e36ca0b9d6d/test-pokemons.js)

This will load [this javascript](https://gist.githubusercontent.com/Armienn/27b4759d86c33542656f255efd1e50af/raw/3ad081a42ab88216d8d237adb4c91e36ca0b9d6d/test-pokemons.js) and run it to get the collection of Pokémon to show. This opens up a lot of new possibilities, so I look forward to seeing what people do with it.

## Settings

By having settings in your spreadsheet as seen in the template spreadsheet, it is possible enable the auto breedables list, and to choose the colour scheme to use (either Night, Day or Custom).

## Other notes

For developers interested in the code: Be warned, it's somewhat of a mess. I would clean it up, but I've already used a lot more time on this project than I should have, so that won't happen for the next few months. That said, if you venture in there anyway and make improvements or additions, I'm open to reasonable pull requests.

This project also provides various Pokémon data in json format, found in static/pokemons.json, static/moves.json, static/abilities.json, static/natures.json and static/types.json. There's no guarantee about correctness or updatedness, and no documentation, but it's there for those who want it.

Thanks to [richi3f](https://github.com/richi3f) for the inspiration for this site, and for the initial template spreadsheet.

Pokémon &copy; Nintendo / Game Freak, 1995-2017.
