import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { readFileSync } from "fs";

// Remember to rename these classes and interfaces!

interface Style {
	name: string;
	css: string;
}

interface ImageStyleSettings {
	borderRadius: string;
	styles: Style[];
}

const DEFAULT_SETTINGS: ImageStyleSettings = {
	borderRadius: 'sm',
	styles: [
		{ "name": "rounded-none", "css": "image-style-rounded-none" },
		{ "name": "rounded-xs", "css": "image-style-rounded-xs" },
		{ "name": "rounded-sm", "css": "image-style-rounded-sm" },
		{ "name": "rounded-md", "css": "image-style-rounded-md" },
		{ "name": "rounded-lg", "css": "image-style-rounded-lg" },
		{ "name": "rounded-xl", "css": "image-style-rounded-xl" },
		{ "name": "rounded-2xl", "css": "image-style-rounded-2xl" },
		{ "name": "rounded-3xl", "css": "image-style-rounded-3xl" },
		{ "name": "rounded-4xl", "css": "image-style-rounded-4xl" },
	]
}

export default class ImageStyle extends Plugin {
	settings: ImageStyleSettings;

	async onload() {
		await this.loadSettings();

		// const onUpdate = () => {
		// 	const file = this.app.workspace.getActiveFile()
		// 	if (file) {
		// 		const imagesDivs = this.app.workspace.containerEl.getElementsByClassName("image-embed")
		// 		console.log(imagesDivs)
		// 		Array.from(imagesDivs).forEach((imageContainerDiv: any) => {
		// 			const img = imageContainerDiv.children[0]
		// 			if (img.tagName === "IMG") {
		// 				const imageBorderRadiusClassName = "image-style-rounded-" + this.settings.borderRadius
		// 				img.classList.add(imageBorderRadiusClassName)
		// 			}
		// 		})
		// 	}
		// }

		// this.app.workspace.on("editor-change", onUpdate)

		// this.app.workspace.onLayoutReady(() => {
		// 	const file = this.app.workspace.getActiveFile()
		// 	if (file) {
		// 		const imagesDivs = this.app.workspace.containerEl.getElementsByClassName("image-embed")
		// 		console.log(imagesDivs)
		// 		Array.from(imagesDivs).forEach((imageContainerDiv: any) => {
		// 			const img = imageContainerDiv.children[0]
		// 			if (img.tagName === "IMG") {
		// 				const imageBorderRadiusClassName = "image-style-rounded-" + this.settings.borderRadius
		// 				img.classList.add(imageBorderRadiusClassName)
		// 			}
		// 		})
		// 	}
		// })

		const file = this.app.workspace.getActiveFile()
		if (file) {
			// const wimages = this.app.workspace.containerEl.getElementsByTagName("img")
			// console.log(wimages)
			const images = this.app.workspace.containerEl.getElementsByClassName("image-embed")
			console.log(images)
			Array.from(images).forEach((imageContainerDiv: any) => {
				const img = imageContainerDiv.children[0]
				if (img.tagName === "IMG") {
					const imageBorderRadiusClassName = "image-style-rounded-" + this.settings.borderRadius
					img.classList.add(imageBorderRadiusClassName)
				}
			})
		}
		
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						console.log(checking);
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ImageStyleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class ImageStyleSettingTab extends PluginSettingTab {
	plugin: ImageStyle;

	constructor(app: App, plugin: ImageStyle) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const APP_TITLE = this.plugin.manifest.name + " " + this.plugin.manifest.version

		containerEl.createEl("h1", { text: APP_TITLE })

		new Setting(containerEl)
			.setName("Rounded Borders")
			.setDesc("Select the border radius of images.")
			.addDropdown((text) =>
				text
					.addOption("none", "No border")
					.addOption("xs", "Extra Small")
					.addOption("sm", "Small")
					.addOption("md", "Medium")
					.addOption("lg", "Large")
					.addOption("xl", "Extra Large")
					.addOption("2xl", "2XL")
					.addOption("3xl", "3XL")
					.addOption("4xl", "4XL")
					.setValue(this.plugin.settings.borderRadius)
					.onChange(async (value) => {
						this.plugin.settings.borderRadius = value
						await this.plugin.saveSettings()
					})
			)
	}
}
