import { App, MarkdownPostProcessorContext, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { EditorView, PluginValue, ViewPlugin, ViewUpdate } from "@codemirror/view";


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
	view: EditorView;
	viewUpdate: ViewUpdate;
	plugin: ImageStyle;

	constructor(view: EditorView, plugin: ImageStyle) {
		this.view = view;
		this.plugin = plugin;
		// console.log("ApplyImageBorder initialized with plugin settings:", this.plugin.settings);
	}

	update(update: ViewUpdate) {
		this.viewUpdate = update

		const images = update.view.dom.getElementsByTagName("img")
		Array.from(images).forEach((img: any) => {
			this.applyBorder(img)
		})
	}

	applyBorder(img: HTMLImageElement) {
		const imageBorderRadiusClassName = "image-style-rounded-" + this.plugin.settings.borderRadius;
		img.classList.add(imageBorderRadiusClassName);
	}

	destroy() {
		// Cleanup logic if needed
	}
}

export default class ImageStyle extends Plugin {
	settings: ImageStyleSettings;
	observers: MutationObserver[] = [];

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((el, ctx) => {
			this.processImages(el, ctx);
		});

		this.registerEditorExtension(
			ViewPlugin.define((view) => new ApplyImageBorder(view, this))
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ImageStyleSettingTab(this.app, this));
	}

	onunload() {
		this.observers.forEach(observer => observer.disconnect());
		this.observers = [];
	}

	processImages(el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		// console.log("processImages", el);
		const images = el.getElementsByTagName("img");
		// console.log("processImages.images", images);
		Array.from(images).forEach((img: HTMLImageElement) => {
			this.applyBorder(img);
		});

		const observer = new MutationObserver((mutationsList, observer) => {
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
					mutation.addedNodes.forEach(node => {
						if (node instanceof HTMLImageElement) {
							this.applyBorder(node);
						} else if (node instanceof Element) {
							const images = node.querySelectorAll('img');
							images.forEach(this.applyBorder);
						}
					});
				}
			}
		});

		observer.observe(el, { childList: true, subtree: true });
		this.observers.push(observer); // Keep track of observers

		// Return an object with an unload function for cleanup
		return {
			unload: () => {
				observer.disconnect();
				this.observers = this.observers.filter(obs => obs !== observer);
				// console.log('MutationObserver disconnected for:', el); // Optional logging
			},
		};
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

		new Setting(containerEl)
			.setName("Rounded borders")
			.setDesc("Select the border radius of images.")
			.addDropdown((text) =>
				text
					.addOption("none", "No border")
					.addOption("xs", "Extra small")
					.addOption("sm", "Small")
					.addOption("md", "Medium")
					.addOption("lg", "Large")
					.addOption("xl", "Extra large")
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
