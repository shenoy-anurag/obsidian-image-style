import { App, MarkdownView, MarkdownPostProcessorContext, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";

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

export class ApplyImageBorder implements PluginValue {
	viewUpdate: ViewUpdate

	update(update: ViewUpdate) {
		this.viewUpdate = update

		const images = update.view.dom.getElementsByTagName("img")
		Array.from(images).forEach((img: any) => {
			this.applyBorder(img)
		})
	}

	applyBorder(img: HTMLImageElement) {
		const imageBorderRadiusClassName = "image-style-rounded-md"
		img.classList.add(imageBorderRadiusClassName);
	}
}

export default class ImageStyle extends Plugin {
	settings: ImageStyleSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((el, ctx) => {
			this.processImages(el, ctx);
		});

		this.registerEditorExtension([
			ViewPlugin.fromClass(ApplyImageBorder),
		]);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ImageStyleSettingTab(this.app, this));
	}

	onunload() {

	}

	processImages(el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		console.log("processImages", el);

		// Handle regular <img> tags
		const images = el.getElementsByTagName("img");
		console.log("processImages.images", images);
		Array.from(images).forEach((img: HTMLImageElement) => {
			console.log("processImages.images.src", img.src);
			this.applyBorder(img);
		});

		// Handle local images inside "image-embed" containers
		const imageEmbeds = el.getElementsByClassName("image-embed");
		// const imageEmbeds = el.querySelectorAll("img");
		console.log("processImages.imageEmbeds", imageEmbeds);
		Array.from(imageEmbeds).forEach((imageContainerDiv: HTMLElement) => {
			const img = imageContainerDiv.children[0] as HTMLImageElement;
			// const img = imageContainerDiv.querySelector("img");
			if (img) {
				this.applyBorder(img);
			}
		});
	}

	applyBorder(img: HTMLImageElement) {
		const imageBorderRadiusClassName = "image-style-rounded-" + this.settings.borderRadius
		img.classList.add(imageBorderRadiusClassName);
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
