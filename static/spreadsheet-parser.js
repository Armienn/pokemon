"use strict";

class SpreadsheetParser {
	parse(spreadsheet) {
		stuff.collection.spreadsheetId = spreadsheet.id
		stuff.collection.collectorName = "Unknown"
		for (var i in spreadsheet.spreadsheet.feed.entry) {
			var entry = spreadsheet.spreadsheet.feed.entry[i]
			var title = this.getValue(entry.title).trim()
			if (title.toLowerCase().indexOf("[hide]") > -1 ||
				title.toLowerCase().indexOf("item") > -1 ||
				title.toLowerCase().indexOf("template") > -1 ||
				title.toLowerCase().indexOf("config") > -1 ||
				title.toLowerCase().indexOf("database") > -1 ||
				title.toLowerCase().indexOf("resource") > -1 ||
				title.toLowerCase() == "db"
			) {
				if (i == "0") {
					stuff.state.externalInventory.tabsLoaded["config"] = false
					requestJSON(this.getWorksheetUrl(spreadsheet.id, 1), (r) => { this.parseConfig(r) })
				}
				continue
			}
			this.addNewTab(title, i)
		}
		this.updateExternalInventoryLoadedness()
	}

	getWorksheetUrl(spreadsheetId, worksheetId) {
		return "https://spreadsheets.google.com/feeds/list/" + spreadsheetId + "/" + worksheetId + "/public/values?alt=json"
	}

	getSpreadsheetUrl(spreadsheetId) {
		return "https://spreadsheets.google.com/feeds/worksheets/" + spreadsheetId + "/public/basic?alt=json"
	}

	getValue(field) {
		if (field) return field.$t
		return undefined
	}

	tryValues(values, entry) {
		for (var i in values)
			if (entry["gsx$" + values[i]] && entry["gsx$" + values[i]].$t)
				return entry["gsx$" + values[i]].$t.trim()
		return undefined
	}

	addNewTab(title, index) {
		var tab
		if (title.toLowerCase().startsWith("lf") || title.toLowerCase().startsWith("looking for"))
			tab = stuff.collection.addLookingForTab(title, [], (+index) + 1)
		else
			tab = stuff.collection.addTab(title, [], (+index) + 1)
		stuff.state.externalInventory.tabsLoaded[tab.id] = false
		requestJSON(this.getWorksheetUrl(stuff.collection.spreadsheetId, tab.id), this.parseSheet(tab))
	}

	parseSheet(tab) {
		return (response) => {
			var table = this.tablify(response.feed.entry)
			tab.pokemons = Porting.parseTable(table)
			stuff.state.externalInventory.tabsLoaded[tab.id] = true
			this.updateExternalInventoryLoadedness()
			stuff.tryLoad()
		}
	}

	tablify(entries) {
		var headers = {}
		var table = [[]]
		for (var i in entries) {
			var entry = entries[i]
			var newEntry = []
			var keys = Object.keys(entry)
			for (var j in keys) {
				var key = keys[j].substr(4)
				if (!(0 < headers[key]))
					headers[key] = Object.keys(headers).length
				newEntry[headers[key]] = entry[keys[j]].$t
			}
			table.push(newEntry)
		}
		for (var i in headers)
			table[0][headers[i]] = i
		return table
	}

	updateExternalInventoryLoadedness() {
		if (stuff.state.externalInventory.tabsLoaded)
			for (var i in stuff.state.externalInventory.tabsLoaded)
				if (!stuff.state.externalInventory.tabsLoaded[i])
					return
		stuff.state.externalInventory.isLoaded = true
	}

	parseConfig(response) {
		var entry = response.feed.entry[0]
		stuff.collection.collectorName = this.tryValues(["ingamename"], entry)
		stuff.collection.collectorFriendCode = this.tryValues(["friendcode"], entry)
		stuff.collection.collectorUrl = this.tryValues(["contacturl"], entry)
		var showBreedables = this.tryValues(["showbreedables"], entry)
		stuff.settings.showBreedables = !!showBreedables && showBreedables.toLowerCase().trim() !== "no" && showBreedables.toLowerCase().trim() !== "false"
		var colorScheme = this.tryValues(["colorscheme"], entry)
		if (colorScheme)
			colorScheme = colorScheme.toLowerCase()
		if (colorScheme == "custom") {
			stuff.settings.colorScheme = colorScheme
			stuff.headerSection.navGroups.colours.custom = {
				text: "●",
				click: () => { stuff.settings.colorScheme = "custom"; stuff.updateColors() },
				active: () => stuff.settings.colorScheme == "custom",
				style: { fontSize: "1.2rem" }
			}
		}
		if ((colorScheme == "night" || colorScheme == "day") && !(localStorage && localStorage.colorScheme))
			stuff.settings.colorScheme = colorScheme
		stuff.settings.colorSchemes.custom[0] = this.tryValues(["custombackgroundcolor", "backgroundcolor"], entry)
		stuff.settings.colorSchemes.custom[1] = this.tryValues(["customtextcolor", "textcolor"], entry)
		stuff.settings.colorSchemes.custom[2] = this.tryValues(["customheadercolor", "headercolor"], entry)
		stuff.state.externalInventory.tabsLoaded["config"] = true
		this.updateExternalInventoryLoadedness()
		stuff.tryLoad()
	}
}
