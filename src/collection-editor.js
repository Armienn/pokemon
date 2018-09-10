import { Component, update, l } from "../../archive/arf/arf.js"
import iconButton, { acceptIcon, crossIcon, deleteIcon } from "../../archive/search/icons.js"

export class CollectionEditor extends Component {
	constructor(title, onSave, onCancel, onDelete) {
		super()
		this.title = title
		this.onSave = onSave
		this.onCancel = onCancel
		this.onDelete = onDelete
	}

	renderThis() {
		return l("div",
			l("div",
				l("span", { style: { color: "#888", height: "2rem", lineHeight: "2rem" } }, "Title |"),
				l("input", {
					placeholder: "Collection title",
					oninput: (event) => {
						this.title = event.target.value
						update()
					},
					value: this.title
				})
			),
			l("div",
				iconButton(acceptIcon({ filter: "invert(1)" }), () => this.onSave(this.title)),
				iconButton(crossIcon({ filter: "invert(1)" }), this.onCancel),
				iconButton(deleteIcon({ filter: "invert(1)" }), this.onDelete)
			)
		)
	}

	static styleThis() {
		return {
			"input, button": {
				margin: "0.25rem"
			},
			".close-button": {
				opacity: "0.5",
				transition: "0.3s ease"
			},
			".close-button:hover": {
				opacity: "1",
				transition: "0.3s ease"
			}
		}
	}
}
