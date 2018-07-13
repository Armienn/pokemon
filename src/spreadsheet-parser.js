import { CollectionGroup } from "./local-collection.js"
import { objectsFromTable } from "../../archive/search/porting.js"
import { Pokemon } from "./pokemon-data.js"
import { requestJSON } from "./main.js"
import { pokemonFromUnsanitised } from "./porting.js";

export function loadSheetsFrom(spreadsheet) {
	stuff.collectorInfo.spreadsheetId = spreadsheet.id
	stuff.collectorInfo.Name = "Unknown"
	stuff.collectionGroups.push(new CollectionGroup("Unknown"))
	for (var i in spreadsheet.spreadsheet.feed.entry) {
		var entry = spreadsheet.spreadsheet.feed.entry[i]
		var title = getValue(entry.title).trim()
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
				requestJSON(getWorksheetUrl(spreadsheet.id, 1), (r) => { parseConfig(r) })
			}
			continue
		}
		addNewTab(title, i)
	}
	updateExternalInventoryLoadedness()
	return true
}

function getWorksheetUrl(spreadsheetId, worksheetId) {
	return "https://spreadsheets.google.com/feeds/list/" + spreadsheetId + "/" + worksheetId + "/public/values?alt=json"
}

export function getSpreadsheetUrl(spreadsheetId) {
	return "https://spreadsheets.google.com/feeds/worksheets/" + spreadsheetId + "/public/basic?alt=json"
}

function getValue(field) {
	if (field) return field.$t
	return undefined
}

function tryValues(values, entry) {
	for (var i in values)
		if (entry["gsx$" + values[i]] && entry["gsx$" + values[i]].$t)
			return entry["gsx$" + values[i]].$t.trim()
	return undefined
}

function addNewTab(title, index) {
	const titleParts = title.split(":")
	let group = stuff.collectionGroups[0]
	if (titleParts.length > 1)
		group = groupFor(titleParts[0])
	const tab = group.addTab(titleParts[1] || titleParts[0], [])
	stuff.state.externalInventory.tabsLoaded[index] = false
	requestJSON(getWorksheetUrl(stuff.collectorInfo.spreadsheetId, (+index) + 1), parseSheet(tab, index))
}

function groupFor(title) {
	let group = stuff.collectionGroups.find(e => title === e.title)
	if (!group)
		stuff.collectionGroups.push(group = new CollectionGroup(title))
	return group
}

function parseSheet(tab, index) {
	return (response) => {
		var table = tablify(response.feed.entry)
		tab.pokemons = objectsFromTable(table).map(e => pokemonFromUnsanitised(e))
		stuff.state.externalInventory.tabsLoaded[index] = true
		updateExternalInventoryLoadedness()
		stuff.tryLoadAgain()
	}
}

function tablify(entries) {
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

function updateExternalInventoryLoadedness() {
	if (stuff.state.externalInventory.tabsLoaded)
		for (var i in stuff.state.externalInventory.tabsLoaded)
			if (!stuff.state.externalInventory.tabsLoaded[i])
				return
	stuff.state.externalInventory.isLoaded = true
}

function parseConfig(response) {
	var entry = response.feed.entry[0]
	stuff.collectorInfo.Name = tryValues(["ingamename"], entry) || "Unknown"
	stuff.collectionGroups[0].title = stuff.collectorInfo.Name
	stuff.collectorInfo.FriendCode = tryValues(["friendcode"], entry)
	stuff.collectorInfo.Url = tryValues(["contacturl"], entry)
	var showBreedables = tryValues(["showbreedables"], entry)
	stuff.collectorInfo.showBreedables = !!showBreedables && showBreedables.toLowerCase().trim() !== "no" && showBreedables.toLowerCase().trim() !== "false"
	/*var colorScheme = tryValues(["colorscheme"], entry)
	if (colorScheme)
		colorScheme = colorScheme.toLowerCase()
	if (colorScheme == "custom") {
		stuff.collectorInfo.colorScheme = colorScheme
		stuff.headerSection.navGroups.colours.custom = {
			text: "●",
			click: () => { stuff.settings.colorScheme = "custom"; stuff.updateColors() },
			active: () => stuff.settings.colorScheme == "custom",
			style: { fontSize: "1.2rem" }
		}
	}
	if ((colorScheme == "night" || colorScheme == "day") && !(localStorage && localStorage.colorScheme))
		stuff.collectorInfo.colorScheme = colorScheme
	stuff.collectorInfo.colorSchemes.custom[0] = tryValues(["custombackgroundcolor", "backgroundcolor"], entry)
	stuff.collectorInfo.colorSchemes.custom[1] = tryValues(["customtextcolor", "textcolor"], entry)
	stuff.collectorInfo.colorSchemes.custom[2] = tryValues(["customheadercolor", "headercolor"], entry)
	*/
	stuff.state.externalInventory.tabsLoaded["config"] = true
	updateExternalInventoryLoadedness()
	stuff.tryLoadAgain()
}

